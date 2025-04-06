'use client';

import { useTranslation } from 'react-i18next';

import { DataPoint } from '@/components/custom/dataPoint';

// 定义股票详情数据的接口
interface StockDetailsGridProps {
	// 基本信息
	previousClose?: number;
	open?: number;
	bid?: number;
	ask?: number;
	bidSize?: number;
	askSize?: number;

	// 范围信息
	daysRange?: { low: number; high: number };
	weekRange?: { low: number; high: number };

	// 交易信息
	volume?: number;
	avgVolume?: number;
	avgVolume10Day?: number;

	// 市场信息
	marketCap?: number;
	beta?: number;
	peRatio?: number;
	forwardPE?: number;
	eps?: number;

	// 股息信息
	earningsDate?: string;
	dividendRate?: number;
	dividendYield?: number;
	exDividendDate?: string;
	dividendDate?: string;

	// 分析师信息
	targetHigh?: number;
	targetLow?: number;
	targetMean?: number;
	targetMedian?: number;
	numberOfAnalysts?: number;
	recommendationMean?: number;
	recommendationKey?: string;

	// 财务指标
	profitMargins?: number;
	returnOnAssets?: number;
	returnOnEquity?: number;
	revenueGrowth?: number;
	earningsGrowth?: number;
	totalCash?: number;
	totalCashPerShare?: number;
	totalDebt?: number;
	debtToEquity?: number;
	currentRatio?: number;
	quickRatio?: number;
	freeCashflow?: number;

	// 持股信息
	sharesOutstanding?: number;
	floatShares?: number;
	heldPercentInsiders?: number;
	heldPercentInstitutions?: number;
	shortRatio?: number;

	// 其他信息
	currency?: string;
}

/**
 * 股票详情网格组件
 * 显示股票的详细信息，包括价格指标、交易量、市场数据和股息信息等
 */
export default function StockDetails({
	previousClose,
	open,
	bid,
	ask,
	bidSize,
	askSize,
	daysRange,
	weekRange,
	volume,
	avgVolume,
	avgVolume10Day,
	marketCap,
	beta,
	peRatio,
	forwardPE,
	eps,
	earningsDate,
	dividendRate,
	dividendYield,
	exDividendDate,
	dividendDate,
	targetHigh,
	targetLow,
	targetMean,
	targetMedian,
	numberOfAnalysts,
	recommendationMean,
	recommendationKey,
	profitMargins,
	returnOnAssets,
	returnOnEquity,
	revenueGrowth,
	earningsGrowth,
	totalCash,
	totalCashPerShare,
	totalDebt,
	debtToEquity,
	currentRatio,
	quickRatio,
	freeCashflow,
	sharesOutstanding,
	floatShares,
	heldPercentInsiders,
	heldPercentInstitutions,
	shortRatio,
	currency = 'USD',
}: StockDetailsGridProps) {
	const { t } = useTranslation('stockDetails');

	// 格式化数字
	const formatNumber = (num: number | undefined, decimals = 2): string => {
		if (num === undefined) return '--';
		return num.toLocaleString('en-US', {
			minimumFractionDigits: decimals,
			maximumFractionDigits: decimals,
		});
	};

	// 格式化大数字（带单位，如M, B, T）
	const formatLargeNumber = (num: number | undefined): string => {
		if (num === undefined) return '--';

		if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`;
		if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`;
		if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`;
		return formatNumber(num);
	};

	// 格式化范围
	const formatRange = (
		range: { low: number; high: number } | undefined
	): string => {
		if (!range) return '--';
		return `${formatNumber(range.low)} - ${formatNumber(range.high)}`;
	};

	// 格式化股息率
	const formatDividendYield = (
		dividend?: number,
		yieldd?: number
	): string => {
		if (dividend === undefined) return '--';
		return `${formatNumber(dividend)}${yieldd !== undefined ? ` (${yieldd}%)` : ''}`;
	};

	// 格式化百分比
	const formatPercent = (value?: number): string => {
		if (value === undefined) return '--';
		return `${formatNumber(value)}%`;
	};

	// 格式化推荐评级
	const formatRecommendation = (key?: string, mean?: number): string => {
		if (!key) return '--';
		// 首字母大写
		const formattedKey = key.charAt(0).toUpperCase() + key.slice(1);
		return mean !== undefined
			? `${formattedKey} (${formatNumber(mean)})`
			: formattedKey;
	};

	// 预处理分析师推荐描述
	let recommendationDesc = '';
	if (recommendationKey) {
		switch (recommendationKey.toLowerCase()) {
			case 'strong buy':
				recommendationDesc = t('analystRatingDescStrongBuy');
				break;
			case 'buy':
				recommendationDesc = t('analystRatingDescBuy');
				break;
			case 'hold':
				recommendationDesc = t('analystRatingDescHold');
				break;
			case 'underperform':
				recommendationDesc = t('analystRatingDescUnderperform');
				break;
			case 'sell':
				recommendationDesc = t('analystRatingDescSell');
				break;
			default:
				recommendationDesc = t('analystRatingDescDefault');
		}
	}

	return (
		<div className='w-full mt-6'>
			<h2 className='text-xl font-bold mb-4'>{t('title')}</h2>
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-1'>
				{/* 第一列：价格信息 */}
				<div className='space-y-0'>
					<h3 className='font-semibold text-md mb-2 border-b pb-1'>
						{t('tradingInfo')}
					</h3>
					<DataPoint
						label={t('previousClose')}
						value={formatNumber(previousClose)}
						tooltip={t('previousCloseTooltip')}
					/>
					<DataPoint
						label={t('open')}
						value={formatNumber(open)}
						tooltip={t('openTooltip')}
					/>
					<DataPoint
						label={t('bid')}
						value={
							bidSize
								? `${formatNumber(bid)} x ${formatNumber(bidSize, 0)}`
								: formatNumber(bid)
						}
						tooltip={t('bidTooltip')}
					/>
					<DataPoint
						label={t('ask')}
						value={
							askSize
								? `${formatNumber(ask)} x ${formatNumber(askSize, 0)}`
								: formatNumber(ask)
						}
						tooltip={t('askTooltip')}
					/>
					<DataPoint
						label={t('daysRange')}
						value={formatRange(daysRange)}
						tooltip={t('daysRangeTooltip')}
					/>
					<DataPoint
						label={t('weekRange')}
						value={formatRange(weekRange)}
						tooltip={t('weekRangeTooltip')}
					/>
				</div>

				{/* 第二列：成交量和市场数据 */}
				<div className='space-y-0'>
					<h3 className='font-semibold text-md mb-2 border-b pb-1'>
						{t('volumeMarketData')}
					</h3>
					<DataPoint
						label={t('volume')}
						value={volume?.toLocaleString()}
						tooltip={t('volumeTooltip')}
					/>
					<DataPoint
						label={t('avgVolume')}
						value={avgVolume?.toLocaleString()}
						tooltip={t('avgVolumeTooltip')}
					/>
					<DataPoint
						label={t('avgVolume10Day')}
						value={avgVolume10Day?.toLocaleString()}
						tooltip={t('avgVolume10DayTooltip')}
					/>
					<DataPoint
						label={t('marketCap')}
						value={formatLargeNumber(marketCap)}
						tooltip={t('marketCapTooltip')}
					/>
					<DataPoint
						label={t('beta')}
						value={formatNumber(beta)}
						tooltip={t('betaTooltip')}
					/>
					<DataPoint
						label={t('sharesOutstanding')}
						value={sharesOutstanding?.toLocaleString()}
						tooltip={t('sharesOutstandingTooltip')}
					/>
				</div>

				{/* 第三列：财务比率 */}
				<div className='space-y-0'>
					<h3 className='font-semibold text-md mb-2 border-b pb-1'>
						{t('financialRatios')}
					</h3>
					<DataPoint
						label={t('peRatio')}
						value={formatNumber(peRatio)}
						tooltip={t('peRatioTooltip')}
					/>
					<DataPoint
						label={t('forwardPE')}
						value={formatNumber(forwardPE)}
						tooltip={t('forwardPETooltip')}
					/>
					<DataPoint
						label={t('eps')}
						value={formatNumber(eps)}
						tooltip={t('epsTooltip')}
					/>
					<DataPoint
						label={t('profitMargins')}
						value={formatPercent(
							profitMargins && profitMargins * 100
						)}
						tooltip={t('profitMarginsTooltip')}
					/>
					<DataPoint
						label={t('roa')}
						value={formatPercent(
							returnOnAssets && returnOnAssets * 100
						)}
						tooltip={t('roaTooltip')}
					/>
					<DataPoint
						label={t('roe')}
						value={formatPercent(
							returnOnEquity && returnOnEquity * 100
						)}
						tooltip={t('roeTooltip')}
					/>
				</div>

				{/* 第四列：股息和分析师评级 */}
				<div className='space-y-0'>
					<h3 className='font-semibold text-md mb-2 border-b pb-1'>
						{t('dividendsAnalystRatings')}
					</h3>
					<DataPoint
						label={t('earningsDate')}
						value={earningsDate}
						tooltip={t('earningsDateTooltip')}
					/>
					<DataPoint
						label={t('dividendRate')}
						value={formatDividendYield(dividendRate, dividendYield)}
						tooltip={t('dividendRateTooltip')}
					/>
					<DataPoint
						label={t('exDividendDate')}
						value={exDividendDate}
						tooltip={t('exDividendDateTooltip')}
					/>
					<DataPoint
						label={t('analystRating')}
						value={formatRecommendation(
							recommendationKey,
							recommendationMean
						)}
						tooltip={recommendationDesc}
					/>
					<DataPoint
						label={t('priceTarget')}
						value={
							targetMean
								? `${formatNumber(targetMean)} (${formatNumber(targetLow)} - ${formatNumber(targetHigh)})`
								: '--'
						}
						tooltip={t('priceTargetTooltip')}
					/>
					<DataPoint
						label={t('priceTargetMedian')}
						value={formatNumber(targetMedian)}
						tooltip={t('priceTargetMedianTooltip')}
					/>
					<DataPoint
						label={t('analystsCovering')}
						value={numberOfAnalysts?.toString()}
						tooltip={t('analystsCoveringTooltip')}
					/>
				</div>

				{/* 第五列：成长和业绩 */}
				<div className='space-y-0'>
					<h3 className='font-semibold text-md mb-2 border-b pb-1'>
						{t('growthPerformance')}
					</h3>
					<DataPoint
						label={t('revenueGrowth')}
						value={formatPercent(
							revenueGrowth && revenueGrowth * 100
						)}
						tooltip={t('revenueGrowthTooltip')}
					/>
					<DataPoint
						label={t('earningsGrowth')}
						value={formatPercent(
							earningsGrowth && earningsGrowth * 100
						)}
						tooltip={t('earningsGrowthTooltip')}
					/>
					<DataPoint
						label={t('freeCashFlow')}
						value={formatLargeNumber(freeCashflow)}
						tooltip={t('freeCashFlowTooltip')}
					/>
					<DataPoint
						label={t('totalCash')}
						value={formatLargeNumber(totalCash)}
						tooltip={t('totalCashTooltip')}
					/>
					<DataPoint
						label={t('cashPerShare')}
						value={formatNumber(totalCashPerShare)}
						tooltip={t('cashPerShareTooltip')}
					/>
				</div>

				{/* 第六列：债务和流动性 */}
				<div className='space-y-0'>
					<DataPoint
						label={t('totalDebt')}
						value={formatLargeNumber(totalDebt)}
						tooltip={t('totalDebtTooltip')}
					/>
					<DataPoint
						label={t('debtToEquity')}
						value={formatNumber(debtToEquity)}
						tooltip={t('debtToEquityTooltip')}
					/>
					<DataPoint
						label={t('currentRatio')}
						value={formatNumber(currentRatio)}
						tooltip={t('currentRatioTooltip')}
					/>
					<DataPoint
						label={t('quickRatio')}
						value={formatNumber(quickRatio)}
						tooltip={t('quickRatioTooltip')}
					/>
				</div>

				{/* 第七列：持股信息 */}
				<div className='space-y-0'>
					<h3 className='font-semibold text-md mb-2 border-b pb-1'>
						{t('ownership')}
					</h3>
					<DataPoint
						label={t('insiderOwnership')}
						value={formatPercent(
							heldPercentInsiders && heldPercentInsiders * 100
						)}
						tooltip={t('insiderOwnershipTooltip')}
					/>
					<DataPoint
						label={t('institutionOwnership')}
						value={formatPercent(
							heldPercentInstitutions &&
								heldPercentInstitutions * 100
						)}
						tooltip={t('institutionOwnershipTooltip')}
					/>
					<DataPoint
						label={t('floatShares')}
						value={floatShares?.toLocaleString()}
						tooltip={t('floatSharesTooltip')}
					/>
					<DataPoint
						label={t('shortRatio')}
						value={formatNumber(shortRatio)}
						tooltip={t('shortRatioTooltip')}
					/>
				</div>

				{/* 第八列：其他信息 - 可以根据需要添加 */}
				<div className='space-y-0'>
					<h3 className='font-semibold text-md mb-2 border-b pb-1'>
						{t('additionalInfo')}
					</h3>
					<DataPoint
						label={t('currency')}
						value={currency}
						tooltip={t('currencyTooltip')}
					/>
					<DataPoint
						label={t('dividendDate')}
						value={dividendDate}
						tooltip={t('dividendDateTooltip')}
					/>
					{/* 可以根据需要添加更多数据点 */}
				</div>
			</div>
		</div>
	);
}
