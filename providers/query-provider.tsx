'use client';

import { useState } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

/**
 * React Query 提供者组件
 * 用于全局管理数据请求状态
 */
export function QueryProvider({ children }: { children: React.ReactNode }) {
  // 为每个请求创建一个新的 QueryClient 实例
  // 这样可以避免在服务器端渲染时数据共享问题
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 默认请求配置
            staleTime: 60 * 1000, // 数据保鲜时间：1分钟
            retry: 1, // 失败后重试1次
            refetchOnWindowFocus: false, // 窗口聚焦时不自动重新获取数据
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* 开发环境下显示 ReactQuery 开发工具 */}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
