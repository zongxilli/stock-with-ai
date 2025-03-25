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
		for (const { date, sma } of sma_data[period]) {
			periodSMAData += `${compressDate(date)}|${sma}\n`;
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
		for (const { date, ema } of ema_data[period]) {
			periodEMAData += `${compressDate(date)}|${ema}\n`;
		}
		emaData += periodEMAData;
	}
	compressedResult += emaData + '\n\n';

	//` 压缩wma
	const { periods: wma_periods, data: wma_data } = result.wma;
	let wmaData = `wma data for ${wma_periods.join(', ')} periods:\n`;
	for (const period of wma_periods) {
		wmaData += `wma period: ${period} with format: date|wma\n`;

		let periodWMAData = '';
		for (const { date, wma } of wma_data[period]) {
			periodWMAData += `${compressDate(date)}|${wma}\n`;
		}
		wmaData += periodWMAData;
	}
	compressedResult += wmaData + '\n\n';

	//` 压缩rsi
	const { periods: rsi_periods, data: rsi_data } = result.rsi;
	let rsiData = `rsi data for ${rsi_periods.join(', ')} periods:\n`;
	for (const period of rsi_periods) {
		rsiData += `rsi period: ${period} with format: date|rsi\n`;

		let periodRSIData = '';
		for (const { date, rsi } of rsi_data[period]) {
			periodRSIData += `${compressDate(date)}|${rsi}\n`;
		}
		rsiData += periodRSIData;
	}
	compressedResult += rsiData + '\n\n';

	//` 压缩macd
	const { configs: macd_configs, data: macd_data } = result.macd;
	let macdData = 'macd data\n';

	for (const { fastPeriod, slowPeriod, signalPeriod } of macd_configs) {
		const dataKey = `${fastPeriod}_${slowPeriod}_${signalPeriod}`;
		const data = macd_data[dataKey];

		macdData += `fastPeriod: ${fastPeriod}, slowPeriod: ${slowPeriod}, signalPeriod: ${signalPeriod} with format: date|macd|signal|divergence\n`;
		for (const { date, macd, signal, divergence } of data) {
			macdData += `${compressDate(date)}|${macd}|${signal}|${divergence}\n`;
		}
	}

	compressedResult += macdData + '\n\n';

	console.log(compressedResult);

	return compressedResult;
};
