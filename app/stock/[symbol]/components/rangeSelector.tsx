'use client';

import Link from 'next/link';

import { cn } from '@/lib/utils';

interface RangeSelectorProps {
	currentRange: string;
	symbol: string;
}

export default function RangeSelector({
	currentRange,
	symbol,
}: RangeSelectorProps) {
	// 定义可用的时间范围选项
	const ranges = [
		{ label: '1D', value: '1d' },
		{ label: '5D', value: '5d' },
		{ label: '1M', value: '1mo' },
		{ label: '3M', value: '3mo' },
		{ label: '6M', value: '6mo' },
		{ label: '1Y', value: '1y' },
		{ label: '5Y', value: '5y' },
	];

	return (
		<div className='flex flex-wrap gap-2'>
			{ranges.map((range) => (
				<Link
					key={range.value}
					href={`/stock/${symbol}?range=${range.value}`}
					className={cn(
						'px-3 py-1 rounded-md text-sm font-medium transition-colors',
						currentRange === range.value
							? 'bg-primary text-primary-foreground'
							: 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'
					)}
				>
					{range.label}
				</Link>
			))}
		</div>
	);
}
