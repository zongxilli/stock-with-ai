'use client';

import { useEffect, useState } from 'react';

import { useParams, useSearchParams, useRouter } from 'next/navigation';

import RangeSelector from './components/rangeSelector';
import StockChart from './components/stockChart';

import { getStockChartData } from '@/app/actions/yahoo-chart-actions';
import { getStockRealTimeData } from '@/app/actions/yahoo-finance2-actions';

// 定义股票实时数据类型
interface StockRealTimeData {
	symbol: string;
	name: string;
	price: number;
	change: number;
	changePercent: number;
	dayHigh: number;
	dayLow: number;
	marketTime: number;
	marketVolume: number;
	previousClose: number;
	open: number;
	fiftyTwoWeekHigh: number;
	fiftyTwoWeekLow: number;
	marketState?: string; // 新增：市场状态
	exchangeName?: string; // 新增：交易所名称
	lastUpdated: string;
}

export default function StockPage() {
	const params = useParams();
	const searchParams = useSearchParams();
	const router = useRouter();
	const symbol = Array.isArray(params.symbol)
		? params.symbol[0]
		: params.symbol;

	// 获取时间范围，如果没有指定，默认为1年(1y)
	const range = searchParams.get('range') || '1y';

	// 分别管理图表数据和实时价格数据
	const [chartData, setChartData] = useState<any>(null);
	const [realTimeData, setRealTimeData] = useState<StockRealTimeData | null>(
		null
	);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [lastUpdated, setLastUpdated] = useState<string>('');

	// 如果没有指定时间范围，重定向到默认的1年范围
	useEffect(() => {
		if (!searchParams.get('range') && symbol) {
			router.replace(`/stock/${symbol}?range=1y`);
		}
	}, [searchParams, symbol, router]);

	// 获取图表数据的函数
	const fetchChartData = async () => {
		try {
			if (!symbol) {
				setError('Stock symbol cannot be empty');
				return;
			}
			const data = await getStockChartData(symbol, range);
			setChartData(data);
		} catch (err) {
			setError(
				`Failed to load chart data: ${err instanceof Error ? err.message : String(err)}`
			);
			console.error('Failed to load chart data:', err);
		}
	};

	// 获取实时价格数据的函数
	const fetchRealTimeData = async () => {
		try {
			if (!symbol) return;

			setLoading(true);
			const data = await getStockRealTimeData(symbol);
			setRealTimeData(data);
			setLastUpdated(new Date().toLocaleTimeString());
			setLoading(false);
		} catch (err) {
			console.error('Failed to load real-time data:', err);
			// 不要设置error，以便仍然可以显示图表
		} finally {
			setLoading(false);
		}
	};

	// 初始加载图表数据
	useEffect(() => {
		fetchChartData();
	}, [symbol, range]);

	// 初始加载和定时更新实时价格数据
	useEffect(() => {
		// 立即获取实时数据
		fetchRealTimeData();

		// 设置定时器，每5秒刷新一次实时数据
		const refreshInterval = setInterval(() => {
			fetchRealTimeData();
		}, 5000); // 每5秒刷新一次

		// 组件卸载时清除定时器
		return () => {
			clearInterval(refreshInterval);
		};
	}, [symbol]); // 只在股票代码变化时重置定时器

	// 显示公司名称和股票代码
	const stockName =
		realTimeData?.name ||
		chartData?.meta?.shortName ||
		chartData?.meta?.longName ||
		symbol;
	const stockSymbol =
		realTimeData?.symbol || chartData?.meta?.symbol || symbol;

	return (
		<div className='w-full px-6 py-8'>
			<div className='mb-6'>
				{/* 标题和基本信息 */}
				<h1 className='text-2xl font-bold mb-1'>
					{loading && !realTimeData && !chartData
						? 'Loading...'
						: stockName}
					<span className='ml-2 text-muted-foreground'>
						{stockSymbol}
					</span>
				</h1>

				{/* 使用实时数据显示当前价格 */}
				{realTimeData ? (
					<div className='flex flex-col md:flex-row md:items-baseline gap-1 md:gap-3'>
						<div className='flex items-baseline'>
							<span className='text-3xl font-bold mr-3'>
								${realTimeData.price.toFixed(2)}
							</span>
							<PriceChange
								change={realTimeData.change}
								changePercent={realTimeData.changePercent}
							/>
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
						{chartData.quotes.length > 1 && (
							<PriceChangeOld
								current={chartData.meta.regularMarketPrice}
								previous={chartData.quotes[0].close}
							/>
						)}
					</div>
				) : null}

				{/* 最高/最低价格 */}
				{realTimeData && (
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

			{/* 时间范围选择器 */}
			<div className='mb-4'>
				<RangeSelector currentRange={range} symbol={symbol || ''} />
			</div>

			{/* 图表区域 */}
			<div className='w-full h-[500px] rounded-lg border p-4 bg-card'>
				{!chartData && loading && (
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

				{chartData && (
					<StockChart
						data={chartData.quotes}
						range={range}
						isPartialDay={chartData.isPartialDay}
						previousClose={realTimeData?.previousClose}
						currentPrice={realTimeData?.price}
						marketState={realTimeData?.marketState}
						exchangeName={realTimeData?.exchangeName}
					/>
				)}
			</div>

			{/* 显示最后更新时间 */}
			{lastUpdated && (
				<div className='text-xs text-right text-gray-500 mt-4'>
					Last updated: {lastUpdated}
				</div>
			)}
		</div>
	);
}

// 显示实时价格变化的组件
function PriceChange({
	change,
	changePercent,
}: {
	change: number;
	changePercent: number;
}) {
	const isPositive = change >= 0;

	return (
		<span
			className={`text-lg ${isPositive ? 'text-green-500' : 'text-red-500'}`}
		>
			{isPositive ? '+' : ''}
			{change.toFixed(2)} ({isPositive ? '+' : ''}
			{changePercent.toFixed(2)}%)
		</span>
	);
}

// 旧的价格变化计算组件（作为备用）
function PriceChangeOld({
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
