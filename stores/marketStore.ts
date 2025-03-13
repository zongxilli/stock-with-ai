import { create } from 'zustand';

import { getMainIndices } from '@/app/actions/yahoo-finance2-actions';

// 定义索引数据类型
interface IndexData {
	symbol: string;
	name: string;
	price: number;
	change: number;
	changePercent: number;
	dayHigh: number;
	dayLow: number;
	marketTime: number;
}

// 定义市场store的状态
interface MarketState {
	// 状态
	indices: IndexData[];
	lastUpdated: string;
	loading: boolean;
	error: string | null;

	// 操作
	fetchIndices: () => Promise<void>;
}

export const useMarketStore = create<MarketState>((set) => ({
	// 初始状态
	indices: [],
	lastUpdated: '',
	loading: true,
	error: null,

	// 获取指数数据的方法
	fetchIndices: async () => {
		try {
			const data = await getMainIndices();
			set({
				indices: data,
				lastUpdated: new Date().toLocaleTimeString(),
				loading: false,
				error: null,
			});
			return data;
		} catch (error) {
			console.error('加载股指数据失败:', error);
			set({
				error: '加载股指数据失败',
				loading: false,
			});
			return [];
		}
	},
}));
