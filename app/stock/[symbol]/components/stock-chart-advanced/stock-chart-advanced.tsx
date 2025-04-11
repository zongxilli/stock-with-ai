'use client';

import { useEffect, useMemo, useRef } from 'react';

import {
	createChart,
	CandlestickSeries,
	HistogramSeries,
	ISeriesApi,
	LineSeries,
	IChartApi,
} from 'lightweight-charts';
import { useTheme } from 'next-themes';

import { createLegendElement, subscribeCrosshairMove } from './chart-legend';
import { getChartOptions } from './chart-options';

import {
	ChartDataPoint,
	VolumeDataPoint,
	SmaDataPoint,
	DEFAULT_UP_COLOR,
	DEFAULT_DOWN_COLOR,
} from '@/app/types/stock-page/chart-advanced';
import { useProfile } from '@/hooks/use-profile';

export type ThemeColors = {
	textColor: string;
	backgroundColor: string;
	upColor: string;
	downColor: string;
};

interface StockChartAdvancedProps {
	className?: string;
	candlestickData?: ChartDataPoint[];
	volumeData?: VolumeDataPoint[];
	smaData?: SmaDataPoint[]; // 新增：SMA数据
	height?: number; // 调整为仅接受数字高度
	fromDate?: string; // 新增：起始日期 'YYYY-MM-DD'
	toDate?: string; // 新增：结束日期 'YYYY-MM-DD'
	realtimeCandle?: ChartDataPoint; // 新增：实时蜡烛图数据
}

const MAIN_CHART_SCALE_MARGIN = 0.05;
const MAIN_CHART_SCALE_MARGIN_BOTTOM = 0.2;
const MAIN_CHART_PRICE_SCALE_ID = 'left'; // 修改为使用左侧价格轴ID

const VOLUME_CHART_SCALE_MARGIN = 0.85;
const VOLUME_CHART_SCALE_MARGIN_BOTTOM = 0;
const VOLUME_CHART_PRICE_SCALE_ID = 'volume-price-scale';

const StockChartAdvanced = ({
	className,
	candlestickData,
	volumeData,
	smaData = [], // 添加SMA数据默认值
	height = 400, // 默认高度为400px
	fromDate,
	toDate,
	realtimeCandle,
}: StockChartAdvancedProps) => {
	const chartContainerRef = useRef<HTMLDivElement>(null);
	// 添加图表和系列的引用
	const chartRef = useRef<IChartApi | null>(null);
	const smaSeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
	// 新增：K线图和成交量图的引用
	const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
	const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
	// 跟踪上一次的SMA数据引用
	const lastSmaDataRef = useRef<SmaDataPoint[] | null>(null);
	const { theme } = useTheme();
	const isDarkMode = theme === 'dark';
	const { preference } = useProfile();

	// 获取当前主题
	const themeColors = useMemo(() => {
		// 定义上涨和下跌的颜色
		const upColorValue = preference?.chart.upColor || DEFAULT_UP_COLOR; // 上涨保持绿色
		const downColorValue =
			preference?.chart.downColor || DEFAULT_DOWN_COLOR; // 下跌保持红色

		return {
			textColor: isDarkMode
				? 'rgba(255, 255, 255, 0.9)'
				: 'rgba(0, 0, 0, 0.9)',
			backgroundColor: 'transparent',
			upColor: upColorValue,
			downColor: downColorValue,
		};
	}, [isDarkMode, preference?.chart.upColor, preference?.chart.downColor]);

	// 主要图表创建和K线/成交量数据设置
	useEffect(() => {
		// 如果没有数据或DOM元素不存在，则不渲染图表
		if (
			!candlestickData ||
			candlestickData.length === 0 ||
			!chartContainerRef.current
		) {
			return;
		}

		// 保存当前SMA数据的引用，以便重建后恢复
		const currentSmaData =
			smaData && smaData.length > 0 ? [...smaData] : null;

		// 清除任何现有的图表
		chartContainerRef.current.innerHTML = '';

		// 重置所有系列引用
		candlestickSeriesRef.current = null;
		volumeSeriesRef.current = null;
		smaSeriesRef.current = null;

		// 创建图表选项
		const chartOptions = getChartOptions(
			themeColors,
			chartContainerRef.current.clientWidth,
			height,
			isDarkMode
		);

		// 创建图表实例
		const chart = createChart(chartContainerRef.current, chartOptions);
		// 保存图表引用
		chartRef.current = chart;

		// 创建legend元素并添加到图表容器中
		const legendElement = createLegendElement(
			chartContainerRef.current,
			themeColors,
			isDarkMode
		);

		// // ------------------------------------------------- Area Series -------------------------------------------------
		// const areaSeries = chart.addSeries(AreaSeries, {
		// 	lastValueVisible: false, // hide the last value marker for this series
		// 	crosshairMarkerVisible: false, // hide the crosshair marker for this series
		// 	lineColor: 'transparent', // hide the line
		// 	topColor: 'rgba(56, 33, 110,0.6)',
		// 	bottomColor: 'rgba(56, 33, 110, 0.1)',
		// });

		// // 转换 K线数据为 AreaSeries 所需的格式 (使用收盘价作为 value)
		// const areaData = candlestickData.map((candle) => ({
		// 	time: candle.time,
		// 	value: (candle.open + candle.close) / 2,
		// }));

		// // 设置面积图数据
		// areaSeries.setData(areaData);
		// // ------------------------------------------------- Candlestick Series -------------------------------------------

		// 添加K线图系列
		const candlestickSeries = chart.addSeries(CandlestickSeries, {
			priceScaleId: MAIN_CHART_PRICE_SCALE_ID, // 使用左侧价格轴ID
			upColor: 'rgba(0, 0, 0, 0)', // 将上涨蜡烛填充设为透明，实现空心效果
			downColor: themeColors.downColor,
			borderVisible: true, // 显示边框
			wickUpColor: themeColors.upColor, // 上影线颜色
			wickDownColor: themeColors.downColor, // 下影线颜色
			borderUpColor: themeColors.upColor, // 上涨蜡烛边框为绿色
			borderDownColor: themeColors.downColor, // 下跌蜡烛边框为红色
			priceFormat: {
				type: 'price',
				precision: 2, // 价格精度，小数点后两位
				minMove: 0.01, // 最小价格变动
			},
			lastValueVisible: true, // 显示最后价格值
			priceLineVisible: true, // 显示价格线
		});

		// 设置十字线移动事件，更新legend
		// 先不调用subscribeCrosshairMove，等待SMA系列创建后再调用

		// 配置主价格轴
		chart.priceScale(MAIN_CHART_PRICE_SCALE_ID).applyOptions({
			scaleMargins: {
				top: MAIN_CHART_SCALE_MARGIN, // 最高点距离顶部5%
				bottom: MAIN_CHART_SCALE_MARGIN_BOTTOM, // 最低点距离底部20%
			},
			autoScale: true, // 自动缩放
			alignLabels: true, // 对齐标签
		});

		// 添加成交量图系列
		const volumeSeries = chart.addSeries(HistogramSeries, {
			color: themeColors.upColor,
			priceFormat: {
				type: 'volume',
			},
			priceScaleId: VOLUME_CHART_PRICE_SCALE_ID, // 使用独立的价格轴ID
			lastValueVisible: false, // 不显示最后一个值
		});

		// 配置成交量图的位置
		volumeSeries.priceScale().applyOptions({
			scaleMargins: {
				top: VOLUME_CHART_SCALE_MARGIN, // 最高点距离顶部85%
				bottom: VOLUME_CHART_SCALE_MARGIN_BOTTOM, // 最低点在最底部
			},
		});

		// 关闭成交量区域的网格线
		volumeSeries.applyOptions({
			lastValueVisible: false, // 不显示最后一个值
			priceLineVisible: false, // 关闭成交量价格线
		});

		// 设置K线数据
		candlestickSeries.setData(candlestickData);
		// 保存K线系列引用
		candlestickSeriesRef.current = candlestickSeries;

		// 处理成交量数据
		volumeSeries.setData(volumeData!);
		// 保存成交量系列引用
		volumeSeriesRef.current = volumeSeries;

		// 如果有SMA数据，立即添加SMA系列
		if (currentSmaData && currentSmaData.length > 0) {
			const smaSeries = chart.addSeries(LineSeries, {
				color: '#8dabff', // 蓝色的SMA线
				lineWidth: 1,
				priceScaleId: MAIN_CHART_PRICE_SCALE_ID, // 使用与K线图相同的价格轴ID
				lastValueVisible: false, // 不显示最后一个值的标签
				priceLineVisible: false, // 不显示最新价格的水平虚线
				crosshairMarkerVisible: false, // 显示十字线标记
				crosshairMarkerRadius: 4, // 十字线标记半径
			});

			// 设置SMA数据
			smaSeries.setData(currentSmaData);

			// 保存SMA系列引用
			smaSeriesRef.current = smaSeries;
			// 更新最后使用的SMA数据引用
			lastSmaDataRef.current = currentSmaData;

			// 现在SMA系列已创建，可以调用subscribeCrosshairMove
			subscribeCrosshairMove(
				chart,
				legendElement,
				candlestickSeries as ISeriesApi<'Candlestick'>,
				themeColors,
				candlestickData,
				smaSeries as ISeriesApi<'Line'> // 传递SMA系列给subscribeCrosshairMove
			);
		} else {
			// 如果没有SMA数据，仍然调用subscribeCrosshairMove，但不传递SMA系列
			subscribeCrosshairMove(
				chart,
				legendElement,
				candlestickSeries as ISeriesApi<'Candlestick'>,
				themeColors,
				candlestickData
			);
		}

		// 显示指定日期范围的数据，或默认显示最近90天
		if (candlestickData.length > 0) {
			// 获取最新的数据点
			const lastIndex = candlestickData.length - 1;
			const mostRecentDataPoint = candlestickData[lastIndex];

			// 使用提供的日期范围或计算默认范围
			let fromDateStr = fromDate;
			let toDateStr = toDate || mostRecentDataPoint.time;

			// 如果未提供起始日期，计算默认起始日期
			if (!fromDateStr) {
				const lastDateParts = mostRecentDataPoint.time
					.split('-')
					.map(Number);
				const lastDate = new Date(
					lastDateParts[0],
					lastDateParts[1] - 1,
					lastDateParts[2]
				);

				// 计算默认的回溯日期
				const ninetyDaysAgo = new Date(lastDate);
				let defaultGoBackDate = 90;
				if (preference?.chart.period === 'w') defaultGoBackDate *= 7;
				if (preference?.chart.period === 'm') defaultGoBackDate *= 30;

				ninetyDaysAgo.setDate(
					ninetyDaysAgo.getDate() - defaultGoBackDate
				);
				// 转换为YYYY-MM-DD格式的字符串
				fromDateStr = ninetyDaysAgo.toISOString().split('T')[0];
			}

			// 使用setVisibleRange设置可见范围
			chart.timeScale().setVisibleRange({
				from: fromDateStr,
				to: toDateStr,
			});
		} else {
			// 如果没有足够的数据，则显示所有可用数据
			chart.timeScale().fitContent();
		}

		// 处理窗口大小变化，使图表响应式
		const handleResize = () => {
			if (chartContainerRef.current) {
				chart.applyOptions({
					width: chartContainerRef.current.clientWidth,
				});
			}
		};

		window.addEventListener('resize', handleResize);

		// 清理函数
		return () => {
			window.removeEventListener('resize', handleResize);
			chart.remove();
			chartRef.current = null;
		};
	}, [
		candlestickData,
		volumeData,
		themeColors,
		height,
		fromDate,
		toDate,
		isDarkMode,
		preference?.chart.period,
		smaData,
	]);

	// 修改SMA数据处理的useEffect
	useEffect(() => {
		// 先检查图表引用是否存在
		if (!chartRef.current) {
			return;
		}

		// 现在我们确保了chartRef.current不为null，可以安全地在以下代码中使用它
		const chart = chartRef.current;

		// 如果SMA数据为空，则不处理
		if (!smaData || smaData.length === 0) {
			// 如果有SMA系列但新数据为空，则移除现有的SMA系列
			if (smaSeriesRef.current) {
				chart.removeSeries(smaSeriesRef.current);
				smaSeriesRef.current = null;
				lastSmaDataRef.current = null;
			}
			return;
		}

		// 检查数据是否已经更改
		const isDataChanged =
			JSON.stringify(smaData) !== JSON.stringify(lastSmaDataRef.current);

		// 如果已经存在SMA系列且数据已更改，则更新数据
		if (smaSeriesRef.current && isDataChanged) {
			smaSeriesRef.current.setData(smaData);
			lastSmaDataRef.current = [...smaData];
			return;
		}

		// 如果没有SMA系列但有图表和有效数据，则创建新的SMA系列
		if (!smaSeriesRef.current) {
			const smaSeries = chart.addSeries(LineSeries, {
				color: '#8dabff', // 蓝色的SMA线
				lineWidth: 1,
				priceScaleId: MAIN_CHART_PRICE_SCALE_ID, // 使用与K线图相同的价格轴ID
				lastValueVisible: false, // 不显示最后一个值的标签
				priceLineVisible: false, // 不显示最新价格的水平虚线
				crosshairMarkerVisible: false, // 显示十字线标记
				crosshairMarkerRadius: 4, // 十字线标记半径
			});

			// 设置SMA数据
			smaSeries.setData(smaData);

			// 保存SMA系列引用
			smaSeriesRef.current = smaSeries;
			// 更新最后使用的SMA数据引用
			lastSmaDataRef.current = [...smaData];

			// 当创建新的SMA系列时，重新设置subscribeCrosshairMove来包含SMA信息
			if (chartContainerRef.current && candlestickSeriesRef.current) {
				const legendElements =
					chartContainerRef.current.querySelectorAll('div');
				// 找到之前创建的legend元素
				let legendElement = null;
				for (let i = 0; i < legendElements.length; i++) {
					const el = legendElements[i];
					if (
						el.style &&
						el.style.position === 'absolute' &&
						el.style.zIndex === '1'
					) {
						legendElement = el;
						break;
					}
				}

				if (legendElement && chart) {
					// 更新subscribeCrosshairMove，包含SMA系列
					subscribeCrosshairMove(
						chart,
						legendElement as HTMLDivElement,
						candlestickSeriesRef.current,
						themeColors,
						candlestickData,
						smaSeries
					);
				}
			}
		}
	}, [smaData, themeColors, candlestickData]);

	// 新增：单独的useEffect用于处理实时蜡烛图数据更新
	useEffect(() => {
		// 如果没有实时数据或图表系列引用不存在，则直接返回
		if (
			!realtimeCandle ||
			!candlestickSeriesRef.current ||
			!volumeSeriesRef.current ||
			preference?.chart.period !== 'd'
		) {
			return;
		}

		// 更新K线图数据
		candlestickSeriesRef.current.update(realtimeCandle);

		// 更新成交量数据
		if (realtimeCandle.volume) {
			const volumeColor =
				realtimeCandle.close >= realtimeCandle.open
					? themeColors.upColor
					: themeColors.downColor;

			volumeSeriesRef.current.update({
				time: realtimeCandle.time,
				value: realtimeCandle.volume,
				color: volumeColor,
			});
		}

		// 移除自动滚动到最新数据的功能
		// if (chartRef.current) {
		//     chartRef.current.timeScale().scrollToRealTime();
		// }
	}, [preference?.chart.period, realtimeCandle, themeColors]);

	return (
		<div
			ref={chartContainerRef}
			className={`w-full ${className || ''}`}
			style={{ height: `${height}px` }}
		/>
	);
};

export default StockChartAdvanced;
