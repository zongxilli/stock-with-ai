'use client';

import { useState, useEffect } from 'react';

import { ArrowUpRight, ArrowDownRight, RotateCcw } from 'lucide-react';

import { Card, CardContent } from '@/components/custom/card';
import { Button } from '@/components/ui/button';

// Define index data type
interface IndexData {
	symbol: string;
	name: string;
	price: number;
	change: number;
	changePercent: number;
	dayHigh: number;
	dayLow: number;
	marketTime: number;
}

interface MainIndexesProps {
	initialData?: IndexData[];
	onRefresh?: () => Promise<void>;
}

export default function MainIndexes({
	initialData,
	onRefresh,
}: MainIndexesProps) {
	const [indices, setIndices] = useState<IndexData[]>(initialData || []);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [lastUpdated, setLastUpdated] = useState<string>('');

	useEffect(() => {
		if (initialData) {
			setIndices(initialData);
			setLastUpdated(new Date().toLocaleTimeString());
		}
	}, [initialData]);

	const handleRefresh = async () => {
		if (onRefresh) {
			setIsLoading(true);
			try {
				await onRefresh();
				setLastUpdated(new Date().toLocaleTimeString());
			} catch (error) {
				console.error('Failed to refresh data:', error);
			} finally {
				setIsLoading(false);
			}
		}
	};

	// Format numbers
	const formatNumber = (num: number | undefined) => {
		if (num === undefined) return 'N/A';
		return num.toLocaleString('en-US', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		});
	};

	// Format date and time
	const formatDateTime = (timestamp: number | undefined) => {
		if (!timestamp) return 'N/A';
		return new Date(timestamp * 1000).toLocaleString('en-US');
	};

	if (indices.length === 0) {
		return (
			<div className='w-full p-4 text-center'>
				<p>Loading market indices data...</p>
			</div>
		);
	}

	return (
		<div className='w-full mb-6'>
			<div className='flex justify-between items-center mb-4'>
				<h2 className='text-xl font-semibold'>Major Market Indices</h2>
				<div className='flex items-center gap-2'>
					{lastUpdated && (
						<span className='text-xs text-muted-foreground'>
							Last updated: {lastUpdated}
						</span>
					)}
					<Button
						variant='outline'
						size='sm'
						onClick={handleRefresh}
						disabled={isLoading}
					>
						<RotateCcw
							size={16}
							className={`mr-1 ${isLoading ? 'animate-spin' : ''}`}
						/>
						Refresh
					</Button>
				</div>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
				{indices.map((index) => (
					<Card key={index.symbol} className='overflow-hidden'>
						<CardContent className='p-4'>
							<div className='flex flex-col gap-2'>
								<div className='flex justify-between items-start'>
									<h3 className='font-semibold'>
										{index.name}
									</h3>
									<span className='text-xs text-muted-foreground'>
										{index.symbol}
									</span>
								</div>

								<div className='flex justify-between items-end'>
									<span className='text-2xl font-bold'>
										{formatNumber(index.price)}
									</span>
									<div
										className={`flex items-center ${index.change >= 0 ? 'text-green-500' : 'text-red-500'}`}
									>
										{index.change >= 0 ? (
											<ArrowUpRight size={18} />
										) : (
											<ArrowDownRight size={18} />
										)}
										<span className='font-medium'>
											{formatNumber(index.change)} (
											{formatNumber(index.changePercent)}
											%)
										</span>
									</div>
								</div>

								<div className='grid grid-cols-2 gap-2 mt-2 text-sm'>
									<div className='flex justify-between'>
										<span className='text-muted-foreground'>
											High
										</span>
										<span>
											{formatNumber(index.dayHigh)}
										</span>
									</div>
									<div className='flex justify-between'>
										<span className='text-muted-foreground'>
											Low
										</span>
										<span>
											{formatNumber(index.dayLow)}
										</span>
									</div>
								</div>

								<div className='text-xs text-muted-foreground mt-2'>
									Market time:{' '}
									{formatDateTime(index.marketTime)}
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
