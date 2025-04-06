'use server';

import {
	HistoricalDataPoint,
	HistoricalDataMinimal,
} from './get-historical-data';

import { getCache, setCache } from '@/lib/redis';


/**
 * 根据指定的开始和结束日期获取股票历史数据
 *
 * 从EODHD API获取指定股票在给定日期范围内的历史价格数据
 *
 * @param code 股票代码
 * @param exchange 交易所代码
 * @param startDate 开始日期 (YYYY-MM-DD格式)
 * @param endDate 结束日期 (YYYY-MM-DD格式)
 * @param minimal 是否只返回简化数据 (默认为true)
 * @returns 历史数据点数组，按日期排序（从最旧到最新）
 */
export async function getHistoricalDataByRange(
	code: string,
	exchange: string,
	startDate: string,
	endDate: string,
	minimal: boolean = true
): Promise<HistoricalDataPoint[] | HistoricalDataMinimal[]> {
	try {
		// 构建完整的股票标识符（格式：CODE.EXCHANGE）
		const symbol = `${code}.${exchange}`;

		// 尝试从Redis缓存获取数据
		const cacheKey = `eodhd_historical_range:${symbol}:${startDate}_${endDate}:minimal=${minimal}`;
		const cachedData = await getCache(cacheKey);
		if (cachedData) {
			return cachedData;
		}

		// 获取API密钥
		const apiKey = process.env.EODHD_API_KEY;
		if (!apiKey) {
			throw new Error('EODHD API密钥未配置');
		}

		// 构建API请求参数
		const params = new URLSearchParams({
			api_token: apiKey,
			fmt: 'json',
			period: 'd', // 使用日数据
			order: 'a', // 升序排列（从旧到新）
			from: startDate,
			to: endDate,
		});

		// 构建API请求URL
		const url = `https://eodhd.com/api/eod/${encodeURIComponent(symbol)}?${params}`;

		// 发送请求
		const response = await fetch(url, { next: { revalidate: 3600 } }); // 缓存1小时

		if (!response.ok) {
			throw new Error(
				`API请求失败: ${response.status} ${response.statusText}`
			);
		}

		// 解析API响应数据
		const apiData = await response.json();

		let historicalData: HistoricalDataPoint[] | HistoricalDataMinimal[] =
			[];

		if (minimal) {
			historicalData = apiData.map((item: any) => ({
				date: item.date,
				adjusted_close: item.adjusted_close,
				volume: item.volume,
			}));
		} else {
			historicalData = apiData.map((item: any) => ({
				date: item.date,
				open: item.open,
				high: item.high,
				low: item.low,
				close: item.close,
				adjusted_close: item.adjusted_close,
				volume: item.volume,
			}));
		}

		// 将数据缓存到Redis（缓存1小时）
		await setCache(cacheKey, historicalData, 3600);

		return historicalData;
	} catch (error) {
		console.error('获取历史数据时出错:', error);
		throw new Error('获取股票历史数据失败');
	}
}
