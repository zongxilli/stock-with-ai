'use server';

import { getHistoricalData } from './get-historical-data';
import { TimeRange } from './types/types';
import { compressMultipleHistoricalData } from './utils/compress';

/**
 * 获取主要指数的历史数据并压缩用于AI分析
 *
 * 针对不同市场返回不同的主要指数数据：
 * - 美国市场：标普500(SPY)，纳斯达克(QQQ)，道琼斯(DIA)，罗素2000(IWM)，恐慌指数(VIXY)
 * - 中国A股：上证指数(000001.SHG)，创业板指数(399006.SHE)
 *
 * @param exchange 交易所代码
 * @param range 时间范围
 * @returns 压缩后的多个指数历史数据
 */
export async function getCompressedMainIndexesHistoricalDataForAnalysis(
	exchange: string,
	range: TimeRange
): Promise<string> {
	try {
		// 确定市场类型并获取相应的指数代码
		let indexCodes: string[] = [];
		let indexExchanges: string[] = [];
		let indexSymbols: string[] = [];

		if (exchange === 'US') {
			// 美国市场指数 - 标普500, 纳斯达克, 道琼斯, 罗素2000, 恐慌指数
			// 全部使用ETF代替指数，因为它们更容易获取且波动相似
			indexCodes = ['SPY', 'QQQ', 'DIA', 'IWM', 'VIXY'];
			indexExchanges = Array(5).fill('US');
			indexSymbols = indexCodes.map(code => `${code}.US`);
		} else if (['SHG', 'SHE'].includes(exchange)) {
			// 中国A股市场指数
			indexCodes = ['000001', '399006'];
			indexExchanges = ['SHG', 'SHE'];
			indexSymbols = ['000001.SHG', '399006.SHE'];
		} else {
			// 默认使用美国市场指数
			indexCodes = ['SPY', 'QQQ', 'DIA', 'IWM', 'VIXY'];
			indexExchanges = Array(5).fill('US');
			indexSymbols = indexCodes.map(code => `${code}.US`);
		}

		// 获取所有指数的历史数据
		const indexesHistoricalData = await Promise.all(
			indexCodes.map((code, index) =>
				getHistoricalData(code, indexExchanges[index], range, true)
			)
		);

		// 压缩多个指数的历史数据
		const compressedData = compressMultipleHistoricalData(
			indexesHistoricalData,
			true,
			indexSymbols
		);

		return compressedData;
	} catch (error) {
		console.error('获取指数历史数据时出错:', error);
		throw new Error('获取主要指数历史数据失败');
	}
}
