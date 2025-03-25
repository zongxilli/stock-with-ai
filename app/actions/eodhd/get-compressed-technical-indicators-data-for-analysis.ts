'use server';

import { getTechnicalIndicators } from './get-technical-indicators';
import { compressGetIndicatorDataResult } from './indicators/utils/compress';
import { TimeRange } from './types/types';


export const getCompressedTechnicalIndicatorsDataForAnalysis = async (
	code: string,
	exchange: string,
	range: TimeRange
): Promise<string> => {
	const technicalIndicatorsData = await getTechnicalIndicators(
		code,
		exchange,
		range
	);

	return compressGetIndicatorDataResult(technicalIndicatorsData, code);
};
