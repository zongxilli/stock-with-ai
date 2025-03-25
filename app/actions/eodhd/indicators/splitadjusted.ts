'use server';

import { BaseIndicatorParams } from './types/types';
import { buildIndicatorRequest, getIndicatorData } from './utils/utils';

// 拆分调整数据参数接口
interface SplitAdjustedParams extends BaseIndicatorParams {
	aggPeriod?: 'd' | 'w' | 'm'; // 聚合周期，d:日，w:周，m:月
}

// 拆分调整的股票数据点接口
export interface SplitAdjustedDataPoint {
	date: string;
	open: number;
	high: number;
	low: number;
	close: number;
	volume: number;
}

/**
 * 获取拆分调整数据(Split Adjusted Data)
 *
 * 默认情况下，OHLC值是原始值，既不调整拆分也不调整股息。
 * 而'adjusted_close'同时针对拆分和股息进行调整。
 * 如果只需要针对拆分调整的收盘价，可以使用此函数。
 *
 * @param params.code 股票代码
 * @param params.exchange 交易所代码
 * @param params.range 时间范围
 * @param params.aggPeriod 聚合周期，d:日(默认)，w:周，m:月
 * @returns 拆分调整的股票数据点数组
 */
export async function getSplitAdjustedData(
	params: SplitAdjustedParams
): Promise<SplitAdjustedDataPoint[]> {
	const { code, exchange, range, aggPeriod = 'd' } = params;

	const symbol = `${code}.${exchange}`;

	// 构建缓存键
	const cacheKey = `eodhd_splitadjusted:${symbol}:${range}:${aggPeriod}`;

	// 构建请求URL，添加拆分调整特定参数
	const requestUrl = await buildIndicatorRequest(params, 'splitadjusted', {
		agg_period: aggPeriod,
	});

	// 转换API响应数据
	const transformer = (apiData: any): SplitAdjustedDataPoint[] => {
		return Object.entries(apiData).map(([date, values]: [string, any]) => ({
			date,
			open: Number(values.open),
			high: Number(values.high),
			low: Number(values.low),
			close: Number(values.close),
			volume: Number(values.volume),
		}));
	};

	return getIndicatorData(cacheKey, requestUrl, transformer);
}
