import { TechnicalIndicatorResult } from '../../get-technical-indicators';
import { compressDate } from '../../utils/compress';

export const compressGetIndicatorDataResult = (
	result: TechnicalIndicatorResult,
	symbol: string
) => {
	let compressedResult = `technical indicators for symbol: ${symbol}\n\n`;

	//` 压缩sma
	const { periods: sma_periods, data: sma_data } = result.sma;
	let smaData = `sma data for ${sma_periods.join(', ')} periods:\n`;
	for (const period of sma_periods) {
		smaData += `sma period: ${period} with format: date|sma\n`;

		let periodSMAData = '';
		if (sma_data[period] && Array.isArray(sma_data[period])) {
			for (const item of sma_data[period]) {
				if (item && item.date) {
					const { date, sma } = item;
					periodSMAData += `${compressDate(date)}|${sma}\n`;
				}
			}
		} else {
			periodSMAData += `no data available for period ${period}\n`;
		}
		smaData += periodSMAData;
	}
	compressedResult += smaData + '\n\n';

	//` 压缩ema
	const { periods: ema_periods, data: ema_data } = result.ema;
	let emaData = `ema data for ${ema_periods.join(', ')} periods:\n`;
	for (const period of ema_periods) {
		emaData += `ema period: ${period} with format: date|ema\n`;

		let periodEMAData = '';
		if (ema_data[period] && Array.isArray(ema_data[period])) {
			for (const item of ema_data[period]) {
				if (item && item.date) {
					const { date, ema } = item;
					periodEMAData += `${compressDate(date)}|${ema}\n`;
				}
			}
		} else {
			periodEMAData += `no data available for period ${period}\n`;
		}
		emaData += periodEMAData;
	}
	compressedResult += emaData + '\n\n';

	// //` 压缩wma
	// const { periods: wma_periods, data: wma_data } = result.wma;
	// let wmaData = `wma data for ${wma_periods.join(', ')} periods:\n`;
	// for (const period of wma_periods) {
	// 	wmaData += `wma period: ${period} with format: date|wma\n`;

	// 	let periodWMAData = '';
	// 	if (wma_data[period] && Array.isArray(wma_data[period])) {
	// 		for (const item of wma_data[period]) {
	// 			if (item && item.date) {
	// 				const { date, wma } = item;
	// 				periodWMAData += `${compressDate(date)}|${wma}\n`;
	// 			}
	// 		}
	// 	} else {
	// 		periodWMAData += `no data available for period ${period}\n`;
	// 	}
	// 	wmaData += periodWMAData;
	// }
	// compressedResult += wmaData + '\n\n';

	//` 压缩rsi
	const { periods: rsi_periods, data: rsi_data } = result.rsi;
	let rsiData = `rsi data for ${rsi_periods.join(', ')} periods:\n`;
	for (const period of rsi_periods) {
		rsiData += `rsi period: ${period} with format: date|rsi\n`;

		let periodRSIData = '';
		if (rsi_data[period] && Array.isArray(rsi_data[period])) {
			for (const item of rsi_data[period]) {
				if (item && item.date) {
					const { date, rsi } = item;
					periodRSIData += `${compressDate(date)}|${rsi}\n`;
				}
			}
		} else {
			periodRSIData += `no data available for period ${period}\n`;
		}
		rsiData += periodRSIData;
	}
	compressedResult += rsiData + '\n\n';

	//` 压缩macd
	const { configs: macd_configs, data: macd_data } = result.macd;
	let macdData = 'macd data\n';

	for (const { fastPeriod, slowPeriod, signalPeriod } of macd_configs) {
		const dataKey = `${fastPeriod}_${slowPeriod}_${signalPeriod}`;
		macdData += `fastPeriod: ${fastPeriod}, slowPeriod: ${slowPeriod}, signalPeriod: ${signalPeriod} with format: date|macd|signal|divergence\n`;

		let periodMACDData = '';
		if (macd_data[dataKey] && Array.isArray(macd_data[dataKey])) {
			for (const item of macd_data[dataKey]) {
				if (item && item.date) {
					const { date, macd, signal, divergence } = item;
					periodMACDData += `${compressDate(date)}|${macd}|${signal}|${divergence}\n`;
				}
			}
		} else {
			periodMACDData += `no data available for configuration ${dataKey}\n`;
		}
		macdData += periodMACDData;
	}
	compressedResult += macdData + '\n\n';

	//` 压缩布林带
	const { periods: bb_periods, data: bb_data } = result.bollingerBands;
	let bbData = `bollinger bands data for ${bb_periods.join(', ')} periods:\n`;
	for (const period of bb_periods) {
		bbData += `bollinger bands period: ${period} with format: date|middle_band|upper_band|lower_band\n`;

		let periodBBData = '';
		if (bb_data[period] && Array.isArray(bb_data[period])) {
			for (const item of bb_data[period]) {
				if (item && item.date) {
					const { date, uband, mband, lband } = item;
					periodBBData += `${compressDate(date)}|${mband}|${uband}|${lband}\n`;
				}
			}
		} else {
			periodBBData += `no data available for period ${period}\n`;
		}
		bbData += periodBBData;
	}
	compressedResult += bbData + '\n\n';

	//` 压缩atr
	const { periods: atr_periods, data: atr_data } = result.atr;
	let atrData = `atr data for ${atr_periods.join(', ')} periods:\n`;
	for (const period of atr_periods) {
		atrData += `atr period: ${period} with format: date|atr\n`;

		let periodATRData = '';
		if (atr_data[period] && Array.isArray(atr_data[period])) {
			for (const item of atr_data[period]) {
				if (item && item.date) {
					const { date, atr } = item;
					periodATRData += `${compressDate(date)}|${atr}\n`;
				}
			}
		} else {
			periodATRData += `no data available for period ${period}\n`;
		}
		atrData += periodATRData;
	}
	compressedResult += atrData + '\n\n';

	//` 压缩波动率
	const { periods: volatility_periods, data: volatility_data } =
		result.volatility;
	let volatilityData = `volatility data for ${volatility_periods.join(', ')} periods:\n`;
	for (const period of volatility_periods) {
		volatilityData += `volatility period: ${period} with format: date|volatility\n`;

		let periodVolatilityData = '';
		if (volatility_data[period] && Array.isArray(volatility_data[period])) {
			for (const item of volatility_data[period]) {
				if (item && item.date) {
					const { date, volatility } = item;
					periodVolatilityData += `${compressDate(date)}|${volatility}\n`;
				}
			}
		} else {
			periodVolatilityData += `no data available for period ${period}\n`;
		}
		volatilityData += periodVolatilityData;
	}
	compressedResult += volatilityData + '\n\n';

	//` 压缩标准差
	const { periods: stddev_periods, data: stddev_data } = result.stdDev;
	let stdDevData = `standard deviation data for ${stddev_periods.join(', ')} periods:\n`;
	for (const period of stddev_periods) {
		stdDevData += `stddev period: ${period} with format: date|stddev\n`;

		let periodStdDevData = '';
		if (stddev_data[period] && Array.isArray(stddev_data[period])) {
			for (const item of stddev_data[period]) {
				if (item && item.date) {
					const { date, stddev } = item;
					periodStdDevData += `${compressDate(date)}|${stddev}\n`;
				}
			}
		} else {
			periodStdDevData += `no data available for period ${period}\n`;
		}
		stdDevData += periodStdDevData;
	}
	compressedResult += stdDevData + '\n\n';

	// //` 压缩slope
	// const { periods: slope_periods, data: slope_data } = result.slope;
	// let slopeData = `slope data for ${slope_periods.join(', ')} periods:\n`;
	// for (const period of slope_periods) {
	// 	slopeData += `slope period: ${period} with format: date|slope\n`;

	// 	let periodSlopeData = '';
	// 	if (slope_data[period] && Array.isArray(slope_data[period])) {
	// 		for (const item of slope_data[period]) {
	// 			if (item && item.date) {
	// 				const { date, slope } = item;
	// 				periodSlopeData += `${compressDate(date)}|${slope}\n`;
	// 			}
	// 		}
	// 	} else {
	// 		periodSlopeData += `no data available for period ${period}\n`;
	// 	}
	// 	slopeData += periodSlopeData;
	// }
	// compressedResult += slopeData + '\n\n';

	//` 压缩dmi
	const { periods: dmi_periods, data: dmi_data } = result.dmi;
	let dmiData = `dmi data for ${dmi_periods.join(', ')} periods:\n`;
	for (const period of dmi_periods) {
		dmiData += `dmi period: ${period} with format: date|plus_di|minus_di|dx\n`;

		let periodDMIData = '';
		if (dmi_data[period] && Array.isArray(dmi_data[period])) {
			for (const item of dmi_data[period]) {
				if (item && item.date) {
					const { date, dmi } = item;
					periodDMIData += `${compressDate(date)}|${dmi}|${dmi}|${dmi}\n`;
				}
			}
		} else {
			periodDMIData += `no data available for period ${period}\n`;
		}
		dmiData += periodDMIData;
	}
	compressedResult += dmiData + '\n\n';

	//` 压缩adx
	const { periods: adx_periods, data: adx_data } = result.adx;
	let adxData = `adx data for ${adx_periods.join(', ')} periods:\n`;
	for (const period of adx_periods) {
		adxData += `adx period: ${period} with format: date|adx\n`;

		let periodADXData = '';
		if (adx_data[period] && Array.isArray(adx_data[period])) {
			for (const item of adx_data[period]) {
				if (item && item.date) {
					const { date, adx } = item;
					periodADXData += `${compressDate(date)}|${adx}\n`;
				}
			}
		} else {
			periodADXData += `no data available for period ${period}\n`;
		}
		adxData += periodADXData;
	}
	compressedResult += adxData + '\n\n';

	//` 压缩cci
	const { periods: cci_periods, data: cci_data } = result.cci;
	let cciData = `cci data for ${cci_periods.join(', ')} periods:\n`;
	for (const period of cci_periods) {
		cciData += `cci period: ${period} with format: date|cci\n`;

		let periodCCIData = '';
		if (cci_data[period] && Array.isArray(cci_data[period])) {
			for (const item of cci_data[period]) {
				if (item && item.date) {
					const { date, cci } = item;
					periodCCIData += `${compressDate(date)}|${cci}\n`;
				}
			}
		} else {
			periodCCIData += `no data available for period ${period}\n`;
		}
		cciData += periodCCIData;
	}
	compressedResult += cciData + '\n\n';

	// //` 压缩sar
	// const { configs: sar_configs, data: sar_data } = result.sar;
	// let sarData = 'parabolic sar data\n';

	// for (const { acceleration, maximum } of sar_configs) {
	// 	const dataKey = `${acceleration}_${maximum}`;
	// 	sarData += `acceleration: ${acceleration}, maximum: ${maximum} with format: date|sar\n`;

	// 	let periodSARData = '';
	// 	if (sar_data[dataKey] && Array.isArray(sar_data[dataKey])) {
	// 		for (const item of sar_data[dataKey]) {
	// 			if (item && item.date) {
	// 				const { date, sar } = item;
	// 				periodSARData += `${compressDate(date)}|${sar}\n`;
	// 			}
	// 		}
	// 	} else {
	// 		periodSARData += `no data available for configuration ${dataKey}\n`;
	// 	}
	// 	sarData += periodSARData;
	// }
	// compressedResult += sarData + '\n\n';

	// //` 压缩beta
	// const { configs: beta_configs, data: beta_data } = result.beta;
	// let betaData = 'beta data\n';

	// for (const { period, code2 } of beta_configs) {
	// 	const dataKey = `${period}_${code2}`;
	// 	betaData += `period: ${period}, code2: ${code2} with format: date|beta\n`;

	// 	let periodBetaData = '';
	// 	if (beta_data[dataKey] && Array.isArray(beta_data[dataKey])) {
	// 		for (const item of beta_data[dataKey]) {
	// 			if (item && item.date) {
	// 				const { date, beta } = item;
	// 				periodBetaData += `${compressDate(date)}|${beta}\n`;
	// 			}
	// 		}
	// 	} else {
	// 		periodBetaData += `no data available for configuration ${dataKey}\n`;
	// 	}
	// 	betaData += periodBetaData;
	// }
	// compressedResult += betaData + '\n\n';

	//` 压缩stochastic
	const { configs: stochastic_configs, data: stochastic_data } =
		result.stochastic;
	let stochasticData = 'stochastic data\n';

	for (const {
		fastKPeriod,
		slowKPeriod,
		slowDPeriod,
	} of stochastic_configs) {
		const dataKey = `${fastKPeriod}_${slowKPeriod}_${slowDPeriod}`;
		stochasticData += `fastKPeriod: ${fastKPeriod}, slowKPeriod: ${slowKPeriod}, slowDPeriod: ${slowDPeriod} with format: date|slowk|slowd\n`;

		let periodStochasticData = '';
		if (
			stochastic_data[dataKey] &&
			Array.isArray(stochastic_data[dataKey])
		) {
			for (const item of stochastic_data[dataKey]) {
				if (item && item.date) {
					const { date, k_values, d_values } = item;
					periodStochasticData += `${compressDate(date)}|${k_values}|${d_values}\n`;
				}
			}
		} else {
			periodStochasticData += `no data available for configuration ${dataKey}\n`;
		}
		stochasticData += periodStochasticData;
	}
	compressedResult += stochasticData + '\n\n';

	//` 压缩stochasticRSI
	const { configs: stochrsi_configs, data: stochrsi_data } =
		result.stochasticRSI;
	let stochRSIData = 'stochastic rsi data\n';

	for (const { fastKPeriod, fastDPeriod } of stochrsi_configs) {
		const dataKey = `${fastKPeriod}_${fastDPeriod}`;
		stochRSIData += `fastKPeriod: ${fastKPeriod}, fastDPeriod: ${fastDPeriod} with format: date|fastk|fastd\n`;

		let periodStochRSIData = '';
		if (stochrsi_data[dataKey] && Array.isArray(stochrsi_data[dataKey])) {
			for (const item of stochrsi_data[dataKey]) {
				if (item && item.date) {
					const { date, fastkline, fastdline } = item;
					periodStochRSIData += `${compressDate(date)}|${fastkline}|${fastdline}\n`;
				}
			}
		} else {
			periodStochRSIData += `no data available for configuration ${dataKey}\n`;
		}
		stochRSIData += periodStochRSIData;
	}
	compressedResult += stochRSIData + '\n\n';

	//` 压缩平均成交量
	const { periods: avgvol_periods, data: avgvol_data } = result.averageVolume;
	let avgVolData = `average volume data for ${avgvol_periods.join(', ')} periods:\n`;
	for (const period of avgvol_periods) {
		avgVolData += `average volume period: ${period} with format: date|avgvol\n`;

		let periodAvgVolData = '';
		if (avgvol_data[period] && Array.isArray(avgvol_data[period])) {
			for (const item of avgvol_data[period]) {
				if (item && item.date) {
					const { date, avgvol } = item;
					periodAvgVolData += `${compressDate(date)}|${avgvol}\n`;
				}
			}
		} else {
			periodAvgVolData += `no data available for period ${period}\n`;
		}
		avgVolData += periodAvgVolData;
	}
	compressedResult += avgVolData + '\n\n';

	//` 压缩按金额计算的平均成交量
	const { periods: avgvolccy_periods, data: avgvolccy_data } =
		result.averageVolumeByPrice;
	let avgVolCcyData = `average volume by price data for ${avgvolccy_periods.join(', ')} periods:\n`;
	for (const period of avgvolccy_periods) {
		avgVolCcyData += `average volume by price period: ${period} with format: date|avgvolccy\n`;

		let periodAvgVolCcyData = '';
		if (avgvolccy_data[period] && Array.isArray(avgvolccy_data[period])) {
			for (const item of avgvolccy_data[period]) {
				if (item && item.date) {
					const { date, avgvolccy } = item;
					periodAvgVolCcyData += `${compressDate(date)}|${avgvolccy}\n`;
				}
			}
		} else {
			periodAvgVolCcyData += `no data available for period ${period}\n`;
		}
		avgVolCcyData += periodAvgVolCcyData;
	}
	compressedResult += avgVolCcyData + '\n\n';

	//` 压缩拆分调整数据
	// try {
	// 	const { periods: splitadj_periods, data: splitadj_data } =
	// 		result.splitAdjustedData;
	// 	let splitAdjData = `split adjusted data for ${splitadj_periods.join(', ')} periods:\n`;

	// 	for (const period of splitadj_periods) {
	// 		splitAdjData += `split adjusted period: ${period} with format: date|open|high|low|close|volume\n`;

	// 		let periodSplitAdjData = '';
	// 		if (splitadj_data[period] && Array.isArray(splitadj_data[period])) {
	// 			for (const item of splitadj_data[period]) {
	// 				if (item && item.date) {
	// 					const { date, open, high, low, close, volume } = item;
	// 					periodSplitAdjData += `${compressDate(date)}|${open}|${high}|${low}|${close}|${volume}\n`;
	// 				}
	// 			}
	// 		} else {
	// 			periodSplitAdjData += `no data available for period ${period}\n`;
	// 		}
	// 		splitAdjData += periodSplitAdjData;
	// 	}

	// 	compressedResult += splitAdjData;
	// } catch (error) {
	// 	console.error('Error processing split adjusted data:', error);
	// 	compressedResult += 'Error processing split adjusted data\n';
	// }

	console.log('smaData.length', smaData.length);
	console.log('emaData.length', emaData.length);
	console.log('rsiData.length', rsiData.length);
	console.log('macdData.length', macdData.length);
	console.log('bbData.length', bbData.length);
	console.log('atrData.length', atrData.length);
	console.log('volatilityData.length', volatilityData.length);
	console.log('stdDevData.length', stdDevData.length);
	console.log('dmiData.length', dmiData.length);
	console.log('adxData.length', adxData.length);
	console.log('cciData.length', cciData.length);
	console.log('stochasticData.length', stochasticData.length);
	console.log('stochRSIData.length', stochRSIData.length);
	console.log('avgVolData.length', avgVolData.length);
	console.log('avgVolCcyData.length', avgVolCcyData.length);

	return compressedResult;
};
