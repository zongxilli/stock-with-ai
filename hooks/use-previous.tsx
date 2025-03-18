'use client';

import { useEffect, useRef } from 'react';

/**
 * 自定义Hook，用于追踪前一个状态值
 * @param value 需要追踪的值
 * @returns 前一个状态值
 */
export function usePrevious<T>(value: T): T | undefined {
	const ref = useRef<T>(undefined);

	useEffect(() => {
		ref.current = value;
	}, [value]);

	return ref.current;
}
