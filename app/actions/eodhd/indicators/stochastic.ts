'use server';

import {
	BaseIndicatorParams,
	MultiValueIndicatorDataPoint,
} from './types/types';
import { buildIndicatorRequest, getIndicatorData } from './utils/utils';

// 随机指标参数接口
interface StochasticParams extends BaseIndicatorParams {
	fastKPeriod?: number; // 快速K周期（默认14）
	slowKPeriod?: number; // 慢速K周期（默认3）
	slowDPeriod?: number; // 慢速D周期（默认3）
}

// 随机指标返回数据结构
export interface StochasticDataPoint extends MultiValueIndicatorDataPoint {
	date: string;
	k: number; // K值
	d: number; // D值
}

/**
 * 获取随机指标(Stochastic Oscillator)
 *
 * @param params.code 股票代码
 * @param params.exchange 交易所代码
 * @param params.range 时间范围
 * @param params.fastKPeriod 快速K周期（默认14）
 * @param params.slowKPeriod 慢速K周期（默认3）
 * @param params.slowDPeriod 慢速D周期（默认3）
 * @returns 随机指标数据点数组，包含k和d值
 */
export async function getStochastic(
	params: StochasticParams
): Promise<StochasticDataPoint[]> {
	const {
		code,
		exchange,
		range,
		fastKPeriod = 14,
		slowKPeriod = 3,
		slowDPeriod = 3,
	} = params;

	const symbol = `${code}.${exchange}`;

	// 构建缓存键
	const cacheKey = `eodhd_stochastic:${symbol}:${range}:${fastKPeriod}:${slowKPeriod}:${slowDPeriod}`;

	// 构建请求URL，添加随机指标特定参数
	const requestUrl = await buildIndicatorRequest(params, 'stochastic', {
		fast_kperiod: fastKPeriod,
		slow_kperiod: slowKPeriod,
		slow_dperiod: slowDPeriod,
	});

	// 转换API响应数据
	const transformer = (apiData: any): StochasticDataPoint[] => {
		return Object.entries(apiData).map(([date, values]: [string, any]) => ({
			date,
			k: Number(values.k),
			d: Number(values.d),
		}));
	};

	return getIndicatorData(cacheKey, requestUrl, transformer);
}
