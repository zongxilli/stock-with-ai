'use server';

// Mock data for OpenAI response
const mockOpenAIData = {
	success: true,
	data: {
		analysis:
			"This stock has shown strong performance over the past quarter with increasing revenue and profit margins. Technical indicators suggest a bullish trend in the short term, with potential resistance at $185. The company's recent product announcements and expansion plans could drive further growth.",
		recommendations: [
			'Consider adding to position if the stock dips below $160',
			'Watch for upcoming earnings announcement on April 15th',
			'Set a stop loss at $152 to protect against downside risk',
		],
		sentiment: 'positive',
	},
};

// Mock data for DeepSeek sequential thinking
const mockDeepSeekData = {
	success: true,
	data: {
		sequentialThinking: [
			{
				step: 1,
				title: 'Analyzing Recent Price Movements',
				content:
					'Looking at the recent price chart, we can see a clear uptrend over the past 3 months with higher lows and higher highs. Volume has been increasing on up days and decreasing on down days, which is bullish. The 50-day moving average is now acting as support.',
			},
			{
				step: 2,
				title: 'Examining Financial Metrics',
				content:
					'Q1 earnings showed revenue growth of 18% YoY and EPS growth of 22%. Gross margins improved by 2.5 percentage points to 42.3%. The company has a strong balance sheet with $4.2B in cash and only $1.5B in debt.',
			},
			{
				step: 3,
				title: 'Evaluating Industry Position',
				content:
					'The company holds approximately 24% market share in its core business, up from 21% last year. Their new product line is showing strong initial adoption rates. Competitors are struggling to match their technology advantage in key areas.',
			},
			{
				step: 4,
				title: 'Forecasting Future Performance',
				content:
					'Given the strong fundamentals, technical setup, and improving market position, the stock appears positioned for continued growth. However, broader market volatility and sector rotation risks could create short-term headwinds.',
			},
		],
		analysis:
			"After careful analysis of technical indicators, financial performance, and market position, this stock appears to have strong bullish potential in the medium term. The company's improving fundamentals, expanding market share, and innovative product pipeline provide solid growth drivers.",
		recommendations: [
			'Consider a phased buying approach at current levels',
			'Watch for support at the 50-day moving average ($158) for adding positions',
			'Set a price target of $195 within the next 3-6 months',
			'Monitor Q2 earnings closely for continued margin improvements',
		],
		sentiment: 'positive',
	},
};

export async function getAIAnalysis(symbol: string, model: string) {
	try {
		console.log(`AI Assistant called for ${symbol} using ${model}`);

		// Simulate network delay
		await new Promise((resolve) => setTimeout(resolve, 1000));

		// Return different response based on model
		if (model === 'deepseek') {
			return mockDeepSeekData;
		} else {
			// Default to OpenAI response
			return mockOpenAIData;
		}
	} catch (error) {
		console.error('AI Assistant error:', error);
		throw new Error('Failed to get AI analysis');
	}
}
