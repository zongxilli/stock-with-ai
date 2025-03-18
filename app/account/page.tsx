import { redirect } from 'next/navigation';

import AccountSettings from './components/account-settings';

import { createClient } from '@/utils/supabase/server';

export default async function AccountPage() {
	const supabase = await createClient();

	// 获取当前用户信息
	const {
		data: { user },
	} = await supabase.auth.getUser();

	// 如果用户未登录，重定向到登录页面
	if (!user) {
		return redirect('/sign-in');
	}

	return (
		<div className='container max-w-3xl py-8'>
			<h1 className='text-2xl font-bold mb-6'>账户设置</h1>
			<AccountSettings user={user} />
		</div>
	);
}
