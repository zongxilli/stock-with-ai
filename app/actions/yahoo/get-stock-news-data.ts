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
			newsCount: limit, // Request the specified number of news items
			quotesCount: 1, // We're only interested in news, so minimize quotes
		});

		// Extract and transform the news data
		const newsData: NewsDataPoint[] = result.news.map((item: any) => {
			// Get best thumbnail image if available
			let imageUrl: string | undefined;
			if (
				item.thumbnail &&
				item.thumbnail.resolutions &&
				item.thumbnail.resolutions.length > 0
			) {
				// Sort by width to get the largest image
				const sortedImages = [...item.thumbnail.resolutions].sort(
					(a, b) => b.width - a.width
				);
				imageUrl = sortedImages[0].url;
			}

			// 处理 Yahoo Finance 的时间戳
			const formatYahooDate = (timestamp: string): string => {
				try {
					// Yahoo Finance 返回的时间戳已经是完整的 ISO 8601 格式
					const date = new Date(timestamp);

					// 确保时间戳在合理范围内
					const now = new Date();
					const maxTimestamp = now.getTime() + 24 * 60 * 60 * 1000; // 当前时间之后24小时
					const minTimestamp =
						now.getTime() - 30 * 24 * 60 * 60 * 1000; // 当前时间之前30天

					const dateTimestamp = date.getTime();
					if (
						dateTimestamp > maxTimestamp ||
						dateTimestamp < minTimestamp
					) {
						console.error('时间戳超出合理范围:', timestamp);
						return now.toISOString();
					}

					return date.toISOString();
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

			// 按时间降序排序（最新的新闻在最前面）
			newsData.sort((a, b) => {
				const dateA = new Date(a.date).getTime();
				const dateB = new Date(b.date).getTime();
				return dateB - dateA; // 降序排序
			});

			// Cache the sorted results for future requests (15 minutes)
			await setCache(cacheKey, newsData, 60 * 15);

			return newsData;
		} catch (error) {
			console.error('Error fetching Yahoo Finance news data:', error);
			return [];
		}
	}
