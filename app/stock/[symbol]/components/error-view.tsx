'use client';

import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

// 热门股票推荐列表
const POPULAR_STOCKS = [
	{ symbol: 'AAPL', name: 'Apple Inc.' },
	{ symbol: 'MSFT', name: 'Microsoft Corporation' },
	{ symbol: 'GOOGL', name: 'Alphabet Inc.' },
	{ symbol: 'AMZN', name: 'Amazon.com, Inc.' },
	{ symbol: 'TSLA', name: 'Tesla, Inc.' },
	{ symbol: 'META', name: 'Meta Platforms, Inc.' },
];

interface ErrorViewProps {
	error: string;
	onRetry: () => void;
}

export default function ErrorView({ error, onRetry }: ErrorViewProps) {
	return (
		<div className='w-full px-6 py-8'>
			<div className='flex flex-col items-center justify-center py-12 text-center'>
				<div className='mb-6 flex items-center justify-center'>
					<AlertTriangle size={48} className='text-destructive' />
				</div>
				<h1 className='text-3xl font-bold mb-4'>Symbol Not Found</h1>
				<p className='text-lg text-muted-foreground mb-6 max-w-lg'>
					{error}
				</p>

				<div className='flex flex-wrap gap-4 mb-8'>
					<Button asChild variant='outline' size='lg'>
						<Link href='/home'>
							<Home className='mr-2 h-5 w-5' />
							Back to Home
						</Link>
					</Button>
					<Button onClick={onRetry} variant='outline' size='lg'>
						<RefreshCw className='mr-2 h-5 w-5' />
						Try Again
					</Button>
				</div>

				<div className='mt-6'>
					<h2 className='text-xl font-semibold mb-4'>
						Popular Stocks
					</h2>
					<div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3'>
						{POPULAR_STOCKS.map((stock) => (
							<Link
								key={stock.symbol}
								href={`/stock/${stock.symbol}`}
								className='bg-card hover:bg-card/90 transition-colors border rounded-lg px-4 py-3 text-center'
							>
								<div className='font-bold'>{stock.symbol}</div>
								<div className='text-sm text-muted-foreground truncate'>
									{stock.name}
								</div>
							</Link>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
