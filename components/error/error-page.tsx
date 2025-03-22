'use client';

import { useEffect, useState } from 'react';

import * as Sentry from '@sentry/nextjs';
import { AlertTriangle, Home, MessageSquare, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface ErrorPageProps {
	error?: Error | null;
	eventId?: string;
}

export default function ErrorPage({ error, eventId }: ErrorPageProps) {
	const router = useRouter();
	const { toast } = useToast();
	const [feedback, setFeedback] = useState('');
	const [showFeedback, setShowFeedback] = useState(false);
	const [sentryEventId, setSentryEventId] = useState(eventId);

	useEffect(() => {
		// 如果没有提供 eventId，则创建一个新的 Sentry 事件
		if (error && !sentryEventId) {
			const newEventId = Sentry.captureException(error);
			setSentryEventId(newEventId);
		}

		// 记录错误到控制台
		console.error('应用发生错误:', error);
	}, [error, sentryEventId]);

	const handleRefresh = () => {
		window.location.reload();
	};

	const handleGoHome = () => {
		router.push('/');
	};

	const handleShowReportDialog = () => {
		if (sentryEventId) {
			Sentry.showReportDialog({ eventId: sentryEventId });
		} else {
			// 如果没有事件 ID，创建一个新的并显示对话框
			const newEventId = Sentry.captureException(
				new Error('用户主动报告错误')
			);
			Sentry.showReportDialog({ eventId: newEventId });
		}
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
					{sentryEventId && (
						<p className='font-mono text-xs text-muted-foreground mt-2'>
							Error ID: {sentryEventId}
						</p>
					)}
				</div>
			)}

			<div className='flex flex-wrap gap-4 mb-6'>
				<Button onClick={handleGoHome} variant='outline' size='lg'>
					<Home className='mr-2 h-5 w-5' />
					Back to Home
				</Button>
				<Button onClick={handleRefresh} variant='default' size='lg'>
					<RefreshCw className='mr-2 h-5 w-5' />
					Refresh Page
				</Button>
				<Button
					onClick={handleShowReportDialog}
					variant='secondary'
					size='lg'
				>
					<MessageSquare className='mr-2 h-5 w-5' />
					Report Problem
				</Button>
			</div>
		</div>
	);
}
