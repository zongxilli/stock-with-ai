'use client';

import MainIndexes from './components/mainIndexes';
import VolatileStocks from './components/volatileStocks';

export default function HomePage() {
	return (
		<div className='flex-col gap-6'>
			<MainIndexes />
			<VolatileStocks />
		</div>
	);
}
