'use server';

import { getNewsData } from './get-news-data';
import { compressNewsData } from './utils/compress';

/**
 * 获取压缩新闻数据用于分析
 * @param code 股票代码
 * @param exchange 交易所代码
 * @param limit 限制返回的新闻条数，默认为10
 * @returns 压缩后的新闻数据字符串
 */
export const getCompressedNewsDataForAnalysis = async (
	code: string,
	exchange: string,
	limit: number = 5
): Promise<string> => {
	// 获取新闻数据
	const newsData = await getNewsData(code, exchange, limit);

	// 压缩新闻数据
	const compressedNewsData = compressNewsData(newsData, code, limit);

	return compressedNewsData;
};
