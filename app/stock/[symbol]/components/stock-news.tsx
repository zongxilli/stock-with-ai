'use client';

import { useEffect, useState } from 'react';

import {
	NewsDataPoint,
	getStockNewsData,
} from '@/app/actions/yahoo/get-stock-news-data';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface StockNewsProps {
	symbol: string; // Yahoo Finance symbol
}

export default function StockNews({ symbol }: StockNewsProps) {
	const [news, setNews] = useState<NewsDataPoint[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchNews = async () => {
			try {
				setLoading(true);
				// Use the Yahoo Finance news API instead of EODHD
				const newsData = await getStockNewsData(symbol, 6);
				setNews(newsData);
				setError(null);
			} catch (err) {
				console.error('Error fetching news data:', err);
				setError('Failed to load news data. Please try again later.');
			} finally {
				setLoading(false);
			}
		};

		if (symbol) {
			fetchNews();
		}
	}, [symbol]);

	// 计算相对时间（如：1 hour ago, 2 days ago等）
	const getRelativeTimeString = (dateString: string) => {
		try {
			const date = new Date(dateString);
			const now = new Date();
			const diffMs = now.getTime() - date.getTime();

			// 转换为秒、分钟、小时、天
			const diffSec = Math.floor(diffMs / 1000);
			const diffMin = Math.floor(diffSec / 60);
			const diffHour = Math.floor(diffMin / 60);
			const diffDay = Math.floor(diffHour / 24);

			// 根据时间差决定显示格式
			if (diffDay > 30) {
				// 超过30天显示具体日期
				return new Intl.DateTimeFormat('en-US', {
					year: 'numeric',
					month: 'short',
					day: 'numeric',
				}).format(date);
			} else if (diffDay > 0) {
				return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
			} else if (diffHour > 0) {
				return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
			} else if (diffMin > 0) {
				return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
			} else {
				return 'Just now';
			}
		} catch (error) {
			console.error('日期解析错误:', error);
			return dateString;
		}
	};

	// Loading state UI
	if (loading) {
		return (
			<div className='mt-6'>
				<h2 className='text-xl font-bold mb-4'>Recent News</h2>
				<div className='space-y-4'>
					{[...Array(6)].map((_, index) => (
						<div key={index} className='flex gap-4'>
							<Skeleton className='h-20 w-20 rounded-md' />
							<div className='space-y-2 flex-1'>
								<Skeleton className='h-4 w-full' />
								<Skeleton className='h-4 w-3/4' />
								<Skeleton className='h-3 w-1/4' />
							</div>
						</div>
					))}
				</div>
			</div>
		);
	}

	// Error state UI
	if (error) {
		return (
			<div className='mt-6'>
				<h2 className='text-xl font-bold mb-4'>Recent News</h2>
				<div className='text-destructive'>{error}</div>
			</div>
		);
	}

	// Empty state UI
	if (news.length === 0) {
		return (
			<div className='mt-6'>
				<h2 className='text-xl font-bold mb-4'>Recent News</h2>
				<div className='text-muted-foreground'>
					No news available for this stock.
				</div>
			</div>
		);
	}

	// Main UI for displaying news - Yahoo Finance style
	return (
		<div className='mt-8'>
			<div className='flex justify-between items-center mb-4'>
				<h2 className='text-xl font-bold'>Recent News: {symbol}</h2>
				{news.length > 0 && (
					<a
						href={`https://finance.yahoo.com/quote/${symbol}/news`}
						target='_blank'
						rel='noopener noreferrer'
						className='text-sm text-blue-600 hover:underline flex items-center'
					>
						View More →
					</a>
				)}
			</div>

			<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
				{news.map((item, index) => (
					<div
						key={index}
						className='cursor-pointer group'
						onClick={() =>
							window.open(
								item.link,
								'_blank',
								'noopener,noreferrer'
							)
						}
					>
						<div className='flex gap-4'>
							{item.imageUrl ? (
								<div className='h-24 w-24 md:h-32 md:w-32 overflow-hidden rounded-md flex-shrink-0'>
									<img
										src={item.imageUrl}
										alt={item.title}
										className='object-cover w-full h-full group-hover:scale-105 transition-transform'
										onError={(e) => {
											(
												e.target as HTMLImageElement
											).style.display = 'none';
										}}
									/>
								</div>
							) : (
								<div className='h-24 w-24 md:h-32 md:w-32 bg-gray-200 dark:bg-gray-800 rounded-md flex-shrink-0 flex items-center justify-center'>
									<span className='text-gray-400 text-xs'>
										{symbol}
									</span>
								</div>
							)}

							<div className='flex-1 min-w-0'>
								<h3 className='text-base md:text-lg font-medium line-clamp-2 group-hover:text-blue-600 transition-colors'>
									{item.title}
								</h3>
								<div className='mt-2 flex items-center text-xs text-muted-foreground'>
									<span className='font-medium'>
										{item.publisher || 'Yahoo Finance'}
									</span>
									<span className='mx-1.5'>•</span>
									<span>
										{getRelativeTimeString(item.date)}
									</span>
								</div>

								{item.symbols && item.symbols.length > 1 && (
									<div className='mt-2 flex flex-wrap gap-1'>
										{item.symbols
											.slice(0, 8)
											.map((symbol, idx) => (
												<Badge
													key={idx}
													variant='outline'
													className='text-xs px-1.5 py-0'
												>
													{symbol}
												</Badge>
											))}
										{item.symbols.length > 8 && (
											<span className='text-xs text-muted-foreground'>
												+{item.symbols.length - 8} more
											</span>
										)}
									</div>
								)}
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
