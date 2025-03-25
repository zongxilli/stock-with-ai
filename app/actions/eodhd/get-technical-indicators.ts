'use server';

import { getADX } from './indicators/adx';
import { getATR } from './indicators/atr';
import { getAverageVolume } from './indicators/avgvol';
import { getAverageVolumeByPrice } from './indicators/avgvolccy';
import { getBETA } from './indicators/beta';
import {
	BollingerBandsDataPoint,
	getBollingerBands,
} from './indicators/bollinger';
import { getCCI } from './indicators/cci';
import { DMIDataPoint, getDMI } from './indicators/dmi';
import { getEMA } from './indicators/ema';
import { getMACD, MACDDataPoint } from './indicators/macd';
import { indicatorPresets } from './indicators/presets';
import { getRSI } from './indicators/rsi';
import { getSAR } from './indicators/sar';
import { getSlope } from './indicators/slope';
import { getSMA } from './indicators/sma';
import {
	getSplitAdjustedData,
	SplitAdjustedDataPoint,
} from './indicators/splitadjusted';
import { getStdDev } from './indicators/stddev';
import { getStochastic, StochasticDataPoint } from './indicators/stochastic';
import {
	getStochasticRSI,
	StochasticRSIDataPoint,
} from './indicators/stochrsi';
import { BaseIndicatorParams, TimeRange } from './indicators/types/types';
import { getVolatility } from './indicators/volatility';
import { getWMA } from './indicators/wma';

// 所有技术指标结果的接口
export interface TechnicalIndicators {
	sma: any[];
	ema: any[];
	wma: any[];
	rsi: any[];
	macd: MACDDataPoint[];
	bollingerBands: BollingerBandsDataPoint[];
	atr: any[];
	volatility: any[];
	stdDev: any[];
	slope: any[];
	dmi: DMIDataPoint[];
	adx: any[];
	cci: any[];
	sar: any[];
	beta: any[];
	stochastic: StochasticDataPoint[];
	stochasticRSI: StochasticRSIDataPoint[];
	averageVolume: any[];
	averageVolumeByPrice: any[];
	splitAdjustedData: SplitAdjustedDataPoint[];
}

/**
 * 获取股票的所有技术指标
 *
 * @param code 股票代码
 * @param exchange 交易所代码
 * @param range 时间范围
 * @returns 所有技术指标数据
 */
export async function getTechnicalIndicators(
	code: string,
	exchange: string,
	range: TimeRange
): Promise<TechnicalIndicators> {
	// 创建基础参数对象
	const baseParams: BaseIndicatorParams = {
		code,
		exchange,
		range,
	};

	try {
		// 并行获取所有指标数据
		const [
			sma,
			ema,
			wma,
			rsi,
			macd,
			bollingerBands,
			atr,
			volatility,
			stdDev,
			slope,
			dmi,
			adx,
			cci,
			sar,
			beta,
			stochastic,
			stochasticRSI,
			averageVolume,
			averageVolumeByPrice,
			splitAdjustedData,
		] = await Promise.all([
			getSMA({ ...baseParams, ...indicatorPresets.sma.default }).catch(
				(err) => {
					console.error('获取SMA数据失败:', err);
					return [];
				}
			),
			getEMA({ ...baseParams, ...indicatorPresets.ema.default }).catch(
				(err) => {
					console.error('获取EMA数据失败:', err);
					return [];
				}
			),
			getWMA({ ...baseParams, ...indicatorPresets.wma.default }).catch(
				(err) => {
					console.error('获取WMA数据失败:', err);
					return [];
				}
			),
			getRSI({ ...baseParams, ...indicatorPresets.rsi.default }).catch(
				(err) => {
					console.error('获取RSI数据失败:', err);
					return [];
				}
			),
			getMACD({
				...baseParams,
				...indicatorPresets.macd.default,
			}).catch((err) => {
				console.error('获取MACD数据失败:', err);
				return [];
			}),
			getBollingerBands({
				...baseParams,
				...indicatorPresets.bollingerBands.default,
			}).catch((err) => {
				console.error('获取布林带数据失败:', err);
				return [];
			}),
			getATR({ ...baseParams, ...indicatorPresets.atr.default }).catch(
				(err) => {
					console.error('获取ATR数据失败:', err);
					return [];
				}
			),
			getVolatility({
				...baseParams,
				...indicatorPresets.volatility.default,
			}).catch((err) => {
				console.error('获取波动率数据失败:', err);
				return [];
			}),
			getStdDev({
				...baseParams,
				...indicatorPresets.stdDev.default,
			}).catch((err) => {
				console.error('获取标准差数据失败:', err);
				return [];
			}),
			getSlope({
				...baseParams,
				...indicatorPresets.slope.default,
			}).catch((err) => {
				console.error('获取斜率数据失败:', err);
				return [];
			}),
			getDMI({ ...baseParams, ...indicatorPresets.dmi.default }).catch(
				(err) => {
					console.error('获取DMI数据失败:', err);
					return [];
				}
			),
			getADX({ ...baseParams, ...indicatorPresets.adx.default }).catch(
				(err) => {
					console.error('获取ADX数据失败:', err);
					return [];
				}
			),
			getCCI({ ...baseParams, ...indicatorPresets.cci.default }).catch(
				(err) => {
					console.error('获取CCI数据失败:', err);
					return [];
				}
			),
			getSAR({ ...baseParams, ...indicatorPresets.sar.default }).catch(
				(err) => {
					console.error('获取SAR数据失败:', err);
					return [];
				}
			),
			getBETA({ ...baseParams, ...indicatorPresets.beta.default }).catch(
				(err) => {
					console.error('获取BETA数据失败:', err);
					return [];
				}
			),
			getStochastic({
				...baseParams,
				...indicatorPresets.stochastic.default,
			}).catch((err) => {
				console.error('获取随机指标数据失败:', err);
				return [];
			}),
			getStochasticRSI({
				...baseParams,
				...indicatorPresets.stochasticRSI.default,
			}).catch((err) => {
				console.error('获取随机RSI数据失败:', err);
				return [];
			}),
			getAverageVolume({
				...baseParams,
				...indicatorPresets.averageVolume.default,
			}).catch((err) => {
				console.error('获取平均成交量数据失败:', err);
				return [];
			}),
			getAverageVolumeByPrice({
				...baseParams,
				...indicatorPresets.averageVolumeByPrice.default,
			}).catch((err) => {
				console.error('获取按金额平均成交量数据失败:', err);
				return [];
			}),
			getSplitAdjustedData({
				...baseParams,
				aggPeriod: indicatorPresets.splitAdjusted.default.aggPeriod as
					| 'd'
					| 'w'
					| 'm',
			}).catch((err) => {
				console.error('获取拆分调整数据失败:', err);
				return [];
			}),
		]);

		// 记录指标数据获取结果
		console.log(
			'sma长度:',
			sma.length,
			sma.length > 0 ? '示例:' + JSON.stringify(sma[0]) : '无数据'
		);
		console.log(
			'ema长度:',
			ema.length,
			ema.length > 0 ? '示例:' + JSON.stringify(ema[0]) : '无数据'
		);
		console.log(
			'wma长度:',
			wma.length,
			wma.length > 0 ? '示例:' + JSON.stringify(wma[0]) : '无数据'
		);
		console.log(
			'rsi长度:',
			rsi.length,
			rsi.length > 0 ? '示例:' + JSON.stringify(rsi[0]) : '无数据'
		);
		console.log(
			'macd长度:',
			macd.length,
			macd.length > 0 ? '示例:' + JSON.stringify(macd[0]) : '无数据'
		);
		console.log(
			'bollingerBands长度:',
			bollingerBands.length,
			bollingerBands.length > 0
				? '示例:' + JSON.stringify(bollingerBands[0])
				: '无数据'
		);
		console.log(
			'atr长度:',
			atr.length,
			atr.length > 0 ? '示例:' + JSON.stringify(atr[0]) : '无数据'
		);
		console.log(
			'volatility长度:',
			volatility.length,
			volatility.length > 0
				? '示例:' + JSON.stringify(volatility[0])
				: '无数据'
		);
		console.log(
			'stdDev长度:',
			stdDev.length,
			stdDev.length > 0 ? '示例:' + JSON.stringify(stdDev[0]) : '无数据'
		);
		console.log(
			'slope长度:',
			slope.length,
			slope.length > 0 ? '示例:' + JSON.stringify(slope[0]) : '无数据'
		);
		console.log(
			'dmi长度:',
			dmi.length,
			dmi.length > 0 ? '示例:' + JSON.stringify(dmi[0]) : '无数据'
		);
		console.log(
			'adx长度:',
			adx.length,
			adx.length > 0 ? '示例:' + JSON.stringify(adx[0]) : '无数据'
		);
		console.log(
			'cci长度:',
			cci.length,
			cci.length > 0 ? '示例:' + JSON.stringify(cci[0]) : '无数据'
		);
		console.log(
			'sar长度:',
			sar.length,
			sar.length > 0 ? '示例:' + JSON.stringify(sar[0]) : '无数据'
		);
		console.log(
			'beta长度:',
			beta.length,
			beta.length > 0 ? '示例:' + JSON.stringify(beta[0]) : '无数据'
		);
		console.log(
			'stochastic长度:',
			stochastic.length,
			stochastic.length > 0
				? '示例:' + JSON.stringify(stochastic[0])
				: '无数据'
		);
		console.log(
			'stochasticRSI长度:',
			stochasticRSI.length,
			stochasticRSI.length > 0
				? '示例:' + JSON.stringify(stochasticRSI[0])
				: '无数据'
		);
		console.log(
			'averageVolume长度:',
			averageVolume.length,
			averageVolume.length > 0
				? '示例:' + JSON.stringify(averageVolume[0])
				: '无数据'
		);
		console.log(
			'averageVolumeByPrice长度:',
			averageVolumeByPrice.length,
			averageVolumeByPrice.length > 0
				? '示例:' + JSON.stringify(averageVolumeByPrice[0])
				: '无数据'
		);
		console.log(
			'splitAdjustedData长度:',
			splitAdjustedData.length,
			splitAdjustedData.length > 0
				? '示例:' + JSON.stringify(splitAdjustedData[0])
				: '无数据'
		);

		// 返回所有指标数据
		return {
			sma,
			ema,
			wma,
			rsi,
			macd,
			bollingerBands,
			atr,
			volatility,
			stdDev,
			slope,
			dmi,
			adx,
			cci,
			sar,
			beta,
			stochastic,
			stochasticRSI,
			averageVolume,
			averageVolumeByPrice,
			splitAdjustedData,
		};
	} catch (error) {
		console.error('获取技术指标数据时发生错误:', error);
		// 返回空数据，避免整个请求失败
		return {
			sma: [],
			ema: [],
			wma: [],
			rsi: [],
			macd: [],
			bollingerBands: [],
			atr: [],
			volatility: [],
			stdDev: [],
			slope: [],
			dmi: [],
			adx: [],
			cci: [],
			sar: [],
			beta: [],
			stochastic: [],
			stochasticRSI: [],
			averageVolume: [],
			averageVolumeByPrice: [],
			splitAdjustedData: [],
		};
	}
}

/**
 * 获取股票的单个技术指标
 *
 * 这个函数可以用来获取特定的技术指标，避免一次性请求所有指标
 *
 * @param indicator 指标名称
 * @param code 股票代码
 * @param exchange 交易所代码
 * @param range 时间范围
 * @param period 周期（可选）
 * @returns 指标数据
 */
export async function getTechnicalIndicator(
	indicator: string,
	code: string,
	exchange: string,
	range: TimeRange,
	period?: number,
	additionalParams?: Record<string, any>
): Promise<any> {
	// 创建基础参数对象
	const baseParams: BaseIndicatorParams = {
		code,
		exchange,
		range,
	};

	// 根据指标类型获取预设值
	let params = { ...baseParams };

	// 优先使用用户指定的参数，如果没有则使用默认预设
	switch (indicator.toLowerCase()) {
		case 'sma':
			params = {
				...params,
				...indicatorPresets.sma.default,
				...additionalParams,
			};
			if (period) params.period = period;
			return getSMA(params);
		case 'ema':
			params = {
				...params,
				...indicatorPresets.ema.default,
				...additionalParams,
			};
			if (period) params.period = period;
			return getEMA(params);
		case 'wma':
			params = {
				...params,
				...indicatorPresets.wma.default,
				...additionalParams,
			};
			if (period) params.period = period;
			return getWMA(params);
		case 'rsi':
			params = {
				...params,
				...indicatorPresets.rsi.default,
				...additionalParams,
			};
			if (period) params.period = period;
			return getRSI(params);
		case 'macd':
			params = {
				...params,
				...indicatorPresets.macd.default,
				...additionalParams,
			};
			return getMACD(params);
		case 'bollinger':
		case 'bollingerbands':
			params = {
				...params,
				...indicatorPresets.bollingerBands.default,
				...additionalParams,
			};
			if (period) params.period = period;
			return getBollingerBands(params);
		case 'atr':
			params = {
				...params,
				...indicatorPresets.atr.default,
				...additionalParams,
			};
			if (period) params.period = period;
			return getATR(params);
		case 'volatility':
			params = {
				...params,
				...indicatorPresets.volatility.default,
				...additionalParams,
			};
			if (period) params.period = period;
			return getVolatility(params);
		case 'stddev':
			params = {
				...params,
				...indicatorPresets.stdDev.default,
				...additionalParams,
			};
			if (period) params.period = period;
			return getStdDev(params);
		case 'slope':
			params = {
				...params,
				...indicatorPresets.slope.default,
				...additionalParams,
			};
			if (period) params.period = period;
			return getSlope(params);
		case 'dmi':
		case 'dx':
			params = {
				...params,
				...indicatorPresets.dmi.default,
				...additionalParams,
			};
			if (period) params.period = period;
			return getDMI(params);
		case 'adx':
			params = {
				...params,
				...indicatorPresets.adx.default,
				...additionalParams,
			};
			if (period) params.period = period;
			return getADX(params);
		case 'cci':
			params = {
				...params,
				...indicatorPresets.cci.default,
				...additionalParams,
			};
			if (period) params.period = period;
			return getCCI(params);
		case 'sar':
			params = {
				...params,
				...indicatorPresets.sar.default,
				...additionalParams,
			};
			return getSAR(params);
		case 'beta':
			params = {
				...params,
				...indicatorPresets.beta.default,
				...additionalParams,
			};
			if (period) params.period = period;
			return getBETA(params);
		case 'stochastic':
			params = {
				...params,
				...indicatorPresets.stochastic.default,
				...additionalParams,
			};
			return getStochastic(params);
		case 'stochrsi':
			params = {
				...params,
				...indicatorPresets.stochasticRSI.default,
				...additionalParams,
			};
			return getStochasticRSI(params);
		case 'avgvol':
		case 'averagevolume':
			params = {
				...params,
				...indicatorPresets.averageVolume.default,
				...additionalParams,
			};
			if (period) params.period = period;
			return getAverageVolume(params);
		case 'avgvolccy':
		case 'averagevolumebyrice':
			params = {
				...params,
				...indicatorPresets.averageVolumeByPrice.default,
				...additionalParams,
			};
			if (period) params.period = period;
			return getAverageVolumeByPrice(params);
		case 'splitadjusted':
		case 'splitadjusteddata':
			// 确保将aggPeriod转换为正确的类型
			const splitParams = {
				...params,
				...additionalParams,
				aggPeriod: (indicatorPresets.splitAdjusted.default.aggPeriod ||
					'd') as 'd' | 'w' | 'm',
			};
			return getSplitAdjustedData(splitParams);
		default:
			throw new Error(`不支持的技术指标: ${indicator}`);
	}
}
