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
} from '@/app/types/stock-page/chart-advanced';

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

	// 获取当前主题
	const themeColors = useMemo(() => {
		// 定义上涨和下跌的颜色（这些是交易图表的专业标准颜色）
		const upColorValue = '#26a69a'; // 上涨保持绿色
		const downColorValue = '#ef5350'; // 下跌保持红色

		return {
			// 深色模式下使用较亮的文字，浅色模式下使用较暗的文字
			textColor: isDarkMode
				? 'rgba(255, 255, 255, 0.9)'
				: 'rgba(0, 0, 0, 0.9)',
			backgroundColor: 'transparent',
			upColor: upColorValue,
			downColor: downColorValue,
		};
	}, [isDarkMode]);

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

		// 应用K线样式选项
		candlestickSeries.applyOptions({
			upColor: themeColors.upColor,
			downColor: themeColors.downColor,
			borderVisible: false,
			wickUpColor: themeColors.upColor,
			wickDownColor: themeColors.downColor,
		});

		// 配置K线图的位置（占据上部分区域）
		candlestickSeries.priceScale().applyOptions({
			scaleMargins: {
				top: 0.05, // 最高点距离顶部5%
				bottom: 0.2, // 最低点距离底部20%（增大了K线图的显示区域）
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

		// 配置成交量图的位置（占据下部分区域）
		volumeSeries.priceScale().applyOptions({
			scaleMargins: {
				top: 0.85, // 最高点距离顶部80%（减小了成交量图的显示区域）
				bottom: 0, // 最低点在最底部
			},
		});

		// 设置K线数据
		candlestickSeries.setData(candlestickData);

		// 处理成交量数据
		// 直接使用传入的成交量数据
		volumeSeries.setData(volumeData!);

		// 调整图表以适应所有数据
		chart.timeScale().fitContent();

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
