import * as React from 'react';

import { cn } from '@/lib/utils';

// 基础Card组件
const Card = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={cn(
			'rounded-lg border bg-card text-card-foreground shadow-sm',
			className
		)}
		{...props}
	/>
));
Card.displayName = 'Card';

// CardHeader组件 - 简化了内边距
const CardHeader = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={cn('flex flex-col space-y-1 p-4', className)}
		{...props}
	/>
));
CardHeader.displayName = 'CardHeader';

// CardTitle组件 - 减小了字体大小
const CardTitle = React.forwardRef<
	HTMLParagraphElement,
	React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
	<h3
		ref={ref}
		className={cn(
			'text-lg font-semibold leading-none tracking-tight',
			className
		)}
		{...props}
	/>
));
CardTitle.displayName = 'CardTitle';

// CardDescription组件
const CardDescription = React.forwardRef<
	HTMLParagraphElement,
	React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
	<p
		ref={ref}
		className={cn('text-sm text-muted-foreground', className)}
		{...props}
	/>
));
CardDescription.displayName = 'CardDescription';

// CardContent组件 - 减小了内边距
const CardContent = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div ref={ref} className={cn('p-4 pt-0', className)} {...props} />
));
CardContent.displayName = 'CardContent';

// CardFooter组件 - 减小了内边距
const CardFooter = React.forwardRef<
	HTMLDivElement,
	React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
	<div
		ref={ref}
		className={cn('flex items-center p-4 pt-0', className)}
		{...props}
	/>
));
CardFooter.displayName = 'CardFooter';

// 新增：MarketCard组件 - 专门用于显示市场数据的简洁卡片
interface MarketCardProps extends React.HTMLAttributes<HTMLDivElement> {
	name: string;
	price: number;
	change: number;
	changePercent: number;
}

const MarketCard = React.forwardRef<HTMLDivElement, MarketCardProps>(
	({ name, price, change, changePercent, className, ...props }, ref) => {
		// 格式化价格显示
		const formatPrice = (num: number) => {
			return num.toLocaleString('en-US', {
				minimumFractionDigits: 2,
				maximumFractionDigits: 2,
			});
		};

		// 格式化百分比显示
		const formatPercent = (num: number) => {
			return num > 0 ? `+${num.toFixed(2)}%` : `${num.toFixed(2)}%`;
		};

		// 确定颜色：上涨为绿色，下跌为红色
		const valueColor = change >= 0 ? 'text-green-500' : 'text-red-500';

		return (
			<Card
				ref={ref}
				className={cn('overflow-hidden w-52', className)}
				{...props}
			>
				<div className='p-3'>
					{/* 标题/名称 */}
					<div className='text-sm font-medium mb-2'>{name}</div>

					{/* 价格和百分比 - 放在同一行 */}
					<div className='flex justify-between items-center'>
						{/* 价格 - 左侧 */}
						<div className='text-lg font-bold'>
							{formatPrice(price)}
						</div>

						{/* 百分比 - 右侧，带颜色 */}
						<div className={cn('text-sm font-medium', valueColor)}>
							{formatPercent(changePercent)}
						</div>
					</div>
				</div>
			</Card>
		);
	}
);
MarketCard.displayName = 'MarketCard';

export {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
	CardFooter,
	MarketCard,
};
