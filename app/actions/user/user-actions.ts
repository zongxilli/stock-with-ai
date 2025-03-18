'use server';

import { revalidatePath } from 'next/cache';

import { userService } from '@/prisma/services/user-service';
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

		// 处理头像上传
		const avatarFile = formData.get('avatar') as File;
		let avatarUrl = undefined;

		if (avatarFile && avatarFile.size > 0) {
			try {
				// 上传到 Supabase 存储
				const { data, error } = await supabase.storage
					.from('avatars')
					.upload(`${user.id}/${Date.now()}.png`, avatarFile, {
						contentType: 'image/png',
						upsert: true,
					});

				if (error) {
					console.error('Error uploading avatar:', error);
				} else if (data) {
					const { data: urlData } = supabase.storage
						.from('avatars')
						.getPublicUrl(data.path);

					avatarUrl = urlData.publicUrl;
				}
			} catch (uploadError) {
				console.error('Avatar upload failed:', uploadError);
			}
		}

		// 准备更新数据
		const updateData: any = {};
		if (username !== undefined) updateData.username = username;
		if (fullName !== undefined) updateData.fullName = fullName;
		if (bio !== undefined) updateData.bio = bio;
		if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;

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

// 获取用户公开资料（如果需要查看其他用户的资料）
export async function getUserPublicProfile(userId: string) {
	try {
		if (!userId) {
			return { success: false, message: 'User ID is required' };
		}

		const profile = await userService.getUserById(userId);

		if (!profile) {
			return { success: false, message: 'User not found' };
		}

		// 只返回公开信息
		return {
			success: true,
			profile: {
				id: profile.id,
				username: profile.username,
				avatarUrl: profile.avatarUrl,
				bio: profile.bio,
			},
		};
	} catch (error) {
		console.error('Error fetching user public profile:', error);
		return {
			success: false,
			message: `Error fetching profile: ${error instanceof Error ? error.message : 'Unknown error'}`,
		};
	}
}
