'use server';

import yahooFinance from 'yahoo-finance2';

import { getValidYahooFinanceSymbol } from './search-stock';
import { formatDate } from './utils/formatters';
import {
	generateTradingTimeline,
	mergeDataWithTimeline,
} from './utils/helpers';

import { getCache, setCache } from '@/lib/redis';

// 获取单个股票的历史数据
export async function getStockChartData(symbol: string, range: string = '1mo') {
	try {
		// 尝试从Redis缓存获取数据
		const cacheKey = `stock_chart:${symbol}:${range}`;
		const cachedData = await getCache(cacheKey);
		if (cachedData) {
			return cachedData;
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

		// 设置查询参数
		const now = new Date();
		let period1: Date;
		let period2 = now;
		let interval = '1d';

		// 首先获取证券的基本信息，用于确定证券类型
		const quoteData = await yahooFinance.quote(validSymbol);

		// 检查报价数据是否有效
		if (!quoteData || !quoteData.regularMarketTime) {
			// 返回结构化的错误对象，而不是抛出错误
			return {
				error: `无法获取${validSymbol}的实时市场数据`,
				errorType: 'QUOTE_NOT_FOUND',
			};
		}

		// 获取证券类型
		const quoteType = quoteData.quoteType || 'UNKNOWN';

		// 特殊处理1D视图
		if (range === '1d') {
			interval = '1m';

			// 根据marketState判断市场当前状态
			// 可能的值: REGULAR(正常交易), PRE(盘前), POST(盘后), CLOSED(已关闭)
			const marketState = quoteData.marketState || 'CLOSED';
			const isMarketOpen = marketState === 'REGULAR';

			// 使用regularMarketTime作为参考日期
			const lastTradeDate = new Date(quoteData.regularMarketTime);

			// 设置交易日的开始和结束时间
			// 设置为当天开始
			const tradingDay = new Date(lastTradeDate);
			tradingDay.setHours(0, 0, 0, 0);

			// 交易时间设置 - 美股标准交易时间 9:30 AM - 4:00 PM
			let tradingStartHour = 9;
			let tradingStartMinute = 30;
			let tradingEndHour = 16;
			let tradingEndMinute = 0;
			let shouldFillMissingData = true;

			// 根据证券类型调整交易时间和数据填充策略
			switch (quoteType) {
				case 'CRYPTOCURRENCY':
					// 加密货币24小时交易，不需要填充数据
					tradingStartHour = 0;
					tradingStartMinute = 0;
					tradingEndHour = 23;
					tradingEndMinute = 59;
					shouldFillMissingData = false;
					break;
				case 'FUTURE':
					// 期货通常有不同的交易时间，也不需要标准的填充
					shouldFillMissingData = false;
					break;
				case 'OPTION':
					// 期权通常与标的资产交易时间相同
					shouldFillMissingData = true;
					break;
				case 'EQUITY':
				case 'ETF':
				case 'MUTUALFUND':
				case 'INDEX':
				default:
					// 美股标准交易时间: 9:30 AM - 4:00 PM
					tradingStartHour = 9;
					tradingStartMinute = 30;
					tradingEndHour = 16;
					tradingEndMinute = 0;
					shouldFillMissingData = true;
					break;
			}

			// 交易开始时间
			period1 = new Date(tradingDay);
			period1.setHours(tradingStartHour, tradingStartMinute, 0, 0);

			// 交易结束时间
			period2 = new Date(tradingDay);
			period2.setHours(tradingEndHour, tradingEndMinute, 0, 0);

			// 查询Yahoo Finance获取交易日的数据
			const queryOptions = {
				period1,
				period2,
				interval: interval as any,
				includePrePost: false,
			};

			const result = await yahooFinance.chart(validSymbol, queryOptions);

			// 检查结果是否有效
			if (!result || !result.quotes || result.quotes.length === 0) {
				throw new Error(`无法获取${validSymbol}的历史数据`);
			}

			// 过滤出交易时间段内的数据
			let filteredQuotes = result.quotes;
			let processedQuotes = filteredQuotes; // 初始化processedQuotes变量

			// 仅对特定类型的证券填充完整交易时间点
			if (shouldFillMissingData && isMarketOpen) {
				// 生成完整的交易时间点
				const completeTimeline = generateTradingTimeline(
					period1,
					period2
				);

				// 将实际数据与完整时间轴合并
				processedQuotes = mergeDataWithTimeline(
					filteredQuotes,
					completeTimeline
				);
			} else {
				// 过滤出标准交易时间内的数据
				if (quoteData.regularMarketTime) {
					const marketOpenTime = new Date(
						quoteData.regularMarketTime
					);
					// 设置为当天的9:30 AM (美股标准开盘时间)
					marketOpenTime.setHours(9, 30, 0, 0);

					const marketCloseTime = new Date(
						quoteData.regularMarketTime
					);
					// 设置为当天的4:00 PM (美股标准收盘时间)
					marketCloseTime.setHours(16, 0, 0, 0);

					// 过滤出标准交易时间内的数据
					filteredQuotes = filteredQuotes.filter((quote) => {
						const quoteTime = new Date(quote.date);
						const quoteHour = quoteTime.getHours();
						const quoteMinute = quoteTime.getMinutes();

						// 检查是否在9:30 AM - 4:00 PM之间
						return (
							(quoteHour > 9 ||
								(quoteHour === 9 && quoteMinute >= 30)) &&
							(quoteHour < 16 ||
								(quoteHour === 16 && quoteMinute === 0))
						);
					});

					// 如果过滤后没有数据，则使用原始数据
					if (filteredQuotes.length === 0) {
						filteredQuotes = result.quotes;
						console.warn(
							`过滤后没有数据，使用原始数据 (${validSymbol})`
						);
					}
				}
				processedQuotes = filteredQuotes;
			}

			// 添加格式化的日期字符串
			const formattedData = processedQuotes.map((quote) => ({
				...quote,
				dateFormatted: quote.date ? formatDate(quote.date, range) : '',
			}));

			// 构建市场状态信息
			let marketStatusInfo = {
				isPartialDay: isMarketOpen, // 如果市场开放，说明是部分日数据
				isPreviousTradingDay:
					!isMarketOpen && lastTradeDate.getDate() !== now.getDate(), // 如果市场关闭且不是今天，表示是前一交易日
				marketState: marketState,
				tradingDate: lastTradeDate.toLocaleDateString(),
				exchangeName: quoteData.fullExchangeName || quoteData.exchange,
				quoteType: quoteType, // 添加证券类型信息
			};

			// 返回图表元数据和处理后的报价数据
			const chartData = {
				meta: result.meta,
				quotes: formattedData,
				...marketStatusInfo,
			};

			// 缓存设置
			const chart1dCacheTime = isMarketOpen ? 10 : 300; // 如果市场开放，10秒缓存；否则5分钟
			await setCache(cacheKey, chartData, chart1dCacheTime);

			return chartData;
		} else {
			// 对于其他时间范围的处理保持不变
			switch (range) {
				case '5d':
					// 往回拿7天的数据，大概率能包含5个交易日
					period1 = new Date(now);
					period1.setDate(now.getDate() - 7);
					interval = '15m';
					break;
				case '1mo':
					period1 = new Date(now);
					period1.setMonth(now.getMonth() - 1);
					break;
				case '3mo':
					period1 = new Date(now);
					period1.setMonth(now.getMonth() - 3);
					break;
				case '6mo':
					period1 = new Date(now);
					period1.setMonth(now.getMonth() - 6);
					break;
				case '1y':
					period1 = new Date(now);
					period1.setFullYear(now.getFullYear() - 1);
					break;
				case '5y':
					period1 = new Date(now);
					period1.setFullYear(now.getFullYear() - 5);
					break;
				case 'max':
					// 对于max，我们设置一个非常早的日期，比如1950年
					// 这样就能获取到股票上市以来的所有数据
					period1 = new Date(1950, 0, 1);
					break;
				default:
					period1 = new Date(now);
					period1.setMonth(now.getMonth() - 1);
			}

			const queryOptions = {
				period1,
				period2,
				interval: interval as any,
				includePrePost: false,
			};

			const result = await yahooFinance.chart(validSymbol, queryOptions);

			// 检查结果是否有效
			if (!result || !result.quotes || result.quotes.length === 0) {
				throw new Error(`无法找到${validSymbol}的图表数据`);
			}

			const formattedData = result.quotes.map((quote) => ({
				...quote,
				dateFormatted: formatDate(quote.date, range),
			}));

			const chartData = {
				meta: result.meta,
				quotes: formattedData,
				isPartialDay: false,
				quoteType: quoteType, // 添加证券类型信息
			};

			// 设置缓存时间
			let chartOtherRangeCacheTime = 60; // 默认1分钟
			if (range === '5d') chartOtherRangeCacheTime = 120; // 2分钟
			if (range === '1mo') chartOtherRangeCacheTime = 300; // 5分钟
			if (range === '3mo' || range === '6mo')
				chartOtherRangeCacheTime = 1800; // 30分钟
			if (range === '1y' || range === '5y')
				chartOtherRangeCacheTime = 3600; // 1小时

			await setCache(cacheKey, chartData, chartOtherRangeCacheTime);
			return chartData;
		}
	} catch (error) {
		console.error(`获取${symbol}图表数据失败:`, error);
		// 返回结构化的错误对象，而不是抛出错误
		return {
			error: `获取图表数据失败: ${error instanceof Error ? error.message : String(error)}`,
			errorType: 'UNKNOWN_ERROR',
			originalError:
				error instanceof Error ? error.message : String(error),
		};
	}
}
