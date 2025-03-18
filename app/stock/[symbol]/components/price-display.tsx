'use client';

// 显示实时价格变化的组件
export function PriceDisplay({
	change,
	changePercent,
	small = false,
}: {
	change: number;
	changePercent: number;
	small?: boolean;
}) {
	const isPositive = change >= 0;

	return (
		<span
			className={`${small ? 'text-sm' : 'text-lg'} ${isPositive ? 'text-green-500' : 'text-red-500'}`}
		>
			{isPositive ? '+' : ''}
			{change.toFixed(2)} ({isPositive ? '+' : ''}
			{changePercent.toFixed(2)}%)
		</span>
	);
}

// 旧的价格变化计算组件（作为备用）
export function PriceDisplayFallback({
	current,
	previous,
}: {
	current: number;
	previous: number | null;
}) {
	if (previous === null) return null;

	const change = current - previous;
	const percentChange = (change / previous) * 100;
	const isPositive = change >= 0;

	return (
		<span
			className={`text-lg ${isPositive ? 'text-green-500' : 'text-red-500'}`}
		>
			{isPositive ? '+' : ''}
			{change.toFixed(2)} ({isPositive ? '+' : ''}
			{percentChange.toFixed(2)}%)
		</span>
	);
}
