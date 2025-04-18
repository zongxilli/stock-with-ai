'use server';

import { BaseIndicatorParams } from '../types/types';

import { buildIndicatorRequest, getIndicatorData } from './utils/helpers';

/**
 * 获取简单移动平均线(SMA)指标
 *
 * @param params.code 股票代码
 * @param params.exchange 交易所代码
 * @param params.range 时间范围
 * @param params.period 计算周期（默认50）
 * @returns SMA数据点数组
 */
export async function getSMA(
	params: BaseIndicatorParams
): Promise<{ date: string; sma: number | null }[]> {
	const { code, exchange, range, period = 50 } = params;
	const symbol = `${code}.${exchange}`;

	// 构建缓存键
	const cacheKey = `eodhd_sma:${symbol}:${range}:${period}`;

	// 构建请求URL
	const requestUrl = await buildIndicatorRequest(params, 'sma');

	// 直接返回API数据
	return getIndicatorData(cacheKey, requestUrl);
}
