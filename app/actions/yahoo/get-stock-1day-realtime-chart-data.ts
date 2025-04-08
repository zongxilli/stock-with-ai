'use server';

import yahooFinance from 'yahoo-finance2';

import { getValidYahooFinanceSymbol } from './search-stock';
import { formatYahooFinanceChartData } from './utils/format';

import { getCache, setCache } from '@/lib/redis';

export async function getStock1DayRealtimeChartData(symbol: string) {
	try {
		const cacheKey = `1DayRealtime:${symbol}`;
		const cachedData = await getCache(cacheKey);
		if (cachedData) {
			return cachedData.quotes;
		}

		// 先通过searchStock搜索确认股票代码是否存在
		const validSymbol = await getValidYahooFinanceSymbol(symbol);
		if (!validSymbol) {
			return {
				error: `未找到证券代码: ${symbol}。请检查代码并重试。getStockChartData`,
				errorType: 'API_ERROR',
				originalError: `未找到证券代码: ${symbol}`,
			};
		}

		const chartData = await yahooFinance.chart(validSymbol, {
			interval: '1m',
			period1: new Date(new Date().setHours(0, 0, 0, 0)),
			period2: new Date(),
			includePrePost: false,
		});

		await setCache(cacheKey, chartData, 3600);

		return chartData.quotes;
	} catch (error) {
		return {
			error: `获取图表数据失败: ${error instanceof Error ? error.message : String(error)}`,
			errorType: 'UNKNOWN_ERROR',
			originalError:
				error instanceof Error ? error.message : String(error),
		};
	}
}

export async function getStock1DayRealtimeChartDataForAdvancedChart(
	symbol: string
) {
	const chartData = await getStock1DayRealtimeChartData(symbol);

	if (chartData.error) {
		return chartData;
	}

	const formattedChartData = formatYahooFinanceChartData(chartData);

	await setCache(`FORMATTED:${symbol}`, formattedChartData, 3600);

	return formattedChartData;
}
