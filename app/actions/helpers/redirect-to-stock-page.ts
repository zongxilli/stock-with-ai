import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

import { getValidYahooFinanceSymbol } from '../yahoo/search-stock';

import { LocalStorageUtils } from '@/utils/localstorage-utils';
import { MarketUtils } from '@/utils/market-utils';

export const redirectToStockPage = async (
	eodhdSymbol: string,
	exchange: string = '',
	router: AppRouterInstance
) => {
	const isUSMarket = MarketUtils.isUSMarket(exchange);
	const defaultRange = isUSMarket ? '1d' : 'daily-candle';
	const range = LocalStorageUtils.getItem('AIkie_range', defaultRange);

	const validSymbol = await getValidYahooFinanceSymbol(eodhdSymbol);
	const symbol = validSymbol ?? eodhdSymbol;

	const searchParams = new URLSearchParams({
		code: eodhdSymbol,
		exchange: exchange,
		range: range,
	});

	const url = `/stock/${symbol}?${searchParams.toString()}`;

	router.push(url);
};
