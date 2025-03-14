'use client';

import { useEffect } from 'react';

import { MarketCard } from '@/components/custom/card';
import { MarketCardSkeleton } from '@/components/custom/marketCardSkeleton';
import { useMarketStore } from '@/stores/marketStore';

// 所有市场指数的代码列表，用于显示和生成骨架屏
const MARKET_SYMBOLS = [
	'ES=F', // 标普500期货
	'YM=F', // 道琼斯期货
	'NQ=F', // 纳斯达克期货
	'RTY=F', // 罗素2000期货
	'CL=F', // 原油期货
	'GC=F', // 黄金期货
	'BTC-USD', // 比特币
	'^TNX', // 10年期美国国债
];

export default function MainIndexes() {
	// 从store获取状态和方法
	const { indices, lastUpdated, loading, fetchIndices } = useMarketStore();

	// 初始化和自动刷新
	useEffect(() => {
		// 初始加载
		fetchIndices();

		// 设置自动刷新定时器 - 每5秒刷新一次
		const refreshInterval = setInterval(() => {
			fetchIndices();
		}, 5000);

		// 清理定时器
		return () => clearInterval(refreshInterval);
	}, [fetchIndices]);

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
		<div className=''>
			{/* 市场数据区 */}
			<div className='space-y-6'>
				{/* 所有市场指数卡片 */}
				<div>
					<h3 className='text-lg font-medium mb-3'>Market Indices</h3>
					<div className='grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3'>
						{loading
							? renderSkeletons(MARKET_SYMBOLS.length)
							: indices.map((item) => (
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
