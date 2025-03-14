'use client';

import { useState, useEffect, useRef } from 'react';

import { Search, X, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/useDebounce';

// 股票搜索结果类型
interface StockSearchResult {
	symbol: string;
	shortname: string;
	longname: string;
	type: string;
	exchange: string;
}

interface SearchResponse {
	quotes: StockSearchResult[];
	error?: string;
}

export function StockSearch() {
	const [symbol, setSymbol] = useState('');
	const [searchResults, setSearchResults] = useState<StockSearchResult[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const router = useRouter();
	const dropdownRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	// 使用防抖钩子，300ms延迟避免频繁请求
	const debouncedSearchTerm = useDebounce(symbol, 300);

	// 清除搜索
	const clearSearch = () => {
		setSymbol('');
		setSearchResults([]);
		if (inputRef.current) {
			inputRef.current.focus();
		}
	};

	// 处理搜索提交
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (symbol.trim()) {
			router.push(`/stock/${symbol.trim().toUpperCase()}`);
			setIsDropdownOpen(false);
		}
	};

	// 选择搜索结果
	const handleSelectResult = (result: StockSearchResult) => {
		if (result.symbol) {
			router.push(`/stock/${result.symbol}`);
			setSymbol(result.symbol);
			setIsDropdownOpen(false);
		}
	};

	// 点击外部关闭下拉菜单
	useEffect(() => {
		function handleClickOutside(event: MouseEvent) {
			if (
				dropdownRef.current &&
				!dropdownRef.current.contains(event.target as Node)
			) {
				setIsDropdownOpen(false);
			}
		}

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	// 当防抖搜索词变化时获取搜索结果
	useEffect(() => {
		async function fetchSearchResults() {
			if (debouncedSearchTerm.length < 2) {
				setSearchResults([]);
				setIsLoading(false);
				return;
			}

			setIsLoading(true);
			try {
				const response = await fetch(
					`/api/stock-search?q=${encodeURIComponent(debouncedSearchTerm)}`
				);
				if (!response.ok) {
					throw new Error('搜索请求失败');
				}

				const data: SearchResponse = await response.json();
				setSearchResults(data.quotes || []);
				setIsDropdownOpen(data.quotes && data.quotes.length > 0);
			} catch (error) {
				console.error('获取股票搜索结果失败:', error);
				setSearchResults([]);
			} finally {
				setIsLoading(false);
			}
		}

		if (debouncedSearchTerm) {
			fetchSearchResults();
		} else {
			setSearchResults([]);
			setIsDropdownOpen(false);
		}
	}, [debouncedSearchTerm]);

	// 根据结果类型返回标签文本
	const getTypeLabel = (type: string) => {
		switch (type) {
			case 'EQUITY':
				return 'Stock';
			case 'ETF':
				return 'ETF';
			case 'INDEX':
				return 'Index';
			case 'MUTUALFUND':
				return 'Fund';
			case 'CRYPTOCURRENCY':
				return 'Crypto';
			default:
				return type;
		}
	};

	return (
		<div className='w-full min-w-0 relative' ref={dropdownRef}>
			<form
				onSubmit={handleSubmit}
				className='w-full flex items-center space-x-2'
			>
				<div className='relative w-full'>
					<Input
						ref={inputRef}
						type='text'
						placeholder='Enter stock symbol (e.g. AAPL)'
						value={symbol}
						onChange={(e) => setSymbol(e.target.value)}
						onFocus={() => {
							if (searchResults.length > 0) {
								setIsDropdownOpen(true);
							}
						}}
						className='flex-1 pr-10'
					/>
					{symbol && (
						<button
							type='button'
							onClick={clearSearch}
							className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
						>
							<X className='h-4 w-4' />
						</button>
					)}
				</div>
				<Button type='submit' size='sm'>
					{isLoading ? (
						<Loader2 className='h-4 w-4 animate-spin mr-2' />
					) : (
						<Search className='h-4 w-4 mr-2' />
					)}
					Search
				</Button>
			</form>

			{/* 搜索结果下拉菜单 */}
			{isDropdownOpen && (
				<div className='absolute z-50 w-full mt-1 bg-card border rounded-md shadow-lg max-h-80 overflow-y-auto'>
					<ul>
						{searchResults.map((result) => (
							<li
								key={result.symbol}
								className='px-4 py-2 hover:bg-muted cursor-pointer border-b last:border-0'
								onClick={() => handleSelectResult(result)}
							>
								<div className='flex justify-between items-center'>
									<div>
										<div className='font-medium'>
											{result.symbol}
										</div>
										<div className='text-sm text-muted-foreground truncate max-w-[250px]'>
											{result.shortname ||
												result.longname ||
												result.symbol}
										</div>
									</div>
									<div className='text-xs px-2 py-1 rounded-full bg-secondary text-secondary-foreground'>
										{getTypeLabel(result.type)}
									</div>
								</div>
							</li>
						))}
					</ul>
				</div>
			)}
		</div>
	);
}
