export const getProvideDataPrompt = (
	language: 'EN' | 'CN',
	symbol: string,
	stockDataString: string,
	technicalDataString: string,
	historicalDataString: string,
	mainIndexesHistoricalDataString: string,
	newsDataString: string
) => {
	console.log('stockDataString', stockDataString.length);
	console.log('technicalDataString', technicalDataString.length);
	console.log('historicalDataString', historicalDataString.length);
	console.log(
		'mainIndexesHistoricalDataString',
		mainIndexesHistoricalDataString.length
	);
	console.log('newsDataString', newsDataString.length);

	return language === 'CN'
		? `
请对股票代码 ${symbol} 进行全面分析，并以JSON格式返回以下结构的数据：

以下是该股票的全面数据，请在你的分析中充分利用这些数据：
${stockDataString}

以下是该股票的技术指标数据，请在技术分析中充分利用这些数据：
${technicalDataString}

以下是该股票的历史数据，请在分析中充分利用这些数据：
${historicalDataString}

以下是主要市场指数的历史数据，请在分析中结合大盘指数：
${mainIndexesHistoricalDataString}

以下是该股票的最近10条新闻数据，请在分析中充分利用这些数据：
${newsDataString}
  `
		: `
Please provide a comprehensive analysis of the stock with symbol ${symbol} and return the data in the following JSON structure.

Here is the comprehensive data for this stock. Please use this data extensively in your analysis:
${stockDataString}

Here is the technical indicators data for this stock. Please use this data extensively in your technical analysis:
${technicalDataString}

Here is the historical data for this stock. Please use this data extensively in your analysis:
${historicalDataString}

Here is the historical data for major market indexes. Please use this data extensively in your analysis:
${mainIndexesHistoricalDataString}

Here is the latest 10 news for this stock. Please use this data extensively in your analysis:
${newsDataString}
  `;
};
