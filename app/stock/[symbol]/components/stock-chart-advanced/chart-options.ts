import { ColorType } from 'lightweight-charts';

import { ThemeColors } from './stock-chart-advanced';

export const getChartOptions = (
	themeColors: ThemeColors,
	clientWidth: number,
	height: number,
	isDarkMode: boolean
) =>
	({
		layout: {
			textColor: themeColors.textColor,
			background: {
				type: ColorType.Solid,
				color: themeColors.backgroundColor,
			},
			attributionLogo: false, // 隐藏TradingView的logo
		},
		width: clientWidth,
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
	}) as const;
