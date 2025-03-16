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

		// 获取财报历史数据和历史价格数据
		const [quoteSummaryResult, historicalData] = await Promise.all([
			yahooFinance.quoteSummary(symbol, {
				modules: ['earningsHistory', 'earnings'],
			}),
			// 获取历史价格数据，用于匹配财报日的价格变动
			yahooFinance.chart(symbol, {
				period1: '2020-01-01', // 足够早以覆盖所有财报日期
				period2: new Date(),
				interval: '1d',
			}),
		]);

		// 检查数据是否存在
		if (
			!quoteSummaryResult.earningsHistory ||
			!quoteSummaryResult.earnings
		) {
			throw new Error(`无法获取${symbol}的财报历史数据`);
		}

		const earningsHistory = quoteSummaryResult.earningsHistory.history;
		const financialsChart = quoteSummaryResult.earnings.financialsChart;

		// 创建日期到价格数据的映射
		const priceMap = new Map();
		if (historicalData.quotes) {
			historicalData.quotes.forEach((quote) => {
				if (quote.date) {
					// 使用日期的年月日部分作为键
					const dateKey = new Date(quote.date)
						.toISOString()
						.split('T')[0];
					priceMap.set(dateKey, {
						open: quote.open,
						close: quote.close,
						prevClose: null, // 将在下一步设置
					});
				}
			});

			// 设置前一日收盘价
			for (let i = 1; i < historicalData.quotes.length; i++) {
				const currDate = new Date(historicalData.quotes[i].date)
					.toISOString()
					.split('T')[0];
				const prevClose = historicalData.quotes[i - 1].close;
				const currData = priceMap.get(currDate);
				if (currData) {
					currData.prevClose = prevClose;
				}
			}
		}

		// 处理并合并数据
		const processedData = {
			earningsHistory: earningsHistory.map((item) => {
				const quarterDate = item.quarter
					? new Date(item.quarter)
					: null;
				const dateKey = quarterDate
					? quarterDate.toISOString().split('T')[0]
					: null;
				const priceData = dateKey ? priceMap.get(dateKey) : null;

				// 计算涨跌幅
				let openChangePercent = null;
				let closeChangePercent = null;

				if (priceData && priceData.prevClose) {
					openChangePercent = priceData.open
						? ((priceData.open - priceData.prevClose) /
								priceData.prevClose) *
							100
						: null;
					closeChangePercent = priceData.close
						? ((priceData.close - priceData.prevClose) /
								priceData.prevClose) *
							100
						: null;
				}

				// 提取年份和季度
				const year = quarterDate ? quarterDate.getFullYear() : 'N/A';
				const quarterNum = item.period
					? item.period.replace('-', '')
					: '';
				const formattedQuarter = `${year} ${quarterNum}`;

				return {
					date: quarterDate,
					period: item.period,
					formattedQuarter,
					epsActual: item.epsActual,
					epsEstimate: item.epsEstimate,
					epsDifference: item.epsDifference,
					surprisePercent: item.surprisePercent,
					formattedDate: quarterDate
						? formatDate(quarterDate)
						: 'N/A',
					// 价格信息
					openPrice: priceData?.open || null,
					openChangePercent: openChangePercent,
					closePrice: priceData?.close || null,
					closeChangePercent: closeChangePercent,
					prevClosePrice: priceData?.prevClose || null,
				};
			}),
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
