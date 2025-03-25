'use server';

import { HistoricalDataPoint } from './get-historical-data';
import { calculateDateRange } from './indicators/types/types';

import { getCache, setCache } from '@/lib/redis';

/**
 * 获取股票历史数据
 *
 * 从EODHD API获取指定股票在给定时间范围内的历史价格数据
 *
 * @param code 股票代码
 * @param exchange 交易所代码
 * @returns 历史数据点数组，按日期排序（从最旧到最新）
 */
export async function getHistoricalData1MonthFull(
	code: string,
	exchange: string
): Promise<HistoricalDataPoint[]> {
	try {
		// 构建完整的股票标识符（格式：CODE.EXCHANGE）
		const symbol = `${code}.${exchange}`;

		// 尝试从Redis缓存获取数据
		const cacheKey = `eodhd_historical_1_month_full:${symbol}`;
		const cachedData = await getCache(cacheKey);
		if (cachedData) {
			return cachedData;
		}

		// 获取API密钥
		const apiKey = process.env.EODHD_API_KEY;
		if (!apiKey) {
			throw new Error('EODHD API密钥未配置');
		}

		// 计算开始日期（基于当前日期和请求的范围）
		const { startDate, endDate } = calculateDateRange('1mo');

		// 构建API请求参数
		// 构建API请求参数
		const params = new URLSearchParams({
			api_token: apiKey,
			fmt: 'json',
			period: 'd', // 使用日数据
			order: 'a', // 升序排列（从旧到新）
		});

		// 如果有开始日期，则添加到请求参数
		if (startDate) {
			const formatDate = (date: Date) => {
				return date.toISOString().split('T')[0]; // 格式：YYYY-MM-DD
			};

			params.append('from', formatDate(startDate));
			params.append('to', formatDate(endDate));
		}

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

		const historicalData: HistoricalDataPoint[] = apiData.map(
			(item: any) => ({
				date: item.date,
				open: item.open,
				high: item.high,
				low: item.low,
				close: item.close,
				adjusted_close: item.adjusted_close,
				volume: item.volume,
			})
		);

		// 将数据缓存到Redis（缓存1小时）
		await setCache(cacheKey, historicalData, 3600);

		return historicalData;
	} catch (error) {
		console.error('获取历史数据时出错:', error);
		throw new Error('获取股票历史数据失败');
	}
}
