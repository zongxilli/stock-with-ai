const JSON_EN = {
	// Independent sentiment indicator
	sentiment: 'POSITIVE, NEUTRAL, or NEGATIVE',

	// Comprehensive summary paragraph - single field to encourage depth
	summary:
		'Provide a comprehensive analysis (at least 300 words) of the company and its stock. Cover relevant business aspects, key technical patterns, current market position, volume analysis, and overall technical outlook. Include specific price levels, major support/resistance zones, and explain what recent price action and indicators suggest about future movement and why.',

	// Technical analysis with cause-effect relationships
	technicalOutlook: {
		currentTrend:
			'Detailed explanation of the current price trend including direction, strength, and duration. Analyze what technical indicators confirm this trend and any warning signs of potential reversal. Explain WHY the price is behaving this way based on technical evidence.',

		volumePriceAnalysis:
			'In-depth analysis of volume and price relationship. Identify significant volume patterns, divergences, or anomalies and explain what they reveal about the strength of price movements. Discuss how institutional money flow is likely influencing the stock based on volume patterns.',

		keyLevels: {
			supports: [
				{
					price: 0,
					significance:
						'Detailed explanation of why this is a critical support level (historical bounces, volume profile, moving averages, round number psychology, etc.) and what specific price action would confirm a breakdown',
				},
				{
					price: 0,
					significance:
						'Detailed explanation of why this is a critical support level and what specific price action would confirm a breakdown',
				},
				{
					price: 0,
					significance:
						'Detailed explanation of why this is a critical support level and what specific price action would confirm a breakdown',
				},
			],
			resistances: [
				{
					price: 0,
					significance:
						'Detailed explanation of why this is a critical resistance level (historical rejections, institutional selling, trendlines, Fibonacci levels, etc.) and what specific price action would confirm a breakout',
				},
				{
					price: 0,
					significance:
						'Detailed explanation of why this is a critical resistance level and what specific price action would confirm a breakout',
				},
				{
					price: 0,
					significance:
						'Detailed explanation of why this is a critical resistance level and what specific price action would confirm a breakout',
				},
			],
		},
	},

	// Detailed trading scenarios with cause-effect logic
	scenarios: {
		bullishScenario: {
			trigger:
				'Detailed description of precise market conditions that would confirm a bullish outlook. Include specific price levels, volume requirements, indicator readings, or pattern completions that would trigger this scenario.',

			tradingStrategy:
				'Comprehensive step-by-step trading plan if this scenario unfolds. Include EXACTLY when to enter, where to place stops, how to manage the position as it develops, and specific exit strategies. Clearly explain WHY each action is recommended based on technical principles.',
		},

		bearishScenario: {
			trigger:
				'Detailed description of precise market conditions that would confirm a bearish outlook. Include specific price levels, volume requirements, indicator readings, or pattern completions that would trigger this scenario.',

			priceTargets: [
				{
					price: 0,
					rationale:
						'Technical justification for this target and estimated timeframe',
				},
			],

			tradingStrategy:
				'Comprehensive step-by-step trading plan if this scenario unfolds. Include EXACTLY when to enter, where to place stops, how to manage the position as it develops, and specific exit strategies. Clearly explain WHY each action is recommended based on technical principles.',
		},
	},

	// Specific action plan
	actionPlan: {
		immediateRecommendation:
			'Clear, decisive directive on what action to take right now based on current price and indicators. Specify exact entry price (or price range), stop loss level with percentage risk, and multiple profit targets with technical justification for each. If no immediate action is warranted, provide specific price trigger points that would warrant action (e.g., "Buy if price breaks above $X with volume exceeding Y shares" or "Sell if price drops below $Z with RSI under 30").',

		riskManagement:
			'Detailed risk control strategy including ideal position sizing relative to account (specific percentage), maximum risk per trade (specific percentage), and exact criteria for adjusting position. Include precise instructions for trailing stops (e.g., "Move stop to breakeven after price reaches $X", "Trail stop below the 20-day moving average once price exceeds $Y"). Provide specific scenarios for when to add to the position and when to exit regardless of profit/loss.',
	},
};

// Chinese version
const JSON_CN = {
	// 独立的情绪指标
	sentiment: 'POSITIVE, NEUTRAL, 或 NEGATIVE',

	// 全面的摘要段落 - 单一字段以鼓励深度
	summary:
		'提供对公司及其股票的全面分析（至少300字）。涵盖相关业务方面、关键技术形态、当前市场位置、成交量分析和整体技术前景。包括具体价格水平、主要支撑/阻力区域，并解释最近的价格行为和指标对未来走势的暗示及原因。',

	// 技术分析与因果关系
	technicalOutlook: {
		currentTrend:
			'详细解释当前价格趋势，包括方向、强度和持续时间。分析哪些技术指标确认这一趋势以及任何潜在反转的警告信号。基于技术证据解释价格为何会这样表现。',

		volumePriceAnalysis:
			'对成交量和价格关系的深入分析。识别重要的成交量模式、背离或异常，并解释它们揭示了什么关于价格走势的强度。讨论机构资金流如何基于成交量模式可能影响股票。',

		keyLevels: {
			supports: [
				{
					price: 0,
					significance:
						'详细解释为什么这是关键支撑位（历史反弹、成交量分布、移动均线、整数心理位等）以及什么具体价格行为会确认突破',
				},
				{
					price: 0,
					significance:
						'详细解释为什么这是关键支撑位以及什么具体价格行为会确认突破',
				},
				{
					price: 0,
					significance:
						'详细解释为什么这是关键支撑位以及什么具体价格行为会确认突破',
				},
			],
			resistances: [
				{
					price: 0,
					significance:
						'详细解释为什么这是关键阻力位（历史拒绝、机构抛售、趋势线、斐波那契水平等）以及什么具体价格行为会确认突破',
				},
				{
					price: 0,
					significance:
						'详细解释为什么这是关键阻力位以及什么具体价格行为会确认突破',
				},
				{
					price: 0,
					significance:
						'详细解释为什么这是关键阻力位以及什么具体价格行为会确认突破',
				},
			],
		},
	},

	// 具有因果逻辑的详细交易情景
	scenarios: {
		bullishScenario: {
			trigger:
				'详细描述会确认看涨前景的精确市场条件。包括会触发这种情景的特定价格水平、成交量要求、指标读数或形态完成。',

			specificActions: {
				entry: '指定精确的入场价格或价格范围，并提供详细理由。包括所需的任何成交量或指标确认。如果给出范围，解释激进与保守入场的条件。',

				stopLoss:
					'提供精确的初始止损价格和风险百分比。基于技术因素解释为什么这个特定水平是合适的（例如，在支撑位下方，在摆动低点下方，在移动平均线下方）。',

				profitTargets: [
					{
						level: '第一个获利目标价格',
						rationale: '这个水平的技术依据以及退出多少百分比的仓位',
					},
					{
						level: '第二个获利目标价格',
						rationale: '这个水平的技术依据以及退出多少百分比的仓位',
					},
					{
						level: '最终获利目标价格',
						rationale: '这个水平的技术依据以及何时退出剩余仓位',
					},
				],

				positionManagement:
					'管理交易发展的详细指示。包括跟踪止损的特定价格水平（例如，"当价格达到X时将止损移至保本位置"，"在价格超过Z后，在每个新的更高低点下方Y点设置跟踪止损"）。准确解释何时调整仓位大小及原因。',
			},
		},

		bearishScenario: {
			trigger:
				'详细描述会确认看跌前景的精确市场条件。包括会触发这种情景的特定价格水平、成交量要求、指标读数或形态完成。',

			specificActions: {
				entry: '指定精确的入场价格或价格范围，并提供详细理由。包括所需的任何成交量或指标确认。如果给出范围，解释激进与保守入场的条件。',

				stopLoss:
					'提供精确的初始止损价格和风险百分比。基于技术因素解释为什么这个特定水平是合适的（例如，在阻力位上方，在摆动高点上方，在移动平均线上方）。',

				profitTargets: [
					{
						level: '第一个获利目标价格',
						rationale: '这个水平的技术依据以及退出多少百分比的仓位',
					},
					{
						level: '第二个获利目标价格',
						rationale: '这个水平的技术依据以及退出多少百分比的仓位',
					},
					{
						level: '最终获利目标价格',
						rationale: '这个水平的技术依据以及何时退出剩余仓位',
					},
				],

				positionManagement:
					'管理交易发展的详细指示。包括跟踪止损的特定价格水平（例如，"当价格达到X时将止损移至保本位置"，"在价格跌破Z后，在每个新的更低高点上方Y点设置跟踪止损"）。准确解释何时调整仓位大小及原因。',
			},
		},
	},

	// 具体行动计划
	actionPlan: {
		immediateRecommendation:
			'基于当前价格和指标，对现在应采取什么行动的明确、果断的指示。指定确切的入场价格（或价格范围）、止损水平及其风险百分比，以及多个获利目标，并为每个提供技术依据。如果不建议立即行动，提供会触发行动的具体价格点（例如，"如果价格在成交量超过Y股的情况下突破$X则买入"或"如果价格在RSI低于30的情况下跌破$Z则卖出"）。',

		riskManagement:
			'详细的风险控制策略，包括相对于账户的理想仓位大小（具体百分比）、每笔交易的最大风险（具体百分比），以及调整仓位的确切标准。包括跟踪止损的精确指示（例如，"当价格达到$X后将止损移至保本位置"，"一旦价格超过$Y，在20日移动平均线下方设置跟踪止损"）。提供何时增加仓位和何时无论盈亏都退出的具体情景。',
	},
};

export const getJsonResponsePrompt = (language: 'EN' | 'CN') => {
	const requestPrompt =
		language === 'EN'
			? `Based on the provided market data, conduct a comprehensive technical analysis of this stock. Focus on providing a detailed summary that explains both the company background and current technical position. Analyze the trend and volume-price relationship in depth, identifying at least three crucial support and resistance levels. Explain precisely WHY each level is significant based on historical price action, volume profile, technical indicators or other factors.

Most importantly, develop detailed bullish and bearish scenarios with clear cause-effect reasoning (if X occurs, then Y will likely follow) and specific trading instructions for each case. Rather than providing general price targets, give exact entry points, stop loss levels, and multiple profit-taking levels with specific reasoning for each. Your analysis should include concrete price levels where actions should be taken.

Be thorough in your explanations - I want to understand exactly WHY you've reached each conclusion based on technical evidence and what specific actions I should take at different price points. Don't just tell me what might happen - tell me exactly what to do when it happens and why.

Return your analysis in the following JSON format:`
			: `基于提供的市场数据，对该股票进行全面的技术分析。重点提供详细摘要，解释公司背景和当前技术位置。深入分析趋势和量价关系，识别至少三个关键支撑位和阻力位。准确解释每个水平基于历史价格行为、成交量分布、技术指标或其他因素为何重要。

最重要的是，制定详细的看涨和看跌情景，包含清晰的因果推理（如果发生X，那么Y很可能会跟随）以及每种情况下的具体交易指示。不要提供一般的价格目标，而是给出确切的入场点、止损水平和多个获利水平，并为每个提供具体理由。您的分析应包括应采取行动的具体价格水平。

在解释中要彻底 - 我想准确理解您基于技术证据为何得出每个结论，以及在不同价格点我应采取哪些具体行动。不要只告诉我可能会发生什么 - 告诉我当它发生时我应该确切做什么以及为什么。

请以以下JSON格式返回您的分析：`;

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
