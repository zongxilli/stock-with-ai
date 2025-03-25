import { TechnicalIndicatorResult } from '../../get-technical-indicators';
import { compressDate } from '../../utils/compress';

export const compressGetIndicatorDataResult = (
	result: TechnicalIndicatorResult,
	symbol: string
) => {
	let compressedResult = `technical indicators for symbol: ${symbol}\n\n`;

	// 压缩sma
	const { periods: sma_periods, data: sma_data } = result.sma;
	let smaData = `sma data for ${sma_periods.join(', ')} periods:\n`;
	for (const period of sma_periods) {
		smaData += `sma period: ${period} with format: date|sma\n`;

    let periodSMAData =  '';
		for (const {date, sma} of sma_data[period]) {
			periodSMAData += `${compressDate(date)}|${sma}\n`;
		}
		smaData += periodSMAData;
	}
	compressedResult += smaData + '\n\n';

	// 压缩ema
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

	return compressedResult;
};
