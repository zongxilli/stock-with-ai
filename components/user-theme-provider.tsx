'use client';

import { useEffect } from 'react';

import { useTheme } from 'next-themes';

import { getCurrentUserProfile } from '@/app/actions/user/user-actions';
import { useIsMounted } from '@/hooks/useIsMounted';

/**
 * 用户主题初始化组件
 *
 * 此组件仅在应用首次加载时初始化主题，按以下优先级：
 * 1. 数据库中的用户偏好设置
 * 2. localStorage中保存的主题（由next-themes自动处理）
 * 3. 默认使用light主题
 */
export function UserThemeProvider() {
	const { setTheme } = useTheme();
	const isMounted = useIsMounted();

	useEffect(() => {
		// 确保组件已挂载且在客户端环境中执行
		if (!isMounted) return;

		// 只在首次加载时初始化用户主题
		const initUserTheme = async () => {
			try {
				const userProfile = await getCurrentUserProfile();
				// 只有当用户有主题偏好时才设置
				if (userProfile?.preference?.theme) {
					// 只应用用户的主题偏好，初始化时覆盖localStorage
					setTheme(userProfile.preference.theme);
				}
				// 如果没有用户偏好，next-themes会自动使用localStorage中的主题
				// 如果localStorage也没有，会使用defaultTheme (在layout中设置为system)
			} catch (error) {
				console.error('初始化用户主题时出错:', error);
			}
		};

		// 只在首次加载时运行一次
		initUserTheme();
	}, [isMounted]); // 移除setTheme依赖，确保只运行一次

	// 这是一个纯逻辑组件，不需要渲染任何UI
	return null;
}
