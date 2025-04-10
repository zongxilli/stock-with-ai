'use client';

import { useCallback, useState, useEffect } from 'react';

import i18n from '../lib/i18n-client';
import { LocalStorageUtils } from '../utils/localstorage-utils';

/**
 * 语言切换Hook，用于管理应用的语言设置
 * @returns {Object} 包含当前语言和切换语言的方法
 */
export default function useLanguage() {
	const [currentLang, setCurrentLang] = useState(i18n.language);

	const changeLanguage = useCallback(
		(lng: 'CN' | 'EN') => {
			i18n.changeLanguage(lng);

			LocalStorageUtils.setItem('AIkie_lang', lng);
			setCurrentLang(lng);
		},
		[setCurrentLang]
	);

	useEffect(() => {
		const storedLang = LocalStorageUtils.getItem('AIkie_lang', currentLang);
		if (storedLang && storedLang !== currentLang) {
			changeLanguage(storedLang as 'CN' | 'EN');
		}
	}, [currentLang, changeLanguage]);

	return { currentLang, changeLanguage };
}
