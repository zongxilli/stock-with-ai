'use client';

import { useEffect, useState } from 'react';

import ErrorPage from './error-page';

interface ErrorBoundaryProps {
	children: React.ReactNode;
}

export default function ErrorBoundary({ children }: ErrorBoundaryProps) {
	const [hasError, setHasError] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	useEffect(() => {
		const handleError = (error: ErrorEvent) => {
			console.error('全局错误捕获:', error);
			setError(error.error);
			setHasError(true);
		};

		const handleRejection = (event: PromiseRejectionEvent) => {
			console.error('未处理的Promise拒绝:', event.reason);
			setError(new Error(event.reason?.message || '未处理的Promise拒绝'));
			setHasError(true);
		};

		window.addEventListener('error', handleError);
		window.addEventListener('unhandledrejection', handleRejection);

		return () => {
			window.removeEventListener('error', handleError);
			window.removeEventListener('unhandledrejection', handleRejection);
		};
	}, []);

	if (hasError) {
		return <ErrorPage error={error} />;
	}

	return <>{children}</>;
}
