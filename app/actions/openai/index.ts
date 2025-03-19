'use server';

// Mock data for DeepSeek sequential thinking
const mockDeepSeekData = {
	success: true,
	data: {
		sequentialThinking: [
			{
				step: 1,
				title: 'Analyzing Recent Price Movements',
				content:
					'Looking at the recent price chart, we can see a clear uptrend over the past 3 months with higher lows and higher highs. Volume has been increasing on up days and decreasing on down days, which is bullish. The 50-day moving average is now acting as support.',
			},
			{
				step: 2,
				title: 'Examining Financial Metrics',
				content:
					'Q1 earnings showed revenue growth of 18% YoY and EPS growth of 22%. Gross margins improved by 2.5 percentage points to 42.3%. The company has a strong balance sheet with $4.2B in cash and only $1.5B in debt.',
			},
			{
				step: 3,
				title: 'Evaluating Industry Position',
				content:
					'The company holds approximately 24% market share in its core business, up from 21% last year. Their new product line is showing strong initial adoption rates. Competitors are struggling to match their technology advantage in key areas.',
			},
			{
				step: 4,
				title: 'Forecasting Future Performance',
				content:
					'Given the strong fundamentals, technical setup, and improving market position, the stock appears positioned for continued growth. However, broader market volatility and sector rotation risks could create short-term headwinds.',
			},
		],
		analysis:
			"After careful analysis of technical indicators, financial performance, and market position, this stock appears to have strong bullish potential in the medium term. The company's improving fundamentals, expanding market share, and innovative product pipeline provide solid growth drivers.",
		recommendations: [
			'Consider a phased buying approach at current levels',
			'Watch for support at the 50-day moving average ($158) for adding positions',
			'Set a price target of $195 within the next 3-6 months',
			'Monitor Q2 earnings closely for continued margin improvements',
		],
		sentiment: 'positive',
	},
};

export async function getAIAnalysis(symbol: string) {
	try {
		console.log(`AI Assistant called for ${symbol}`);

		// Simulate network delay
		await new Promise((resolve) => setTimeout(resolve, 1000));

		// 使用实际的DeepSeek API
		const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
		
		if (!DEEPSEEK_API_KEY) {
			console.error('DeepSeek API密钥未设置');
			return mockDeepSeekData;
		}
		
		try {
			// 构建API请求 - 使用正确的API端点和参数格式
			const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					model: 'Pro/deepseek-ai/DeepSeek-V3', // 使用DeepSeek-V3模型
					messages: [
						{
							role: 'system',
							content: '你是一个专业的股票分析师，擅长分析股票数据并提供详细的投资建议。请使用逐步思考的方式分析。'
						},
						{
							role: 'user',
							content: `请分析以下股票: ${symbol}。提供技术分析、基本面分析、行业地位评估和未来表现预测。请按以下格式输出：
1. 步骤1：[标题]
[详细内容]
2. 步骤2：[标题]
[详细内容]
3. 步骤3：[标题]
[详细内容]
4. 步骤4：[标题]
[详细内容]

分析：
[总体分析]

建议：
1. [建议1]
2. [建议2]
3. [建议3]
4. [建议4]

情绪：[积极/中性/消极]`
						}
					],
					stream: false,
					max_tokens: 1024,
					temperature: 0.7,
					top_p: 0.7,
					top_k: 50,
					frequency_penalty: 0.5,
					n: 1,
					response_format: {
						type: 'text'
					}
				})
			});
			
			if (!response.ok) {
				throw new Error(`DeepSeek API请求失败: ${response.status}`);
			}
			
			const data = await response.json();
			
			// 解析DeepSeek响应并转换为应用程序所需的格式
			const content = data.choices[0].message.content;
			
			// 这里需要根据实际API响应格式进行解析
			// 以下是一个简化的示例，您可能需要根据实际响应调整
			const parsedResponse = parseDeepSeekResponse(content);
			
			return {
				success: true,
				data: parsedResponse
			};
		} catch (apiError) {
			console.error('DeepSeek API调用错误:', apiError);
			// 如果API调用失败，回退到模拟数据
			return mockDeepSeekData;
		}
		
	} catch (error) {
		console.error('AI Assistant error:', error);
		throw new Error('Failed to get AI analysis');
	}
}

// 解析DeepSeek API响应
function parseDeepSeekResponse(content: string) {
	// 这是一个简化的解析函数，您可能需要根据实际响应调整
	// 假设响应是一个结构化的文本，我们需要提取各个部分
	
	try {
		// 尝试识别步骤思考过程
		const sequentialThinking = [];
		const stepRegex = /步骤\s*(\d+)[：:]\s*([^]*?)(?=步骤\s*\d+[：:]|分析[：:]|建议[：:]|$)/g;
		let match;
		
		while ((match = stepRegex.exec(content)) !== null) {
			const step = parseInt(match[1]);
			const fullContent = match[2].trim();
			
			// 尝试分离标题和内容
			const titleEndIndex = fullContent.indexOf('\n');
			let title, stepContent;
			
			if (titleEndIndex > 0) {
				title = fullContent.substring(0, titleEndIndex).trim();
				stepContent = fullContent.substring(titleEndIndex).trim();
			} else {
				title = `步骤 ${step}`;
				stepContent = fullContent;
			}
			
			sequentialThinking.push({
				step,
				title,
				content: stepContent
			});
		}
		
		// 提取分析部分
		let analysis = '';
		const analysisMatch = content.match(/分析[：:]\s*([^]*?)(?=建议[：:]|情绪[：:]|$)/);
		if (analysisMatch) {
			analysis = analysisMatch[1].trim();
		}
		
		// 提取建议部分
		const recommendations = [];
		const recommendationsMatch = content.match(/建议[：:]\s*([^]*?)(?=情绪[：:]|$)/);
		if (recommendationsMatch) {
			const recommendationsText = recommendationsMatch[1].trim();
			// 分割为单独的建议
			const recommendationItems = recommendationsText.split(/\d+\.\s*/).filter(Boolean);
			recommendations.push(...recommendationItems.map(item => item.trim()));
		}
		
		// 提取情绪/情感部分
		let sentiment = 'neutral';
		const sentimentMatch = content.match(/情绪[：:]\s*([^]*?)$/);
		if (sentimentMatch) {
			const sentimentText = sentimentMatch[1].trim().toLowerCase();
			if (sentimentText.includes('积极') || sentimentText.includes('正面') || sentimentText.includes('看涨')) {
				sentiment = 'positive';
			} else if (sentimentText.includes('消极') || sentimentText.includes('负面') || sentimentText.includes('看跌')) {
				sentiment = 'negative';
			}
		}
		
		return {
			sequentialThinking,
			analysis,
			recommendations,
			sentiment
		};
	} catch (parseError) {
		console.error('解析DeepSeek响应时出错:', parseError);
		// 如果解析失败，返回一个基本结构
		return {
			analysis: content,
			recommendations: [],
			sentiment: 'neutral'
		};
	}
}
