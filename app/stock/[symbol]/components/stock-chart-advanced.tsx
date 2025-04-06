'use client';

import { useEffect, useRef } from 'react';

import {
	createChart,
	CandlestickSeries,
	ColorType,
	HistogramSeries,
} from 'lightweight-charts';

interface StockChartAdvancedProps {
	className?: string;
}

const StockChartAdvanced = ({ className }: StockChartAdvancedProps) => {
	const chartContainerRef = useRef<HTMLDivElement>(null);

	// 获取当前主题
	const useThemeColors = () => {
		// 可以根据实际情况添加逻辑，检测当前是深色还是浅色模式
		// 例如通过检查HTML元素上的class或data属性
		const isDarkMode =
			typeof window !== 'undefined' &&
			document.documentElement.classList.contains('dark');

		return {
			textColor: isDarkMode ? 'var(--foreground)' : 'var(--foreground)',
			backgroundColor: 'transparent',
			upColor: isDarkMode ? '#26a69a' : '#26a69a', // 可以根据主题调整
			downColor: isDarkMode ? '#ef5350' : '#ef5350', // 可以根据主题调整
		};
	};

	useEffect(() => {
		if (chartContainerRef.current) {
			// 清除任何现有的图表
			chartContainerRef.current.innerHTML = '';

			// 获取主题颜色
			const themeColors = useThemeColors();

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

			// 模拟数据 - 包含K线和成交量数据
			const mockData = [
				{
					time: '2022-01-17',
					open: 10,
					high: 10.63,
					low: 9.49,
					close: 9.55,
					volume: 15479523,
				},
				{
					time: '2022-01-18',
					open: 9.55,
					high: 10.3,
					low: 9.42,
					close: 9.94,
					volume: 19103293,
				},
				{
					time: '2022-01-19',
					open: 9.94,
					high: 10.17,
					low: 9.92,
					close: 9.78,
					volume: 21737523,
				},
				{
					time: '2022-01-20',
					open: 9.78,
					high: 10.59,
					low: 9.18,
					close: 9.51,
					volume: 29328713,
				},
				{
					time: '2022-01-21',
					open: 9.51,
					high: 10.46,
					low: 9.1,
					close: 10.17,
					volume: 37435638,
				},
				{
					time: '2022-01-22',
					open: 10.17,
					high: 10.96,
					low: 10.16,
					close: 10.47,
					volume: 25269995,
				},
				{
					time: '2022-01-23',
					open: 10.47,
					high: 11.39,
					low: 10.4,
					close: 10.81,
					volume: 24973311,
				},
				{
					time: '2022-01-24',
					open: 10.81,
					high: 11.6,
					low: 10.3,
					close: 10.75,
					volume: 22103692,
				},
				{
					time: '2022-01-25',
					open: 10.75,
					high: 11.6,
					low: 10.49,
					close: 10.93,
					volume: 25231199,
				},
				{
					time: '2022-01-26',
					open: 10.93,
					high: 11.53,
					low: 10.76,
					close: 10.96,
					volume: 24214427,
				},
				{
					time: '2022-01-27',
					open: 10.96,
					high: 11.58,
					low: 10.21,
					close: 10.33,
					volume: 22533201,
				},
				{
					time: '2022-01-28',
					open: 10.33,
					high: 10.89,
					low: 10.05,
					close: 10.71,
					volume: 14734412,
				},
				{
					time: '2022-01-29',
					open: 10.71,
					high: 11.22,
					low: 10.52,
					close: 11.14,
					volume: 12733842,
				},
				{
					time: '2022-01-30',
					open: 11.14,
					high: 11.35,
					low: 10.75,
					close: 10.8,
					volume: 12371207,
				},
				{
					time: '2022-01-31',
					open: 10.8,
					high: 11.15,
					low: 10.76,
					close: 11.05,
					volume: 14891287,
				},
				{
					time: '2022-02-01',
					open: 11.05,
					high: 11.37,
					low: 10.92,
					close: 11.32,
					volume: 12482392,
				},
				{
					time: '2022-02-02',
					open: 11.32,
					high: 11.53,
					low: 11.05,
					close: 11.21,
					volume: 17365762,
				},
				{
					time: '2022-02-03',
					open: 11.21,
					high: 11.64,
					low: 11.13,
					close: 11.45,
					volume: 13236769,
				},
				{
					time: '2022-02-04',
					open: 11.45,
					high: 11.82,
					low: 11.33,
					close: 11.68,
					volume: 13047907,
				},
				{
					time: '2022-02-05',
					open: 11.68,
					high: 11.95,
					low: 11.42,
					close: 11.87,
					volume: 18288710,
				},
				{
					time: '2022-02-06',
					open: 11.87,
					high: 12.15,
					low: 11.74,
					close: 11.9,
					volume: 17147123,
				},
			];

			// 设置K线数据
			candlestickSeries.setData(mockData);

			// 处理成交量数据 - 根据价格涨跌设置颜色
			const volumeData = mockData.map((item) => {
				// 判断当天是上涨还是下跌
				const isUp = item.close >= item.open;

				return {
					time: item.time,
					value: item.volume,
					color: isUp ? themeColors.upColor : themeColors.downColor,
				};
			});

			// 设置成交量数据
			volumeSeries.setData(volumeData);

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
		}
	}, []);

	return (
		<div
			ref={chartContainerRef}
			className={`w-full h-[400px] ${className || ''}`}
		/>
	);
};

export default StockChartAdvanced;
