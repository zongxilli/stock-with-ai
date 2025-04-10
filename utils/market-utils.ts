export const MarketUtils = {
	isUSMarket: (exchangeName: string) => {
		return (
			!exchangeName ||
			exchangeName.toLowerCase().includes('nasdaq') ||
			exchangeName.toLowerCase().includes('nyse')
		);
	},
};
