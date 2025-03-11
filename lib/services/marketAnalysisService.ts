// lib/services/marketAnalysisService.ts
import { prisma } from '../prisma';
import { MarketAnalysis } from '@prisma/client';

export const marketAnalysisService = {
	// 获取所有市场分析数据
	async getAll(): Promise<MarketAnalysis[]> {
		return prisma.marketAnalysis.findMany({
			orderBy: { date: 'desc' },
		});
	},

	// 获取特定日期的市场分析
	async getByDate(date: string): Promise<MarketAnalysis | null> {
		return prisma.marketAnalysis.findUnique({
			where: { date },
		});
	},

	// 获取最新的市场分析
	async getLatest(): Promise<MarketAnalysis | null> {
		return prisma.marketAnalysis.findFirst({
			orderBy: { date: 'desc' },
		});
	},

	// 获取特定日期范围的市场分析
	async getByDateRange(
		startDate: string,
		endDate: string
	): Promise<MarketAnalysis[]> {
		return prisma.marketAnalysis.findMany({
			where: {
				date: {
					gte: startDate,
					lte: endDate,
				},
			},
			orderBy: { date: 'asc' },
		});
	},

	// 根据市场趋势过滤数据
	async getByMarketTrend(trend: string): Promise<MarketAnalysis[]> {
		return prisma.marketAnalysis.findMany({
			where: { marketTrend: trend },
			orderBy: { date: 'desc' },
		});
	},
};
