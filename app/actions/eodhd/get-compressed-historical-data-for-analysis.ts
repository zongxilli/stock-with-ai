'use server';

import { getHistoricalData } from './get-historical-data';
// import { getHistoricalData1MonthFull } from './get-historical-data-1-month-full';
import { TimeRange } from './types/types';
import { compressHistoricalData } from './utils/compress';

export const getCompressedHistoricalDataForAnalysis = async (
	code: string,
	exchange: string,
	range: TimeRange
): Promise<string> => {
	const historicalData = await getHistoricalData(
		code,
		exchange,
		range,
		false
	);
	const compressedHistoricalData = compressHistoricalData(
		historicalData,
		false,
		code
	);

	// const historicalData1MonthFull = await getHistoricalData1MonthFull(
	// 	code,
	// 	exchange
	// );
	// const compressedHistoricalData1MonthFull = compressHistoricalData(
	// 	historicalData1MonthFull,
	// 	true,
	// 	code
	// );

	return compressedHistoricalData;
};
