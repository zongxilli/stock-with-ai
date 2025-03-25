'use server';

import { BaseIndicatorParams, IndicatorDataPoint } from './types/types';
import { buildIndicatorRequest, getIndicatorData } from './utils/utils';

// BETA参数接口
interface BETAParams extends BaseIndicatorParams {
	code2?: string; // 基准股票代码（默认S&P 500，GSPC.INDX）
}

/**
 * 获取贝塔系数(BETA)
 *
 * @param params.code 股票代码
 * @param params.exchange 交易所代码
 * @param params.range 时间范围
 * @param params.period 计算周期（默认50）
 * @param params.code2 基准股票代码（默认S&P 500，GSPC.INDX）
 * @returns BETA数据点数组
 */
export async function getBETA(
	params: BETAParams
): Promise<IndicatorDataPoint[]> {
	const {
		code,
		exchange,
		range,
		period = 50,
		code2 = 'GSPC.INDX', // 默认使用S&P 500指数作为基准
	} = params;

	const symbol = `${code}.${exchange}`;

	// 构建缓存键
	const cacheKey = `eodhd_beta:${symbol}:${range}:${period}:${code2}`;

	// 构建请求URL，添加BETA特定参数
	const requestUrl = await buildIndicatorRequest(
		{ ...params, period: period || 50 },
		'beta',
		{ code2 }
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
