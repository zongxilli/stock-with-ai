'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import {
	getCurrentUserProfile,
	updateUserProfile,
} from '@/app/actions/user/user-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

export default function AccountPage() {
	const [loading, setLoading] = useState(true);
	const [profile, setProfile] = useState<any>(null);
	const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
	const router = useRouter();
	const { toast } = useToast();

	useEffect(() => {
		const loadProfile = async () => {
			try {
				const data = await getCurrentUserProfile();
				if (!data) {
					// 未登录或出错
					router.push('/sign-in');
					return;
				}
				setProfile(data);
			} catch (error) {
				console.error('Error loading profile:', error);
				toast({
					title: 'Error',
					description: 'Failed to load profile data',
					variant: 'destructive',
				});
			} finally {
				setLoading(false);
			}
		};

		loadProfile();
	}, [router, toast]);

	const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			// 检查文件大小 (限制为 5MB)
			if (file.size > 5 * 1024 * 1024) {
				toast({
					title: 'Error',
					description: 'Image size should not exceed 5MB',
					variant: 'destructive',
				});
				// 重置文件输入
				e.target.value = '';
				return;
			}

			const reader = new FileReader();
			reader.onload = (e) => {
				setAvatarPreview(e.target?.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);

		try {
			const formData = new FormData(e.currentTarget);

			// 检查文件输入是否为空（未更改）
			const avatarFile = formData.get('avatar') as File;
			if (!avatarFile || avatarFile.size === 0) {
				formData.delete('avatar');
			}

			const result = await updateUserProfile(formData);

			if (result.success) {
				toast({
					title: 'Success',
					description: 'Your profile has been updated.',
				});
				// 重新加载个人资料
				const updatedProfile = await getCurrentUserProfile();
				setProfile(updatedProfile);
			} else {
				toast({
					title: 'Error',
					description: result.message || 'Failed to update profile',
					variant: 'destructive',
				});
			}
		} catch (error) {
			console.error('Error updating profile:', error);
			toast({
				title: 'Error',
				description: 'Failed to update profile',
				variant: 'destructive',
			});
		} finally {
			setLoading(false);
		}
	};

	if (loading) {
		return (
			<div className='flex items-center justify-center min-h-[60vh]'>
				<div className='animate-pulse'>Loading profile data...</div>
			</div>
		);
	}

	// 确保 profile 存在
	if (!profile) {
		return (
			<div className='container mx-auto py-8 max-w-lg'>
				<div className='p-4 border rounded-md bg-destructive/10 text-destructive'>
					Error loading profile data. Please try refreshing the page.
				</div>
				<Button
					className='mt-4'
					onClick={() => window.location.reload()}
				>
					Refresh Page
				</Button>
			</div>
		);
	}

	return (
		<div className='container mx-auto py-8 max-w-lg'>
			<h1 className='text-2xl font-bold mb-6'>Your Profile</h1>

			<form onSubmit={handleSubmit} className='space-y-6'>
				{/* Avatar */}
				<div className='space-y-2'>
					<Label htmlFor='avatar'>Profile Picture</Label>
					<div className='flex items-center gap-4'>
						<div className='h-16 w-16 rounded-full overflow-hidden bg-muted flex items-center justify-center'>
							{avatarPreview ? (
								<img
									src={avatarPreview}
									alt='Avatar preview'
									className='h-full w-full object-cover'
								/>
							) : profile.avatarUrl ? (
								<img
									src={profile.avatarUrl}
									alt='Avatar'
									className='h-full w-full object-cover'
									onError={(e) => {
										// 图片加载失败时的回退处理
										e.currentTarget.src = ''; // 清除错误的src
										e.currentTarget.classList.add('hidden');
										e.currentTarget.parentElement?.classList.add(
											'bg-primary/10'
										);
										// 显示首字母
										const initial =
											document.createElement('span');
										initial.textContent = (
											profile.email?.charAt(0) || '?'
										).toUpperCase();
										initial.className =
											'text-2xl font-bold';
										e.currentTarget.parentElement?.appendChild(
											initial
										);
									}}
								/>
							) : (
								<span className='text-2xl font-bold'>
									{(
										profile.email?.charAt(0) || '?'
									).toUpperCase()}
								</span>
							)}
						</div>
						<div className='flex-1'>
							<Input
								id='avatar'
								name='avatar'
								type='file'
								accept='image/*'
								onChange={handleAvatarChange}
							/>
							<p className='text-xs text-muted-foreground mt-1'>
								Maximum file size: 5MB
							</p>
						</div>
					</div>
				</div>

				{/* Username */}
				<div className='space-y-2'>
					<Label htmlFor='username'>Username</Label>
					<Input
						id='username'
						name='username'
						defaultValue={profile.username || ''}
						placeholder='Choose a username'
					/>
				</div>

				{/* Full Name */}
				<div className='space-y-2'>
					<Label htmlFor='fullName'>Full Name</Label>
					<Input
						id='fullName'
						name='fullName'
						defaultValue={profile.fullName || ''}
						placeholder='Your full name'
					/>
				</div>

				{/* Email (non-editable) */}
				<div className='space-y-2'>
					<Label htmlFor='email'>Email</Label>
					<Input
						id='email'
						value={profile.email || 'No email provided'}
						disabled
						readOnly
					/>
					<p className='text-xs text-muted-foreground'>
						Email cannot be changed
					</p>
				</div>

				{/* Bio */}
				<div className='space-y-2'>
					<Label htmlFor='bio'>Bio</Label>
					<Textarea
						id='bio'
						name='bio'
						defaultValue={profile.bio || ''}
						placeholder='Tell us about yourself'
						rows={4}
					/>
				</div>

				<div className='flex gap-4'>
					<Button type='submit' disabled={loading}>
						{loading ? 'Saving...' : 'Save Profile'}
					</Button>
					<Button
						type='button'
						variant='outline'
						onClick={() => router.push('/protected')}
					>
						Back
					</Button>
				</div>
			</form>
		</div>
	);
}
