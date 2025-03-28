'use client';

import { useEffect, useState, useRef, JSX, Fragment } from 'react';

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
	const renderContent = (
		content: any,
		depth = 0,
		parentKey?: string
	): JSX.Element => {
		// 处理空值
		if (content === null || content === undefined) {
			return <p className='text-muted-foreground'>暂无数据</p>;
		}

		// 处理字符串
		if (typeof content === 'string') {
			return <p className='text-sm leading-relaxed'>{content}</p>;
		}

		// 处理数字
		if (typeof content === 'number') {
			return <p className='text-sm font-medium'>{content}</p>;
		}

		// 处理布尔值
		if (typeof content === 'boolean') {
			return (
				<p className='text-sm font-medium'>{content ? 'Yes' : 'No'}</p>
			);
		}

		// 处理数组
		if (Array.isArray(content)) {
			if (content.length === 0) {
				return <p className='text-muted-foreground'>暂无数据</p>;
			}

			// 特殊处理：如果数组中的项都是字符串或数字（简单类型的数组）
			if (
				content.every(
					(item) =>
						typeof item === 'string' || typeof item === 'number'
				)
			) {
				return (
					<ul className='list-disc pl-5 space-y-1 text-xs'>
						{content.map((item, index) => (
							<li key={index} className='text-muted-foreground'>
								{item}
							</li>
						))}
					</ul>
				);
			}

			// 通用处理支撑位/阻力位/价格目标等带有price、price属性或level属性的对象数组
			if (
				content.every(
					(item) =>
						typeof item === 'object' &&
						item !== null &&
						('price' in item || 'level' in item)
				)
			) {
				return (
					<div className='space-y-2'>
						{content.map((item, index) => (
							<div
								key={index}
								className='mb-3 p-2 border-l-2 border-muted pl-2'
							>
								<div className='flex items-center gap-2 mb-1'>
									<span className='font-medium'>
										{item.price || item.level}
									</span>
								</div>
								{/* 处理多种可能的说明字段名 */}
								{(item.significance ||
									item.rationale ||
									item.reason) && (
									<div className='ml-2'>
										<p className='text-xs text-muted-foreground'>
											—{' '}
											{item.significance ||
												item.rationale ||
												item.reason}
										</p>
									</div>
								)}
								{/* 处理原因数组 */}
								{item.reasons &&
									Array.isArray(item.reasons) && (
										<div className='ml-2'>
											<ul className='list-disc pl-4 space-y-1 text-xs text-muted-foreground'>
												{item.reasons.map(
													(
														reason: string,
														idx: number
													) => (
														<li key={idx}>
															{reason}
														</li>
													)
												)}
											</ul>
										</div>
									)}
							</div>
						))}
					</div>
				);
			}

			// 一般数组处理
			return (
				<ul className='list-disc pl-5 space-y-2 text-sm'>
					{content.map((item, index) => (
						<li key={index} className='leading-relaxed'>
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
			// 检测对象模式和布局
			const keys = Object.keys(content);

			// 检查是否应该使用网格布局（适用于键值对较多的对象）
			const shouldUseGrid =
				keys.length > 2 &&
				keys.every(
					(key) =>
						typeof content[key] !== 'object' ||
						content[key] === null ||
						(Array.isArray(content[key]) &&
							content[key].length === 0)
				);

			// 如果是一个具有price属性的对象（单个支撑位/阻力位）
			if ('price' in content || 'level' in content) {
				return (
					<div className='mb-3 p-2 border-l-2 border-muted pl-2'>
						<div className='flex items-center gap-2 mb-1'>
							<span className='font-medium'>
								{content.price || content.level}
							</span>
						</div>
						{/* 处理多种可能的说明字段名 */}
						{(content.significance ||
							content.rationale ||
							content.reason) && (
							<div className='ml-2'>
								<p className='text-xs text-muted-foreground'>
									—{' '}
									{content.significance ||
										content.rationale ||
										content.reason}
								</p>
							</div>
						)}
						{content.reasons && Array.isArray(content.reasons) && (
							<div className='ml-2'>
								<ul className='list-disc pl-4 space-y-1 text-xs text-muted-foreground'>
									{content.reasons.map(
										(reason: string, idx: number) => (
											<li key={idx}>{reason}</li>
										)
									)}
								</ul>
							</div>
						)}
					</div>
				);
			}

			// 使用网格布局（适用于具有多个简单键值的对象）
			if (shouldUseGrid) {
				return (
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'>
						{Object.entries(content).map(([key, value]) => (
							<div
								key={key}
								className='p-2 border rounded-md bg-muted/30'
							>
								<h5 className='font-medium text-xs uppercase mb-1'>
									{formatKeyName(key)}
								</h5>
								<p className='text-xs text-muted-foreground'>
									{String(value)}
								</p>
							</div>
						))}
					</div>
				);
			}

			// 默认对象布局
			return (
				<div className={`space-y-3 ${depth > 0 ? 'ml-2 mt-2' : ''}`}>
					{Object.entries(content).map(([key, value]) => {
						// 跳过空值
						if (value === null || value === undefined) return null;

						// 估计子对象的复杂度
						const isComplexValue =
							typeof value === 'object' &&
							value !== null &&
							(Array.isArray(value)
								? value.length > 0
								: Object.keys(value).length > 0);

						// 布局调整（针对不同复杂度的对象）
						const sectionClass = isComplexValue
							? `${depth > 0 ? 'mb-3' : 'mb-4'} ${depth > 1 ? 'border-l pl-3' : ''}`
							: `${depth > 0 ? 'mb-2' : 'mb-3'}`;

						return (
							<div key={key} className={sectionClass}>
								<h4
									className={`font-medium mb-1 ${depth > 0 ? 'text-sm' : 'text-base'} capitalize`}
								>
									{formatKeyName(key)}
								</h4>
								{renderContent(value, depth + 1, key)}
							</div>
						);
					})}
				</div>
			);
		}

		// 处理其他类型
		return <p className='text-sm'>{String(content)}</p>;
	};

	// 格式化键名，例如将camelCase转换为空格分隔的单词
	const formatKeyName = (key: string): string => {
		// 中英文字段映射表
		const keyTranslations: Record<string, string> = {
			// 顶级字段翻译
			sentiment: '整体情绪',
			summary: '摘要分析',
			technicalOutlook: '技术展望',
			scenarios: '市场情景',
			actionPlan: '行动计划',

			// technicalOutlook 子字段翻译
			currentTrend: '当前趋势',
			volumePriceAnalysis: '量价分析',
			keyLevels: '关键价位',
			supports: '支撑位',
			resistances: '阻力位',

			// scenarios 子字段翻译
			bullishScenario: '看涨情景',
			bearishScenario: '看跌情景',
			trigger: '触发条件',
			tradingStrategy: '交易策略',
			priceTargets: '价格目标',

			// actionPlan 子字段翻译
			immediateRecommendation: '即时建议',
			riskManagement: '风险管理',

			// specificActions 子字段翻译
			entry: '入场点',
			stopLoss: '止损点',
			profitTargets: '获利目标',
			positionManagement: '仓位管理',

			// 常见属性翻译
			price: '价格',
			level: '水平',
			significance: '重要性',
			rationale: '理由',
			reason: '原因',
		};

		// 先检查映射表中是否有对应的中文翻译
		if (key in keyTranslations) {
			return keyTranslations[key];
		}

		// 如果没有找到翻译，使用原始的格式化逻辑
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

									{/* 显示摘要 */}
									{data.summary && (
										<div className='mb-6 p-4 rounded-lg border'>
											<h3 className='font-medium text-lg mb-2'>
												Summary
											</h3>
											<p className='text-sm leading-relaxed'>
												{data.summary}
											</p>
										</div>
									)}

									{/* 技术展望部分 */}
									{data.technicalOutlook && (
										<div className='border p-4 rounded-lg mb-6'>
											<h3 className='font-medium text-lg mb-3'>
												Technical Outlook
											</h3>
											{renderContent(
												data.technicalOutlook
											)}
										</div>
									)}

									{/* 情景分析部分 */}
									{data.scenarios && (
										<div className='border p-4 rounded-lg mb-6'>
											<h3 className='font-medium text-lg mb-3'>
												Scenarios
											</h3>
											{renderContent(data.scenarios)}
										</div>
									)}

									{/* 行动计划部分 */}
									{data.actionPlan && (
										<div className='border p-4 rounded-lg mb-6'>
											<h3 className='font-medium text-lg mb-3'>
												Action Plan
											</h3>
											{renderContent(data.actionPlan)}
										</div>
									)}

									{/* 动态渲染其他字段 */}
									<div className='space-y-6'>
										{Object.entries(
											getMainContent() || {}
										).map(([key, value]) => {
											// 跳过已经单独显示的字段
											if (
												[
													'sentiment',
													'summary',
													'technicalOutlook',
													'scenarios',
													'actionPlan',
													'sequentialThinking',
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
