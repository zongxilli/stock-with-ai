'use client';

import StockChart from './stoct-chart';

interface ChartContainerProps {
	chartData: any;
	chartLoading: boolean;
	error: string | null;
	range: string;
	isChartUpdating: boolean;
	realTimeData: any | null;
}

export default function ChartContainer({
	chartData,
	chartLoading,
	error,
	range,
	isChartUpdating,
	realTimeData,
}: ChartContainerProps) {
	return (
		<div className='w-full h-[500px] rounded-lg border p-4 bg-card relative'>
			{(chartLoading || (!chartData && !realTimeData)) && (
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
	);
}
