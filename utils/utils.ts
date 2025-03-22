import { redirect } from 'next/navigation';
import * as Sentry from '@sentry/nextjs';
import { NextResponse } from 'next/server';

/**
 * Redirects to a specified path with an encoded message as a query parameter.
 * @param {('error' | 'success')} type - The type of message, either 'error' or 'success'.
 * @param {string} path - The path to redirect to.
 * @param {string} message - The message to be encoded and added as a query parameter.
 * @returns {never} This function doesn't return as it triggers a redirect.
 */
export function encodedRedirect(
	type: 'error' | 'success',
	path: string,
	message: string
) {
	return redirect(`${path}?${type}=${encodeURIComponent(message)}`);
}

// 时间处理工具
export function formatDate(date: Date) {
	return new Intl.DateTimeFormat('en-US', {
		month: 'long',
		day: 'numeric',
		year: 'numeric',
	}).format(date);
}

// 通用的 API 错误处理函数
export function handleApiError(
	error: unknown,
	customMessage = 'An error occurred while processing your request',
	status = 500
) {
	// 确保我们有一个错误对象
	const errorObj = error instanceof Error ? error : new Error(String(error));

	// 捕获错误到 Sentry
	const eventId = Sentry.captureException(errorObj);

	// 记录错误到控制台
	console.error(`API 错误 (${eventId}):`, errorObj);

	// 返回适当的响应
	return NextResponse.json(
		{
			error: customMessage,
			eventId,
		},
		{ status }
	);
}
