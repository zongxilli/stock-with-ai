'use server';

import {
	BaseIndicatorParams,
	MultiValueIndicatorDataPoint,
} from '../types/types';
import { buildIndicatorRequest, getIndicatorData } from './utils/helpers';

// MACD参数接口
interface MACDParams extends BaseIndicatorParams {
	fastPeriod?: number; // 快线周期（默认12）
	slowPeriod?: number; // 慢线周期（默认26）
	signalPeriod?: number; // 信号线周期（默认9）
}

// MACD返回数据结构
export interface MACDDataPoint extends MultiValueIndicatorDataPoint {
	date: string;
	macd: number;
	signal: number;
	hist: number; // 修改为与API一致的字段名
}

/**
 * 获取移动平均收敛/发散(MACD)指标
 *
 * @param params.code 股票代码
 * @param params.exchange 交易所代码
 * @param params.range 时间范围
 * @param params.fastPeriod 快线周期（默认12）
 * @param params.slowPeriod 慢线周期（默认26）
 * @param params.signalPeriod 信号线周期（默认9）
 * @returns MACD数据点数组，包含macd、signal和hist值
 */
export async function getMACD(params: MACDParams): Promise<MACDDataPoint[]> {
	const {
		code,
		exchange,
		range,
		fastPeriod = 12,
		slowPeriod = 26,
		signalPeriod = 9,
	} = params;

	const symbol = `${code}.${exchange}`;

	// 构建缓存键
	const cacheKey = `eodhd_macd:${symbol}:${range}:${fastPeriod}:${slowPeriod}:${signalPeriod}`;

	// 构建请求URL，添加MACD特定参数
	const requestUrl = await buildIndicatorRequest(params, 'macd', {
		fast_period: fastPeriod,
		slow_period: slowPeriod,
		signal_period: signalPeriod,
	});

	// 直接返回API数据
	return getIndicatorData(cacheKey, requestUrl);
}
