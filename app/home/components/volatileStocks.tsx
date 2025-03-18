'use client';

import { useEffect, useState } from 'react';

import {
	TrendingUp,
	TrendingDown,
	BarChart2,
	AlertCircle,
	Activity,
	RefreshCw,
} from 'lucide-react';
import Link from 'next/link';

import { getVolatileStocks } from '@/app/actions/yahoo/get-volatile-stocks';
import { MarketCard } from '@/components/custom/card';
import { MarketCardSkeleton } from '@/components/custom/marketCardSkeleton';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// 股票数据类型定义
interface StockData {
	symbol: string;
	shortName: string;
	regularMarketPrice: number;
	regularMarketChange: number;
	regularMarketChangePercent: number;
	regularMarketVolume?: number;
}

// 异常波动状态
interface VolatileStocksState {
	gainers: StockData[];
	losers: StockData[];
	mostActives: StockData[];
	mostShorted: StockData[];
	lastUpdated: string;
	loading: boolean;
	error: string | null;
	activeTab: string;
}

export default function VolatileStocks() {
	// 状态管理
	const [state, setState] = useState<VolatileStocksState>({
		gainers: [],
		losers: [],
		mostActives: [],
		mostShorted: [],
		lastUpdated: '',
		loading: true,
		error: null,
		activeTab: 'mostActive', // 修改默认选中的标签为 mostActive
	});

	// 处理标签页切换
	const handleTabChange = (value: string) => {
		setState((prev) => ({ ...prev, activeTab: value }));
	};

	// 获取异常波动数据
	const fetchVolatileStocks = async () => {
		try {
			setState((prev) => ({ ...prev, loading: true, error: null }));
			const data = await getVolatileStocks();

			setState({
				gainers: data.gainers || [],
				losers: data.losers || [],
				mostActives: data.mostActives || [],
				mostShorted: data.mostShorted || [],
				lastUpdated: new Date().toLocaleTimeString(),
				loading: false,
				error: data.error || null,
				activeTab: state.activeTab,
			});
		} catch (error) {
			console.error('获取异常波动股票失败:', error);
			setState((prev) => ({
				...prev,
				loading: false,
				error: 'Failed to load market movers data',
			}));
		}
	};

	// 初始化和刷新数据
	useEffect(() => {
		fetchVolatileStocks();

		// 5分钟自动刷新
		const refreshInterval = setInterval(fetchVolatileStocks, 300000);

		return () => clearInterval(refreshInterval);
	}, []);

	// 渲染骨架屏
	const renderSkeletons = (count: number) => {
		return Array(count)
			.fill(0)
			.map((_, index) => (
				<div className='w-full' key={`skeleton-${index}`}>
					<MarketCardSkeleton />
				</div>
			));
	};

	// 渲染股票列表
	const renderStockList = (stocks: StockData[], showVolume = false) => {
		if (!stocks || stocks.length === 0) {
			return (
				<div className='text-muted-foreground text-center py-4'>
					No data available
				</div>
			);
		}

		return (
			<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'>
				{stocks.map((stock) => (
					<Link
						href={`/stock/${stock.symbol}`}
						key={stock.symbol}
						className='w-full'
					>
						<MarketCard
							name={`${stock.shortName || stock.symbol} ${showVolume ? `(Vol: ${(stock.regularMarketVolume || 0).toLocaleString()})` : ''}`}
							price={stock.regularMarketPrice}
							change={stock.regularMarketChange}
							changePercent={stock.regularMarketChangePercent}
							className='bg-card hover:bg-card/90 transition-colors cursor-pointer h-auto'
						/>
					</Link>
				))}
			</div>
		);
	};

	// 如果所有数据都失败，显示重试界面
	if (
		state.error &&
		!state.loading &&
		!state.gainers.length &&
		!state.losers.length &&
		!state.mostActives.length &&
		!state.mostShorted.length
	) {
		return (
			<div className='space-y-6 mt-8'>
				<h2 className='text-lg font-medium'>Market Movers</h2>
				<div className='bg-card p-8 rounded-lg border text-center'>
					<AlertCircle className='h-12 w-12 mx-auto mb-4 text-destructive' />
					<h3 className='text-lg font-medium mb-2'>
						Failed to load market data
					</h3>
					<p className='text-muted-foreground mb-6'>{state.error}</p>
					<Button
						onClick={fetchVolatileStocks}
						variant='outline'
						className='mx-auto'
					>
						<RefreshCw className='h-4 w-4 mr-2' />
						Retry
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className='space-y-6 mt-8'>
			<div className='flex items-center justify-between mb-2'>
				<h2 className='text-lg font-medium'>Market Movers</h2>
				<button
					onClick={fetchVolatileStocks}
					className='text-xs text-primary hover:underline flex items-center gap-1'
					disabled={state.loading}
				>
					Refresh
					{state.loading && <span className='animate-spin'>⟳</span>}
				</button>
			</div>

			{/* 部分错误显示 - 仍有一些数据可用 */}
			{state.error && (
				<div className='bg-destructive/10 text-destructive p-3 rounded-md mb-4 flex items-center'>
					<AlertCircle className='h-4 w-4 mr-2' />
					{state.error}
				</div>
			)}

			<Tabs
				defaultValue='mostActive' // 修改默认值为 mostActive
				value={state.activeTab}
				onValueChange={handleTabChange}
				className='w-full'
			>
				<TabsList className='mb-4 w-full'>
					{/* 调整标签顺序，将 Most Active 放在第一位 */}
					<TabsTrigger
						value='mostActive'
						className='flex items-center gap-1'
						disabled={state.loading || !state.mostActives.length}
					>
						<Activity className='h-4 w-4 text-blue-500' />
						Most Active
					</TabsTrigger>
					<TabsTrigger
						value='gainers'
						className='flex items-center gap-1'
						disabled={state.loading || !state.gainers.length}
					>
						<TrendingUp className='h-4 w-4 text-green-500' />
						Top Gainers
					</TabsTrigger>
					<TabsTrigger
						value='losers'
						className='flex items-center gap-1'
						disabled={state.loading || !state.losers.length}
					>
						<TrendingDown className='h-4 w-4 text-red-500' />
						Top Losers
					</TabsTrigger>
					<TabsTrigger
						value='mostShorted'
						className='flex items-center gap-1'
						disabled={state.loading || !state.mostShorted.length}
					>
						<BarChart2 className='h-4 w-4 text-orange-500' />
						Most Shorted
					</TabsTrigger>
				</TabsList>

				{/* 调整 TabsContent 顺序以匹配 TabsTrigger 顺序 */}
				<TabsContent value='mostActive'>
					{state.loading
						? renderSkeletons(6)
						: renderStockList(state.mostActives, true)}
				</TabsContent>

				<TabsContent value='gainers'>
					{state.loading
						? renderSkeletons(6)
						: renderStockList(state.gainers)}
				</TabsContent>

				<TabsContent value='losers'>
					{state.loading
						? renderSkeletons(6)
						: renderStockList(state.losers)}
				</TabsContent>

				<TabsContent value='mostShorted'>
					{state.loading
						? renderSkeletons(6)
						: renderStockList(state.mostShorted)}
				</TabsContent>
			</Tabs>

			{/* 更新时间提示 */}
			{!state.loading && state.lastUpdated && (
				<div className='text-xs text-right text-gray-500 mt-1'>
					Last updated: {state.lastUpdated}
				</div>
			)}
		</div>
	);
}
