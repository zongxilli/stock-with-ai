'use client';

import { useEffect, useState, useRef } from 'react';

import { Loader2 } from 'lucide-react';

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

interface AIAssistantData {
	analysis?: string;
	recommendations: string[];
	sentiment: string;
	sequentialThinking?: SequentialThinkingStep[];
	technicalAnalysis?: {
		priceTrend?: string;
		technicalIndicators?: string;
		volume?: string;
		patterns?: string;
	};
	fundamentalAnalysis?: {
		financials?: string;
		valuation?: string;
		growth?: string;
		balance?: string;
	};
	industryAnalysis?: {
		position?: string;
		trends?: string;
		competitors?: string;
		cycle?: string;
	};
	riskFactors?: {
		market?: string;
		industry?: string;
		company?: string;
		regulatory?: string;
	};
	priceTargets?: PriceTarget;
}

interface AIAssistantDialogProps {
	isOpen: boolean;
	onClose: () => void;
	symbol: string;
	isLoading: boolean;
	data: AIAssistantData | null;
	useStream?: boolean;
}

export default function AIAssistantDialog({
	isOpen,
	onClose,
	symbol,
	isLoading: initialIsLoading,
	data: initialData,
	useStream = false,
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
						language: 'EN',
						comprehensiveData,
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
									(prev) =>
										prev +
										`\n\n[DeepSeek R1] ${data.content}\n\n`
								);
							} else if (data.type === 'complete') {
								console.log('Received complete data');
								console.log(thinkingContent);
								// setThinkingContent('');
								// Validate that we have minimum required fields
								if (typeof data.content === 'object') {
									// Ensure minimum properties exist
									const processedData = {
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
										...data.content,
									};
									setStreamData(processedData);
									// 设置streaming状态为false，确保UI切换到数据展示模式
									setIsStreaming(false);
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
	}, [isOpen, useStream, symbol, initialData]);

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
						{/* Navigation Tabs */}
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
							<button
								className={`px-4 py-2 font-medium text-sm ${
									activeTab === 'recommendations'
										? 'border-b-2 border-primary text-primary'
										: 'text-muted-foreground hover:text-foreground'
								}`}
								onClick={() => setActiveTab('recommendations')}
							>
								Recommendations
							</button>
							<button
								className={`px-4 py-2 font-medium text-sm ${
									activeTab === 'technical'
										? 'border-b-2 border-primary text-primary'
										: 'text-muted-foreground hover:text-foreground'
								}`}
								onClick={() => setActiveTab('technical')}
							>
								Technical
							</button>
							<button
								className={`px-4 py-2 font-medium text-sm ${
									activeTab === 'fundamental'
										? 'border-b-2 border-primary text-primary'
										: 'text-muted-foreground hover:text-foreground'
								}`}
								onClick={() => setActiveTab('fundamental')}
							>
								Fundamental
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

						{/* Tab Content */}
						<div className='pt-2'>
							{activeTab === 'analysis' && (
								<div>
									{data.analysis && (
										<p className='text-sm'>
											{data.analysis}
										</p>
									)}
									<div className='mt-4 text-sm'>
										<span className='font-medium'>
											Sentiment:{' '}
										</span>
										<span
											className={
												data.sentiment === 'positive'
													? 'text-green-500'
													: data.sentiment ===
														  'negative'
														? 'text-red-500'
														: 'text-yellow-500'
											}
										>
											{data.sentiment}
										</span>
									</div>
								</div>
							)}

							{activeTab === 'recommendations' && (
								<div>
									{data.recommendations &&
									data.recommendations.length > 0 ? (
										<ul className='list-disc pl-5 space-y-2 text-sm'>
											{data.recommendations.map(
												(recommendation, index) => (
													<li key={index}>
														{recommendation}
													</li>
												)
											)}
										</ul>
									) : (
										<p className='text-muted-foreground text-sm'>
											No recommendations available.
										</p>
									)}
								</div>
							)}

							{activeTab === 'technical' && (
								<div className='space-y-4 text-sm'>
									{data.technicalAnalysis ? (
										<>
											{data.technicalAnalysis
												.priceTrend && (
												<div>
													<h3 className='font-medium mb-1'>
														Price Trend
													</h3>
													<p>
														{
															data
																.technicalAnalysis
																.priceTrend
														}
													</p>
												</div>
											)}
											{data.technicalAnalysis
												.technicalIndicators && (
												<div>
													<h3 className='font-medium mb-1'>
														Technical Indicators
													</h3>
													<p>
														{
															data
																.technicalAnalysis
																.technicalIndicators
														}
													</p>
												</div>
											)}
											{data.technicalAnalysis.volume && (
												<div>
													<h3 className='font-medium mb-1'>
														Volume Analysis
													</h3>
													<p>
														{
															data
																.technicalAnalysis
																.volume
														}
													</p>
												</div>
											)}
											{data.technicalAnalysis
												.patterns && (
												<div>
													<h3 className='font-medium mb-1'>
														Chart Patterns
													</h3>
													<p>
														{
															data
																.technicalAnalysis
																.patterns
														}
													</p>
												</div>
											)}
										</>
									) : (
										<p className='text-muted-foreground'>
											No technical analysis available.
										</p>
									)}
								</div>
							)}

							{activeTab === 'fundamental' && (
								<div className='space-y-4 text-sm'>
									{data.fundamentalAnalysis ? (
										<>
											{data.fundamentalAnalysis
												.financials && (
												<div>
													<h3 className='font-medium mb-1'>
														Financial Performance
													</h3>
													<p>
														{
															data
																.fundamentalAnalysis
																.financials
														}
													</p>
												</div>
											)}
											{data.fundamentalAnalysis
												.valuation && (
												<div>
													<h3 className='font-medium mb-1'>
														Valuation Metrics
													</h3>
													<p>
														{
															data
																.fundamentalAnalysis
																.valuation
														}
													</p>
												</div>
											)}
											{data.fundamentalAnalysis
												.growth && (
												<div>
													<h3 className='font-medium mb-1'>
														Growth Prospects
													</h3>
													<p>
														{
															data
																.fundamentalAnalysis
																.growth
														}
													</p>
												</div>
											)}
											{data.fundamentalAnalysis
												.balance && (
												<div>
													<h3 className='font-medium mb-1'>
														Balance Sheet Health
													</h3>
													<p>
														{
															data
																.fundamentalAnalysis
																.balance
														}
													</p>
												</div>
											)}
										</>
									) : (
										<p className='text-muted-foreground'>
											No fundamental analysis available.
										</p>
									)}
								</div>
							)}

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
