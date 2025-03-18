// app/account/components/email-form.tsx
'use client';

import { useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { updateEmail } from '@/app/actions/account/actions';
import { Card, CardContent, CardFooter } from '@/components/custom/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// 定义表单验证模式
const emailSchema = z.object({
	email: z
		.string()
		.email('请输入有效的电子邮箱地址')
		.min(5, '电子邮箱地址至少需要5个字符'),
	password: z.string().min(6, '密码至少需要6个字符'),
});

type EmailFormValues = z.infer<typeof emailSchema>;

interface EmailFormProps {
	user: User;
}

export default function EmailForm({ user }: EmailFormProps) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	// 使用react-hook-form管理表单
	const form = useForm<EmailFormValues>({
		resolver: zodResolver(emailSchema),
		defaultValues: {
			email: user.email || '',
			password: '',
		},
	});

	async function onSubmit(data: EmailFormValues) {
		setIsLoading(true);
		setError(null);
		setSuccess(null);

		try {
			const result = await updateEmail(data.email);
			if (result.error) {
				setError(result.error);
			} else {
				setSuccess('验证邮件已发送到您的新邮箱，请查收并确认更改。');
				form.reset({ email: data.email, password: '' });
			}
		} catch (err) {
			setError('更新邮箱时出错');
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
						<Label htmlFor='email'>新邮箱地址</Label>
						<Input
							id='email'
							type='email'
							placeholder='New email address'
							{...form.register('email')}
						/>
						{form.formState.errors.email && (
							<p className='text-sm text-destructive'>
								{form.formState.errors.email.message}
							</p>
						)}
					</div>

					<div className='space-y-2'>
						<Label htmlFor='password'>当前密码</Label>
						<Input
							id='password'
							type='password'
							placeholder='Enter your password to confirm'
							{...form.register('password')}
						/>
						{form.formState.errors.password && (
							<p className='text-sm text-destructive'>
								{form.formState.errors.password.message}
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
						{isLoading ? 'Updating...' : 'Update Email'}
					</Button>
				</CardFooter>
			</form>
		</Card>
	);
}
