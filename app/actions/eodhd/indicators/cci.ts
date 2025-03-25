'use server';

import { BaseIndicatorParams, IndicatorDataPoint } from '../types/types';
import { buildIndicatorRequest, getIndicatorData } from './utils/helpers';

/**
 * 获取商品通道指数(CCI)
 *
 * @param params.code 股票代码
 * @param params.exchange 交易所代码
 * @param params.range 时间范围
 * @param params.period 计算周期（默认20）
 * @returns CCI数据点数组
 */
export async function getCCI(
	params: BaseIndicatorParams
): Promise<IndicatorDataPoint[]> {
	const { code, exchange, range, period = 20 } = params;
	const symbol = `${code}.${exchange}`;

	// 构建缓存键
	const cacheKey = `eodhd_cci:${symbol}:${range}:${period}`;

	// 构建请求URL，CCI默认周期通常为20
	const requestUrl = await buildIndicatorRequest(
		{ ...params, period: period || 20 },
		'cci'
	);

	return getIndicatorData(cacheKey, requestUrl);
}
