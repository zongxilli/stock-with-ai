'use server';

import { BaseIndicatorParams, IndicatorDataPoint } from './types/types';
import { buildIndicatorRequest, getIndicatorData } from './utils/helpers';

/**
 * 获取平均方向动量指标(ADX)
 *
 * @param params.code 股票代码
 * @param params.exchange 交易所代码
 * @param params.range 时间范围
 * @param params.period 计算周期（默认14）
 * @returns ADX数据点数组
 */
export async function getADX(
	params: BaseIndicatorParams
): Promise<IndicatorDataPoint[]> {
	const { code, exchange, range, period = 14 } = params;
	const symbol = `${code}.${exchange}`;

	// 构建缓存键
	const cacheKey = `eodhd_adx:${symbol}:${range}:${period}`;

	// 构建请求URL，ADX默认周期通常为14
	const requestUrl = await buildIndicatorRequest(
		{ ...params, period: period || 14 },
		'adx'
	);

	return getIndicatorData(cacheKey, requestUrl);
}
