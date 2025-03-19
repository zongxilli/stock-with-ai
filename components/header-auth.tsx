import { Settings, LogOut } from 'lucide-react';
import Link from 'next/link';

import { Avatar, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from './ui/dropdown-menu';

import { signOutAction } from '@/app/actions';
import { hasEnvVars } from '@/utils/supabase/check-env-vars';
import { createClient } from '@/utils/supabase/server';

export default async function AuthButton() {
	const supabase = await createClient();

	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (!hasEnvVars) {
		return (
			<>
				<div className='flex gap-4 items-center'>
					<div>
						<Badge
							variant={'default'}
							className='font-normal pointer-events-none'
						>
							Please update .env.local file with anon key and url
						</Badge>
					</div>
					<div className='flex gap-2'>
						<Button
							asChild
							size='sm'
							variant={'outline'}
							disabled
							className='opacity-75 cursor-none pointer-events-none'
						>
							<Link href='/sign-in'>Sign in</Link>
						</Button>
						<Button
							asChild
							size='sm'
							variant={'default'}
							disabled
							className='opacity-75 cursor-none pointer-events-none'
						>
							<Link href='/sign-up'>Sign up</Link>
						</Button>
					</div>
				</div>
			</>
		);
	}

	return user ? (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger asChild>
				<Button
					variant='ghost'
					className='relative p-1 h-10 w-10 rounded-full'
				>
					<Avatar>
						<AvatarFallback className='bg-primary text-primary-foreground'>
							{user.email
								? user.email.substring(0, 2).toUpperCase()
								: 'U'}
						</AvatarFallback>
					</Avatar>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				align='end'
				className='w-56 preserve-scroll'
				sideOffset={8}
				alignOffset={0}
				avoidCollisions={true}
			>
				<DropdownMenuLabel>
					<div className='flex flex-col gap-1'>
						<span className='font-normal text-xs text-muted-foreground'>
							Signed in as
						</span>
						<span className='truncate'>{user.email}</span>
					</div>
				</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuItem asChild>
					<Link
						href='/account'
						className='flex items-center gap-2 cursor-pointer'
					>
						<Settings className='h-4 w-4' />
						<span>Account settings</span>
					</Link>
				</DropdownMenuItem>
				<DropdownMenuItem asChild>
					<form action={signOutAction} className='w-full'>
						<button
							type='submit'
							className='flex items-center gap-2 cursor-pointer w-full text-left'
						>
							<LogOut className='h-4 w-4' />
							<span>Sign out</span>
						</button>
					</form>
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	) : (
		<div className='flex gap-2'>
			<Button asChild size='sm' variant={'outline'}>
				<Link href='/sign-in'>Sign in</Link>
			</Button>
			<Button asChild size='sm' variant={'default'}>
				<Link href='/sign-up'>Sign up</Link>
			</Button>
		</div>
	);
}
