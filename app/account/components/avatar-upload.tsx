// app/account/components/avatar-upload.tsx
'use client';

import { useState, useRef } from 'react';

import { User } from '@supabase/supabase-js';
import { Upload, X } from 'lucide-react';
import Image from 'next/image';

import { uploadAvatar } from '@/app/actions/account/actions';
import { Button } from '@/components/ui/button';

interface AvatarUploadProps {
	user: User;
}

export default function AvatarUpload({ user }: AvatarUploadProps) {
	const [avatar, setAvatar] = useState<string | null>(null);
	const [uploading, setUploading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;

		// 验证文件类型
		if (!file.type.startsWith('image/')) {
			setError('请选择图片文件');
			return;
		}

		// 验证文件大小 (最大2MB)
		if (file.size > 2 * 1024 * 1024) {
			setError('图片大小不能超过2MB');
			return;
		}

		setError(null);
		setUploading(true);

		try {
			const result = await uploadAvatar(user.id, file);
			if (result.error) {
				setError(result.error);
			} else {
				// 创建临时URL以显示上传的图片
				const objectUrl = URL.createObjectURL(file);
				setAvatar(objectUrl);
			}
		} catch (err) {
			console.error('上传头像失败:', err);
			setError('上传头像失败');
		} finally {
			setUploading(false);
		}
	};

	const triggerFileInput = () => {
		fileInputRef.current?.click();
	};

	const removeAvatar = () => {
		if (avatar) {
			URL.revokeObjectURL(avatar);
			setAvatar(null);
		}
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	};

	return (
		<div className='flex flex-col items-center space-y-3'>
			<div className='relative'>
				<div className='w-24 h-24 rounded-full bg-muted flex items-center justify-center overflow-hidden'>
					{avatar ? (
						<Image
							src={avatar}
							alt='Profile avatar'
							width={96}
							height={96}
							className='w-full h-full object-cover'
						/>
					) : (
						<div className='text-xl font-bold text-muted-foreground'>
							{user.email?.[0].toUpperCase()}
						</div>
					)}
				</div>
				{avatar && (
					<button
						className='absolute top-0 right-0 bg-destructive text-destructive-foreground p-1 rounded-full'
						onClick={removeAvatar}
					>
						<X size={14} />
					</button>
				)}
			</div>

			<div className='flex flex-col items-center gap-2'>
				<input
					type='file'
					ref={fileInputRef}
					onChange={handleFileChange}
					className='hidden'
					accept='image/*'
				/>
				<Button
					type='button'
					variant='outline'
					size='sm'
					className='flex gap-2'
					onClick={triggerFileInput}
					disabled={uploading}
				>
					<Upload size={14} />
					{uploading ? 'Uploading...' : 'Upload Avatar'}
				</Button>
				{error && <p className='text-xs text-destructive'>{error}</p>}
			</div>
		</div>
	);
}
