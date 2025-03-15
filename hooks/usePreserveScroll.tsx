'use client';

import { useEffect, useRef } from 'react';

import { usePathname, useSearchParams } from 'next/navigation';

/**
 * 自定义钩子，用于在路由参数变化时保持滚动位置
 * 对于不需要重置滚动位置的路由参数变化非常有用
 */
export function usePreserveScroll() {
	const pathname = usePathname();
	const searchParams = useSearchParams();

	// 保存上一次的滚动位置
	const scrollPositionRef = useRef<number>(0);

	// 当路径或搜索参数变化时，保存当前滚动位置
	useEffect(() => {
		scrollPositionRef.current = window.scrollY;
	}, [pathname, searchParams]);

	// 在组件渲染后恢复滚动位置
	useEffect(() => {
		// 使用微任务队列确保在DOM更新后执行
		const timeoutId = setTimeout(() => {
			window.scrollTo(0, scrollPositionRef.current);
		}, 0);

		return () => clearTimeout(timeoutId);
	}, [pathname, searchParams]);
}
