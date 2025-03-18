'use client';

import { useState } from 'react';

import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

import AvatarUpload from './avatar-upload';
import EmailForm from './email-form';
import PasswordForm from './password-form';
import ProfileForm from './profile-form';

import { Card } from '@/components/custom/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AccountSettingsProps {
	user: User;
}

export default function AccountSettings({ user }: AccountSettingsProps) {
	const router = useRouter();
	const [activeTab, setActiveTab] = useState('profile');

	return (
		<div className='space-y-6'>
			<Card className='p-6'>
				<div className='flex flex-col md:flex-row gap-6 items-start'>
					<AvatarUpload user={user} />
					<div className='flex-1'>
						<h2 className='text-xl font-semibold mb-2'>
							{user.email}
						</h2>
						<p className='text-sm text-muted-foreground mb-4'>
							管理您的账户设置和偏好
						</p>
					</div>
				</div>
			</Card>

			<Tabs
				value={activeTab}
				onValueChange={setActiveTab}
				className='w-full'
			>
				<TabsList className='grid grid-cols-3 mb-8'>
					<TabsTrigger value='profile'>个人资料</TabsTrigger>
					<TabsTrigger value='email'>邮箱</TabsTrigger>
					<TabsTrigger value='password'>密码</TabsTrigger>
				</TabsList>

				<TabsContent value='profile'>
					<ProfileForm user={user} />
				</TabsContent>

				<TabsContent value='email'>
					<EmailForm user={user} />
				</TabsContent>

				<TabsContent value='password'>
					<PasswordForm user={user} />
				</TabsContent>
			</Tabs>
		</div>
	);
}
