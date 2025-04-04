'use server';

import yahooFinance from 'yahoo-finance2';

import { getCache, setCache } from '@/lib/redis';

export interface YahooNewsDataPoint {
	title: string;
	publisher: string;
	link: string;
	providerPublishTime: number;
	type: string;
	thumbnail?: {
		resolutions: Array<{
			url: string;
			width: number;
			height: number;
			tag: string;
		}>;
	};
	relatedTickers?: string[];
}

export interface NewsDataPoint {
	date: string;
	title: string;
	content: string;
	link: string;
	symbols: string[];
	imageUrl?: string;
	publisher?: string;
}

/**
 * Fetches news data for a stock from Yahoo Finance
 * @param symbol Yahoo Finance symbol (e.g., AAPL)
 * @param limit Maximum number of news items to return
 * @returns Array of news data points
 */
export async function getStockNewsData(
	symbol: string,
	limit: number = 6
): Promise<NewsDataPoint[]> {
	// Create a cache key that includes all parameters
	const cacheKey = `yahoo-news-${symbol}-${limit}`;
	const cachedData = await getCache(cacheKey);
	if (cachedData) {
		return cachedData;
	}

	try {
		// Use the search endpoint which includes news results
		const result = await yahooFinance.search(symbol, {
			newsCount: limit,  // Request the specified number of news items
			quotesCount: 1,    // We're only interested in news, so minimize quotes
		});

		// Extract and transform the news data
		const newsData: NewsDataPoint[] = result.news.map((item: any) => {
			// Get best thumbnail image if available
			let imageUrl: string | undefined;
			if (item.thumbnail && item.thumbnail.resolutions && item.thumbnail.resolutions.length > 0) {
				// Sort by width to get the largest image
				const sortedImages = [...item.thumbnail.resolutions].sort((a, b) => b.width - a.width);
				imageUrl = sortedImages[0].url;
			}

			const formatYahooDate = (timestamp: number): string => {
				try {
					// 检查时间戳类型和大小
					if (!timestamp) return new Date().toISOString();
					
					// 如果时间戳超过正常范围，使用当前时间
					if (timestamp > 4000000000 || timestamp < 0) {
						return new Date().toISOString();
					}
					
					// 正常处理 - Yahoo通常使用秒级时间戳
					return new Date(timestamp * 1000).toISOString();
				} catch (e) {
					console.error('日期解析错误:', e);
					return new Date().toISOString();
				}
			};

			return {
				date: formatYahooDate(item.providerPublishTime),
				title: item.title || '',
				// Yahoo doesn't provide content in the search endpoint, so we use the publisher as a placeholder
				content: `Published by ${item.publisher || 'Unknown publisher'}`,
				link: item.link || '',
				symbols: item.relatedTickers || [symbol],
				imageUrl,
				publisher: item.publisher,
			};
		});

		// Cache the results for future requests (15 minutes)
		await setCache(cacheKey, newsData, 60 * 15);

		return newsData;
	} catch (error) {
		console.error('Error fetching Yahoo Finance news data:', error);
		return [];
	}
}
