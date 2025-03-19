'use server';

import yahooFinance from 'yahoo-finance2';

import { getCache, setCache } from '@/lib/redis';

// 定义新闻项的接口
export interface StockNewsItem {
	uuid: string;
	title: string;
	publisher: string;
	link: string;
	publishTime: Date;
	type: string;
	thumbnail?: {
		resolutions: {
			url: string;
			width: number;
			height: number;
		}[];
	};
	relatedTickers?: string[];
}

// 获取股票相关新闻
export async function getStockNews(symbol: string, count: number = 5) {
	try {
		// 尝试从缓存获取数据
		const cacheKey = `stock_news:${symbol}:${count}`;
		const cachedData = await getCache(cacheKey);
		if (cachedData) {
			return cachedData;
		}

		// 获取股票新闻
		const searchResults = await yahooFinance.search(symbol, {
			newsCount: count,
			quotesCount: 0,
		});

		if (!searchResults.news || searchResults.news.length === 0) {
			return { news: [] };
		}

		// 格式化新闻数据
		const formattedNews = searchResults.news.map(
			(item: any): StockNewsItem => ({
				uuid: item.uuid,
				title: item.title,
				publisher: item.publisher,
				link: item.link,
				publishTime: item.providerPublishTime,
				type: item.type,
				thumbnail: item.thumbnail,
				relatedTickers: item.relatedTickers,
			})
		);

		const result = { news: formattedNews };

		// 缓存数据，设置5分钟过期时间
		await setCache(cacheKey, result, 300);

		return result;
	} catch (error) {
		console.error('Failed to fetch stock news:', error);
		throw new Error('Failed to fetch stock news');
	}
}
