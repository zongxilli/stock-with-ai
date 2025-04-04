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
import { getDMI } from './indicators/dmi';
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
import { TechnicalIndicatorDefaultPreferences } from './indicators/utils/preferences';
import { TechnicalIndicatorPresets } from './indicators/utils/presets';
import { getVolatility } from './indicators/volatility';
import { getWMA } from './indicators/wma';
import { BaseIndicatorParams, TimeRange } from './types/types';

// 通用的指标返回结构接口
interface IndicatorWithPeriods<T> {
	// 可用的周期配置列表
	periods: number[];
	// 各个周期对应的数据
	data: Record<number, T[]>;
}

// MACD特殊结构
interface MACDResult {
	// 可用的配置列表
	configs: Array<{
		fastPeriod: number;
		slowPeriod: number;
		signalPeriod: number;
	}>;
	// 各配置对应的数据 (key格式为 "fastPeriod_slowPeriod_signalPeriod")
	data: Record<string, MACDDataPoint[]>;
}

// Bollinger Bands特殊结构
interface BollingerBandsResult {
	// 可用的配置列表
	periods: number[];
	// 各配置对应的数据
	data: Record<number, BollingerBandsDataPoint[]>;
}

// Stochastic特殊结构
interface StochasticResult {
	// 可用的配置列表
	configs: Array<{
		fastKPeriod: number;
		slowKPeriod: number;
		slowDPeriod: number;
	}>;
	// 各配置对应的数据 (key格式为 "fastKPeriod_slowKPeriod_slowDPeriod")
	data: Record<string, StochasticDataPoint[]>;
}

// StochasticRSI特殊结构
interface StochasticRSIResult {
	// 可用的配置列表
	configs: Array<{ fastKPeriod: number; fastDPeriod: number }>;
	// 各配置对应的数据 (key格式为 "fastKPeriod_fastDPeriod")
	data: Record<string, StochasticRSIDataPoint[]>;
}

// Beta特殊结构
interface BetaResult {
	// 可用的配置列表
	configs: Array<{ period: number; code2: string }>;
	// 各配置对应的数据 (key格式为 "period_code2")
	data: Record<string, any[]>;
}

// SAR特殊结构
interface SARResult {
	// 可用的配置列表
	configs: Array<{ acceleration: number; maximum: number }>;
	// 各配置对应的数据 (key格式为 "acceleration_maximum")
	data: Record<string, any[]>;
}

// 拆分调整数据特殊结构
interface SplitAdjustedResult {
	// 可用的配置列表
	periods: Array<'d' | 'w' | 'm'>;
	// 各配置对应的数据
	data: Record<string, SplitAdjustedDataPoint[]>;
}

// 完整的指标结果接口
export interface TechnicalIndicatorResult {
	sma: IndicatorWithPeriods<any> | undefined;
	ema: IndicatorWithPeriods<any> | undefined;
	wma: IndicatorWithPeriods<any> | undefined;
	rsi: IndicatorWithPeriods<any> | undefined;
	macd: MACDResult | undefined;
	bollingerBands: BollingerBandsResult | undefined;
	atr: IndicatorWithPeriods<any> | undefined;
	volatility: IndicatorWithPeriods<any> | undefined;
	stdDev: IndicatorWithPeriods<any> | undefined;
	slope: IndicatorWithPeriods<any> | undefined;
	dmi: IndicatorWithPeriods<any> | undefined;
	adx: IndicatorWithPeriods<any> | undefined;
	cci: IndicatorWithPeriods<any> | undefined;
	sar: SARResult | undefined;
	beta: BetaResult | undefined;
	stochastic: StochasticResult | undefined;
	stochasticRSI: StochasticRSIResult | undefined;
	averageVolume: IndicatorWithPeriods<any> | undefined;
	averageVolumeByPrice: IndicatorWithPeriods<any> | undefined;
	splitAdjustedData: SplitAdjustedResult | undefined;
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
): Promise<TechnicalIndicatorResult> {
	// 创建基础参数对象
	const baseParams: BaseIndicatorParams = {
		code,
		exchange,
		range,
	};

	try {
		// 初始化结果对象
		const result: TechnicalIndicatorResult = {
			sma: TechnicalIndicatorDefaultPreferences.sma
				? { periods: [], data: {} }
				: undefined,
			ema: TechnicalIndicatorDefaultPreferences.ema
				? { periods: [], data: {} }
				: undefined,
			wma: TechnicalIndicatorDefaultPreferences.wma
				? { periods: [], data: {} }
				: undefined,
			rsi: TechnicalIndicatorDefaultPreferences.rsi
				? { periods: [], data: {} }
				: undefined,
			macd: TechnicalIndicatorDefaultPreferences.macd
				? { configs: [], data: {} }
				: undefined,
			bollingerBands: TechnicalIndicatorDefaultPreferences.bollingerBands
				? { periods: [], data: {} }
				: undefined,
			atr: TechnicalIndicatorDefaultPreferences.atr
				? { periods: [], data: {} }
				: undefined,
			volatility: TechnicalIndicatorDefaultPreferences.volatility
				? { periods: [], data: {} }
				: undefined,
			stdDev: TechnicalIndicatorDefaultPreferences.stdDev
				? { periods: [], data: {} }
				: undefined,
			slope: TechnicalIndicatorDefaultPreferences.slope
				? { periods: [], data: {} }
				: undefined,
			dmi: TechnicalIndicatorDefaultPreferences.dmi
				? { periods: [], data: {} }
				: undefined,
			adx: TechnicalIndicatorDefaultPreferences.adx
				? { periods: [], data: {} }
				: undefined,
			cci: TechnicalIndicatorDefaultPreferences.cci
				? { periods: [], data: {} }
				: undefined,
			sar: TechnicalIndicatorDefaultPreferences.sar
				? { configs: [], data: {} }
				: undefined,
			beta: TechnicalIndicatorDefaultPreferences.beta
				? { configs: [], data: {} }
				: undefined,
			stochastic: TechnicalIndicatorDefaultPreferences.stochastic
				? { configs: [], data: {} }
				: undefined,
			stochasticRSI: TechnicalIndicatorDefaultPreferences.stochasticRSI
				? { configs: [], data: {} }
				: undefined,
			averageVolume: TechnicalIndicatorDefaultPreferences.averageVolume
				? { periods: [], data: {} }
				: undefined,
			averageVolumeByPrice:
				TechnicalIndicatorDefaultPreferences.averageVolumeByPrice
					? { periods: [], data: {} }
					: undefined,
			splitAdjustedData:
				TechnicalIndicatorDefaultPreferences.splitAdjusted
					? { periods: ['d', 'w', 'm'], data: {} }
					: undefined,
		};

		// 获取SMA的所有配置数据
		if (result.sma) {
			const allSmaConfigs = TechnicalIndicatorPresets.sma.standard;
			// 去重
			const uniqueSmaConfigs = allSmaConfigs.filter(
				(config, index, self) =>
					self.findIndex((c) => c.period === config.period) === index
			);

			// 设置可用的周期配置
			result.sma.periods = uniqueSmaConfigs.map(
				(config) => config.period
			);

			await Promise.all(
				uniqueSmaConfigs.map(async (config) => {
					try {
						const data = await getSMA({
							...baseParams,
							period: config.period,
						});
						result.sma!.data[config.period] = data;
					} catch (err) {
						console.error(`获取SMA(${config.period})失败:`, err);
						result.sma!.data[config.period] = [];
					}
				})
			);
		}

		// 获取EMA的所有配置数据
		if (result.ema) {
			const allEmaConfigs = TechnicalIndicatorPresets.ema.standard;
			// 去重
			const uniqueEmaConfigs = allEmaConfigs.filter(
				(config, index, self) =>
					self.findIndex((c) => c.period === config.period) === index
			);

			// 设置可用的周期配置
			result.ema.periods = uniqueEmaConfigs.map(
				(config) => config.period
			);

			await Promise.all(
				uniqueEmaConfigs.map(async (config) => {
					try {
						const data = await getEMA({
							...baseParams,
							period: config.period,
						});
						result.ema!.data[config.period] = data;
					} catch (err) {
						console.error(`获取EMA(${config.period})失败:`, err);
						result.ema!.data[config.period] = [];
					}
				})
			);
		}

		// 获取WMA的所有配置数据
		if (result.wma) {
			const allWmaConfigs = TechnicalIndicatorPresets.wma.standard;
			// 去重
			const uniqueWmaConfigs = allWmaConfigs.filter(
				(config, index, self) =>
					self.findIndex((c) => c.period === config.period) === index
			);

			// 设置可用的周期配置
			result.wma.periods = uniqueWmaConfigs.map(
				(config) => config.period
			);

			await Promise.all(
				uniqueWmaConfigs.map(async (config) => {
					try {
						const data = await getWMA({
							...baseParams,
							period: config.period,
						});
						result.wma!.data[config.period] = data;
					} catch (err) {
						console.error(`获取WMA(${config.period})失败:`, err);
						result.wma!.data[config.period] = [];
					}
				})
			);
		}

		// 获取RSI的所有配置数据
		if (result.rsi) {
			const allRsiConfigs = TechnicalIndicatorPresets.rsi.standard;
			// 去重
			const uniqueRsiConfigs = allRsiConfigs.filter(
				(config, index, self) =>
					self.findIndex((c) => c.period === config.period) === index
			);

			// 设置可用的周期配置
			result.rsi.periods = uniqueRsiConfigs.map(
				(config) => config.period
			);

			await Promise.all(
				uniqueRsiConfigs.map(async (config) => {
					try {
						const data = await getRSI({
							...baseParams,
							period: config.period,
						});
						result.rsi!.data[config.period] = data;
					} catch (err) {
						console.error(`获取RSI(${config.period})失败:`, err);
						result.rsi!.data[config.period] = [];
					}
				})
			);
		}

		// 获取MACD的所有配置数据
		if (result.macd) {
			const allMacdConfigs = TechnicalIndicatorPresets.macd.standard;
			// 去重
			const uniqueMacdConfigs = allMacdConfigs.filter(
				(config, index, self) =>
					self.findIndex(
						(c) =>
							c.fastPeriod === config.fastPeriod &&
							c.slowPeriod === config.slowPeriod &&
							c.signalPeriod === config.signalPeriod
					) === index
			);

			// 设置可用的配置
			result.macd.configs = uniqueMacdConfigs.map((config) => ({
				fastPeriod: config.fastPeriod,
				slowPeriod: config.slowPeriod,
				signalPeriod: config.signalPeriod,
			}));

			await Promise.all(
				uniqueMacdConfigs.map(async (config) => {
					try {
						const data = await getMACD({
							...baseParams,
							fastPeriod: config.fastPeriod,
							slowPeriod: config.slowPeriod,
							signalPeriod: config.signalPeriod,
						});
						const configKey = `${config.fastPeriod}_${config.slowPeriod}_${config.signalPeriod}`;
						result.macd!.data[configKey] = data;
					} catch (err) {
						console.error(
							`获取MACD(${config.fastPeriod},${config.slowPeriod},${config.signalPeriod})失败:`,
							err
						);
						const configKey = `${config.fastPeriod}_${config.slowPeriod}_${config.signalPeriod}`;
						result.macd!.data[configKey] = [];
					}
				})
			);
		}

		// 获取Bollinger Bands的所有配置数据
		if (result.bollingerBands) {
			const allBollingerConfigs =
				TechnicalIndicatorPresets.bollingerBands.standard;
			// 去重
			const uniqueBollingerConfigs = allBollingerConfigs.filter(
				(config, index, self) =>
					self.findIndex((c) => c.period === config.period) === index
			);

			// 设置可用的配置
			result.bollingerBands.periods = uniqueBollingerConfigs.map(
				(config) => config.period
			);

			await Promise.all(
				uniqueBollingerConfigs.map(async (config) => {
					try {
						const data = await getBollingerBands({
							...baseParams,
							period: config.period,
						});
						result.bollingerBands!.data[config.period] = data;
					} catch (err) {
						console.error(`获取布林带(${config.period})失败:`, err);
						result.bollingerBands!.data[config.period] = [];
					}
				})
			);
		}

		// 获取ATR的所有配置数据
		if (result.atr) {
			const allAtrConfigs = TechnicalIndicatorPresets.atr.standard;
			// 去重
			const uniqueAtrConfigs = allAtrConfigs.filter(
				(config, index, self) =>
					self.findIndex((c) => c.period === config.period) === index
			);

			// 设置可用的周期配置
			result.atr.periods = uniqueAtrConfigs.map(
				(config) => config.period
			);

			await Promise.all(
				uniqueAtrConfigs.map(async (config) => {
					try {
						const data = await getATR({
							...baseParams,
							period: config.period,
						});
						result.atr!.data[config.period] = data;
					} catch (err) {
						console.error(`获取ATR(${config.period})失败:`, err);
						result.atr!.data[config.period] = [];
					}
				})
			);
		}

		// 获取Volatility的所有配置数据
		if (result.volatility) {
			const allVolatilityConfigs =
				TechnicalIndicatorPresets.volatility.standard;
			// 去重
			const uniqueVolatilityConfigs = allVolatilityConfigs.filter(
				(config, index, self) =>
					self.findIndex((c) => c.period === config.period) === index
			);

			// 设置可用的周期配置
			result.volatility.periods = uniqueVolatilityConfigs.map(
				(config) => config.period
			);

			await Promise.all(
				uniqueVolatilityConfigs.map(async (config) => {
					try {
						const data = await getVolatility({
							...baseParams,
							period: config.period,
						});
						result.volatility!.data[config.period] = data;
					} catch (err) {
						console.error(
							`获取Volatility(${config.period})失败:`,
							err
						);
						result.volatility!.data[config.period] = [];
					}
				})
			);
		}

		// 获取StdDev的所有配置数据
		if (result.stdDev) {
			const allStdDevConfigs = TechnicalIndicatorPresets.stdDev.standard;
			// 去重
			const uniqueStdDevConfigs = allStdDevConfigs.filter(
				(config, index, self) =>
					self.findIndex((c) => c.period === config.period) === index
			);

			// 设置可用的周期配置
			result.stdDev.periods = uniqueStdDevConfigs.map(
				(config) => config.period
			);

			await Promise.all(
				uniqueStdDevConfigs.map(async (config) => {
					try {
						const data = await getStdDev({
							...baseParams,
							period: config.period,
						});
						result.stdDev!.data[config.period] = data;
					} catch (err) {
						console.error(`获取StdDev(${config.period})失败:`, err);
						result.stdDev!.data[config.period] = [];
					}
				})
			);
		}

		// 获取Slope的所有配置数据
		if (result.slope) {
			const allSlopeConfigs = TechnicalIndicatorPresets.slope.standard;
			// 去重
			const uniqueSlopeConfigs = allSlopeConfigs.filter(
				(config, index, self) =>
					self.findIndex((c) => c.period === config.period) === index
			);

			// 设置可用的周期配置
			result.slope.periods = uniqueSlopeConfigs.map(
				(config) => config.period
			);

			await Promise.all(
				uniqueSlopeConfigs.map(async (config) => {
					try {
						const data = await getSlope({
							...baseParams,
							period: config.period,
						});
						result.slope!.data[config.period] = data;
					} catch (err) {
						console.error(`获取Slope(${config.period})失败:`, err);
						result.slope!.data[config.period] = [];
					}
				})
			);
		}

		// 获取DMI的所有配置数据
		if (result.dmi) {
			const allDmiConfigs = TechnicalIndicatorPresets.dmi.standard;
			// 去重
			const uniqueDmiConfigs = allDmiConfigs.filter(
				(config, index, self) =>
					self.findIndex((c) => c.period === config.period) === index
			);

			// 设置可用的周期配置
			result.dmi.periods = uniqueDmiConfigs.map(
				(config) => config.period
			);

			await Promise.all(
				uniqueDmiConfigs.map(async (config) => {
					try {
						const data = await getDMI({
							...baseParams,
							period: config.period,
						});
						result.dmi!.data[config.period] = data;
					} catch (err) {
						console.error(`获取DMI(${config.period})失败:`, err);
						result.dmi!.data[config.period] = [];
					}
				})
			);
		}

		// 获取ADX的所有配置数据
		if (result.adx) {
			const allAdxConfigs = TechnicalIndicatorPresets.adx.standard;
			// 去重
			const uniqueAdxConfigs = allAdxConfigs.filter(
				(config, index, self) =>
					self.findIndex((c) => c.period === config.period) === index
			);

			// 设置可用的周期配置
			result.adx.periods = uniqueAdxConfigs.map(
				(config) => config.period
			);

			await Promise.all(
				uniqueAdxConfigs.map(async (config) => {
					try {
						const data = await getADX({
							...baseParams,
							period: config.period,
						});
						result.adx!.data[config.period] = data;
					} catch (err) {
						console.error(`获取ADX(${config.period})失败:`, err);
						result.adx!.data[config.period] = [];
					}
				})
			);
		}

		// 获取CCI的所有配置数据
		if (result.cci) {
			const allCciConfigs = TechnicalIndicatorPresets.cci.standard;
			// 去重
			const uniqueCciConfigs = allCciConfigs.filter(
				(config, index, self) =>
					self.findIndex((c) => c.period === config.period) === index
			);

			// 设置可用的周期配置
			result.cci.periods = uniqueCciConfigs.map(
				(config) => config.period
			);

			await Promise.all(
				uniqueCciConfigs.map(async (config) => {
					try {
						const data = await getCCI({
							...baseParams,
							period: config.period,
						});
						result.cci!.data[config.period] = data;
					} catch (err) {
						console.error(`获取CCI(${config.period})失败:`, err);
						result.cci!.data[config.period] = [];
					}
				})
			);
		}

		// 处理SAR指标
		if (result.sar) {
			const allSarConfigs = TechnicalIndicatorPresets.sar.standard;
			// 去重
			const uniqueSarConfigs = allSarConfigs.filter(
				(config, index, self) =>
					self.findIndex(
						(c) =>
							c.acceleration === config.acceleration &&
							c.maximum === config.maximum
					) === index
			);
			result.sar.configs = uniqueSarConfigs.map((config) => ({
				acceleration: config.acceleration,
				maximum: config.maximum,
			}));

			try {
				const sarData = await getSAR({
					...baseParams,
					...uniqueSarConfigs[0],
				});
				const configKey = `${uniqueSarConfigs[0].acceleration}_${uniqueSarConfigs[0].maximum}`;
				result.sar.data[configKey] = sarData;
			} catch (err) {
				console.error('获取SAR数据失败:', err);
				const configKey = `${uniqueSarConfigs[0].acceleration}_${uniqueSarConfigs[0].maximum}`;
				result.sar.data[configKey] = [];
			}

			try {
				const sarData = await getSAR({
					...baseParams,
					...uniqueSarConfigs[0],
				});
				const configKey = `${uniqueSarConfigs[0].acceleration}_${uniqueSarConfigs[0].maximum}`;
				result.sar.data[configKey] = sarData;
			} catch (err) {
				console.error('获取SAR数据失败:', err);
				const configKey = `${uniqueSarConfigs[0].acceleration}_${uniqueSarConfigs[0].maximum}`;
				result.sar.data[configKey] = [];
			}
		}

		// 获取拆分调整数据
		if (result.splitAdjustedData) {
			try {
				const splitAdjustedData = await getSplitAdjustedData({
					...baseParams,
					aggPeriod: 'd',
				});
				result.splitAdjustedData.data['d'] = splitAdjustedData;
			} catch (err) {
				console.error('获取拆分调整数据失败:', err);
				result.splitAdjustedData.data['d'] = [];
			}
		}

		// 获取Average Volume的所有配置数据
		if (result.averageVolume) {
			const allAvgVolConfigs =
				TechnicalIndicatorPresets.averageVolume.standard;
			// 去重
			const uniqueAvgVolConfigs = allAvgVolConfigs.filter(
				(config, index, self) =>
					self.findIndex((c) => c.period === config.period) === index
			);

			// 设置可用的周期配置
			result.averageVolume!.periods = uniqueAvgVolConfigs.map(
				(config) => config.period
			);

			await Promise.all(
				uniqueAvgVolConfigs.map(async (config) => {
					try {
						const data = await getAverageVolume({
							...baseParams,
							period: config.period,
						});
						result.averageVolume!.data[config.period] = data;
					} catch (err) {
						console.error(
							`获取Average Volume(${config.period})失败:`,
							err
						);
						result.averageVolume!.data[config.period] = [];
					}
				})
			);
		}

		// 获取Average Volume by Price的所有配置数据
		if (result.averageVolumeByPrice) {
			const allAvgVolCcyConfigs =
				TechnicalIndicatorPresets.averageVolumeByPrice.standard;
			// 去重
			const uniqueAvgVolCcyConfigs = allAvgVolCcyConfigs.filter(
				(config, index, self) =>
					self.findIndex((c) => c.period === config.period) === index
			);

			// 设置可用的周期配置
			result.averageVolumeByPrice!.periods = uniqueAvgVolCcyConfigs.map(
				(config) => config.period
			);

			await Promise.all(
				uniqueAvgVolCcyConfigs.map(async (config) => {
					try {
						const data = await getAverageVolumeByPrice({
							...baseParams,
							period: config.period,
						});
						result.averageVolumeByPrice!.data[config.period] = data;
					} catch (err) {
						console.error(
							`获取Average Volume by Price(${config.period})失败:`,
							err
						);
						result.averageVolumeByPrice!.data[config.period] = [];
					}
				})
			);
		}

		// 获取Beta的所有配置数据
		if (result.averageVolumeByPrice) {
			const allBetaConfigs = TechnicalIndicatorPresets.beta.standard;
			// 去重
			const uniqueBetaConfigs = allBetaConfigs.filter(
				(config, index, self) =>
					self.findIndex(
						(c) =>
							c.period === config.period &&
							c.code2 === config.code2
					) === index
			);

			// 设置可用的配置
			result.beta!.configs = uniqueBetaConfigs.map((config) => ({
				period: config.period,
				code2: config.code2,
			}));

			await Promise.all(
				uniqueBetaConfigs.map(async (config) => {
					try {
						const data = await getBETA({
							...baseParams,
							period: config.period,
							code2: config.code2,
						});
						const configKey = `${config.period}_${config.code2}`;
						result.beta!.data[configKey] = data;
					} catch (err) {
						console.error(
							`获取Beta(${config.period},${config.code2})失败:`,
							err
						);
						const configKey = `${config.period}_${config.code2}`;
						result.beta!.data[configKey] = [];
					}
				})
			);
		}

		// 获取Stochastic的所有配置数据
		if (result.stochastic) {
			const allStochasticConfigs =
				TechnicalIndicatorPresets.stochastic.standard;
			// 去重
			const uniqueStochasticConfigs = allStochasticConfigs.filter(
				(config, index, self) =>
					self.findIndex(
						(c) =>
							c.fastKPeriod === config.fastKPeriod &&
							c.slowKPeriod === config.slowKPeriod &&
							c.slowDPeriod === config.slowDPeriod
					) === index
			);

			// 设置可用的配置
			result.stochastic.configs = uniqueStochasticConfigs.map(
				(config) => ({
					fastKPeriod: config.fastKPeriod,
					slowKPeriod: config.slowKPeriod,
					slowDPeriod: config.slowDPeriod,
				})
			);

			await Promise.all(
				uniqueStochasticConfigs.map(async (config) => {
					try {
						const data = await getStochastic({
							...baseParams,
							fastKPeriod: config.fastKPeriod,
							slowKPeriod: config.slowKPeriod,
							slowDPeriod: config.slowDPeriod,
						});
						const configKey = `${config.fastKPeriod}_${config.slowKPeriod}_${config.slowDPeriod}`;
						result.stochastic!.data[configKey] = data;
					} catch (err) {
						console.error(
							`获取Stochastic(${config.fastKPeriod},${config.slowKPeriod},${config.slowDPeriod})失败:`,
							err
						);
						const configKey = `${config.fastKPeriod}_${config.slowKPeriod}_${config.slowDPeriod}`;
						result.stochastic!.data[configKey] = [];
					}
				})
			);
		}

		// 获取StochasticRSI的所有配置数据
		if (result.stochasticRSI) {
			const allStochasticRSIConfigs =
				TechnicalIndicatorPresets.stochasticRSI.standard;
			// 去重
			const uniqueStochasticRSIConfigs = allStochasticRSIConfigs.filter(
				(config, index, self) =>
					self.findIndex(
						(c) =>
							c.fastKPeriod === config.fastKPeriod &&
							c.fastDPeriod === config.fastDPeriod
					) === index
			);

			// 设置可用的配置
			result.stochasticRSI.configs = uniqueStochasticRSIConfigs.map(
				(config) => ({
					fastKPeriod: config.fastKPeriod,
					fastDPeriod: config.fastDPeriod,
				})
			);

			await Promise.all(
				uniqueStochasticRSIConfigs.map(async (config) => {
					try {
						const data = await getStochasticRSI({
							...baseParams,
							fastKPeriod: config.fastKPeriod,
							fastDPeriod: config.fastDPeriod,
						});
						const configKey = `${config.fastKPeriod}_${config.fastDPeriod}`;
						result.stochasticRSI!.data[configKey] = data;
					} catch (err) {
						console.error(
							`获取StochasticRSI(${config.fastKPeriod},${config.fastDPeriod})失败:`,
							err
						);
						const configKey = `${config.fastKPeriod}_${config.fastDPeriod}`;
						result.stochasticRSI!.data[configKey] = [];
					}
				})
			);
		}

		// 返回完整的结果对象
		return result;
	} catch (error) {
		console.error('获取技术指标数据时发生错误:', error);

		// 返回空的结果结构
		return {
			sma: { periods: [], data: {} },
			ema: { periods: [], data: {} },
			wma: { periods: [], data: {} },
			rsi: { periods: [], data: {} },
			macd: { configs: [], data: {} },
			bollingerBands: { periods: [], data: {} },
			atr: { periods: [], data: {} },
			volatility: { periods: [], data: {} },
			stdDev: { periods: [], data: {} },
			slope: { periods: [], data: {} },
			dmi: { periods: [], data: {} },
			adx: { periods: [], data: {} },
			cci: { periods: [], data: {} },
			sar: { configs: [], data: {} },
			beta: { configs: [], data: {} },
			stochastic: { configs: [], data: {} },
			stochasticRSI: { configs: [], data: {} },
			averageVolume: { periods: [], data: {} },
			averageVolumeByPrice: { periods: [], data: {} },
			splitAdjustedData: { periods: ['d', 'w', 'm'], data: {} },
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
