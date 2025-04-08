'use client';

import { useEffect, useMemo, useState } from 'react';

import StockChartAdvanced from './stock-chart-advanced';

import { getSMA } from '@/app/actions/eodhd/indicators/sma';
import { getSplitAdjustedData } from '@/app/actions/eodhd/indicators/splitadjusted';
import {
	formatSmaDataForChart,
	formatSplitAdjustedDataForChart,
} from '@/app/actions/eodhd/utils/format';
import { getStockRealTimeDataForChart } from '@/app/actions/yahoo/get-stock-realtime-data';
import {
	ChartDataPoint,
	ChartHeightMode,
	SmaDataPoint,
} from '@/app/types/stock-page/chart-advanced';
import { useProfile } from '@/hooks/use-profile';

interface StockChartAdvancedContainerProps {
	start: string; // 开始日期，格式如 'YYYY-MM-DD'
	end: string; // 结束日期，格式如 'YYYY-MM-DD'
	code: string; // 股票代码
	exchange: string; // 交易所代码
	symbol: string; // 股票代码 Yahoo Finance
	className?: string; // 可选的样式类
	heightMode?: ChartHeightMode; // 图表高度模式
}

export default function StockChartAdvancedContainer({
	start,
	end,
	code,
	exchange,
	symbol,
	className,
	heightMode = ChartHeightMode.NORMAL, // 默认为普通高度
}: StockChartAdvancedContainerProps) {
	const { preference } = useProfile();

	const [isChartDataLoading, setIsChartDataLoading] = useState<boolean>(true);
	const [isSmaDataLoading, setIsSmaDataLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [chartData, setChartData] = useState<{
		candlestickData: any[];
		volumeData: any[];
	} | null>(null);
	// 新增：实时蜡烛图数据状态
	const [realtimeCandle, setRealtimeCandle] = useState<
		ChartDataPoint | undefined
	>(undefined);
	// 新增：SMA数据状态
	const [smaData, setSmaData] = useState<SmaDataPoint[]>([]);

	// 使用 server action 获取历史数据
	useEffect(() => {
		const fetchHistoricalData = async () => {
			setIsChartDataLoading(true);
			setError(null);

			try {
				const data = await getSplitAdjustedData({
					code,
					exchange,
					range: 'max',
					aggPeriod: preference?.chart.period,
				});

				const formattedData = formatSplitAdjustedDataForChart(
					data,
					preference?.chart.upColor,
					preference?.chart.downColor
				);
				setChartData(formattedData);
			} catch (err) {
				console.error('获取历史数据时出错:', err);
				setError(err instanceof Error ? err.message : '获取数据失败');
			} finally {
				setIsChartDataLoading(false);
			}
		};

		fetchHistoricalData();
	}, [
		start,
		end,
		code,
		exchange,
		preference?.chart.upColor,
		preference?.chart.downColor,
		preference?.chart.period,
	]); // 当这些属性变化时重新获取数据

	// 获取实时数据
	useEffect(() => {
		if (!chartData || chartData.candlestickData.length === 0) return;

		const fetchRealtimeData = async () => {
			const realtimeChartData =
				await getStockRealTimeDataForChart(symbol);

			setRealtimeCandle(realtimeChartData);
		};

		// 立即获取实时数据
		fetchRealtimeData();

		// 设置定时器，每15秒更新一次实时数据
		const intervalId = setInterval(() => {
			fetchRealtimeData();
		}, 4000); // 15秒钟更新一次

		// 清理函数，组件卸载时清除定时器
		return () => {
			clearInterval(intervalId);
		};
	}, [symbol, chartData]);

	// 新增：获取SMA数据
	useEffect(() => {
		if (preference?.chart.period !== 'd') return;

		if (!chartData || chartData.candlestickData.length === 0) return;

		const fetchSmaData = async () => {
			setIsSmaDataLoading(true);
			try {
				// 获取SMA数据，使用默认周期为20
				const smaDataResponse = await getSMA({
					code,
					exchange,
					range: 'max',
					period: 20, // 使用20作为默认周期
				});

				// 格式化SMA数据
				const formattedSmaData = formatSmaDataForChart(
					smaDataResponse as { date: string; sma: number | null }[],
					chartData.candlestickData // 传入K线图数据用于日期筛选
				);

				setSmaData(formattedSmaData);
			} catch (err) {
				console.error('获取SMA数据时出错:', err);
				// 不设置主要错误，因为这只是辅助数据
			} finally {
				setIsSmaDataLoading(false);
			}
		};

		fetchSmaData();
	}, [code, exchange, chartData, preference?.chart.period]);

	const isLoading = useMemo(() => {
		return isChartDataLoading || isSmaDataLoading;
	}, [isChartDataLoading, isSmaDataLoading]);

	return (
		<div
			className={`w-full rounded-lg border p-6 bg-card shadow-sm relative ${className || ''}`}
		>
			{isLoading && (
				<div className='h-full w-full flex items-center justify-center min-h-[400px]'>
					<div className='animate-pulse text-muted-foreground'>
						正在加载图表数据...
					</div>
				</div>
			)}

			{error && !isLoading && (
				<div className='h-full w-full flex items-center justify-center min-h-[400px]'>
					<div className='text-destructive'>{error}</div>
				</div>
			)}

			{!isLoading && !error && (
				<StockChartAdvanced
					className='mt-4'
					candlestickData={chartData?.candlestickData}
					volumeData={chartData?.volumeData}
					smaData={preference?.chart.period === 'd' ? smaData : []}
					height={heightMode}
					realtimeCandle={realtimeCandle}
				/>
			)}
		</div>
	);
}
