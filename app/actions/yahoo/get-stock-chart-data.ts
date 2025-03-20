'use server';

import yahooFinance from 'yahoo-finance2';

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

		// 设置查询参数
		const now = new Date();
		let period1: Date;
		let period2 = now;
		let interval = '1d';

		// 首先获取证券的基本信息，用于确定证券类型
		const quoteData = await yahooFinance.quote(symbol);

		// 检查报价数据是否有效
		if (!quoteData || !quoteData.regularMarketTime) {
			throw new Error(`无法获取${symbol}的实时市场数据`);
		}

		// 获取证券类型
		const quoteType = quoteData.quoteType || 'UNKNOWN';

		// 特殊处理1D视图
		if (range === '1d') {
			interval = '5m';

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

			// 获取交易所信息，用于确定市场时区和交易时间
			const exchangeName =
				quoteData.fullExchangeName || quoteData.exchange || '';
			const isChinaMainland =
				exchangeName.includes('Shanghai') ||
				exchangeName.includes('Shenzhen');
			const isHongKong = exchangeName.includes('Hong Kong');

			// 处理不同市场的时区差异
			let marketTimezoneOffset = 0; // 以小时为单位，相对于用户本地时区

			if (isChinaMainland || isHongKong) {
				// 根据用户的本地时区计算与中国/香港时区的小时差
				// 中国和香港在东八区 (UTC+8)
				const localOffset = new Date().getTimezoneOffset(); // 以分钟为单位，与UTC的差值
				const chinaOffset = -480; // 中国/香港是UTC+8，所以是-480分钟
				marketTimezoneOffset = (chinaOffset - localOffset) / 60;
			} else {
				// 美股市场时区调整 - 使用更保险的方法
				// 不依赖于复杂的夏令时计算，而是直接使用市场交易时间
				// 美股标准交易时间是9:30 AM - 4:00 PM ET
				// 我们直接使用这个固定时间范围，避免时区计算错误
				marketTimezoneOffset = 0; // 不使用时区偏移
			}

			// 根据时区差异调整交易日期
			if (marketTimezoneOffset !== 0) {
				// 如果市场已经闭市，而本地时间还是前一天，需要调整日期
				tradingDay.setHours(
					tradingDay.getHours() + marketTimezoneOffset
				);
			}

			// 交易时间根据证券类型设置
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
					// 根据交易所设置不同市场的交易时间
					if (isChinaMainland) {
						// 上海和深圳市场：简化为全天交易时间 9:30-15:00，中间允许空缺
						tradingStartHour = 9;
						tradingStartMinute = 30;
						tradingEndHour = 15;
						tradingEndMinute = 0;
						shouldFillMissingData = false; // 不填充数据，保留中午休市空缺
					} else if (isHongKong) {
						// 香港市场：简化为全天交易时间 9:30-16:00，中间允许空缺
						tradingStartHour = 9;
						tradingStartMinute = 30;
						tradingEndHour = 16;
						tradingEndMinute = 0;
						shouldFillMissingData = false; // 不填充数据，保留中午休市空缺
					} else {
						// 美股等其他市场保持默认设置: 9:30 AM - 4:00 PM
						tradingStartHour = 9;
						tradingStartMinute = 30;
						tradingEndHour = 16;
						tradingEndMinute = 0;
						shouldFillMissingData = true;
					}
					break;
			}

			// 交易开始时间
			period1 = new Date(tradingDay);
			period1.setHours(tradingStartHour, tradingStartMinute, 0, 0);

			// 交易结束时间
			period2 = new Date(tradingDay);
			period2.setHours(tradingEndHour, tradingEndMinute, 0, 0);

			try {
				// 查询Yahoo Finance获取交易日的数据
				const queryOptions = {
					period1,
					period2,
					interval: interval as any,
					includePrePost: false,
				};

				// 对于中国市场，使用更简单的方法获取当日数据
				if (isChinaMainland || isHongKong) {
					// 重新设置查询时间范围，使用中国时区时间
					// 需要将中国时间转换回UTC时间进行查询
					const chinaQueryDate = new Date(tradingDay);

					// 中国时间的当天0点对应的UTC时间是前一天16:00
					const utcQueryStartDate = new Date(chinaQueryDate);
					utcQueryStartDate.setHours(-8, 0, 0, 0); // 当天0点的UTC时间（减8小时）
					queryOptions.period1 = utcQueryStartDate;

					// 中国时间的第二天0点对应的UTC时间是当天16:00
					const utcQueryEndDate = new Date(chinaQueryDate);
					utcQueryEndDate.setDate(utcQueryEndDate.getDate() + 1);
					utcQueryEndDate.setHours(-8, 0, 0, 0); // 次日0点的UTC时间（减8小时）
					queryOptions.period2 = utcQueryEndDate;
				}

				const result = await yahooFinance.chart(symbol, queryOptions);

				// 检查结果是否有效
				if (!result || !result.quotes || result.quotes.length === 0) {
					throw new Error(`无法获取${symbol}的历史数据`);
				}

				// 过滤出交易时间段内的数据
				let filteredQuotes = result.quotes;
				let processedQuotes = filteredQuotes; // 初始化processedQuotes变量

				if (isChinaMainland || isHongKong) {
					// 对于中国市场，需要调整时区，Yahoo Finance返回的是UTC时间
					// 将时间调整为中国时区(UTC+8)
					const adjustedQuotes = result.quotes
						.map((quote) => {
							const utcDate = new Date(quote.date);
							// 创建一个新日期，加上8小时时区差
							const chinaDate = new Date(
								utcDate.getTime() + 8 * 60 * 60 * 1000
							);

							// 判断是否在交易时间内
							const isInTradingHours =
								(isChinaMainland &&
									((chinaDate.getHours() === 9 &&
										chinaDate.getMinutes() >= 30) ||
										(chinaDate.getHours() >= 10 &&
											chinaDate.getHours() < 15) ||
										(chinaDate.getHours() === 15 &&
											chinaDate.getMinutes() === 0))) ||
								(isHongKong &&
									((chinaDate.getHours() === 9 &&
										chinaDate.getMinutes() >= 30) ||
										(chinaDate.getHours() >= 10 &&
											chinaDate.getHours() < 16) ||
										(chinaDate.getHours() === 16 &&
											chinaDate.getMinutes() === 0)));

							return {
								...quote,
								date: chinaDate,
								isInTradingHours,
							};
						})
						.filter((quote) => quote.isInTradingHours)
						.map(({ isInTradingHours, ...quote }) => quote);

					filteredQuotes = adjustedQuotes;

					// 对中国市场也进行数据补全
					if (isMarketOpen) {
						// 创建完整的时间线
						const now = new Date();
						let timelines = [];

						// 对于中国内地市场，需要处理上午和下午两个时间段
						if (isChinaMainland) {
							// 上午时间段 9:30-11:30
							const morningStart = new Date(tradingDay);
							morningStart.setHours(9, 30, 0, 0);

							const morningEnd = new Date(tradingDay);
							morningEnd.setHours(11, 30, 0, 0);

							// 下午时间段 13:00-15:00
							const afternoonStart = new Date(tradingDay);
							afternoonStart.setHours(13, 0, 0, 0);

							const afternoonEnd = new Date(tradingDay);
							afternoonEnd.setHours(15, 0, 0, 0);

							// 根据当前时间决定生成哪些时间线
							if (now.getHours() < 12) {
								// 如果当前是上午，只生成到当前时间的上午时间线
								const currentMorningEnd = new Date(
									Math.min(
										now.getTime(),
										morningEnd.getTime()
									)
								);
								timelines.push(
									generateTradingTimeline(
										morningStart,
										currentMorningEnd
									)
								);
							} else {
								// 如果当前是下午，先完整生成上午时间线
								timelines.push(
									generateTradingTimeline(
										morningStart,
										morningEnd
									)
								);

								// 再生成到当前时间的下午时间线
								if (now.getHours() >= 13) {
									const currentAfternoonEnd = new Date(
										Math.min(
											now.getTime(),
											afternoonEnd.getTime()
										)
									);
									timelines.push(
										generateTradingTimeline(
											afternoonStart,
											currentAfternoonEnd
										)
									);
								}
							}
						}
						// 对于香港市场，也处理上午和下午两个时间段
						else if (isHongKong) {
							// 上午时间段 9:30-12:00
							const morningStart = new Date(tradingDay);
							morningStart.setHours(9, 30, 0, 0);

							const morningEnd = new Date(tradingDay);
							morningEnd.setHours(12, 0, 0, 0);

							// 下午时间段 13:00-16:00
							const afternoonStart = new Date(tradingDay);
							afternoonStart.setHours(13, 0, 0, 0);

							const afternoonEnd = new Date(tradingDay);
							afternoonEnd.setHours(16, 0, 0, 0);

							// 根据当前时间决定生成哪些时间线
							if (now.getHours() < 12) {
								// 如果当前是上午，只生成到当前时间的上午时间线
								const currentMorningEnd = new Date(
									Math.min(
										now.getTime(),
										morningEnd.getTime()
									)
								);
								timelines.push(
									generateTradingTimeline(
										morningStart,
										currentMorningEnd
									)
								);
							} else {
								// 如果当前是下午，先完整生成上午时间线
								timelines.push(
									generateTradingTimeline(
										morningStart,
										morningEnd
									)
								);

								// 再生成到当前时间的下午时间线
								if (now.getHours() >= 13) {
									const currentAfternoonEnd = new Date(
										Math.min(
											now.getTime(),
											afternoonEnd.getTime()
										)
									);
									timelines.push(
										generateTradingTimeline(
											afternoonStart,
											currentAfternoonEnd
										)
									);
								}
							}
						}

						// 将时间线合并为单一数组
						const completeTimeline = timelines.flat();

						if (completeTimeline.length > 0) {
							// 将实际数据与完整时间轴合并
							processedQuotes = mergeDataWithTimeline(
								filteredQuotes,
								completeTimeline
							);
						} else {
							processedQuotes = filteredQuotes;
						}
					} else {
						processedQuotes = filteredQuotes;
					}
				}
				// 仅对特定类型的证券填充完整交易时间点
				else if (shouldFillMissingData && isMarketOpen) {
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
					// 对于美股市场，使用更保险的方法处理时区
					if (!isChinaMainland && !isHongKong) {
						// 不直接修改时间，而是使用includePrePost参数获取完整交易时间数据
						// 然后过滤出标准交易时间内的数据
						
						// 检查是否有regularMarketTime和regularMarketHours信息
						if (quoteData.regularMarketTime) {
							const marketOpenTime = new Date(quoteData.regularMarketTime);
							// 设置为当天的9:30 AM (美股标准开盘时间)
							marketOpenTime.setHours(9, 30, 0, 0);
							
							const marketCloseTime = new Date(quoteData.regularMarketTime);
							// 设置为当天的4:00 PM (美股标准收盘时间)
							marketCloseTime.setHours(16, 0, 0, 0);
							
							// 过滤出标准交易时间内的数据
							filteredQuotes = filteredQuotes.filter(quote => {
								const quoteTime = new Date(quote.date);
								const quoteHour = quoteTime.getHours();
								const quoteMinute = quoteTime.getMinutes();
								
								// 检查是否在9:30 AM - 4:00 PM之间
								return (
									(quoteHour > 9 || (quoteHour === 9 && quoteMinute >= 30)) && 
									(quoteHour < 16 || (quoteHour === 16 && quoteMinute === 0))
								);
							});
							
							// 如果过滤后没有数据，则使用原始数据
							if (filteredQuotes.length === 0) {
								filteredQuotes = result.quotes;
								console.warn(`过滤后没有数据，使用原始数据 (${symbol})`);
							}
						}
					}
					processedQuotes = filteredQuotes;
				}

				// 添加格式化的日期字符串
				const formattedData = processedQuotes.map((quote) => ({
					...quote,
					dateFormatted: quote.date
						? formatDate(quote.date, range)
						: '',
				}));

				// 构建市场状态信息
				let marketStatusInfo = {
					isPartialDay: isMarketOpen, // 如果市场开放，说明是部分日数据
					isPreviousTradingDay:
						!isMarketOpen &&
						lastTradeDate.getDate() !== now.getDate(), // 如果市场关闭且不是今天，表示是前一交易日
					marketState: marketState,
					tradingDate: lastTradeDate.toLocaleDateString(),
					exchangeName:
						quoteData.fullExchangeName || quoteData.exchange,
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
			} catch (innerError) {
				console.error(
					`Yahoo Finance Chart API错误 (${symbol}):`,
					innerError
				);
				throw new Error(
					`未找到证券代码: ${symbol}。请检查代码并重试。`
				);
			}
		} else {
			// 对于其他时间范围的处理保持不变
			switch (range) {
				case '5d':
					period1 = new Date(now);
					period1.setDate(now.getDate() - 5);
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

			try {
				const queryOptions = {
					period1,
					period2,
					interval: interval as any,
					includePrePost: false,
				};

				const result = await yahooFinance.chart(symbol, queryOptions);

				// 检查结果是否有效
				if (!result || !result.quotes || result.quotes.length === 0) {
					throw new Error(`无法找到${symbol}的图表数据`);
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
			} catch (innerError) {
				console.error(
					`Yahoo Finance Chart API错误 (${symbol}):`,
					innerError
				);
				throw new Error(
					`未找到证券代码: ${symbol}。请检查代码并重试。`
				);
			}
		}
	} catch (error) {
		console.error(`获取${symbol}图表数据失败:`, error);
		throw new Error(
			`获取图表数据失败: ${error instanceof Error ? error.message : String(error)}`
		);
	}
}
