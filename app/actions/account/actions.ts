'use server';

import { revalidatePath } from 'next/cache';

import { createClient } from '@/utils/supabase/server';

// 更新用户个人资料
export async function updateProfile(
	userId: string,
	data: { full_name?: string; username?: string }
) {
	try {
		const supabase = await createClient();

		// 首先更新用户元数据
		const { error: updateError } = await supabase.auth.updateUser({
			data: {
				full_name: data.full_name,
				username: data.username,
			},
		});

		if (updateError) {
			console.error('更新个人资料失败:', updateError);
			return { error: updateError.message };
		}

		// 刷新路径缓存
		revalidatePath('/account');
		return { success: true };
	} catch (error) {
		console.error('更新个人资料时出错:', error);
		return { error: '更新个人资料时出错' };
	}
}

// 更新用户邮箱
export async function updateEmail(newEmail: string, password: string) {
	try {
		const supabase = await createClient();

		// 更新邮箱地址
		const { error: updateError } = await supabase.auth.updateUser({
			email: newEmail,
			attributes: {
				emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/account`,
			},
		});

		if (updateError) {
			console.error('更新邮箱失败:', updateError);
			return { error: updateError.message };
		}

		// 刷新路径缓存
		revalidatePath('/account');
		return { success: true };
	} catch (error) {
		console.error('更新邮箱时出错:', error);
		return { error: '更新邮箱时出错' };
	}
}

// 更新用户密码
export async function updatePassword(
	currentPassword: string,
	newPassword: string
) {
	try {
		const supabase = await createClient();

		// 更新密码
		const { error: updateError } = await supabase.auth.updateUser({
			password: newPassword,
		});

		if (updateError) {
			console.error('更新密码失败:', updateError);
			return { error: updateError.message };
		}

		// 刷新路径缓存
		revalidatePath('/account');
		return { success: true };
	} catch (error) {
		console.error('更新密码时出错:', error);
		return { error: '更新密码时出错' };
	}
}

// 上传用户头像
export async function uploadAvatar(userId: string, file: File) {
	try {
		const supabase = await createClient();

		// 生成唯一的文件名
		const fileExt = file.name.split('.').pop();
		const fileName = `avatar-${userId}-${Math.random()}.${fileExt}`;
		const filePath = `avatars/${fileName}`;

		// 将文件转换为 Buffer
		const buffer = await file.arrayBuffer();

		// 上传文件到Supabase存储
		const { error: uploadError } = await supabase.storage
			.from('avatars')
			.upload(filePath, buffer, {
				contentType: file.type,
				upsert: true,
			});

		if (uploadError) {
			console.error('上传头像失败:', uploadError);
			return { error: uploadError.message };
		}

		// 获取上传的文件URL
		const { data: urlData } = supabase.storage
			.from('avatars')
			.getPublicUrl(filePath);

		// 更新用户元数据以包含头像URL
		const { error: updateError } = await supabase.auth.updateUser({
			data: {
				avatar_url: urlData.publicUrl,
			},
		});

		if (updateError) {
			console.error('更新头像URL失败:', updateError);
			return { error: updateError.message };
		}

		// 刷新路径缓存
		revalidatePath('/account');
		return { success: true, url: urlData.publicUrl };
	} catch (error) {
		console.error('上传头像时出错:', error);
		return { error: '上传头像时出错' };
	}
}
