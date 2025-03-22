'use server';

import yahooFinance from 'yahoo-finance2';

import { formatAPIDate, parsePercentage } from './utils/formatters';
import { safeGet } from './utils/helpers';

import { getCache, setCache } from '@/lib/redis';

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
		try {
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

			// 检查返回数据中的错误或空数据
			if (!quote || !quote.symbol) {
				// 返回结构化的错误对象，而不是抛出错误
				return {
					error: `找不到股票代码: ${symbol}`,
					errorType: 'SYMBOL_NOT_FOUND',
				};
			}

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

				// 盘前盘后价格
				preMarketPrice: quote.preMarketPrice,
				preMarketChange: quote.preMarketChange,
				preMarketChangePercent: quote.preMarketChangePercent,
				preMarketTime: quote.preMarketTime,
				postMarketPrice: quote.postMarketPrice,
				postMarketChange: quote.postMarketChange,
				postMarketChangePercent: quote.postMarketChangePercent,
				postMarketTime: quote.postMarketTime,

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
				bidSize: safeGet(
					stats,
					['summaryDetail', 'bidSize'],
					undefined
				),
				askSize: safeGet(
					stats,
					['summaryDetail', 'askSize'],
					undefined
				),

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
				marketCap: safeGet(
					stats,
					['price', 'marketCap'],
					quote.marketCap
				),
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
					safeGet(
						stats,
						['summaryDetail', 'dividendYield'],
						undefined
					)
				),
				exDividendDate: formatAPIDate(
					safeGet(
						stats,
						['summaryDetail', 'exDividendDate'],
						undefined
					)
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
				earningsDate: formatAPIDate(
					safeGet(
						stats,
						['calendarEvents', 'earnings', 'earningsDate'],
						undefined
					)
				),
				dividendDate: formatAPIDate(
					safeGet(
						stats,
						['calendarEvents', 'dividendDate'],
						undefined
					)
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
				earningsTrend: safeGet(
					stats,
					['earningsTrend', 'trend'],
					[]
				).find((t: any) => t.period === '0q')?.earningsEstimate || {
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

			// 根据市场状态设置不同的缓存时间
			let cacheTime = 4; // 默认4秒

			// 检查是否是交易中状态
			if (quote.marketState === 'REGULAR') {
				cacheTime = 4; // 交易中: 4秒
			} else if (
				quote.marketState === 'PRE' ||
				quote.marketState === 'POST'
			) {
				cacheTime = 15; // 盘前盘后: 15秒
			} else {
				// 如果市场关闭，且有盘后数据，缓存8小时
				if (
					quote.marketState === 'CLOSED' &&
					quote.postMarketPrice !== undefined &&
					quote.postMarketChange !== undefined
				) {
					cacheTime = 28800; // 8小时 = 28800秒
				} else {
					cacheTime = 300; // 市场关闭无盘后数据: 5分钟
				}
			}

			// 保存结果到Redis缓存
			await setCache(cacheKey, stockData, cacheTime);

			return stockData;
		} catch (innerError) {
			// 这里处理Yahoo Finance API可能抛出的错误
			console.error(`Yahoo Finance API错误 (${symbol}):`, innerError);
			// 返回结构化的错误对象，而不是抛出错误
			return {
				error: `找不到股票数据: ${symbol}. 该股票代码可能不存在或暂时无法获取数据。`,
				errorType: 'API_ERROR',
				originalError:
					innerError instanceof Error
						? innerError.message
						: String(innerError),
			};
		}
	} catch (error) {
		console.error(`获取股票${symbol}实时数据失败:`, error);
		// 返回结构化的错误对象，而不是抛出错误
		return {
			error: `获取股票实时数据失败: ${error instanceof Error ? error.message : String(error)}`,
			errorType: 'UNKNOWN_ERROR',
			originalError:
				error instanceof Error ? error.message : String(error),
		};
	}
}
