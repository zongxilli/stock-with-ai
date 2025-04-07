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
}

const StockChartAdvanced = ({
	className,
	candlestickData,
	volumeData,
}: StockChartAdvancedProps) => {
	const chartContainerRef = useRef<HTMLDivElement>(null);
	const { theme } = useTheme();
	const isDarkMode = theme === 'dark';
	const { preference } = useProfile();

	// 获取当前主题
	const themeColors = useMemo(() => {
		// 定义上涨和下跌的颜色
		const upColorValue = preference?.chart.upColor || DEFAULT_UP_COLOR; // 上涨保持绿色
		const downColorValue = preference?.chart.downColor || DEFAULT_DOWN_COLOR; // 下跌保持红色

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
			height: 400,
			timeScale: {
				timeVisible: true,
				secondsVisible: false,
			},
			grid: {
				// 移除所有网格线
				vertLines: {
					visible: false,
				},
				horzLines: {
					visible: false,
				},
			},
		};

		// 创建图表实例
		const chart = createChart(chartContainerRef.current, chartOptions);

		// 添加K线图系列
		const candlestickSeries = chart.addSeries(CandlestickSeries);

		// 应用K线样式选项 - 上涨K线为空心（只有边框）
		candlestickSeries.applyOptions({
			upColor: 'rgba(0, 0, 0, 0)', // 将上涨蜡烛填充设为透明
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
			priceScaleId: '', // 设置为覆盖图层
		});

		// 配置成交量图的位置
		volumeSeries.priceScale().applyOptions({
			scaleMargins: {
				top: 0.85, // 最高点距离顶部85%
				bottom: 0, // 最低点在最底部
			},
		});

		// 设置K线数据
		candlestickSeries.setData(candlestickData);

		// 处理成交量数据
		volumeSeries.setData(volumeData!);

		// 显示最近90天的数据
		if (candlestickData.length > 0) {
			// 获取最新的数据点
			const lastIndex = candlestickData.length - 1;
			const mostRecentDataPoint = candlestickData[lastIndex];

			// 从最新日期计算90天前的日期
			const lastDateParts = mostRecentDataPoint.time
				.split('-')
				.map(Number);
			const lastDate = new Date(
				lastDateParts[0],
				lastDateParts[1] - 1,
				lastDateParts[2]
			);

			// 计算90天前的日期
			const ninetyDaysAgo = new Date(lastDate);
			ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

			// 转换为YYYY-MM-DD格式的字符串
			const ninetyDaysAgoStr = ninetyDaysAgo.toISOString().split('T')[0];

			// 使用setVisibleRange设置可见范围
			chart.timeScale().setVisibleRange({
				from: ninetyDaysAgoStr,
				to: mostRecentDataPoint.time,
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
		};
	}, [candlestickData, volumeData, themeColors]);

	return (
		<div
			ref={chartContainerRef}
			className={`w-full h-[400px] ${className || ''}`}
		/>
	);
};

export default StockChartAdvanced;
