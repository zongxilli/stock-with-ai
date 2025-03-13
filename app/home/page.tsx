'use client';

import { useState, useEffect } from 'react';

import { addFakeDataToRedis, getAllRedisData } from '../actions/redis-actions';

import MainIndexes from './components/mainIndexes';

import { getLatestMarketAnalysis } from '@/app/actions/marketAnalysis';
import { Button } from '@/components/ui/button';

export default function HomePage() {
	const [marketAnalysis, setMarketAnalysis] = useState<any>(null);
	const [redisData, setRedisData] = useState<Record<string, any> | null>(
		null
	);
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState('');
	// 仅在客户端使用时间戳
	const [timeStamp, setTimeStamp] = useState<string>('');

	// 仅在客户端设置时间戳
	useEffect(() => {
		setTimeStamp(new Date().toISOString());
	}, []);

	// 加载最新市场分析
	const loadMarketAnalysis = async () => {
		setLoading(true);
		try {
			const data = await getLatestMarketAnalysis();
			setMarketAnalysis(data);
			setMessage('成功加载市场分析数据');
			// 更新时间戳
			setTimeStamp(new Date().toISOString());
		} catch (error) {
			console.error('加载市场分析失败:', error);
			setMessage('加载市场分析失败');
		}
		setLoading(false);
	};

	// 添加假数据到Redis
	const handleAddFakeData = async () => {
		setLoading(true);
		try {
			await addFakeDataToRedis();
			setMessage('成功添加随机数据到Redis');
			// 刷新Redis数据
			loadRedisData();
		} catch (error) {
			console.error('添加Redis数据失败:', error);
			setMessage('添加Redis数据失败');
		}
		setLoading(false);
	};

	// 加载Redis数据
	const loadRedisData = async () => {
		setLoading(true);
		try {
			const data = await getAllRedisData();
			setRedisData(data);
			setMessage('成功加载Redis数据');
			// 更新时间戳
			setTimeStamp(new Date().toISOString());
		} catch (error) {
			console.error('获取Redis数据失败:', error);
			setMessage('获取Redis数据失败');
		}
		setLoading(false);
	};

	return (
		<div className='w-full'>
			{/* 主要股指组件 - 现在直接使用store，不需要传递props */}
			<MainIndexes />

			<h1 className='text-2xl font-bold mb-4'>市场分析仪表盘</h1>

			{/* 按钮组 */}
			<div className='flex gap-2 mb-4'>
				<Button onClick={loadMarketAnalysis} disabled={loading}>
					加载最新市场分析
				</Button>

				<Button
					onClick={handleAddFakeData}
					disabled={loading}
					variant='outline'
				>
					添加随机数据到Redis
				</Button>

				<Button
					onClick={loadRedisData}
					disabled={loading}
					variant='secondary'
				>
					查看Redis数据
				</Button>
			</div>

			{/* 状态消息 */}
			{message && (
				<div className='p-3 mb-4 bg-muted border rounded-md'>
					{message}
				</div>
			)}

			{/* 最近更新时间戳 - 使用suppressHydrationWarning */}
			{timeStamp && (
				<div
					suppressHydrationWarning
					className='text-xs text-muted-foreground mb-4'
				>
					Market data updated at: {timeStamp}
				</div>
			)}

			{/* 市场分析数据 */}
			{marketAnalysis && (
				<div className='mb-6'>
					<h2 className='text-xl font-semibold mb-2'>市场分析数据</h2>
					<pre className='p-3 border rounded-md bg-muted overflow-auto'>
						{JSON.stringify(marketAnalysis, null, 2)}
					</pre>
				</div>
			)}

			{/* Redis数据 */}
			{redisData && Object.keys(redisData).length > 0 && (
				<div>
					<h2 className='text-xl font-semibold mb-2'>Redis数据</h2>
					<pre className='p-3 border rounded-md bg-muted overflow-auto'>
						{JSON.stringify(redisData, null, 2)}
					</pre>
				</div>
			)}

			{redisData && Object.keys(redisData).length === 0 && (
				<div className='p-3 bg-muted border rounded-md'>
					Redis中暂无数据
				</div>
			)}
		</div>
	);
}
