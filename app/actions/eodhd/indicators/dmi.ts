'use server';

import {
	BaseIndicatorParams,
	MultiValueIndicatorDataPoint,
} from '../types/types';
import { buildIndicatorRequest, getIndicatorData } from './utils/helpers';

// DMI返回数据结构
export interface DMIDataPoint extends MultiValueIndicatorDataPoint {
	date: string;
	plus_di: number; // +DI值 - 与API一致
	minus_di: number; // -DI值 - 与API一致
	dx: number; // DX值
}

/**
 * 获取方向动量指标(DMI)
 *
 * @param params.code 股票代码
 * @param params.exchange 交易所代码
 * @param params.range 时间范围
 * @param params.period 计算周期（默认14）
 * @returns DMI数据点数组，包含plus_di、minus_di和dx值
 */
export async function getDMI(
	params: BaseIndicatorParams
): Promise<DMIDataPoint[]> {
	const { code, exchange, range, period = 14 } = params;
	const symbol = `${code}.${exchange}`;

	// 构建缓存键
	const cacheKey = `eodhd_dmi:${symbol}:${range}:${period}`;

	// 构建请求URL，DMI默认周期通常为14
	const requestUrl = await buildIndicatorRequest(
		{ ...params, period: period || 14 },
		'dmi'
	);

	// 直接返回API数据
	return getIndicatorData(cacheKey, requestUrl);
}
