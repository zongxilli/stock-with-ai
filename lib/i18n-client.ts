'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { generalTabCN, generalTabEN } from './i18n/account/general-tab';
import { accountPageCN, accountPageEN } from './i18n/account/page';
import {
	preferenceTabCN,
	preferenceTabEN,
} from './i18n/account/preference-tab';

// 内联翻译字典
const resources = {
	EN: {
		// account page
		accountPage: accountPageEN,
		accountPreferenceTab: preferenceTabEN,
		accountGeneralTab: generalTabEN,
	},
	CN: {
		// account page
		accountPage: accountPageCN,
		accountPreferenceTab: preferenceTabCN,
		accountGeneralTab: generalTabCN,
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
