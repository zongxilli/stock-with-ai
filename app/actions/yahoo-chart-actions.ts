'use server';

import yahooFinance from 'yahoo-finance2';

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

		// 特殊处理1D视图
		if (range === '1d') {
			interval = '5m';

			// 首先获取股票实时报价来检查市场状态
			const quoteData = await yahooFinance.quote(symbol);

			// 根据marketState判断市场当前状态
			// 可能的值: REGULAR(正常交易), PRE(盘前), POST(盘后), CLOSED(已关闭)
			const marketState = quoteData.marketState || 'CLOSED';
			const isMarketOpen = marketState === 'REGULAR';

			// 如果市场已关闭或不在交易中
			if (!isMarketOpen) {
				// 获取上一个交易日的数据
				try {
					// 使用Yahoo Finance的实时数据中的regularMarketTime作为最后交易时间
					const lastTradeTime = quoteData.regularMarketTime
						? new Date(quoteData.regularMarketTime)
						: new Date(); // 如果没有时间数据，使用当前时间

					// 设置查询的起止时间为上一个交易日
					const previousTradingDay = new Date(lastTradeTime);

					// 设置为当天开始
					previousTradingDay.setHours(0, 0, 0, 0);

					// 交易开始时间通常为9:30 AM EST
					period1 = new Date(previousTradingDay);
					period1.setHours(9, 30, 0, 0);

					// 交易结束时间通常为4:00 PM EST
					period2 = new Date(previousTradingDay);
					period2.setHours(16, 0, 0, 0);

					// 查询Yahoo Finance获取上一个交易日的数据
					const queryOptions = {
						period1,
						period2,
						interval: interval as any,
						includePrePost: false,
					};

					const result = await yahooFinance.chart(
						symbol,
						queryOptions
					);

					// 检查结果是否有效
					if (
						!result ||
						!result.quotes ||
						result.quotes.length === 0
					) {
						throw new Error(`无法获取${symbol}的历史数据`);
					}

					// 生成完整的交易时间点
					const completeTimeline = generateTradingTimeline(
						period1,
						period2
					);

					// 将实际数据与完整时间轴合并
					const mergedData = mergeDataWithTimeline(
						result.quotes,
						completeTimeline
					);

					// 添加格式化的日期字符串
					const formattedData = mergedData.map((quote) => ({
						...quote,
						dateFormatted: quote.date
							? formatDate(quote.date, range)
							: '',
					}));

					// 返回图表元数据和处理后的报价数据
					const chartData = {
						meta: result.meta,
						quotes: formattedData,
						isPartialDay: false, // 这是完整的前一交易日数据
						isPreviousTradingDay: true, // 标记这是前一个交易日的数据
						tradingDate: previousTradingDay.toLocaleDateString(), // 添加交易日期信息
					};

					// 缓存设置 - 非交易时段可以缓存更长时间
					await setCache(cacheKey, chartData, 300); // 5分钟缓存

					return chartData;
				} catch (previousDayError) {
					console.error(
						`获取${symbol}前一交易日数据失败:`,
						previousDayError
					);
					throw new Error(
						`无法获取${symbol}的前一交易日数据。市场目前未开盘，请稍后再试或查看其他时间范围的数据。`
					);
				}
			}

			// 以下是正常交易时段的处理逻辑
			// 使用基于当前时间的默认交易时间
			// 为避免属性访问错误，不再直接访问currentTradingPeriod
			let marketOpenTime: Date;
			let marketCloseTime: Date;

			// 设置今天的开盘时间 (通常是9:30 AM 东部时间)
			marketOpenTime = new Date(now);
			marketOpenTime.setHours(9, 30, 0, 0);

			// 设置今天的收盘时间 (通常是4:00 PM 东部时间)
			marketCloseTime = new Date(now);
			marketCloseTime.setHours(16, 0, 0, 0);

			// 使用regularMarketTime作为当前交易日的参考
			if (quoteData.regularMarketTime) {
				const marketDate = new Date(quoteData.regularMarketTime);

				// 只更新日期部分，保持时间部分不变
				marketOpenTime.setFullYear(
					marketDate.getFullYear(),
					marketDate.getMonth(),
					marketDate.getDate()
				);
				marketCloseTime.setFullYear(
					marketDate.getFullYear(),
					marketDate.getMonth(),
					marketDate.getDate()
				);
			}

			period1 = marketOpenTime;

			// 如果当前时间已经超过收盘时间，则使用收盘时间作为period2
			if (now > marketCloseTime) {
				period2 = marketCloseTime;
			}

			// 生成完整的交易时间点
			const completeTimeline = generateTradingTimeline(period1, period2);

			try {
				// 正常查询Yahoo Finance获取可用数据
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

				// 将实际数据与完整时间轴合并
				const mergedData = mergeDataWithTimeline(
					result.quotes,
					completeTimeline
				);

				// 添加格式化的日期字符串
				const formattedData = mergedData.map((quote) => ({
					...quote,
					dateFormatted: quote.date
						? formatDate(quote.date, range)
						: '',
				}));

				// 返回图表元数据和处理后的报价数据
				const chartData = {
					meta: result.meta,
					quotes: formattedData,
					isPartialDay: now < marketCloseTime, // 标记是否是交易中的部分日数据
					isPreviousTradingDay: false, // 这是当前交易日数据
				};

				// 缓存设置 - 为1D视图设置较短缓存时间
				await setCache(cacheKey, chartData, 60); // 1分钟缓存

				return chartData;
			} catch (innerError) {
				console.error(
					`Yahoo Finance Chart API错误 (${symbol}):`,
					innerError
				);
				throw new Error(
					`未找到股票代码: ${symbol}。请检查股票代码并重试。`
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
				};

				// 设置缓存时间
				let cacheTime = 60; // 默认1分钟
				if (range === '5d') cacheTime = 120; // 2分钟
				if (range === '1mo') cacheTime = 300; // 5分钟
				if (range === '3mo' || range === '6mo') cacheTime = 1800; // 30分钟
				if (range === '1y' || range === '5y') cacheTime = 3600; // 1小时

				await setCache(cacheKey, chartData, cacheTime);
				return chartData;
			} catch (innerError) {
				console.error(
					`Yahoo Finance Chart API错误 (${symbol}):`,
					innerError
				);
				throw new Error(
					`未找到股票代码: ${symbol}。请检查股票代码并重试。`
				);
			}
		}
	} catch (error) {
		console.error(`获取股票${symbol}图表数据失败:`, error);
		throw new Error(
			`获取股票图表数据失败: ${error instanceof Error ? error.message : String(error)}`
		);
	}
}

// 格式化日期显示
function formatDate(date: Date, range: string): string {
	if (range === '1d') {
		// 对于1天数据，只显示时:分
		return date.toLocaleTimeString([], {
			hour: '2-digit',
			minute: '2-digit',
		});
	} else if (range === '5d') {
		// 对于5天数据，显示MM/DD HH:MM格式
		const day = date.getDate().toString().padStart(2, '0');
		const month = (date.getMonth() + 1).toString().padStart(2, '0');
		const hours = date.getHours().toString().padStart(2, '0');
		const minutes = date.getMinutes().toString().padStart(2, '0');

		// 对于X轴标签，只返回MM/DD格式
		return `${month}/${day} ${hours}:${minutes}`;
	} else if (range === '1mo' || range === '3mo') {
		// 对于中期数据，显示月/日
		return date.toLocaleDateString([], {
			month: 'numeric',
			day: 'numeric',
		});
	} else {
		// 对于长期数据，显示年/月
		return date.toLocaleDateString([], { year: 'numeric', month: 'short' });
	}
}

// 生成完整的交易时间轴（9:30 AM - 4:00 PM，每5分钟一个点）
function generateTradingTimeline(marketOpen: Date, marketClose: Date): Date[] {
	const timeline: Date[] = [];
	const current = new Date(marketOpen);

	while (current <= marketClose) {
		timeline.push(new Date(current));
		current.setMinutes(current.getMinutes() + 5); // 每5分钟一个点
	}

	return timeline;
}

// 将实际数据与完整时间轴合并
function mergeDataWithTimeline(actualData: any[], timeline: Date[]): any[] {
	// 创建时间到数据的映射
	const dataMap = new Map();
	actualData.forEach((item) => {
		dataMap.set(item.date.getTime(), item);
	});

	// 创建完整数据集，对于没有实际数据的时间点，使用null值
	return timeline.map((time) => {
		const timeKey = time.getTime();
		if (dataMap.has(timeKey)) {
			return dataMap.get(timeKey);
		} else {
			return {
				date: new Date(time),
				open: null,
				high: null,
				low: null,
				close: null,
				volume: null,
			};
		}
	});
}
