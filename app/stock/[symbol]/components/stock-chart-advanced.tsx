'use client';

import { useEffect, useMemo, useRef } from 'react';

import {
	createChart,
	CandlestickSeries,
	ColorType,
	HistogramSeries,
} from 'lightweight-charts';
import { useTheme } from 'next-themes';

import {
	ChartDataPoint,
	VolumeDataPoint,
	DEFAULT_UP_COLOR,
	DEFAULT_DOWN_COLOR,
} from '@/app/types/stock-page/chart-advanced';
import { useProfile } from '@/hooks/use-profile';

interface StockChartAdvancedProps {
	className?: string;
	candlestickData?: ChartDataPoint[];
	volumeData?: VolumeDataPoint[];
	height?: number; // 调整为仅接受数字高度
	fromDate?: string; // 新增：起始日期 'YYYY-MM-DD'
	toDate?: string; // 新增：结束日期 'YYYY-MM-DD'
	realtimeCandle?: ChartDataPoint; // 新增：实时蜡烛图数据
}

const StockChartAdvanced = ({
	className,
	candlestickData,
	volumeData,
	height = 400, // 默认高度为400px
	fromDate,
	toDate,
	realtimeCandle,
}: StockChartAdvancedProps) => {
	const chartContainerRef = useRef<HTMLDivElement>(null);
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

	useEffect(() => {
		// 如果没有数据或DOM元素不存在，则不渲染图表
		if (
			!candlestickData ||
			candlestickData.length === 0 ||
			!chartContainerRef.current
		) {
			return;
		}

		// 清除任何现有的图表
		chartContainerRef.current.innerHTML = '';

		// 创建图表选项
		const chartOptions = {
			layout: {
				textColor: themeColors.textColor,
				background: {
					type: ColorType.Solid,
					color: themeColors.backgroundColor,
				},
				attributionLogo: false, // 隐藏TradingView的logo
			},
			width: chartContainerRef.current.clientWidth,
			height: height, // 直接使用传入的高度值
			timeScale: {
				timeVisible: true,
				secondsVisible: false,
				rightOffset: 2, // 为实时数据留出空间
			},
			rightPriceScale: {
				visible: false, // 隐藏右侧价格轴
			},
			leftPriceScale: {
				visible: true, // 显示左侧价格轴
			},
			grid: {
				// 修改网格线设置
				vertLines: {
					visible: false,
				},
				horzLines: {
					visible: true, // 显示水平线
					color: isDarkMode
						? 'rgba(255, 255, 255, 0.05)'
						: 'rgba(0, 0, 0, 0.035)', // 设置水平线低透明度
				},
			},
			crosshair: {
				// 十字线配置
				mode: 0, // 0 = 普通, 1 = 吸附
				vertLine: {
					visible: true,
					labelVisible: true,
					style: 0, // 0 = 实线 1 = 虚线 2 = 更密集的虚线
				},
				horzLine: {
					visible: true,
					labelVisible: true,
					style: 0, // 0 = 实线 1 = 虚线 2 = 更密集的虚线
				},
			},
		};

		// 创建图表实例
		const chart = createChart(chartContainerRef.current, chartOptions);

		// 添加K线图系列
		const candlestickSeries = chart.addSeries(CandlestickSeries);

		// 应用K线样式选项 - 上涨K线为空心（只有边框）
		candlestickSeries.applyOptions({
			upColor: themeColors.upColor, // 将上涨蜡烛填充设为透明
			downColor: themeColors.downColor, // 下跌蜡烛保持实心红色
			borderVisible: true, // 显示边框
			borderUpColor: themeColors.upColor, // 上涨蜡烛边框为绿色
			borderDownColor: themeColors.downColor, // 下跌蜡烛边框为红色
			wickUpColor: themeColors.upColor, // 上涨蜡烛影线为绿色
			wickDownColor: themeColors.downColor, // 下跌蜡烛影线为红色
		});

		// 配置K线图的位置
		candlestickSeries.priceScale().applyOptions({
			scaleMargins: {
				top: 0.05, // 最高点距离顶部5%
				bottom: 0.2, // 最低点距离底部20%
			},
		});

		// 添加成交量图系列
		const volumeSeries = chart.addSeries(HistogramSeries, {
			color: themeColors.upColor,
			priceFormat: {
				type: 'volume',
			},
			priceScaleId: 'volume', // 使用独立的价格轴ID
			lastValueVisible: false, // 不显示最后一个值
		});

		// 配置成交量图的位置
		volumeSeries.priceScale().applyOptions({
			scaleMargins: {
				top: 0.85, // 最高点距离顶部85%
				bottom: 0, // 最低点在最底部
			},
		});

		// 关闭成交量区域的网格线
		volumeSeries.applyOptions({
			lastValueVisible: false, // 不显示最后一个值
			priceLineVisible: false, // 关闭成交量价格线
		});

		// 设置K线数据
		candlestickSeries.setData(candlestickData);

		// 处理成交量数据
		volumeSeries.setData(volumeData!);

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

		// 实时数据更新处理
		// 如果为同一天，数据会override最后一条数据
		if (realtimeCandle) {
			// 如果有实时数据，添加到现有数据中
			candlestickSeries.update(realtimeCandle);

			// 更新成交量数据
			if (realtimeCandle.volume) {
				const volumeColor =
					realtimeCandle.close >= realtimeCandle.open
						? themeColors.upColor
						: themeColors.downColor;

				volumeSeries.update({
					time: realtimeCandle.time,
					value: realtimeCandle.volume,
					color: volumeColor,
				});
			}

			// 自动滚动到最新数据
			chart.timeScale().scrollToRealTime();
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
		};
	}, [
		candlestickData,
		volumeData,
		themeColors,
		height,
		fromDate,
		toDate,
		realtimeCandle,
	]);

	return (
		<div
			ref={chartContainerRef}
			className={`w-full ${className || ''}`}
			style={{ height: `${height}px` }}
		/>
	);
};

export default StockChartAdvanced;
