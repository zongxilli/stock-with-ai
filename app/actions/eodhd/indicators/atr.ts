'use server';

import { BaseIndicatorParams, IndicatorDataPoint } from './types/types';
import { buildIndicatorRequest, getIndicatorData } from './utils/utils';

/**
 * 获取平均真实范围(ATR)指标
 *
 * @param params.code 股票代码
 * @param params.exchange 交易所代码
 * @param params.range 时间范围
 * @param params.period 计算周期（默认14）
 * @returns ATR数据点数组
 */
export async function getATR(
	params: BaseIndicatorParams
): Promise<IndicatorDataPoint[]> {
	const { code, exchange, range, period = 14 } = params;
	const symbol = `${code}.${exchange}`;

	// 构建缓存键
	const cacheKey = `eodhd_atr:${symbol}:${range}:${period}`;

	// 构建请求URL，ATR默认周期通常为14
	const requestUrl = await buildIndicatorRequest(
		{ ...params, period: period || 14 },
		'atr'
	);

	// 转换API响应数据
	const transformer = (apiData: any): IndicatorDataPoint[] => {
		return Object.entries(apiData).map(([date, value]) => ({
			date,
			value: Number(value),
		}));
	};

	return getIndicatorData(cacheKey, requestUrl, transformer);
}
