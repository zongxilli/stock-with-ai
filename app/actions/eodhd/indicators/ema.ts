'use server';

import { BaseIndicatorParams, IndicatorDataPoint } from './types/types';
import { buildIndicatorRequest, getIndicatorData } from './utils/utils';

/**
 * 获取指数移动平均线(EMA)指标
 *
 * @param params.code 股票代码
 * @param params.exchange 交易所代码
 * @param params.range 时间范围
 * @param params.period 计算周期（默认50）
 * @returns EMA数据点数组
 */
export async function getEMA(
	params: BaseIndicatorParams
): Promise<IndicatorDataPoint[]> {
	const { code, exchange, range, period = 50 } = params;
	const symbol = `${code}.${exchange}`;

	// 构建缓存键
	const cacheKey = `eodhd_ema:${symbol}:${range}:${period}`;

	// 构建请求URL
	const requestUrl = await buildIndicatorRequest(params, 'ema');

	// 转换API响应数据
	const transformer = (apiData: any): IndicatorDataPoint[] => {
		// 检查API响应格式
		if (!apiData || typeof apiData !== 'object') {
			console.warn('EMA数据格式无效:', apiData);
			return [];
		}

		// 转换数据
		return Object.entries(apiData).map(([date, value]) => ({
			date,
			value: value === null ? null : Number(value),
		}));
	};

	return getIndicatorData(cacheKey, requestUrl, transformer);
}
