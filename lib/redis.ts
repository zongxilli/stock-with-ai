// lib/redis.ts
import { createClient } from 'redis';

// 创建Redis客户端
const redisClient = createClient({
	url: process.env.REDIS_URL,
});

// 连接处理
redisClient.on('error', (err) => console.log('Redis客户端错误', err));

// 连接到Redis的函数
const connectToRedis = async () => {
	if (!redisClient.isOpen) {
		await redisClient.connect();
		console.log('Redis客户端已连接');
	}
	return redisClient;
};

// 简单键值存储函数
export const setCache = async (
	key: string,
	value: any,
	expireInSeconds?: number
) => {
	try {
		const client = await connectToRedis();
		await client.set(key, JSON.stringify(value));
		if (expireInSeconds) {
			await client.expire(key, expireInSeconds);
		}
		return true;
	} catch (error) {
		console.error('Redis缓存设置失败:', error);
		return false;
	}
};

// 获取缓存值
export const getCache = async (key: string) => {
	try {
		const client = await connectToRedis();
		const value = await client.get(key);
		return value ? JSON.parse(value) : null;
	} catch (error) {
		console.error('获取缓存失败:', error);
		return null;
	}
};

// 获取所有键值对
export const getAllKeyValues = async () => {
	try {
		const client = await connectToRedis();
		const keys = await client.keys('*');
		const result: Record<string, any> = {};

		for (const key of keys) {
			const value = await client.get(key);
			if (value) {
				try {
					result[key] = JSON.parse(value);
				} catch {
					result[key] = value;
				}
			}
		}

		return result;
	} catch (error) {
		console.error('获取所有键值对失败:', error);
		return {};
	}
};
