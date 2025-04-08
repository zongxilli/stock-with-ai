import { format, toZonedTime } from 'date-fns-tz';

type YahooFinanceChartData = {
	date: string; // ISO 8601 format string
	high: number;
	low: number;
	open: number;
	close: number;
	volume: number;
};

export const formatYahooFinanceChartData = (data: YahooFinanceChartData[]) => {
	const sortedData = [...data].sort(
		(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
	);

	return sortedData.map((point) => {
		const easternTime = toZonedTime(
			new Date(point.date),
			'America/New_York'
		);
		const formattedTime = format(easternTime, 'yyyy-MM-dd');

		return {
			time: formattedTime,
			open: point.open,
			high: point.high,
			low: point.low,
			close: point.close,
			volume: point.volume,
		};
	});
};
