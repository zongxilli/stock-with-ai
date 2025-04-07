import { HistoricalDataPoint } from '../get-historical-data';

import {
	ChartData,
	ChartDataPoint,
	VolumeDataPoint,
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
): ChartData {
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
