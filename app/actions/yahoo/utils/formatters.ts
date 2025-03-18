// 'use server';

// 格式化日期显示
export function formatDate(date: Date, range: string): string {
	if (range === '1d') {
		// 对于1天数据，只显示时:分
		return date.toLocaleTimeString([], {
			hour: '2-digit',
			minute: '2-digit',
		});
	} else if (range === '5d') {
		// 对于5天数据，显示MM/DD HH:MM格式
		const day = date.getDate().toString().padStart(2, '0');
		const month = (date.getMonth() + 1).toString().padStart(2, '0');
		const hours = date.getHours().toString().padStart(2, '0');
		const minutes = date.getMinutes().toString().padStart(2, '0');

		// 对于X轴标签，只返回MM/DD格式
		return `${month}/${day} ${hours}:${minutes}`;
	} else if (range === '1mo' || range === '3mo') {
		// 对于中期数据，显示月/日
		return date.toLocaleDateString([], {
			month: 'numeric',
			day: 'numeric',
		});
	} else {
		// 对于长期数据，显示年/月
		return date.toLocaleDateString([], { year: 'numeric', month: 'short' });
	}
}

// 将日期格式化为特定格式
export function formatAPIDate(
	timestamp: number | undefined,
	format: string = 'en-US'
): string | undefined {
	if (!timestamp) return undefined;
	try {
		return new Date(timestamp * 1000).toLocaleDateString(format, {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	} catch (e) {
		return undefined;
	}
}

// 安全解析百分比的辅助函数
export function parsePercentage(value: number | undefined): number | undefined {
	if (value === undefined || value === null) return undefined;
	try {
		return parseFloat((value * 100).toFixed(2));
	} catch (e) {
		return undefined;
	}
}
