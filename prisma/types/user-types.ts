export type UserPreference = {
	theme: 'light' | 'dark';
	language: 'EN' | 'CN';
	technicalIndicators: {
		ema: boolean;
		sma: boolean;
		wma: boolean;
		rsi: boolean;
		macd: boolean;
		bollingerBands: boolean;
		atr: boolean;
		volatility: boolean;
		stdDev: boolean;
		slope: boolean;
		dmi: boolean;
		adx: boolean;
		cci: boolean;
		sar: boolean;
		beta: boolean;
		stochastic: boolean;
		stochasticRSI: boolean;
		averageVolume: boolean;
		averageVolumeByPrice: boolean;
		splitAdjusted: boolean;
	};
};
