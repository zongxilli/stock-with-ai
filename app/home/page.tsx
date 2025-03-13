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
			setMessage('Market analysis data loaded successfully');
			// 更新时间戳
			setTimeStamp(new Date().toISOString());
		} catch (error) {
			console.error('Failed to load market analysis:', error);
			setMessage('Failed to load market analysis');
		}
		setLoading(false);
	};

	// 添加假数据到Redis
	const handleAddFakeData = async () => {
		setLoading(true);
		try {
			await addFakeDataToRedis();
			setMessage('Random data added to Redis successfully');
			// 刷新Redis数据
			loadRedisData();
		} catch (error) {
			console.error('Failed to add Redis data:', error);
			setMessage('Failed to add Redis data');
		}
		setLoading(false);
	};

	// 加载Redis数据
	const loadRedisData = async () => {
		setLoading(true);
		try {
			const data = await getAllRedisData();
			setRedisData(data);
			setMessage('Redis data loaded successfully');
			// Update timestamp
			setTimeStamp(new Date().toISOString());
		} catch (error) {
			console.error('Failed to get Redis data:', error);
			setMessage('Failed to get Redis data');
		}
		setLoading(false);
	};

	return (
		<div className='w-full flex-col gap-6'>
			<MainIndexes />
		</div>
	);
}
