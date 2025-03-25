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
import { TechnicalIndicatorPresets } from './indicators/utils/presets';
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
			getSMA({
				...baseParams,
				...TechnicalIndicatorPresets.sma.default,
			}).catch((err) => {
				console.error('获取SMA数据失败:', err);
				return [];
			}),
			getEMA({
				...baseParams,
				...TechnicalIndicatorPresets.ema.default,
			}).catch((err) => {
				console.error('获取EMA数据失败:', err);
				return [];
			}),
			getWMA({
				...baseParams,
				...TechnicalIndicatorPresets.wma.default,
			}).catch((err) => {
				console.error('获取WMA数据失败:', err);
				return [];
			}),
			getRSI({
				...baseParams,
				...TechnicalIndicatorPresets.rsi.default,
			}).catch((err) => {
				console.error('获取RSI数据失败:', err);
				return [];
			}),
			getMACD({
				...baseParams,
				...TechnicalIndicatorPresets.macd.default,
			}).catch((err) => {
				console.error('获取MACD数据失败:', err);
				return [];
			}),
			getBollingerBands({
				...baseParams,
				...TechnicalIndicatorPresets.bollingerBands.default,
			}).catch((err) => {
				console.error('获取布林带数据失败:', err);
				return [];
			}),
			getATR({
				...baseParams,
				...TechnicalIndicatorPresets.atr.default,
			}).catch((err) => {
				console.error('获取ATR数据失败:', err);
				return [];
			}),
			getVolatility({
				...baseParams,
				...TechnicalIndicatorPresets.volatility.default,
			}).catch((err) => {
				console.error('获取波动率数据失败:', err);
				return [];
			}),
			getStdDev({
				...baseParams,
				...TechnicalIndicatorPresets.stdDev.default,
			}).catch((err) => {
				console.error('获取标准差数据失败:', err);
				return [];
			}),
			getSlope({
				...baseParams,
				...TechnicalIndicatorPresets.slope.default,
			}).catch((err) => {
				console.error('获取斜率数据失败:', err);
				return [];
			}),
			getDMI({
				...baseParams,
				...TechnicalIndicatorPresets.dmi.default,
			}).catch((err) => {
				console.error('获取DMI数据失败:', err);
				return [];
			}),
			getADX({
				...baseParams,
				...TechnicalIndicatorPresets.adx.default,
			}).catch((err) => {
				console.error('获取ADX数据失败:', err);
				return [];
			}),
			getCCI({
				...baseParams,
				...TechnicalIndicatorPresets.cci.default,
			}).catch((err) => {
				console.error('获取CCI数据失败:', err);
				return [];
			}),
			getSAR({
				...baseParams,
				...TechnicalIndicatorPresets.sar.default,
			}).catch((err) => {
				console.error('获取SAR数据失败:', err);
				return [];
			}),
			getBETA({
				...baseParams,
				...TechnicalIndicatorPresets.beta.default,
			}).catch((err) => {
				console.error('获取BETA数据失败:', err);
				return [];
			}),
			getStochastic({
				...baseParams,
				...TechnicalIndicatorPresets.stochastic.default,
			}).catch((err) => {
				console.error('获取随机指标数据失败:', err);
				return [];
			}),
			getStochasticRSI({
				...baseParams,
				...TechnicalIndicatorPresets.stochasticRSI.default,
			}).catch((err) => {
				console.error('获取随机RSI数据失败:', err);
				return [];
			}),
			getAverageVolume({
				...baseParams,
				...TechnicalIndicatorPresets.averageVolume.default,
			}).catch((err) => {
				console.error('获取平均成交量数据失败:', err);
				return [];
			}),
			getAverageVolumeByPrice({
				...baseParams,
				...TechnicalIndicatorPresets.averageVolumeByPrice.default,
			}).catch((err) => {
				console.error('获取按金额平均成交量数据失败:', err);
				return [];
			}),
			getSplitAdjustedData({
				...baseParams,
				aggPeriod: TechnicalIndicatorPresets.splitAdjusted.default
					.aggPeriod as 'd' | 'w' | 'm',
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

		// 记录指标数据获取结果
		console.log('---------- 技术指标数据获取结果 ----------');

		// 辅助函数：显示最近的10个数据点
		const logLatestDataPoints = (name: string, data: any[]): void => {
			if (!data || data.length === 0) {
				console.log(`${name}：无数据`);
				return;
			}

			// 对数据按日期排序 (假设date格式为YYYY-MM-DD)
			const sortedData = [...data].sort(
				(a, b) =>
					new Date(b.date).getTime() - new Date(a.date).getTime()
			);
			const latest10 = sortedData.slice(0, 10);

			console.log(
				`${name}：共 ${data.length} 个数据点，最近10个数据点：`
			);
			console.table(latest10);
		};

		// 显示基本指标的最近数据
		logLatestDataPoints('SMA(50)', sma);
		logLatestDataPoints('EMA(50)', ema);
		logLatestDataPoints('WMA(50)', wma);
		logLatestDataPoints('RSI(14)', rsi);
		logLatestDataPoints('MACD', macd);
		logLatestDataPoints('Bollinger Bands', bollingerBands);
		logLatestDataPoints('ATR', atr);
		logLatestDataPoints('Volatility', volatility);
		logLatestDataPoints('StdDev', stdDev);
		logLatestDataPoints('Slope', slope);
		logLatestDataPoints('DMI', dmi);
		logLatestDataPoints('ADX', adx);
		logLatestDataPoints('CCI', cci);
		logLatestDataPoints('SAR', sar);
		logLatestDataPoints('BETA', beta);
		logLatestDataPoints('Stochastic', stochastic);
		logLatestDataPoints('StochasticRSI', stochasticRSI);
		logLatestDataPoints('Average Volume', averageVolume);
		logLatestDataPoints('Average Volume by Price', averageVolumeByPrice);
		logLatestDataPoints('Split Adjusted Data', splitAdjustedData);

		console.log('---------- 获取所有Preset标准配置数据 ----------');

		// 获取SMA的所有标准配置数据
		await Promise.all(
			TechnicalIndicatorPresets.sma.standard.map(async (config) => {
				try {
					const data = await getSMA({
						...baseParams,
						period: config.period,
					});
					logLatestDataPoints(`SMA(${config.period})`, data);
				} catch (err) {
					console.error(`获取SMA(${config.period})失败:`, err);
				}
			})
		);

		// 获取EMA的所有标准配置数据
		await Promise.all(
			TechnicalIndicatorPresets.ema.standard.map(async (config) => {
				try {
					const data = await getEMA({
						...baseParams,
						period: config.period,
					});
					logLatestDataPoints(`EMA(${config.period})`, data);
				} catch (err) {
					console.error(`获取EMA(${config.period})失败:`, err);
				}
			})
		);

		// 获取WMA的所有标准配置数据
		await Promise.all(
			TechnicalIndicatorPresets.wma.standard.map(async (config) => {
				try {
					const data = await getWMA({
						...baseParams,
						period: config.period,
					});
					logLatestDataPoints(`WMA(${config.period})`, data);
				} catch (err) {
					console.error(`获取WMA(${config.period})失败:`, err);
				}
			})
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
				...TechnicalIndicatorPresets.sma.default,
				...additionalParams,
			};
			if (period) params.period = period;
			return getSMA(params);
		case 'ema':
			params = {
				...params,
				...TechnicalIndicatorPresets.ema.default,
				...additionalParams,
			};
			if (period) params.period = period;
			return getEMA(params);
		case 'wma':
			params = {
				...params,
				...TechnicalIndicatorPresets.wma.default,
				...additionalParams,
			};
			if (period) params.period = period;
			return getWMA(params);
		case 'rsi':
			params = {
				...params,
				...TechnicalIndicatorPresets.rsi.default,
				...additionalParams,
			};
			if (period) params.period = period;
			return getRSI(params);
		case 'macd':
			params = {
				...params,
				...TechnicalIndicatorPresets.macd.default,
				...additionalParams,
			};
			return getMACD(params);
		case 'bollinger':
		case 'bollingerbands':
			params = {
				...params,
				...TechnicalIndicatorPresets.bollingerBands.default,
				...additionalParams,
			};
			if (period) params.period = period;
			return getBollingerBands(params);
		case 'atr':
			params = {
				...params,
				...TechnicalIndicatorPresets.atr.default,
				...additionalParams,
			};
			if (period) params.period = period;
			return getATR(params);
		case 'volatility':
			params = {
				...params,
				...TechnicalIndicatorPresets.volatility.default,
				...additionalParams,
			};
			if (period) params.period = period;
			return getVolatility(params);
		case 'stddev':
			params = {
				...params,
				...TechnicalIndicatorPresets.stdDev.default,
				...additionalParams,
			};
			if (period) params.period = period;
			return getStdDev(params);
		case 'slope':
			params = {
				...params,
				...TechnicalIndicatorPresets.slope.default,
				...additionalParams,
			};
			if (period) params.period = period;
			return getSlope(params);
		case 'dmi':
		case 'dx':
			params = {
				...params,
				...TechnicalIndicatorPresets.dmi.default,
				...additionalParams,
			};
			if (period) params.period = period;
			return getDMI(params);
		case 'adx':
			params = {
				...params,
				...TechnicalIndicatorPresets.adx.default,
				...additionalParams,
			};
			if (period) params.period = period;
			return getADX(params);
		case 'cci':
			params = {
				...params,
				...TechnicalIndicatorPresets.cci.default,
				...additionalParams,
			};
			if (period) params.period = period;
			return getCCI(params);
		case 'sar':
			params = {
				...params,
				...TechnicalIndicatorPresets.sar.default,
				...additionalParams,
			};
			return getSAR(params);
		case 'beta':
			params = {
				...params,
				...TechnicalIndicatorPresets.beta.default,
				...additionalParams,
			};
			if (period) params.period = period;
			return getBETA(params);
		case 'stochastic':
			params = {
				...params,
				...TechnicalIndicatorPresets.stochastic.default,
				...additionalParams,
			};
			return getStochastic(params);
		case 'stochrsi':
			params = {
				...params,
				...TechnicalIndicatorPresets.stochasticRSI.default,
				...additionalParams,
			};
			return getStochasticRSI(params);
		case 'avgvol':
		case 'averagevolume':
			params = {
				...params,
				...TechnicalIndicatorPresets.averageVolume.default,
				...additionalParams,
			};
			if (period) params.period = period;
			return getAverageVolume(params);
		case 'avgvolccy':
		case 'averagevolumebyrice':
			params = {
				...params,
				...TechnicalIndicatorPresets.averageVolumeByPrice.default,
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
				aggPeriod: (TechnicalIndicatorPresets.splitAdjusted.default
					.aggPeriod || 'd') as 'd' | 'w' | 'm',
			};
			return getSplitAdjustedData(splitParams);
		default:
			throw new Error(`不支持的技术指标: ${indicator}`);
	}
}
