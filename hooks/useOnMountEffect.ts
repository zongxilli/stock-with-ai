import { useEffect, useRef } from 'react';

import { useIsMounted } from '@/hooks/useIsMounted';

/**
 * 组件挂载后仅执行一次的 Effect hook
 *
 * 这个 hook 结合了 useEffect 和 useIsMounted，确保回调函数：
 * 1. 只在客户端环境中执行（避免 SSR 问题）
 * 2. 只在组件首次挂载后执行一次
 *
 * @param callback 需要执行一次的回调函数
 */
export function useOnMountEffect(callback: () => void | Promise<void>) {
	const isMounted = useIsMounted();
	const executedRef = useRef(false);

	useEffect(() => {
		// 确保只在客户端环境执行，并且只执行一次
		if (isMounted && !executedRef.current) {
			executedRef.current = true;
			callback();
		}
		// 故意忽略 callback 依赖，确保只执行一次
	}, [isMounted]);
}
