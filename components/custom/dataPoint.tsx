'use client';

import React from 'react';

import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface DataPointProps {
	label: string;
	value: string | number | null | undefined;
	tooltip?: string;
	valueClassName?: string;
	labelClassName?: string;
}

/**
 * 可重用的数据点组件，显示标签和值的组合，支持tooltip和空值处理
 */
export function DataPoint({
	label,
	value,
	tooltip,
	valueClassName,
	labelClassName,
}: DataPointProps) {
	// 处理空值情况
	const displayValue = value !== null && value !== undefined ? value : '--';

	// 如果没有提供tooltip，则不启用tooltip功能
	if (!tooltip) {
		return (
			<div className='flex justify-between w-full py-1 border-b border-border/40 last:border-b-0'>
				<span
					className={cn(
						'text-sm text-muted-foreground',
						labelClassName
					)}
				>
					{label}
				</span>
				<span className={cn('text-sm font-medium', valueClassName)}>
					{displayValue}
				</span>
			</div>
		);
	}

	// 如果提供了tooltip，则启用tooltip功能
	return (
		<TooltipProvider>
			<div className='flex justify-between w-full py-1 border-b border-border/40 last:border-b-0'>
				<Tooltip>
					<TooltipTrigger asChild>
						<span
							className={cn(
								'text-sm text-muted-foreground cursor-help',
								labelClassName
							)}
						>
							{label}
						</span>
					</TooltipTrigger>
					<TooltipContent side='top' className='max-w-xs'>
						<p className='text-sm'>{tooltip}</p>
					</TooltipContent>
				</Tooltip>
				<span className={cn('text-sm font-medium', valueClassName)}>
					{displayValue}
				</span>
			</div>
		</TooltipProvider>
	);
}
