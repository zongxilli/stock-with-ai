'use server';

import yahooFinance from 'yahoo-finance2';

import { getCache, setCache } from '@/lib/redis';

// 获取异常波动股票数据
export async function getVolatileStocks() {
	try {
		// 尝试从Redis缓存获取数据
		const cacheKey = 'volatile_stocks';
		const cachedData = await getCache(cacheKey);
		if (cachedData) {
			return cachedData;
		}

		// 使用Promise.allSettled代替Promise.all，允许部分请求失败
		const results = await Promise.allSettled([
			yahooFinance.screener({ scrIds: 'day_gainers', count: 5 }),
			yahooFinance.screener({ scrIds: 'day_losers', count: 5 }),
			yahooFinance.screener({ scrIds: 'most_actives', count: 5 }),
			yahooFinance.screener({ scrIds: 'most_shorted_stocks', count: 5 }),
		]);

		// 处理结果，提取成功的数据，忽略失败的请求
		const data = {
			gainers:
				results[0].status === 'fulfilled'
					? results[0].value.quotes || []
					: [],
			losers:
				results[1].status === 'fulfilled'
					? results[1].value.quotes || []
					: [],
			mostActives:
				results[2].status === 'fulfilled'
					? results[2].value.quotes || []
					: [],
			mostShorted:
				results[3].status === 'fulfilled'
					? results[3].value.quotes || []
					: [],
			lastUpdated: new Date().toISOString(),
		};

		// 检查是否至少有一个类别数据成功获取
		const hasAnyData = Object.values(data).some(
			(arr) => Array.isArray(arr) && arr.length > 0
		);

		if (!hasAnyData) {
			return {
				gainers: [],
				losers: [],
				mostActives: [],
				mostShorted: [],
				lastUpdated: new Date().toISOString(),
				error: 'No market data available at this time',
			};
		}

		// 缓存结果 - 设置5分钟过期
		await setCache(cacheKey, data, 300);

		return data;
	} catch (error) {
		console.error('获取异常波动股票数据失败:', error);
		// 出错时返回空数据而不是抛出异常
		return {
			gainers: [],
			losers: [],
			mostActives: [],
			mostShorted: [],
			lastUpdated: new Date().toISOString(),
			error: `Failed to load market data: ${error instanceof Error ? error.message : String(error)}`,
		};
	}
}
