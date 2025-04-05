import { useState, useEffect } from 'react';

import { useMutation, useQuery } from '@tanstack/react-query';
import { isEqual } from 'lodash';
import { useRouter } from 'next/navigation';

import {
	getCurrentUserProfile,
	updateUserPreference,
	updateUserProfile,
} from '@/app/actions/user/user-actions';
import { useToast } from '@/hooks/use-toast';
import { UserPreference } from '@/prisma/types/user-types';

/**
 * 自定义Hook用于管理用户个人资料
 *
 * @returns 用户个人资料状态和操作
 */
export function useProfile() {
	const [formData, setFormData] = useState<ProfileFormData>({
		username: '',
		fullName: '',
		bio: '',
	});
	const [initialFormData, setInitialFormData] = useState<ProfileFormData>({
		username: '',
		fullName: '',
		bio: '',
	});
	const [isFormChanged, setIsFormChanged] = useState(false);

	const router = useRouter();
	const { toast } = useToast();

	// 使用 React Query 获取用户资料
	const {
		data: profile,
		isLoading: isProfileLoading,
		error: profileError,
		refetch: refetchProfile,
	} = useQuery({
		queryKey: ['userProfile'],
		queryFn: async () => {
			try {
				const data = await getCurrentUserProfile();
				if (!data) {
					// 未登录或出错
					router.push('/sign-in');
					return null;
				}
				return data;
			} catch (error) {
				console.error('Error loading profile:', error);
				toast({
					title: 'Error',
					description: 'Failed to load profile',
					variant: 'destructive',
				});
				throw error;
			}
		},
	});

	// 使用 Mutation 更新用户资料
	const { mutate: updateProfile, isPending: isUpdating } = useMutation({
		mutationFn: async (formData: FormData) => {
			return await updateUserProfile(formData);
		},
		onSuccess: async (result) => {
			if (result.success) {
				toast({
					title: 'Success',
					description: 'Profile updated successfully',
				});

				// 重新获取个人资料
				await refetchProfile();
			} else {
				toast({
					title: 'Error',
					description: result.message || 'Failed to update profile',
					variant: 'destructive',
				});
			}
		},
		onError: (error) => {
			console.error('Error updating profile:', error);
			toast({
				title: 'Error',
				description: 'Failed to update profile',
				variant: 'destructive',
			});
		},
	});

	// 使用 Mutation 更新用户偏好设置
	const { mutate: updatePreference, isPending: isUpdatingPreference } =
		useMutation({
			mutationFn: async (preference: Partial<UserPreference>) => {
				return await updateUserPreference(preference);
			},
			onSuccess: async (result) => {
				if (result.success) {
					toast({
						title: 'Success',
						description: 'Preference updated successfully',
					});

					// 重新获取个人资料
					await refetchProfile();
				} else {
					toast({
						title: 'Error',
						description:
							result.message || 'Failed to update preference',
						variant: 'destructive',
					});
				}
			},
			onError: (error) => {
				console.error('Error updating preference:', error);
				toast({
					title: 'Error',
					description: 'Failed to update preference',
					variant: 'destructive',
				});
			},
		});

	// 当个人资料数据加载完成，初始化表单数据
	useEffect(() => {
		if (profile) {
			const initialData = {
				username: profile.username || '',
				fullName: profile.fullName || '',
				bio: profile.bio || '',
			};
			setFormData(initialData);
			setInitialFormData(initialData);
		}
	}, [profile]);

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

	// 提交表单
	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const submitFormData = new FormData(e.currentTarget);
		updateProfile(submitFormData);
	};

	return {
		profile,
		formData,
		isLoading: isProfileLoading,
		isUpdating,
		isUpdatingPreference,
		isFormChanged,
		error: profileError,
		preference: profile?.preference as UserPreference | undefined,
		handleChange,
		handleSubmit,
		updatePreference,
	};
}

interface ProfileFormData {
	username: string;
	fullName: string;
	bio: string;
}
