'use client';

import { useEffect, useState, useRef } from 'react';

import { Sparkles } from 'lucide-react';

import {
	AIAnalysisResult,
	AIThinkingProcess,
	AIThinkingProcessLoading,
} from './ai-analysis-result';

import { getCompressedHistoricalDataForAnalysis } from '@/app/actions/eodhd/get-compressed-historical-data-for-analysis';
import { getCompressedMainIndexesHistoricalDataForAnalysis } from '@/app/actions/eodhd/get-compressed-main-indexes-historical-data-for-analysis';
import { getCompressedNewsDataForAnalysis } from '@/app/actions/eodhd/get-compressed-news-data-for-analysis';
import { getCompressedTechnicalIndicatorsDataForAnalysis } from '@/app/actions/eodhd/get-compressed-technical-indicators-data-for-analysis';
import {
	getAIAssistantCache,
	setAIAssistantCache,
} from '@/app/actions/redis/ai-assistant-cache';
import { getComprehensiveStockData } from '@/app/actions/yahoo/get-comprehensive-stock-data';
import { IconButton } from '@/components/custom/iconButton';
import { useProfile } from '@/hooks/use-profile';

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
	setIsOpen: (isOpen: boolean) => void;
	symbol: string;
	useStream?: boolean;
	code: string;
	exchange: string;
}

// 用于处理服务器发送事件(SSE)消息的接口定义
interface SSEMessage {
	type: 'thinking' | 'content' | 'status' | 'complete' | 'error';
	content: string | any;
}

// 用于收集分析所需的所有数据的接口
interface StockAnalysisData {
	symbol: string;
	language: string;
	comprehensiveData: any;
	technicalIndicatorsData: any;
	historicalData: any;
	mainIndexesHistoricalData: any;
	newsData: any;
}

/**
 * 检查Redis缓存中是否有可用的AI分析数据
 * @param symbol 股票代码
 * @param code 公司代码
 * @param exchange 交易所
 * @returns 缓存的数据或null
 */
const checkCacheData = async (
	symbol: string,
	code: string,
	exchange: string
): Promise<AIAssistantData | null> => {
	try {
		const cachedData = await getAIAssistantCache(symbol, code, exchange);
		if (cachedData) {
			console.log('使用Redis缓存的AI分析数据');
			return cachedData;
		}
		return null;
	} catch (error) {
		console.error('检查缓存数据时出错:', error);
		return null;
	}
};

/**
 * 收集所有需要的股票分析数据
 * @param symbol 股票代码
 * @param code 公司代码
 * @param exchange 交易所
 * @returns 收集的数据对象或错误
 */
const collectStockData = async (
	symbol: string,
	code: string,
	exchange: string,
	language: string,
	setCurrentAction: (action: string) => void,
	setProgress: (progress: number) => void
): Promise<{ data: StockAnalysisData | null; error: string | null }> => {
	try {
		setCurrentAction('Gathering real-time data...');
		setProgress(0);

		// 获取综合数据
		const comprehensiveData = await getComprehensiveStockData(symbol);

		// 检查是否有错误
		if (comprehensiveData && 'error' in comprehensiveData) {
			return { data: null, error: comprehensiveData.error };
		}

		setCurrentAction('Gathering technical indicators data...');
		setProgress(5.0);

		// 获取技术指标数据
		const technicalIndicatorsData =
			await getCompressedTechnicalIndicatorsDataForAnalysis(
				code,
				exchange,
				'1y'
			);

		setCurrentAction('Gathering historical data...');
		setProgress(10.0);

		// 获取历史数据
		const historicalData = await getCompressedHistoricalDataForAnalysis(
			code,
			exchange,
			'1y'
		);

		setCurrentAction('Gathering main indexes data...');
		setProgress(15.0);

		// 获取主要指数历史数据
		const mainIndexesHistoricalData =
			await getCompressedMainIndexesHistoricalDataForAnalysis(
				exchange,
				'1y'
			);

		setCurrentAction('Gathering news data...');
		setProgress(20.0);

		// 获取最近的新闻数据
		const newsData = await getCompressedNewsDataForAnalysis(
			code,
			exchange,
			5 // 默认获取最近的5条新闻
		);

		return {
			data: {
				symbol,
				language,
				comprehensiveData,
				technicalIndicatorsData,
				historicalData,
				mainIndexesHistoricalData,
				newsData,
			},
			error: null,
		};
	} catch (error) {
		console.error('收集股票数据时出错:', error);
		const errorMessage =
			error instanceof Error ? error.message : '未知错误';
		return { data: null, error: errorMessage };
	}
};

/**
 * 处理单条SSE消息
 * @param dataStr 消息字符串
 * @param callbacks 状态更新回调函数集合
 * @param symbol 股票代码
 * @param code 公司代码
 * @param exchange 交易所
 * @returns 是否完成流处理
 */
const processSSEMessage = async (
	dataStr: string,
	callbacks: {
		setThinking: (fn: (prev: string) => string) => void;
		setThinkingContent: (fn: (prev: string) => string) => void;
		setThinkingStatus: (fn: (prev: string) => string) => void;
		setStreamData: (data: AIAssistantData) => void;
		setStreamError: (error: string | null) => void;
		setIsStreaming: (isStreaming: boolean) => void;
		setActiveTab: (tab: string) => void;
		setCurrentAction: (action: string) => void;
		setProgress: (progress: number) => void;
	},
	symbol: string,
	code: string,
	exchange: string,
	hasReceivedContentRef: { current: boolean },
	hasReceivedThinkingRef: { current: boolean }
): Promise<boolean> => {
	try {
		// 解析JSON数据
		console.log('Received SSE data:', dataStr.slice(0, 50) + '...');
		const data: SSEMessage = JSON.parse(dataStr);

		// 根据消息类型处理
		switch (data.type) {
			case 'thinking':
				callbacks.setThinking((prev) => prev + data.content);

				// 当收到第一个思考消息时，更新进度至30%
				if (!hasReceivedThinkingRef.current) {
					callbacks.setCurrentAction('Thinking...');
					callbacks.setProgress(30.0);
					hasReceivedThinkingRef.current = true;
				}
				break;
			case 'content':
				// 添加内容消息到思考过程中
				callbacks.setThinkingContent((prev) => prev + data.content);
				console.log('Content chunk received');

				// 当第一次收到内容时，更新进度至50%
				if (!hasReceivedContentRef.current) {
					callbacks.setCurrentAction(
						'Processing and generating insights...'
					);
					callbacks.setProgress(50.0);
					hasReceivedContentRef.current = true;
				}
				break;
			case 'status':
				// 状态更新
				console.log('Status update:', data.content);
				callbacks.setThinkingStatus(
					(prev) => prev + `\n\n${data.content}\n\n`
				);
				break;
			case 'complete':
				// 收到完整数据
				console.log('Received complete data');

				if (typeof data.content === 'object') {
					// 确保最小必要字段存在
					const processedData = {
						...data.content,
						analysis:
							data.content.analysis || 'No analysis available',
						recommendations: Array.isArray(
							data.content.recommendations
						)
							? data.content.recommendations
							: [],
						sentiment: data.content.sentiment || 'neutral',
					};

					// 将完整数据存入Redis缓存，设置5分钟过期时间
					await setAIAssistantCache(
						symbol,
						code,
						exchange,
						processedData,
						300
					); // 300秒 = 5分钟
					console.log('AI分析数据已缓存到Redis，有效期5分钟');

					callbacks.setStreamData(processedData);
					callbacks.setIsStreaming(false);
					callbacks.setActiveTab('analysis');
					return true; // 流处理完成
				} else {
					console.error('Unexpected complete data format:', data);
					callbacks.setStreamError('Received unexpected data format');
					callbacks.setIsStreaming(false);
				}
				break;
			case 'error':
				console.error('Stream error:', data.content);
				callbacks.setStreamError(data.content);
				callbacks.setThinkingContent(
					(prev) => prev + `\n\n[Error] ${data.content}\n\n`
				);
				break;
		}
	} catch (error) {
		console.error('Error parsing SSE message:', error);
		// 解析单条消息出错不应该终止整个流
	}
	return false; // 流处理未完成
};

/**
 * 处理流式数据
 * @param response Fetch响应对象
 * @param callbacks 状态更新回调函数集合
 * @param symbol 股票代码
 * @param code 公司代码
 * @param exchange 交易所
 */
const processStream = async (
	response: Response,
	callbacks: {
		setThinking: (fn: (prev: string) => string) => void;
		setThinkingContent: (fn: (prev: string) => string) => void;
		setThinkingStatus: (fn: (prev: string) => string) => void;
		setStreamData: (data: AIAssistantData) => void;
		setStreamError: (error: string | null) => void;
		setIsStreaming: (isStreaming: boolean) => void;
		setActiveTab: (tab: string) => void;
		setCurrentAction: (action: string) => void;
		setProgress: (progress: number) => void;
	},
	symbol: string,
	code: string,
	exchange: string,
	hasReceivedContentRef: { current: boolean },
	hasReceivedThinkingRef: { current: boolean }
) => {
	const reader = response.body?.getReader();
	if (!reader) {
		throw new Error('Failed to get response reader');
	}

	const decoder = new TextDecoder();
	let buffer = '';

	try {
		while (true) {
			const { done, value } = await reader.read();
			if (done) break;

			// 添加到缓冲区并处理完整消息
			buffer += decoder.decode(value, { stream: true });

			// 处理完整的SSE消息（以双换行分隔）
			const lines = buffer.split('\n\n');
			buffer = lines.pop() || '';

			for (const line of lines) {
				// 跳过非数据行
				if (!line.startsWith('data:')) continue;

				// 处理消息数据
				const dataStr = line.slice(5).trim();
				const isComplete = await processSSEMessage(
					dataStr,
					callbacks,
					symbol,
					code,
					exchange,
					hasReceivedContentRef,
					hasReceivedThinkingRef
				);

				// 如果流处理完成，退出循环
				if (isComplete) return;
			}
		}
	} catch (error) {
		throw error; // 向上传递错误，由调用者处理
	}
};

/**
 * 请求并处理AI分析流数据
 * @param stockData 股票分析数据
 * @param signal AbortController信号
 * @param callbacks 状态更新回调函数集合
 * @param symbol 股票代码
 * @param code 公司代码
 * @param exchange 交易所
 */
const requestStreamAnalysis = async (
	requestData: StockAnalysisData,
	signal: AbortSignal,
	callbacks: {
		setThinking: (fn: (prev: string) => string) => void;
		setThinkingContent: (fn: (prev: string) => string) => void;
		setThinkingStatus: (fn: (prev: string) => string) => void;
		setStreamData: (data: AIAssistantData) => void;
		setStreamError: (error: string | null) => void;
		setIsStreaming: (isStreaming: boolean) => void;
		setActiveTab: (tab: string) => void;
		setCurrentAction: (action: string) => void;
		setProgress: (progress: number) => void;
	},
	symbol: string,
	code: string,
	exchange: string
) => {
	// 调用流式API端点
	const response = await fetch('/api/deepseek-stream', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(requestData),
		signal, // 添加abort signal以支持中止请求
	});

	if (!response.ok) {
		throw new Error(`API error: ${response.status}`);
	}

	callbacks.setCurrentAction('Sending data to DeepSeek R1...');
	callbacks.setProgress(25.0);

	// 处理流数据
	await processStream(
		response,
		callbacks,
		symbol,
		code,
		exchange,
		{
			current: false,
		},
		{
			current: false,
		}
	);
};

export default function AIAssistantDialog({
	isOpen,
	setIsOpen,
	symbol,
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
	const isCheckedCacheRef = useRef<boolean>(false);
	const [progress, setProgress] = useState(0);
	const [currentAction, setCurrentAction] = useState('');
	const hasReceivedContentRef = useRef<boolean>(false);
	const hasReceivedThinkingRef = useRef<boolean>(false);

	const { preference } = useProfile();

	// 进度自动增长效果
	useEffect(() => {
		let intervalId: NodeJS.Timeout;

		// 根据不同进度范围设置不同的增长速率
		if (progress >= 25 && progress <= 29) {
			// 25%-29%范围内每秒增加0.5%
			intervalId = setInterval(() => {
				setProgress((prev) => prev + 0.5);
			}, 1000);
		} else if (progress >= 30 && progress <= 49) {
			// 30%-49%范围内每秒增加1%
			intervalId = setInterval(() => {
				setProgress((prev) => prev + 0.9);
			}, 1000);
		} else if (progress >= 50 && progress <= 99) {
			// 50%-99%范围内每秒增加0.8%
			intervalId = setInterval(() => {
				setProgress((prev) => prev + 0.8);
			}, 1000);
		}

		return () => {
			if (intervalId) clearInterval(intervalId);
		};
	}, [progress]);

	// 当进度达到99%以上时，改变文本为"Finalizing analysis..."
	useEffect(() => {
		if (progress >= 99) {
			setCurrentAction('Finalizing analysis...');
		}
	}, [progress]);

	// 使用流式数据或初始数据
	const data = streamData;
	const isLoading = isStreaming;

	// 处理Escape键关闭对话框
	useEffect(() => {
		const handleEscapeKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && isOpen) {
				setIsOpen(false);
			}
		};

		document.addEventListener('keydown', handleEscapeKey);
		return () => {
			document.removeEventListener('keydown', handleEscapeKey);
		};
	}, [isOpen, setIsOpen]);

	// 当对话框打开时禁用body滚动
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

	// 重置流状态
	const resetStreamState = () => {
		setIsStreaming(false);
		setThinking('');
		setThinkingContent('');
		setThinkingStatus('');
	};

	// 流式API主函数
	const fetchAndProcessStreamData = async (
		abortController: AbortController
	) => {
		try {
			// 初始化状态
			setIsStreaming(true);
			setThinking('');
			setStreamData(null);
			setStreamError(null);

			// 检查缓存
			const cachedData = await checkCacheData(symbol, code, exchange);
			if (cachedData) {
				setStreamData(cachedData);
				setIsStreaming(false);
				return;
			}

			// 收集股票数据
			const { data: stockData, error } = await collectStockData(
				symbol,
				code,
				exchange,
				preference?.language || 'CN',
				setCurrentAction,
				setProgress
			);

			if (error) {
				setStreamError(`Error: ${error}`);
				setIsStreaming(false);
				return;
			}

			if (!stockData) {
				setStreamError('无法获取股票数据');
				setIsStreaming(false);
				return;
			}

			// 回调函数集合
			const callbacks = {
				setThinking,
				setThinkingContent,
				setThinkingStatus,
				setStreamData,
				setStreamError,
				setIsStreaming,
				setActiveTab,
				setCurrentAction,
				setProgress,
			};

			// 请求并处理流式分析数据
			await requestStreamAnalysis(
				stockData,
				abortController.signal,
				callbacks,
				symbol,
				code,
				exchange
			);
		} catch (error: unknown) {
			// 处理AbortError，用户主动中止的情况
			if (error instanceof Error && error.name === 'AbortError') {
				console.log('Stream request aborted by user');
				isAbortedRef.current = true;
				resetStreamState();
			} else {
				// 处理其他错误
				console.error('Streaming error:', error);
				const errorMessage =
					error instanceof Error ? error.message : 'Unknown error';
				setStreamError(errorMessage);
				setIsStreaming(false);
			}
		}
	};

	// 处理开始分析
	const handleStartAnalysis = () => {
		if (!useStream) return;

		// 重置状态
		hasReceivedContentRef.current = false;
		hasReceivedThinkingRef.current = false;
		setProgress(0);
		setCurrentAction('');

		// 创建AbortController用于中止fetch请求
		const abortController = new AbortController();
		abortControllerRef.current = abortController;
		isAbortedRef.current = false;

		// 执行流式数据获取
		fetchAndProcessStreamData(abortController);
	};

	// 处理对话框关闭
	const handleClose = () => {
		// 只隐藏对话框，不中止AI分析过程
		setIsOpen(false);
	};

	// 从DeepSeek API获取流式数据（如果useStream为true）
	useEffect(() => {
		// 只有在组件实际卸载时才执行清理函数
		return () => {
			// 注意：这里的清理函数只会在组件完全卸载时执行，而不是在isOpen变更时
			if (abortControllerRef.current && !isAbortedRef.current) {
				abortControllerRef.current.abort();
				console.log(
					'组件完全卸载：中止DeepSeek API流连接以节省token使用'
				);
			}

			// 重置状态
			resetStreamState();
		};
	}, []); // 去掉isOpen依赖，确保只在组件实际卸载时执行清理

	// 首次打开时检查Redis缓存
	useEffect(() => {
		// 只在首次打开对话框且没有初始数据时检查缓存
		if (isOpen && !streamData && !isCheckedCacheRef.current) {
			isCheckedCacheRef.current = true;

			const checkCache = async () => {
				// 检查缓存中是否有数据
				const cachedData = await checkCacheData(symbol, code, exchange);
				if (cachedData) {
					console.log('使用Redis缓存的AI分析数据');
					setStreamData(cachedData);
				}
			};

			checkCache();
		}
	}, [isOpen, streamData, symbol, code, exchange]);

	if (!isOpen)
		return (
			<div
				className='fixed top-[6rem] right-[2rem] z-50 flex items-center justify-center bg-black/50'
				onClick={() => setIsOpen(true)}
			>
				<IconButton
					onClick={() => setIsOpen(true)}
					aria-label='AI Assistant'
					className='bg-blue-600 hover:bg-blue-600/80'
				>
					<Sparkles className='h-5 w-5 text-indigo-200' />
				</IconButton>
			</div>
		);

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
			<div
				className='bg-background rounded-lg shadow-lg p-6 w-full max-w-[60rem] max-h-[80vh] flex flex-col'
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
					<div className='flex flex-col items-center justify-center py-10'>
						<div className='w-full max-w-md mb-4 px-4'>
							<div className='text-xs text-muted-foreground mb-2 flex justify-between'>
								<span className='font-medium'>
									{progress >= 99
										? 'Finalizing analysis...'
										: currentAction || 'Processing...'}
								</span>
								<span className='text-sm font-medium text-muted-foreground'>
									{Math.min(100, Math.round(progress))}%
								</span>
							</div>
							<div className='w-full bg-muted rounded-full h-2 overflow-hidden'>
								<div
									className='h-full relative bg-gradient-to-r from-blue-500 via-indigo-600 to-blue-500 bg-animate-pulse transition-all duration-300 ease-in-out'
									style={{
										width: `${progress}%`,
										backgroundSize: '200% 100%',
										animation:
											'gradientMove 2s linear infinite',
									}}
								/>
							</div>
						</div>

						{thinking && (
							<AIThinkingProcessLoading
								thinking={thinking}
								thinkingContent={thinkingContent}
								thinkingStatus={thinkingStatus}
							/>
						)}
					</div>
				) : streamError ? (
					<div className='text-center text-red-500 py-4'>
						Error: {streamError}
					</div>
				) : data ? (
					<div className='flex flex-col flex-grow h-full min-h-0'>
						{/* 标签页导航 */}
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

						{/* 标签页内容区域 - 使用flex-grow和overflow-y-auto实现内部滚动 */}
						<div className='pt-2 flex-grow overflow-y-auto'>
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
					<div className='text-center py-8'>
						<div className='max-w-2xl mx-auto bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/30 p-6 rounded-xl shadow-sm border border-blue-100 dark:border-blue-900/50'>
							<h3 className='text-xl font-medium mb-4 text-blue-800 dark:text-blue-300'>
								Welcome to AI Stock Analysis
							</h3>
							<div className='space-y-4 text-muted-foreground'>
								<p>
									Start a comprehensive AI analysis of{' '}
									{symbol} to receive valuable insights about
									this stock. Our advanced AI will evaluate
									the current market trends, recent price
									movements, and momentum indicators to help
									you understand the stock's direction.
								</p>
								<p>
									We'll analyze the latest news and their
									potential impact on the stock price, examine
									technical indicators and patterns to
									identify possible support and resistance
									levels, and assess the overall market
									sentiment to predict potential future
									scenarios.
								</p>
								<p>
									Additionally, we'll compare {symbol}'s
									performance with major market indexes to
									give you a complete picture of its relative
									strength in the current market environment.
								</p>
								<p className='text-sm text-muted-foreground/80 italic mt-4'>
									The analysis may take a few moments to
									complete as we process and analyze multiple
									data sources.
								</p>
							</div>
							<button
								onClick={handleStartAnalysis}
								className='mt-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg flex items-center justify-center mx-auto shadow-md transition-all hover:shadow-lg font-medium'
							>
								<Sparkles className='h-5 w-5 mr-2 text-blue-200' />
								Start AI Analysis
							</button>
						</div>
					</div>
				)}
			</div>
			<style jsx global>{`
				@keyframes gradientMove {
					0% {
						background-position: 0% 0%;
					}
					100% {
						background-position: 100% 0%;
					}
				}
			`}</style>
		</div>
	);
}
