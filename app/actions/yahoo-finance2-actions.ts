'use server';

import yahooFinance from 'yahoo-finance2';

import { getCache, setCache } from '@/lib/redis';

// 获取所有市场指数数据
export async function getMainIndices() {
	// 尝试从Redis缓存获取数据
	const cachedIndices = await getCache('main_indices');
	if (cachedIndices) {
		return cachedIndices;
	}

	// 需要获取的市场指数代码
	const symbols = [
		// 期货
		'ES=F', // 标普500期货
		'YM=F', // 道琼斯期货
		'NQ=F', // 纳斯达克期货
		'RTY=F', // 罗素2000期货
		// 商品
		'CL=F', // 原油期货
		'GC=F', // 黄金期货
		// 加密货币
		'BTC-USD', // 比特币
		// 债券
		'^TNX', // 10年期美国国债
	];

	try {
		// 并行请求多个指数数据
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

		// 保存结果到Redis缓存，设置4秒过期时间
		await setCache('main_indices', results, 4);

		return results;
	} catch (error) {
		console.error('Failed to fetch market indices:', error);
		throw new Error('Failed to fetch market indices');
	}
}

// 安全获取对象值的辅助函数
function safeGet(obj: any, path: string[], defaultValue: any = undefined) {
	try {
		let current = obj;
		for (const key of path) {
			if (current === undefined || current === null) return defaultValue;
			current = current[key];
		}
		return current === undefined || current === null
			? defaultValue
			: current;
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
	} catch (e) {
		return defaultValue;
	}
}

// 安全转换日期的辅助函数
function formatDate(
	timestamp: number | undefined,
	format: string = 'en-US'
): string | undefined {
	if (!timestamp) return undefined;
	try {
		return new Date(timestamp * 1000).toLocaleDateString(format, {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
	} catch (e) {
		return undefined;
	}
}

// 安全解析百分比的辅助函数
function parsePercentage(value: number | undefined): number | undefined {
	if (value === undefined || value === null) return undefined;
	try {
		return parseFloat((value * 100).toFixed(2));
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
	} catch (e) {
		return undefined;
	}
}

// 获取单个股票的全面数据
export async function getStockRealTimeData(symbol: string) {
	try {
		// 尝试从Redis缓存获取数据
		const cacheKey = `stock_realtime:${symbol}`;
		const cachedData = await getCache(cacheKey);
		if (cachedData) {
			return cachedData;
		}

		// 请求Yahoo Finance获取实时数据和更全面的统计信息
		const [quote, stats] = await Promise.all([
			yahooFinance.quote(symbol),
			yahooFinance.quoteSummary(symbol, {
				modules: [
					'price',
					'summaryDetail',
					'defaultKeyStatistics',
					'earnings',
					'financialData',
					'calendarEvents',
					'recommendationTrend',
					'upgradeDowngradeHistory',
					'earningsTrend',
				],
			}),
		]);

		// 提取需要的基本数据
		const stockData: any = {
			// 基本识别信息
			symbol: quote.symbol,
			name: quote.shortName || quote.longName || quote.symbol,

			// 价格和涨跌信息
			price: quote.regularMarketPrice,
			change: quote.regularMarketChange,
			changePercent: quote.regularMarketChangePercent,
			dayHigh: quote.regularMarketDayHigh,
			dayLow: quote.regularMarketDayLow,
			previousClose: quote.regularMarketPreviousClose,
			open: quote.regularMarketOpen,

			// 成交量信息
			marketVolume: quote.regularMarketVolume,

			// 52周高低点
			fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh,
			fiftyTwoWeekLow: quote.fiftyTwoWeekLow,

			// 市场信息
			marketTime: quote.regularMarketTime,
			marketState: quote.marketState, // 'REGULAR', 'PRE', 'POST', 'CLOSED' 等
			exchangeName: quote.fullExchangeName || quote.exchange,

			// 从quoteSummary中提取更多数据
			// 交易数据
			bid: safeGet(stats, ['price', 'bid'], undefined),
			ask: safeGet(stats, ['price', 'ask'], undefined),
			bidSize: safeGet(stats, ['summaryDetail', 'bidSize'], undefined),
			askSize: safeGet(stats, ['summaryDetail', 'askSize'], undefined),

			// 成交量统计
			avgVolume: safeGet(
				stats,
				['summaryDetail', 'averageVolume'],
				safeGet(
					stats,
					['price', 'averageDailyVolume3Month'],
					quote.averageDailyVolume10Day
				)
			),
			avgVolume10Day: safeGet(
				stats,
				['summaryDetail', 'averageVolume10days'],
				quote.averageDailyVolume10Day
			),

			// 市值和贝塔系数
			marketCap: safeGet(stats, ['price', 'marketCap'], quote.marketCap),
			beta: safeGet(stats, ['summaryDetail', 'beta'], undefined),

			// 财务比率
			peRatio: safeGet(
				stats,
				['summaryDetail', 'trailingPE'],
				quote.trailingPE
			),
			forwardPE: safeGet(
				stats,
				['summaryDetail', 'forwardPE'],
				undefined
			),
			eps: safeGet(
				stats,
				['defaultKeyStatistics', 'trailingEps'],
				undefined
			),

			// 股息信息
			dividendRate: safeGet(
				stats,
				['summaryDetail', 'dividendRate'],
				undefined
			),
			dividendYield: parsePercentage(
				safeGet(stats, ['summaryDetail', 'dividendYield'], undefined)
			),
			exDividendDate: formatDate(
				safeGet(stats, ['summaryDetail', 'exDividendDate'], undefined)
			),

			// 财务表现指标
			profitMargins: safeGet(
				stats,
				['defaultKeyStatistics', 'profitMargins'],
				undefined
			),
			revenueGrowth: safeGet(
				stats,
				['financialData', 'revenueGrowth'],
				undefined
			),
			earningsGrowth: safeGet(
				stats,
				['financialData', 'earningsGrowth'],
				undefined
			),
			returnOnAssets: safeGet(
				stats,
				['financialData', 'returnOnAssets'],
				undefined
			),
			returnOnEquity: safeGet(
				stats,
				['financialData', 'returnOnEquity'],
				undefined
			),

			// 分析师建议
			targetHigh: safeGet(
				stats,
				['financialData', 'targetHighPrice'],
				undefined
			),
			targetLow: safeGet(
				stats,
				['financialData', 'targetLowPrice'],
				undefined
			),
			targetMean: safeGet(
				stats,
				['financialData', 'targetMeanPrice'],
				undefined
			),
			targetMedian: safeGet(
				stats,
				['financialData', 'targetMedianPrice'],
				undefined
			),
			recommendationMean: safeGet(
				stats,
				['financialData', 'recommendationMean'],
				undefined
			),
			recommendationKey: safeGet(
				stats,
				['financialData', 'recommendationKey'],
				undefined
			),
			numberOfAnalysts: safeGet(
				stats,
				['financialData', 'numberOfAnalystOpinions'],
				undefined
			),

			// 财报和股息日期
			earningsDate: formatDate(
				safeGet(
					stats,
					['calendarEvents', 'earnings', 'earningsDate'],
					undefined
				)
			),
			dividendDate: formatDate(
				safeGet(stats, ['calendarEvents', 'dividendDate'], undefined)
			),

			// 现金流和债务信息
			totalCash: safeGet(
				stats,
				['financialData', 'totalCash'],
				undefined
			),
			totalCashPerShare: safeGet(
				stats,
				['financialData', 'totalCashPerShare'],
				undefined
			),
			totalDebt: safeGet(
				stats,
				['financialData', 'totalDebt'],
				undefined
			),
			debtToEquity: safeGet(
				stats,
				['financialData', 'debtToEquity'],
				undefined
			),

			// 财务指标
			currentRatio: safeGet(
				stats,
				['financialData', 'currentRatio'],
				undefined
			),
			quickRatio: safeGet(
				stats,
				['financialData', 'quickRatio'],
				undefined
			),
			freeCashflow: safeGet(
				stats,
				['financialData', 'freeCashflow'],
				undefined
			),

			// 其他统计数据
			sharesOutstanding: safeGet(
				stats,
				['defaultKeyStatistics', 'sharesOutstanding'],
				undefined
			),
			heldPercentInsiders: safeGet(
				stats,
				['defaultKeyStatistics', 'heldPercentInsiders'],
				undefined
			),
			heldPercentInstitutions: safeGet(
				stats,
				['defaultKeyStatistics', 'heldPercentInstitutions'],
				undefined
			),
			shortRatio: safeGet(
				stats,
				['defaultKeyStatistics', 'shortRatio'],
				undefined
			),
			floatShares: safeGet(
				stats,
				['defaultKeyStatistics', 'floatShares'],
				undefined
			),

			// 升级/降级历史摘要
			latestAnalystUpgradesDowngrades: safeGet(
				stats,
				['upgradeDowngradeHistory', 'history'],
				[]
			)
				.slice(0, 3)
				.map((item: any) => ({
					date: item.epochGradeDate
						? new Date(item.epochGradeDate).toLocaleDateString()
						: undefined,
					firm: item.firm,
					toGrade: item.toGrade,
					fromGrade: item.fromGrade,
					action: item.action,
				})),

			// 收益趋势总结
			earningsTrend: safeGet(stats, ['earningsTrend', 'trend'], []).find(
				(t: any) => t.period === '0q'
			)?.earningsEstimate || {
				avg: null,
				low: null,
				high: null,
				yearAgoEps: null,
				growth: null,
			},

			// 元数据
			lastUpdated: new Date().toISOString(),
			currency:
				quote.currency ||
				safeGet(stats, ['summaryDetail', 'currency'], 'USD'),
		};

		// 保存结果到Redis缓存，设置4秒过期时间
		await setCache(cacheKey, stockData, 4);

		return stockData;
	} catch (error) {
		console.error(`获取股票${symbol}实时数据失败:`, error);
		throw new Error(
			`获取股票实时数据失败: ${error instanceof Error ? error.message : String(error)}`
		);
	}
}

// 获取各市场指数的全名
function getIndexFullName(symbol: string): string {
	switch (symbol) {
		// 期货
		case 'ES=F':
			return 'S&P Futures';
		case 'YM=F':
			return 'Dow Futures';
		case 'NQ=F':
			return 'Nasdaq Futures';
		case 'RTY=F':
			return 'Russell 2000';
		// 商品
		case 'CL=F':
			return 'Crude Oil';
		case 'GC=F':
			return 'Gold';
		// 加密货币
		case 'BTC-USD':
			return 'Bitcoin';
		// 债券
		case '^TNX':
			return '10-Year Treasury';
		default:
			return symbol;
	}
}
