'use client';

import { useEffect, useState } from 'react';

import { Loader2 } from 'lucide-react';

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
	model: string;
	isLoading: boolean;
	data: AIAssistantData | null;
}

export default function AIAssistantDialog({
	isOpen,
	onClose,
	symbol,
	model,
	isLoading,
	data,
}: AIAssistantDialogProps) {
	const [activeTab, setActiveTab] = useState('analysis');

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

				<div className='mb-2 text-sm text-muted-foreground'>
					Using model: {model}
				</div>

				{isLoading ? (
					<div className='flex flex-col items-center justify-center py-10'>
						<Loader2 className='h-10 w-10 animate-spin text-primary mb-4' />
						<p className='text-center text-muted-foreground'>
							{model === 'deepseek'
								? 'Deep thinking about stock analysis...'
								: `Analyzing ${symbol} data and generating insights...`}
							<br />
							<span className='text-sm'>
								This may take a few moments
							</span>
						</p>
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
									<ul className='list-disc list-inside text-sm space-y-2'>
										{data.recommendations.map(
											(rec: string, i: number) => (
												<li key={i}>{rec}</li>
											)
										)}
									</ul>
								</div>
							)}

							{activeTab === 'technical' && (
								<div>
									{data.technicalAnalysis && (
										<div className='text-sm'>
											<h3 className='font-medium mb-2'>
												Technical Analysis:
											</h3>
											{data.technicalAnalysis
												.priceTrend && (
												<p>
													Price Trend:{' '}
													{
														data.technicalAnalysis
															.priceTrend
													}
												</p>
											)}
											{data.technicalAnalysis
												.technicalIndicators && (
												<p>
													Technical Indicators:{' '}
													{
														data.technicalAnalysis
															.technicalIndicators
													}
												</p>
											)}
											{data.technicalAnalysis.volume && (
												<p>
													Volume:{' '}
													{
														data.technicalAnalysis
															.volume
													}
												</p>
											)}
											{data.technicalAnalysis
												.patterns && (
												<p>
													Patterns:{' '}
													{
														data.technicalAnalysis
															.patterns
													}
												</p>
											)}
										</div>
									)}
								</div>
							)}

							{activeTab === 'fundamental' && (
								<div>
									{data.fundamentalAnalysis && (
										<div className='text-sm'>
											<h3 className='font-medium mb-2'>
												Fundamental Analysis:
											</h3>
											{data.fundamentalAnalysis
												.financials && (
												<p>
													Financials:{' '}
													{
														data.fundamentalAnalysis
															.financials
													}
												</p>
											)}
											{data.fundamentalAnalysis
												.valuation && (
												<p>
													Valuation:{' '}
													{
														data.fundamentalAnalysis
															.valuation
													}
												</p>
											)}
											{data.fundamentalAnalysis
												.growth && (
												<p>
													Growth:{' '}
													{
														data.fundamentalAnalysis
															.growth
													}
												</p>
											)}
											{data.fundamentalAnalysis
												.balance && (
												<p>
													Balance:{' '}
													{
														data.fundamentalAnalysis
															.balance
													}
												</p>
											)}
										</div>
									)}
									{data.industryAnalysis && (
										<div className='text-sm'>
											<h3 className='font-medium mb-2 mt-4'>
												Industry Analysis:
											</h3>
											{data.industryAnalysis.position && (
												<p>
													Position:{' '}
													{
														data.industryAnalysis
															.position
													}
												</p>
											)}
											{data.industryAnalysis.trends && (
												<p>
													Trends:{' '}
													{
														data.industryAnalysis
															.trends
													}
												</p>
											)}
											{data.industryAnalysis
												.competitors && (
												<p>
													Competitors:{' '}
													{
														data.industryAnalysis
															.competitors
													}
												</p>
											)}
											{data.industryAnalysis.cycle && (
												<p>
													Cycle:{' '}
													{
														data.industryAnalysis
															.cycle
													}
												</p>
											)}
										</div>
									)}
									{data.riskFactors && (
										<div className='text-sm'>
											<h3 className='font-medium mb-2 mt-4'>
												Risk Factors:
											</h3>
											{data.riskFactors.market && (
												<p>
													Market:{' '}
													{data.riskFactors.market}
												</p>
											)}
											{data.riskFactors.industry && (
												<p>
													Industry:{' '}
													{data.riskFactors.industry}
												</p>
											)}
											{data.riskFactors.company && (
												<p>
													Company:{' '}
													{data.riskFactors.company}
												</p>
											)}
											{data.riskFactors.regulatory && (
												<p>
													Regulatory:{' '}
													{
														data.riskFactors
															.regulatory
													}
												</p>
											)}
										</div>
									)}
									{data.priceTargets && (
										<div className='text-sm'>
											<h3 className='font-medium mb-2 mt-4'>
												Price Targets:
											</h3>
											{data.priceTargets.shortTerm && (
												<p>
													Short Term:{' '}
													{
														data.priceTargets
															.shortTerm
													}
												</p>
											)}
											{data.priceTargets.midTerm && (
												<p>
													Mid Term:{' '}
													{data.priceTargets.midTerm}
												</p>
											)}
											{data.priceTargets.longTerm && (
												<p>
													Long Term:{' '}
													{data.priceTargets.longTerm}
												</p>
											)}
										</div>
									)}
								</div>
							)}
						</div>
					</div>
				) : (
					<p className='text-center text-muted-foreground py-8'>
						Failed to load analysis. Please try again.
					</p>
				)}
			</div>
		</div>
	);
}
