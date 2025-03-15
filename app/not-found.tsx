import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';

export default function NotFound() {
	return (
		<div className='w-full min-h-[70vh] flex flex-col items-center justify-center p-6'>
			<div className='mb-6 flex items-center justify-center'>
				<AlertCircle size={64} className='text-muted-foreground' />
			</div>
			<h1 className='text-3xl font-bold mb-4 text-center'>
				Page Not Found
			</h1>
			<p className='text-lg text-muted-foreground mb-8 max-w-lg text-center'>
				We couldn't find the page you're looking for. The page may have
				been moved, deleted, or never existed.
			</p>

			<div className='flex flex-wrap gap-4'>
				<Button asChild variant='outline' size='lg'>
					<Link href='/home'>Back to Home</Link>
				</Button>
			</div>
		</div>
	);
}
