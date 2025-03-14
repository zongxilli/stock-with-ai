'use client';

import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';

// 更新 props 类型定义，添加 isPartialDay 属性
interface StockChartProps {
	data: Array<{
		date: Date;
		dateFormatted: string;
		open: number | null;
		high: number | null;
		low: number | null;
		close: number | null;
		volume: number | null;
		adjclose?: number | null;
	}>;
	range: string;
	isPartialDay?: boolean; // 新增属性，表示是否是交易中的部分日数据
}

export default function StockChart({
	data,
	range,
	isPartialDay,
}: StockChartProps) {
	// 如果没有数据，显示提示信息
	if (!data || data.length === 0) {
		return (
			<div className='h-full w-full flex items-center justify-center'>
				<div className='text-muted-foreground'>
					No chart data available
				</div>
			</div>
		);
	}

	// 为tooltip格式化价格
	const formatPrice = (value: number | null) => {
		return value === null ? 'N/A' : `$${value.toFixed(2)}`;
	};

	// 计算价格范围，但只考虑有数据的点
	const validPrices = data
		.filter((item) => item.close !== null)
		.map((item) => item.close as number);

	const minPrice = validPrices.length > 0 ? Math.min(...validPrices) : 0;
	const maxPrice = validPrices.length > 0 ? Math.max(...validPrices) : 100;
	const priceRange = maxPrice - minPrice;

	const yAxisDomain = [
		Math.max(0, minPrice - priceRange * 0.05),
		maxPrice + priceRange * 0.05,
	];

	// 配置X轴刻度数量
	let xAxisTickCount = 5;
	if (range === '1d') {
		xAxisTickCount = 7; // 对于1D视图，显示更多时间点
	} else if (range === '5d') {
		xAxisTickCount = Math.min(6, Math.ceil(data.length / 10));
	} else if (data.length > 30) {
		xAxisTickCount = Math.min(10, Math.ceil(data.length / 15));
	}

	// 确定哪些索引位置显示刻度
	const getTickIndexes = (dataLength: number, count: number) => {
		if (dataLength <= count) {
			return Array.from({ length: dataLength }, (_, i) => i);
		}

		const step = Math.floor(dataLength / (count - 1));
		const indexes = [];

		for (let i = 0; i < count - 1; i++) {
			indexes.push(i * step);
		}
		indexes.push(dataLength - 1);

		return indexes;
	};

	const tickIndexes = getTickIndexes(data.length, xAxisTickCount);

	// 根据数据点生成X轴刻度
	const generateXAxisTicks = () => {
		return tickIndexes.map((index) => data[index].dateFormatted);
	};

	// 自定义tooltip内容
	const CustomTooltip = ({ active, payload, label }: any) => {
		if (active && payload && payload.length) {
			const dataPoint = payload[0].payload;

			// 如果这个数据点没有收盘价（未来的时间点），则显示特殊消息
			if (dataPoint.close === null) {
				return (
					<div className='bg-popover border rounded shadow-md p-3 text-sm'>
						<p className='font-medium mb-1'>
							{dataPoint.dateFormatted}
						</p>
						<p className='text-muted-foreground'>
							No trading data yet
						</p>
					</div>
				);
			}

			return (
				<div className='bg-popover border rounded shadow-md p-3 text-sm'>
					<p className='font-medium mb-1'>
						{dataPoint.dateFormatted}
					</p>
					<p className='text-muted-foreground'>
						Open: {formatPrice(dataPoint.open)}
					</p>
					<p className='text-muted-foreground'>
						High: {formatPrice(dataPoint.high)}
					</p>
					<p className='text-muted-foreground'>
						Low: {formatPrice(dataPoint.low)}
					</p>
					<p className='font-medium'>
						Close: {formatPrice(dataPoint.close)}
					</p>
					{dataPoint.volume && (
						<p className='text-muted-foreground mt-1'>
							Volume: {dataPoint.volume.toLocaleString()}
						</p>
					)}
				</div>
			);
		}
		return null;
	};

	// 找到最后一个有效的价格点（用于确定颜色趋势）
	const validDataPoints = data.filter((item) => item.close !== null);
	const firstValidPrice =
		validDataPoints.length > 0 ? validDataPoints[0].close : null;
	const lastValidPrice =
		validDataPoints.length > 0
			? validDataPoints[validDataPoints.length - 1].close
			: null;

	// 确定股票价格走势的颜色
	const trendColor =
		lastValidPrice !== null &&
		firstValidPrice !== null &&
		lastValidPrice >= firstValidPrice
			? 'var(--chart-1)' // 绿色
			: 'var(--destructive)'; // 红色

	// 处理部分交易日视图特殊标记
	const renderPartialDayMarker = () => {
		if (isPartialDay && range === '1d') {
			// 找到第一个没有数据的点
			const firstNullIndex = data.findIndex(
				(item) => item.close === null
			);
			if (firstNullIndex === -1) return null;

			// 计算这个点在图表上的位置百分比
			const position = (firstNullIndex / data.length) * 100;

			return (
				<line
					x1={`${position}%`}
					y1='0%'
					x2={`${position}%`}
					y2='100%'
					stroke='var(--muted-foreground)'
					strokeWidth='1'
					strokeDasharray='5,5'
				/>
			);
		}
		return null;
	};

	return (
		<div className='h-full w-full'>
			{isPartialDay && range === '1d' && (
				<div className='text-xs text-muted-foreground mb-2 text-center'>
					Market hours: 9:30 AM - 4:00 PM ET • Trading in progress
				</div>
			)}

			<ResponsiveContainer width='100%' height='95%'>
				<AreaChart
					data={data}
					margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
				>
					<defs>
						<linearGradient
							id='colorClose'
							x1='0'
							y1='0'
							x2='0'
							y2='1'
						>
							<stop
								offset='5%'
								stopColor={trendColor}
								stopOpacity={0.8}
							/>
							<stop
								offset='95%'
								stopColor={trendColor}
								stopOpacity={0.1}
							/>
						</linearGradient>
					</defs>

					<CartesianGrid
						strokeDasharray='3 3'
						stroke='var(--border)'
						vertical={false}
					/>

					<XAxis
						dataKey='dateFormatted'
						tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
						ticks={generateXAxisTicks()}
						tickMargin={10}
						axisLine={{ stroke: 'var(--border)' }}
					/>

					<YAxis
						domain={yAxisDomain}
						tickFormatter={formatPrice}
						tick={{ fontSize: 12, fill: 'var(--muted-foreground)' }}
						axisLine={{ stroke: 'var(--border)' }}
						tickMargin={10}
						width={60}
					/>

					<Tooltip content={<CustomTooltip />} />

					{/* 自定义部分交易日标记 */}
					{renderPartialDayMarker()}

					<Area
						type='monotone'
						dataKey='close'
						stroke={trendColor}
						fillOpacity={1}
						fill='url(#colorClose)'
						strokeWidth={2}
						connectNulls={false} // 不连接null值点
						activeDot={{
							r: 6,
							stroke: 'var(--background)',
							strokeWidth: 2,
						}}
					/>
				</AreaChart>
			</ResponsiveContainer>
		</div>
	);
}
