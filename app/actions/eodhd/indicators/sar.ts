'use server';

import { BaseIndicatorParams, IndicatorDataPoint } from './types/types';
import { buildIndicatorRequest, getIndicatorData } from './utils/helpers';

// SAR参数接口
interface SARParams extends BaseIndicatorParams {
	acceleration?: number; // 加速因子（默认0.02）
	maximum?: number; // 最大加速因子（默认0.20）
}

/**
 * 获取抛物线转向指标(Parabolic SAR)
 *
 * @param params.code 股票代码
 * @param params.exchange 交易所代码
 * @param params.range 时间范围
 * @param params.acceleration 加速因子（默认0.02）
 * @param params.maximum 最大加速因子（默认0.20）
 * @returns SAR数据点数组
 */
export async function getSAR(params: SARParams): Promise<IndicatorDataPoint[]> {
	const {
		code,
		exchange,
		range,
		acceleration = 0.02,
		maximum = 0.2,
	} = params;

	const symbol = `${code}.${exchange}`;

	// 构建缓存键
	const cacheKey = `eodhd_sar:${symbol}:${range}:${acceleration}:${maximum}`;

	// 构建请求URL，添加SAR特定参数
	const requestUrl = await buildIndicatorRequest(params, 'sar', {
		acceleration,
		maximum,
	});

	return getIndicatorData(cacheKey, requestUrl);
}
