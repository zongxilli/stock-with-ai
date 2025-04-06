'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { generalTabCN, generalTabEN } from './i18n/account/general-tab';
import { accountPageCN, accountPageEN } from './i18n/account/page';
import {
	preferenceTabCN,
	preferenceTabEN,
} from './i18n/account/preference-tab';
import { stockDetailsCN, stockDetailsEN } from './i18n/stock/details';
import { stockHeaderCN, stockHeaderEN } from './i18n/stock/header';

// 内联翻译字典
const resources = {
	EN: {
		// account page
		accountPage: accountPageEN,
		accountPreferenceTab: preferenceTabEN,
		accountGeneralTab: generalTabEN,

		// stock[symbol] page
		stockHeader: stockHeaderEN,
		stockDetails: stockDetailsEN,
	},
	CN: {
		// account page
		accountPage: accountPageCN,
		accountPreferenceTab: preferenceTabCN,
		accountGeneralTab: generalTabCN,

		// stock[symbol] page
		stockHeader: stockHeaderCN,
		stockDetails: stockDetailsCN,
	},
};

i18n.use(initReactI18next).init({
	resources,
	lng:
		typeof window !== 'undefined'
			? localStorage.getItem('lang') || 'EN'
			: 'EN',
	fallbackLng: 'EN',
	interpolation: {
		escapeValue: false,
	},
});

export default i18n;
