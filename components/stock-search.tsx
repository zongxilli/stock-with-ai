'use client';

import { useState } from 'react';

import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function StockSearch() {
	const [symbol, setSymbol] = useState('');
	const router = useRouter();

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (symbol.trim()) {
			router.push(`/stock/${symbol.trim().toUpperCase()}`);
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			className='w-full min-w-0 flex items-center space-x-2'
		>
			<Input
				type='text'
				placeholder='Enter stock symbol (e.g. AAPL)'
				value={symbol}
				onChange={(e) => setSymbol(e.target.value)}
				className='flex-1'
			/>
			<Button type='submit' size='sm'>
				<Search className='h-4 w-4 mr-2' />
				Search
			</Button>
		</form>
	);
}
