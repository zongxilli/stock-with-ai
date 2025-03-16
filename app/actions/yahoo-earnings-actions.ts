'use server';

import yahooFinance from 'yahoo-finance2';

import { getCache, setCache } from '@/lib/redis';

// 获取公司的财报历史数据
export async function getCompanyEarningsHistory(symbol: string) {
	try {
		// 尝试从Redis缓存获取数据
		const cacheKey = `earnings_history:${symbol}`;
		const cachedData = await getCache(cacheKey);
		if (cachedData) {
			return cachedData;
		}

		// 获取财报历史数据
		const quoteSummaryResult = await yahooFinance.quoteSummary(symbol, {
			modules: ['earningsHistory', 'earnings'],
		});

		// 检查数据是否存在
		if (
			!quoteSummaryResult.earningsHistory ||
			!quoteSummaryResult.earnings
		) {
			throw new Error(`无法获取${symbol}的财报历史数据`);
		}

		const earningsHistory = quoteSummaryResult.earningsHistory.history;
		const financialsChart = quoteSummaryResult.earnings.financialsChart;

		// 处理并合并数据
		const processedData = {
			earningsHistory: earningsHistory.map((item) => ({
				date: item.quarter ? new Date(item.quarter) : null,
				period: item.period,
				epsActual: item.epsActual,
				epsEstimate: item.epsEstimate,
				epsDifference: item.epsDifference,
				surprisePercent: item.surprisePercent,
				formattedDate: item.quarter
					? formatDate(new Date(item.quarter))
					: 'N/A',
			})),
			quarterlyData: financialsChart?.quarterly
				? financialsChart.quarterly.map((item) => ({
						date: item.date,
						revenue: item.revenue,
						earnings: item.earnings,
					}))
				: [],
			yearlyData: financialsChart?.yearly
				? financialsChart.yearly.map((item) => ({
						date: item.date,
						revenue: item.revenue,
						earnings: item.earnings,
					}))
				: [],
			currency: quoteSummaryResult.earnings.financialCurrency || 'USD',
		};

		// 缓存数据，设置为1小时过期
		await setCache(cacheKey, processedData, 3600);

		return processedData;
	} catch (error) {
		console.error(`获取${symbol}财报历史数据失败:`, error);
		throw new Error(
			`获取财报历史数据失败: ${error instanceof Error ? error.message : String(error)}`
		);
	}
}

// 格式化日期为YYYY-MM-DD格式
function formatDate(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}
