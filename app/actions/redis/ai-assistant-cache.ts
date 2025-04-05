'use server';

import { getCache, setCache } from '@/lib/redis';

/**
 * 从Redis获取AI助手分析数据
 * @param symbol 股票代码
 * @param code 交易代码
 * @param exchange 交易所
 * @returns 缓存的分析数据或null
 */
export async function getAIAssistantCache(
  symbol: string,
  code: string,
  exchange: string
) {
  try {
    const cacheKey = `ai_assistant_data:${symbol}:${code}:${exchange}`;
    return await getCache(cacheKey);
  } catch (error) {
    console.error('获取AI助手缓存失败:', error);
    return null;
  }
}

/**
 * 将AI助手分析数据保存到Redis
 * @param symbol 股票代码
 * @param code 交易代码
 * @param exchange 交易所
 * @param data 要缓存的分析数据
 * @param expireInSeconds 过期时间（秒）
 * @returns 是否成功保存
 */
export async function setAIAssistantCache(
  symbol: string,
  code: string,
  exchange: string,
  data: any,
  expireInSeconds = 300
) {
  try {
    const cacheKey = `ai_assistant_data:${symbol}:${code}:${exchange}`;
    return await setCache(cacheKey, data, expireInSeconds);
  } catch (error) {
    console.error('保存AI助手缓存失败:', error);
    return false;
  }
}
