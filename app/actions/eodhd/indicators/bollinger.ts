'use server';

import {
	BaseIndicatorParams,
	MultiValueIndicatorDataPoint,
} from './types/types';
import { buildIndicatorRequest, getIndicatorData } from './utils/utils';

// 布林带返回数据结构
export interface BollingerBandsDataPoint extends MultiValueIndicatorDataPoint {
	date: string;
	upper: number; // 上轨
	middle: number; // 中轨
	lower: number; // 下轨
}

/**
 * 获取布林带(Bollinger Bands)指标
 *
 * @param params.code 股票代码
 * @param params.exchange 交易所代码
 * @param params.range 时间范围
 * @param params.period 计算周期（默认20）
 * @returns 布林带数据点数组，包含upper、middle和lower值
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

	// 转换API响应数据
	const transformer = (apiData: any): BollingerBandsDataPoint[] => {
		return Object.entries(apiData).map(([date, values]: [string, any]) => ({
			date,
			upper: Number(values.uband), // 上轨
			middle: Number(values.mband), // 中轨
			lower: Number(values.lband), // 下轨
		}));
	};

	return getIndicatorData(cacheKey, requestUrl, transformer);
}
