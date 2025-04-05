'use client';

import { Tab } from '../page';

import { cn } from '@/lib/utils';

interface SidebarNavProps {
	tabs: { value: Tab; label: string; disabled: boolean }[];
	className?: string;
	currentTab: Tab;
	setCurrentTab: (tab: Tab) => void;
}

export function SidebarNav({
	tabs,
	currentTab,
	setCurrentTab,
	className,
}: SidebarNavProps) {
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
