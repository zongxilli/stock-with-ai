'use server';

import {
	BaseIndicatorParams,
	MultiValueIndicatorDataPoint,
} from './types/types';
import { buildIndicatorRequest, getIndicatorData } from './utils/helpers';

// 布林带返回数据结构
export interface BollingerBandsDataPoint extends MultiValueIndicatorDataPoint {
	date: string;
	uband: number; // 上轨 - 与API一致
	mband: number; // 中轨 - 与API一致
	lband: number; // 下轨 - 与API一致
}

/**
 * 获取布林带(Bollinger Bands)指标
 *
 * @param params.code 股票代码
 * @param params.exchange 交易所代码
 * @param params.range 时间范围
 * @param params.period 计算周期（默认20）
 * @returns 布林带数据点数组，包含uband、mband和lband值
 */
export async function getBollingerBands(
	params: BaseIndicatorParams
): Promise<BollingerBandsDataPoint[]> {
	const { code, exchange, range, period = 20 } = params;
	const symbol = `${code}.${exchange}`;

	// 构建缓存键
	const cacheKey = `eodhd_bbands:${symbol}:${range}:${period}`;

	// 构建请求URL，布林带默认周期通常为20
	const requestUrl = await buildIndicatorRequest(
		{ ...params, period: period || 20 },
		'bbands'
	);

	// 直接返回API数据
	return getIndicatorData(cacheKey, requestUrl);
}
