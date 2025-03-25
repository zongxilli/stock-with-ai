const JSON_CN = {
	analysis:
		'总体分析概述，请综合考虑公司基本面、技术面、宏观环境、行业地位，给出平衡的评估',
	companyProfile: {
		businessModel: '公司主营业务和商业模式简介',
		industry: '所属行业及细分市场定位',
		globalPresence: '全球业务分布与重要市场份额',
		keyCompetitiveAdvantages: '核心竞争优势与护城河分析',
	},
	technicalAnalysis: {
		priceTrend: '价格走势分析，包括近期趋势、关键突破点、支撑位和阻力位',
		technicalIndicators:
			'主要技术指标分析，如RSI、MACD、移动平均线等，包括判断超买/超卖状态',
		volume: '成交量分析及其含义，是否有异常成交量信号',
		patterns: '重要技术形态识别，如头肩顶、双底等，及其可能的价格目标',
	},
	fundamentalAnalysis: {
		financials:
			'关键财务指标分析，包括收入、利润、利润率、现金流等，特别关注趋势变化',
		valuation: '估值指标分析，如PE、PB、PS等，及与行业平均和历史水平的比较',
		growth: '公司增长潜力和可持续性评估，包括有机增长和并购前景',
		balance: '资产负债状况和财务健康度评估，包括债务结构和偿债能力',
		cashFlow: '现金流质量分析，包括运营现金流、自由现金流及资本分配策略',
		dividendPolicy: '股息政策分析，包括可持续性和增长前景',
	},
	industryAnalysis: {
		position:
			'公司在行业中的市场份额和竞争优势，相对于主要竞争对手的优劣势',
		trends: '行业整体发展趋势、创新方向和颠覆风险',
		competitors: '主要竞争对手分析及相对表现，行业整合趋势',
		cycle: '当前行业所处周期阶段及前景展望',
	},
	insiderActivity: {
		insiderTrading: '内部人士交易情况分析',
		institutionalHoldings: '机构持股变动趋势',
		shortInterest: '做空情况分析',
		buybacksAndDilution: '回购与稀释情况',
	},
	macroEnvironment: {
		economicFactors: '影响该公司的宏观经济因素分析',
		policyChanges: '相关政策变化及潜在影响',
		geopolitical: '地缘政治风险评估',
	},
	riskFactors: {
		market: '与整体市场相关的风险因素',
		industry: '与行业相关的特定风险',
		company: '与公司自身相关的特定风险',
		regulatory: '可能影响公司的监管变化或政策风险',
	},
	catalysts: {
		nearTerm: '未来3-6个月可能影响股价的关键事件',
		longTerm: '影响长期价值的战略因素',
	},
	marketSentiment: {
		analystConsensus: '分析师观点汇总',
		retailSentiment: '散户投资者情绪评估',
		newsFlow: '近期新闻报道的总体倾向',
	},
	recommendations: [
		'具体投资建议1（包括入场点位和止损策略）',
		'具体投资建议2',
		'具体投资建议3',
		'具体投资建议4',
	],
	priceTargets: {
		shortTerm: '3个月内预测价格及依据，包括可能的波动范围',
		midTerm: '6-12个月预测价格及依据',
		longTerm: '1-3年预测价格及依据',
	},
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
