export const runtime = 'edge';

import { NextRequest, NextResponse } from 'next/server';

import { getJsonResponsePrompt } from './get-json-response-prompt';
import { getProvideDataPrompt } from './get-provide-data-prompt';
import { getSystemPrompt } from './get-system-prompt';

import { cleanJsonCodeBlockMarkers } from '@/utils/json-utils';

export async function POST(req: NextRequest) {
	try {
		const {
			symbol,
			language = 'EN',
			comprehensiveData, // 接收全面的股票数据
			technicalIndicatorsData, // 接收技术指标数据
			historicalData, // 接收历史数据
			mainIndexesHistoricalData, // 接收主要指数历史数据
			newsData, // 接收新闻数据
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
						? historicalData
						: 'No historical data available';

					// 准备主要指数历史数据字符串
					const mainIndexesHistoricalDataString =
						mainIndexesHistoricalData
							? mainIndexesHistoricalData
							: 'No main indexes historical data available';

					// 准备新闻数据字符串
					const newsDataString = newsData
						? JSON.stringify(newsData, null, 2)
						: 'No news data available';

					// 设置用户提示
					const userPrompt = `
					${getSystemPrompt(language)}
					${getProvideDataPrompt(
						language,
						symbol,
						stockDataString,
						technicalDataString,
						historicalDataString,
						mainIndexesHistoricalDataString,
						newsDataString
					)}
					${getJsonResponsePrompt(language)}
          `;

					// console  log 出 prompt 的 长度
					console.log('Prompt length:', userPrompt.length);

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
							thinking_language:
								language === 'CN' ? '中文' : 'English',
							response_format: {
								type: 'json_object',
							},
							temperature: 0.3, // 降低随机性
							top_p: 0.9,
							frequency_penalty: 0.5, // 减少重复
							presence_penalty: 0.3,
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
