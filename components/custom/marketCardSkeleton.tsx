import * as React from 'react';

import { Card } from '@/components/custom/card';
import { cn } from '@/lib/utils';

interface MarketCardSkeletonProps
	extends React.HTMLAttributes<HTMLDivElement> {}

export const MarketCardSkeleton = React.forwardRef<
	HTMLDivElement,
	MarketCardSkeletonProps
>(({ className, ...props }, ref) => {
	return (
		<Card
			ref={ref}
			className={cn('overflow-hidden w-full h-20', className)}
			{...props}
		>
			<div className='p-3'>
				{/* 标题/名称骨架 */}
				<div className='h-5 w-2/3 bg-muted/60 rounded animate-pulse mb-2'></div>

				{/* 价格和百分比的骨架 - 放在同一行 */}
				<div className='flex justify-between items-center'>
					{/* 价格骨架 - 左侧 */}
					<div className='h-6 w-16 bg-muted/60 rounded animate-pulse'></div>

					{/* 百分比骨架 - 右侧 */}
					<div className='h-5 w-12 bg-muted/60 rounded animate-pulse'></div>
				</div>
			</div>
		</Card>
	);
});

MarketCardSkeleton.displayName = 'MarketCardSkeleton';
