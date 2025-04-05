'use client';

import { useTheme } from 'next-themes';

import { getCurrentUserProfile } from '@/app/actions/user/user-actions';
import { useOnMountEffect } from '@/hooks/useOnMountEffect';

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

	useOnMountEffect(async () => {
		// 只在首次加载时初始化用户主题
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
	});

	// 这是一个纯逻辑组件，不需要渲染任何UI
	return null;
}
