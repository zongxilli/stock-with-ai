'use server';

import yahooFinance from 'yahoo-finance2';

import { getIndexFullName } from './utils/helpers';

import { getCache, setCache } from '@/lib/redis';

// 获取所有市场指数数据
export async function getMainIndices() {
	// 尝试从Redis缓存获取数据
	const cachedIndices = await getCache('main_indices');
	if (cachedIndices) {
		return cachedIndices;
	}

	// 需要获取的市场指数代码
	const symbols = [
		// 期货
		'ES=F', // 标普500期货
		'YM=F', // 道琼斯期货
		'NQ=F', // 纳斯达克期货
		'RTY=F', // 罗素2000期货
		// 商品
		'CL=F', // 原油期货
		'GC=F', // 黄金期货
		// 加密货币
		'BTC-USD', // 比特币
		// 债券
		'^TNX', // 10年期美国国债
	];

	try {
		// 并行请求多个指数数据
		const results = await Promise.all(
			symbols.map(async (symbol) => {
				const quote = await yahooFinance.quote(symbol);
				return {
					symbol,
					name: getIndexFullName(symbol),
					price: quote.regularMarketPrice,
					change: quote.regularMarketChange,
					changePercent: quote.regularMarketChangePercent,
					dayHigh: quote.regularMarketDayHigh,
					dayLow: quote.regularMarketDayLow,
					marketTime: quote.regularMarketTime,
				};
			})
		);

		// 保存结果到Redis缓存，设置4秒过期时间
		await setCache('main_indices', results, 4);

		return results;
	} catch (error) {
		console.error('Failed to fetch market indices:', error);
		throw new Error('Failed to fetch market indices');
	}
}
