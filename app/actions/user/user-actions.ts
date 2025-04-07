'use server';

import { revalidatePath } from 'next/cache';

import { userService } from '@/prisma/services/user-service';
import { UserPreference } from '@/prisma/types/user-types';
import { createClient } from '@/utils/supabase/server';

// 获取当前用户资料
export async function getCurrentUserProfile() {
	try {
		const supabase = await createClient();

		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return null;
		}

		// 从数据库获取用户资料
		const profile = await userService.getUserById(user.id);

		// 如果找不到用户资料但用户已认证，返回基本信息
		if (!profile && user.email) {
			console.log('User authenticated but no profile found in database');
		}

		return profile;
	} catch (error) {
		console.error('Error getting current user profile:', error);
		return null;
	}
}

// 更新用户资料
export async function updateUserProfile(formData: FormData) {
	try {
		const supabase = await createClient();

		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return { success: false, message: 'Not authenticated' };
		}

		const username = formData.get('username')?.toString();
		const fullName = formData.get('fullName')?.toString();
		const bio = formData.get('bio')?.toString();

		// 准备更新数据
		const updateData: any = {};
		if (username !== undefined) updateData.username = username;
		if (fullName !== undefined) updateData.fullName = fullName;
		if (bio !== undefined) updateData.bio = bio;

		// 更新用户资料
		const updatedUser = await userService.updateUser(user.id, updateData);

		if (!updatedUser) {
			return {
				success: false,
				message: 'Failed to update profile in database',
			};
		}

		// 重新验证个人资料页面
		revalidatePath('/account');

		return { success: true, message: 'Profile updated successfully' };
	} catch (error) {
		console.error('Error updating profile:', error);
		return {
			success: false,
			message: `Error updating profile: ${error instanceof Error ? error.message : 'Unknown error'}`,
		};
	}
}

// 更新用户偏好设置
export async function updateUserPreference(preference: Partial<UserPreference>) {
	try {
		const supabase = await createClient();

		const {
			data: { user },
		} = await supabase.auth.getUser();

		if (!user) {
			return { success: false, message: '未登录' };
		}

		// 获取当前用户
		const currentUser = await userService.getUserById(user.id);
		
		if (!currentUser) {
			return { success: false, message: '用户资料未找到' };
		}

		// 合并现有偏好与新偏好
		const updatedPreference = {
			...currentUser.preference,
			...preference,
		};
		
		// 如果更新了技术指标偏好，确保合并而不是替换
		if (preference.technicalIndicators && currentUser.preference.technicalIndicators) {
			updatedPreference.technicalIndicators = {
				...currentUser.preference.technicalIndicators,
				...preference.technicalIndicators
			};
		}

		// 如果更新了图表偏好，确保合并而不是替换
		if (preference.chart && currentUser.preference.chart) {
			updatedPreference.chart = {
				...currentUser.preference.chart,
				...preference.chart
			};
		}

		// advancedView 是布尔值，直接使用新值或保留原值
		if (preference.advancedView !== undefined) {
			updatedPreference.advancedView = preference.advancedView;
		}

		// 更新用户偏好
		const updatedUser = await userService.updateUser(user.id, {
			preference: updatedPreference,
		});

		if (!updatedUser) {
			return {
				success: false,
				message: '更新偏好设置失败',
			};
		}

		// 重新验证个人资料页面
		revalidatePath('/account');
		// 重新验证股票页面
		revalidatePath('/stock/[symbol]', 'page');

		return { success: true, message: '偏好设置已更新' };
	} catch (error) {
		console.error('Error updating user preference:', error);
		return {
			success: false,
			message: `更新偏好设置出错: ${error instanceof Error ? error.message : '未知错误'}`,
		};
	}
}

// 获取用户公开资料（如果需要查看其他用户的资料）
export async function getUserPublicProfile(userId: string) {
	try {
		const profile = await userService.getUserById(userId);

		if (!profile) {
			return {
				success: false,
				error: '用户不存在',
			};
		}

		return {
			success: true,
			profile: {
				id: profile.id,
				username: profile.username,
				bio: profile.bio,
			},
		};
	} catch (error) {
		console.error('Error fetching user public profile:', error);
		return {
			success: false,
			error: `Error fetching profile: ${error instanceof Error ? error.message : 'Unknown error'}`,
		};
	}
}
