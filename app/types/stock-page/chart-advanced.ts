/**
 * 股票图表数据点接口
 * 用于轻量级图表库展示的数据格式
 */
export interface ChartDataPoint {
	time: string; // 日期字符串，格式 'YYYY-MM-DD'
	open: number; // 开盘价
	high: number; // 最高价
	low: number; // 最低价
	close: number; // 收盘价
	volume: number; // 成交量
}

/**
 * 成交量数据点接口
 * 用于轻量级图表库展示的成交量数据
 */
export interface VolumeDataPoint {
	time: string; // 日期字符串，格式 'YYYY-MM-DD'
	value: number; // 成交量
	color: string; // 颜色，取决于当天是上涨还是下跌
}

/**
 * 图表数据接口
 * 包含K线数据和成交量数据
 */
export interface ChartData {
	candlestickData: ChartDataPoint[]; // K线数据
	volumeData: VolumeDataPoint[]; // 成交量数据
}
