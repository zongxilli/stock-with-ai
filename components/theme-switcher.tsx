'use client';

import { useEffect, useState } from 'react';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { IconButton } from '@/components/custom/iconButton';

const ThemeSwitcher = () => {
	const [mounted, setMounted] = useState(false);
	const { theme, setTheme } = useTheme();

	useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return null;
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
