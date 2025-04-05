'use client';

import { useCallback, useState } from 'react';

import { BillingTab } from './components/billing-tab';
import { GeneralTab } from './components/general-tab';
import { PreferenceTab } from './components/preference-tab';
import { SidebarNav } from './components/sidebar-nav';
import { Tab } from './types';


export default function AccountPage() {
	const [currentTab, setCurrentTab] = useState<Tab>('general');

	const renderCurrentTab = useCallback(() => {
		switch (currentTab) {
			case 'general':
				return <GeneralTab />;
			case 'preference':
				return <PreferenceTab />;
			case 'billing':
				return <BillingTab />;

			default:
				return <GeneralTab />;
		}
	}, [currentTab]);

	return (
		<div className='container py-8'>
			<h1 className='text-2xl font-bold mb-8'>Account Settings</h1>

			<div className='flex flex-col md:flex-row gap-8'>
				<aside className='md:w-1/5'>
					<SidebarNav
						currentTab={currentTab}
						setCurrentTab={setCurrentTab}
						className='sticky top-8'
					/>
				</aside>
				<div className='flex-1 md:max-w-2xl'>{renderCurrentTab()}</div>
			</div>
		</div>
	);
}
