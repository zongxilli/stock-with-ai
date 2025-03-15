'use client';

import { useEffect, useState } from 'react';

import { useParams, useSearchParams, useRouter } from 'next/navigation';

import RangeSelector from './components/rangeSelector';
import StockChart from './components/stockChart';
import StockDetailsGrid from './components/stockDetails';

import { getStockChartData } from '@/app/actions/yahoo-chart-actions';
import { getStockRealTimeData } from '@/app/actions/yahoo-finance2-actions';
import { usePreserveScroll } from '@/hooks/usePreserveScroll';

// 定义股票实时数据类型
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

	// 成交量信息
	marketVolume: number;

	// 52周高低点
	fiftyTwoWeekHigh: number;
	fiftyTwoWeekLow: number;

	// 市场信息
	marketTime: number;
	marketState?: string; // 'REGULAR', 'PRE', 'POST', 'CLOSED' 等
	exchangeName?: string;

	// 交易数据
	bid?: number;
	ask?: number;
	bidSize?: number;
	askSize?: number;

	// 成交量统计
	avgVolume?: number;
	avgVolume10Day?: number;

	// 市值和贝塔系数
	marketCap?: number;
	beta?: number;

	// 财务比率
	peRatio?: number;
	forwardPE?: number;
	eps?: number;

	// 股息信息
	dividendRate?: number;
	dividendYield?: number;
	exDividendDate?: string;
	dividendDate?: string;

	// 财务表现指标
	profitMargins?: number;
	revenueGrowth?: number;
	earningsGrowth?: number;
	returnOnAssets?: number;
	returnOnEquity?: number;

	// 分析师建议
	targetHigh?: number;
	targetLow?: number;
	targetMean?: number;
	targetMedian?: number;
	recommendationMean?: number;
	recommendationKey?: string;
	numberOfAnalysts?: number;

	// 财报日期
	earningsDate?: string;

	// 现金流和债务信息
	totalCash?: number;
	totalCashPerShare?: number;
	totalDebt?: number;
	debtToEquity?: number;

	// 财务指标
	currentRatio?: number;
	quickRatio?: number;
	freeCashflow?: number;

	// 其他统计数据
	sharesOutstanding?: number;
	heldPercentInsiders?: number;
	heldPercentInstitutions?: number;
	shortRatio?: number;
	floatShares?: number;

	// 元数据
	lastUpdated: string;
	currency?: string;
}

export default function StockPage() {
	const params = useParams();
	const searchParams = useSearchParams();
	const router = useRouter();
	const symbol = Array.isArray(params.symbol)
		? params.symbol[0]
		: params.symbol;

	// 使用自定义钩子保持滚动位置
	usePreserveScroll();

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
			router.replace(`/stock/${symbol}?range=1y`, { scroll: false });
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

			{/* 添加股票详情网格 */}
			{realTimeData && (
				<StockDetailsGrid
					// 基本价格信息
					previousClose={realTimeData.previousClose}
					open={realTimeData.open}
					bid={realTimeData.bid}
					ask={realTimeData.ask}
					bidSize={realTimeData.bidSize}
					askSize={realTimeData.askSize}
					// 价格范围
					daysRange={{
						low: realTimeData.dayLow,
						high: realTimeData.dayHigh,
					}}
					weekRange={{
						low: realTimeData.fiftyTwoWeekLow,
						high: realTimeData.fiftyTwoWeekHigh,
					}}
					// 交易量数据
					volume={realTimeData.marketVolume}
					avgVolume={realTimeData.avgVolume}
					avgVolume10Day={realTimeData.avgVolume10Day}
					// 市场数据
					marketCap={realTimeData.marketCap}
					beta={realTimeData.beta}
					// 财务比率
					peRatio={realTimeData.peRatio}
					forwardPE={realTimeData.forwardPE}
					eps={realTimeData.eps}
					profitMargins={realTimeData.profitMargins}
					returnOnAssets={realTimeData.returnOnAssets}
					returnOnEquity={realTimeData.returnOnEquity}
					// 股息信息
					earningsDate={realTimeData.earningsDate}
					dividendRate={realTimeData.dividendRate}
					dividendYield={realTimeData.dividendYield}
					exDividendDate={realTimeData.exDividendDate}
					dividendDate={realTimeData.dividendDate}
					// 分析师评级和目标价格
					targetHigh={realTimeData.targetHigh}
					targetLow={realTimeData.targetLow}
					targetMean={realTimeData.targetMean}
					targetMedian={realTimeData.targetMedian}
					numberOfAnalysts={realTimeData.numberOfAnalysts}
					recommendationMean={realTimeData.recommendationMean}
					recommendationKey={realTimeData.recommendationKey}
					// 成长和业绩
					revenueGrowth={realTimeData.revenueGrowth}
					earningsGrowth={realTimeData.earningsGrowth}
					// 现金和债务
					totalCash={realTimeData.totalCash}
					totalCashPerShare={realTimeData.totalCashPerShare}
					totalDebt={realTimeData.totalDebt}
					debtToEquity={realTimeData.debtToEquity}
					currentRatio={realTimeData.currentRatio}
					quickRatio={realTimeData.quickRatio}
					freeCashflow={realTimeData.freeCashflow}
					// 持股信息
					sharesOutstanding={realTimeData.sharesOutstanding}
					floatShares={realTimeData.floatShares}
					heldPercentInsiders={realTimeData.heldPercentInsiders}
					heldPercentInstitutions={
						realTimeData.heldPercentInstitutions
					}
					shortRatio={realTimeData.shortRatio}
					// 其他信息
					currency={realTimeData.currency}
				/>
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
