// lib/redis.ts
import { createClient } from 'redis';

// 创建一个全局变量来保存Redis客户端实例
const globalForRedis = global as unknown as {
	redis: ReturnType<typeof createClient> | undefined;
};

// 创建或获取Redis客户端
export const getRedisClient = () => {
	if (!globalForRedis.redis) {
		globalForRedis.redis = createClient({
			url: process.env.REDIS_URL,
		});

		// 连接错误处理
		globalForRedis.redis.on('error', (err) => {
			console.error('Redis客户端错误', err);
		});

		// 连接关闭事件处理
		globalForRedis.redis.on('end', () => {
			console.log('Redis连接已关闭');
			globalForRedis.redis = undefined; // 清除引用以便下次重新连接
		});
	}

	return globalForRedis.redis;
};

// 确保Redis连接并执行操作
export const withRedisConnection = async <T>(
	callback: (client: ReturnType<typeof createClient>) => Promise<T>
): Promise<T> => {
	const client = getRedisClient();

	// 如果客户端未连接，则连接
	if (!client.isOpen) {
		await client.connect();
		console.log('Redis客户端已连接');
	}

	// 执行回调函数
	return callback(client);
};

// 简单键值存储函数
export const setCache = async (
	key: string,
	value: any,
	expireInSeconds?: number
) => {
	try {
		return await withRedisConnection(async (client) => {
			await client.set(key, JSON.stringify(value));
			if (expireInSeconds) {
				await client.expire(key, expireInSeconds);
			}
			return true;
		});
	} catch (error) {
		console.error('Redis缓存设置失败:', error);
		return false;
	}
};

// 获取缓存值
export const getCache = async (key: string) => {
	try {
		return await withRedisConnection(async (client) => {
			const value = await client.get(key);
			return value ? JSON.parse(value) : null;
		});
	} catch (error) {
		console.error('获取缓存失败:', error);
		return null;
	}
};

// 获取所有键值对
export const getAllKeyValues = async () => {
	try {
		return await withRedisConnection(async (client) => {
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
		});
	} catch (error) {
		console.error('获取所有键值对失败:', error);
		return {};
	}
};

// 应用关闭时断开Redis连接的函数
export const disconnectRedis = async () => {
	if (globalForRedis.redis && globalForRedis.redis.isOpen) {
		await globalForRedis.redis.quit();
		console.log('Redis连接已安全关闭');
	}
};
