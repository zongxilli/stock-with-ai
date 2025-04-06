'use client';

import { useState, useEffect } from 'react';

import i18n from '../lib/i18n-client';

/**
 * 语言切换Hook，用于管理应用的语言设置
 * @returns {Object} 包含当前语言和切换语言的方法
 */
export default function useLanguage() {
	const [currentLang, setCurrentLang] = useState(i18n.language);

	const changeLanguage = (lng: 'CN' | 'EN') => {
		i18n.changeLanguage(lng);
		localStorage.setItem('lang', lng);
		setCurrentLang(lng);
	};

	useEffect(() => {
		const storedLang = localStorage.getItem('lang');
		if (storedLang && storedLang !== currentLang) {
			changeLanguage(storedLang as 'CN' | 'EN');
		}
	}, []);

	return { currentLang, changeLanguage };
}
