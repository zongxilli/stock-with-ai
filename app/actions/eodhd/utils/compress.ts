import {
	HistoricalDataPoint,
	HistoricalDataMinimal,
} from '../get-historical-data';
import { NewsDataPoint } from '../get-news-data';

/**
 * 压缩日期格式：从 "YYYY-MM-DD" 转换为 "YYMMDD"（6位数字）
 * @param dateStr 原始日期字符串，格式为 "YYYY-MM-DD"
 * @returns 压缩后的日期字符串，格式为 "YYMMDD"
 */
export function compressDate(dateStr: string): string {
	// 从日期字符串中提取年、月、日
	const [year, month, day] = dateStr.split('-');

	// 返回压缩后的格式 (年份只取后两位)
	return `${year.substring(2)}${month}${day}`;
}

/**
 * 压缩单个历史数据点为字符串格式
 * @param data 历史数据点
 * @param symbol 股票代码
 * @returns 压缩后的字符串
 */
export function compressHistoricalDataPoint(
	data: HistoricalDataPoint | HistoricalDataMinimal
): string {
	const compressedDate = compressDate(data.date);

	if ('open' in data) {
		// 完整数据格式
		return `${compressedDate}|${data.open}|${data.high}|${data.low}|${data.close}|${data.adjusted_close}|${data.volume}`;
	} else {
		// 简化数据格式
		return `${compressedDate}|${data.adjusted_close}|${data.volume}`;
	}
}

/**
 * 压缩历史数据数组为字符串行协议格式
 * @param data 历史数据点数组
 * @param symbol 股票代码，例如 "AAPL.US" 将被表示为 "AAPL"
 * @returns 压缩后的字符串，每行一个数据点
 */
export function compressHistoricalData(
	data: (HistoricalDataPoint | HistoricalDataMinimal)[],
	minimal: boolean,
	symbol: string
): string {
	const minimalDataFormat = '[date]|[adjusted_close]|[volume]';
	const fullDataFormat =
		'[date]|[open]|[high]|[low]|[close]|[adjusted_close]|[volume]';

	const startMessage = `historical data with format: ${minimal ? minimalDataFormat : fullDataFormat} for: ${symbol}\n\n `;

	// 将每个数据点转换为字符串，并用换行符连接
	return (
		startMessage +
		data.map((point) => compressHistoricalDataPoint(point)).join('\n')
	);
}

/**
 * 解压缩字符串行协议格式为历史数据数组
 * @param compressedData 压缩后的字符串数据
 * @param isMinimal 是否为简化数据格式
 * @returns 解压后的历史数据点数组
 */
export function decompressHistoricalData(
	compressedData: string,
	isMinimal: boolean = false
): (HistoricalDataPoint | HistoricalDataMinimal)[] {
	// 按行分割数据
	const lines = compressedData.trim().split('\n');

	return lines.map((line) => {
		const parts = line.split('|');

		// 解析日期: YYMMDD -> YYYY-MM-DD
		const dateStr = parts[1];
		const year = `20${dateStr.substring(0, 2)}`;
		const month = dateStr.substring(2, 4);
		const day = dateStr.substring(4, 6);
		const fullDate = `${year}-${month}-${day}`;

		if (isMinimal) {
			// 简化数据格式: 符号|日期|调整后收盘价|成交量
			return {
				date: fullDate,
				adjusted_close: Number(parts[2]),
				volume: Number(parts[3]),
			} as HistoricalDataMinimal;
		} else {
			// 完整数据格式: 符号|日期|开盘价|最高价|最低价|收盘价|调整后收盘价|成交量
			return {
				date: fullDate,
				open: Number(parts[2]),
				high: Number(parts[3]),
				low: Number(parts[4]),
				close: Number(parts[5]),
				adjusted_close: Number(parts[6]),
				volume: Number(parts[7]),
			} as HistoricalDataPoint;
		}
	});
}

/**
 * 压缩新闻数据为字符串格式
 * @param data 新闻数据数组
 * @param symbol 股票代码
 * @param limit 限制返回的新闻条数，默认为10
 * @returns 压缩后的新闻数据字符串
 */
export function compressNewsData(
	data: NewsDataPoint[],
	symbol: string,
	limit: number = 10
): string {
	// 只获取最近的n条新闻
	const limitedData = data.slice(0, limit);
	
	const startMessage = `latest ${limit} news for: ${symbol}\n\n`;
	
	// 只保留日期、标题和内容
	return startMessage + limitedData.map(newsItem => {
		// 压缩日期格式
		const compressedDate = compressDate(newsItem.date);
		// 格式化为 日期|标题|内容
		return `${compressedDate}|${newsItem.title}|${newsItem.content}`;
	}).join('\n');
}
