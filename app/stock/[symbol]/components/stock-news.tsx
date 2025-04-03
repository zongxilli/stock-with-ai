'use client';

import { useEffect, useState } from 'react';

import Link from 'next/link';

import { getNewsData, NewsDataPoint } from '@/app/actions/eodhd/get-news-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

	// Loading state UI
	if (loading) {
		return (
			<Card className='mt-4'>
				<CardHeader>
					<CardTitle>Stock News</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='space-y-4'>
						{[...Array(3)].map((_, index) => (
							<div key={index} className='space-y-2'>
								<Skeleton className='h-5 w-3/4' />
								<Skeleton className='h-4 w-full' />
								<Skeleton className='h-4 w-full' />
								<Skeleton className='h-4 w-2/3' />
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		);
	}

	// Error state UI
	if (error) {
		return (
			<Card className='mt-4'>
				<CardHeader>
					<CardTitle>Stock News</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='text-destructive'>{error}</div>
				</CardContent>
			</Card>
		);
	}

	// Empty state UI
	if (news.length === 0) {
		return (
			<Card className='mt-4'>
				<CardHeader>
					<CardTitle>Stock News</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='text-muted-foreground'>
						No news available for this stock.
					</div>
				</CardContent>
			</Card>
		);
	}

	// Main UI for displaying news
	return (
		<Card className='mt-4'>
			<CardHeader>
				<CardTitle>Stock News</CardTitle>
			</CardHeader>
			<CardContent>
				<div className='space-y-4'>
					{news.map((item, index) => (
						<div key={index} className='space-y-2'>
							<Link
								href={item.link}
								target='_blank'
								rel='noopener noreferrer'
								className='hover:underline'
							>
								<h3 className='text-md font-semibold'>
									{item.title}
								</h3>
							</Link>
							<p className='text-sm text-muted-foreground'>
								{formatNewsDate(item.date)}
							</p>
							<p className='text-sm'>
								{truncateText(item.content, 150)}
							</p>
							{index < news.length - 1 && <hr className='mt-3' />}
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
}
