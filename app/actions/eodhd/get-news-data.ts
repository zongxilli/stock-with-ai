'use server';

import { getCache, setCache } from '@/lib/redis';

export interface NewsDataPoint {
	date: string;
	title: string;
	content: string;
	link: string;
	symbols: string[];
}

export async function getNewsData(
	code: string,
	exchange: string,
	limit?: number,
	days?: number
): Promise<NewsDataPoint[]> {
	// Create a cache key that includes all parameters
	const cacheKey = `news-${code}-${exchange}-${limit || 50}-${days || 0}`;
	const cachedData = await getCache(cacheKey);
	if (cachedData) {
		return cachedData;
	}

	const apiKey = process.env.EODHD_API_KEY;
	if (!apiKey) {
		throw new Error('EODHD API密钥未配置');
	}

	// Build the URL with all parameters
	const baseUrl = 'https://eodhd.com/api/news';
	const queryParams = new URLSearchParams();

	// Required parameters
	const ticker = `${code}.${exchange}`; // Format: TICKER.EXCHANGE (e.g., AAPL.US)
	queryParams.append('s', ticker);
	queryParams.append('api_token', apiKey);
	queryParams.append('fmt', 'json');

	// Optional parameters
	if (limit && limit > 0) {
		queryParams.append('limit', limit.toString());
	}

	// If days is provided, calculate the 'from' date
	if (days && days > 0) {
		const fromDate = new Date();
		fromDate.setDate(fromDate.getDate() - days);
		const formattedFromDate = fromDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD
		queryParams.append('from', formattedFromDate);
	}

	// Build the final URL
	const url = `${baseUrl}?${queryParams.toString()}`;
	console.log(`Fetching news data from: ${url.replace(apiKey, '*****')}`);

	try {
		const response = await fetch(url);

		if (!response.ok) {
			throw new Error(
				`Failed to fetch news data: ${response.status} ${response.statusText}`
			);
		}

		const data = (await response.json()) as NewsDataPoint[];
		
		// Log data length for debugging
		console.log(`Retrieved ${data.length} news items for ${ticker}`);
		
		// Cache the results for future requests
		await setCache(cacheKey, data, 60 * 30); // Cache for 30 minutes

		return data;
	} catch (error) {
		console.error('Error fetching news data:', error);
		return [];
	}
}
