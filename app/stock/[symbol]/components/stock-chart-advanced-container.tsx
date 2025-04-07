'use client';

import { useEffect, useState } from 'react';

import StockChartAdvanced from './stock-chart-advanced';

import { getSplitAdjustedData } from '@/app/actions/eodhd/indicators/splitadjusted';
import { formatSplitAdjustedDataForChart } from '@/app/actions/eodhd/utils/format';
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
	className?: string; // 可选的样式类
	heightMode?: ChartHeightMode; // 图表高度模式
}

export default function StockChartAdvancedContainer({
	start,
	end,
	code,
	exchange,
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
				// 调用 server action 获取数据
				// const data = await getHistoricalDataByPeriod(
				// 	code,
				// 	exchange,
				// 	start,
				// 	end,
				// 	preference?.chart.period
				// );

				const data = await getSplitAdjustedData({
					code,
					exchange,
					range: 'max',
					aggPeriod: preference?.chart.period,
				});

				// const formattedData = formatHistoricalDataForChart(
				// 	data,
				// 	preference?.chart.upColor,
				// 	preference?.chart.downColor
				// );
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

	// 新增：模拟实时数据更新
	useEffect(() => {
		if (!chartData || chartData.candlestickData.length === 0) return;

		// 基于最后一个蜡烛图数据点创建实时数据
		const lastCandle =
			chartData.candlestickData[chartData.candlestickData.length - 1];
		let currentRealtimeCandle: ChartDataPoint | undefined = undefined;

		// 创建模拟实时数据函数
		const generateRealtimeUpdate = () => {
			// 从上一个记录的价格开始，或从最后一个历史蜡烛图开始
			const baseCandle = currentRealtimeCandle || lastCandle;

			// 获取当前日期作为时间戳
			const today = new Date();
			today.setDate(today.getDate() + 1); // 获取明天的日期
			const timeStr = today.toISOString().split('T')[0]; // 格式：'YYYY-MM-DD'

			// 创建一个小的随机变化
			const priceChange = (Math.random() - 0.5) * baseCandle.close * 0.01; // 价格变动在 ±0.5% 之间
			const volumeChange = Math.random() * baseCandle.volume * 0.1; // 成交量变动在 0-10% 之间

			// 计算新的价格
			const newClose = baseCandle.close + priceChange;
			const newHigh = Math.max(baseCandle.high, newClose);
			const newLow = Math.min(baseCandle.low, newClose);

			// 创建新的实时蜡烛图数据
			currentRealtimeCandle = {
				time: timeStr,
				open: baseCandle.close, // 开盘价为上一根蜡烛的收盘价
				high: newHigh,
				low: newLow,
				close: newClose,
				volume: baseCandle.volume + volumeChange,
			};

			// 更新状态
			setRealtimeCandle(currentRealtimeCandle);
		};

		// 每秒更新一次实时数据
		const intervalId = setInterval(generateRealtimeUpdate, 1000);

		// 清理函数
		return () => {
			clearInterval(intervalId);
		};
	}, [chartData]);

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
