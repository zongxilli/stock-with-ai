'use server';

import { getCache, setCache } from '@/lib/redis';

// 定义返回的股票信息类型
interface StockSearchResult {
	Code: string;
	Exchange: string;
	Name: string;
	Type: string;
	Country: string;
	Currency: string;
	ISIN?: string;
	previousClose?: number;
	previousCloseDate?: string;
}

// 定义搜索参数接口
interface SearchStockOptions {
	limit?: number; // 限制返回结果数量，默认15，最大500
	type?: string; // 资产类型：all, stock, etf, fund, bond, index, crypto
	exchange?: string; // 交易所代码过滤
}

/**
 * 搜索股票信息
 *
 * 使用EODHD API搜索股票信息，支持多种过滤选项
 *
 * @param symbol 搜索关键词，可以是股票代码、公司名称或ISIN代码
 * @param options 可选参数
 * @param options.limit 结果数量限制，默认15，最大500
 * @param options.type 资产类型，默认'stock'，可选值：all, stock, etf, fund, bond, index, crypto
 * @param options.exchange 交易所过滤，默认筛选美国、加拿大、中国和香港交易所
 *
 * @returns 搜索结果数组
 */
export async function searchStock(
	symbol: string,
	options: SearchStockOptions = {}
): Promise<StockSearchResult[]> {
	try {
		// 设置默认选项
		const { limit = 15, type = 'stock' } = options;

		// 默认不指定exchange时，只搜索美国、加拿大、中国和香港的股票
		// 交易所代码：US(美国), CA(加拿大), SS(上海), SZ(深圳), HK(香港)
		const targetExchanges = ['US', 'CA', 'SS', 'SZ', 'HK'];

		// 尝试从Redis缓存获取数据
		// 使用选项作为缓存键的一部分，以确保不同选项的请求有不同的缓存
		const cacheKey = `eodhd_search:${symbol}:${limit}:${type}:${options.exchange || targetExchanges.join(',')}`;
		const cachedData = await getCache(cacheKey);
		if (cachedData) {
			return cachedData;
		}

		// 获取API密钥
		const apiKey = process.env.EODHD_API_KEY;
		if (!apiKey) {
			throw new Error('EODHD API密钥未配置');
		}

		// 构建API请求参数
		const params = new URLSearchParams({
			api_token: apiKey,
			fmt: 'json',
			limit: limit.toString(),
			type: type,
		});

		// 如果提供了特定的交易所，则使用指定交易所
		if (options.exchange) {
			params.append('exchange', options.exchange);
		}

		// 构建API请求URL
		const url = `https://eodhd.com/api/search/${encodeURIComponent(symbol)}?${params}`;

		// 发送请求
		const response = await fetch(url);

		if (!response.ok) {
			throw new Error(
				`API请求失败: ${response.status} ${response.statusText}`
			);
		}

		let data = (await response.json()) as StockSearchResult[];

		// 如果没有指定特定交易所，过滤只保留目标交易所的结果
		if (!options.exchange) {
			data = data.filter((item) =>
				targetExchanges.some(
					(exchange) =>
						item.Exchange.includes(exchange) ||
						(item.Code && item.Code.endsWith(`.${exchange}`))
				)
			);
		}

		// 将数据缓存1小时 (3600秒)
		await setCache(cacheKey, data, 3600);

		return data;
	} catch (error) {
		console.error('搜索股票时出错:', error);
		throw new Error('搜索股票失败');
	}
}
