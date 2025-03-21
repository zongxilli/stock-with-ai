'use server';

import yahooFinance from 'yahoo-finance2';

import { getCache, setCache } from '@/lib/redis';

// 获取股票的全面数据（优化版本）
export async function getComprehensiveStockData(symbol: string) {
	try {
		// 参数验证
		if (!symbol || typeof symbol !== 'string' || symbol.trim() === '') {
			throw new Error('必须提供有效的股票代码');
		}

		// 标准化股票代码
		const normalizedSymbol = symbol.trim().toUpperCase();

		// 尝试从Redis缓存获取数据
		const cacheKey = `stock_comprehensive:${normalizedSymbol}`;

		try {
			const cachedData = await getCache(cacheKey);
			if (cachedData) {
				console.log(`返回缓存的综合数据: ${normalizedSymbol}`);
				return cachedData;
			}
		} catch (cacheError) {
			// 缓存错误不应该阻止继续获取新数据
			console.warn(
				`无法获取缓存数据: ${cacheError instanceof Error ? cacheError.message : String(cacheError)}`
			);
		}

		// 核心数据请求 - 关注最关键的财务和公司数据
		const fetchPromises = [
			// 基本报价数据 - 包含当前价格、市值、成交量等
			fetchSafely(() => yahooFinance.quote(normalizedSymbol), 'quote'),

			// 详细公司信息和财务数据 - 精简模块列表，只保留最重要的
			fetchSafely(
				() =>
					yahooFinance.quoteSummary(normalizedSymbol, {
						modules: [
							'assetProfile', // 公司概况和业务描述
							'summaryDetail', // 摘要指标（PE比率、股息收益率等）
							'financialData', // 关键财务指标
							'defaultKeyStatistics', // 重要统计数据
							'balanceSheetHistory', // 资产负债表 - 重要的财务健康指标
							'cashflowStatementHistory', // 现金流量表 - 了解现金生成能力
							'incomeStatementHistory', // 利润表 - 了解盈利能力
							'earnings', // 收益数据
							'earningsTrend', // 分析师预测
							'industryTrend', // 行业趋势 - 了解行业整体情况
							'recommendationTrend', // 分析师推荐
							'upgradeDowngradeHistory', // 升降级历史 - 了解分析师观点变化
							'majorHoldersBreakdown', // 主要持股明细
							'insiderHolders', // 内部人持股 - 了解管理层信心
							'institutionOwnership', // 机构持股 - 了解机构投资者兴趣
							'calendarEvents', // 即将到来的事件（财报、分红等）
						],
					}),
				'quoteSummary'
			),

			// 市场洞察
			fetchSafely(
				() => yahooFinance.insights(normalizedSymbol),
				'insights'
			),
		];

		// 图表数据 - 只获取过去5年的数据，足够长期趋势分析
		const chartPromise = fetchSafely(
			() =>
				yahooFinance.chart(normalizedSymbol, {
					period1: new Date(
						new Date().setFullYear(new Date().getFullYear() - 2)
					),
					interval: '1wk', // 每日数据点，足够详细且有意义
				}),
			'chartData5y'
		);

		// 并行执行所有请求
		const [mainResults, chartResult] = await Promise.all([
			Promise.all(fetchPromises),
			chartPromise,
		]);

		// 将结果数组转换为便于访问的对象
		const [quoteResult, quoteSummaryResult, insightsResult] = mainResults;

		// 验证关键数据是否成功获取
		if (!quoteResult.success && !quoteSummaryResult.success) {
			throw new Error(`无法获取${normalizedSymbol}的基本股票数据`);
		}

		// 提取关键指标
		const keyMetrics = extractKeyMetrics({
			symbol: normalizedSymbol,
			quote: quoteResult.success ? quoteResult.data : null,
			quoteSummary: quoteSummaryResult.success
				? quoteSummaryResult.data
				: null,
			insights: insightsResult.success ? insightsResult.data : null,
		});

		// 裁剪quoteSummary数据以减小大小
		let trimmedQuoteSummary = null;
		if (quoteSummaryResult.success && quoteSummaryResult.data) {
			trimmedQuoteSummary = trimQuoteSummaryData(quoteSummaryResult.data);
		}

		// 构建精简的股票数据对象 - 不再包含完整的原始数据
		const optimizedData = {
			symbol: normalizedSymbol,
			// 只保留quote中的必要字段
			quote: quoteResult.success ? trimQuoteData(quoteResult.data) : null,
			// 使用裁剪后的quoteSummary
			quoteSummary: trimmedQuoteSummary,
			// 只保留insights中的关键预测
			insights: insightsResult.success
				? trimInsightsData(insightsResult.data)
				: null,
			// 移除recommendationsBySymbol
			chartData: chartResult.success
				? trimChartData(chartResult.data)
				: null,
			// 保留提取的关键指标 - 这是最重要的分析数据
			keyMetrics,
			fetchTime: new Date().toISOString(),
		};

		try {
			// 基于市场状态设置缓存时间
			const cacheTime = isMarketOpen(quoteResult.data) ? 300 : 1800; // 交易时间5分钟，非交易时间30分钟
			await setCache(cacheKey, optimizedData, cacheTime);
			console.log(`已缓存优化数据: ${normalizedSymbol} (${cacheTime}秒)`);
		} catch (cacheError) {
			console.warn(
				`无法缓存数据: ${cacheError instanceof Error ? cacheError.message : String(cacheError)}`
			);
		}

		return optimizedData;
	} catch (error) {
		console.error(`获取${symbol}全面数据失败:`, error);
		throw new Error(
			`获取全面股票数据失败: ${error instanceof Error ? error.message : String(error)}`
		);
	}
}

// 裁剪quote数据，只保留重要字段
function trimQuoteData(quoteData: any) {
	if (!quoteData) return null;

	// 保留关键价格和交易数据
	return {
		regularMarketPrice: quoteData.regularMarketPrice,
		regularMarketChange: quoteData.regularMarketChange,
		regularMarketChangePercent: quoteData.regularMarketChangePercent,
		regularMarketVolume: quoteData.regularMarketVolume,
		marketCap: quoteData.marketCap,
		fiftyTwoWeekLow: quoteData.fiftyTwoWeekLow,
		fiftyTwoWeekHigh: quoteData.fiftyTwoWeekHigh,
		shortName: quoteData.shortName,
		longName: quoteData.longName,
		symbol: quoteData.symbol,
		marketState: quoteData.marketState,
		exchange: quoteData.exchange,
		currency: quoteData.currency,
	};
}

// 裁剪quoteSummary数据，减少数据量
function trimQuoteSummaryData(summaryData: any) {
	if (!summaryData) return null;

	const trimmed: Record<string, any> = {};

	// 裁剪assetProfile，只保留关键公司信息
	if (summaryData.assetProfile) {
		trimmed.assetProfile = {
			industry: summaryData.assetProfile.industry,
			sector: summaryData.assetProfile.sector,
			website: summaryData.assetProfile.website,
			longBusinessSummary: summaryData.assetProfile.longBusinessSummary,
			fullTimeEmployees: summaryData.assetProfile.fullTimeEmployees,
			country: summaryData.assetProfile.country,
		};
	}

	// 保留summaryDetail的关键估值指标
	if (summaryData.summaryDetail) {
		trimmed.summaryDetail = {
			trailingPE: summaryData.summaryDetail.trailingPE,
			forwardPE: summaryData.summaryDetail.forwardPE,
			priceToBook: summaryData.summaryDetail.priceToBook,
			dividendYield: summaryData.summaryDetail.dividendYield,
			dividendRate: summaryData.summaryDetail.dividendRate,
			beta: summaryData.summaryDetail.beta,
			yield: summaryData.summaryDetail.yield,
		};
	}

	// 保留financialData的关键财务指标
	if (summaryData.financialData) {
		trimmed.financialData = {
			grossMargins: summaryData.financialData.grossMargins,
			profitMargins: summaryData.financialData.profitMargins,
			revenueGrowth: summaryData.financialData.revenueGrowth,
			earningsGrowth: summaryData.financialData.earningsGrowth,
			returnOnAssets: summaryData.financialData.returnOnAssets,
			returnOnEquity: summaryData.financialData.returnOnEquity,
			totalCash: summaryData.financialData.totalCash,
			totalDebt: summaryData.financialData.totalDebt,
			debtToEquity: summaryData.financialData.debtToEquity,
			currentRatio: summaryData.financialData.currentRatio,
		};
	}

	// 保留defaultKeyStatistics中的重要统计
	if (summaryData.defaultKeyStatistics) {
		trimmed.defaultKeyStatistics = {
			enterpriseValue: summaryData.defaultKeyStatistics.enterpriseValue,
			forwardEps: summaryData.defaultKeyStatistics.forwardEps,
			trailingEps: summaryData.defaultKeyStatistics.trailingEps,
			pegRatio: summaryData.defaultKeyStatistics.pegRatio,
			priceToBook: summaryData.defaultKeyStatistics.priceToBook,
			sharesOutstanding:
				summaryData.defaultKeyStatistics.sharesOutstanding,
			bookValue: summaryData.defaultKeyStatistics.bookValue,
		};
	}

	// 资产负债表 - 只保留最新一个年度的数据
	if (
		summaryData.balanceSheetHistory &&
		summaryData.balanceSheetHistory.balanceSheetStatements &&
		summaryData.balanceSheetHistory.balanceSheetStatements.length > 0
	) {
		trimmed.balanceSheetHistory = {
			balanceSheetStatements: [
				summaryData.balanceSheetHistory.balanceSheetStatements[0],
			],
		};
	}

	// 现金流 - 只保留最新一个年度的数据
	if (
		summaryData.cashflowStatementHistory &&
		summaryData.cashflowStatementHistory.cashflowStatements &&
		summaryData.cashflowStatementHistory.cashflowStatements.length > 0
	) {
		trimmed.cashflowStatementHistory = {
			cashflowStatements: [
				summaryData.cashflowStatementHistory.cashflowStatements[0],
			],
		};
	}

	// 利润表 - 只保留最新一个年度的数据
	if (
		summaryData.incomeStatementHistory &&
		summaryData.incomeStatementHistory.incomeStatementHistory &&
		summaryData.incomeStatementHistory.incomeStatementHistory.length > 0
	) {
		trimmed.incomeStatementHistory = {
			incomeStatementHistory: [
				summaryData.incomeStatementHistory.incomeStatementHistory[0],
			],
		};
	}

	// 收益和收益趋势 - 保留但可能会裁剪内部数据
	if (summaryData.earnings) {
		// 只保留最近的财务季度收益
		const financialChartTrimmed = summaryData.earnings.financialsChart
			? {
					quarterly:
						summaryData.earnings.financialsChart.quarterly?.slice(
							0,
							8
						) || [],
					yearly:
						summaryData.earnings.financialsChart.yearly?.slice(
							0,
							2
						) || [],
				}
			: null;

		trimmed.earnings = {
			financialsChart: financialChartTrimmed,
			earningsChart: summaryData.earnings.earningsChart,
		};
	}

	// 分析师推荐趋势 - 只保留最近的趋势
	if (
		summaryData.recommendationTrend &&
		summaryData.recommendationTrend.trend
	) {
		trimmed.recommendationTrend = {
			trend: summaryData.recommendationTrend.trend.slice(0, 2),
		};
	}

	// 收益趋势 - 只保留最近的几个预期
	if (summaryData.earningsTrend && summaryData.earningsTrend.trend) {
		trimmed.earningsTrend = {
			trend: summaryData.earningsTrend.trend.slice(0, 3),
		};
	}

	// 主要持股明细 - 保留完整信息，这通常不是很大
	if (summaryData.majorHoldersBreakdown) {
		trimmed.majorHoldersBreakdown = summaryData.majorHoldersBreakdown;
	}

	return trimmed;
}

// 裁剪insights数据
function trimInsightsData(insightsData: any) {
	if (!insightsData) return null;

	// 只保留关键的技术面和基本面分析
	const trimmed: Record<string, any> = {};

	if (insightsData.instrumentInfo) {
		trimmed.instrumentInfo = {
			technicalEvents: insightsData.instrumentInfo.technicalEvents,
			valuation: insightsData.instrumentInfo.valuation,
			recommendation: insightsData.instrumentInfo.recommendation,
		};
	}

	if (insightsData.recommendation) {
		trimmed.recommendation = insightsData.recommendation;
	}

	return trimmed;
}

// 裁剪图表数据
function trimChartData(chartData: any) {
	if (!chartData || !chartData.quotes) return null;

	// 保留关键的价格数据点，但移除不必要的元数据
	return {
		quotes: chartData.quotes.map((quote: any) => ({
			date: quote.date,
			open: quote.open,
			high: quote.high,
			low: quote.low,
			close: quote.close,
			volume: quote.volume,
			adjclose: quote.adjclose,
		})),
	};
}

// 安全地获取数据，包装为统一格式的结果对象
async function fetchSafely<T>(
	fetchFunction: () => Promise<T>,
	label: string
): Promise<{ success: boolean; data: T | null; error?: string }> {
	try {
		const data = await fetchFunction();
		return {
			success: true,
			data,
		};
	} catch (error) {
		console.warn(`获取${label}数据失败:`, error);
		return {
			success: false,
			data: null,
			error: error instanceof Error ? error.message : String(error),
		};
	}
}

// 判断市场当前是否开放交易
function isMarketOpen(quote: any): boolean {
	if (!quote || typeof quote !== 'object' || quote === null) return false;

	// 检查marketState属性是否存在且值为'REGULAR'
	const marketState = quote.marketState;
	if (typeof marketState !== 'string') return false;

	return marketState === 'REGULAR';
}

// 从收集的数据中提取关键指标
function extractKeyMetrics(data: any) {
	try {
		// 初始化指标对象
		const metrics: Record<string, any> = {};

		// 确保data是有效对象
		if (!data || typeof data !== 'object') {
			return metrics;
		}

		// 从quote中提取
		if (data.quote && typeof data.quote === 'object') {
			try {
				metrics.price = safeGetNumber(data.quote, 'regularMarketPrice');
				metrics.change = safeGetNumber(
					data.quote,
					'regularMarketChange'
				);
				metrics.changePercent = safeGetNumber(
					data.quote,
					'regularMarketChangePercent'
				);
				metrics.volume = safeGetNumber(
					data.quote,
					'regularMarketVolume'
				);
				metrics.marketCap = safeGetNumber(data.quote, 'marketCap');
				metrics.fiftyTwoWeekLow = safeGetNumber(
					data.quote,
					'fiftyTwoWeekLow'
				);
				metrics.fiftyTwoWeekHigh = safeGetNumber(
					data.quote,
					'fiftyTwoWeekHigh'
				);
			} catch (quoteErr) {
				console.warn('提取quote指标失败:', quoteErr);
			}
		}

		// 从quoteSummary中提取，确保路径存在
		if (data.quoteSummary && typeof data.quoteSummary === 'object') {
			try {
				// 财务指标
				if (
					data.quoteSummary.financialData &&
					typeof data.quoteSummary.financialData === 'object'
				) {
					metrics.grossMargins = safeGetNumber(
						data.quoteSummary.financialData,
						'grossMargins'
					);
					metrics.profitMargins = safeGetNumber(
						data.quoteSummary.financialData,
						'profitMargins'
					);
					metrics.revenueGrowth = safeGetNumber(
						data.quoteSummary.financialData,
						'revenueGrowth'
					);
					metrics.earningsGrowth = safeGetNumber(
						data.quoteSummary.financialData,
						'earningsGrowth'
					);
					metrics.returnOnAssets = safeGetNumber(
						data.quoteSummary.financialData,
						'returnOnAssets'
					);
					metrics.returnOnEquity = safeGetNumber(
						data.quoteSummary.financialData,
						'returnOnEquity'
					);
					metrics.totalCash = safeGetNumber(
						data.quoteSummary.financialData,
						'totalCash'
					);
					metrics.totalDebt = safeGetNumber(
						data.quoteSummary.financialData,
						'totalDebt'
					);
					metrics.debtToEquity = safeGetNumber(
						data.quoteSummary.financialData,
						'debtToEquity'
					);
				}

				// 估值指标
				if (
					data.quoteSummary.summaryDetail &&
					typeof data.quoteSummary.summaryDetail === 'object'
				) {
					metrics.peRatio = safeGetNumber(
						data.quoteSummary.summaryDetail,
						'trailingPE'
					);
					metrics.forwardPE = safeGetNumber(
						data.quoteSummary.summaryDetail,
						'forwardPE'
					);
					metrics.priceToBook = safeGetNumber(
						data.quoteSummary.summaryDetail,
						'priceToBook'
					);
					metrics.dividendYield = safeGetNumber(
						data.quoteSummary.summaryDetail,
						'dividendYield'
					);
					metrics.dividendRate = safeGetNumber(
						data.quoteSummary.summaryDetail,
						'dividendRate'
					);
				}

				// 分析师推荐
				if (
					data.quoteSummary.recommendationTrend &&
					Array.isArray(
						data.quoteSummary.recommendationTrend.trend
					) &&
					data.quoteSummary.recommendationTrend.trend.length > 0
				) {
					const latestTrend =
						data.quoteSummary.recommendationTrend.trend[0];
					if (latestTrend && typeof latestTrend === 'object') {
						metrics.analystRating = {
							strongBuy: safeGetNumber(latestTrend, 'strongBuy'),
							buy: safeGetNumber(latestTrend, 'buy'),
							hold: safeGetNumber(latestTrend, 'hold'),
							sell: safeGetNumber(latestTrend, 'sell'),
							strongSell: safeGetNumber(
								latestTrend,
								'strongSell'
							),
						};
					}
				}

				// 主要股东信息
				if (
					data.quoteSummary.majorHoldersBreakdown &&
					typeof data.quoteSummary.majorHoldersBreakdown === 'object'
				) {
					metrics.insidersPercent = safeGetNumber(
						data.quoteSummary.majorHoldersBreakdown,
						'insidersPercentHeld'
					);
					metrics.institutionsPercent = safeGetNumber(
						data.quoteSummary.majorHoldersBreakdown,
						'institutionsPercentHeld'
					);
				}

				// 收益预期
				if (
					data.quoteSummary.earningsTrend &&
					Array.isArray(data.quoteSummary.earningsTrend.trend)
				) {
					const currentQuarterTrend =
						data.quoteSummary.earningsTrend.trend.find(
							(t: any) =>
								t && typeof t === 'object' && t.period === '0q'
						);

					if (
						currentQuarterTrend &&
						currentQuarterTrend.earningsEstimate &&
						typeof currentQuarterTrend.earningsEstimate === 'object'
					) {
						metrics.earningsEstimate = {
							average: safeGetNumber(
								currentQuarterTrend.earningsEstimate,
								'avg'
							),
							low: safeGetNumber(
								currentQuarterTrend.earningsEstimate,
								'low'
							),
							high: safeGetNumber(
								currentQuarterTrend.earningsEstimate,
								'high'
							),
							growth: safeGetNumber(
								currentQuarterTrend.earningsEstimate,
								'growth'
							),
						};
					}
				}

				// 资产负债表
				if (
					data.quoteSummary.balanceSheetHistory &&
					Array.isArray(
						data.quoteSummary.balanceSheetHistory
							.balanceSheetStatements
					) &&
					data.quoteSummary.balanceSheetHistory.balanceSheetStatements
						.length > 0
				) {
					const latestBalance =
						data.quoteSummary.balanceSheetHistory
							.balanceSheetStatements[0];
					if (latestBalance && typeof latestBalance === 'object') {
						metrics.totalAssets = safeGetNumber(
							latestBalance,
							'totalAssets'
						);
						metrics.totalLiabilities = safeGetNumber(
							latestBalance,
							'totalLiabilitiesNetMinorityInterest'
						);
						metrics.totalEquity = safeGetNumber(
							latestBalance,
							'totalStockholderEquity'
						);
					}
				}

				// 现金流
				if (
					data.quoteSummary.cashflowStatementHistory &&
					Array.isArray(
						data.quoteSummary.cashflowStatementHistory
							.cashflowStatements
					) &&
					data.quoteSummary.cashflowStatementHistory
						.cashflowStatements.length > 0
				) {
					const latestCashflow =
						data.quoteSummary.cashflowStatementHistory
							.cashflowStatements[0];
					if (latestCashflow && typeof latestCashflow === 'object') {
						metrics.operatingCashflow = safeGetNumber(
							latestCashflow,
							'totalCashFromOperatingActivities'
						);
						metrics.freeCashflow = safeGetNumber(
							latestCashflow,
							'freeCashFlow'
						);
						metrics.capitalExpenditures = safeGetNumber(
							latestCashflow,
							'capitalExpenditures'
						);
					}
				}

				// 内部人持股和机构持股 - 重要但裁剪为只保留最重要的信息
				if (
					data.quoteSummary.insiderHolders &&
					Array.isArray(data.quoteSummary.insiderHolders.holders) &&
					data.quoteSummary.insiderHolders.holders.length > 0
				) {
					// 提取最重要的内部人持股信息
					metrics.topInsiders =
						data.quoteSummary.insiderHolders.holders
							.slice(0, 5) // 只取前5名
							.map((holder: any) => ({
								name: safeGetProperty(holder, 'name'),
								position: safeGetProperty(holder, 'relation'),
								shares: safeGetNumber(holder, 'positionDirect'),
								latestTransactionDate: safeGetProperty(
									holder,
									'latestTransDate'
								),
							}));
				}

				if (
					data.quoteSummary.institutionOwnership &&
					Array.isArray(
						data.quoteSummary.institutionOwnership.ownershipList
					) &&
					data.quoteSummary.institutionOwnership.ownershipList
						.length > 0
				) {
					// 提取最重要的机构持股信息
					metrics.topInstitutions =
						data.quoteSummary.institutionOwnership.ownershipList
							.slice(0, 5) // 只取前5名
							.map((owner: any) => ({
								name: safeGetProperty(owner, 'organization'),
								shares: safeGetNumber(owner, 'position'),
								value: safeGetNumber(owner, 'value'),
								pctHeld: safeGetNumber(owner, 'pctHeld'),
							}));
				}
			} catch (quoteSummaryErr) {
				console.warn('提取quoteSummary指标失败:', quoteSummaryErr);
			}
		}

		// 从insights提取
		if (data.insights && typeof data.insights === 'object') {
			try {
				if (
					data.insights.instrumentInfo &&
					data.insights.instrumentInfo.technicalEvents &&
					typeof data.insights.instrumentInfo.technicalEvents ===
						'object'
				) {
					metrics.technicalOutlook = {
						shortTerm: safeGetProperty(
							data.insights.instrumentInfo.technicalEvents,
							'shortTermOutlook'
						),
						intermediateTerm: safeGetProperty(
							data.insights.instrumentInfo.technicalEvents,
							'intermediateTermOutlook'
						),
						longTerm: safeGetProperty(
							data.insights.instrumentInfo.technicalEvents,
							'longTermOutlook'
						),
					};
				}

				if (
					data.insights.instrumentInfo &&
					data.insights.instrumentInfo.valuation &&
					typeof data.insights.instrumentInfo.valuation === 'object'
				) {
					metrics.valuationAssessment = safeGetProperty(
						data.insights.instrumentInfo,
						'valuation'
					);
				}

				if (
					data.insights.recommendation &&
					typeof data.insights.recommendation === 'object'
				) {
					metrics.researchRecommendation = safeGetProperty(
						data,
						'insights.recommendation'
					);
				}
			} catch (insightsErr) {
				console.warn('提取insights指标失败:', insightsErr);
			}
		}

		return metrics;
	} catch (error) {
		console.error('提取关键指标失败:', error);
		return {}; // 返回空对象
	}
}

// 安全地获取数字属性
function safeGetNumber(obj: any, property: string): number | null {
	try {
		if (!obj || typeof obj !== 'object' || !(property in obj)) {
			return null;
		}

		const value = obj[property];
		if (value === null || value === undefined) {
			return null;
		}

		const number = Number(value);
		return isNaN(number) ? null : number;
	} catch (error) {
		return null;
	}
}

// 安全地获取属性值
function safeGetProperty(obj: any, property: string): any {
	try {
		// 处理嵌套属性路径，例如 'a.b.c'
		if (property.includes('.')) {
			const parts = property.split('.');
			let current = obj;

			for (const part of parts) {
				if (
					!current ||
					typeof current !== 'object' ||
					!(part in current)
				) {
					return null;
				}
				current = current[part];
			}

			return current === undefined ? null : current;
		}

		// 简单属性
		if (!obj || typeof obj !== 'object' || !(property in obj)) {
			return null;
		}

		return obj[property] === undefined ? null : obj[property];
	} catch (error) {
		return null;
	}
}
