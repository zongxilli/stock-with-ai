'use client';

import { useEffect, useState } from 'react';

import { useParams, useSearchParams, useRouter } from 'next/navigation';

import AIAssistantDialog from './components/ai-assistant-dialog';
import ChartContainer from './components/chart-container';
import ErrorView from './components/error-view';
import RangeSelector from './components/rangeSelector';
import StatusIndicator from './components/status-indicator';
import StockDetails from './components/stock-details';
import StockHeader from './components/stock-header';

import { getStockChartData } from '@/app/actions/yahoo/get-stock-chart-data';
import { getStockRealTimeData } from '@/app/actions/yahoo/get-stock-realtime-data';
import { usePreserveScroll } from '@/hooks/use-preserve-scroll';
import { usePrevious } from '@/hooks/use-previous';

// Define stock real-time data type
interface StockRealTimeData {
	// (keeping the original interface definition)
	symbol: string;
	name: string;
	price: number;
	change: number;
	changePercent: number;
	dayHigh: number;
	dayLow: number;
	previousClose: number;
	open: number;
	preMarketPrice?: number;
	preMarketChange?: number;
	preMarketChangePercent?: number;
	preMarketTime?: number;
	postMarketPrice?: number;
	postMarketChange?: number;
	postMarketChangePercent?: number;
	postMarketTime?: number;
	marketVolume: number;
	fiftyTwoWeekHigh: number;
	fiftyTwoWeekLow: number;
	marketTime: number;
	marketState?: string;
	exchangeName?: string;
	bid?: number;
	ask?: number;
	bidSize?: number;
	askSize?: number;
	avgVolume?: number;
	avgVolume10Day?: number;
	marketCap?: number;
	beta?: number;
	peRatio?: number;
	forwardPE?: number;
	eps?: number;
	dividendRate?: number;
	dividendYield?: number;
	exDividendDate?: string;
	dividendDate?: string;
	profitMargins?: number;
	revenueGrowth?: number;
	earningsGrowth?: number;
	returnOnAssets?: number;
	returnOnEquity?: number;
	targetHigh?: number;
	targetLow?: number;
	targetMean?: number;
	targetMedian?: number;
	recommendationMean?: number;
	recommendationKey?: string;
	numberOfAnalysts?: number;
	earningsDate?: string;
	totalCash?: number;
	totalCashPerShare?: number;
	totalDebt?: number;
	debtToEquity?: number;
	currentRatio?: number;
	quickRatio?: number;
	freeCashflow?: number;
	sharesOutstanding?: number;
	heldPercentInsiders?: number;
	heldPercentInstitutions?: number;
	shortRatio?: number;
	floatShares?: number;
	lastUpdated: string;
	currency?: string;
}

// Function to search for alternative stocks
async function searchAlternativeStocks(query: string) {
	try {
		const response = await fetch(
			`/api/stock-search?q=${encodeURIComponent(query)}`
		);
		if (!response.ok) {
			throw new Error(`Search API error: ${response.status}`);
		}
		const data = await response.json();
		return data.quotes || [];
	} catch (error) {
		console.error('Error searching for alternative stocks:', error);
		return [];
	}
}

export default function StockPage() {
	const params = useParams();
	const searchParams = useSearchParams();
	const router = useRouter();

	// Decode symbol parameter
	const symbol = !params.symbol
		? ''
		: decodeURIComponent(
				Array.isArray(params.symbol) ? params.symbol[0] : params.symbol
			);

	// Use custom hook to maintain scroll position
	usePreserveScroll();

	// Get time range, if not specified, default to 1 year (1y)
	const range = searchParams.get('range') || '1y';

	// Manage chart data and real-time price data separately
	const [chartData, setChartData] = useState<any>(null);
	const [realTimeData, setRealTimeData] = useState<StockRealTimeData | null>(
		null
	);
	const [loading, setLoading] = useState(true);
	const [chartLoading, setChartLoading] = useState(false);
	const [isChartUpdating, setIsChartUpdating] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [lastUpdated, setLastUpdated] = useState<string>('');
	const [lastChartUpdated, setLastChartUpdated] = useState<string>('');
	// Flag to stop auto-refresh
	const [stopAutoRefresh, setStopAutoRefresh] = useState(false);
	// Flag to track if we're currently searching for alternative stocks
	const [isSearchingAlternatives, setIsSearchingAlternatives] =
		useState(false);

	// AI Assistant dialog state
	const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
	const [_aiData] = useState(null);
	const [_aiLoading] = useState(false);

	// If no time range is specified, redirect to default 1-year range
	useEffect(() => {
		if (!searchParams.get('range') && symbol) {
			router.replace(`/stock/${symbol}?range=1y`, { scroll: false });
		}
	}, [searchParams, symbol, router]);

	const prevMarketState = usePrevious(realTimeData?.marketState);
	useEffect(() => {
		// When market state changes from pre-market (PRE) to regular trading (REGULAR), refresh 1D chart
		if (
			range === '1d' &&
			prevMarketState &&
			prevMarketState !== realTimeData?.marketState
		) {
			fetchChartData(true);
		}
	}, [realTimeData?.marketState, prevMarketState, range]);

	// Function to fetch chart data
	const fetchChartData = async (silentUpdate = false) => {
		try {
			if (!symbol) {
				setError('Stock symbol cannot be empty');
				setStopAutoRefresh(true);
				return;
			}

			// If it's a silent update, don't show loading state or clear data
			if (!silentUpdate) {
				setChartLoading(true);
				setChartData(null);
			} else {
				// Just set a flag for silent updates, don't affect existing chart display
				setIsChartUpdating(true);
			}

			const data = await getStockChartData(symbol, range);

			// Add smooth transition for silent updates
			if (silentUpdate && chartData) {
				// Give React a moment to update the chart in the next render cycle
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

			// Check if the error indicates the symbol doesn't exist
			const symbolNotFoundError =
				errorMsg.toLowerCase().includes('symbol not found') ||
				errorMsg.toLowerCase().includes('stock symbol not found') ||
				errorMsg.toLowerCase().includes('找不到股票');

			if (symbolNotFoundError) {
				setStopAutoRefresh(true);

				// Only try to find alternatives if we haven't already started searching
				if (!isSearchingAlternatives) {
					findAlternativeSymbol();
				}
			}
		}
	};

	// Function to find alternative stock symbol when the provided one doesn't exist
	const findAlternativeSymbol = async () => {
		// Set flag to prevent multiple searches
		setIsSearchingAlternatives(true);

		console.log(`Searching for alternative symbols for: ${symbol}`);

		try {
			// Search for alternatives using the user's input
			const alternatives = await searchAlternativeStocks(symbol);

			// If we found at least one alternative, redirect to the first result
			if (alternatives && alternatives.length > 0) {
				const firstAlternative = alternatives[0];
				console.log(
					`Found alternative symbol: ${firstAlternative.symbol}`,
					firstAlternative
				);

				// Add a small delay so the user can see what's happening
				setTimeout(() => {
					// Navigate to the alternative stock page
					router.push(
						`/stock/${firstAlternative.symbol}?range=${range}`
					);
				}, 500);
			} else {
				console.log('No alternative symbols found');
				// No alternatives found, keep showing the error page
			}
		} catch (error) {
			console.error('Error finding alternative symbol:', error);
		} finally {
			// Reset the searching flag
			setIsSearchingAlternatives(false);
		}
	};

	// Function to get real-time price data
	const fetchRealTimeData = async () => {
		try {
			if (!symbol) return;

			setLoading(true);
			const data = await getStockRealTimeData(symbol);
			setRealTimeData(data);
			setLastUpdated(new Date().toLocaleTimeString());
			setLoading(false);

			// If we had an error but now succeeded, clear error
			if (error) {
				setError(null);
				setStopAutoRefresh(false);
			}
		} catch (err) {
			console.error('Failed to load real-time data:', err);
			const errorMsg = err instanceof Error ? err.message : String(err);
			setError(errorMsg);
			setLoading(false);

			// Check if error indicates symbol not found
			if (
				errorMsg.toLowerCase().includes('symbol not found') ||
				errorMsg.toLowerCase().includes('stock symbol not found') ||
				errorMsg.toLowerCase().includes('找不到股票')
			) {
				setStopAutoRefresh(true);

				// Only try to find alternatives if we haven't already started searching
				if (!isSearchingAlternatives) {
					findAlternativeSymbol();
				}
			}
		}
	};

	// Handle data refresh
	const handleRefresh = () => {
		setLoading(true);
		setStopAutoRefresh(false); // Reset auto-refresh on manual refresh
		fetchRealTimeData();
		fetchChartData(false); // Use non-silent mode for manual refresh
	};

	// Initial load of chart data - when time range or stock code changes
	useEffect(() => {
		fetchChartData(false); // Non-silent mode for initial loading
	}, [symbol, range]);

	// Real-time price and chart data auto-refresh
	useEffect(() => {
		// Immediately get real-time data
		fetchRealTimeData();

		// Only set timers if auto-refresh isn't stopped
		let refreshInterval: NodeJS.Timeout | null = null;
		let chartRefreshInterval: NodeJS.Timeout | null = null;

		if (!stopAutoRefresh) {
			// Determine refresh rate based on market state
			let refreshTime = 60000; // Default: 60 seconds
			let chartRefreshTime = 60000; // Default chart refresh: 60 seconds

			if (realTimeData?.marketState === 'REGULAR') {
				refreshTime = 5000; // During trading: 5 seconds
				chartRefreshTime = 20000; // During trading chart update: 20 seconds
			} else if (realTimeData?.marketState === 'PRE') {
				refreshTime = 15000; // Pre-market: 15 seconds
				chartRefreshTime = 30000; // Pre-market chart update: 30 seconds
			} else if (realTimeData?.marketState === 'POST') {
				refreshTime = 15000; // After-hours: 15 seconds
				chartRefreshTime = 30000; // After-hours chart update: 30 seconds
			} else if (realTimeData?.marketState === 'CLOSED') {
				// If we have after-hours data, reduce refresh frequency
				if (
					realTimeData.postMarketPrice !== undefined &&
					realTimeData.postMarketChange !== undefined
				) {
					refreshTime = 300000; // Market closed with after-hours data: 5 minutes
					chartRefreshTime = 300000; // Market closed: 5 minutes
				} else {
					refreshTime = 60000; // Market closed without after-hours data: 1 minute
					chartRefreshTime = 300000; // Market closed: 5 minutes
				}
			}

			// Handle POSTPOST edge case
			if (realTimeData?.marketState === 'POSTPOST') {
				refreshTime = 300000; // Refresh every 5 minutes
				chartRefreshTime = 300000; // Refresh chart every 5 minutes
			}

			refreshInterval = setInterval(() => {
				fetchRealTimeData();
			}, refreshTime);

			// Only update chart data regularly in 1D view
			if (range === '1d') {
				chartRefreshInterval = setInterval(() => {
					// Only update chart frequently during market hours or pre/post market
					const shouldRefreshChart =
						realTimeData?.marketState === 'REGULAR' ||
						realTimeData?.marketState === 'PRE' ||
						realTimeData?.marketState === 'POST';

					if (shouldRefreshChart) {
						fetchChartData(true); // Silent update for chart data
					}
				}, chartRefreshTime);
			}
		}

		// Clean up intervals on unmount
		return () => {
			if (refreshInterval) {
				clearInterval(refreshInterval);
			}
			if (chartRefreshInterval) {
				clearInterval(chartRefreshInterval);
			}
		};
	}, [symbol, stopAutoRefresh, realTimeData?.marketState, range]);

	// Display company name and stock symbol
	const stockName =
		realTimeData?.name ||
		chartData?.meta?.shortName ||
		chartData?.meta?.longName ||
		symbol;
	const stockSymbol =
		realTimeData?.symbol || chartData?.meta?.symbol || symbol;

	// If there's an error, display error screen
	if (error && !loading && stopAutoRefresh && !isSearchingAlternatives) {
		return <ErrorView error={error} onRetry={handleRefresh} />;
	}

	// Show a searching message when looking for alternatives
	if (isSearchingAlternatives) {
		return (
			<div className='w-full px-6 py-8'>
				<div className='flex flex-col items-center justify-center py-12 text-center'>
					<div className='mb-6'>
						<div className='animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full'></div>
					</div>
					<h1 className='text-3xl font-bold mb-4'>
						Finding Alternative Symbol
					</h1>
					<p className='text-lg text-muted-foreground mb-6 max-w-lg'>
						Couldn't find "{symbol}". Searching for similar
						symbols...
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className='w-full px-6 py-8'>
			{/* Stock header information */}
			<StockHeader
				stockName={stockName}
				stockSymbol={stockSymbol}
				realTimeData={realTimeData}
				chartData={chartData}
				loading={loading}
				setIsDialogOpen={setIsAIDialogOpen}
				isLoadingAI={_aiLoading}
			/>

			{/* Time range selector */}
			<div className='mb-4'>
				<RangeSelector
					currentRange={range}
					symbol={symbol || ''}
					isLoading={chartLoading}
					exchangeName={realTimeData?.exchangeName}
				/>
			</div>

			{/* Chart area */}
			<ChartContainer
				chartData={chartData}
				chartLoading={chartLoading}
				error={error}
				range={range}
				isChartUpdating={isChartUpdating}
				realTimeData={realTimeData}
			/>

			{/* AI Assistant Dialog */}
			<AIAssistantDialog
				isOpen={isAIDialogOpen}
				onClose={() => setIsAIDialogOpen(false)}
				symbol={symbol}
				isLoading={_aiLoading}
				data={_aiData}
				useStream={true}
			/>

			{/* Status indicator */}
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

			{/* Add stock details grid */}
			{realTimeData && <StockDetails {...realTimeData} />}
		</div>
	);
}
