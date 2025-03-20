'use server';

import { getStockChartData } from '@/app/actions/yahoo/get-stock-chart-data';
import { getStockRealTimeData } from '@/app/actions/yahoo/get-stock-realtime-data';
import { DeepSeekModel } from '@/app/types/deepseek';

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

		// Fetch Yahoo Finance data for the stock
		const [stockData, chartData1d, chartData1mo, chartData3mo, chartData1y] = await Promise.all([
			getStockRealTimeData(symbol),
			getStockChartData(symbol, '1d'),
			getStockChartData(symbol, '1mo'),
			getStockChartData(symbol, '3mo'),
			getStockChartData(symbol, '1y')
		]);

		// Simulate network delay
		await new Promise((resolve) => setTimeout(resolve, 1000));

		// Use actual DeepSeek API
		const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY_VOL_ENGINE;

		try {
			// Prepare Yahoo Finance data string for inclusion in the prompt
			const yahooDataString = stockData ? JSON.stringify(stockData, null, 2) : 'No data available';
			
			// Prepare chart data summaries
			const chartDataSummary = {
				'1d': chartData1d ? {
					meta: chartData1d.meta,
					quotes: chartData1d.quotes.length > 20 ? 
						[...chartData1d.quotes.slice(0, 10), ...chartData1d.quotes.slice(-10)] : 
						chartData1d.quotes
				} : 'No 1-day chart data available',
				'1mo': chartData1mo ? {
					meta: chartData1mo.meta,
					quotes: chartData1mo.quotes.length > 20 ? 
						[...chartData1mo.quotes.slice(0, 10), ...chartData1mo.quotes.slice(-10)] : 
						chartData1mo.quotes
				} : 'No 1-month chart data available',
				'3mo': chartData3mo ? {
					meta: chartData3mo.meta,
					quotes: chartData3mo.quotes.length > 20 ? 
						[...chartData3mo.quotes.slice(0, 10), ...chartData3mo.quotes.slice(-10)] : 
						chartData3mo.quotes
				} : 'No 3-month chart data available',
				'1y': chartData1y ? {
					meta: chartData1y.meta,
					quotes: chartData1y.quotes.length > 20 ? 
						[...chartData1y.quotes.slice(0, 10), ...chartData1y.quotes.slice(-10)] : 
						chartData1y.quotes
				} : 'No 1-year chart data available'
			};
			
			const chartDataString = JSON.stringify(chartDataSummary, null, 2);

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

以下是从Yahoo Finance获取的该股票的实时数据，请在你的分析中充分利用这些数据：
${yahooDataString}

以下是该股票的历史价格数据，包括1天、1个月、3个月和1年的时间范围，请在你的技术分析中充分利用这些数据：
${chartDataString}

请基于上述数据，返回以下JSON格式的分析结果：

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
			return {
				success: false,
				error: 'Failed to get AI analysis',
			};
		}
	} catch (error) {
		console.error('Error in getAIAnalysis:', error);
		return {
			success: false,
			error: 'Failed to get AI analysis',
		};
	}
}
