'use client';

import { useEffect } from 'react';

import { MarketCard } from '@/components/custom/card';
import { MarketCardSkeleton } from '@/components/custom/marketCardSkeleton';
import { useMarketStore } from '@/stores/marketStore';

// 预定义的期货和商品代码列表，用于生成骨架屏
const FUTURES_SYMBOLS = ['ES=F', 'YM=F', 'NQ=F', 'RTY=F'];
const COMMODITIES_SYMBOLS = ['CL=F', 'GC=F'];

export default function MainIndexes() {
	// 从store获取状态和方法
	const { indices, lastUpdated, loading, fetchIndices } = useMarketStore();

	// 初始化和自动刷新
	useEffect(() => {
		// 初始加载
		fetchIndices();

		// 设置自动刷新定时器
		const refreshInterval = setInterval(() => {
			fetchIndices();
		}, 5000);

		// 清理定时器
		return () => clearInterval(refreshInterval);
	}, [fetchIndices]);

	// 分类指数
	const categorizeIndices = () => {
		return {
			futures: indices.filter((item) =>
				FUTURES_SYMBOLS.includes(item.symbol)
			),
			commodities: indices.filter((item) =>
				COMMODITIES_SYMBOLS.includes(item.symbol)
			),
		};
	};

	const categories = categorizeIndices();

	// 渲染骨架屏
	const renderSkeletons = (count: number) => {
		return Array(count)
			.fill(0)
			.map((_, index) => (
				<div className='max-w-full w-96' key={`skeleton-${index}`}>
					<MarketCardSkeleton />
				</div>
			));
	};

	return (
		<div className='w-full'>
			{/* 市场数据区 */}
			<div className='space-y-6'>
				{/* 期货卡片 */}
				<div>
					<h3 className='text-lg font-medium mb-3'>Futures</h3>
					<div className='grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3'>
						{loading
							? renderSkeletons(FUTURES_SYMBOLS.length)
							: categories.futures.map((item) => (
									<div
										className='max-w-full w-96'
										key={item.symbol}
									>
										<MarketCard
											name={item.name}
											price={item.price}
											change={item.change}
											changePercent={item.changePercent}
											className='bg-card hover:bg-card/90 transition-colors'
										/>
									</div>
								))}
					</div>
				</div>

				{/* 商品卡片 */}
				<div>
					<h3 className='text-lg font-medium mb-3'>Commodities</h3>
					<div className='grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3'>
						{loading
							? renderSkeletons(COMMODITIES_SYMBOLS.length)
							: categories.commodities.map((item) => (
									<div
										className='max-w-full w-96'
										key={item.symbol}
									>
										<MarketCard
											name={item.name}
											price={item.price}
											change={item.change}
											changePercent={item.changePercent}
											className='bg-card hover:bg-card/90 transition-colors'
										/>
									</div>
								))}
					</div>
				</div>
			</div>

			{/* 更新时间提示 */}
			<div className='text-xs text-right text-gray-500 mt-4'>
				{loading ? 'Loading...' : `Last updated: ${lastUpdated}`}
			</div>
		</div>
	);
}
