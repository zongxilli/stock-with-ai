'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { IconButton } from '@/components/custom/iconButton';
import { useIsMounted } from '@/hooks/useIsMounted';

const ThemeSwitcher = () => {
	const isMounted = useIsMounted();
	const { theme, setTheme } = useTheme();

	if (!isMounted) {
		// 提供一个占位符保持布局稳定
		return (
			<IconButton
				aria-label='Loading Theme'
				disabled
				className='opacity-0'
				children={<Sun size={18} className='text-muted-foreground' />}
			/>
		);
	}

	const toggleTheme = () => {
		setTheme(theme === 'dark' ? 'light' : 'dark');
	};

	return (
		<IconButton onClick={toggleTheme} aria-label='Toggle Theme'>
			{theme === 'dark' ? (
				<Sun size={18} className='text-muted-foreground' />
			) : (
				<Moon size={18} className='text-muted-foreground' />
			)}
		</IconButton>
	);
};

export { ThemeSwitcher };
