'use client';

import { PriceDisplay, PriceDisplayFallback } from './price-display';

// 股票实时数据类型
interface StockRealTimeData {
	// 基本识别信息
	symbol: string;
	name: string;

	// 价格和涨跌信息
	price: number;
	change: number;
	changePercent: number;
	dayHigh: number;
	dayLow: number;
	previousClose: number;
	open: number;

	// 盘前盘后价格
	preMarketPrice?: number;
	preMarketChange?: number;
	preMarketChangePercent?: number;
	preMarketTime?: number;
	postMarketPrice?: number;
	postMarketChange?: number;
	postMarketChangePercent?: number;
	postMarketTime?: number;

	// 成交量信息
	marketVolume: number;

	// 52周高低点
	fiftyTwoWeekHigh: number;
	fiftyTwoWeekLow: number;

	// 市场信息
	marketTime: number;
	marketState?: string; // 'REGULAR', 'PRE', 'POST', 'CLOSED' 等
	exchangeName?: string;
}

interface StockHeaderProps {
	stockName: string;
	stockSymbol: string;
	realTimeData: StockRealTimeData | null;
	chartData: any | null;
	loading: boolean;
}

export default function StockHeader({
	stockName,
	stockSymbol,
	realTimeData,
	chartData,
	loading,
}: StockHeaderProps) {
	// 判断是否显示盘前价格
	const shouldShowPreMarketPrice = () => {
		if (
			!realTimeData ||
			typeof realTimeData !== 'object' ||
			!('preMarketPrice' in realTimeData)
		)
			return false;

		// 检查是否有有效的盘前数据
		const hasValidPreMarketData =
			realTimeData.preMarketPrice !== undefined &&
			realTimeData.preMarketChange !== undefined;

		// 如果市场处于盘中状态，不显示盘前价格
		if (realTimeData.marketState === 'REGULAR') return false;

		// 如果市场状态为盘前或者有盘前数据就显示
		return (
			hasValidPreMarketData &&
			(realTimeData.marketState === 'PRE' ||
				(typeof realTimeData.preMarketChange === 'number' &&
					Math.abs(realTimeData.preMarketChange) > 0.001))
		);
	};

	// 判断是否显示盘后价格
	const shouldShowPostMarketPrice = () => {
		if (
			!realTimeData ||
			typeof realTimeData !== 'object' ||
			!('postMarketPrice' in realTimeData)
		)
			return false;

		// 如果市场处于盘中状态，不显示盘后价格
		if (realTimeData.marketState === 'REGULAR') return false;

		// 检查是否有有效的盘后数据
		const hasValidPostMarketData =
			realTimeData.postMarketPrice !== undefined &&
			realTimeData.postMarketChange !== undefined;

		// 只有在非盘中状态，且有盘后数据时才显示
		return hasValidPostMarketData;
	};

	return (
		<div className='mb-6'>
			{/* 标题和基本信息 */}
			<div className='flex justify-between items-center'>
				<h1 className='text-2xl font-bold mb-1'>
					{loading && !realTimeData && !chartData
						? 'Loading...'
						: stockName}
					<span className='ml-2 text-muted-foreground'>
						{stockSymbol}
					</span>
				</h1>
			</div>

			{/* 使用实时数据显示当前价格 */}
			{realTimeData &&
			typeof realTimeData === 'object' &&
			'price' in realTimeData &&
			realTimeData.price !== undefined ? (
				<div className='flex flex-col md:flex-row md:items-baseline gap-1 md:gap-3'>
					<div className='flex flex-col'>
						{/* 常规市场价格 */}
						<div className='flex items-baseline'>
							<span className='text-3xl font-bold mr-3'>
								${realTimeData.price.toFixed(2)}
							</span>
							<PriceDisplay
								change={realTimeData.change}
								changePercent={realTimeData.changePercent}
							/>
						</div>

						{/* 盘前市场价格 */}
						{shouldShowPreMarketPrice() && (
							<div className='flex items-baseline mt-2'>
								<span className='text-sm font-medium mr-3'>
									Pre-Market: $
									{realTimeData.preMarketPrice!.toFixed(2)}
								</span>
								<PriceDisplay
									change={realTimeData.preMarketChange!}
									changePercent={
										realTimeData.preMarketChangePercent!
									}
									small={true}
								/>
							</div>
						)}

						{/* 盘后市场价格 */}
						{shouldShowPostMarketPrice() && (
							<div className='flex items-baseline mt-2'>
								<span className='text-sm font-medium mr-3'>
									After Hours: $
									{realTimeData.postMarketPrice!.toFixed(2)}
								</span>
								<PriceDisplay
									change={realTimeData.postMarketChange!}
									changePercent={
										realTimeData.postMarketChangePercent!
									}
									small={true}
								/>
							</div>
						)}
					</div>

					{/* 交易量信息 */}
					<div className='text-sm text-muted-foreground'>
						Volume: {realTimeData.marketVolume.toLocaleString()}
					</div>
				</div>
			) : chartData?.meta?.regularMarketPrice ? (
				<div className='flex items-baseline'>
					<span className='text-3xl font-bold mr-3'>
						${chartData.meta.regularMarketPrice.toFixed(2)}
					</span>
					{chartData.quotes && chartData.quotes.length > 1 && (
						<PriceDisplayFallback
							current={chartData.meta.regularMarketPrice}
							previous={chartData.quotes[0].close}
						/>
					)}
				</div>
			) : (
				<div className='h-10 mt-2 text-muted-foreground'>
					{loading
						? 'Loading price data...'
						: 'Price data not available'}
				</div>
			)}

			{/* 最高/最低价格 */}
			{realTimeData &&
				typeof realTimeData === 'object' &&
				'open' in realTimeData &&
				'previousClose' in realTimeData &&
				'dayLow' in realTimeData &&
				'dayHigh' in realTimeData &&
				'fiftyTwoWeekLow' in realTimeData &&
				'fiftyTwoWeekHigh' in realTimeData && (
					<div className='flex flex-wrap gap-x-6 gap-y-1 mt-2 text-sm text-muted-foreground'>
						<div>Open: ${realTimeData.open.toFixed(2)}</div>
						<div>
							Prev Close: ${realTimeData.previousClose.toFixed(2)}
						</div>
						<div>
							Day Range: ${realTimeData.dayLow.toFixed(2)} - $
							{realTimeData.dayHigh.toFixed(2)}
						</div>
						<div>
							52wk Range: $
							{realTimeData.fiftyTwoWeekLow.toFixed(2)} - $
							{realTimeData.fiftyTwoWeekHigh.toFixed(2)}
						</div>
					</div>
				)}
		</div>
	);
}
