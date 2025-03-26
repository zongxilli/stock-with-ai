'use client';

import { useEffect, useState, useRef, JSX } from 'react';

import { Loader2 } from 'lucide-react';

import { getCompressedHistoricalDataForAnalysis } from '@/app/actions/eodhd/get-compressed-historical-data-for-analysis';
import { getCompressedTechnicalIndicatorsDataForAnalysis } from '@/app/actions/eodhd/get-compressed-technical-indicators-data-for-analysis';
import { getComprehensiveStockData } from '@/app/actions/yahoo/get-comprehensive-stock-data';
import JsonFormatter from '@/components/custom/json-formatter';
import EnhancedTextFormatter from '@/components/custom/text-formatter-enhanced';

interface SequentialThinkingStep {
	step: number;
	title: string;
	content: string;
}

interface PriceTarget {
	shortTerm?: string;
	midTerm?: string;
	longTerm?: string;
}

// 更改AIAssistantData接口为更通用的结构，以适应动态JSON
interface AIAssistantData {
	[key: string]: any;
	analysis?: string;
	recommendations?: string[];
	sentiment?: string;
	sequentialThinking?: SequentialThinkingStep[];
}

interface AIAssistantDialogProps {
	isOpen: boolean;
	onClose: () => void;
	symbol: string;
	isLoading: boolean;
	data: AIAssistantData | null;
	useStream?: boolean;
	code: string;
	exchange: string;
}

export default function AIAssistantDialog({
	isOpen,
	onClose,
	symbol,
	isLoading: initialIsLoading,
	data: initialData,
	useStream = false,
	code,
	exchange,
}: AIAssistantDialogProps) {
	const [activeTab, setActiveTab] = useState('analysis');
	const [streamData, setStreamData] = useState<AIAssistantData | null>(null);
	const [thinking, setThinking] = useState('');
	const [thinkingContent, setThinkingContent] = useState('');
	const [thinkingStatus, setThinkingStatus] = useState('');
	const [isStreaming, setIsStreaming] = useState(false);
	const [streamError, setStreamError] = useState<string | null>(null);

	// Reference for thinking process containers
	const thinkingContainerRef = useRef<HTMLDivElement>(null);
	const thinkingTabContainerRef = useRef<HTMLDivElement>(null);

	// Use either streamed data or initial data
	const data = streamData || initialData;
	const isLoading = isStreaming || initialIsLoading;

	// Handle escape key to close dialog
	useEffect(() => {
		const handleEscapeKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && isOpen) {
				onClose();
			}
		};

		document.addEventListener('keydown', handleEscapeKey);
		return () => {
			document.removeEventListener('keydown', handleEscapeKey);
		};
	}, [isOpen, onClose]);

	// Disable body scroll when dialog is open
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = '';
		}
		return () => {
			document.body.style.overflow = '';
		};
	}, [isOpen]);

	// Stream data from DeepSeek API if useStream is true
	useEffect(() => {
		if (!isOpen || !useStream || initialData) return;

		// 创建AbortController用于中止fetch请求
		const abortController = new AbortController();
		const signal = abortController.signal;
		// 跟踪请求是否已被中止
		let isAborted = false;

		const fetchStreamData = async () => {
			try {
				setIsStreaming(true);
				setThinking('');
				setStreamData(null);
				setStreamError(null);

				// Get comprehensive stock data first
				const comprehensiveData =
					await getComprehensiveStockData(symbol);

				// 检查是否有错误
				if (comprehensiveData && 'error' in comprehensiveData) {
					const errorMsg = comprehensiveData.error;
					setStreamError(`Error: ${errorMsg}`);
					setIsStreaming(false);
					return;
				}

				// 获取技术指标数据
				const technicalIndicatorsData =
					await getCompressedTechnicalIndicatorsDataForAnalysis(
						code,
						exchange,
						'6mo' // 为了token不超额，暂时只获取6个月数据
					);

				console.log(technicalIndicatorsData);

				const historicalData =
					await getCompressedHistoricalDataForAnalysis(
						code,
						exchange,
						'1y'
					);

				console.log(historicalData);

				// Add loading state feedback
				console.log(`Fetching analysis for ${symbol}...`);

				// Call the streaming API endpoint
				const response = await fetch('/api/deepseek-stream', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						symbol,
						language: 'CN',
						comprehensiveData,
						technicalIndicatorsData,
						historicalData,
					}),
					signal, // 添加abort signal以支持中止请求
				});

				if (!response.ok) {
					throw new Error(`API error: ${response.status}`);
				}

				// Process the stream
				const reader = response.body?.getReader();
				if (!reader) {
					throw new Error('Failed to get response reader');
				}

				const decoder = new TextDecoder();
				let buffer = '';

				while (true) {
					const { done, value } = await reader.read();
					if (done) break;

					// Add to buffer and process complete messages
					buffer += decoder.decode(value, { stream: true });

					// Process complete SSE messages (split by double newline)
					const lines = buffer.split('\n\n');
					buffer = lines.pop() || '';

					for (const line of lines) {
						// Skip non-data lines
						if (!line.startsWith('data:')) continue;

						try {
							// Parse the JSON data
							const dataStr = line.slice(5).trim();
							console.log(
								'Received SSE data:',
								dataStr.slice(0, 50) + '...'
							);

							const data = JSON.parse(dataStr);

							// Handle different message types
							if (data.type === 'thinking') {
								setThinking((prev) => prev + data.content);
							} else if (data.type === 'content') {
								// Add content messages to thinking process without label
								// to maintain the natural flow of thought
								setThinkingContent(
									(prev) => prev + data.content
								);
								// Just log this for debugging, content accumulates on server
								console.log('Content chunk received');
							} else if (data.type === 'status') {
								// Status updates for better UX
								console.log('Status update:', data.content);
								// Add status updates to thinking process display with a label
								setThinkingStatus(
									(prev) => prev + `\n\n${data.content}\n\n`
								);
							} else if (data.type === 'complete') {
								console.log('Received complete data');
								console.log(thinkingContent);
								// setThinkingContent('');
								// Validate that we have minimum required fields
								if (typeof data.content === 'object') {
									// Ensure minimum properties exist
									const processedData = {
										...data.content,
										analysis:
											data.content.analysis ||
											'No analysis available',
										recommendations: Array.isArray(
											data.content.recommendations
										)
											? data.content.recommendations
											: [],
										sentiment:
											data.content.sentiment || 'neutral',
									};
									setStreamData(processedData);
									// 设置streaming状态为false，确保UI切换到数据展示模式
									setIsStreaming(false);

									// 确保activeTab设置为'analysis'
									setActiveTab('analysis');
								} else {
									console.error(
										'Unexpected complete data format:',
										data
									);
									setStreamError(
										'Received unexpected data format'
									);
									setIsStreaming(false);
								}
							} else if (data.type === 'error') {
								console.error('Stream error:', data.content);
								setStreamError(data.content);
								// Add error messages to thinking process display
								setThinkingContent(
									(prev) =>
										prev + `\n\n[Error] ${data.content}\n\n`
								);
							}
						} catch (error) {
							console.error('Error parsing SSE message:', error);
							// Don't fail the whole stream for one parsing error
						}
					}
				}
			} catch (error: unknown) {
				// 处理AbortError，用户主动中止的情况
				if (error instanceof Error && error.name === 'AbortError') {
					console.log('Stream request aborted by user');
					isAborted = true;
					// 即使是用户中止，也需要重置状态，防止重新打开时出现问题
					setIsStreaming(false);
					setThinking('');
					setThinkingContent('');
					setThinkingStatus('');
				} else {
					// 仅在组件仍然挂载时更新错误状态
					console.error('Streaming error:', error);
					const errorMessage =
						error instanceof Error
							? error.message
							: 'Unknown error';
					setStreamError(errorMessage);
					setIsStreaming(false);
				}
			}
		};

		fetchStreamData();

		// 清理函数，当组件卸载或依赖项变化时调用
		return () => {
			// 始终尝试中止请求，让AbortController自己决定是否需要处理
			// 这样可以避免闭包陷阱
			if (!isAborted) {
				abortController.abort();
				console.log(
					'Aborting DeepSeek API stream connection to save token usage'
				);
			}

			// 无论如何，重置状态以便下次打开时状态干净
			setIsStreaming(false);
			setThinking('');
			setThinkingContent('');
			setThinkingStatus('');
		};
	}, [isOpen, useStream, symbol, initialData, code, exchange]); // 移除activeTab依赖

	// Auto-scroll thinking containers when content changes
	useEffect(() => {
		if ((thinking || thinkingContent) && thinkingContainerRef.current) {
			thinkingContainerRef.current.scrollTop =
				thinkingContainerRef.current.scrollHeight;
		}
		if ((thinking || thinkingContent) && thinkingTabContainerRef.current) {
			thinkingTabContainerRef.current.scrollTop =
				thinkingTabContainerRef.current.scrollHeight;
		}
	}, [thinking, thinkingContent]);

	if (!isOpen) return null;

	// 动态渲染内容的函数
	const renderContent = (content: any, depth = 0): JSX.Element => {
		if (content === null || content === undefined) {
			return <p className='text-muted-foreground'>暂无数据</p>;
		}

		// 处理字符串
		if (typeof content === 'string') {
			return <p className='text-sm'>{content}</p>;
		}

		// 处理数组
		if (Array.isArray(content)) {
			if (content.length === 0) {
				return <p className='text-muted-foreground'>暂无数据</p>;
			}

			return (
				<ul className='list-disc pl-5 space-y-2 text-sm'>
					{content.map((item, index) => (
						<li key={index}>
							{typeof item === 'object'
								? renderContent(item, depth + 1)
								: item}
						</li>
					))}
				</ul>
			);
		}

		// 处理对象
		if (typeof content === 'object') {
			return (
				<div className={`space-y-4 ${depth > 0 ? 'ml-2' : ''}`}>
					{Object.entries(content).map(([key, value]) => (
						<div key={key} className='mb-4'>
							<h3 className='font-medium mb-1 text-sm capitalize'>
								{formatKeyName(key)}
							</h3>
							{renderContent(value, depth + 1)}
						</div>
					))}
				</div>
			);
		}

		// 处理其他类型
		return <p className='text-sm'>{String(content)}</p>;
	};

	// 格式化键名，例如将camelCase转换为空格分隔的单词
	const formatKeyName = (key: string): string => {
		// 将camelCase转换为空格分隔的单词
		return key
			.replace(/([A-Z])/g, ' $1')
			.replace(/^./, (str) => str.toUpperCase());
	};

	// 过滤掉特殊键，只保留主要内容
	const getMainContent = () => {
		if (!data) return null;

		// 创建一个从数据中过滤掉我们不想展示的键的复制版本
		const filteredData = { ...data };

		// 移除thinking相关的数据，它在另一个标签页中显示
		const keysToRemove = ['sequentialThinking'];
		keysToRemove.forEach((key) => {
			if (key in filteredData) {
				delete filteredData[key];
			}
		});

		return filteredData;
	};

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
			<div
				className='bg-background rounded-lg shadow-lg p-6 w-full max-w-[60rem] max-h-[80vh] overflow-y-auto'
				onClick={(e) => e.stopPropagation()}
			>
				<div className='flex justify-between items-center mb-4'>
					<h2 className='text-xl font-semibold'>
						AI Analysis for {symbol}
					</h2>
					<button
						onClick={onClose}
						className='text-muted-foreground hover:text-foreground'
					>
						✕
					</button>
				</div>

				{isLoading ? (
					<div className='flex flex-col items-center justify-center'>
						{!thinking && (
							<>
								<Loader2 className='h-10 w-10 animate-spin text-primary mb-4' />
								<p className='text-center text-muted-foreground'>
									Analyzing {symbol} data and generating
									insights...
									<br />
									<span className='text-sm'>
										This may take a few moments
									</span>
								</p>
							</>
						)}

						{/* Display thinking process during streaming */}
						{thinking && (
							<div className='mt-6 w-full'>
								<div className='p-3 rounded-lg bg-muted border border-border'>
									<p className='text-sm text-muted-foreground mb-1'>
										{thinkingStatus}
									</p>
									<div
										ref={thinkingContainerRef}
										className='font-mono text-sm whitespace-pre-wrap overflow-y-auto max-h-[50vh] text-foreground'
									>
										{thinking && (
											<EnhancedTextFormatter
												text={thinking}
												mode='preserve-all'
											/>
										)}
										{thinkingContent && (
											<JsonFormatter
												data={thinkingContent}
												initiallyExpanded
											/>
										)}
									</div>
								</div>
							</div>
						)}
					</div>
				) : streamError ? (
					<div className='text-center text-red-500 py-4'>
						Error: {streamError}
					</div>
				) : data ? (
					<div className='space-y-4'>
						{/* 简化为只有两个标签页 */}
						<div className='flex border-b'>
							<button
								className={`px-4 py-2 font-medium text-sm ${
									activeTab === 'analysis'
										? 'border-b-2 border-primary text-primary'
										: 'text-muted-foreground hover:text-foreground'
								}`}
								onClick={() => setActiveTab('analysis')}
							>
								Analysis
							</button>
							{thinking && (
								<button
									className={`px-4 py-2 font-medium text-sm ${
										activeTab === 'thinking'
											? 'border-b-2 border-primary text-primary'
											: 'text-muted-foreground hover:text-foreground'
									}`}
									onClick={() => setActiveTab('thinking')}
								>
									Thinking Process
								</button>
							)}
						</div>

						{/* 标签页内容 */}
						<div className='pt-2'>
							{activeTab === 'analysis' && (
								<div className='space-y-6'>
									{/* 首先显示情感分析 */}
									{data.sentiment && (
										<div className='p-4 rounded-lg border mb-6'>
											<div className='text-center'>
												<span className='font-medium text-lg'>
													Overall Sentiment:{' '}
												</span>
												<span
													className={`font-bold text-lg ${
														data.sentiment.toLowerCase() ===
														'positive'
															? 'text-green-500'
															: data.sentiment.toLowerCase() ===
																  'negative'
																? 'text-red-500'
																: 'text-yellow-500'
													}`}
												>
													{data.sentiment}
												</span>
											</div>
										</div>
									)}

									{/* 然后显示主要分析内容 */}
									{data.analysis && (
										<div className='mb-6'>
											<h3 className='font-medium text-lg mb-2'>
												Summary
											</h3>
											<p className='text-sm'>
												{data.analysis}
											</p>
										</div>
									)}

									{/* 然后是推荐内容 */}
									{data.recommendations &&
										data.recommendations.length > 0 && (
											<div className='mb-6'>
												<h3 className='font-medium text-lg mb-2'>
													Recommendations
												</h3>
												<ul className='list-disc pl-5 space-y-2 text-sm'>
													{data.recommendations.map(
														(
															recommendation,
															index
														) => (
															<li key={index}>
																{recommendation}
															</li>
														)
													)}
												</ul>
											</div>
										)}

									{/* 最后递归渲染其他所有内容 */}
									{data && (
										<div className='space-y-6'>
											{Object.entries(
												getMainContent() || {}
											).map(([key, value]) => {
												// 跳过已经单独显示的字段
												if (
													[
														'analysis',
														'sentiment',
														'recommendations',
													].includes(key)
												) {
													return null;
												}

												return (
													<div
														key={key}
														className='border p-4 rounded-lg'
													>
														<h3 className='font-medium text-lg mb-3 capitalize'>
															{formatKeyName(key)}
														</h3>
														{renderContent(value)}
													</div>
												);
											})}
										</div>
									)}
								</div>
							)}

							{/* 思考过程标签页 */}
							{activeTab === 'thinking' && (
								<div className='space-y-4 text-sm'>
									<div className='p-3 rounded-lg bg-muted border border-border'>
										<h3 className='font-medium mb-2'>
											Thinking Process
										</h3>
										<div
											ref={thinkingTabContainerRef}
											className='font-mono whitespace-pre-wrap overflow-y-auto max-h-[400px] text-foreground'
										>
											{thinking ? (
												<EnhancedTextFormatter
													text={thinking}
													mode='paragraphs-only'
													className='m-4'
												/>
											) : (
												'No thinking process available.'
											)}
											{thinkingContent && (
												<JsonFormatter
													data={thinkingContent}
													initiallyExpanded
												/>
											)}
										</div>
									</div>
								</div>
							)}
						</div>
					</div>
				) : (
					<div className='text-center text-muted-foreground py-4'>
						No data available.
					</div>
				)}
			</div>
		</div>
	);
}
