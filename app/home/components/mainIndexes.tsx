'use client';

import { useState, useEffect } from 'react';

import { MarketCard } from '@/components/custom/card';
import { MarketCardSkeleton } from '@/components/custom/marketCardSkeleton';

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

// 预定义的期货和商品代码列表，用于生成骨架屏
const FUTURES_SYMBOLS = ['ES=F', 'YM=F', 'NQ=F', 'RTY=F'];
const COMMODITIES_SYMBOLS = ['CL=F', 'GC=F'];

export default function MainIndexes({
	initialData,
	onRefresh,
}: MainIndexesProps) {
	const [indices, setIndices] = useState<IndexData[]>(initialData || []);
	const [lastUpdated, setLastUpdated] = useState<string>('');
	const [loading, setLoading] = useState<boolean>(initialData?.length === 0);

	// 初始化和自动刷新
	useEffect(() => {
		// 设置初始数据
		if (initialData && initialData.length > 0) {
			setIndices(initialData);
			setLastUpdated(new Date().toLocaleTimeString());
			setLoading(false);
		} else {
			setLoading(true);
		}

		// 设置自动刷新定时器 - 每5秒刷新一次
		const refreshInterval = setInterval(async () => {
			if (onRefresh) {
				try {
					await onRefresh();
					setLastUpdated(new Date().toLocaleTimeString());
				} catch (error) {
					console.error('无法刷新市场数据:', error);
				}
			}
		}, 5000);

		// 清理定时器
		return () => clearInterval(refreshInterval);
	}, [initialData, onRefresh]);

	// 接收新数据更新状态
	useEffect(() => {
		if (initialData && initialData.length > 0) {
			setIndices(initialData);
			setLastUpdated(new Date().toLocaleTimeString());
			setLoading(false);
		}
	}, [initialData]);

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
				<MarketCardSkeleton key={`skeleton-${index}`} />
			));
	};

	return (
		<div className='w-full mb-6'>
			{/* 市场数据区 */}
			<div className='space-y-6'>
				{/* 期货卡片 */}
				<div>
					<h3 className='text-lg font-medium mb-3'>期货</h3>
					<div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3'>
						{loading
							? renderSkeletons(FUTURES_SYMBOLS.length)
							: categories.futures.map((item) => (
									<MarketCard
										key={item.symbol}
										name={item.name}
										price={item.price}
										change={item.change}
										changePercent={item.changePercent}
										className='bg-card hover:bg-card/90 transition-colors'
									/>
								))}
					</div>
				</div>

				{/* 商品卡片 */}
				<div>
					<h3 className='text-lg font-medium mb-3'>商品</h3>
					<div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3'>
						{loading
							? renderSkeletons(COMMODITIES_SYMBOLS.length)
							: categories.commodities.map((item) => (
									<MarketCard
										key={item.symbol}
										name={item.name}
										price={item.price}
										change={item.change}
										changePercent={item.changePercent}
										className='bg-card hover:bg-card/90 transition-colors'
									/>
								))}
					</div>
				</div>
			</div>

			{/* 更新时间提示 */}
			<div className='text-xs text-right text-gray-500 mt-4'>
				{loading ? '加载中...' : `最后更新: ${lastUpdated}`}
			</div>
		</div>
	);
}
