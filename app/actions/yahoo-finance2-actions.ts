'use server';

import yahooFinance from 'yahoo-finance2';

import { getCache, setCache } from '@/lib/redis';

// 获取主要股指数据
export async function getMainIndices() {
	// 尝试从Redis缓存获取数据
	const cachedIndices = await getCache('main_indices');
	if (cachedIndices) {
		return cachedIndices;
	}

	// 需要获取的主要指数代码
	const symbols = [
		'^GSPC', // 标普500
		'^DJI', // 道琼斯工业平均指数
		'^IXIC', // 纳斯达克综合指数
	];

	try {
		// 并行请求多个股指数据
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

		// 保存结果到Redis缓存，设置5分钟过期时间
		await setCache('main_indices', results, 300);

		return results;
	} catch (error) {
		console.error('获取股指数据失败:', error);
		throw new Error('获取股指数据失败');
	}
}

// 获取指数的完整名称
function getIndexFullName(symbol: string): string {
	switch (symbol) {
		case '^GSPC':
			return '标普500指数';
		case '^DJI':
			return '道琼斯工业平均指数';
		case '^IXIC':
			return '纳斯达克综合指数';
		default:
			return symbol;
	}
}
