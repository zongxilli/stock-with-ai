import { useState, useEffect } from 'react';

/**
 * 自定义防抖钩子，可以延迟更新值，避免频繁触发
 *
 * @param value 要防抖的值
 * @param delay 延迟的毫秒数
 * @returns 防抖后的值
 */
export function useDebounce<T>(value: T, delay: number): T {
	const [debouncedValue, setDebouncedValue] = useState<T>(value);

	useEffect(() => {
		// 设置一个延迟计时器来更新防抖值
		const timer = setTimeout(() => {
			setDebouncedValue(value);
		}, delay);

		// 如果值变化或组件卸载，清除计时器
		return () => {
			clearTimeout(timer);
		};
	}, [value, delay]);

	return debouncedValue;
}
