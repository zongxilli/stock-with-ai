// 技术指标的基本结构，包含日期和值
export interface IndicatorDataPoint {
	date: string;
	value: number | null;
}

// 带有多个值的技术指标数据点
export interface MultiValueIndicatorDataPoint {
	date: string;
	[key: string]: number | string;
}

// 支持的时间范围类型
export type TimeRange = '5d' | '1mo' | '3mo' | '6mo' | '1y' | '5y' | 'max';

// 计算日期范围
export function calculateDateRange(range: TimeRange): {
	startDate: Date;
	endDate: Date;
} {
	const endDate = new Date();
	let startDate = new Date();

	// 根据范围计算开始日期
	switch (range) {
		case '5d':
			startDate.setDate(endDate.getDate() - 5);
			break;
		case '1mo':
			startDate.setMonth(endDate.getMonth() - 1);
			break;
		case '3mo':
			startDate.setMonth(endDate.getMonth() - 3);
			break;
		case '6mo':
			startDate.setMonth(endDate.getMonth() - 6);
			break;
		case '1y':
			startDate.setFullYear(endDate.getFullYear() - 1);
			break;
		case '5y':
			startDate.setFullYear(endDate.getFullYear() - 5);
			break;
		case 'max':
			// 对于max范围，设置较早的开始日期
			startDate = new Date('1900-01-01');
			break;
	}

	return { startDate, endDate };
}

// 格式化日期为YYYY-MM-DD格式
export function formatDate(date: Date): string {
	return date.toISOString().split('T')[0]; // 格式：YYYY-MM-DD
}

// 基础技术指标请求参数
export interface BaseIndicatorParams {
	code: string;
	exchange: string;
	range: TimeRange;
	period?: number;
}
