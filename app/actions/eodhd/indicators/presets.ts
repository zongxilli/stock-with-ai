/**
 * 技术指标预设配置
 *
 * 本文件包含所有技术指标的默认参数和常用配置组合
 * 可用于快速获取标准配置的技术指标数据
 */

// 指数移动平均线(EMA)常用周期
export const EMAPresets = {
	// 默认参数
	default: {
		period: 50,
	},
	// 常用组合配置
	standard: [
		{ period: 5, name: 'EMA5' }, // 5日均线
		{ period: 10, name: 'EMA10' }, // 10日均线
		{ period: 20, name: 'EMA20' }, // 20日均线
		{ period: 50, name: 'EMA50' }, // 50日均线
		{ period: 200, name: 'EMA200' }, // 200日均线
	],
	// 短期均线组合
	shortTerm: [
		{ period: 5, name: 'EMA5' },
		{ period: 10, name: 'EMA10' },
		{ period: 20, name: 'EMA20' },
	],
	// 长期均线组合
	longTerm: [
		{ period: 50, name: 'EMA50' },
		{ period: 100, name: 'EMA100' },
		{ period: 200, name: 'EMA200' },
	],
};

// 简单移动平均线(SMA)常用周期
export const SMAPresets = {
	// 默认参数
	default: {
		period: 50,
	},
	// 常用组合配置
	standard: [
		{ period: 5, name: 'SMA5' }, // 5日均线
		{ period: 10, name: 'SMA10' }, // 10日均线
		{ period: 20, name: 'SMA20' }, // 20日均线
		{ period: 50, name: 'SMA50' }, // 50日均线
		{ period: 200, name: 'SMA200' }, // 200日均线
	],
	// 短期均线组合
	shortTerm: [
		{ period: 5, name: 'SMA5' },
		{ period: 10, name: 'SMA10' },
		{ period: 20, name: 'SMA20' },
	],
	// 长期均线组合
	longTerm: [
		{ period: 50, name: 'SMA50' },
		{ period: 100, name: 'SMA100' },
		{ period: 200, name: 'SMA200' },
	],
};

// 加权移动平均线(WMA)常用周期
export const WMAPresets = {
	default: {
		period: 50,
	},
	standard: [
		{ period: 5, name: 'WMA5' },
		{ period: 10, name: 'WMA10' },
		{ period: 20, name: 'WMA20' },
		{ period: 50, name: 'WMA50' },
	],
};

// 相对强弱指标(RSI)常用周期
export const RSIPresets = {
	default: {
		period: 14, // 最常用的RSI周期是14
	},
	standard: [
		{ period: 6, name: 'RSI6' }, // 短期
		{ period: 14, name: 'RSI14' }, // 中期（最常用）
		{ period: 21, name: 'RSI21' }, // 长期
	],
	// 超买超卖阈值
	thresholds: {
		overbought: 70, // 超买阈值
		oversold: 30, // 超卖阈值
	},
};

// 随机指标(Stochastic)常用配置
export const StochasticPresets = {
	default: {
		fastKPeriod: 14,
		slowKPeriod: 3,
		slowDPeriod: 3,
	},
	standard: [
		{
			fastKPeriod: 5,
			slowKPeriod: 3,
			slowDPeriod: 3,
			name: 'Fast Stochastic (5,3,3)',
		},
		{
			fastKPeriod: 14,
			slowKPeriod: 3,
			slowDPeriod: 3,
			name: 'Standard Stochastic (14,3,3)',
		},
	],
	// 超买超卖阈值
	thresholds: {
		overbought: 80,
		oversold: 20,
	},
};

// 随机相对强弱指标(Stochastic RSI)常用配置
export const StochasticRSIPresets = {
	default: {
		fastKPeriod: 14,
		fastDPeriod: 14,
	},
	standard: [
		{
			fastKPeriod: 14,
			fastDPeriod: 14,
			name: 'Standard Stochastic RSI (14,14)',
		},
	],
	// 超买超卖阈值（与RSI相同）
	thresholds: {
		overbought: 80,
		oversold: 20,
	},
};

// MACD(移动平均收敛/发散)常用配置
export const MACDPresets = {
	default: {
		fastPeriod: 12,
		slowPeriod: 26,
		signalPeriod: 9,
	},
	standard: [
		{
			fastPeriod: 12,
			slowPeriod: 26,
			signalPeriod: 9,
			name: 'Standard MACD (12,26,9)',
		},
	],
	// 短期交易配置
	shortTerm: {
		fastPeriod: 5,
		slowPeriod: 13,
		signalPeriod: 5,
		name: 'Short Term MACD (5,13,5)',
	},
};

// 波动率(Volatility)常用配置
export const VolatilityPresets = {
	default: {
		period: 50,
	},
	standard: [
		{ period: 10, name: 'Short-term Volatility (10)' },
		{ period: 21, name: 'Medium-term Volatility (21)' },
		{ period: 50, name: 'Long-term Volatility (50)' },
	],
};

// 布林带(Bollinger Bands)常用配置
export const BollingerBandsPresets = {
	default: {
		period: 20, // 标准布林带通常使用20天周期
	},
	standard: [
		{ period: 10, name: 'Short-term Bollinger (10)' },
		{ period: 20, name: 'Standard Bollinger (20)' },
		{ period: 50, name: 'Long-term Bollinger (50)' },
	],
};

// 平均真实范围(ATR)常用配置
export const ATRPresets = {
	default: {
		period: 14,
	},
	standard: [
		{ period: 7, name: 'Short-term ATR (7)' },
		{ period: 14, name: 'Standard ATR (14)' },
		{ period: 21, name: 'Long-term ATR (21)' },
	],
};

// 方向动量指标(DMI)常用配置
export const DMIPresets = {
	default: {
		period: 14,
	},
	standard: [
		{ period: 7, name: 'Short-term DMI (7)' },
		{ period: 14, name: 'Standard DMI (14)' },
	],
};

// 平均方向动量指标(ADX)常用配置
export const ADXPresets = {
	default: {
		period: 14,
	},
	standard: [{ period: 14, name: 'Standard ADX (14)' }],
	// 趋势强度阈值
	thresholds: {
		weak: 20, // 弱趋势
		strong: 25, // 强趋势
		veryStrong: 50, // 非常强的趋势
	},
};

// 商品通道指数(CCI)常用配置
export const CCIPresets = {
	default: {
		period: 20,
	},
	standard: [
		{ period: 14, name: 'Short-term CCI (14)' },
		{ period: 20, name: 'Standard CCI (20)' },
	],
	// 超买超卖阈值
	thresholds: {
		overbought: 100,
		oversold: -100,
	},
};

// 抛物线转向指标(Parabolic SAR)常用配置
export const SARPresets = {
	default: {
		acceleration: 0.02,
		maximum: 0.2,
	},
	standard: [
		{
			acceleration: 0.02,
			maximum: 0.2,
			name: 'Standard SAR (0.02,0.2)',
		},
	],
	// 敏感配置（更快速地响应价格变化）
	sensitive: {
		acceleration: 0.025,
		maximum: 0.25,
		name: 'Sensitive SAR (0.025,0.25)',
	},
	// 稳定配置（减少虚假信号）
	stable: {
		acceleration: 0.01,
		maximum: 0.15,
		name: 'Stable SAR (0.01,0.15)',
	},
};

// 贝塔系数(BETA)常用配置
export const BETAPresets = {
	default: {
		period: 50,
		code2: 'GSPC.INDX', // S&P 500指数
	},
	standard: [
		{
			period: 30,
			code2: 'GSPC.INDX',
			name: 'Short-term Beta vs S&P 500 (30)',
		},
		{
			period: 50,
			code2: 'GSPC.INDX',
			name: 'Medium-term Beta vs S&P 500 (50)',
		},
		{
			period: 100,
			code2: 'GSPC.INDX',
			name: 'Long-term Beta vs S&P 500 (100)',
		},
	],
	// 不同基准指数组合
	benchmarks: [
		{
			period: 50,
			code2: 'DJI.INDX',
			name: 'Beta vs Dow Jones (50)',
		},
		{
			period: 50,
			code2: 'IXIC.INDX',
			name: 'Beta vs NASDAQ (50)',
		},
	],
};

// 标准差(Standard Deviation)常用配置
export const StdDevPresets = {
	default: {
		period: 50,
	},
	standard: [
		{ period: 20, name: 'Short-term StdDev (20)' },
		{ period: 50, name: 'Medium-term StdDev (50)' },
		{ period: 100, name: 'Long-term StdDev (100)' },
	],
};

// 线性回归斜率(Slope)常用配置
export const SlopePresets = {
	default: {
		period: 50,
	},
	standard: [
		{ period: 14, name: 'Short-term Slope (14)' },
		{ period: 50, name: 'Medium-term Slope (50)' },
		{ period: 100, name: 'Long-term Slope (100)' },
	],
};

// 平均成交量(Average Volume)常用配置
export const AverageVolumePresets = {
	default: {
		period: 50,
	},
	standard: [
		{ period: 5, name: '5-day Avg Volume' },
		{ period: 20, name: '20-day Avg Volume' },
		{ period: 50, name: '50-day Avg Volume' },
		{ period: 200, name: '200-day Avg Volume' },
	],
};

// 按金额计算的平均成交量(Average Volume by Price)常用配置
export const AverageVolumeByPricePresets = {
	default: {
		period: 50,
	},
	standard: [
		{ period: 5, name: '5-day Avg Volume (Price)' },
		{ period: 20, name: '20-day Avg Volume (Price)' },
		{ period: 50, name: '50-day Avg Volume (Price)' },
	],
};

// 拆分调整数据(Split Adjusted Data)常用配置
export const SplitAdjustedPresets = {
	default: {
		aggPeriod: 'd', // 日数据
	},
	periods: [
		{ aggPeriod: 'd', name: 'Daily' },
		{ aggPeriod: 'w', name: 'Weekly' },
		{ aggPeriod: 'm', name: 'Monthly' },
	],
};

// 导出所有预设配置的集合
export const indicatorPresets = {
	sma: SMAPresets,
	ema: EMAPresets,
	wma: WMAPresets,
	rsi: RSIPresets,
	macd: MACDPresets,
	bollingerBands: BollingerBandsPresets,
	atr: ATRPresets,
	volatility: VolatilityPresets,
	stdDev: StdDevPresets,
	slope: SlopePresets,
	dmi: DMIPresets,
	adx: ADXPresets,
	cci: CCIPresets,
	sar: SARPresets,
	beta: BETAPresets,
	stochastic: StochasticPresets,
	stochasticRSI: StochasticRSIPresets,
	averageVolume: AverageVolumePresets,
	averageVolumeByPrice: AverageVolumeByPricePresets,
	splitAdjusted: SplitAdjustedPresets,
};
