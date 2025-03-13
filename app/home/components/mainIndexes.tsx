'use client';

import { useState, useEffect } from 'react';

import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

import { Card, CardContent } from '@/components/custom/card';

// 定义指数数据类型
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
					console.error('Failed to refresh indices data:', error);
				}
			}
		}, 5000); // 5秒刷新一次

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

	// 格式化日期和时间
	const formatDateTime = (timestamp: number | undefined) => {
		if (!timestamp) return 'N/A';

		// 确保时间戳是13位的毫秒格式
		const timestampMs =
			String(timestamp).length === 10
				? timestamp * 1000 // 如果是10位秒级时间戳，转换为毫秒
				: timestamp; // 如果已经是13位毫秒级时间戳，保持不变

		try {
			return new Date(timestampMs).toLocaleString('en-US');
		} catch (error) {
			console.error('Invalid date format:', timestamp);
			return 'N/A';
		}
	};

	if (indices.length === 0) {
		return (
			<div className='w-full p-4 text-center'>
				<p>Loading market indices data...</p>
			</div>
		);
	}

	return (
		<div className='w-full mb-6'>
			<div className='flex justify-between items-center mb-4'>
				<h2 className='text-xl font-semibold'>Major Market Indices</h2>
				{lastUpdated && (
					<span className='text-xs text-muted-foreground'>
						Last updated: {lastUpdated}
					</span>
				)}
			</div>

			<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
				{indices.map((index) => (
					<Card key={index.symbol} className='overflow-hidden'>
						<CardContent className='p-4'>
							<div className='flex flex-col gap-2'>
								<div className='flex justify-between items-start'>
									<h3 className='font-semibold'>
										{index.name}
									</h3>
									<span className='text-xs text-muted-foreground'>
										{index.symbol}
									</span>
								</div>

								<div className='flex justify-between items-end'>
									<span className='text-2xl font-bold'>
										{formatNumber(index.price)}
									</span>
									<div
										className={`flex items-center ${index.change >= 0 ? 'text-green-500' : 'text-red-500'}`}
									>
										{index.change >= 0 ? (
											<ArrowUpRight size={18} />
										) : (
											<ArrowDownRight size={18} />
										)}
										<span className='font-medium'>
											{formatNumber(index.change)} (
											{formatNumber(index.changePercent)}
											%)
										</span>
									</div>
								</div>

								<div className='grid grid-cols-2 gap-2 mt-2 text-sm'>
									<div className='flex justify-between'>
										<span className='text-muted-foreground'>
											High
										</span>
										<span>
											{formatNumber(index.dayHigh)}
										</span>
									</div>
									<div className='flex justify-between'>
										<span className='text-muted-foreground'>
											Low
										</span>
										<span>
											{formatNumber(index.dayLow)}
										</span>
									</div>
								</div>

								<div className='text-xs text-muted-foreground mt-2'>
									Market time:{' '}
									{formatDateTime(index.marketTime)}
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
