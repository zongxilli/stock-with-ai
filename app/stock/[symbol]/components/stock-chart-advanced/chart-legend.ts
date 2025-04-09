import { ISeriesApi } from 'lightweight-charts';

import { ThemeColors } from './stock-chart-advanced';

/**
 * 创建图表图例元素
 * @param container 图表容器元素
 * @param themeColors 主题颜色配置
 * @param isDarkMode 是否为暗色模式
 * @returns 创建的图例元素
 */
export const createLegendElement = (
	container: HTMLDivElement,
	themeColors: ThemeColors,
	isDarkMode: boolean
): HTMLDivElement => {
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
	container.appendChild(legendElement);

	return legendElement;
};

/**
 * 格式化价格数字，保留2位小数
 * @param price 价格数值
 * @returns 格式化后的价格字符串
 */
export const formatPrice = (price: number): string => price.toFixed(2);

/**
 * 更新图例内容
 * @param legendElement 图例元素
 * @param candleData K线数据
 * @param baseTextColor 基本文本颜色
 * @param themeColors 主题颜色配置
 * @param candlestickData 完整的K线数据数组，用于查找前一天收盘价
 * @param smaData SMA数据点，用于在图例中显示SMA值
 */
export const updateLegendContent = (
	legendElement: HTMLDivElement,
	candleData: any,
	baseTextColor: string,
	themeColors: ThemeColors,
	candlestickData?: any[],
	smaData?: any
): void => {
	if (!candleData) {
		legendElement.style.display = 'none';
		return;
	}

	// 显示legend
	legendElement.style.display = 'block';

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
		changeColor = change >= 0 ? themeColors.upColor : themeColors.downColor;
		openColor =
			open > previousClose ? themeColors.upColor : themeColors.downColor;
		closeColor = changeColor;
		highColor =
			high > previousClose ? themeColors.upColor : themeColors.downColor;
		lowColor =
			low < previousClose ? themeColors.downColor : themeColors.upColor;
	} else {
		// 如果没有前一天的收盘价，使用当天开盘价和收盘价比较
		change = close - open;
		changePercent = (change / open) * 100;
		changeColor = change >= 0 ? themeColors.upColor : themeColors.downColor;
		openColor = open <= close ? themeColors.upColor : themeColors.downColor;
		highColor = themeColors.upColor;
		lowColor = themeColors.downColor;
		closeColor =
			close >= open ? themeColors.upColor : themeColors.downColor;
	}

	// 更新legend内容为一行显示OHLC
	let legendContent = `
    <span style="color:${baseTextColor}; margin-right:10px">${date}</span>
    <span style="color:${baseTextColor}">O</span><span style="margin-right:10px; color:${openColor}">${formatPrice(open)}</span>
    <span style="color:${baseTextColor}">H</span><span style="margin-right:10px; color:${highColor}">${formatPrice(high)}</span>
    <span style="color:${baseTextColor}">L</span><span style="margin-right:10px; color:${lowColor}">${formatPrice(low)}</span>
    <span style="color:${baseTextColor}">C</span><span style="margin-right:10px; color:${closeColor}">${formatPrice(close)}</span>
    <span style="color:${changeColor}">${change >= 0 ? '+' : ''}${formatPrice(change)} (${changePercent.toFixed(2)}%)</span>`;

	// 如果有SMA数据，添加到第二行
	if (smaData && 'value' in smaData) {
		const smaValue = smaData.value;
		legendContent += `<br/><span style="color:${baseTextColor}; margin-right:10px">SMA</span><span style="color:#8dabff">${formatPrice(smaValue)}</span>`;
	}

	// 设置legend内容
	legendElement.innerHTML = legendContent;
};

/**
 * 设置十字线移动事件处理
 * @param chart 图表实例
 * @param legendElement 图例元素
 * @param candlestickSeries K线图系列
 * @param themeColors 主题颜色配置
 * @param candlestickData 完整的K线数据数组
 * @param smaSeries SMA线系列，用于获取SMA数据
 */
export const subscribeCrosshairMove = (
	chart: any,
	legendElement: HTMLDivElement,
	candlestickSeries: ISeriesApi<'Candlestick'>,
	themeColors: ThemeColors,
	candlestickData?: any[],
	smaSeries?: ISeriesApi<'Line'>
): void => {
	chart.subscribeCrosshairMove((param: any) => {
		if (!param.time || !param.point) {
			// 如果没有时间点数据，隐藏legend
			legendElement.style.display = 'none';
			return;
		}

		// 获取当前K线数据
		const candleData = param.seriesData.get(candlestickSeries);

		// 获取SMA数据（如果有SMA系列）
		const smaData = smaSeries ? param.seriesData.get(smaSeries) : null;

		// 更新图例内容，包含SMA数据
		updateLegendContent(
			legendElement,
			candleData,
			themeColors.textColor,
			themeColors,
			candlestickData,
			smaData
		);
	});
};
