'use client';

import { useEffect, useState, useRef } from 'react';

import { Loader2 } from 'lucide-react';

import { AIAnalysisResult, AIThinkingProcess } from './ai-analysis-result';

import { getCompressedHistoricalDataForAnalysis } from '@/app/actions/eodhd/get-compressed-historical-data-for-analysis';
import { getCompressedMainIndexesHistoricalDataForAnalysis } from '@/app/actions/eodhd/get-compressed-main-indexes-historical-data-for-analysis';
import { getCompressedNewsDataForAnalysis } from '@/app/actions/eodhd/get-compressed-news-data-for-analysis';
import { getCompressedTechnicalIndicatorsDataForAnalysis } from '@/app/actions/eodhd/get-compressed-technical-indicators-data-for-analysis';
import {
	getAIAssistantCache,
	setAIAssistantCache,
} from '@/app/actions/redis/ai-assistant-cache';
import { getComprehensiveStockData } from '@/app/actions/yahoo/get-comprehensive-stock-data';
import JsonFormatter from '@/components/custom/json-formatter';
import EnhancedTextFormatter from '@/components/custom/text-formatter-enhanced';

interface SequentialThinkingStep {
	step: number;
	title: string;
	content: string;
}

// 更改AIAssistantData接口为更通用的结构，以适应动态JSON
interface AIAssistantData {
	[key: string]: any;
	sentiment?: string;
	summary?: string;
	technicalOutlook?: any;
	scenarios?: any;
	actionPlan?: any;
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
	const abortControllerRef = useRef<AbortController | null>(null);
	const isAbortedRef = useRef<boolean>(false);

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
		abortControllerRef.current = abortController;
		const signal = abortController.signal;
		// 跟踪请求是否已被中止
		isAbortedRef.current = false;

		const fetchStreamData = async () => {
			try {
				setIsStreaming(true);
				setThinking('');
				setStreamData(null);
				setStreamError(null);

				// 检查Redis缓存（使用服务器操作）
				const cachedData = await getAIAssistantCache(
					symbol,
					code,
					exchange
				);
				if (cachedData) {
					console.log('使用Redis缓存的AI分析数据');
					setStreamData(cachedData);
					setIsStreaming(false);
					return;
				}

				// 获取所有类型的分析数据
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
						'1y'
					);

				// 获取历史数据
				const historicalData =
					await getCompressedHistoricalDataForAnalysis(
						code,
						exchange,
						'1y'
					);

				// 获取主要指数历史数据
				const mainIndexesHistoricalData =
					await getCompressedMainIndexesHistoricalDataForAnalysis(
						exchange,
						'1y'
					);

				// 获取最近的新闻数据
				const newsData = await getCompressedNewsDataForAnalysis(
					code,
					exchange,
					5 // 默认获取最近的5条新闻
				);

				console.log(historicalData);
				console.log(mainIndexesHistoricalData);

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
						mainIndexesHistoricalData, // 添加主要指数数据
						newsData, // 添加新闻数据
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

									// 将完整数据存入Redis缓存，设置5分钟过期时间（使用服务器操作）
									await setAIAssistantCache(
										symbol,
										code,
										exchange,
										processedData,
										300
									); // 300秒 = 5分钟
									console.log(
										'AI分析数据已缓存到Redis，有效期5分钟'
									);

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
					isAbortedRef.current = true;
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

		// 清理函数现在只在组件卸载时中止请求，而不是在对话框关闭时
		return () => {
			// 只在组件完全卸载时中止请求
			if (abortControllerRef.current && !isAbortedRef.current) {
				abortControllerRef.current.abort();
				console.log('组件卸载：中止DeepSeek API流连接以节省token使用');
			}

			// 无论如何，重置状态以便下次打开时状态干净
			setIsStreaming(false);
			setThinking('');
			setThinkingContent('');
			setThinkingStatus('');
		};
	}, [isOpen, useStream, symbol, initialData, code, exchange]); // 移除activeTab依赖

	// 处理对话框关闭（不再中止API请求，只关闭对话框）
	const handleClose = () => {
		// 调用onClose回调关闭对话框
		onClose();
	};

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
						onClick={handleClose}
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
								<AIAnalysisResult data={data} />
							)}

							{/* 思考过程标签页 */}
							{activeTab === 'thinking' && (
								<AIThinkingProcess
									thinking={thinking}
									thinkingContent={thinkingContent}
								/>
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
