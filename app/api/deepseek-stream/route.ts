export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';

import { cleanJsonCodeBlockMarkers } from '@/utils/json-utils';

export async function POST(req: NextRequest) {
	try {
		const {
			symbol,
			language = 'EN',
			comprehensiveData, // 接收全面的股票数据
			technicalIndicatorsData, // 接收技术指标数据
			historicalData, // 接收历史数据
		} = await req.json();

		if (!symbol) {
			return NextResponse.json(
				{ error: 'Symbol is required' },
				{ status: 400 }
			);
		}

		// 获取API密钥
		const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY_VOL_ENGINE;
		const DEEPSEEK_API_URL = process.env.DEEPSEEK_API_URL_VOL_ENGINE;
		if (!DEEPSEEK_API_KEY || !DEEPSEEK_API_URL) {
			return NextResponse.json(
				{ error: 'DeepSeek API key or URL is not configured' },
				{ status: 500 }
			);
		}

		// 创建流式响应
		const encoder = new TextEncoder();
		const stream = new ReadableStream({
			async start(controller) {
				try {
					// 发送初始消息
					controller.enqueue(
						encoder.encode(
							`data: ${JSON.stringify({
								type: 'status',
								content: `[DeepSeek-R1 671B] Analyzing ${symbol}...`,
							})}\n\n`
						)
					);

					// 准备股票数据字符串
					const stockDataString = JSON.stringify(
						comprehensiveData,
						null,
						2
					);

					// 准备技术指标数据字符串
					const technicalDataString = technicalIndicatorsData
						? JSON.stringify(technicalIndicatorsData, null, 2)
						: 'No technical indicator data available';

					// 准备历史数据字符串
					const historicalDataString = historicalData
						? JSON.stringify(historicalData, null, 2)
						: 'No historical data available';

					// 设置用户提示
					const userPrompt =
						language === 'CN'
							? `你是一个专业的股票分析师，擅长分析股票数据并提供详细的投资建议，当你回答问题时，首先用中文一步一步地思考，确保你的每一个思考步骤都是用中文表达的。然后给出你的最终答案，也必须完全用中文。你需要从多个维度对股票进行全面分析，包括技术面、基本面、行业地位、风险因素和未来展望。请确保分析深入、数据充分，并给出明确的投资建议。重要：你必须以JSON格式返回数据，不要使用markdown格式。非常重要：你的思考过程(reasoning_content)必须使用中文，这样用户才能理解你的分析思路。

请对股票代码 ${symbol} 进行全面分析，并以JSON格式返回以下结构的数据：

以下是该股票的全面数据，请在你的分析中充分利用这些数据：
${stockDataString}

以下是该股票的技术指标数据，请在技术分析中充分利用这些数据：
${technicalDataString}

以下是该股票的历史数据，请在分析中充分利用这些数据：
${historicalDataString}

请基于上述数据，进行深入分析并返回以下JSON格式的结果：

{
  "analysis": "总体分析概述，请综合考虑公司基本面、技术面、宏观环境、行业地位，给出平衡的评估",
  "companyProfile": {
    "businessModel": "公司主营业务和商业模式简介",
    "industry": "所属行业及细分市场定位",
    "globalPresence": "全球业务分布与重要市场份额",
    "keyCompetitiveAdvantages": "核心竞争优势与护城河分析"
  },
  "technicalAnalysis": {
    "priceTrend": "价格走势分析，包括近期趋势、关键突破点、支撑位和阻力位",
    "technicalIndicators": "主要技术指标分析，如RSI、MACD、移动平均线等，包括判断超买/超卖状态",
    "volume": "成交量分析及其含义，是否有异常成交量信号",
    "patterns": "重要技术形态识别，如头肩顶、双底等，及其可能的价格目标"
  },
  "fundamentalAnalysis": {
    "financials": "关键财务指标分析，包括收入、利润、利润率、现金流等，特别关注趋势变化",
    "valuation": "估值指标分析，如PE、PB、PS等，及与行业平均和历史水平的比较",
    "growth": "公司增长潜力和可持续性评估，包括有机增长和并购前景",
    "balance": "资产负债状况和财务健康度评估，包括债务结构和偿债能力",
    "cashFlow": "现金流质量分析，包括运营现金流、自由现金流及资本分配策略",
    "dividendPolicy": "股息政策分析，包括可持续性和增长前景"
  },
  "industryAnalysis": {
    "position": "公司在行业中的市场份额和竞争优势，相对于主要竞争对手的优劣势",
    "trends": "行业整体发展趋势、创新方向和颠覆风险",
    "competitors": "主要竞争对手分析及相对表现，行业整合趋势",
    "cycle": "当前行业所处周期阶段及前景展望"
  },
  "insiderActivity": {
    "insiderTrading": "内部人士交易情况分析",
    "institutionalHoldings": "机构持股变动趋势",
    "shortInterest": "做空情况分析",
    "buybacksAndDilution": "回购与稀释情况"
  },
  "macroEnvironment": {
    "economicFactors": "影响该公司的宏观经济因素分析",
    "policyChanges": "相关政策变化及潜在影响",
    "geopolitical": "地缘政治风险评估"
  },
  "riskFactors": {
    "market": "与整体市场相关的风险因素",
    "industry": "与行业相关的特定风险",
    "company": "与公司自身相关的特定风险",
    "regulatory": "可能影响公司的监管变化或政策风险"
  },
  "catalysts": {
    "nearTerm": "未来3-6个月可能影响股价的关键事件",
    "longTerm": "影响长期价值的战略因素"
  },
  "marketSentiment": {
    "analystConsensus": "分析师观点汇总",
    "retailSentiment": "散户投资者情绪评估",
    "newsFlow": "近期新闻报道的总体倾向"
  },
  "recommendations": [
    "具体投资建议1（包括入场点位和止损策略）",
    "具体投资建议2",
    "具体投资建议3",
    "具体投资建议4"
  ],
  "priceTargets": {
    "shortTerm": "3个月内预测价格及依据，包括可能的波动范围",
    "midTerm": "6-12个月预测价格及依据",
    "longTerm": "1-3年预测价格及依据"
  },
  "sentiment": "整体投资情绪，必须是以下三种之一：positive、neutral、negative"
}

分析要求：
1. 保持客观中立，避免无依据的乐观或悲观偏见
2. 使用最新数据，明确考虑信息时效性
3. 对相互矛盾的信息进行辨析与整合
4. 识别可能的误导信息，提供批判性视角
5. 考虑多种可能情景，避免过度确定性预测
6. 关注异常值与反常现象，寻找隐藏信息
7. 权衡风险与回报，提供平衡视角

请确保返回的是有效的JSON格式，不要包含任何额外的文本、解释或markdown格式。`
							: `You are a professional stock analyst skilled at analyzing stock data and providing detailed investment advice. Please think and answer all questions completely in English. When you answer questions, first think step by step in English, ensuring that each of your thought steps is expressed in English. Then give your final answer, which must also be completely in English. You need to comprehensively analyze stocks from multiple dimensions, including technical analysis, fundamentals, industry position, risk factors, and future outlook. Please ensure your analysis is in-depth, data-rich, and provides clear investment recommendations. Important: You must return data in JSON format, not in markdown format. Very important: Your thinking process (reasoning_content) must be in English so users can understand your analytical approach.

Please provide a comprehensive analysis of the stock with symbol ${symbol} and return the data in the following JSON structure.

Here is the comprehensive data for this stock. Please use this data extensively in your analysis:
${stockDataString}

Here is the technical indicators data for this stock. Please use this data extensively in your technical analysis:
${technicalDataString}

Based on the above data, please conduct a thorough analysis and return your findings in the following JSON format:

{
  "analysis": "Overall analysis summary, considering fundamentals, technicals, macroeconomic environment, and industry positioning",
  "companyProfile": {
    "businessModel": "Core business model and main products/services overview",
    "industry": "Industry classification and segment positioning",
    "globalPresence": "Global operations distribution and key markets",
    "keyCompetitiveAdvantages": "Core competitive advantages and moat analysis"
  },
  "technicalAnalysis": {
    "priceTrend": "Price trend analysis, including recent trends, key breakout points, support and resistance levels",
    "technicalIndicators": "Analysis of key technical indicators such as RSI, MACD, moving averages, including overbought/oversold conditions",
    "volume": "Volume analysis and its implications, including any abnormal volume signals",
    "patterns": "Identification of important technical patterns such as head and shoulders, double bottoms, etc., and their price targets"
  },
  "fundamentalAnalysis": {
    "financials": "Analysis of key financial metrics including revenue, profit, margins, cash flow, etc., with emphasis on trends",
    "valuation": "Analysis of valuation metrics such as PE, PB, PS, etc., compared to industry averages and historical levels",
    "growth": "Assessment of company growth potential and sustainability, including organic growth and acquisition prospects",
    "balance": "Assessment of company assets, liabilities, and financial health, including debt structure and solvency",
    "cashFlow": "Cash flow quality analysis, including operating cash flow, free cash flow and capital allocation strategy",
    "dividendPolicy": "Dividend policy analysis, including sustainability and growth prospects"
  },
  "industryAnalysis": {
    "position": "Company's market share and competitive advantages in the industry, strengths and weaknesses relative to major competitors",
    "trends": "Overall industry development trends, innovation directions and disruption risks",
    "competitors": "Analysis of main competitors and relative performance, industry consolidation trends",
    "cycle": "Current stage of the industry cycle and outlook"
  },
  "insiderActivity": {
    "insiderTrading": "Insider transactions analysis",
    "institutionalHoldings": "Institutional ownership trend analysis",
    "shortInterest": "Short interest analysis",
    "buybacksAndDilution": "Share repurchases and dilution assessment"
  },
  "macroEnvironment": {
    "economicFactors": "Macroeconomic factors affecting the company",
    "policyChanges": "Relevant policy changes and potential impacts",
    "geopolitical": "Geopolitical risk assessment"
  },
  "riskFactors": {
    "market": "Risk factors related to the overall market",
    "industry": "Specific risks related to the industry",
    "company": "Specific risks related to the company itself",
    "regulatory": "Regulatory changes or policy risks that may affect the company"
  },
  "catalysts": {
    "nearTerm": "Key events that could impact stock price in the next 3-6 months",
    "longTerm": "Strategic factors affecting long-term value"
  },
  "marketSentiment": {
    "analystConsensus": "Summary of analyst opinions",
    "retailSentiment": "Retail investor sentiment assessment",
    "newsFlow": "Recent news coverage tone and impact"
  },
  "recommendations": [
    "Specific investment recommendation 1 (including entry points and stop-loss strategy)",
    "Specific investment recommendation 2",
    "Specific investment recommendation 3",
    "Specific investment recommendation 4"
  ],
  "priceTargets": {
    "shortTerm": "3-month price forecast and rationale, including potential volatility range",
    "midTerm": "6-12 month price forecast and rationale",
    "longTerm": "1-3 year price forecast and rationale"
  },
  "sentiment": "Overall investment sentiment, must be one of the following: positive, neutral, negative"
}

Analysis requirements:
1. Maintain objectivity and neutrality, avoiding unsubstantiated optimism or pessimism
2. Use the most current data available, clearly considering information timeliness
3. Analyze and integrate conflicting information
4. Identify potential misleading information, providing critical perspective
5. Consider multiple possible scenarios, avoiding excessive certainty in predictions
6. Pay attention to anomalies and unusual phenomena, looking for hidden information
7. Balance risk and reward, providing a balanced perspective

Please ensure that the response is in valid JSON format without any additional text, explanations, or markdown formatting.`;

					// 调用DeepSeek API启用流式传输
					const response = await fetch(DEEPSEEK_API_URL, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
						},
						body: JSON.stringify({
							model: 'bot-20250320120605-8gd66', // 部署的联网版DeepSeek-R1 Model
							stream: true,
							messages: [
								{
									role: 'user',
									content: userPrompt,
								},
							],
							reasoning_language:
								language === 'CN' ? '中文' : 'English',
							language: language === 'CN' ? '中文' : 'English',
							response_format: {
								type: 'json_object',
							},
							temperature: 0.6,
						}),
					});

					if (!response.ok) {
						throw new Error(
							`DeepSeek API error: ${response.status}`
						);
					}

					// 处理流式响应
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

						// Convert chunk to text
						buffer += new TextDecoder().decode(value, {
							stream: true,
						});

						// Process complete messages in buffer
						const lines = buffer.split('\n');
						buffer = lines.pop() || '';

						for (const line of lines) {
							if (line.trim() === '') continue;
							if (!line.startsWith('data:')) continue;

							const data = line.slice(5).trim();
							if (data === '[DONE]') continue;

							try {
								const json = JSON.parse(data);

								// Add defensive coding to handle potential structure differences
								// Check for delta in different potential response formats
								if (
									json.choices &&
									json.choices[0] &&
									json.choices[0].delta
								) {
									const delta = json.choices[0].delta;

									// Check if reasoning_content exists
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

									// Check if content exists
									if (delta.content) {
										// 使用工具函数清除JSON标记
										const contentToSend =
											cleanJsonCodeBlockMarkers(
												delta.content,
												true // 启用激进清理模式
											);

										accumulatedContent += contentToSend;
										controller.enqueue(
											encoder.encode(
												`data: ${JSON.stringify({
													type: 'content',
													content: contentToSend,
												})}\n\n`
											)
										);
									}
								}
								// Alternative response format handling (for debugging)
								else {
									console.log(
										'Unexpected response format:',
										JSON.stringify(json).slice(0, 200)
									);

									// You could try to extract content from other potential formats
									// For example, if the response has a direct content field:
									if (json.content) {
										// 使用工具函数清除JSON标记
										const contentToSend =
											cleanJsonCodeBlockMarkers(
												json.content,
												true // 启用激进清理模式
											);

										accumulatedContent += contentToSend;
										controller.enqueue(
											encoder.encode(
												`data: ${JSON.stringify({
													type: 'content',
													content: contentToSend,
												})}\n\n`
											)
										);
									}
								}
							} catch (error) {
								console.error(
									'Error parsing SSE message:',
									error,
									'Raw data:',
									data.slice(0, 100)
								);
							}
						}
					}

					// Also modify the final data parsing part to be more robust:
					try {
						let finalData = {};
						try {
							// Through debugging, first log the accumulated content to see its structure
							console.log(
								'Accumulated content length:',
								accumulatedContent.length
							);
							if (accumulatedContent.length > 0) {
								console.log(
									'Content preview:',
									accumulatedContent.slice(0, 100)
								);
							}

							// Clean up accumulated content
							let contentToProcess = accumulatedContent.trim();

							// If there's no content, provide a fallback
							if (!contentToProcess) {
								throw new Error(
									'No content accumulated from the stream'
								);
							}

							// 使用工具函数清除可能的代码块标记
							contentToProcess = cleanJsonCodeBlockMarkers(
								contentToProcess,
								true
							);

							// Trim excess whitespace
							contentToProcess = contentToProcess.trim();

							// Try to parse as JSON, with additional error handling
							if (contentToProcess) {
								try {
									finalData = JSON.parse(contentToProcess);
								} catch (jsonError) {
									console.error(
										'JSON parse error:',
										jsonError
									);
									console.log(
										'Failed JSON content:',
										contentToProcess
									);

									// Try to recover by finding valid JSON within the content
									const possibleJsonMatch =
										contentToProcess.match(/\{[\s\S]*\}/);
									if (possibleJsonMatch) {
										try {
											finalData = JSON.parse(
												possibleJsonMatch[0]
											);
											console.log(
												'Recovered JSON from partial content'
											);
										} catch (recoveryError) {
											console.error(
												'Recovery attempt failed:',
												recoveryError
											);
											throw jsonError; // Re-throw the original error
										}
									} else {
										throw jsonError;
									}
								}
							} else {
								throw new Error(
									'Empty content after processing'
								);
							}
						} catch (error) {
							console.error(
								'Error parsing final content as JSON:',
								error
							);
							// Fallback to basic structure
							finalData = {
								analysis:
									accumulatedContent ||
									'Analysis unavailable due to processing error.',
								recommendations: [],
								sentiment: 'neutral',
							};
						}

						controller.enqueue(
							encoder.encode(
								`data: ${JSON.stringify({
									type: 'complete',
									content: finalData,
									thinking: cleanJsonCodeBlockMarkers(
										accumulatedThinking,
										true // 启用激进清理模式
									),
								})}\n\n`
							)
						);
					} catch (error) {
						console.error('Error sending final message:', error);
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
