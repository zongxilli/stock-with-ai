'use server';

import { BaseIndicatorParams, IndicatorDataPoint } from './types/types';
import { buildIndicatorRequest, getIndicatorData } from './utils/helpers';

/**
 * 获取波动率(Volatility)指标
 *
 * @param params.code 股票代码
 * @param params.exchange 交易所代码
 * @param params.range 时间范围
 * @param params.period 计算周期（默认50）
 * @returns Volatility数据点数组
 */
export async function getVolatility(
	params: BaseIndicatorParams
): Promise<IndicatorDataPoint[]> {
	const { code, exchange, range, period = 50 } = params;
	const symbol = `${code}.${exchange}`;

	// 构建缓存键
	const cacheKey = `eodhd_volatility:${symbol}:${range}:${period}`;

	// 构建请求URL
	const requestUrl = await buildIndicatorRequest(params, 'volatility');

	return getIndicatorData(cacheKey, requestUrl);
}
