'use client';

import { useEffect, useState } from 'react';

import { getNewsData, NewsDataPoint } from '@/app/actions/eodhd/get-news-data';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface StockNewsProps {
	code: string;
	exchange: string;
}

export default function StockNews({ code, exchange }: StockNewsProps) {
	const [news, setNews] = useState<NewsDataPoint[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchNews = async () => {
			try {
				setLoading(true);
				// Fetch 6 news items as requested
				const newsData = await getNewsData(code, exchange, 6);
				setNews(newsData);
				setError(null);
			} catch (err) {
				console.error('Error fetching news data:', err);
				setError('Failed to load news data. Please try again later.');
			} finally {
				setLoading(false);
			}
		};

		if (code && exchange) {
			fetchNews();
		}
	}, [code, exchange]);

	// Format the date string to a more readable format
	const formatNewsDate = (dateString: string) => {
		try {
			const date = new Date(dateString);
			// Use simple date formatting without date-fns
			return new Intl.DateTimeFormat('en-US', {
				year: 'numeric',
				month: 'short',
				day: 'numeric',
			}).format(date);
		} catch (_) {
			return dateString;
		}
	};

	// Truncate long text to a specified length with ellipsis
	const truncateText = (text: string, maxLength: number) => {
		if (text.length <= maxLength) return text;
		return text.substring(0, maxLength) + '...';
	};

	// Function to open news link in a new window
	const openNewsLink = (url: string) => {
		window.open(url, '_blank', 'noopener,noreferrer');
	};

	// Loading state UI
	if (loading) {
		return (
			<div className='mt-4'>
				<h2 className='text-xl font-bold mb-4'>Stock News</h2>
				<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
					{[...Array(6)].map((_, index) => (
						<div key={index} className='space-y-2'>
							<Skeleton className='h-[200px] w-full rounded-lg' />
						</div>
					))}
				</div>
			</div>
		);
	}

	// Error state UI
	if (error) {
		return (
			<div className='mt-4'>
				<h2 className='text-xl font-bold mb-4'>Stock News</h2>
				<div className='text-destructive'>{error}</div>
			</div>
		);
	}

	// Empty state UI
	if (news.length === 0) {
		return (
			<div className='mt-4'>
				<h2 className='text-xl font-bold mb-4'>Stock News</h2>
				<div className='text-muted-foreground'>
					No news available for this stock.
				</div>
			</div>
		);
	}

	// Main UI for displaying news
	return (
		<div className='mt-4'>
			<h2 className='text-xl font-bold mb-4'>Stock News</h2>
			<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
				{news.map((item, index) => (
					<Card
						key={index}
						className='overflow-hidden transition-all duration-200 hover:shadow-lg cursor-pointer'
						onClick={() => openNewsLink(item.link)}
					>
						<CardContent className='p-4'>
							<div className='space-y-2'>
								<p className='text-sm text-muted-foreground'>
									{formatNewsDate(item.date)}
								</p>
								<h3 className='text-md font-semibold line-clamp-2'>
									{item.title}
								</h3>
								<p className='text-sm line-clamp-3'>
									{truncateText(item.content, 120)}
								</p>

								{item.symbols && item.symbols.length > 0 && (
									<div className='pt-2'>
										<p className='text-xs text-muted-foreground mb-1'>
											Related Symbols:
										</p>
										<div className='flex flex-wrap gap-1'>
											{item.symbols.map((symbol, idx) => (
												<Badge
													key={idx}
													variant='outline'
													className='text-xs'
												>
													{symbol}
												</Badge>
											))}
										</div>
									</div>
								)}
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</div>
	);
}
