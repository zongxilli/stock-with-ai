import MainIndexes from './home/components/mainIndexes';
import VolatileStocks from './home/components/volatileStocks';

export default function HomePage() {
	return (
		<div className='flex-col gap-6'>
			<MainIndexes />
			<VolatileStocks />
		</div>
	);
}
