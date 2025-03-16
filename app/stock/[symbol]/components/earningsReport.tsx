'use client';

import { useEffect, useState } from 'react';

import {
	CalendarClock,
	TrendingUp,
	TrendingDown,
	DollarSign,
} from 'lucide-react';

import { getCompanyEarningsHistory } from '@/app/actions/yahoo-earnings-actions';
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
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
	epsActual: number;
	epsEstimate: number;
	epsDifference: number;
	surprisePercent: number;
	formattedDate: string;
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

	// 判断 EPS 是否超出预期
	const getEpsSurpriseClass = (actual: number, estimate: number): string => {
		if (actual > estimate) {
			return 'text-green-500';
		} else if (actual < estimate) {
			return 'text-red-500';
		}
		return '';
	};

	// 判断 EPS 变化的图标
	const getEpsSurpriseIcon = (actual: number, estimate: number) => {
		if (actual > estimate) {
			return <TrendingUp className='inline h-4 w-4 text-green-500' />;
		} else if (actual < estimate) {
			return <TrendingDown className='inline h-4 w-4 text-red-500' />;
		}
		return null;
	};

	if (loading) {
		return (
			<Card className='mt-6 w-full'>
				<CardHeader>
					<CardTitle>
						<div className='flex items-center gap-2'>
							<CalendarClock className='h-5 w-5' />
							<span>Earnings Reports</span>
						</div>
					</CardTitle>
					<CardDescription>Loading earnings data...</CardDescription>
				</CardHeader>
				<CardContent>
					<div className='h-40 w-full flex items-center justify-center'>
						<div className='animate-pulse text-muted-foreground'>
							Loading earnings history...
						</div>
					</div>
				</CardContent>
			</Card>
		);
	}

	if (error) {
		return (
			<Card className='mt-6 w-full'>
				<CardHeader>
					<CardTitle>
						<div className='flex items-center gap-2'>
							<CalendarClock className='h-5 w-5' />
							<span>Earnings Reports</span>
						</div>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='h-40 w-full flex items-center justify-center'>
						<div className='text-destructive'>{error}</div>
					</div>
				</CardContent>
			</Card>
		);
	}

	if (
		!earningsData ||
		(!earningsData.earningsHistory.length &&
			!earningsData.quarterlyData.length &&
			!earningsData.yearlyData.length)
	) {
		return (
			<Card className='mt-6 w-full'>
				<CardHeader>
					<CardTitle>
						<div className='flex items-center gap-2'>
							<CalendarClock className='h-5 w-5' />
							<span>Earnings Reports</span>
						</div>
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='h-40 w-full flex items-center justify-center'>
						<div className='text-muted-foreground'>
							No earnings data available for this company
						</div>
					</div>
				</CardContent>
			</Card>
		);
	}

	// 数据准备就绪，渲染完整组件
	return (
		<Card className='mt-6 w-full'>
			<CardHeader>
				<CardTitle>
					<div className='flex items-center gap-2'>
						<CalendarClock className='h-5 w-5' />
						<span>Earnings Reports</span>
					</div>
				</CardTitle>
				<CardDescription>
					Historical earnings reports and financial performance
				</CardDescription>
			</CardHeader>
			<CardContent>
				<Tabs defaultValue='earnings-history'>
					<TabsList className='grid w-full grid-cols-3 mb-4'>
						<TabsTrigger value='earnings-history'>
							Earnings History
						</TabsTrigger>
						<TabsTrigger value='quarterly'>
							Quarterly Data
						</TabsTrigger>
						<TabsTrigger value='yearly'>Annual Data</TabsTrigger>
					</TabsList>

					{/* 财报历史标签内容 */}
					<TabsContent value='earnings-history'>
						{earningsData.earningsHistory.length > 0 ? (
							<div className='overflow-auto'>
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>Quarter</TableHead>
											<TableHead>Date</TableHead>
											<TableHead>Actual EPS</TableHead>
											<TableHead>Estimated EPS</TableHead>
											<TableHead>Surprise</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{earningsData.earningsHistory.map(
											(item, index) => (
												<TableRow key={index}>
													<TableCell>
														{item.period}
													</TableCell>
													<TableCell>
														{item.formattedDate}
													</TableCell>
													<TableCell
														className={getEpsSurpriseClass(
															item.epsActual,
															item.epsEstimate
														)}
													>
														$
														{item.epsActual.toFixed(
															2
														)}
													</TableCell>
													<TableCell>
														$
														{item.epsEstimate.toFixed(
															2
														)}
													</TableCell>
													<TableCell
														className={getEpsSurpriseClass(
															item.epsActual,
															item.epsEstimate
														)}
													>
														{getEpsSurpriseIcon(
															item.epsActual,
															item.epsEstimate
														)}{' '}
														{(
															item.surprisePercent *
															100
														).toFixed(2)}
														%
													</TableCell>
												</TableRow>
											)
										)}
									</TableBody>
								</Table>
							</div>
						) : (
							<div className='h-40 w-full flex items-center justify-center'>
								<div className='text-muted-foreground'>
									No earnings history data available
								</div>
							</div>
						)}
					</TabsContent>

					{/* 季度数据标签内容 */}
					<TabsContent value='quarterly'>
						{earningsData.quarterlyData.length > 0 ? (
							<div className='overflow-auto'>
								<Table>
									<TableHeader>
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
													<TableCell>
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
							<div className='h-40 w-full flex items-center justify-center'>
								<div className='text-muted-foreground'>
									No quarterly financial data available
								</div>
							</div>
						)}
					</TabsContent>

					{/* 年度数据标签内容 */}
					<TabsContent value='yearly'>
						{earningsData.yearlyData.length > 0 ? (
							<div className='overflow-auto'>
								<Table>
									<TableHeader>
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
													<TableCell>
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
							<div className='h-40 w-full flex items-center justify-center'>
								<div className='text-muted-foreground'>
									No yearly financial data available
								</div>
							</div>
						)}
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
	);
}
