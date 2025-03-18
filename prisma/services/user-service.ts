import { User } from '@prisma/client';

import { prisma } from '@/lib/prisma';

export const userService = {
	async getUserById(id: string): Promise<User | null> {
		try {
			if (!prisma) {
				console.error('Prisma client is not initialized');
				return null;
			}

			return await prisma.user.findUnique({
				where: { id },
			});
		} catch (error) {
			console.error('Error fetching user by ID:', error);
			return null;
		}
	},

	// 通过电子邮件获取用户
	async getUserByEmail(email: string): Promise<User | null> {
		try {
			if (!prisma) {
				console.error('Prisma client is not initialized');
				return null;
			}

			return await prisma.user.findUnique({
				where: { email },
			});
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
		}
	): Promise<User | null> {
		try {
			if (!prisma) {
				console.error('Prisma client is not initialized');
				return null;
			}

			return await prisma.user.update({
				where: { id },
				data,
			});
		} catch (error) {
			console.error('Error updating user:', error);
			return null;
		}
	},
};
