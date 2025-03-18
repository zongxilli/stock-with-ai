'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { updatePassword } from '@/app/actions/account/actions';
import { Card, CardContent, CardFooter } from '@/components/custom/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// 定义表单验证模式
const passwordSchema = z
	.object({
		currentPassword: z.string().min(6, '密码至少需要6个字符'),
		newPassword: z.string().min(6, '新密码至少需要6个字符'),
		confirmPassword: z.string().min(6, '确认密码至少需要6个字符'),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: '新密码和确认密码不匹配',
		path: ['confirmPassword'],
	});

type PasswordFormValues = z.infer<typeof passwordSchema>;

interface PasswordFormProps {
	user: User;
}

export default function PasswordForm({ user }: PasswordFormProps) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	// 使用react-hook-form管理表单
	const form = useForm<PasswordFormValues>({
		resolver: zodResolver(passwordSchema),
		defaultValues: {
			currentPassword: '',
			newPassword: '',
			confirmPassword: '',
		},
	});

	async function onSubmit(data: PasswordFormValues) {
		setIsLoading(true);
		setError(null);
		setSuccess(null);

		try {
			const result = await updatePassword(
				data.currentPassword,
				data.newPassword
			);
			if (result.error) {
				setError(result.error);
			} else {
				setSuccess('密码已成功更新！');
				form.reset();
			}
		} catch (err) {
			setError('更新密码时出错');
			console.error(err);
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<Card>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<CardContent className='space-y-4 pt-6'>
					<div className='space-y-2'>
						<Label htmlFor='currentPassword'>当前密码</Label>
						<Input
							id='currentPassword'
							type='password'
							placeholder='Enter your current password'
							{...form.register('currentPassword')}
						/>
						{form.formState.errors.currentPassword && (
							<p className='text-sm text-destructive'>
								{form.formState.errors.currentPassword.message}
							</p>
						)}
					</div>

					<div className='space-y-2'>
						<Label htmlFor='newPassword'>新密码</Label>
						<Input
							id='newPassword'
							type='password'
							placeholder='Enter new password'
							{...form.register('newPassword')}
						/>
						{form.formState.errors.newPassword && (
							<p className='text-sm text-destructive'>
								{form.formState.errors.newPassword.message}
							</p>
						)}
					</div>

					<div className='space-y-2'>
						<Label htmlFor='confirmPassword'>确认新密码</Label>
						<Input
							id='confirmPassword'
							type='password'
							placeholder='Confirm new password'
							{...form.register('confirmPassword')}
						/>
						{form.formState.errors.confirmPassword && (
							<p className='text-sm text-destructive'>
								{form.formState.errors.confirmPassword.message}
							</p>
						)}
					</div>

					{error && (
						<div className='text-sm p-2 bg-destructive/10 text-destructive rounded-md'>
							{error}
						</div>
					)}

					{success && (
						<div className='text-sm p-2 bg-green-500/10 text-green-500 rounded-md'>
							{success}
						</div>
					)}
				</CardContent>

				<CardFooter className='flex justify-end gap-2'>
					<Button
						type='button'
						variant='outline'
						onClick={() => form.reset()}
						disabled={isLoading}
					>
						Cancel
					</Button>
					<Button type='submit' disabled={isLoading}>
						{isLoading ? 'Updating...' : 'Update Password'}
					</Button>
				</CardFooter>
			</form>
		</Card>
	);
}
