'use client';

import { useEffect } from 'react';

import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';

interface ErrorPageProps {
	error?: Error | null;
}

export default function ErrorPage({ error }: ErrorPageProps) {
	const router = useRouter();

	useEffect(() => {
		// 可以在这里记录错误到日志服务
		console.error('应用发生错误:', error);
	}, [error]);

	const handleRefresh = () => {
		window.location.reload();
	};

	const handleGoHome = () => {
		router.push('/');
	};

	return (
		<div className='w-full min-h-screen flex flex-col items-center justify-center p-6 bg-background'>
			<div className='mb-6 flex items-center justify-center'>
				<AlertTriangle size={64} className='text-destructive' />
			</div>
			<h1 className='text-3xl font-bold mb-4 text-center'>
				Something Went Wrong
			</h1>
			<p className='text-lg text-muted-foreground mb-6 max-w-lg text-center'>
				We're sorry, but an unexpected error has occurred. Our team has
				been notified and is working to fix the issue.
			</p>

			{error && (
				<div className='mb-6 p-4 bg-destructive/10 rounded-md max-w-lg w-full overflow-auto'>
					<p className='font-mono text-sm text-destructive'>
						{error.message || 'Unknown error'}
					</p>
				</div>
			)}

			<div className='flex flex-wrap gap-4'>
				<Button onClick={handleGoHome} variant='outline' size='lg'>
					<Home className='mr-2 h-5 w-5' />
					Back to Home
				</Button>
				<Button onClick={handleRefresh} variant='default' size='lg'>
					<RefreshCw className='mr-2 h-5 w-5' />
					Refresh Page
				</Button>
			</div>
		</div>
	);
}
