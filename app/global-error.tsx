'use client';

import { useEffect } from 'react';

import * as Sentry from '@sentry/nextjs';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function GlobalError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		// 向 Sentry 报告错误
		Sentry.captureException(error);
	}, [error]);

	return (
		<html>
			<body>
				<div className='w-full min-h-screen flex flex-col items-center justify-center p-6 bg-background'>
					<div className='mb-6 flex items-center justify-center'>
						<AlertTriangle size={64} className='text-destructive' />
					</div>
					<h1 className='text-3xl font-bold mb-4 text-center'>
						Something Went Wrong
					</h1>
					<p className='text-lg text-muted-foreground mb-6 max-w-lg text-center'>
						We're sorry, but an unexpected error has occurred. Our
						team has been notified and is working to fix the issue.
					</p>

					<div className='mb-6 p-4 bg-destructive/10 rounded-md max-w-lg w-full overflow-auto'>
						<p className='font-mono text-sm text-destructive'>
							{error.message || 'Unknown error'}
						</p>
						{error.digest && (
							<p className='font-mono text-xs text-muted-foreground mt-2'>
								Error ID: {error.digest}
							</p>
						)}
					</div>

					<div className='flex flex-wrap gap-4'>
						<Button
							onClick={() => (window.location.href = '/')} // 使用 window.location.href
							variant='outline'
							size='lg'
						>
							<Home className='mr-2 h-5 w-5' />
							Back to Home
						</Button>
						<Button
							onClick={() => reset()}
							variant='default'
							size='lg'
						>
							<RefreshCw className='mr-2 h-5 w-5' />
							Try Again
						</Button>
					</div>
				</div>
			</body>
		</html>
	);
}
