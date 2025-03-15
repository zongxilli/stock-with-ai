'use client';

import { useCallback } from 'react';

import { useRouter } from 'next/navigation';

import { cn } from '@/lib/utils';

interface RangeSelectorProps {
	currentRange: string;
	symbol: string;
}

export default function RangeSelector({
	currentRange,
	symbol,
}: RangeSelectorProps) {
	const router = useRouter();

	// 定义可用的时间范围选项，增加了MAX选项
	const ranges = [
		{ label: '1D', value: '1d' },
		{ label: '5D', value: '5d' },
		{ label: '1M', value: '1mo' },
		{ label: '3M', value: '3mo' },
		{ label: '6M', value: '6mo' },
		{ label: '1Y', value: '1y' },
		{ label: '5Y', value: '5y' },
		{ label: 'MAX', value: 'max' }, // 新增MAX选项，显示全部历史数据
	];

	// 使用客户端路由而不是Link组件，以便于保持滚动位置
	const handleRangeChange = useCallback(
		(rangeValue: string) => {
			// 保存当前滚动位置
			const scrollPosition = window.scrollY;

			// 修改URL但不触发完全刷新，不对symbol进行编码
			router.push(`/stock/${symbol}?range=${rangeValue}`, {
				scroll: false,
			});

			// 使用setTimeout确保在路由更新后恢复滚动位置
			setTimeout(() => {
				window.scrollTo(0, scrollPosition);
			}, 0);
		},
		[router, symbol]
	);

	return (
		<div className='flex flex-wrap gap-2'>
			{ranges.map((range) => (
				<button
					key={range.value}
					onClick={() => handleRangeChange(range.value)}
					className={cn(
						'px-3 py-1 rounded-md text-sm font-medium transition-colors',
						currentRange === range.value
							? 'bg-primary text-primary-foreground'
							: 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'
					)}
				>
					{range.label}
				</button>
			))}
		</div>
	);
}
