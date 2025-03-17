'use client';

import { useEffect, useState } from 'react';

import { Home, RefreshCw, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { useParams, useSearchParams, useRouter } from 'next/navigation';

import RangeSelector from './components/rangeSelector';
import StockChart from './components/stockChart';
import StockDetailsGrid from './components/stockDetails';

import { getStockChartData } from '@/app/actions/yahoo-chart-actions';
import { getStockRealTimeData } from '@/app/actions/yahoo-finance2-actions';
import { Button } from '@/components/ui/button';
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

// 热门股票推荐列表
const POPULAR_STOCKS = [
	{ symbol: 'AAPL', name: 'Apple Inc.' },
	{ symbol: 'MSFT', name: 'Microsoft Corporation' },
	{ symbol: 'GOOGL', name: 'Alphabet Inc.' },
	{ symbol: 'AMZN', name: 'Amazon.com, Inc.' },
	{ symbol: 'TSLA', name: 'Tesla, Inc.' },
	{ symbol: 'META', name: 'Meta Platforms, Inc.' },
];

export default function StockPage() {
	const params = useParams();
	const searchParams = useSearchParams();
	const router = useRouter();

	// 解码 symbol 参数
	const symbol = !params.symbol
		? ''
		: decodeURIComponent(
				Array.isArray(params.symbol) ? params.symbol[0] : params.symbol
			);

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
	const [chartLoading, setChartLoading] = useState(false); // 图表加载状态
	const [isChartUpdating, setIsChartUpdating] = useState(false); // 跟踪图表更新状态
	const [error, setError] = useState<string | null>(null);
	const [lastUpdated, setLastUpdated] = useState<string>('');
	const [lastChartUpdated, setLastChartUpdated] = useState<string>('');
	// 标记是否停止自动刷新
	const [stopAutoRefresh, setStopAutoRefresh] = useState(false);

	// 如果没有指定时间范围，重定向到默认的1年范围
	useEffect(() => {
		if (!searchParams.get('range') && symbol) {
			router.replace(`/stock/${symbol}?range=1y`, { scroll: false });
		}
	}, [searchParams, symbol, router]);

	// 获取图表数据的函数
	const fetchChartData = async (silentUpdate = false) => {
		try {
			if (!symbol) {
				setError('Stock symbol cannot be empty');
				setStopAutoRefresh(true); // 停止自动刷新
				return;
			}

			// 如果是静默更新，不显示加载状态，不清空数据
			if (!silentUpdate) {
				setChartLoading(true);
				setChartData(null);
			} else {
				// 静默更新只设置一个标志，不影响现有图表显示
				setIsChartUpdating(true);
			}

			const data = await getStockChartData(symbol, range);

			// 为静默更新添加平滑过渡
			if (silentUpdate && chartData) {
				// 给React一点时间，在下一个渲染周期更新图表
				setTimeout(() => {
					setChartData(data);
					setIsChartUpdating(false);
					setLastChartUpdated(new Date().toLocaleTimeString());
				}, 50);
			} else {
				setChartData(data);
				setChartLoading(false);
				setLastChartUpdated(new Date().toLocaleTimeString());
			}

			if (error) {
				setError(null);
				setStopAutoRefresh(false);
			}
		} catch (err) {
			const errorMsg = `Failed to load chart data: ${err instanceof Error ? err.message : String(err)}`;
			setError(errorMsg);
			console.error('Failed to load chart data:', err);

			if (!silentUpdate) {
				setChartLoading(false);
			} else {
				setIsChartUpdating(false);
			}

			if (
				errorMsg.toLowerCase().includes('symbol not found') ||
				errorMsg.toLowerCase().includes('stock symbol not found') ||
				errorMsg.toLowerCase().includes('找不到股票')
			) {
				setStopAutoRefresh(true);
			}
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
			// 如果之前有错误但现在成功获取了数据，清除错误
			if (error) {
				setError(null);
				setStopAutoRefresh(false); // 恢复自动刷新
			}
		} catch (err) {
			console.error('Failed to load real-time data:', err);
			const errorMsg = err instanceof Error ? err.message : String(err);
			setError(errorMsg);
			setLoading(false);

			// 如果错误消息包含"symbol not found"或类似内容，停止自动刷新
			if (
				errorMsg.toLowerCase().includes('symbol not found') ||
				errorMsg.toLowerCase().includes('stock symbol not found') ||
				errorMsg.toLowerCase().includes('找不到股票')
			) {
				setStopAutoRefresh(true);
			}
		}
	};

	// 处理数据刷新
	const handleRefresh = () => {
		setLoading(true);
		setStopAutoRefresh(false); // 手动刷新时，重置自动刷新状态
		fetchRealTimeData();
		fetchChartData(false); // 手动刷新时使用非静默模式
	};

	// 初始加载图表数据 - 当时间范围或股票代码变化时
	useEffect(() => {
		fetchChartData(false); // 非静默模式加载初始数据
	}, [symbol, range]);

	// 实时价格和图表数据的自动刷新
	useEffect(() => {
		// 立即获取实时数据
		fetchRealTimeData();

		let priceRefreshInterval: NodeJS.Timeout | null = null;
		let chartRefreshInterval: NodeJS.Timeout | null = null;

		if (!stopAutoRefresh) {
			// 实时价格刷新 - 每5秒
			priceRefreshInterval = setInterval(() => {
				fetchRealTimeData();
			}, 5000);

			// 图表数据刷新 - 仅在1d视图且市场开放时
			if (range === '1d') {
				chartRefreshInterval = setInterval(() => {
					if (realTimeData?.marketState === 'REGULAR') {
						// 使用静默更新模式，不显示加载状态
						fetchChartData(true);
					}
				}, 30000); // 30秒刷新一次
			}
		}

		// 组件卸载时清除所有定时器
		return () => {
			if (priceRefreshInterval) clearInterval(priceRefreshInterval);
			if (chartRefreshInterval) clearInterval(chartRefreshInterval);
		};
	}, [symbol, range, stopAutoRefresh, realTimeData?.marketState]);

	// 显示公司名称和股票代码
	const stockName =
		realTimeData?.name ||
		chartData?.meta?.shortName ||
		chartData?.meta?.longName ||
		symbol;
	const stockSymbol =
		realTimeData?.symbol || chartData?.meta?.symbol || symbol;

	// 如果有错误，显示错误界面
	if (error && !loading && stopAutoRefresh) {
		return (
			<div className='w-full px-6 py-8'>
				<div className='flex flex-col items-center justify-center py-12 text-center'>
					<div className='mb-6 flex items-center justify-center'>
						<AlertTriangle size={48} className='text-destructive' />
					</div>
					<h1 className='text-3xl font-bold mb-4'>
						Symbol Not Found
					</h1>
					<p className='text-lg text-muted-foreground mb-6 max-w-lg'>
						{error}
					</p>

					<div className='flex flex-wrap gap-4 mb-8'>
						<Button asChild variant='outline' size='lg'>
							<Link href='/home'>
								<Home className='mr-2 h-5 w-5' />
								Back to Home
							</Link>
						</Button>
						<Button
							onClick={handleRefresh}
							variant='outline'
							size='lg'
						>
							<RefreshCw className='mr-2 h-5 w-5' />
							Try Again
						</Button>
					</div>

					<div className='mt-6'>
						<h2 className='text-xl font-semibold mb-4'>
							Popular Stocks
						</h2>
						<div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3'>
							{POPULAR_STOCKS.map((stock) => (
								<Link
									key={stock.symbol}
									href={`/stock/${stock.symbol}`}
									className='bg-card hover:bg-card/90 transition-colors border rounded-lg px-4 py-3 text-center'
								>
									<div className='font-bold'>
										{stock.symbol}
									</div>
									<div className='text-sm text-muted-foreground truncate'>
										{stock.name}
									</div>
								</Link>
							))}
						</div>
					</div>
				</div>
			</div>
		);
	}

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
				<RangeSelector
					currentRange={range}
					symbol={symbol || ''}
					isLoading={chartLoading}
				/>
			</div>

			{/* 图表区域 */}
			<div className='w-full h-[500px] rounded-lg border p-4 bg-card relative'>
				{(chartLoading || (!chartData && loading)) && (
					<div className='h-full w-full flex items-center justify-center'>
						<div className='animate-pulse text-muted-foreground'>
							Loading chart data...
						</div>
					</div>
				)}

				{error && !chartData && !chartLoading && (
					<div className='h-full w-full flex items-center justify-center'>
						<div className='text-destructive'>{error}</div>
					</div>
				)}

				{chartData && !chartLoading && (
					<StockChart
						data={chartData.quotes}
						range={range}
						isPartialDay={chartData.isPartialDay}
						isPreviousTradingDay={chartData.isPreviousTradingDay}
						tradingDate={chartData.tradingDate}
						previousClose={realTimeData?.previousClose}
						currentPrice={realTimeData?.price}
						marketState={realTimeData?.marketState}
						exchangeName={realTimeData?.exchangeName}
						isUpdating={isChartUpdating}
					/>
				)}
			</div>

			{/* 显示最后更新时间 */}
			{lastUpdated && !stopAutoRefresh && (
				<div className='text-xs text-right text-gray-500 mt-4'>
					{range === '1d' &&
					realTimeData?.marketState === 'REGULAR' ? (
						<>
							Prices updated: {lastUpdated}
							{lastChartUpdated &&
								` • Chart updated: ${lastChartUpdated}`}
							{realTimeData?.marketState === 'REGULAR' && (
								<span className='ml-1 text-green-500'>
									• Live
								</span>
							)}
						</>
					) : (
						<>Last updated: {lastUpdated}</>
					)}
				</div>
			)}

			{/* 如果自动刷新被停止但界面未完全切换到错误页面，显示错误状态 */}
			{stopAutoRefresh && error && !loading && (
				<div className='flex justify-end items-center mt-4 gap-2'>
					<span className='text-sm text-destructive'>{error}</span>
					<Button onClick={handleRefresh} variant='outline' size='sm'>
						<RefreshCw className='mr-2 h-4 w-4' />
						Retry
					</Button>
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
