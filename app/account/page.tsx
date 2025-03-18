'use client';

import { useEffect, useState } from 'react';

import { isEqual } from 'lodash';
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
	const [formData, setFormData] = useState<{
		username: string;
		fullName: string;
		bio: string;
	}>({
		username: '',
		fullName: '',
		bio: '',
	});
	const [initialFormData, setInitialFormData] = useState<{
		username: string;
		fullName: string;
		bio: string;
	}>({
		username: '',
		fullName: '',
		bio: '',
	});
	const [isFormChanged, setIsFormChanged] = useState(false);
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

				// 初始化表单数据
				const initialData = {
					username: data.username || '',
					fullName: data.fullName || '',
					bio: data.bio || '',
				};
				setFormData(initialData);
				setInitialFormData(initialData);
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

	// 检查表单是否变更
	useEffect(() => {
		setIsFormChanged(!isEqual(formData, initialFormData));
	}, [formData, initialFormData]);

	// 处理表单字段变更
	const handleChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setLoading(true);

		try {
			const submitFormData = new FormData(e.currentTarget);

			const result = await updateUserProfile(submitFormData);

			if (result.success) {
				toast({
					title: 'Success',
					description: 'Your profile has been updated.',
				});
				// 重新加载个人资料
				const updatedProfile = await getCurrentUserProfile();
				setProfile(updatedProfile);

				// 更新初始表单数据，使其与当前表单数据一致
				const newInitialData = {
					username: updatedProfile?.username || '',
					fullName: updatedProfile?.fullName || '',
					bio: updatedProfile?.bio || '',
				};
				setFormData(newInitialData);
				setInitialFormData(newInitialData);
				setIsFormChanged(false);
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
				{/* Username */}
				<div className='space-y-2'>
					<Label htmlFor='username'>Username</Label>
					<Input
						id='username'
						name='username'
						value={formData.username}
						onChange={handleChange}
						placeholder='Choose a username'
					/>
				</div>

				{/* Full Name */}
				<div className='space-y-2'>
					<Label htmlFor='fullName'>Full Name</Label>
					<Input
						id='fullName'
						name='fullName'
						value={formData.fullName}
						onChange={handleChange}
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
						value={formData.bio}
						onChange={handleChange}
						placeholder='Tell us about yourself'
						rows={4}
					/>
				</div>

				<div className='flex gap-4'>
					<Button type='submit' disabled={loading || !isFormChanged}>
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
