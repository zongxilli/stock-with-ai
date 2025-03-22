'use server';

// 搜索股票API - 用于模糊搜索和纠正股票代码
export async function searchStock(query: string) {
  try {
    if (!query || query.trim() === '') {
      return {
        error: '搜索关键词不能为空',
        errorType: 'EMPTY_QUERY',
      };
    }

    const cleanQuery = query.trim();
    
    // 使用Yahoo Finance搜索API
    const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(cleanQuery)}&quotesCount=5&newsCount=0&listsCount=0&enableFuzzyQuery=true`;
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`搜索请求失败: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.quotes || data.quotes.length === 0) {
      return {
        error: '没有找到匹配的股票',
        errorType: 'NO_RESULTS',
        query: cleanQuery
      };
    }

    // 过滤出股票类型的结果
    const stockResults = data.quotes.filter(
      (quote: any) => quote.quoteType === 'EQUITY' && quote.symbol
    );

    if (stockResults.length === 0) {
      return {
        error: '没有找到匹配的股票',
        errorType: 'NO_STOCK_RESULTS',
        query: cleanQuery
      };
    }

    // 返回结果
    return {
      results: stockResults,
      firstResult: stockResults[0],
      query: cleanQuery
    };
  } catch (err) {
    console.error('股票搜索出错:', err);
    return {
      error: `搜索失败: ${err instanceof Error ? err.message : String(err)}`,
      errorType: 'SEARCH_ERROR',
      query
    };
  }
} 