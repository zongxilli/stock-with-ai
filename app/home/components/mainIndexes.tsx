'use client';

import { useState, useEffect } from 'react';

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
					console.error('Failed to refresh market data:', error);
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

	// 格式化数字
	const formatNumber = (num: number | undefined) => {
		if (num === undefined) return 'N/A';
		return num.toLocaleString('en-US', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		});
	};

	// 格式化价格变化
	const formatChange = (change: number | undefined) => {
		if (change === undefined) return 'N/A';
		return change > 0 ? `+${formatNumber(change)}` : formatNumber(change);
	};

	// 格式化百分比变化
	const formatPercentChange = (change: number | undefined) => {
		if (change === undefined) return 'N/A';
		return change > 0
			? `(+${change.toFixed(2)}%)`
			: `(${change.toFixed(2)}%)`;
	};

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
			<div className='w-full p-4 text-center'>
				<p>Loading market data...</p>
			</div>
		);
	}

	// 创建小型图表图标 (模拟)
	const MiniChart = ({ positive }: { positive: boolean }) => (
		<div
			className={`h-6 w-16 flex items-center ${positive ? 'text-green-500' : 'text-red-500'}`}
		>
			<svg viewBox='0 0 50 12' className='w-full h-full'>
				<path
					d={
						positive
							? 'M0,6 Q5,2 10,7 T20,6 T30,5 T40,2 T50,4'
							: 'M0,6 Q5,10 10,3 T20,6 T30,7 T40,10 T50,8'
					}
					fill='none'
					stroke='currentColor'
					strokeWidth='1.5'
				/>
			</svg>
		</div>
	);

	return (
		<div className='w-full mb-6'>
			{/* 页签栏 */}
			<div className='flex border-b mb-4'>
				<div className='px-4 py-2 text-white bg-blue-600 font-medium rounded-t-md'>
					US
				</div>
				<div className='px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer'>
					Europe
				</div>
				<div className='px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer'>
					Asia
				</div>
				<div className='px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer'>
					Rates
				</div>
				<div className='px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-pointer'>
					Commodities
				</div>
			</div>

			{/* 市场数据 */}
			<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-0.5 border border-gray-200 rounded-md overflow-hidden bg-gray-200'>
				{/* 期货 */}
				{categories.futures.map((item) => (
					<div key={item.symbol} className='bg-black text-white p-4'>
						<div className='text-sm font-medium mb-1'>
							{item.name}
						</div>
						<div className='text-xl font-bold'>
							{formatNumber(item.price)}
						</div>
						<div className='flex items-center space-x-2'>
							<MiniChart positive={item.change >= 0} />
							<div
								className={
									item.change >= 0
										? 'text-green-500'
										: 'text-red-500'
								}
							>
								<span>{formatChange(item.change)}</span>
								<span className='ml-1'>
									{formatPercentChange(item.changePercent)}
								</span>
							</div>
						</div>
					</div>
				))}

				{/* 商品 */}
				{categories.commodities.map((item) => (
					<div key={item.symbol} className='bg-black text-white p-4'>
						<div className='text-sm font-medium mb-1'>
							{item.name}
						</div>
						<div className='text-xl font-bold'>
							{formatNumber(item.price)}
						</div>
						<div className='flex items-center space-x-2'>
							<MiniChart positive={item.change >= 0} />
							<div
								className={
									item.change >= 0
										? 'text-green-500'
										: 'text-red-500'
								}
							>
								<span>{formatChange(item.change)}</span>
								<span className='ml-1'>
									{formatPercentChange(item.changePercent)}
								</span>
							</div>
						</div>
					</div>
				))}
			</div>

			{/* 更新时间提示 */}
			<div className='text-xs text-right text-gray-500 mt-1'>
				Last updated: {lastUpdated}
			</div>
		</div>
	);
}
