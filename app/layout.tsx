import { Geist } from 'next/font/google';
import Link from 'next/link';
import { ThemeProvider } from 'next-themes';

import { EnvVarWarning } from '@/components/env-var-warning';
import HeaderAuth from '@/components/header-auth';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { hasEnvVars } from '@/utils/supabase/check-env-vars';

import './globals.css';

export function Navbar() {
	return (
		<nav className='w-full flex justify-center border-b border-b-foreground/10 h-16'>
			<div className='w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm'>
				<div className='flex gap-5 items-center font-semibold'>
					<Link href={'/'}>Stock AI</Link>
					<ThemeSwitcher />
				</div>
				{!hasEnvVars ? <EnvVarWarning /> : <HeaderAuth />}
			</div>
		</nav>
	);
}

export function Footer() {
	return (
		<footer className='w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16'>
			<p>
				Build by{' '}
				<a
					href='https://zongxili.com'
					target='_blank'
					className='font-bold hover:underline'
					rel='noreferrer'
				>
					Zongxi Li
				</a>
			</p>
		</footer>
	);
}

const defaultUrl = process.env.VERCEL_URL
	? `https://${process.env.VERCEL_URL}`
	: 'http://localhost:3000';

export const metadata = {
	metadataBase: new URL(defaultUrl),
	title: 'Stock AI',
	description: 'Stock AI is a stock market analysis tool.',
};

const geistSans = Geist({
	display: 'swap',
	subsets: ['latin'],
});

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang='en'
			className={geistSans.className}
			suppressHydrationWarning
		>
			<body className='bg-background text-foreground'>
				<ThemeProvider
					attribute='class'
					defaultTheme='system'
					enableSystem
					disableTransitionOnChange
				>
					<main className='min-h-screen flex flex-col items-center'>
						<div className='flex-1 w-full flex flex-col items-center'>
							<Navbar />
							<div className='flex flex-col gap-20 max-w-5xl p-5'>
								{children}
							</div>

							<Footer />
						</div>
					</main>
				</ThemeProvider>
			</body>
		</html>
	);
}
