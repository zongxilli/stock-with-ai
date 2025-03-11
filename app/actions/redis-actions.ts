'use server';

import { setCache, getAllKeyValues } from '@/lib/redis';

// 添加假数据到Redis
export async function addFakeDataToRedis() {
	const key = `market:${Date.now()}`;
	const value = {
		category: ['股票', '债券', '外汇', '商品'][
			Math.floor(Math.random() * 4)
		],
		trend: ['bullish', 'bearish', 'neutral'][Math.floor(Math.random() * 3)],
		score: Math.floor(Math.random() * 100),
		timestamp: new Date().toISOString(),
	};

	await setCache(key, value, 3600); // 1小时过期
	return { key, value };
}

// 获取所有Redis数据
export async function getAllRedisData() {
	return await getAllKeyValues();
}
