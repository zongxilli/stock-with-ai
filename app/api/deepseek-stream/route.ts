export const runtime = process.env.NODE_ENV === 'development' ? 'nodejs' : 'edge';

import { NextRequest, NextResponse } from 'next/server';

// export const maxDuration = 60; // 1分钟超时
// export const dynamic = 'force-dynamic'; // 禁用静态优化

export async function POST(req: NextRequest) {
	try {
		const { 
			symbol, 
			language = 'EN',
			stockData, // Receive stockData from request
			chartData  // Receive chartData from request
		} = await req.json();

		if (!symbol) {
			return NextResponse.json(
				{ error: 'Symbol is required' },
				{ status: 400 }
			);
		}

		// Get API key from environment variables
		const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY_VOL_ENGINE;
		const DEEPSEEK_API_URL = process.env.DEEPSEEK_API_URL_VOL_ENGINE;
		if (!DEEPSEEK_API_KEY || !DEEPSEEK_API_URL) {
			return NextResponse.json(
				{ error: 'DeepSeek API key or URL is not configured' },
				{ status: 500 }
			);
		}

		// No need to fetch data as it's now provided in the request
		// Use the provided data directly
		const chartData1d = chartData['1d'];
		const chartData1mo = chartData['1mo'];
		const chartData3mo = chartData['3mo'];
		const chartData1y = chartData['1y'];

		// Create a streaming response
		const encoder = new TextEncoder();
		const stream = new ReadableStream({
			async start(controller) {
				try {
					// Send initial message
					controller.enqueue(
						encoder.encode(
							`data: ${JSON.stringify({
								type: 'status',
								content: `Analyzing ${symbol}...`,
							})}\n\n`
						)
					);

					// Set system prompt and user prompt based on language
					const systemPrompt =
						language === 'CN'
							? '你是一个专业的股票分析师，擅长分析股票数据并提供详细的投资建议。你需要从多个维度对股票进行全面分析，包括技术面、基本面、行业地位、风险因素和未来展望。请确保分析深入、数据充分，并给出明确的投资建议。重要：你必须以JSON格式返回数据，不要使用markdown格式。'
							: 'You are a professional stock analyst skilled at analyzing stock data and providing detailed investment advice. You need to comprehensively analyze stocks from multiple dimensions, including technical analysis, fundamentals, industry position, risk factors, and future outlook. Please ensure your analysis is in-depth, data-rich, and provides clear investment recommendations. Important: You must return data in JSON format, not in markdown format.';

					// Prepare Yahoo Finance data string for inclusion in the prompt
					const yahooDataString = stockData
						? JSON.stringify(stockData, null, 2)
						: 'No data available';

					// Prepare chart data summaries
					const chartDataSummary = {
						'1d': chartData1d
							? {
									meta: chartData1d.meta,
									quotes:
										chartData1d.quotes.length > 20
											? [
													...chartData1d.quotes.slice(
														0,
														10
													),
													...chartData1d.quotes.slice(
														-10
													),
												]
											: chartData1d.quotes,
								}
							: 'No 1-day chart data available',
						'1mo': chartData1mo
							? {
									meta: chartData1mo.meta,
									quotes:
										chartData1mo.quotes.length > 20
											? [
													...chartData1mo.quotes.slice(
														0,
														10
													),
													...chartData1mo.quotes.slice(
														-10
													),
												]
											: chartData1mo.quotes,
								}
							: 'No 1-month chart data available',
						'3mo': chartData3mo
							? {
									meta: chartData3mo.meta,
									quotes:
										chartData3mo.quotes.length > 20
											? [
													...chartData3mo.quotes.slice(
														0,
														10
													),
													...chartData3mo.quotes.slice(
														-10
													),
												]
											: chartData3mo.quotes,
								}
							: 'No 3-month chart data available',
						'1y': chartData1y
							? {
									meta: chartData1y.meta,
									quotes:
										chartData1y.quotes.length > 20
											? [
													...chartData1y.quotes.slice(
														0,
														10
													),
													...chartData1y.quotes.slice(
														-10
													),
												]
											: chartData1y.quotes,
								}
							: 'No 1-year chart data available',
					};

					const chartDataString = JSON.stringify(
						chartDataSummary,
						null,
						2
					);

					const userPrompt =
						language === 'CN'
							? `请对股票代码 ${symbol} 进行全面分析，并以JSON格式返回以下结构的数据：

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

请确保返回的是有效的JSON格式，不要包含任何额外的文本、解释或markdown格式。`
							: `Please provide a comprehensive analysis of the stock with symbol ${symbol} and return the data in the following JSON structure.

Here is the real-time data from Yahoo Finance for this stock. Please use this data extensively in your analysis:
${yahooDataString}

Here is the historical price data for the stock, including 1-day, 1-month, 3-month, and 1-year timeframes. Please use this data extensively in your technical analysis:
${chartDataString}

Based on the above data, please return your analysis in the following JSON format:

{
  "analysis": "Overall analysis summary",
  "technicalAnalysis": {
    "priceTrend": "Price trend analysis, including recent trends, support and resistance levels",
    "technicalIndicators": "Analysis of key technical indicators such as RSI, MACD, moving averages, etc.",
    "volume": "Volume analysis and its implications",
    "patterns": "Identification of important technical patterns such as head and shoulders, double bottoms, etc."
  },
  "fundamentalAnalysis": {
    "financials": "Analysis of key financial metrics including revenue, profit, margins, cash flow, etc.",
    "valuation": "Analysis of valuation metrics such as PE, PB, PS, etc., and comparison with industry averages",
    "growth": "Assessment of company growth potential and sustainability",
    "balance": "Assessment of company assets, liabilities, and financial health"
  },
  "industryAnalysis": {
    "position": "Company's market share and competitive advantages in the industry",
    "trends": "Overall industry development trends and prospects",
    "competitors": "Analysis of main competitors and relative strengths and weaknesses",
    "cycle": "Current stage of the industry cycle"
  },
  "riskFactors": {
    "market": "Risk factors related to the overall market",
    "industry": "Specific risks related to the industry",
    "company": "Specific risks related to the company itself",
    "regulatory": "Regulatory changes or policy risks that may affect the company"
  },
  "recommendations": [
    "Specific investment recommendation 1",
    "Specific investment recommendation 2",
    "Specific investment recommendation 3",
    "Specific investment recommendation 4"
  ],
  "priceTargets": {
    "shortTerm": "3-month price forecast and rationale",
    "midTerm": "6-12 month price forecast and rationale",
    "longTerm": "1-3 year price forecast and rationale"
  },
  "sentiment": "Overall investment sentiment, must be one of the following: positive, neutral, negative"
}

Please ensure that the response is in valid JSON format without any additional text, explanations, or markdown formatting.`;

					// Call DeepSeek API with streaming enabled
					const response = await fetch(DEEPSEEK_API_URL, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
						},
						body: JSON.stringify({
							model: 'bot-20250320120605-8gd66', // 我部署的联网版DeepSeek-R1 Model
							stream: true,
							messages: [
								{
									role: 'system',
									content: systemPrompt,
								},
								{
									role: 'user',
									content: userPrompt,
								},
							],
							reasoning_language: language === 'CN' ? 'zh' : 'en', // Set reasoning language based on selected language
						}),
					});

					if (!response.ok) {
						throw new Error(
							`DeepSeek API error: ${response.status}`
						);
					}

					// Process the streaming response
					const reader = response.body?.getReader();
					if (!reader) {
						throw new Error('Failed to get response reader');
					}

					let accumulatedContent = '';
					let accumulatedThinking = '';
					let buffer = '';

					while (true) {
						const { done, value } = await reader.read();
						if (done) break;

						// Convert the chunk to text
						buffer += new TextDecoder().decode(value, {
							stream: true,
						});

						// Process complete messages in the buffer
						const lines = buffer.split('\n');
						buffer = lines.pop() || '';

						for (const line of lines) {
							if (line.trim() === '') continue;
							if (!line.startsWith('data:')) continue;

							const data = line.slice(5).trim();
							if (data === '[DONE]') continue;

							try {
								const json = JSON.parse(data);
								const delta = json.choices[0]?.delta;

								if (delta) {
									// Check for reasoning content (thinking process)
									if (delta.reasoning_content) {
										accumulatedThinking +=
											delta.reasoning_content;
										controller.enqueue(
											encoder.encode(
												`data: ${JSON.stringify({
													type: 'thinking',
													content:
														delta.reasoning_content,
												})}\n\n`
											)
										);
									}

									// Check for regular content
									if (delta.content) {
										accumulatedContent += delta.content;
										controller.enqueue(
											encoder.encode(
												`data: ${JSON.stringify({
													type: 'content',
													content: delta.content,
												})}\n\n`
											)
										);
									}
								}
							} catch (error) {
								console.error(
									'Error parsing SSE message:',
									error
								);
							}
						}
					}

					// Send a final message with the complete data
					try {
						let finalData = {};
						try {
							// Clean up the accumulated content by removing markdown code block markers
							let contentToProcess = accumulatedContent.trim();

							// Remove opening markdown code blocks if present
							if (
								contentToProcess.startsWith('```json') ||
								contentToProcess.startsWith('```')
							) {
								contentToProcess = contentToProcess.replace(
									/^```(json)?/,
									''
								);
							}

							// Remove closing markdown code blocks if present
							if (contentToProcess.endsWith('```')) {
								contentToProcess = contentToProcess.replace(
									/```$/,
									''
								);
							}

							// Trim any extra whitespace after removing markers
							contentToProcess = contentToProcess.trim();

							// Try to parse the cleaned content as JSON
							finalData = JSON.parse(contentToProcess);
						} catch (error) {
							console.error(
								'Error parsing final content as JSON:',
								error
							);
							// If parsing fails, use a basic structure
							finalData = {
								analysis: accumulatedContent,
								recommendations: [],
								sentiment: 'neutral',
							};
						}

						controller.enqueue(
							encoder.encode(
								`data: ${JSON.stringify({
									type: 'complete',
									content: finalData,
									thinking: accumulatedThinking,
								})}\n\n`
							)
						);
					} catch (error) {
						console.error('Error sending final message:', error);
					}
				} catch (error) {
					console.error('Stream processing error:', error);
					controller.enqueue(
						encoder.encode(
							`data: ${JSON.stringify({
								type: 'error',
								content:
									error instanceof Error
										? error.message
										: 'Unknown error',
							})}\n\n`
						)
					);
				} finally {
					controller.close();
				}
			},
		});

		return new NextResponse(stream, {
			headers: {
				'Content-Type': 'text/event-stream',
				'Cache-Control': 'no-cache',
				Connection: 'keep-alive',
			},
		});
	} catch (error) {
		console.error('API route error:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
