'use client';

import { useState, useEffect, useRef } from 'react';

import { Search, X, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { searchStock } from '@/app/actions/eodhd/search-stock';
import { redirectToStockPage } from '@/app/actions/helpers/redirect-to-stock-page';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/useDebounce';

// 股票搜索结果类型
interface StockSearchResult {
	symbol: string;
	shortname: string;
	longname: string;
	type: string;
	exchange: string;
	ISIN: string;
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
		setIsDropdownOpen(false);
		if (inputRef.current) {
			inputRef.current.focus();
		}
	};

	const redirectToStockAndClearSearch = async (
		eodhdSymbol: string,
		exchange: string = ''
	) => {
		await redirectToStockPage(eodhdSymbol, exchange, router);
		clearSearch();
	};

	// 处理搜索提交
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (symbol.trim()) {
			// 立即触发搜索，不管debounce状态
			try {
				// 先设置加载状态
				setIsLoading(true);

				// 主动触发搜索，不依赖debounce
				const eodhdResults = await searchStock(symbol.trim(), {});

				if (eodhdResults && eodhdResults.length > 0) {
					// 优先使用搜索结果中的第一项，同时提供交易所信息
					redirectToStockAndClearSearch(
						eodhdResults[0].Code,
						eodhdResults[0].Exchange
					);
				} else {
					// 没有搜索结果时才使用用户输入
					redirectToStockAndClearSearch(symbol.trim());
				}
			} catch (error) {
				console.error('搜索股票时出错:', error);
				// 出错时使用用户输入的symbol
				redirectToStockAndClearSearch(symbol.trim());
			} finally {
				setIsLoading(false);
			}
		}
	};

	// 选择搜索结果
	const handleSelectResult = (result: StockSearchResult) => {
		if (result.symbol) {
			redirectToStockAndClearSearch(result.symbol, result.exchange);
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
				// 使用新的EODHD搜索函数
				const eodhdResults = await searchStock(debouncedSearchTerm, {});

				// 转换EODHD结果格式以匹配现有的StockSearchResult接口
				const formattedResults = eodhdResults.map((item) => ({
					symbol: item.Code,
					shortname: item.Name,
					longname: item.Name,
					type: item.Type,
					exchange: item.Exchange,
					ISIN: item.ISIN ?? '',
				}));

				setSearchResults(formattedResults);
				setIsDropdownOpen(formattedResults.length > 0);
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

	return (
		<div className='w-full min-w-0 relative' ref={dropdownRef}>
			<form onSubmit={handleSubmit} className='w-full flex items-center'>
				<div className='relative w-full'>
					<div className='absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground'>
						<Search className='h-4 w-4' />
					</div>
					<Input
						ref={inputRef}
						type='text'
						placeholder='Search for symbols or companies'
						value={symbol}
						onChange={(e) => setSymbol(e.target.value)}
						onFocus={() => {
							if (searchResults.length > 0) {
								setIsDropdownOpen(true);
							}
						}}
						className='flex-1 pl-10 pr-10 rounded-full h-10 bg-secondary/80 border-0 focus-visible:ring-1 focus-visible:ring-offset-0'
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
					{isLoading && !symbol && (
						<div className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground'>
							<Loader2 className='h-4 w-4 animate-spin' />
						</div>
					)}
				</div>
			</form>

			{/* 搜索结果下拉菜单 */}
			{isDropdownOpen && (
				<div className='absolute z-50 w-full mt-1 bg-card border rounded-md shadow-lg max-h-80 overflow-y-auto'>
					<ul>
						{searchResults.map((result) => (
							<li
								key={`${result.symbol}-${result.exchange}-${result.type}`}
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
										{result.type}
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
