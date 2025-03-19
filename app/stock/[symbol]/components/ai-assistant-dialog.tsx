'use client';

import { useEffect, useState } from 'react';

import { Loader2 } from 'lucide-react';

interface SequentialThinkingStep {
	step: number;
	title: string;
	content: string;
}

interface AIAssistantData {
	analysis: string;
	recommendations: string[];
	sentiment: string;
	sequentialThinking?: SequentialThinkingStep[];
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
	const [activeStep, setActiveStep] = useState(0);
	const hasSequentialThinking =
		data?.sequentialThinking && data.sequentialThinking.length > 0;

	// Reset step counter when data changes
	useEffect(() => {
		if (data) {
			setActiveStep(0);
		}
	}, [data]);

	// Auto-advance through steps when in sequential thinking mode
	useEffect(() => {
		if (
			isLoading ||
			!hasSequentialThinking ||
			activeStep >= data!.sequentialThinking!.length
		) {
			return;
		}

		const timer = setTimeout(() => {
			if (activeStep < data!.sequentialThinking!.length - 1) {
				setActiveStep((prev) => prev + 1);
			}
		}, 3000); // Show each step for 3 seconds

		return () => clearTimeout(timer);
	}, [activeStep, isLoading, data, hasSequentialThinking]);

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
						{/* Sequential Thinking Steps (DeepSeek model) */}
						{hasSequentialThinking && (
							<div className='border rounded-md p-4 mb-4 bg-muted/30'>
								<h3 className='font-medium mb-3'>
									Thinking Process:
								</h3>

								{/* Progress bar */}
								<div className='w-full h-1 bg-muted mb-4 rounded-full overflow-hidden'>
									<div
										className='h-full bg-primary transition-all duration-300 ease-in-out'
										style={{
											width: `${((activeStep + 1) / data.sequentialThinking!.length) * 100}%`,
										}}
									/>
								</div>

								{/* Current step */}
								<div className='mb-2'>
									<div className='flex justify-between items-center'>
										<h4 className='font-semibold text-sm'>
											Step{' '}
											{
												data.sequentialThinking![
													activeStep
												].step
											}
											:{' '}
											{
												data.sequentialThinking![
													activeStep
												].title
											}
										</h4>
										<span className='text-xs text-muted-foreground'>
											{activeStep + 1} of{' '}
											{data.sequentialThinking!.length}
										</span>
									</div>
									<p className='text-sm mt-2'>
										{
											data.sequentialThinking![activeStep]
												.content
										}
									</p>
								</div>

								{/* Step navigation */}
								<div className='flex justify-between mt-4'>
									<button
										className='text-xs text-primary hover:text-primary/80 disabled:text-muted-foreground'
										onClick={() =>
											setActiveStep((prev) =>
												Math.max(0, prev - 1)
											)
										}
										disabled={activeStep === 0}
									>
										Previous Step
									</button>
									<button
										className='text-xs text-primary hover:text-primary/80 disabled:text-muted-foreground'
										onClick={() =>
											setActiveStep((prev) =>
												Math.min(
													data.sequentialThinking!
														.length - 1,
													prev + 1
												)
											)
										}
										disabled={
											activeStep ===
											data.sequentialThinking!.length - 1
										}
									>
										Next Step
									</button>
								</div>
							</div>
						)}

						{/* Analysis */}
						<div>
							<h3 className='font-medium mb-2'>Analysis:</h3>
							<p className='text-sm'>{data.analysis}</p>
						</div>

						<div>
							<h3 className='font-medium mb-2'>
								Recommendations:
							</h3>
							<ul className='list-disc list-inside text-sm space-y-1'>
								{data.recommendations.map(
									(rec: string, i: number) => (
										<li key={i}>{rec}</li>
									)
								)}
							</ul>
						</div>

						<div className='text-sm'>
							<span className='font-medium'>Sentiment: </span>
							<span
								className={
									data.sentiment === 'positive'
										? 'text-green-500'
										: data.sentiment === 'negative'
											? 'text-red-500'
											: 'text-yellow-500'
								}
							>
								{data.sentiment}
							</span>
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
