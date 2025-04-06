'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import {
	preferenceTabCN,
	preferenceTabEN,
} from './i18n/account/preference-tab';

// 内联翻译字典
const resources = {
	EN: {
		accountPreferenceTab: preferenceTabEN,
	},
	CN: {
		accountPreferenceTab: preferenceTabCN,
	},
};

i18n.use(initReactI18next).init({
	resources,
	lng:
		typeof window !== 'undefined'
			? localStorage.getItem('lang') || 'CN'
			: 'CN',
	fallbackLng: 'CN',
	interpolation: {
		escapeValue: false,
	},
});

export default i18n;
