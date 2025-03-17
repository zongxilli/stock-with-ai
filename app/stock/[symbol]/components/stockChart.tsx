'use client';

import { useEffect, useState, useRef } from 'react';

import { useTheme } from 'next-themes';
import {
	Area,
	AreaChart,
	CartesianGrid,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
	ReferenceLine,
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
	isPreviousTradingDay?: boolean; // 表示是否显示前一交易日的数据
	tradingDate?: string; // 交易日期
	previousClose?: number; // 前一交易日收盘价
	currentPrice?: number; // 当前价格
	marketState?: string; // 市场状态：REGULAR（交易中）, PRE（盘前）, POST（盘后）, CLOSED（已关闭）
	exchangeName?: string; // 交易所名称
	isUpdating?: boolean; // 表示图表是否正在更新
}

export default function StockChart({
	data,
	range,
	isPartialDay,
	isPreviousTradingDay,
	tradingDate,
	previousClose,
	currentPrice,
	marketState,
	exchangeName,
	isUpdating = false,
}: StockChartProps) {
	// 获取当前主题
	const { theme } = useTheme();
	const isDarkTheme = theme === 'dark';

	// 动画状态控制
	const [animateWave, setAnimateWave] = useState(false);
	// 添加脉冲动画状态
	const [pulseTrigger, setPulseTrigger] = useState(0);
	// 添加上次价格变动参考值
	const lastPriceRef = useRef<number | undefined>(undefined);
	// 添加价格变动方向
	const [priceDirection, setPriceDirection] = useState<'up' | 'down' | null>(
		null
	);

	// 确定是否显示交易状态提示
	const showMarketStatus =
		range === '1d' && (marketState || isPreviousTradingDay);

	// 根据市场状态生成状态文本
	const getMarketStatusText = () => {
		// 如果是显示前一交易日的数据
		if (isPreviousTradingDay) {
			return `Market currently closed - Showing data for ${tradingDate || 'previous trading day'}`;
		}

		if (!marketState) return '';

		// 获取交易所缩写
		let exchangeShort = 'ET'; // 默认使用美东时间
		if (exchangeName) {
			if (exchangeName.includes('NASDAQ')) exchangeShort = 'NASDAQ';
			else if (exchangeName.includes('NYSE')) exchangeShort = 'NYSE';
			else if (exchangeName.includes('Shanghai')) exchangeShort = 'SSE';
			else if (exchangeName.includes('Shenzhen')) exchangeShort = 'SZSE';
			else if (exchangeName.includes('Hong Kong')) exchangeShort = 'HKEX';
		}

		switch (marketState) {
			case 'REGULAR':
				return `Market hours • ${exchangeShort} • Trading in progress`;
			case 'PRE':
				return `Pre-market • ${exchangeShort}`;
			case 'POST':
				return `After hours • ${exchangeShort}`;
			case 'CLOSED':
				return `Market closed • ${exchangeShort}`;
			default:
				return `${marketState} • ${exchangeShort}`;
		}
	};

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
	} else if (range === 'max') {
		// 对于MAX视图，我们希望显示足够的年份，但不要过多
		xAxisTickCount = Math.min(10, Math.ceil(data.length / 250));
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
				} else if (range === 'max') {
					// 对于MAX视图，显示完整的年月日
					const options: Intl.DateTimeFormatOptions = {
						year: 'numeric',
						month: 'short',
						day: 'numeric',
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

	// 使用当前价格与前一交易日收盘价比较来确定涨跌趋势
	let isPositiveTrend = false;

	// 1D视图：使用当前价格与前一交易日收盘价比较
	if (
		range === '1d' &&
		currentPrice !== undefined &&
		previousClose !== undefined
	) {
		isPositiveTrend = currentPrice >= previousClose;
	} else {
		// 其他视图：使用图表数据中的第一个和最后一个价格点比较
		const validDataPoints = data.filter((item) => item.close !== null);
		const firstValidPrice =
			validDataPoints.length > 0 ? validDataPoints[0].close : null;
		const lastValidPrice =
			validDataPoints.length > 0
				? validDataPoints[validDataPoints.length - 1].close
				: null;

		isPositiveTrend =
			lastValidPrice !== null &&
			firstValidPrice !== null &&
			lastValidPrice >= firstValidPrice;
	}

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

	// 呼吸效果渐变ID
	const breatheGradientId = `${gradientId}_breathe`;

	// 脉冲效果渐变ID
	const pulseGradientId = `${gradientId}_pulse`;

	// 价格变动闪光效果的渐变ID
	const flashGradientId = `${gradientId}_flash`;

	// 监控价格变化，触发脉冲动画
	useEffect(() => {
		if (
			range === '1d' &&
			marketState === 'REGULAR' &&
			currentPrice !== undefined
		) {
			if (
				lastPriceRef.current !== undefined &&
				lastPriceRef.current !== currentPrice
			) {
				// 判断价格变动方向
				if (currentPrice > lastPriceRef.current) {
					setPriceDirection('up');
				} else if (currentPrice < lastPriceRef.current) {
					setPriceDirection('down');
				}

				// 触发脉冲动画
				setPulseTrigger((prev) => prev + 1);

				// 短暂显示闪光效果后重置
				setTimeout(() => {
					setPriceDirection(null);
				}, 1500);
			}
			lastPriceRef.current = currentPrice;
		}
	}, [currentPrice, range, marketState]);

	// 市场开放时启用呼吸动画
	useEffect(() => {
		if (range === '1d' && marketState === 'REGULAR') {
			setAnimateWave(true);
		} else {
			setAnimateWave(false);
		}
	}, [range, marketState]);

	// 确定图表容器的CSS类，添加过渡效果
	const chartContainerClass = `h-full w-full relative ${
		isUpdating ? 'opacity-90 transition-opacity duration-300' : ''
	}`;

	return (
		<div className={chartContainerClass}>
			{/* 当图表正在更新时显示提示 */}
			{isUpdating && (
				<div className='absolute top-2 right-2 text-xs bg-background/50 text-primary animate-pulse px-2 py-1 rounded-md z-10'>
					Updating...
				</div>
			)}

			{showMarketStatus && (
				<div className='text-xs text-muted-foreground mb-2 text-center'>
					{getMarketStatusText()}
				</div>
			)}

			{range === 'max' && data.length > 0 && (
				<div className='text-xs text-muted-foreground mb-2 text-center'>
					All historical data from {data[0].dateFormatted} to present
				</div>
			)}

			<ResponsiveContainer width='100%' height='95%'>
				<AreaChart
					data={data}
					margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
				>
					<defs>
						{/* 基础渐变色 */}
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
								offset='50%'
								stopColor={trendColor}
								stopOpacity={0.4}
							/>
							<stop
								offset='95%'
								stopColor={trendColor}
								stopOpacity={0.1}
							/>
						</linearGradient>

						{/* 增强的呼吸效果渐变 - 市场开放时使用 */}
						{range === '1d' && marketState === 'REGULAR' && (
							<linearGradient
								id={breatheGradientId}
								x1='0'
								y1='0'
								x2='0'
								y2='1'
							>
								<stop
									offset='5%'
									stopColor={trendColor}
									stopOpacity={0.8}
								>
									{animateWave && (
										<animate
											attributeName='stop-opacity'
											values='0.8;0.9;0.95;0.9;0.8;0.75;0.8'
											dur='3s'
											repeatCount='indefinite'
										/>
									)}
								</stop>
								<stop
									offset='50%'
									stopColor={trendColor}
									stopOpacity={0.4}
								>
									{animateWave && (
										<animate
											attributeName='stop-opacity'
											values='0.4;0.5;0.55;0.5;0.4;0.35;0.4'
											dur='3s'
											repeatCount='indefinite'
										/>
									)}
								</stop>
								<stop
									offset='95%'
									stopColor={trendColor}
									stopOpacity={0.1}
								>
									{animateWave && (
										<animate
											attributeName='stop-opacity'
											values='0.1;0.15;0.2;0.15;0.1;0.08;0.1'
											dur='3s'
											repeatCount='indefinite'
										/>
									)}
								</stop>
							</linearGradient>
						)}

						{/* 价格波动脉冲效果 */}
						{range === '1d' && marketState === 'REGULAR' && (
							<>
								{/* 价格上涨闪光效果 */}
								<radialGradient
									id={`${flashGradientId}_up`}
									cx='50%'
									cy='50%'
									r='50%'
									fx='50%'
									fy='50%'
								>
									<stop
										offset='0%'
										stopColor='#00ff00'
										stopOpacity='0.3'
									>
										{priceDirection === 'up' && (
											<animate
												attributeName='stopOpacity'
												values='0.3;0.1;0'
												dur='1.5s'
												begin={`${pulseTrigger}`}
												repeatCount='1'
											/>
										)}
									</stop>
									<stop
										offset='100%'
										stopColor='#00ff00'
										stopOpacity='0'
									/>
								</radialGradient>

								{/* 价格下跌闪光效果 */}
								<radialGradient
									id={`${flashGradientId}_down`}
									cx='50%'
									cy='50%'
									r='50%'
									fx='50%'
									fy='50%'
								>
									<stop
										offset='0%'
										stopColor='#ff0000'
										stopOpacity='0.3'
									>
										{priceDirection === 'down' && (
											<animate
												attributeName='stopOpacity'
												values='0.3;0.1;0'
												dur='1.5s'
												begin={`${pulseTrigger}`}
												repeatCount='1'
											/>
										)}
									</stop>
									<stop
										offset='100%'
										stopColor='#ff0000'
										stopOpacity='0'
									/>
								</radialGradient>

								{/* 高级脉冲动画渐变 */}
								<linearGradient
									id={pulseGradientId}
									x1='0'
									y1='0'
									x2='0'
									y2='1'
								>
									<stop
										offset='5%'
										stopColor={trendColor}
										stopOpacity='0.8'
									>
										{animateWave && (
											<animate
												attributeName='stop-color'
												values={`${trendColor};${trendColor}90;${trendColor}`}
												dur='2s'
												repeatCount='indefinite'
											/>
										)}
									</stop>
									<stop
										offset='50%'
										stopColor={trendColor}
										stopOpacity='0.5'
									/>
									<stop
										offset='95%'
										stopColor={trendColor}
										stopOpacity='0.05'
									/>
								</linearGradient>
							</>
						)}
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

					<Tooltip
						content={<CustomTooltip />}
						isAnimationActive={false}
					/>

					{/* 显示前收盘价参考线（仅限1D图表） */}
					{range === '1d' && previousClose && (
						<ReferenceLine
							y={previousClose}
							stroke={
								isDarkTheme
									? 'rgba(255,255,255,0.3)'
									: 'rgba(0,0,0,0.3)'
							}
							strokeDasharray='3 3'
							label={{
								value: `Previous Close: $${previousClose.toFixed(2)}`,
								position: 'insideBottomRight',
								fill: textColor,
								fontSize: 11,
							}}
						/>
					)}

					{/* 价格闪光效果 - 价格变动时的视觉反馈 */}
					{range === '1d' &&
						marketState === 'REGULAR' &&
						priceDirection && (
							<rect
								x='0'
								y='0'
								width='100%'
								height='100%'
								fill={`url(#${flashGradientId}_${priceDirection})`}
								fillOpacity='0.5'
							>
								<animate
									attributeName='fillOpacity'
									values='0.5;0.3;0.1;0'
									dur='1.5s'
									begin='0s'
									repeatCount='1'
								/>
							</rect>
						)}

					<Area
						type='monotone'
						dataKey='close'
						stroke={trendColor}
						fillOpacity={1}
						fill={
							range === '1d' && marketState === 'REGULAR'
								? `url(#${breatheGradientId})`
								: `url(#${gradientId})`
						}
						strokeWidth={2}
						connectNulls={false} // 不连接null值点
						activeDot={{
							r: 6,
							stroke: isDarkTheme ? '#121212' : '#ffffff',
							strokeWidth: 2,
							// 添加点击时的动画
							onMouseOver: (props: any) => {
								const dot = props.cx
									? document.querySelector(
											`circle[cx="${props.cx}"][cy="${props.cy}"]`
										)
									: null;
								if (dot) {
									dot.setAttribute('r', '8');
									setTimeout(
										() => dot.setAttribute('r', '6'),
										300
									);
								}
							},
						}}
						// 为曲线添加动画效果
						animationDuration={1000}
						animationEasing='ease-in-out'
						isAnimationActive={range !== '1d'}
					/>
				</AreaChart>
			</ResponsiveContainer>
		</div>
	);
}
