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

			// 详细公司信息和财务数据 - 保留所有重要的财务报表和股东信息
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

			// 相关股票推荐
			fetchSafely(
				() => yahooFinance.recommendationsBySymbol(normalizedSymbol),
				'recommendationsBySymbol'
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
		const [
			quoteResult,
			quoteSummaryResult,
			insightsResult,
			recommendationsResult,
		] = mainResults;

		// 验证关键数据是否成功获取
		if (!quoteResult.success && !quoteSummaryResult.success) {
			throw new Error(`无法获取${normalizedSymbol}的基本股票数据`);
		}

		// 处理结果为干净的对象
		const processedData = {
			symbol: normalizedSymbol,
			quote: quoteResult.success ? quoteResult.data : null,
			quoteSummary: quoteSummaryResult.success
				? quoteSummaryResult.data
				: null,
			insights: insightsResult.success ? insightsResult.data : null,
			recommendationsBySymbol: recommendationsResult.success
				? recommendationsResult.data
				: null,
			chartData: {
				'5y': chartResult.success ? chartResult.data : null,
			},
			fetchTime: new Date().toISOString(),
		};

		// 提取关键指标以便于访问
		const keyMetrics = extractKeyMetrics(processedData);

		// 构建全面的股票数据对象
		const comprehensiveData = {
			...processedData,
			keyMetrics,
		};

		try {
			// 基于市场状态设置缓存时间
			const cacheTime = isMarketOpen(processedData.quote) ? 300 : 1800; // 交易时间5分钟，非交易时间30分钟
			await setCache(cacheKey, comprehensiveData, cacheTime);
			console.log(`已缓存综合数据: ${normalizedSymbol} (${cacheTime}秒)`);
		} catch (cacheError) {
			// 缓存错误不应该阻止返回获取的数据
			console.warn(
				`无法缓存数据: ${cacheError instanceof Error ? cacheError.message : String(cacheError)}`
			);
		}

		return comprehensiveData;
	} catch (error) {
		console.error(`获取${symbol}全面数据失败:`, error);
		throw new Error(
			`获取全面股票数据失败: ${error instanceof Error ? error.message : String(error)}`
		);
	}
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

				// 内部人持股和机构持股 - 添加更多详细信息
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
