'use server';

import {
	BaseIndicatorParams,
	MultiValueIndicatorDataPoint,
} from '../types/types';
import { buildIndicatorRequest, getIndicatorData } from './utils/helpers';

// 随机RSI参数接口
interface StochasticRSIParams extends BaseIndicatorParams {
	fastKPeriod?: number; // 快速K周期（默认14）
	fastDPeriod?: number; // 快速D周期（默认14）
}

// 随机RSI返回数据结构
export interface StochasticRSIDataPoint extends MultiValueIndicatorDataPoint {
	date: string;
	fastkline: number; // K值 - 与API一致
	fastdline: number; // D值 - 与API一致
}

/**
 * 获取随机相对强弱指数(Stochastic RSI)
 *
 * @param params.code 股票代码
 * @param params.exchange 交易所代码
 * @param params.range 时间范围
 * @param params.fastKPeriod 快速K周期（默认14）
 * @param params.fastDPeriod 快速D周期（默认14）
 * @returns 随机RSI数据点数组，包含fastkline和fastdline值
 */
export async function getStochasticRSI(
	params: StochasticRSIParams
): Promise<StochasticRSIDataPoint[]> {
	const {
		code,
		exchange,
		range,
		fastKPeriod = 14,
		fastDPeriod = 14,
	} = params;

	const symbol = `${code}.${exchange}`;

	// 构建缓存键
	const cacheKey = `eodhd_stochrsi:${symbol}:${range}:${fastKPeriod}:${fastDPeriod}`;

	// 构建请求URL，添加随机RSI特定参数
	const requestUrl = await buildIndicatorRequest(params, 'stochrsi', {
		fast_kperiod: fastKPeriod,
		fast_dperiod: fastDPeriod,
	});

	// 直接返回API数据
	return getIndicatorData(cacheKey, requestUrl);
}
