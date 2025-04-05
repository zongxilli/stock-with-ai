export type Tab = 'general' | 'preference' | 'billing';

export const tabs: { value: Tab; label: string; disabled: boolean }[] = [
	{ value: 'general', label: 'General', disabled: false },
	{ value: 'preference', label: 'Preference', disabled: false },
	{ value: 'billing', label: 'Billing', disabled: true },
];
