'use client';

import { useEffect, useState } from 'react';

import StockChartAdvanced from './stock-chart-advanced';

import { HistoricalDataPoint } from '@/app/actions/eodhd/get-historical-data';
import { getHistoricalDataByRange } from '@/app/actions/eodhd/get-historical-data-by-range';
import { formatHistoricalDataForChart } from '@/app/actions/eodhd/utils/format';

interface StockChartAdvancedContainerProps {
	start: string; // 开始日期，格式如 'YYYY-MM-DD'
	end: string; // 结束日期，格式如 'YYYY-MM-DD'
	code: string; // 股票代码
	exchange: string; // 交易所代码
	className?: string; // 可选的样式类
}

export default function StockChartAdvancedContainer({
	start,
	end,
	code,
	exchange,
	className,
}: StockChartAdvancedContainerProps) {
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [historicalData, setHistoricalData] = useState<
		HistoricalDataPoint[] | null
	>(null);
	const [chartData, setChartData] = useState<{
		candlestickData: any[];
		volumeData: any[];
	} | null>(null);

	// 使用 server action 获取历史数据
	useEffect(() => {
		const fetchHistoricalData = async () => {
			setIsLoading(true);
			setError(null);

			try {
				// 调用 server action 获取数据
				const data = await getHistoricalDataByRange(
					code,
					exchange,
					start,
					end
				);

				// 将获取的数据保存到状态中
				setHistoricalData(data);
				const formattedData = formatHistoricalDataForChart(data);
				setChartData(formattedData);
			} catch (err) {
				console.error('获取历史数据时出错:', err);
				setError(err instanceof Error ? err.message : '获取数据失败');
			} finally {
				setIsLoading(false);
			}
		};

		fetchHistoricalData();
	}, [start, end, code, exchange]); // 当这些属性变化时重新获取数据

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
				<div>
					<StockChartAdvanced
						className='mt-4'
						candlestickData={chartData?.candlestickData}
						volumeData={chartData?.volumeData}
					/>

					<div className='mt-4 p-3 text-xs bg-muted rounded-md'>
						<p className='font-medium'>获取的数据参数:</p>
						<p>开始: {start}</p>
						<p>结束: {end}</p>
						<p>
							代码: {code}.{exchange}
						</p>
						<p>数据点: {historicalData?.length || 0}</p>
					</div>
				</div>
			)}
		</div>
	);
}
