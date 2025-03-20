'use server';

import { DeepSeekModel } from '@/app/types/deepseek';

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
			'After careful analysis of technical indicators, financial performance, and market position, this stock appears to have strong bullish potential in the medium term. The company\'s improving fundamentals, expanding market share, and innovative product pipeline provide solid growth drivers.',
		recommendations: [
			'Consider a phased buying approach at current levels',
			'Watch for support at the 50-day moving average ($158) for adding positions',
			'Set a price target of $195 within the next 3-6 months',
			'Monitor Q2 earnings closely for continued margin improvements',
		],
		sentiment: 'positive',
	},
};

// Helper function for parsing DeepSeek API response
function parseDeepSeekResponse(content: string) {
	try {
		// Since we're requesting JSON directly, we can try to parse it
		const jsonData = JSON.parse(content);
		
		// Ensure the response has the expected structure
		return {
			analysis: jsonData.analysis || '',
			recommendations: Array.isArray(jsonData.recommendations) ? jsonData.recommendations : [],
			sentiment: jsonData.sentiment || 'neutral',
			technicalAnalysis: jsonData.technicalAnalysis || {},
			fundamentalAnalysis: jsonData.fundamentalAnalysis || {},
			industryAnalysis: jsonData.industryAnalysis || {},
			riskFactors: jsonData.riskFactors || {},
			priceTargets: jsonData.priceTargets || {}
		};
	} catch (parseError) {
		console.error('Error parsing DeepSeek response:', parseError);
		// If JSON parsing fails, try to extract data using regex as fallback
		try {
			// Initialize the structured response object with proper typing
			const result: {
				analysis?: string;
				recommendations: string[];
				sentiment: string;
				technicalAnalysis: {
					priceTrend?: string;
					technicalIndicators?: string;
					volume?: string;
					patterns?: string;
				};
				fundamentalAnalysis: {
					financials?: string;
					valuation?: string;
					growth?: string;
					balance?: string;
				};
				industryAnalysis: {
					position?: string;
					trends?: string;
					competitors?: string;
					cycle?: string;
				};
				riskFactors: {
					market?: string;
					industry?: string;
					company?: string;
					regulatory?: string;
				};
				priceTargets: {
					shortTerm?: string;
					midTerm?: string;
					longTerm?: string;
				};
			} = {
				recommendations: [],
				sentiment: 'neutral',
				technicalAnalysis: {},
				fundamentalAnalysis: {},
				industryAnalysis: {},
				riskFactors: {},
				priceTargets: {}
			};

			// Extract first paragraph as analysis
			const firstParagraphMatch = content.match(/^([^]*?)(?=\{|技术分析|$)/i);
			if (firstParagraphMatch && firstParagraphMatch[1].trim()) {
				result.analysis = firstParagraphMatch[1].trim();
			}

			// Try to find a JSON object in the response
			const jsonMatch = content.match(/\{([^]*)\}/);
			if (jsonMatch) {
				try {
					const extractedJson = JSON.parse(`{${jsonMatch[1]}}`);
					return {
						...result,
						...extractedJson
					};
				} catch (e) {
					console.error('Failed to parse extracted JSON:', e);
				}
			}

			// Extract sentiment
			let sentiment = 'neutral';
			if (content.toLowerCase().includes('积极') || 
				content.toLowerCase().includes('正面') || 
				content.toLowerCase().includes('看涨')) {
				sentiment = 'positive';
			} else if (content.toLowerCase().includes('消极') || 
					   content.toLowerCase().includes('负面') || 
					   content.toLowerCase().includes('看跌')) {
				sentiment = 'negative';
			}
			result.sentiment = sentiment;

			// Extract recommendations
			const recommendations: string[] = [];
			const recommendationMatches = content.match(/\d+\.\s*([^\n]+)/g);
			if (recommendationMatches) {
				recommendationMatches.forEach(match => {
					const recommendation = match.replace(/^\d+\.\s*/, '').trim();
					if (recommendation) {
						recommendations.push(recommendation);
					}
				});
			}
			if (recommendations.length > 0) {
				result.recommendations = recommendations;
			}

			return result;
		} catch (fallbackError) {
			console.error('Fallback parsing also failed:', fallbackError);
			// If all parsing fails, return a basic structure
			return {
				analysis: content,
				recommendations: [],
				sentiment: 'neutral',
			};
		}
	}
}

export async function getAIAnalysis(symbol: string, model: DeepSeekModel) {
	try {
		console.log(`AI Assistant called for ${symbol}`);

		// Simulate network delay
		await new Promise((resolve) => setTimeout(resolve, 1000));

		// Use actual DeepSeek API
		const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

		if (!DEEPSEEK_API_KEY) {
			console.error('DeepSeek API key not set');
			return mockDeepSeekData;
		}

		try {
			// Build API request - use the correct API endpoint and parameter format
			const response = await fetch(
				'https://api.siliconflow.cn/v1/chat/completions',
				{
					method: 'POST',
					headers: {
						Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						model: model, // Use DeepSeek-V3 model
						messages: [
							{
								role: 'system',
								content:
									'你是一个专业的股票分析师，擅长分析股票数据并提供详细的投资建议。你需要从多个维度对股票进行全面分析，包括技术面、基本面、行业地位、风险因素和未来展望。请确保分析深入、数据充分，并给出明确的投资建议。重要：你必须以JSON格式返回数据，不要使用markdown格式。',
							},
							{
								role: 'user',
								content: `请对股票代码 ${symbol} 进行全面分析，并以JSON格式返回以下结构的数据：

{
  "analysis": "总体分析概述",
  "technicalAnalysis": {
    "priceTrend": "价格走势分析，包括近期趋势、支撑位和阻力位",
    "technicalIndicators": "主要技术指标分析，如RSI、MACD、移动平均线等",
    "volume": "成交量分析及其含义",
    "patterns": "重要技术形态识别，如头肩顶、双底等"
  },
  "fundamentalAnalysis": {
    "financials": "关键财务指标分析，包括收入、利润、利润率、现金流等",
    "valuation": "估值指标分析，如PE、PB、PS等，及与行业平均的比较",
    "growth": "公司增长潜力和可持续性评估",
    "balance": "公司资产负债状况和财务健康度评估"
  },
  "industryAnalysis": {
    "position": "公司在行业中的市场份额和竞争优势",
    "trends": "行业整体发展趋势和前景",
    "competitors": "主要竞争对手分析及相对优劣势",
    "cycle": "当前行业所处周期阶段"
  },
  "riskFactors": {
    "market": "与整体市场相关的风险因素",
    "industry": "与行业相关的特定风险",
    "company": "与公司自身相关的特定风险",
    "regulatory": "可能影响公司的监管变化或政策风险"
  },
  "recommendations": [
    "具体投资建议1",
    "具体投资建议2",
    "具体投资建议3",
    "具体投资建议4"
  ],
  "priceTargets": {
    "shortTerm": "3个月内预测价格及依据",
    "midTerm": "6-12个月预测价格及依据",
    "longTerm": "1-3年预测价格及依据"
  },
  "sentiment": "整体投资情绪，必须是以下三种之一：positive、neutral、negative"
}

请确保返回的是有效的JSON格式，不要包含任何额外的文本、解释或markdown格式。`,
							},
						],
						stream: false,
						max_tokens: 2048,
						temperature: 0.7,
						top_p: 0.7,
						top_k: 50,
					}),
				}
			);

			if (!response.ok) {
				throw new Error(`DeepSeek API error: ${response.status}`);
			}

			const data = await response.json();
			
			if (!data.choices || !data.choices[0] || !data.choices[0].message) {
				throw new Error('Invalid response format from DeepSeek API');
			}
			
			const content = data.choices[0].message.content;
			
			// Parse the response content
			const parsedData = parseDeepSeekResponse(content);
			
			return {
				success: true,
				data: parsedData
			};
		} catch (apiError) {
			console.error('Error calling DeepSeek API:', apiError);
			return mockDeepSeekData;
		}
	} catch (error) {
		console.error('Error in getAIAnalysis:', error);
		return {
			success: false,
			error: 'Failed to get AI analysis',
		};
	}
}
