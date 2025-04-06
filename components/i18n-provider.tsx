'use client';

import { ReactNode } from 'react';

import { I18nextProvider } from 'react-i18next';

import i18n from '@/lib/i18n-client';

/**
 * 客户端 I18next 提供者组件
 * 用于在客户端提供 i18n 上下文
 */
export function I18nProvider({ children }: { children: ReactNode }) {
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
