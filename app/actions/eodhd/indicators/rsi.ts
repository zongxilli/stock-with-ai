'use server';

import { BaseIndicatorParams, IndicatorDataPoint } from '../types/types';
import { buildIndicatorRequest, getIndicatorData } from './utils/helpers';

/**
 * 获取相对强弱指标(RSI)
import { createIndicatorTransformer } from './utils/utils';
 *
 * @param params.code 股票代码
 * @param params.exchange 交易所代码
 * @param params.range 时间范围
 * @param params.period 计算周期（默认14）
 * @returns RSI数据点数组
 */
export async function getRSI(
	params: BaseIndicatorParams
): Promise<IndicatorDataPoint[]> {
	const { code, exchange, range, period = 14 } = params;
	const symbol = `${code}.${exchange}`;

	// 构建缓存键
	const cacheKey = `eodhd_rsi:${symbol}:${range}:${period}`;

	// 构建请求URL，RSI默认周期通常为14
	const requestUrl = await buildIndicatorRequest(
		{ ...params, period: period || 14 },
		'rsi'
	);

	return getIndicatorData(cacheKey, requestUrl);
}
