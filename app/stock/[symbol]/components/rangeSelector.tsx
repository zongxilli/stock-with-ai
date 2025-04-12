'use client';

import { useCallback, useMemo } from 'react';

import { Maximize, ChartCandlestick } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

import { ChartHeightMode } from '@/app/types/stock-page/chart-advanced';
import { Toggle } from '@/components/ui/toggle';
import { cn } from '@/lib/utils';
import { LocalStorageUtils } from '@/utils/localstorage-utils';
import { MarketUtils } from '@/utils/market-utils';

interface RangeSelectorProps {
	currentRange: string;
	symbol: string;
	isLoading?: boolean; // 新增：加载状态属性
	exchangeName?: string; // 新增：交易所名称
	chartHeightMode?: ChartHeightMode; // 新增：图表高度模式
	onChartHeightModeChange?: (mode: ChartHeightMode) => void; // 新增：图表高度模式切换回调
}

export default function RangeSelector({
	currentRange,
	symbol,
	isLoading = false, // 默认为false
	exchangeName = '', // 默认为空字符串
	chartHeightMode = ChartHeightMode.NORMAL, // 默认为普通高度
	onChartHeightModeChange, // 高度模式切换回调
}: RangeSelectorProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	// const { preference, updatePreference } = useProfile();

	// 判断是否为美股市场
	const isUSMarket = MarketUtils.isUSMarket(exchangeName);

	// 定义可用的时间范围选项，增加了MAX选项
	const ranges = useMemo(
		() =>
			[
				{
					label: <ChartCandlestick className='h-4 w-4' />,
					value: 'daily-candle',
				},
				...(isUSMarket ? [{ label: '1D', value: '1d' }] : []), // 只在美股市场显示1D选项
				// { label: '5D', value: '5d' },
				// { label: '1M', value: '1mo' },
				// { label: '3M', value: '3mo' },
				// { label: '6M', value: '6mo' },
				{ label: '1Y', value: '1y' },
				{ label: '5Y', value: '5y' },
				{ label: 'MAX', value: 'max' }, // 新增MAX选项，显示全部历史数据
			] as const,
		[isUSMarket]
	);

	// const periods = useMemo(
	// 	() =>
	// 		[
	// 			{ label: '1D', value: 'd' },
	// 			{ label: '1W', value: 'w' },
	// 			{ label: '1M', value: 'm' },
	// 		] as const,
	// 	[]
	// );

	// 使用客户端路由而不是Link组件，以便于保持滚动位置
	const handleRangeChange = useCallback(
		(rangeValue: string) => {
			// 如果已经是当前选择的范围或者正在加载中，不执行操作
			if (currentRange === rangeValue || isLoading) return;

			LocalStorageUtils.setItem('AIkie_range', rangeValue);

			// 保存当前滚动位置
			const scrollPosition = window.scrollY;

			const newSearchParams = new URLSearchParams(
				searchParams.toString()
			);

			newSearchParams.set('range', rangeValue);

			router.replace(`/stock/${symbol}?${newSearchParams.toString()}`);

			// 使用setTimeout确保在路由更新后恢复滚动位置
			setTimeout(() => {
				window.scrollTo(0, scrollPosition);
			}, 0);
		},
		[currentRange, isLoading, searchParams, router, symbol]
	);

	// 切换图表高度模式
	const toggleHeightMode = useCallback(
		(isPressed: boolean) => {
			if (onChartHeightModeChange) {
				onChartHeightModeChange(
					isPressed ? ChartHeightMode.LARGE : ChartHeightMode.NORMAL
				);
			}
		},
		[onChartHeightModeChange]
	);

	const renderRangeSelectors = useCallback(() => {
		return (
			<div className='flex flex-wrap gap-2'>
				{ranges.map((range) => (
					<button
						key={range.value}
						onClick={() => handleRangeChange(range.value)}
						disabled={isLoading} // 当正在加载时禁用所有按钮
						className={cn(
							'px-3 py-1 rounded-md text-sm font-medium transition-colors',
							currentRange === range.value
								? isLoading
									? 'bg-primary/70 text-primary-foreground animate-pulse' // 当前正在加载的范围
									: 'bg-primary text-primary-foreground' // 当前选中的范围
								: 'bg-secondary hover:bg-secondary/80 text-secondary-foreground', // 未选中的范围
							isLoading && 'cursor-not-allowed opacity-70' // 加载中时降低所有按钮的不透明度
						)}
					>
						{range.label}
					</button>
				))}
			</div>
		);
	}, [handleRangeChange, currentRange, isLoading, ranges]);

	// const updatePreferencePeriod = useCallback(
	// 	(period: 'd' | 'w' | 'm') => {
	// 		if (!preference) return;

	// 		updatePreference({
	// 			chart: {
	// 				...preference.chart,
	// 				period,
	// 			},
	// 		});
	// 	},
	// 	[preference, updatePreference]
	// );

	// const renderPeriodSelectors = useCallback(() => {
	// 	if (!preference?.advancedView) return null;

	// 	return (
	// 		<div className='flex flex-wrap gap-2'>
	// 			{periods.map((period) => (
	// 				<button
	// 					key={period.value}
	// 					onClick={() => updatePreferencePeriod(period.value)}
	// 					disabled={isLoading} // 当正在加载时禁用所有按钮
	// 					className={cn(
	// 						'px-3 py-1 rounded-md text-sm font-medium transition-colors',
	// 						preference?.chart.period === period.value
	// 							? isLoading
	// 								? 'bg-primary/70 text-primary-foreground animate-pulse' // 当前正在加载的范围
	// 								: 'bg-primary text-primary-foreground' // 当前选中的范围
	// 							: 'bg-secondary hover:bg-secondary/80 text-secondary-foreground', // 未选中的范围
	// 						isLoading && 'cursor-not-allowed opacity-70' // 加载中时降低所有按钮的不透明度
	// 					)}
	// 				>
	// 					{period.label}
	// 				</button>
	// 			))}
	// 		</div>
	// 	);
	// }, [
	// 	preference?.advancedView,
	// 	preference?.chart.period,
	// 	periods,
	// 	isLoading,
	// 	updatePreferencePeriod,
	// ]);

	const renderMaxChartButton = () => {
		if (currentRange !== 'daily-candle') return null;

		return (
			<Toggle
				pressed={chartHeightMode === ChartHeightMode.LARGE}
				onPressedChange={toggleHeightMode}
				disabled={isLoading}
				aria-label='Switch to large chart size'
				title='Switch to large chart size'
			>
				<Maximize className='h-4 w-4' />
			</Toggle>
		);
	};

	return (
		<div className='flex flex-wrap items-center justify-between gap-2'>
			{renderRangeSelectors()}
			{/* {renderPeriodSelectors()} */}
			<div className='flex items-center gap-2'>
				{/* 当在高级视图模式下，显示图表高度模式切换按钮 */}
				{renderMaxChartButton()}

				{/* <Toggle
					pressed={preference?.advancedView || false}
					onPressedChange={() =>
						updatePreference({
							advancedView: !preference?.advancedView,
						})
					}
					disabled={isLoading}
					aria-label='Switch to advanced view'
				>
					<ChartCandlestick className='h-4 w-4' />
					Adv
				</Toggle> */}
			</div>
		</div>
	);
}
