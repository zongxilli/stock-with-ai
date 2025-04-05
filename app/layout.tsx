import { Geist } from 'next/font/google';
import Link from 'next/link';
import { ThemeProvider } from 'next-themes';

import { EnvVarWarning } from '@/components/env-var-warning';
import ErrorBoundary from '@/components/error/error-boundary';
import HeaderAuth from '@/components/header-auth';
import { StockSearch } from '@/components/stock-search';
import { ThemeSwitcher } from '@/components/theme-switcher';
import { QueryProvider } from '@/providers/query-provider';
import { hasEnvVars } from '@/utils/supabase/check-env-vars';

import './globals.css';

export function Navbar() {
	return (
		<nav className='z-50 fixed top-0 left-0 w-full flex justify-between border-b border-b-foreground/10 h-16 bg-card'>
			<div className='container flex gap-5 items-center font-semibold'>
				<Link href={'/'} className='shrink-0'>
					AI kie
				</Link>
				<div className='flex-grow'>
					<StockSearch />
				</div>
				<ThemeSwitcher />
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

export function Body({ children }: { children: React.ReactNode }) {
	return (
		<div className='container p-4 md:p-6 lg:p-8 flex-grow'>
			{children}
		</div>
	);
}

const defaultUrl = process.env.VERCEL_URL
	? `https://${process.env.VERCEL_URL}`
	: 'http://localhost:3000';

export const metadata = {
	metadataBase: new URL(defaultUrl),
	title: 'AI kie',
	description: 'AIkie is a stock market analysis tool.',
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
			<body className='bg-background text-foreground overflow-y-auto min-h-screen flex flex-col'>
				<ThemeProvider
					attribute='class'
					defaultTheme='system'
					enableSystem
					disableTransitionOnChange
				>
					<ErrorBoundary>
						<QueryProvider>
							<main className='flex flex-col min-h-screen'>
								<Navbar />
								<div className='flex-grow flex flex-col pt-16'>
									<Body children={children} />
								</div>
								<Footer />
							</main>
						</QueryProvider>
					</ErrorBoundary>
				</ThemeProvider>
			</body>
		</html>
	);
}
