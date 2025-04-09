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
	// const router = useRouter();
	// const [suggestions, setSuggestions] = useState<any[]>([]);
	// const [isLoading, setIsLoading] = useState(false);

	// 从错误信息中提取可能的搜索关键字
	// useEffect(() => {
	// 	const searchForAlternatives = async () => {
	// 		// 如果错误信息包含找不到股票的提示
	// 		if (
	// 			error.toLowerCase().includes('symbol not found') ||
	// 			error.toLowerCase().includes('找不到股票') ||
	// 			error.toLowerCase().includes('未找到证券代码') ||
	// 			error.toLowerCase().includes('找不到股票数据')
	// 		) {
	// 			try {
	// 				setIsLoading(true);

	// 				// 从错误信息中提取搜索关键词
	// 				const keywords = error.match(/[A-Za-z0-9.]+/g);
	// 				if (keywords && keywords.length > 0) {
	// 					// 使用第一个找到的关键词进行搜索
	// 					const keyword = keywords[0];
	// 					const result = await searchStock(keyword);

	// 					if (result && !('error' in result) && result.results) {
	// 						// 设置建议列表（最多5个）
	// 						setSuggestions(result.results.slice(0, 5));
	// 					}
	// 				}
	// 			} catch (err) {
	// 				console.error('搜索建议时出错:', err);
	// 			} finally {
	// 				setIsLoading(false);
	// 			}
	// 		}
	// 	};

	// 	searchForAlternatives();
	// }, [error]);

	// 处理建议点击
	// const handleSuggestionClick = (symbol: string) => {
	// 	router.push(`/stock/${symbol}?range=1y`);
	// };

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
						<Link href='/'>
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
								href={`/stock/${stock.symbol}?code=${stock.symbol}&exchange=US&range=1y`}
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

				{/* {isLoading && (
					<p className='text-gray-500 mb-4'>
						Searching for alternatives...
					</p>
				)} */}

				{/* {suggestions.length > 0 && (
					<div className='w-full max-w-md'>
						<h3 className='text-lg font-medium mb-3'>
							Did you mean:
						</h3>
						<ul className='space-y-2 border rounded-md p-4'>
							{suggestions.map((item) => (
								<li
									key={item.symbol}
									className='hover:bg-gray-100 rounded p-2'
								>
									<button
										onClick={() =>
											handleSuggestionClick(item.symbol)
										}
										className='w-full text-left flex justify-between items-center'
									>
										<div>
											<span className='font-medium'>
												{item.symbol}
											</span>
											<p className='text-sm text-gray-600'>
												{item.shortname ||
													item.longname}
											</p>
											{item.exchDisp && (
												<span className='text-xs text-gray-500'>
													{item.exchDisp}
												</span>
											)}
										</div>
										<span className='text-blue-500 text-sm'>
											View →
										</span>
									</button>
								</li>
							))}
						</ul>
					</div>
				)} */}
			</div>
		</div>
	);
}
