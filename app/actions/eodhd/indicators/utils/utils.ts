'use server';

import {
	BaseIndicatorParams,
	calculateDateRange,
	formatDate,
} from '../types/types';

import { getCache, setCache } from '@/lib/redis';

/**
 * 构建基本技术指标API请求URL
 */
export async function buildIndicatorRequest(
	params: BaseIndicatorParams,
	functionName: string,
	additionalParams: Record<string, string | number> = {}
): Promise<string> {
	// 获取API密钥
	const apiKey = process.env.EODHD_API_KEY;
	if (!apiKey) {
		throw new Error('EODHD API密钥未配置');
	}

	const { code, exchange, range, period = 50 } = params;
	const symbol = `${code}.${exchange}`;

	// 计算日期范围
	const { startDate, endDate } = calculateDateRange(range);

	// 构建基本请求参数
	const requestParams = new URLSearchParams({
		api_token: apiKey,
		fmt: 'json',
		function: functionName,
		period: period.toString(),
		from: formatDate(startDate),
		to: formatDate(endDate),
		order: 'd', // 降序排列（从新到旧）
	});

	// 添加额外参数
	Object.entries(additionalParams).forEach(([key, value]) => {
		requestParams.append(key, value.toString());
	});

	// 构建完整URL
	return `https://eodhd.com/api/technical/${encodeURIComponent(symbol)}?${requestParams}`;
}

/**
 * 从缓存获取数据或发送API请求
 */
export async function getIndicatorData<T>(
	cacheKey: string,
	requestUrl: string,
	transformer: (data: any) => T
): Promise<T> {
	try {
		// 尝试从Redis缓存获取数据
		const cachedData = await getCache(cacheKey);
		if (cachedData) {
			return cachedData;
		}

		// 发送请求
		const response = await fetch(requestUrl, {
			next: { revalidate: 3600 },
		}); // 缓存1小时

		if (!response.ok) {
			throw new Error(
				`API请求失败: ${response.status} ${response.statusText}`
			);
		}

		// 解析响应
		const apiData = await response.json();

		// 验证API响应数据
		if (!apiData || typeof apiData !== 'object') {
			console.error('API返回的数据格式无效:', apiData);
			throw new Error('API返回的数据格式无效');
		}

		// 检查是否有错误消息
		if (apiData.error || apiData.message) {
			console.error('API返回错误:', apiData.error || apiData.message);
			throw new Error(`API错误: ${apiData.error || apiData.message}`);
		}

		// 如果返回空对象或空数组，记录警告
		if (
			(Array.isArray(apiData) && apiData.length === 0) ||
			(typeof apiData === 'object' && Object.keys(apiData).length === 0)
		) {
			console.warn('API返回空数据', { url: requestUrl });
		}

		// 转换数据
		const transformedData = transformer(apiData);

		// 记录转换后的数据信息
		console.log(
			`指标数据获取成功: ${cacheKey}, 数据点数量: ${
				Array.isArray(transformedData)
					? transformedData.length
					: '非数组'
			}`
		);

		// 缓存数据1小时
		await setCache(cacheKey, transformedData, 3600);

		return transformedData;
	} catch (error: any) {
		console.error('获取技术指标数据时出错:', error, { url: requestUrl });
		throw new Error(`获取技术指标数据失败: ${error.message || '未知错误'}`);
	}
}
