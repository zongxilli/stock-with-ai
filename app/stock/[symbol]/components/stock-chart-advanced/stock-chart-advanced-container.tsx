'use client';

import { useEffect, useState } from 'react';

import StockChartAdvanced from './stock-chart-advanced';

import { getSplitAdjustedData } from '@/app/actions/eodhd/indicators/splitadjusted';
import { formatSplitAdjustedDataForChart } from '@/app/actions/eodhd/utils/format';
import { getStockRealTimeDataForChart } from '@/app/actions/yahoo/get-stock-realtime-data';
import {
	ChartDataPoint,
	ChartHeightMode,
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

	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [chartData, setChartData] = useState<{
		candlestickData: any[];
		volumeData: any[];
	} | null>(null);
	// 新增：实时蜡烛图数据状态
	const [realtimeCandle, setRealtimeCandle] = useState<
		ChartDataPoint | undefined
	>(undefined);

	// 使用 server action 获取历史数据
	useEffect(() => {
		const fetchHistoricalData = async () => {
			setIsLoading(true);
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
				setIsLoading(false);
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

		fetchRealtimeData();
	}, [symbol, chartData]);

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
					height={heightMode}
					realtimeCandle={realtimeCandle}
				/>
			)}
		</div>
	);
}
