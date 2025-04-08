'use client';

import { useEffect, useMemo, useRef } from 'react';

import {
	createChart,
	CandlestickSeries,
	ColorType,
	HistogramSeries,
	ISeriesApi,
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

		// 创建legend元素并添加到图表容器中
		const legendElement = document.createElement('div');
		legendElement.style.position = 'absolute';
		legendElement.style.left = '12px';
		legendElement.style.top = '12px';
		legendElement.style.zIndex = '1';
		legendElement.style.fontSize = '14px';
		legendElement.style.fontFamily = 'sans-serif';
		legendElement.style.fontWeight = '300';
		legendElement.style.color = themeColors.textColor;
		legendElement.style.padding = '8px 12px';
		legendElement.style.backgroundColor = isDarkMode
			? 'rgba(0, 0, 0, 0.6)'
			: 'rgba(255, 255, 255, 0.6)';
		legendElement.style.borderRadius = '4px';
		legendElement.style.backdropFilter = 'blur(4px)';
		legendElement.style.display = 'none'; // 默认隐藏，只在hover时显示
		legendElement.style.width = 'auto'; // 允许宽度自适应内容
		legendElement.style.whiteSpace = 'nowrap'; // 确保内容在一行
		chartContainerRef.current.appendChild(legendElement);

		// 订阅十字线移动事件，更新legend
		chart.subscribeCrosshairMove((param) => {
			if (!param.time || !param.point) {
				// 如果没有时间点数据，隐藏legend
				legendElement.style.display = 'none';
				return;
			}

			// 显示legend
			legendElement.style.display = 'block';

			// 获取当前K线数据
			const candleData = param.seriesData.get(
				candlestickSeries as ISeriesApi<'Candlestick'>
			);
			if (!candleData) {
				return;
			}

			// 安全地访问OHLC属性
			const date = 'time' in candleData ? candleData.time : 0;
			const open = 'open' in candleData ? candleData.open : 0;
			const high = 'high' in candleData ? candleData.high : 0;
			const low = 'low' in candleData ? candleData.low : 0;
			const close = 'close' in candleData ? candleData.close : 0;

			// 获取当前柱的索引（如果可能）
			let previousClose = null;
			if (candlestickData && 'time' in candleData && candleData.time) {
				const currentTime = candleData.time.toString();
				const currentIndex = candlestickData.findIndex(
					(item) => item.time === currentTime
				);

				if (currentIndex > 0) {
					previousClose = candlestickData[currentIndex - 1].close;
				}
			}

			let baseTextColor = themeColors.textColor;

			let openColor = themeColors.textColor;
			let closeColor = themeColors.textColor;
			let highColor = themeColors.textColor;
			let lowColor = themeColors.textColor;

			let changeColor = themeColors.textColor;
			let changePercent = 0;
			let change = 0;

			if (previousClose !== null) {
				// 计算涨跌幅（与前一天相比）
				change = close - previousClose;

				changePercent = (change / previousClose) * 100;
				changeColor =
					change >= 0 ? themeColors.upColor : themeColors.downColor;
				openColor =
					open > previousClose
						? themeColors.upColor
						: themeColors.downColor;
				closeColor = changeColor;
				highColor =
					high > previousClose
						? themeColors.upColor
						: themeColors.downColor;
				lowColor =
					low < previousClose
						? themeColors.downColor
						: themeColors.upColor;
			}

			// 格式化价格数字，保留2位小数
			const formatPrice = (price: number) => price.toFixed(2);

			// 更新legend内容为一行显示
			legendElement.innerHTML = `
				<span style="color:${baseTextColor}; margin-right:10px">${date}</span>
				<span style="color:${baseTextColor}">O</span><span style="margin-right:10px; color:${openColor}">${formatPrice(open)}</span>
				<span style="color:${baseTextColor}">H</span><span style="margin-right:10px; color:${highColor}">${formatPrice(high)}</span>
				<span style="color:${baseTextColor}">L</span><span style="margin-right:10px; color:${lowColor}">${formatPrice(low)}</span>
				<span style="color:${baseTextColor}">C</span><span style="margin-right:10px; color:${closeColor}">${formatPrice(close)}</span>
				<span style="color:${changeColor}">${change >= 0 ? '+' : ''}${formatPrice(change)} (${changePercent.toFixed(2)}%)</span>
			`;
		});

		// 添加K线图系列
		const candlestickSeries = chart.addSeries(CandlestickSeries);

		// 应用K线样式选项 - 上涨K线为空心（只有边框）
		candlestickSeries.applyOptions({
			upColor: 'rgba(0, 0, 0, 0)', // 将上涨蜡烛填充设为透明，实现空心效果
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
