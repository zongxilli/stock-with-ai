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

			// 获取今天的日期并检查是否是交易日
			const isWeekend = now.getDay() === 0 || now.getDay() === 6; // 0是周日，6是周六

			// 获取今天的开盘时间 (通常是9:30 AM 东部时间)
			const marketOpen = new Date(now);
			marketOpen.setHours(9, 30, 0, 0);

			// 获取今天的收盘时间 (通常是4:00 PM 东部时间)
			const marketClose = new Date(now);
			marketClose.setHours(16, 0, 0, 0);

			// 检查当前是否在交易时段
			const isMarketHours =
				now >= marketOpen && now <= marketClose && !isWeekend;

			// 如果当前不在交易时段，尝试获取最近一个交易日的数据
			if (!isMarketHours) {
				// 如果是周末或已过收盘时间，获取最近一个交易日的完整数据
				try {
					// 在周一获取上周五的数据；周六、周日获取上周五的数据；交易日收盘后获取当天的数据
					let previousTradingDay = new Date(now);

					if (isWeekend) {
						// 找到上一个周五
						const daysToSubtract = now.getDay() === 0 ? 2 : 1; // 周日减2天，周六减1天
						previousTradingDay.setDate(
							now.getDate() - daysToSubtract
						);
					} else if (now > marketClose) {
						// 当天已收盘，使用当天数据
						previousTradingDay.setHours(0, 0, 0, 0); // 设置为当天开始
					} else if (now < marketOpen) {
						// 当天未开盘，使用前一个交易日数据
						previousTradingDay.setDate(now.getDate() - 1);

						// 如果前一天是周末，继续向前找
						const previousDay = previousTradingDay.getDay();
						if (previousDay === 0) {
							// 如果是周日
							previousTradingDay.setDate(
								previousTradingDay.getDate() - 2
							); // 获取周五数据
						} else if (previousDay === 6) {
							// 如果是周六
							previousTradingDay.setDate(
								previousTradingDay.getDate() - 1
							); // 获取周五数据
						}
					}

					// 设置查询的起止时间为上一个交易日的开盘到收盘
					period1 = new Date(previousTradingDay);
					period1.setHours(9, 30, 0, 0);

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

			// 以下是正常交易时段的处理逻辑，保持原样
			// 设置period1为今天的开盘时间
			period1 = marketOpen;

			// 如果当前时间已经超过收盘时间，则使用收盘时间作为period2
			if (now > marketClose) {
				period2 = marketClose;
			} else {
				// 否则使用当前时间作为period2
				period2 = now;
			}

			// 生成完整的交易时间点
			const completeTimeline = generateTradingTimeline(
				marketOpen,
				marketClose
			);

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
					isPartialDay: now < marketClose, // 标记是否是交易中的部分日数据
					isPreviousTradingDay: false, // 这是当前交易日数据
				};

				// 缓存设置 - 根据需要调整
				// 为1D视图设置较长缓存时间，因为我们已经单独获取实时价格数据
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
