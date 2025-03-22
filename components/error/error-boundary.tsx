'use client';

import { Component, ErrorInfo, ReactNode, useEffect, useState } from 'react';

import * as Sentry from '@sentry/nextjs';

import ErrorPage from './error-page';

interface ErrorBoundaryProps {
	children: ReactNode;
	fallback?: ReactNode;
}

interface ErrorBoundaryState {
	hasError: boolean;
	error: Error | null;
}

// 使用 Class 组件实现错误边界，因为 React 的错误边界必须使用 class 组件
class ErrorBoundaryClass extends Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = {
			hasError: false,
			error: null,
		};
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		// 更新 state 使下一次渲染显示错误页面
		return { hasError: true, error };
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
		// 记录错误到 Sentry
		Sentry.withScope((scope) => {
			scope.setExtra('componentStack', errorInfo.componentStack);
			Sentry.captureException(error);
		});
		console.error('组件内错误:', error, errorInfo);
	}

	render(): ReactNode {
		const { hasError, error } = this.state;
		const { children, fallback } = this.props;

		if (hasError) {
			// 使用自定义 fallback 或默认的 ErrorPage
			return fallback || <ErrorPage error={error} />;
		}

		return children;
	}
}

// 函数式包装器，处理全局未捕获错误
export default function ErrorBoundary({
	children,
	fallback,
}: ErrorBoundaryProps) {
	const [globalError, setGlobalError] = useState<Error | null>(null);
	const [hasGlobalError, setHasGlobalError] = useState(false);

	useEffect(() => {
		const handleError = (event: ErrorEvent) => {
			console.error('全局错误捕获:', event.error);
			// 记录错误到 Sentry
			Sentry.captureException(event.error);
			setGlobalError(event.error);
			setHasGlobalError(true);
		};

		const handleRejection = (event: PromiseRejectionEvent) => {
			console.error('未处理的Promise拒绝:', event.reason);
			// 记录错误到 Sentry
			Sentry.captureException(event.reason);
			setGlobalError(
				new Error(event.reason?.message || '未处理的Promise拒绝')
			);
			setHasGlobalError(true);
		};

		window.addEventListener('error', handleError);
		window.addEventListener('unhandledrejection', handleRejection);

		return () => {
			window.removeEventListener('error', handleError);
			window.removeEventListener('unhandledrejection', handleRejection);
		};
	}, []);

	if (hasGlobalError) {
		return fallback || <ErrorPage error={globalError} />;
	}

	return (
		<ErrorBoundaryClass fallback={fallback}>{children}</ErrorBoundaryClass>
	);
}
