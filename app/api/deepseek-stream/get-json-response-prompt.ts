const JSON_CN = {
	// 总体分析概述
	analysis: '考虑基本面、技术面、宏观环境和行业定位的整体分析总结',

	// 公司概况
	companyProfile: {
		businessModel: '核心业务模式和主要产品/服务概述',
		industry: '行业分类和细分市场定位',
		globalPresence: '全球业务分布和关键市场',
		keyCompetitiveAdvantages: '核心竞争优势和护城河分析',
	},

	// 技术分析部分
	technicalAnalysis: {
		priceTrend: '价格趋势分析，包括最近趋势、关键突破点、支撑位和阻力位',
		keyLevels: {
			supports: [
				{
					price: 0,
					reasons: ['支撑位原因1', '支撑位原因2', '支撑位原因3'],
				},
				{
					price: 0,
					reasons: ['支撑位原因1', '支撑位原因2', '支撑位原因3'],
				},
				{
					price: 0,
					reasons: ['支撑位原因1', '支撑位原因2', '支撑位原因3'],
				},
			],
			resistances: [
				{
					price: 0,
					reasons: ['阻力位原因1', '阻力位原因2', '阻力位原因3'],
				},
				{
					price: 0,
					reasons: ['阻力位原因1', '阻力位原因2', '阻力位原因3'],
				},
				{
					price: 0,
					reasons: ['阻力位原因1', '阻力位原因2', '阻力位原因3'],
				},
			],
		},
		indicators: {
			rsi: '相对强弱指标分析，包括超买/超卖状态和背离情况',
			macd: 'MACD指标分析，金叉死叉和趋势确认',
			movingAverages: '均线分析，包括关键均线的支撑阻力作用',
			bollingerBands: '布林带分析，包括带宽、压缩和通道突破',
			atr: '平均真实波幅分析，波动率及止损设置建议',
			adx: '平均方向指数分析，趋势强度及持续性',
			cci: '顺势指标分析，超买超卖及反转信号',
			stochastic: '随机指标分析，动量和超买超卖条件',
			sar: '抛物线转向指标分析，趋势方向和反转点',
			dmi: '方向运动指标分析，多空力量对比',
			volatility: '波动率分析，市场波动性评估及风险度量',
			stochasticRSI: 'RSI随机指标分析，RSI值的波动性和反转信号',
		},
		volume: {
			trend: '成交量趋势分析，与价格趋势的匹配度',
			anomalies: '异常成交量信号及其可能原因',
			averageVolume: '不同时间框架的平均成交量对比',
			obv: '能量潮指标(OBV)分析，累积/分配情况',
			priceVolumeRelationship: '价量关系分析，成交量和价格变动的相互验证',
		},
		patterns: {
			candlestick: '蜡烛图形态识别，如锤子、吞没、星线等',
			chart: '图表形态识别，如头肩顶/底、双顶/双底、三角形等',
			harmonic: '调和形态识别，如蝴蝶、蝙蝠、螃蟹等',
			fibonacci: '斐波那契回调和延伸水平分析',
			gapAnalysis: '跳空缺口分析及其含义',
			priceTargets: '基于形态和指标的价格目标预测',
		},
		marketBreadth: {
			advanceDecline: '上涨/下跌股票比例及市场广度指标',
			sectorPerformance: '相关行业板块表现对个股影响',
			marketIndex: '大盘指数对个股的影响分析',
		},
	},

	// 基本面分析
	fundamentalAnalysis: {
		financials:
			'关键财务指标分析，包括收入、利润、利润率、现金流等，重点关注趋势',
		valuation: '估值指标分析，如PE、PB、PS等，与行业平均值和历史水平比较',
		growth: '公司增长潜力和可持续性评估，包括有机增长和并购前景',
		balance: '公司资产、负债和财务健康状况评估，包括债务结构和偿付能力',
		cashFlow: '现金流质量分析，包括经营现金流、自由现金流和资本配置策略',
		dividendPolicy: '股息政策分析，包括可持续性和增长前景',
	},

	// 行业分析
	industryAnalysis: {
		position:
			'公司在行业中的市场份额和竞争优势，相对于主要竞争对手的优势和劣势',
		trends: '整体行业发展趋势、创新方向和颠覆风险',
		competitors: '主要竞争对手分析和相对表现，行业整合趋势',
		cycle: '行业周期的当前阶段和展望',
	},

	// 内部活动
	insiderActivity: {
		insiderTrading: '内部交易分析',
		institutionalHoldings: '机构持股趋势分析',
		shortInterest: '空头兴趣分析',
		buybacksAndDilution: '股票回购和稀释评估',
	},

	// 宏观环境
	macroEnvironment: {
		economicFactors: '影响公司的宏观经济因素',
		policyChanges: '相关政策变化及潜在影响',
		geopolitical: '地缘政治风险评估',
	},

	// 风险因素
	riskFactors: {
		market: '与整体市场相关的风险因素',
		industry: '与行业相关的特定风险',
		company: '与公司本身相关的特定风险',
		regulatory: '可能影响公司的监管变化或政策风险',
	},

	// 催化剂
	catalysts: {
		nearTerm: '未来3-6个月可能影响股价的关键事件',
		longTerm: '影响长期价值的战略因素',
	},

	// 市场情绪
	marketSentiment: {
		analystConsensus: '分析师意见摘要',
		retailSentiment: '散户投资者情绪评估',
		newsFlow: '近期新闻报道基调和影响',
	},

	// 投资建议
	recommendations: [
		'具体投资建议1（包括入场点和止损策略）',
		'具体投资建议2',
		'具体投资建议3',
		'具体投资建议4',
	],

	// 价格目标
	priceTargets: {
		shortTerm: '3个月价格预测及依据，包括潜在波动范围',
		midTerm: '6-12个月价格预测及依据',
		longTerm: '1-3年价格预测及依据',
	},

	// 整体投资情绪，必须是以下三种之一：POSITIVE、NEUTRAL、NEGATIVE
	sentiment: '整体投资情绪，必须是以下三种之一：POSITIVE、NEUTRAL、NEGATIVE',
};

const JSON_EN = {
	analysis:
		'Overall analysis summary, considering fundamentals, technicals, macroeconomic environment, and industry positioning',
	companyProfile: {
		businessModel:
			'Core business model and main products/services overview',
		industry: 'Industry classification and segment positioning',
		globalPresence: 'Global operations distribution and key markets',
		keyCompetitiveAdvantages:
			'Core competitive advantages and moat analysis',
	},
	technicalAnalysis: {
		priceTrend:
			'Price trend analysis, including recent trends, key breakout points, support and resistance levels',
		technicalIndicators:
			'Analysis of key technical indicators such as RSI, MACD, moving averages, including overbought/oversold conditions',
		volume: 'Volume analysis and its implications, including any abnormal volume signals',
		patterns:
			'Identification of important technical patterns such as head and shoulders, double bottoms, etc., and their price targets',
	},
	fundamentalAnalysis: {
		financials:
			'Analysis of key financial metrics including revenue, profit, margins, cash flow, etc., with emphasis on trends',
		valuation:
			'Analysis of valuation metrics such as PE, PB, PS, etc., compared to industry averages and historical levels',
		growth: 'Assessment of company growth potential and sustainability, including organic growth and acquisition prospects',
		balance:
			'Assessment of company assets, liabilities, and financial health, including debt structure and solvency',
		cashFlow:
			'Cash flow quality analysis, including operating cash flow, free cash flow and capital allocation strategy',
		dividendPolicy:
			'Dividend policy analysis, including sustainability and growth prospects',
	},
	industryAnalysis: {
		position:
			"Company's market share and competitive advantages in the industry, strengths and weaknesses relative to major competitors",
		trends: 'Overall industry development trends, innovation directions and disruption risks',
		competitors:
			'Analysis of main competitors and relative performance, industry consolidation trends',
		cycle: 'Current stage of the industry cycle and outlook',
	},
	insiderActivity: {
		insiderTrading: 'Insider transactions analysis',
		institutionalHoldings: 'Institutional ownership trend analysis',
		shortInterest: 'Short interest analysis',
		buybacksAndDilution: 'Share repurchases and dilution assessment',
	},
	macroEnvironment: {
		economicFactors: 'Macroeconomic factors affecting the company',
		policyChanges: 'Relevant policy changes and potential impacts',
		geopolitical: 'Geopolitical risk assessment',
	},
	riskFactors: {
		market: 'Risk factors related to the overall market',
		industry: 'Specific risks related to the industry',
		company: 'Specific risks related to the company itself',
		regulatory:
			'Regulatory changes or policy risks that may affect the company',
	},
	catalysts: {
		nearTerm:
			'Key events that could impact stock price in the next 3-6 months',
		longTerm: 'Strategic factors affecting long-term value',
	},
	marketSentiment: {
		analystConsensus: 'Summary of analyst opinions',
		retailSentiment: 'Retail investor sentiment assessment',
		newsFlow: 'Recent news coverage tone and impact',
	},
	recommendations: [
		'Specific investment recommendation 1 (including entry points and stop-loss strategy)',
		'Specific investment recommendation 2',
		'Specific investment recommendation 3',
		'Specific investment recommendation 4',
	],
	priceTargets: {
		shortTerm:
			'3-month price forecast and rationale, including potential volatility range',
		midTerm: '6-12 month price forecast and rationale',
		longTerm: '1-3 year price forecast and rationale',
	},
	sentiment:
		'Overall investment sentiment, must be one of the following: POSITIVE, NEUTRAL, NEGATIVE',
};

export const getJsonResponsePrompt = (language: 'EN' | 'CN') => {
	const requestPrompt =
		language === 'EN'
			? 'Based on the above data, please conduct a thorough analysis and return your findings in the following JSON format:'
			: '基于以上数据，请进行全面分析，并返回以下JSON格式的分析结果：';

	const jsonResponsePrompt = language === 'CN' ? JSON_CN : JSON_EN;

	return language === 'CN'
		? `
${requestPrompt}

${JSON.stringify(jsonResponsePrompt, null, 2)}
  `
		: `
${requestPrompt}

${JSON.stringify(jsonResponsePrompt, null, 2)}
  `;
};
