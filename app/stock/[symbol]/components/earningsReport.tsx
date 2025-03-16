'use client';

import { useEffect, useState } from 'react';

import {
	CalendarClock,
	DollarSign,
	ArrowUpRight,
	ArrowDownRight,
	Minus,
} from 'lucide-react';

import { getCompanyEarningsHistory } from '@/app/actions/yahoo-earnings-actions';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// 财报历史记录类型
interface EarningsHistoryItem {
	date: Date | null;
	period: string;
	formattedQuarter: string; // 新增格式化的季度表示
	epsActual: number;
	epsEstimate: number;
	epsDifference: number;
	surprisePercent: number;
	formattedDate: string;
	// 价格信息
	openPrice: number | null;
	openChangePercent: number | null;
	closePrice: number | null;
	closeChangePercent: number | null;
	prevClosePrice: number | null;
}

// 财务数据类型
interface FinancialDataItem {
	date: string;
	revenue: number;
	earnings: number;
}

interface EarningsReportProps {
	symbol: string;
}

export default function EarningsReport({ symbol }: EarningsReportProps) {
	const [earningsData, setEarningsData] = useState<{
		earningsHistory: EarningsHistoryItem[];
		quarterlyData: FinancialDataItem[];
		yearlyData: FinancialDataItem[];
		currency: string;
	} | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function fetchEarningsData() {
			if (!symbol) return;

			setLoading(true);
			try {
				const data = await getCompanyEarningsHistory(symbol);
				setEarningsData(data);
				setError(null);
			} catch (err) {
				console.error('获取财报数据失败:', err);
				setError(err instanceof Error ? err.message : String(err));
			} finally {
				setLoading(false);
			}
		}

		fetchEarningsData();
	}, [symbol]);

	// 格式化数字为金额显示
	const formatCurrency = (
		value: number,
		currency: string = 'USD'
	): string => {
		if (value >= 1e9) {
			return `${(value / 1e9).toFixed(2)}B ${currency}`;
		} else if (value >= 1e6) {
			return `${(value / 1e6).toFixed(2)}M ${currency}`;
		} else {
			return `${value.toLocaleString()} ${currency}`;
		}
	};

	// 格式化百分比
	const formatPercentage = (value: number | null): string => {
		if (value === null) return 'N/A';
		return value > 0 ? `+${value.toFixed(2)}%` : `${value.toFixed(2)}%`;
	};

	// 格式化价格
	const formatPrice = (value: number | null): string => {
		if (value === null) return 'N/A';
		return `$${value.toFixed(2)}`;
	};

	// 获取百分比变动的类名
	const getPercentChangeClass = (percent: number | null): string => {
		if (percent === null) return '';
		return percent > 0
			? 'text-green-500'
			: percent < 0
				? 'text-red-500'
				: '';
	};

	// 获取百分比变动图标
	const getPercentChangeIcon = (percent: number | null) => {
		if (percent === null) return <Minus className='inline h-4 w-4' />;
		if (percent > 0)
			return <ArrowUpRight className='inline h-4 w-4 text-green-500' />;
		if (percent < 0)
			return <ArrowDownRight className='inline h-4 w-4 text-red-500' />;
		return <Minus className='inline h-4 w-4' />;
	};

	if (loading) {
		return (
			<div className='mt-8 w-full'>
				<div className='mb-4'>
					<h2 className='text-xl font-bold flex items-center gap-2'>
						<CalendarClock className='h-5 w-5' />
						<span>Earnings Reports</span>
					</h2>
					<p className='text-sm text-muted-foreground'>
						Loading earnings data...
					</p>
				</div>
				<div className='h-40 w-full flex items-center justify-center'>
					<div className='animate-pulse text-muted-foreground'>
						Loading earnings history...
					</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className='mt-8 w-full'>
				<div className='mb-4'>
					<h2 className='text-xl font-bold flex items-center gap-2'>
						<CalendarClock className='h-5 w-5' />
						<span>Earnings Reports</span>
					</h2>
				</div>
				<div className='h-40 w-full flex items-center justify-center'>
					<div className='text-destructive'>{error}</div>
				</div>
			</div>
		);
	}

	if (
		!earningsData ||
		(!earningsData.earningsHistory.length &&
			!earningsData.quarterlyData.length &&
			!earningsData.yearlyData.length)
	) {
		return (
			<div className='mt-8 w-full'>
				<div className='mb-4'>
					<h2 className='text-xl font-bold flex items-center gap-2'>
						<CalendarClock className='h-5 w-5' />
						<span>Earnings Reports</span>
					</h2>
				</div>
				<div className='h-40 w-full flex items-center justify-center'>
					<div className='text-muted-foreground'>
						No earnings data available for this company
					</div>
				</div>
			</div>
		);
	}

	// 数据准备就绪，渲染完整组件
	return (
		<div className='mt-8 w-full'>
			<div className='mb-4'>
				<h2 className='text-xl font-bold flex items-center gap-2'>
					<CalendarClock className='h-5 w-5' />
					<span>Earnings Reports</span>
				</h2>
				<p className='text-sm text-muted-foreground'>
					Historical earnings reports and financial performance
				</p>
			</div>

			<Tabs defaultValue='earnings-history' className='w-full'>
				<TabsList className='grid w-full grid-cols-3 mb-6'>
					<TabsTrigger value='earnings-history'>
						Earnings History
					</TabsTrigger>
					<TabsTrigger value='quarterly'>Quarterly Data</TabsTrigger>
					<TabsTrigger value='yearly'>Annual Data</TabsTrigger>
				</TabsList>

				{/* 财报历史标签内容 */}
				<TabsContent value='earnings-history'>
					{earningsData.earningsHistory.length > 0 ? (
						<div className='overflow-auto border rounded-md'>
							<Table>
								<TableHeader className='bg-muted/50'>
									<TableRow>
										<TableHead>Quarter</TableHead>
										<TableHead>Report Date</TableHead>
										<TableHead>EPS (Actual)</TableHead>
										<TableHead>EPS (Est)</TableHead>
										<TableHead>Beat/Miss</TableHead>
										<TableHead>Open Price</TableHead>
										<TableHead>Close Price</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{earningsData.earningsHistory.map(
										(item, index) => (
											<TableRow key={index}>
												<TableCell className='font-medium'>
													{item.formattedQuarter}
												</TableCell>
												<TableCell>
													{item.formattedDate}
												</TableCell>
												<TableCell className='font-medium'>
													${item.epsActual.toFixed(2)}
												</TableCell>
												<TableCell>
													$
													{item.epsEstimate.toFixed(
														2
													)}
												</TableCell>
												<TableCell
													className={getPercentChangeClass(
														item.surprisePercent
													)}
												>
													{getPercentChangeIcon(
														item.surprisePercent
													)}{' '}
													{formatPercentage(
														item.surprisePercent
													)}
												</TableCell>
												<TableCell>
													<div className='flex flex-col'>
														<span>
															{formatPrice(
																item.openPrice
															)}
														</span>
														<span
															className={`text-xs ${getPercentChangeClass(item.openChangePercent)}`}
														>
															{item.openChangePercent !==
															null
																? formatPercentage(
																		item.openChangePercent
																	)
																: ''}
														</span>
													</div>
												</TableCell>
												<TableCell>
													<div className='flex flex-col'>
														<span>
															{formatPrice(
																item.closePrice
															)}
														</span>
														<span
															className={`text-xs ${getPercentChangeClass(item.closeChangePercent)}`}
														>
															{item.closeChangePercent !==
															null
																? formatPercentage(
																		item.closeChangePercent
																	)
																: ''}
														</span>
													</div>
												</TableCell>
											</TableRow>
										)
									)}
								</TableBody>
							</Table>
						</div>
					) : (
						<div className='h-40 w-full flex items-center justify-center border rounded-md'>
							<div className='text-muted-foreground'>
								No earnings history data available
							</div>
						</div>
					)}
				</TabsContent>

				{/* 季度数据标签内容 */}
				<TabsContent value='quarterly'>
					{earningsData.quarterlyData.length > 0 ? (
						<div className='overflow-auto border rounded-md'>
							<Table>
								<TableHeader className='bg-muted/50'>
									<TableRow>
										<TableHead>Quarter</TableHead>
										<TableHead>Revenue</TableHead>
										<TableHead>Earnings</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{earningsData.quarterlyData.map(
										(item, index) => (
											<TableRow key={index}>
												<TableCell className='font-medium'>
													{item.date}
												</TableCell>
												<TableCell>
													<DollarSign className='inline h-3 w-3 mb-1' />{' '}
													{formatCurrency(
														item.revenue,
														earningsData.currency
													)}
												</TableCell>
												<TableCell>
													<DollarSign className='inline h-3 w-3 mb-1' />{' '}
													{formatCurrency(
														item.earnings,
														earningsData.currency
													)}
												</TableCell>
											</TableRow>
										)
									)}
								</TableBody>
							</Table>
						</div>
					) : (
						<div className='h-40 w-full flex items-center justify-center border rounded-md'>
							<div className='text-muted-foreground'>
								No quarterly financial data available
							</div>
						</div>
					)}
				</TabsContent>

				{/* 年度数据标签内容 */}
				<TabsContent value='yearly'>
					{earningsData.yearlyData.length > 0 ? (
						<div className='overflow-auto border rounded-md'>
							<Table>
								<TableHeader className='bg-muted/50'>
									<TableRow>
										<TableHead>Year</TableHead>
										<TableHead>Revenue</TableHead>
										<TableHead>Earnings</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{earningsData.yearlyData.map(
										(item, index) => (
											<TableRow key={index}>
												<TableCell className='font-medium'>
													{item.date}
												</TableCell>
												<TableCell>
													<DollarSign className='inline h-3 w-3 mb-1' />{' '}
													{formatCurrency(
														item.revenue,
														earningsData.currency
													)}
												</TableCell>
												<TableCell>
													<DollarSign className='inline h-3 w-3 mb-1' />{' '}
													{formatCurrency(
														item.earnings,
														earningsData.currency
													)}
												</TableCell>
											</TableRow>
										)
									)}
								</TableBody>
							</Table>
						</div>
					) : (
						<div className='h-40 w-full flex items-center justify-center border rounded-md'>
							<div className='text-muted-foreground'>
								No yearly financial data available
							</div>
						</div>
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
}
