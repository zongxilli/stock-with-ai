'use server';

import yahooFinance from 'yahoo-finance2';

import { getCache, setCache } from '@/lib/redis';

// 搜索股票API - 用于模糊搜索和纠正股票代码
export async function searchStock(query: string) {
	try {
		if (!query || query.trim() === '') {
			return {
				error: '搜索关键词不能为空',
				errorType: 'EMPTY_QUERY',
			};
		}

		const cleanQuery = query.trim();

		const cacheKey = `yahoo_search:${cleanQuery}`;

		// 尝试从Redis缓存获取数据
		const cachedData = await getCache(cacheKey);
		if (cachedData) {
			return cachedData;
		}

		const results = await yahooFinance.search(query, {
			quotesCount: 5,
			newsCount: 0,
			enableFuzzyQuery: false, // 模糊搜索
			enableEnhancedTrivialQuery: false, // 简单查询
		});

		if (!results.quotes || results.quotes.length === 0) {
			return {
				error: '没有找到匹配的股票',
				errorType: 'NO_RESULTS',
				query: cleanQuery,
			};
		}

		// 过滤出股票类型的结果
		// const stockResults = results.quotes.filter(
		// 	(quote) => quote?.typeDisp === 'Equity'
		// );

		if (results.quotes.length === 0) {
			return {
				error: '没有找到匹配的股票',
				errorType: 'NO_STOCK_RESULTS',
				query: cleanQuery,
			};
		}

		// 返回结果并缓存
		await setCache(
			cacheKey,
			{
				results: results,
				firstQuote: results.quotes[0],
				query: cleanQuery,
			},
			7200000
		); // 缓存20小时

		return {
			results: results,
			firstQuote: results.quotes[0],
			query: cleanQuery,
		};
	} catch (err) {
		console.error('股票搜索出错:', err);
		return {
			error: `搜索失败: ${err instanceof Error ? err.message : String(err)}`,
			errorType: 'SEARCH_ERROR',
			query,
		};
	}
}

export async function getValidYahooFinanceSymbol(
	symbol: string
): Promise<string | null> {
	// 先通过searchStock搜索确认股票代码是否存在
	const searchResult = await searchStock(symbol);

	// 如果搜索结果中有错误，直接返回错误信息
	if (searchResult.error) {
		return null;
	}

	// 使用搜索结果中的第一个股票的symbol
	const validSymbol = searchResult.firstQuote.symbol as string | null;

	return validSymbol;
}
