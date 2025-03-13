'use client';

import { useState, useEffect } from 'react';

import { MarketCard } from '@/components/custom/card';

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

export default function MainIndexes({
	initialData,
	onRefresh,
}: MainIndexesProps) {
	const [indices, setIndices] = useState<IndexData[]>(initialData || []);
	const [lastUpdated, setLastUpdated] = useState<string>('');

	// 初始化和自动刷新
	useEffect(() => {
		// 设置初始数据
		if (initialData && initialData.length > 0) {
			setIndices(initialData);
			setLastUpdated(new Date().toLocaleTimeString());
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
		}
	}, [initialData]);

	// 分类指数
	const categorizeIndices = () => {
		const futuresSymbols = ['ES=F', 'YM=F', 'NQ=F', 'RTY=F'];
		const commoditiesSymbols = ['CL=F', 'GC=F'];

		return {
			futures: indices.filter((item) =>
				futuresSymbols.includes(item.symbol)
			),
			commodities: indices.filter((item) =>
				commoditiesSymbols.includes(item.symbol)
			),
		};
	};

	const categories = categorizeIndices();

	if (indices.length === 0) {
		return (
			<div className='w-full p-4 text-center bg-green-50'>
				<p>正在加载市场数据...</p>
			</div>
		);
	}

	return (
		<div className='w-full mb-6'>
			{/* 市场数据区 */}
			<div className='space-y-6'>
				{/* 期货卡片 */}
				<div>
					<h3 className='text-lg font-medium mb-3'>期货</h3>
					<div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3'>
						{categories.futures.map((item) => (
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
						{categories.commodities.map((item) => (
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
				最后更新: {lastUpdated}
			</div>
		</div>
	);
}
