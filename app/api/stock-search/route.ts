import { NextResponse } from 'next/server';
import yahooFinance from 'yahoo-finance2';

import { getCache, setCache } from '@/lib/redis';
import { handleApiError } from '@/utils/utils';

// 定义我们需要的结果类型
interface FormattedQuote {
	symbol: string;
	shortname: string;
	longname: string;
	type: string;
	exchange: string;
}

export async function GET(request: Request) {
	try {
		const { searchParams } = new URL(request.url);
		const query = searchParams.get('q');

		if (!query || query.length < 2) {
			return NextResponse.json({ quotes: [] });
		}

		// 尝试从Redis缓存获取搜索结果
		const cacheKey = `stock_search:${query.toLowerCase()}`;
		const cachedResults = await getCache(cacheKey);

		if (cachedResults) {
			return NextResponse.json(cachedResults);
		}

		// 调用Yahoo Finance API搜索股票
		const searchResults = await yahooFinance.search(query, {
			quotesCount: 8,
			newsCount: 0,
		});

		// 过滤结果并安全地转换
		const formattedResults = {
			quotes: searchResults.quotes
				// 首先过滤出所有需要的项
				.filter(
					(quote: any) =>
						quote.isYahooFinance === true &&
						quote.symbol &&
						quote.quoteType &&
						[
							'EQUITY',
							'ETF',
							'INDEX',
							'MUTUALFUND',
							'CRYPTOCURRENCY',
						].includes(quote.quoteType)
				)
				// 然后安全地映射到我们需要的格式
				.map(
					(quote: any): FormattedQuote => ({
						symbol: quote.symbol,
						shortname: quote.shortname || '',
						longname: quote.longname || '',
						type: quote.quoteType,
						exchange: quote.exchange || '',
					})
				),
		};

		// 将结果存入Redis缓存，设置24小时过期
		await setCache(cacheKey, formattedResults, 86400);

		return NextResponse.json(formattedResults);
	} catch (error) {
		// 使用通用错误处理函数
		return handleApiError(error, '股票搜索失败，请稍后再试', 500);
	}
}
