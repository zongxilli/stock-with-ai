// 'use server';

// 安全获取对象值的辅助函数
export function safeGet(
	obj: any,
	path: string[],
	defaultValue: any = undefined
) {
	try {
		let current = obj;
		for (const key of path) {
			if (current === undefined || current === null) return defaultValue;
			current = current[key];
		}
		return current === undefined || current === null
			? defaultValue
			: current;
	} catch (e) {
		return defaultValue;
	}
}

// 生成完整的交易时间轴（9:30 AM - 4:00 PM，每分钟一个点）
export function generateTradingTimeline(
	marketOpen: Date,
	marketClose: Date
): Date[] {
	const timeline: Date[] = [];
	const current = new Date(marketOpen);

	while (current <= marketClose) {
		timeline.push(new Date(current));
		current.setMinutes(current.getMinutes() + 1);
	}

	return timeline;
}

// 将实际数据与完整时间轴合并
export function mergeDataWithTimeline(
	actualData: any[],
	timeline: Date[]
): any[] {
	// 创建时间到数据的映射
	const dataMap = new Map();
	actualData.forEach((item) => {
		dataMap.set(item.date.getTime(), item);
	});

	// 创建完整数据集，对于没有实际数据的时间点，使用null值
	return timeline.map((time) => {
		const timeKey = time.getTime();
		if (dataMap.has(timeKey)) {
			return dataMap.get(timeKey);
		} else {
			return {
				date: new Date(time),
				open: null,
				high: null,
				low: null,
				close: null,
				volume: null,
			};
		}
	});
}

// 获取各市场指数的全名
export function getIndexFullName(symbol: string): string {
	switch (symbol) {
		// 期货
		case 'ES=F':
			return 'S&P Futures';
		case 'YM=F':
			return 'Dow Futures';
		case 'NQ=F':
			return 'Nasdaq Futures';
		case 'RTY=F':
			return 'Russell 2000';
		// 商品
		case 'CL=F':
			return 'Crude Oil';
		case 'GC=F':
			return 'Gold';
		// 加密货币
		case 'BTC-USD':
			return 'Bitcoin';
		// 债券
		case '^TNX':
			return '10-Year Treasury';
		default:
			return symbol;
	}
}
