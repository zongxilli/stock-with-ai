'use client';

import { useTranslation } from 'react-i18next';

import { Tab } from '../types';

import { cn } from '@/lib/utils';

interface SidebarNavProps {
	className?: string;
	currentTab: Tab;
	setCurrentTab: (tab: Tab) => void;
}

export function SidebarNav({
	currentTab,
	setCurrentTab,
	className,
}: SidebarNavProps) {
	const { t } = useTranslation('accountPage');

	const tabs: { value: Tab; label: string; disabled: boolean }[] = [
		{ value: 'general', label: t('generalTab'), disabled: false },
		{ value: 'preference', label: t('preferenceTab'), disabled: false },
		{ value: 'billing', label: t('billingTab'), disabled: true },
	];

	return (
		<nav className={cn('flex flex-col space-y-1', className)}>
			{tabs.map((item) => {
				const isActive = currentTab === item.value;
				return (
					<div
						key={item.value}
						onClick={() =>
							!item.disabled && setCurrentTab(item.value)
						}
						className={cn(
							'px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 text-foreground cursor-pointer',
							isActive ? 'bg-secondary' : 'hover:bg-accent',
							item.disabled
								? 'text-muted-foreground cursor-not-allowed pointer-events-none'
								: 'hover:bg-accent'
						)}
					>
						{item.label}
					</div>
				);
			})}
		</nav>
	);
}
