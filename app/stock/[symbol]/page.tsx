'use client';

import { useEffect, useState } from 'react';

import { useParams, useSearchParams, useRouter } from 'next/navigation';

import AIAssistantDialog from './components/ai-assistant-dialog';
import ChartContainer from './components/chart-container';
import ErrorView from './components/error-view';
import RangeSelector from './components/rangeSelector';
import StatusIndicator from './components/status-indicator';
import StockChartAdvancedContainer from './components/stock-chart-advanced-container';
import StockDetails from './components/stock-details';
import StockHeader from './components/stock-header';
import StockNews from './components/stock-news';

import { getStockChartData } from '@/app/actions/yahoo/get-stock-chart-data';
import { getStockRealTimeData } from '@/app/actions/yahoo/get-stock-realtime-data';
import { searchStock } from '@/app/actions/yahoo/search-stock';
import { usePreserveScroll } from '@/hooks/use-preserve-scroll';
import { usePrevious } from '@/hooks/use-previous';

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

	// AI Assistant dialog state
	const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
	// These state variables are managed by the AIAssistantDialog component internally
	// when using streaming mode, so we don't need to use them here
	const [_aiData] = useState(null);
	const [_aiLoading] = useState(false);

	// 添加重定向状态
	const [isRedirecting, setIsRedirecting] = useState(false);
	const [searchedOnce, setSearchedOnce] = useState(false);

	// 如果没有指定时间范围，重定向到默认的1年范围
	useEffect(() => {
		if (!searchParams.get('range') && symbol) {
			// 创建一个新的URLSearchParams对象，复制当前所有的查询参数
			const newSearchParams = new URLSearchParams(
				searchParams.toString()
			);

			newSearchParams.set('range', '1y');

			// 构建新的URL，保留所有原有参数
			router.replace(`/stock/${symbol}?${newSearchParams.toString()}`, {
				scroll: false,
			});
		}
	}, [searchParams, symbol, router]);

	const prevMarketState = usePrevious(realTimeData?.marketState);
	useEffect(() => {
		// 当市场状态从盘前(PRE)切换到盘中(REGULAR)时，需要刷新1D图表
		if (
			range === '1d' &&
			prevMarketState &&
			prevMarketState !== realTimeData?.marketState
		) {
			fetchChartData(true);
		}
	}, [realTimeData?.marketState, prevMarketState, range]);

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

			// 检查返回的数据是否包含错误
			if (data && 'error' in data) {
				const errorMsg = data.error;

				// 添加股票代码搜索重定向逻辑
				if (
					!searchedOnce &&
					(data.errorType === 'SYMBOL_NOT_FOUND' ||
						data.errorType === 'QUOTE_NOT_FOUND' ||
						errorMsg.toLowerCase().includes('找不到股票') ||
						errorMsg.toLowerCase().includes('未找到证券代码'))
				) {
					// 标记已经尝试搜索，避免无限循环
					setSearchedOnce(true);

					// 尝试搜索正确的股票代码
					const searchResult = await searchStock(symbol);

					if (
						searchResult &&
						!('error' in searchResult) &&
						searchResult.firstResult
					) {
						// 找到匹配的股票，重定向到正确的页面
						const correctSymbol = searchResult.firstResult.symbol;
						console.log(`重定向到正确的股票代码: ${correctSymbol}`);
						setIsRedirecting(true);

						const newSearchParams = new URLSearchParams(
							searchParams.toString()
						);

						router.replace(
							`/stock/${correctSymbol}?${newSearchParams.toString()}`
						);
						return;
					}
				}

				// 如果搜索失败或已经搜索过一次，显示错误
				setError(errorMsg);

				if (!silentUpdate) {
					setChartLoading(false);
				} else {
					setIsChartUpdating(false);
				}

				if (
					data.errorType === 'SYMBOL_NOT_FOUND' ||
					data.errorType === 'QUOTE_NOT_FOUND' ||
					errorMsg.toLowerCase().includes('找不到股票') ||
					errorMsg.toLowerCase().includes('未找到证券代码')
				) {
					setStopAutoRefresh(true);
				}

				return;
			}

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
			// 处理其他可能的错误（例如网络错误）
			const errorMsg = `Failed to load chart data: ${
				err instanceof Error ? err.message : String(err)
			}`;
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

			// 检查返回的数据是否包含错误
			if (data && 'error' in data) {
				const errorMsg = data.error;

				// 添加股票代码搜索重定向逻辑
				if (
					!searchedOnce &&
					(data.errorType === 'SYMBOL_NOT_FOUND' ||
						errorMsg.toLowerCase().includes('找不到股票代码') ||
						errorMsg.toLowerCase().includes('找不到股票数据'))
				) {
					// 标记已经尝试搜索，避免无限循环
					setSearchedOnce(true);

					// 尝试搜索正确的股票代码
					const searchResult = await searchStock(symbol);

					if (
						searchResult &&
						!('error' in searchResult) &&
						searchResult.firstResult
					) {
						// 找到匹配的股票，重定向到正确的页面
						const correctSymbol = searchResult.firstResult.symbol;
						console.log(`重定向到正确的股票代码: ${correctSymbol}`);
						setIsRedirecting(true);
						const newSearchParams = new URLSearchParams(
							searchParams.toString()
						);
						router.replace(
							`/stock/${correctSymbol}?${newSearchParams.toString()}`
						);
						return;
					}
				}

				// 如果搜索失败或已经搜索过一次，显示错误
				setError(errorMsg);
				setLoading(false);

				if (
					data.errorType === 'SYMBOL_NOT_FOUND' ||
					errorMsg.toLowerCase().includes('找不到股票代码') ||
					errorMsg.toLowerCase().includes('找不到股票数据')
				) {
					setStopAutoRefresh(true);
				}

				return;
			}

			setRealTimeData(data);
			setLastUpdated(new Date().toLocaleTimeString());
			setLoading(false);

			// 如果之前有错误但现在成功获取了数据，清除错误
			if (error) {
				setError(null);
				setStopAutoRefresh(false); // 恢复自动刷新
			}
		} catch (err) {
			// 处理其他可能的错误（例如网络错误）
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

		// 只有在未停止自动刷新的情况下才设置定时器
		let refreshInterval: NodeJS.Timeout | null = null;
		let chartRefreshInterval: NodeJS.Timeout | null = null;

		if (!stopAutoRefresh) {
			// 根据市场状态决定更新频率
			let refreshTime = 60000; // 默认为60秒
			let chartRefreshTime = 60000; // 默认图表刷新间隔为60秒

			if (realTimeData?.marketState === 'REGULAR') {
				refreshTime = 5000; // 交易中：5秒
				chartRefreshTime = 20000; // 交易中图表更新：20秒
			} else if (realTimeData?.marketState === 'PRE') {
				refreshTime = 15000; // 盘前：15秒
				chartRefreshTime = 30000; // 盘前图表更新：30秒
			} else if (realTimeData?.marketState === 'POST') {
				refreshTime = 15000; // 盘后：15秒
				chartRefreshTime = 30000; // 盘后图表更新：30秒
			} else if (realTimeData?.marketState === 'CLOSED') {
				// 如果已经有盘后数据，减少刷新频率
				if (
					realTimeData.postMarketPrice !== undefined &&
					realTimeData.postMarketChange !== undefined
				) {
					refreshTime = 300000; // 已有盘后数据且市场关闭：5分钟
					chartRefreshTime = 300000; // 市场关闭：5分钟
				} else {
					refreshTime = 60000; // 市场关闭无盘后数据：1分钟
					chartRefreshTime = 300000; // 市场关闭：5分钟
				}
			}

			// 处理POSTPOST异常情况
			if (realTimeData?.marketState === 'POSTPOST') {
				refreshTime = 300000; // 每5分钟刷新一次
				chartRefreshTime = 300000; // 每5分钟刷新图表
			}

			refreshInterval = setInterval(() => {
				fetchRealTimeData();
			}, refreshTime);

			// 只有在1D视图下才需要定期刷新图表数据
			if (range === '1d') {
				chartRefreshInterval = setInterval(() => {
					// 只在市场交易期间或盘前盘后频繁更新图表
					const shouldRefreshChart =
						realTimeData?.marketState === 'REGULAR' ||
						realTimeData?.marketState === 'PRE' ||
						realTimeData?.marketState === 'POST';

					if (shouldRefreshChart) {
						fetchChartData(true); // 静默更新图表数据
					}
				}, chartRefreshTime);
			}
		}

		// 组件卸载时清除定时器
		return () => {
			if (refreshInterval) {
				clearInterval(refreshInterval);
			}
			if (chartRefreshInterval) {
				clearInterval(chartRefreshInterval);
			}
		};
	}, [symbol, stopAutoRefresh, realTimeData?.marketState, range]);

	// 显示公司名称和股票代码
	const stockName =
		realTimeData?.name ||
		chartData?.meta?.shortName ||
		chartData?.meta?.longName ||
		symbol;
	const stockSymbol =
		realTimeData?.symbol || chartData?.meta?.symbol || symbol;

	// 如果有错误，显示错误界面
	if (error && !loading && stopAutoRefresh && !isRedirecting) {
		return <ErrorView error={error} onRetry={handleRefresh} />;
	}

	// 如果有错误但还在加载中，显示加载状态
	if (error && loading) {
		return (
			<div className='w-full px-6 py-8 flex justify-center items-center'>
				<div className='text-center'>
					<p className='mb-4'>Loading...</p>
					<p className='text-red-500'>{error}</p>
				</div>
			</div>
		);
	}

	// 检查realTimeData是否为错误对象 - 这种情况不应该发生，但为了健壮性还是添加检查
	if (realTimeData && 'error' in realTimeData) {
		return (
			<ErrorView
				error={String(realTimeData.error)}
				onRetry={handleRefresh}
			/>
		);
	}

	// 检查chartData是否为错误对象
	if (chartData && 'error' in chartData) {
		return (
			<ErrorView
				error={String(chartData.error)}
				onRetry={handleRefresh}
			/>
		);
	}

	const code = searchParams.get('code');
	const exchange = searchParams.get('exchange');

	return (
		<div className='w-full px-6 py-8'>
			{/* 股票头部信息 */}
			<StockHeader
				stockName={stockName}
				stockSymbol={stockSymbol}
				realTimeData={realTimeData}
				chartData={chartData}
				loading={loading}
			/>

			{/* 时间范围选择器 */}
			<div className='mb-4'>
				<RangeSelector
					currentRange={range}
					symbol={symbol || ''}
					isLoading={chartLoading}
					exchangeName={realTimeData?.exchangeName}
				/>
			</div>

			{/* 图表区域 */}
			<ChartContainer
				chartData={chartData}
				chartLoading={chartLoading}
				error={error}
				range={range}
				isChartUpdating={isChartUpdating}
				realTimeData={realTimeData}
			/>

			<StockChartAdvancedContainer
				start='2024-04-06'
				end='2025-04-06'
				code={code || ''}
				exchange={exchange || ''}
				className='mb-4'
			/>

			{/* AI Assistant Dialog */}
			<AIAssistantDialog
				isOpen={isAIDialogOpen}
				setIsOpen={setIsAIDialogOpen}
				symbol={symbol}
				isLoading={_aiLoading}
				data={_aiData}
				useStream={true}
				code={code || ''}
				exchange={exchange || ''}
			/>

			{/* 状态指示器 */}
			<StatusIndicator
				lastUpdated={lastUpdated}
				lastChartUpdated={lastChartUpdated}
				stopAutoRefresh={stopAutoRefresh}
				error={error}
				loading={loading}
				range={range}
				realTimeData={realTimeData}
				onRefresh={handleRefresh}
			/>

			{/* 股票详情 */}
			{realTimeData && (
				<div className='gap-4 mb-4'>
					<StockDetails {...realTimeData} />
				</div>
			)}

			{/* 股票新闻 */}
			{realTimeData && (
				<div className='gap-4 mb-4'>
					<StockNews symbol={stockSymbol} />
				</div>
			)}

			{/* <Button
				onClick={async () => {
					const data = await getHistoricalData(
						code || '',
						exchange || '',
						'1y'
					);
					console.log(
						compressHistoricalData(data, false, code || '')
					);

					const data1 = await getHistoricalData1MonthFull(
						code || '',
						exchange || ''
					);
					console.log(
						compressHistoricalData(data1, true, code || '')
					);
				}}
			>
				Historical Data
			</Button> */}
		</div>
	);
}
