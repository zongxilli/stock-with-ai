import { UserWithTypedPreference } from '../prisma-extensions';
import { UserPreference } from '../types/user-types';

import { prisma } from '@/lib/prisma';


export const userService = {
	async getUserById(id: string): Promise<UserWithTypedPreference | null> {
		try {
			if (!prisma) {
				console.error('Prisma client is not initialized');
				return null;
			}

			const user = await prisma.user.findUnique({
				where: { id },
			});

			return user as unknown as UserWithTypedPreference;
		} catch (error) {
			console.error('Error fetching user by ID:', error);
			return null;
		}
	},

	// 通过电子邮件获取用户
	async getUserByEmail(
		email: string
	): Promise<UserWithTypedPreference | null> {
		try {
			if (!prisma) {
				console.error('Prisma client is not initialized');
				return null;
			}

			const user = await prisma.user.findUnique({
				where: { email },
			});

			return user as unknown as UserWithTypedPreference;
		} catch (error) {
			console.error('Error fetching user by email:', error);
			return null;
		}
	},

	// 更新用户信息
	async updateUser(
		id: string,
		data: {
			username?: string;
			fullName?: string;
			bio?: string;
			preference?: UserPreference;
		}
	): Promise<UserWithTypedPreference | null> {
		try {
			if (!prisma) {
				console.error('Prisma client is not initialized');
				return null;
			}

			const user = await prisma.user.update({
				where: { id },
				data,
			});

			return user as unknown as UserWithTypedPreference;
		} catch (error) {
			console.error('Error updating user:', error);
			return null;
		}
	},
};
