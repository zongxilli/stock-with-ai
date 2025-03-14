'use client';

import { useTheme } from 'next-themes';
import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';

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
	isPartialDay?: boolean; // 表示是否是交易中的部分日数据
}

export default function StockChart({
	data,
	range,
	isPartialDay,
}: StockChartProps) {
	// 获取当前主题
	const { theme } = useTheme();
	const isDarkTheme = theme === 'dark';

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
		return tickIndexes.map((index) => {
			const dateRaw = data[index].dateFormatted;
			// 对于5天视图，只在X轴显示日期部分，不显示时间
			if (range === '5d') {
				return dateRaw.split(' ')[0]; // 只返回日期部分 MM/DD
			}
			return dateRaw;
		});
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

			// 获取完整的日期时间显示
			let fullDateTime = dataPoint.dateFormatted;

			// 自定义全日期时间格式
			if (dataPoint.date) {
				const date = new Date(dataPoint.date);
				if (range === '5d') {
					// 对于5D视图，确保显示完整的日期时间信息
					const options: Intl.DateTimeFormatOptions = {
						weekday: 'short',
						month: 'short',
						day: 'numeric',
						hour: '2-digit',
						minute: '2-digit',
					};
					fullDateTime = date.toLocaleString('en-US', options);
				}
			}

			return (
				<div className='bg-popover border rounded shadow-md p-3 text-sm text-popover-foreground'>
					<p className='font-medium mb-1'>{fullDateTime}</p>
					<p>Open: {formatPrice(dataPoint.open)}</p>
					<p>High: {formatPrice(dataPoint.high)}</p>
					<p>Low: {formatPrice(dataPoint.low)}</p>
					<p className='font-medium'>
						Close: {formatPrice(dataPoint.close)}
					</p>
					{dataPoint.volume && (
						<p className='mt-1'>
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
	const isPositiveTrend =
		lastValidPrice !== null &&
		firstValidPrice !== null &&
		lastValidPrice >= firstValidPrice;

	// 获取图表颜色 - 只在1D视图根据涨跌使用红绿色，其他视图使用蓝色
	const getChartColor = () => {
		if (range === '1d') {
			// 在1D视图下根据涨跌使用红绿色
			if (isPositiveTrend) {
				// 上涨为绿色
				return isDarkTheme
					? 'hsl(142, 71%, 45%)'
					: 'hsl(142, 76%, 36%)'; // 更亮/更暗的绿色
			} else {
				// 下跌为红色
				return isDarkTheme ? 'hsl(0, 84%, 60%)' : 'hsl(0, 84%, 60%)'; // 红色
			}
		} else {
			// 其他视图使用蓝色
			return isDarkTheme ? 'hsl(220, 70%, 60%)' : 'hsl(220, 70%, 50%)'; // 亮蓝/暗蓝
		}
	};

	const trendColor = getChartColor();

	// 确定网格线和轴线颜色
	const gridColor = isDarkTheme
		? 'rgba(255, 255, 255, 0.1)'
		: 'rgba(0, 0, 0, 0.1)';
	const axisColor = isDarkTheme
		? 'rgba(255, 255, 255, 0.3)'
		: 'rgba(0, 0, 0, 0.3)';

	// 确定文字颜色
	const textColor = isDarkTheme
		? 'rgba(255, 255, 255, 0.7)'
		: 'rgba(0, 0, 0, 0.7)';

	// 生成渐变ID - 使其唯一以避免多个图表共享相同渐变
	const gradientId = `colorClose_${range}_${isPositiveTrend ? 'up' : 'down'}`;

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
							id={gradientId}
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
						stroke={gridColor}
						vertical={false}
					/>

					<XAxis
						dataKey='dateFormatted'
						tick={{ fontSize: 12, fill: textColor }}
						ticks={generateXAxisTicks()}
						tickMargin={10}
						axisLine={{ stroke: axisColor }}
					/>

					<YAxis
						domain={yAxisDomain}
						tickFormatter={formatPrice}
						tick={{ fontSize: 12, fill: textColor }}
						axisLine={{ stroke: axisColor }}
						tickMargin={10}
						width={60}
					/>

					<Tooltip content={<CustomTooltip />} />

					<Area
						type='monotone'
						dataKey='close'
						stroke={trendColor}
						fillOpacity={1}
						fill={`url(#${gradientId})`}
						strokeWidth={2}
						connectNulls={false} // 不连接null值点
						activeDot={{
							r: 6,
							stroke: isDarkTheme ? '#121212' : '#ffffff',
							strokeWidth: 2,
						}}
					/>
				</AreaChart>
			</ResponsiveContainer>
		</div>
	);
}
