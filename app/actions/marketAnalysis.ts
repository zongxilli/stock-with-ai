'use server';

import { marketAnalysisService } from '@/prisma/services/market-analysis-service';

export async function getAllMarketAnalyses() {
	return marketAnalysisService.getAll();
}

export async function getMarketAnalysisByDate(date: string) {
	return marketAnalysisService.getByDate(date);
}

export async function getLatestMarketAnalysis() {
	return marketAnalysisService.getLatest();
}

export async function getMarketAnalysesByDateRange(
	startDate: string,
	endDate: string
) {
	return marketAnalysisService.getByDateRange(startDate, endDate);
}
