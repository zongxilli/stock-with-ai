'use client';

import { useEffect, useState } from 'react';

import {
	getStockNews,
	StockNewsItem,
} from '@/app/actions/yahoo/get-stock-news';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface StockNewsProps {
	symbol: string;
	count?: number;
}

export default function StockNews({ symbol, count = 5 }: StockNewsProps) {
	const [news, setNews] = useState<StockNewsItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function fetchNews() {
			if (!symbol) return;

			setLoading(true);
			try {
				const data = await getStockNews(symbol, count);
				setNews(data.news || []);
				setError(null);
			} catch (err) {
				console.error('Failed to fetch news:', err);
				setError('无法加载新闻数据');
			} finally {
				setLoading(false);
			}
		}

		fetchNews();

		// 每10分钟刷新一次新闻
		const interval = setInterval(fetchNews, 600000);
		return () => clearInterval(interval);
	}, [symbol, count]);

	if (loading) {
		return (
			<div className='mt-8'>
				<h2 className='text-2xl font-bold mb-4'>News</h2>
				<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
					{Array(count)
						.fill(0)
						.map((_, index) => (
							<Card key={index} className='overflow-hidden'>
								<CardHeader className='p-4 pb-0'>
									<Skeleton className='h-4 w-3/4 mb-2' />
									<Skeleton className='h-4 w-1/2' />
								</CardHeader>
								<CardContent className='p-4'>
									<div className='flex'>
										<Skeleton className='h-16 w-16 rounded-md mr-3' />
										<div className='flex-1'>
											<Skeleton className='h-3 w-full mb-2' />
											<Skeleton className='h-3 w-5/6 mb-2' />
											<Skeleton className='h-3 w-4/6' />
										</div>
									</div>
								</CardContent>
								<CardFooter className='p-4 pt-0'>
									<Skeleton className='h-3 w-24' />
								</CardFooter>
							</Card>
						))}
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className='mt-8'>
				<h2 className='text-2xl font-bold mb-4'>News</h2>
				<Card className='bg-muted'>
					<CardContent className='p-6 text-center'>
						<p className='text-muted-foreground'>{error}</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	if (news.length === 0) {
		return (
			<div className='mt-8'>
				<h2 className='text-2xl font-bold mb-4'>News</h2>
				<Card className='bg-muted'>
					<CardContent className='p-6 text-center'>
						<p className='text-muted-foreground'>
							当前没有相关新闻
						</p>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className='mt-8'>
			<h2 className='text-2xl font-bold mb-4'>News</h2>
			<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
				{news.map((item) => (
					<Card
						key={item.uuid}
						className='overflow-hidden hover:shadow-md transition-shadow'
					>
						<a
							href={item.link}
							target='_blank'
							rel='noopener noreferrer'
							className='block h-full'
						>
							<CardHeader className='p-4 pb-2'>
								<CardTitle className='text-base line-clamp-2'>
									{item.title}
								</CardTitle>
								<CardDescription>
									{item.publisher}
								</CardDescription>
							</CardHeader>
							<CardContent className='p-4 pt-2 pb-2'>
								<div className='flex'>
									{item.thumbnail?.resolutions &&
									item.thumbnail.resolutions.length > 0 ? (
										<div className='relative h-16 w-16 rounded-md overflow-hidden mr-3 flex-shrink-0'>
											<img
												src={
													item.thumbnail
														.resolutions[0].url
												}
												alt={item.title}
												className='object-cover w-full h-full'
											/>
										</div>
									) : (
										<div className='bg-muted h-16 w-16 rounded-md mr-3 flex items-center justify-center flex-shrink-0'>
											<svg
												xmlns='http://www.w3.org/2000/svg'
												width='24'
												height='24'
												viewBox='0 0 24 24'
												fill='none'
												stroke='currentColor'
												strokeWidth='2'
												strokeLinecap='round'
												strokeLinejoin='round'
												className='text-muted-foreground'
											>
												<rect
													width='18'
													height='18'
													x='3'
													y='3'
													rx='2'
													ry='2'
												/>
												<circle cx='9' cy='9' r='2' />
												<path d='m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21' />
											</svg>
										</div>
									)}
									<div className='text-sm text-muted-foreground line-clamp-3'>
										{item.title}
									</div>
								</div>
							</CardContent>
							<CardFooter className='p-4 pt-2 text-xs text-muted-foreground'>
								{item.publishTime
									? new Date(
											item.publishTime
										).toLocaleString()
									: '未知时间'}
							</CardFooter>
						</a>
					</Card>
				))}
			</div>
		</div>
	);
}
