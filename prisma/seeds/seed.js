const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
	// 清除现有数据（如果需要）
	await prisma.marketAnalysis.deleteMany({});

	// 准备样本数据
	const marketData = [
		{
			date: '2025-03-01',
			summary:
				'市场今日呈现温和上涨趋势，科技股表现突出。投资者对即将发布的经济数据持谨慎乐观态度，大盘交易量处于近期平均水平。',
			sentimentScore: 5.8,
			safetyScore: 72.3,
			marketTrend: 'bullish',
			volatilityLevel: 28.5,
			topGainers: JSON.stringify([
				{
					symbol: 'TECH',
					name: '科技创新集团',
					changePercent: 4.2,
					price: 327.45,
				},
				{
					symbol: 'CHIP',
					name: '芯片半导体有限公司',
					changePercent: 3.8,
					price: 187.92,
				},
				{
					symbol: 'SOFT',
					name: '云端软件科技',
					changePercent: 3.5,
					price: 412.67,
				},
			]),
			topLosers: JSON.stringify([
				{
					symbol: 'RETAIL',
					name: '全球零售连锁',
					changePercent: -2.1,
					price: 83.14,
				},
				{
					symbol: 'BANK',
					name: '国际银行控股',
					changePercent: -1.7,
					price: 142.56,
				},
				{
					symbol: 'OIL',
					name: '能源石油公司',
					changePercent: -1.5,
					price: 64.25,
				},
			]),
			keyEvents:
				'美联储主席表示将继续保持当前利率水平；科技巨头发布新一代人工智能产品，市场反应积极。',
			tradingSuggestions:
				'考虑增持科技和半导体板块；对零售和能源板块保持观望；可逢低买入优质大盘股。',
			sectors: JSON.stringify({
				technology: { performance: 2.8, outlook: 'positive' },
				finance: { performance: -0.5, outlook: 'neutral' },
				healthcare: { performance: 1.2, outlook: 'positive' },
				energy: { performance: -1.3, outlook: 'cautious' },
				consumer: { performance: 0.3, outlook: 'neutral' },
			}),
		},
		{
			date: '2025-03-02',
			summary:
				'市场今天经历了小幅回调，主要受国际贸易紧张局势影响。大多数板块出现下滑，但医疗健康板块表现稳健，显示出防御性特征。',
			sentimentScore: 3.2,
			safetyScore: 65.7,
			marketTrend: 'bearish',
			volatilityLevel: 35.2,
			topGainers: JSON.stringify([
				{
					symbol: 'HEALTH',
					name: '医疗科技创新',
					changePercent: 2.5,
					price: 218.32,
				},
				{
					symbol: 'PHARMA',
					name: '制药研发集团',
					changePercent: 1.9,
					price: 156.78,
				},
				{
					symbol: 'TELE',
					name: '电信服务提供商',
					changePercent: 1.1,
					price: 92.45,
				},
			]),
			topLosers: JSON.stringify([
				{
					symbol: 'TECH',
					name: '科技创新集团',
					changePercent: -3.1,
					price: 317.34,
				},
				{
					symbol: 'AUTO',
					name: '智能汽车制造',
					changePercent: -2.8,
					price: 178.23,
				},
				{
					symbol: 'SOCIAL',
					name: '社交媒体平台',
					changePercent: -2.6,
					price: 245.67,
				},
			]),
			keyEvents:
				'国际贸易争端升级；科技巨头面临新的监管调查；医疗板块受到新药获批消息提振。',
			tradingSuggestions:
				'建议对科技股进行适度减持；可考虑增加医疗健康板块的配置；整体保持谨慎，留有现金待更好的入场点。',
			sectors: JSON.stringify({
				technology: { performance: -2.1, outlook: 'cautious' },
				finance: { performance: -1.5, outlook: 'neutral' },
				healthcare: { performance: 2.0, outlook: 'positive' },
				energy: { performance: -0.8, outlook: 'neutral' },
				consumer: { performance: -1.2, outlook: 'cautious' },
			}),
		},
		{
			date: '2025-03-03',
			summary:
				'市场大幅反弹，主要受央行降息预期和积极经济数据提振。投资者重新买入前期下跌的科技股，交易量显著高于平均水平。',
			sentimentScore: 7.5,
			safetyScore: 78.2,
			marketTrend: 'bullish',
			volatilityLevel: 32.7,
			topGainers: JSON.stringify([
				{
					symbol: 'TECH',
					name: '科技创新集团',
					changePercent: 5.2,
					price: 333.64,
				},
				{
					symbol: 'AUTO',
					name: '智能汽车制造',
					changePercent: 4.7,
					price: 186.61,
				},
				{
					symbol: 'SOCIAL',
					name: '社交媒体平台',
					changePercent: 4.3,
					price: 256.23,
				},
			]),
			topLosers: JSON.stringify([
				{
					symbol: 'GOLD',
					name: '黄金开采投资',
					changePercent: -1.8,
					price: 124.35,
				},
				{
					symbol: 'UTIL',
					name: '公共事业服务',
					changePercent: -1.2,
					price: 73.48,
				},
				{
					symbol: 'BOND',
					name: '债券投资信托',
					changePercent: -0.9,
					price: 42.19,
				},
			]),
			keyEvents:
				'央行官员暗示可能在下次会议降息；第一季度GDP预测上调；科技巨头宣布回购股票计划。',
			tradingSuggestions:
				'积极加仓科技和消费板块；减持防御性资产如黄金和公用事业；利用市场强势时机调整投资组合。',
			sectors: JSON.stringify({
				technology: { performance: 4.3, outlook: 'very positive' },
				finance: { performance: 2.8, outlook: 'positive' },
				healthcare: { performance: 1.5, outlook: 'positive' },
				energy: { performance: 2.2, outlook: 'positive' },
				consumer: { performance: 3.1, outlook: 'positive' },
			}),
		},
		{
			date: '2025-03-04',
			summary:
				'市场延续涨势，但涨幅有所收窄，交易趋向谨慎。财报季临近，投资者期待企业业绩指引。能源板块因原油价格上涨而领涨。',
			sentimentScore: 6.2,
			safetyScore: 71.5,
			marketTrend: 'bullish',
			volatilityLevel: 25.4,
			topGainers: JSON.stringify([
				{
					symbol: 'OIL',
					name: '能源石油公司',
					changePercent: 3.9,
					price: 68.47,
				},
				{
					symbol: 'DRILL',
					name: '石油钻探服务',
					changePercent: 3.4,
					price: 42.38,
				},
				{
					symbol: 'GREEN',
					name: '新能源技术',
					changePercent: 2.8,
					price: 118.75,
				},
			]),
			topLosers: JSON.stringify([
				{
					symbol: 'STREAM',
					name: '流媒体娱乐平台',
					changePercent: -1.5,
					price: 297.82,
				},
				{
					symbol: 'TRAVEL',
					name: '旅游预订服务',
					changePercent: -1.3,
					price: 86.24,
				},
				{
					symbol: 'RETAIL',
					name: '全球零售连锁',
					changePercent: -1.0,
					price: 82.35,
				},
			]),
			keyEvents:
				'原油价格因供应担忧上涨；即将开始的财报季预期总体积极；政府宣布新的基础设施计划。',
			tradingSuggestions:
				'可适度配置能源板块；对即将发布财报的公司保持关注；保持分散投资，不过度集中在单一板块。',
			sectors: JSON.stringify({
				technology: { performance: 1.2, outlook: 'positive' },
				finance: { performance: 0.8, outlook: 'neutral' },
				healthcare: { performance: 0.5, outlook: 'neutral' },
				energy: { performance: 3.5, outlook: 'very positive' },
				consumer: { performance: -0.7, outlook: 'cautious' },
			}),
		},
		{
			date: '2025-03-05',
			summary:
				'市场小幅上涨，投资者消化了一系列企业财报和经济数据。市场表现分化明显，成长股表现强于价值股，小盘股领先于大盘股。',
			sentimentScore: 5.5,
			safetyScore: 68.9,
			marketTrend: 'neutral',
			volatilityLevel: 22.6,
			topGainers: JSON.stringify([
				{
					symbol: 'SMALL',
					name: '小盘成长基金',
					changePercent: 2.7,
					price: 43.28,
				},
				{
					symbol: 'SEMI',
					name: '半导体材料研发',
					changePercent: 2.5,
					price: 132.45,
				},
				{
					symbol: 'FINTECH',
					name: '金融科技创新',
					changePercent: 2.3,
					price: 89.76,
				},
			]),
			topLosers: JSON.stringify([
				{
					symbol: 'LUXURY',
					name: '奢侈品集团',
					changePercent: -2.2,
					price: 342.18,
				},
				{
					symbol: 'HOTEL',
					name: '国际酒店连锁',
					changePercent: -1.9,
					price: 124.37,
				},
				{
					symbol: 'AIR',
					name: '航空运输集团',
					changePercent: -1.7,
					price: 76.82,
				},
			]),
			keyEvents:
				'多家科技公司发布好于预期的财报；消费者信心指数小幅上升；服务业数据显示持续扩张。',
			tradingSuggestions:
				'关注小盘成长股的机会；对奢侈品和旅游板块保持谨慎；继续持有表现良好的科技股。',
			sectors: JSON.stringify({
				technology: { performance: 1.8, outlook: 'positive' },
				finance: { performance: 1.2, outlook: 'positive' },
				healthcare: { performance: 0.7, outlook: 'neutral' },
				energy: { performance: 0.5, outlook: 'neutral' },
				consumer: { performance: -1.5, outlook: 'cautious' },
			}),
		},
		{
			date: '2025-03-06',
			summary:
				'市场出现较大幅度调整，主要受通胀数据高于预期影响。投资者担忧央行可能推迟降息，导致债券收益率上升，对高估值股票形成压力。',
			sentimentScore: 2.8,
			safetyScore: 61.4,
			marketTrend: 'bearish',
			volatilityLevel: 42.3,
			topGainers: JSON.stringify([
				{
					symbol: 'GOLD',
					name: '黄金开采投资',
					changePercent: 2.1,
					price: 127.86,
				},
				{
					symbol: 'UTIL',
					name: '公共事业服务',
					changePercent: 1.4,
					price: 74.51,
				},
				{
					symbol: 'FOOD',
					name: '食品生产加工',
					changePercent: 0.8,
					price: 62.39,
				},
			]),
			topLosers: JSON.stringify([
				{
					symbol: 'TECH',
					name: '科技创新集团',
					changePercent: -4.5,
					price: 318.63,
				},
				{
					symbol: 'CHIP',
					name: '芯片半导体有限公司',
					changePercent: -4.1,
					price: 180.33,
				},
				{
					symbol: 'AUTO',
					name: '智能汽车制造',
					changePercent: -3.8,
					price: 179.46,
				},
			]),
			keyEvents:
				'核心通胀数据高于预期；央行官员发表偏鹰派言论；多家分析师下调科技股目标价。',
			tradingSuggestions:
				'增加防御性资产配置；减持高估值成长股；保持较高现金水平以应对可能的进一步调整。',
			sectors: JSON.stringify({
				technology: { performance: -3.7, outlook: 'cautious' },
				finance: { performance: -2.2, outlook: 'cautious' },
				healthcare: { performance: -1.5, outlook: 'neutral' },
				energy: { performance: -2.8, outlook: 'cautious' },
				consumer: { performance: -2.1, outlook: 'cautious' },
			}),
		},
		{
			date: '2025-03-07',
			summary:
				'市场企稳反弹，科技和金融板块领涨。投资者重新评估昨日的抛售是否过度，较低价位吸引了一定的买盘。交易量较前一日有所下降。',
			sentimentScore: 5.1,
			safetyScore: 66.8,
			marketTrend: 'neutral',
			volatilityLevel: 34.2,
			topGainers: JSON.stringify([
				{
					symbol: 'TECH',
					name: '科技创新集团',
					changePercent: 2.8,
					price: 327.55,
				},
				{
					symbol: 'BANK',
					name: '国际银行控股',
					changePercent: 2.5,
					price: 146.12,
				},
				{
					symbol: 'SOFT',
					name: '云端软件科技',
					changePercent: 2.3,
					price: 417.34,
				},
			]),
			topLosers: JSON.stringify([
				{
					symbol: 'HEALTH',
					name: '医疗科技创新',
					changePercent: -1.2,
					price: 215.47,
				},
				{
					symbol: 'UTIL',
					name: '公共事业服务',
					changePercent: -0.9,
					price: 73.84,
				},
				{
					symbol: 'GOLD',
					name: '黄金开采投资',
					changePercent: -0.7,
					price: 126.97,
				},
			]),
			keyEvents:
				'就业数据好于预期；科技巨头宣布新的AI合作项目；一家大型银行上调经济增长预测。',
			tradingSuggestions:
				'逢低买入优质科技股；保持金融板块的适度配置；减持昨日表现较好的防御性资产。',
			sectors: JSON.stringify({
				technology: { performance: 2.4, outlook: 'positive' },
				finance: { performance: 2.1, outlook: 'positive' },
				healthcare: { performance: -0.6, outlook: 'neutral' },
				energy: { performance: 0.8, outlook: 'neutral' },
				consumer: { performance: 1.2, outlook: 'positive' },
			}),
		},
	];

	console.log(`开始插入${marketData.length}条市场分析数据...`);

	// 批量插入数据
	for (const data of marketData) {
		await prisma.marketAnalysis.create({
			data,
		});
	}

	console.log('数据插入完成!');
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
