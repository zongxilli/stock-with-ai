'use client';

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
				recommendationDesc = '分析师强烈推荐买入该股票';
				break;
			case 'buy':
				recommendationDesc = '分析师推荐买入该股票';
				break;
			case 'hold':
				recommendationDesc = '分析师建议持有该股票';
				break;
			case 'underperform':
				recommendationDesc = '分析师认为该股票表现不及预期';
				break;
			case 'sell':
				recommendationDesc = '分析师建议卖出该股票';
				break;
			default:
				recommendationDesc = '分析师对该股票的综合评级';
		}
	}

	return (
		<div className='w-full mt-6'>
			<h2 className='text-xl font-bold mb-4'>Stock Details</h2>
			<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-1'>
				{/* 第一列：价格信息 */}
				<div className='space-y-0'>
					<h3 className='font-semibold text-md mb-2 border-b pb-1'>
						Trading Information
					</h3>
					<DataPoint
						label='Previous Close'
						value={formatNumber(previousClose)}
						tooltip='股票在前一个交易日的收盘价格'
					/>
					<DataPoint
						label='Open'
						value={formatNumber(open)}
						tooltip='股票在当前交易日的开盘价格'
					/>
					<DataPoint
						label='Bid'
						value={
							bidSize
								? `${formatNumber(bid)} x ${formatNumber(bidSize, 0)}`
								: formatNumber(bid)
						}
						tooltip='当前买单的最高价格和数量'
					/>
					<DataPoint
						label='Ask'
						value={
							askSize
								? `${formatNumber(ask)} x ${formatNumber(askSize, 0)}`
								: formatNumber(ask)
						}
						tooltip='当前卖单的最低价格和数量'
					/>
					<DataPoint
						label="Day's Range"
						value={formatRange(daysRange)}
						tooltip='股票在当前交易日的价格波动范围'
					/>
					<DataPoint
						label='52 Week Range'
						value={formatRange(weekRange)}
						tooltip='股票在过去52周的价格波动范围'
					/>
				</div>

				{/* 第二列：交易量和市场数据 */}
				<div className='space-y-0'>
					<h3 className='font-semibold text-md mb-2 border-b pb-1'>
						Volume & Market Data
					</h3>
					<DataPoint
						label='Volume'
						value={volume?.toLocaleString()}
						tooltip='当前交易日的成交量'
					/>
					<DataPoint
						label='Avg. Volume'
						value={avgVolume?.toLocaleString()}
						tooltip='过去3个月的平均每日成交量'
					/>
					<DataPoint
						label='Avg. Volume (10 day)'
						value={avgVolume10Day?.toLocaleString()}
						tooltip='过去10天的平均每日成交量'
					/>
					<DataPoint
						label='Market Cap'
						value={formatLargeNumber(marketCap)}
						tooltip='公司当前市值（股价 × 流通股数量）'
					/>
					<DataPoint
						label='Beta (5Y Monthly)'
						value={formatNumber(beta)}
						tooltip='股票相对于市场的波动性指标（>1表示波动性高于市场）'
					/>
					<DataPoint
						label='Shares Outstanding'
						value={sharesOutstanding?.toLocaleString()}
						tooltip='公司发行的总股票数量'
					/>
				</div>

				{/* 第三列：财务比率 */}
				<div className='space-y-0'>
					<h3 className='font-semibold text-md mb-2 border-b pb-1'>
						Financial Ratios
					</h3>
					<DataPoint
						label='PE Ratio (TTM)'
						value={formatNumber(peRatio)}
						tooltip='股价与每股收益的比率（TTM表示过去12个月）'
					/>
					<DataPoint
						label='Forward PE'
						value={formatNumber(forwardPE)}
						tooltip='股价与预测未来每股收益的比率'
					/>
					<DataPoint
						label='EPS (TTM)'
						value={formatNumber(eps)}
						tooltip='每股收益（TTM表示过去12个月）'
					/>
					<DataPoint
						label='Profit Margins'
						value={formatPercent(
							profitMargins && profitMargins * 100
						)}
						tooltip='净利润与总收入的比率'
					/>
					<DataPoint
						label='ROA'
						value={formatPercent(
							returnOnAssets && returnOnAssets * 100
						)}
						tooltip='资产回报率，表示公司利用资产创造利润的能力'
					/>
					<DataPoint
						label='ROE'
						value={formatPercent(
							returnOnEquity && returnOnEquity * 100
						)}
						tooltip='股本回报率，表示公司对股东投资的回报能力'
					/>
				</div>

				{/* 第四列：股息和分析师 */}
				<div className='space-y-0'>
					<h3 className='font-semibold text-md mb-2 border-b pb-1'>
						Dividends & Analyst Ratings
					</h3>
					<DataPoint
						label='Earnings Date'
						value={earningsDate}
						tooltip='下一次财报公布的日期'
					/>
					<DataPoint
						label='Dividend Rate'
						value={formatDividendYield(dividendRate, dividendYield)}
						tooltip='年度股息金额和收益率'
					/>
					<DataPoint
						label='Ex-Dividend Date'
						value={exDividendDate}
						tooltip='除息日期，持有股票需要在此日期前购买才能获得下一次股息'
					/>
					<DataPoint
						label='Analyst Rating'
						value={formatRecommendation(
							recommendationKey,
							recommendationMean
						)}
						tooltip={recommendationDesc}
					/>
					<DataPoint
						label='Price Target'
						value={
							targetMean
								? `${formatNumber(targetMean)} (${formatNumber(targetLow)} - ${formatNumber(targetHigh)})`
								: '--'
						}
						tooltip='分析师预测的12个月目标价格范围'
					/>
					<DataPoint
						label='Price Target Median'
						value={formatNumber(targetMedian)}
						tooltip='分析师预测的12个月目标价格中位数'
					/>
					<DataPoint
						label='Analysts Covering'
						value={numberOfAnalysts?.toString()}
						tooltip='关注并分析该股票的分析师数量'
					/>
				</div>

				{/* 第五列：成长和业绩 */}
				<div className='space-y-0'>
					<h3 className='font-semibold text-md mb-2 border-b pb-1'>
						Growth & Performance
					</h3>
					<DataPoint
						label='Revenue Growth'
						value={formatPercent(
							revenueGrowth && revenueGrowth * 100
						)}
						tooltip='公司收入的年增长率'
					/>
					<DataPoint
						label='Earnings Growth'
						value={formatPercent(
							earningsGrowth && earningsGrowth * 100
						)}
						tooltip='公司盈利的年增长率'
					/>
					<DataPoint
						label='Free Cash Flow'
						value={formatLargeNumber(freeCashflow)}
						tooltip='公司自由现金流，表示可用于投资、还债或分红的现金'
					/>
					<DataPoint
						label='Total Cash'
						value={formatLargeNumber(totalCash)}
						tooltip='公司持有的总现金及等价物'
					/>
					<DataPoint
						label='Cash Per Share'
						value={formatNumber(totalCashPerShare)}
						tooltip='每股所代表的现金价值'
					/>
				</div>

				{/* 第六列：债务和流动性 */}
				<div className='space-y-0'>
					<DataPoint
						label='Total Debt'
						value={formatLargeNumber(totalDebt)}
						tooltip='公司总债务'
					/>
					<DataPoint
						label='Debt to Equity'
						value={formatNumber(debtToEquity)}
						tooltip='债务与股东权益比率，衡量公司财务杠杆水平'
					/>
					<DataPoint
						label='Current Ratio'
						value={formatNumber(currentRatio)}
						tooltip='流动比率，表示公司短期偿债能力'
					/>
					<DataPoint
						label='Quick Ratio'
						value={formatNumber(quickRatio)}
						tooltip='速动比率，不包括库存的短期偿债能力指标'
					/>
				</div>

				{/* 第七列：持股信息 */}
				<div className='space-y-0'>
					<h3 className='font-semibold text-md mb-2 border-b pb-1'>
						Ownership
					</h3>
					<DataPoint
						label='Insider Ownership'
						value={formatPercent(
							heldPercentInsiders && heldPercentInsiders * 100
						)}
						tooltip='公司内部人持有的股份比例'
					/>
					<DataPoint
						label='Institution Ownership'
						value={formatPercent(
							heldPercentInstitutions &&
								heldPercentInstitutions * 100
						)}
						tooltip='机构投资者持有的股份比例'
					/>
					<DataPoint
						label='Float Shares'
						value={floatShares?.toLocaleString()}
						tooltip='可自由交易的流通股数量'
					/>
					<DataPoint
						label='Short Ratio'
						value={formatNumber(shortRatio)}
						tooltip='卖空比率，表示平仓所需的交易天数'
					/>
				</div>

				{/* 第八列：其他信息 - 可以根据需要添加 */}
				<div className='space-y-0'>
					<h3 className='font-semibold text-md mb-2 border-b pb-1'>
						Additional Info
					</h3>
					<DataPoint
						label='Currency'
						value={currency}
						tooltip='股票交易使用的货币'
					/>
					<DataPoint
						label='Dividend Date'
						value={dividendDate}
						tooltip='下一次派息日期'
					/>
					{/* 可以根据需要添加更多数据点 */}
				</div>
			</div>
		</div>
	);
}
