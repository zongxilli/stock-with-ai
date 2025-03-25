'use server';

import { BaseIndicatorParams, IndicatorDataPoint } from '../types/types';
import { buildIndicatorRequest, getIndicatorData } from './utils/helpers';

/**
 * 获取标准差(Standard Deviation)指标
 *
 * @param params.code 股票代码
 * @param params.exchange 交易所代码
 * @param params.range 时间范围
 * @param params.period 计算周期（默认50）
 * @returns StdDev数据点数组
 */
export async function getStdDev(
	params: BaseIndicatorParams
): Promise<IndicatorDataPoint[]> {
	const { code, exchange, range, period = 50 } = params;
	const symbol = `${code}.${exchange}`;

	// 构建缓存键
	const cacheKey = `eodhd_stddev:${symbol}:${range}:${period}`;

	// 构建请求URL
	const requestUrl = await buildIndicatorRequest(params, 'stddev');

	return getIndicatorData(cacheKey, requestUrl);
}
