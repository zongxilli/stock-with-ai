'use client';

import { useEffect, useState } from 'react';

import { useParams, useSearchParams, useRouter } from 'next/navigation';

import RangeSelector from './components/rangeSelector';
import StockChart from './components/stockChart';

import { getStockChartData } from '@/app/actions/yahoo-chart-actions';

export default function StockPage() {
	const params = useParams();
	const searchParams = useSearchParams();
	const router = useRouter();
	const symbol = Array.isArray(params.symbol)
		? params.symbol[0]
		: params.symbol;

	// 获取时间范围，如果没有指定，默认为1年(1y)
	const range = searchParams.get('range') || '1y';

	const [chartData, setChartData] = useState<any>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// 如果没有指定时间范围，重定向到默认的1年范围
	useEffect(() => {
		if (!searchParams.get('range') && symbol) {
			router.replace(`/stock/${symbol}?range=1y`);
		}
	}, [searchParams, symbol, router]);

	useEffect(() => {
		async function fetchChartData() {
			setLoading(true);
			setError(null);
			try {
				if (!symbol) {
					setError('Stock symbol cannot be empty');
					setLoading(false);
					return;
				}
				const data = await getStockChartData(symbol, range);
				setChartData(data);
			} catch (err) {
				setError(
					`Failed to load stock data: ${err instanceof Error ? err.message : String(err)}`
				);
				console.error('Failed to load stock data:', err);
			} finally {
				setLoading(false);
			}
		}

		fetchChartData();
	}, [symbol, range]);

	// 显示公司名称和股票代码
	const stockName =
		chartData?.meta?.shortName || chartData?.meta?.longName || symbol;
	const stockSymbol = chartData?.meta?.symbol || symbol;

	return (
		<div className='w-full px-6 py-8'>
			<div className='mb-6'>
				{/* 标题和基本信息 */}
				<h1 className='text-2xl font-bold mb-1'>
					{loading ? 'Loading...' : stockName}
					<span className='ml-2 text-muted-foreground'>
						{stockSymbol}
					</span>
				</h1>

				{/* 当前价格显示 */}
				{chartData && (
					<div className='flex items-baseline'>
						<span className='text-3xl font-bold mr-3'>
							${chartData.meta.regularMarketPrice.toFixed(2)}
						</span>
						{chartData.quotes.length > 1 && (
							<PriceChange
								current={chartData.meta.regularMarketPrice}
								previous={chartData.quotes[0].close}
							/>
						)}
					</div>
				)}
			</div>

			{/* 时间范围选择器 */}
			<div className='mb-4'>
				<RangeSelector currentRange={range} symbol={symbol || ''} />
			</div>

			{/* 图表区域 */}
			<div className='w-full h-[500px] rounded-lg border p-4 bg-card'>
				{loading && (
					<div className='h-full w-full flex items-center justify-center'>
						<div className='animate-pulse text-muted-foreground'>
							Loading chart data...
						</div>
					</div>
				)}

				{error && (
					<div className='h-full w-full flex items-center justify-center'>
						<div className='text-destructive'>{error}</div>
					</div>
				)}

				{!loading && !error && chartData && (
					<StockChart
						data={chartData.quotes}
						range={range}
						isPartialDay={chartData.isPartialDay}
					/>
				)}
			</div>
		</div>
	);
}

// 显示价格变化的组件
function PriceChange({
	current,
	previous,
}: {
	current: number;
	previous: number | null;
}) {
	if (previous === null) return null;

	const change = current - previous;
	const percentChange = (change / previous) * 100;
	const isPositive = change >= 0;

	return (
		<span
			className={`text-lg ${isPositive ? 'text-green-500' : 'text-red-500'}`}
		>
			{isPositive ? '+' : ''}
			{change.toFixed(2)} ({isPositive ? '+' : ''}
			{percentChange.toFixed(2)}%)
		</span>
	);
}
