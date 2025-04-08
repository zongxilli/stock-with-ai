import { HistoricalDataPoint } from '../get-historical-data';
import { SplitAdjustedDataPoint } from '../indicators/splitadjusted';

import {
	ChartDataPoint,
	VolumeDataPoint,
	SmaDataPoint,
	DEFAULT_UP_COLOR,
	DEFAULT_DOWN_COLOR,
} from '@/app/types/stock-page/chart-advanced';

/**
 * 将API获取的历史数据格式化为图表组件需要的格式

 * 根据调整后收盘价计算调整比率，并对所有价格数据进行调整
 *
 * @param historicalData API获取的历史数据
 * @param upColor 上涨柱状图颜色
 * @param downColor 下跌柱状图颜色
 * @returns 格式化后的图表数据，包含K线和成交量数据
 */
export function formatHistoricalDataForChart(
	historicalData: HistoricalDataPoint[],
	upColor: string = DEFAULT_UP_COLOR, // 默认上涨颜色
	downColor: string = DEFAULT_DOWN_COLOR // 默认下跌颜色
): { candlestickData: ChartDataPoint[]; volumeData: VolumeDataPoint[] } {
	console.log(historicalData);

	// 确保数据按日期升序排列（从旧到新）
	const sortedData = [...historicalData].sort(
		(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
	);

	// 格式化K线数据
	const candlestickData: ChartDataPoint[] = sortedData.map((point) => {
		// 计算调整比率 = 调整后收盘价 / 收盘价
		const adjustmentRatio = point.adjusted_close / point.close;

		// 对所有价格应用相同的调整比率
		return {
			time: point.date,
			// 调整所有价格数据
			open: parseFloat((point.open * adjustmentRatio).toFixed(2)),
			high: parseFloat((point.high * adjustmentRatio).toFixed(2)),
			low: parseFloat((point.low * adjustmentRatio).toFixed(2)),
			close: parseFloat(point.adjusted_close.toFixed(2)), // 直接使用调整后收盘价
			volume: point.volume,
		};
	});

	// 格式化成交量数据并根据当天价格涨跌设置颜色
	const volumeData: VolumeDataPoint[] = sortedData.map((point) => {
		// 判断当天是上涨还是下跌
		const isUp = point.close >= point.open;

		return {
			time: point.date,
			value: point.volume,
			color: isUp ? upColor : downColor,
		};
	});

	return {
		candlestickData,
		volumeData,
	};
}

/**
 * 将拆分调整数据格式化为图表组件需要的格式
 *
 * 拆分调整数据的价格已经是调整后的价格，不需要再进行调整计算
 *
 * @param splitAdjustedData API获取的拆分调整数据
 * @param upColor 上涨柱状图颜色
 * @param downColor 下跌柱状图颜色
 * @returns 格式化后的图表数据，包含K线和成交量数据
 */
export function formatSplitAdjustedDataForChart(
	splitAdjustedData: SplitAdjustedDataPoint[],
	upColor: string = DEFAULT_UP_COLOR, // 默认上涨颜色
	downColor: string = DEFAULT_DOWN_COLOR // 默认下跌颜色
): { candlestickData: ChartDataPoint[]; volumeData: VolumeDataPoint[] } {
	// 确保数据按日期升序排列（从旧到新）
	// const sortedData = [...splitAdjustedData].sort(
	// 	(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
	// );

	// 格式化K线数据 - 直接使用已调整的价格
	const candlestickData: ChartDataPoint[] = splitAdjustedData.map((point) => {
		return {
			time: point.date,
			open: parseFloat(point.open.toFixed(2)),
			high: parseFloat(point.high.toFixed(2)),
			low: parseFloat(point.low.toFixed(2)),
			close: parseFloat(point.close.toFixed(2)),
			volume: point.volume,
		};
	});

	// 格式化成交量数据并根据当天价格涨跌设置颜色
	const volumeData: VolumeDataPoint[] = splitAdjustedData.map((point) => {
		// 判断当天是上涨还是下跌
		const isUp = point.close >= point.open;

		return {
			time: point.date,
			value: point.volume,
			color: isUp ? upColor : downColor,
		};
	});

	return {
		candlestickData,
		volumeData,
	};
}

/**
 * 将SMA数据格式化为图表组件需要的格式
 *
 * @param smaData API获取的SMA数据
 * @param candlestickData 对应的K线数据，用于确保日期对齐
 * @returns 格式化后的SMA数据点数组
 */
export function formatSmaDataForChart(
	smaData: { date: string; sma: number | null }[],
	candlestickData: ChartDataPoint[]
): SmaDataPoint[] {
	// 创建K线图日期集合，用于快速查找
	const candlestickDates = new Set(candlestickData.map(candle => candle.time));
	
	// 格式化SMA数据 - 只包含在K线数据中存在的日期
	const formattedSmaData: SmaDataPoint[] = smaData
		.filter(point => candlestickDates.has(point.date)) // 只保留K线图中存在的日期
		.map((point) => ({
			time: point.date,
			value: point.sma ? parseFloat(point.sma.toFixed(2)) : null,
		}));
	
	return formattedSmaData;
}
