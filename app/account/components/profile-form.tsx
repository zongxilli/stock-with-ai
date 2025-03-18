'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { updateProfile } from '@/app/actions/account/actions';
import { Card, CardContent, CardFooter } from '@/components/custom/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// 定义表单验证模式
const profileSchema = z.object({
	full_name: z.string().min(2, '名称至少需要2个字符').optional(),
	username: z.string().min(3, '用户名至少需要3个字符').optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
	user: User;
}

export default function ProfileForm({ user }: ProfileFormProps) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	// 使用react-hook-form管理表单
	const form = useForm<ProfileFormValues>({
		resolver: zodResolver(profileSchema),
		defaultValues: {
			full_name: '',
			username: '',
		},
	});

	async function onSubmit(data: ProfileFormValues) {
		setIsLoading(true);
		setError(null);
		setSuccess(null);

		try {
			const result = await updateProfile(user.id, data);
			if (result.error) {
				setError(result.error);
			} else {
				setSuccess('个人资料已成功更新！');
				router.refresh();
			}
		} catch (err) {
			setError('更新个人资料时出错');
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
						<Label htmlFor='full_name'>全名</Label>
						<Input
							id='full_name'
							placeholder='Your full name'
							{...form.register('full_name')}
						/>
						{form.formState.errors.full_name && (
							<p className='text-sm text-destructive'>
								{form.formState.errors.full_name.message}
							</p>
						)}
					</div>

					<div className='space-y-2'>
						<Label htmlFor='username'>用户名</Label>
						<Input
							id='username'
							placeholder='Username'
							{...form.register('username')}
						/>
						{form.formState.errors.username && (
							<p className='text-sm text-destructive'>
								{form.formState.errors.username.message}
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
						{isLoading ? 'Saving...' : 'Save Changes'}
					</Button>
				</CardFooter>
			</form>
		</Card>
	);
}
