'use client';

import { useEffect, useState, useRef } from 'react';

import { Loader2 } from 'lucide-react';

import { getStockChartData } from '@/app/actions/yahoo/get-stock-chart-data';
import { getStockRealTimeData } from '@/app/actions/yahoo/get-stock-realtime-data';

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

		// We're using fetch API with ReadableStream instead of EventSource

		const fetchStreamData = async () => {
			try {
				setIsStreaming(true);
				setThinking('');
				setStreamData(null);
				setStreamError(null);

				// Fetch Yahoo Finance data for the stock
				const [
					stockData,
					chartData1d,
					chartData1mo,
					chartData3mo,
					chartData1y,
				] = await Promise.all([
					getStockRealTimeData(symbol),
					getStockChartData(symbol, '1d'),
					getStockChartData(symbol, '1mo'),
					getStockChartData(symbol, '3mo'),
					getStockChartData(symbol, '1y'),
				]);

				// Call the streaming API endpoint
				const response = await fetch('/api/deepseek-stream', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						symbol,
						language: 'EN', // TODO： 需要根据用户选择语言来决定
						stockData,
						chartData: {
							'1d': chartData1d,
							'1mo': chartData1mo,
							'3mo': chartData3mo,
							'1y': chartData1y,
						},
					}),
				});

				if (!response.ok) {
					throw new Error(`API error: ${response.status}`);
				}

				const reader = response.body?.getReader();
				if (!reader) {
					throw new Error('Failed to get response reader');
				}

				const decoder = new TextDecoder();
				let buffer = '';

				while (true) {
					const { done, value } = await reader.read();
					if (done) break;

					buffer += decoder.decode(value, { stream: true });

					// Process complete SSE messages
					const lines = buffer.split('\n\n');
					buffer = lines.pop() || '';

					for (const line of lines) {
						if (!line.startsWith('data:')) continue;

						try {
							const data = JSON.parse(line.slice(5).trim());

							if (data.type === 'thinking') {
								setThinking((prev) => prev + data.content);
							} else if (data.type === 'content') {
								// Content is processed but not displayed directly
								// It will be part of the final complete message
							} else if (data.type === 'complete') {
								setStreamData(data.content);
							} else if (data.type === 'error') {
								setStreamError(data.content);
							}
						} catch (error) {
							console.error('Error parsing SSE message:', error);
						}
					}
				}
			} catch (error) {
				console.error('Streaming error:', error);
				setStreamError(
					error instanceof Error ? error.message : 'Unknown error'
				);
			} finally {
				setIsStreaming(false);
			}
		};

		fetchStreamData();

		// No cleanup needed for fetch API with ReadableStream
		return () => {};
	}, [isOpen, useStream, symbol, initialData]);

	// Auto-scroll thinking containers when content changes
	useEffect(() => {
		if (thinking && thinkingContainerRef.current) {
			thinkingContainerRef.current.scrollTop =
				thinkingContainerRef.current.scrollHeight;
		}
		if (thinking && thinkingTabContainerRef.current) {
			thinkingTabContainerRef.current.scrollTop =
				thinkingTabContainerRef.current.scrollHeight;
		}
	}, [thinking]);

	if (!isOpen) return null;

	return (
		<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
			<div
				className='bg-background rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto'
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
					<div className='flex flex-col items-center justify-center py-10'>
						<Loader2 className='h-10 w-10 animate-spin text-primary mb-4' />
						<p className='text-center text-muted-foreground'>
							Analyzing {symbol} data and generating insights...
							<br />
							<span className='text-sm'>
								This may take a few moments
							</span>
						</p>

						{/* Display thinking process during streaming */}
						{thinking && (
							<div className='mt-6 w-full max-w-lg'>
								<div className='p-3 rounded-lg bg-muted border border-border'>
									<p className='text-sm text-muted-foreground mb-1'>
										Thinking Process...
									</p>
									<div
										ref={thinkingContainerRef}
										className='font-mono text-sm whitespace-pre-wrap overflow-y-auto max-h-[200px] text-foreground'
									>
										{thinking}
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
											{thinking ||
												'No thinking process available.'}
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
