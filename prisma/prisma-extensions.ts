// 这个文件扩展了Prisma生成的类型，使JSON字段具有类型安全性

import { UserPreference } from './types/user-types';

// 扩展Prisma命名空间来包含我们的自定义类型
declare global {
  namespace PrismaJson {
    type UserPreferenceJson = UserPreference;
  }
}

// 扩展Prisma类型
export {};

declare module '@prisma/client' {
  interface PrismaClient {
    $use(fn: (params: any, next: (params: any) => Promise<any>) => Promise<any>): void;
  }
}

// 自定义类型声明
export type UserWithTypedPreference = {
  id: string;
  email: string;
  username?: string | null;
  fullName?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  preference: UserPreference;
  createdAt: Date;
  updatedAt: Date;
};
