'use server';

import { marketAnalysisService } from '@/lib/services/marketAnalysisService';

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
