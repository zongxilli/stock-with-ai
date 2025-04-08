/**
 * 雅虎金融 API 股票实时数据接口
 * 由 yahoo-finance2 库的 quote 方法返回的数据结构
 */
export interface StockRealtimeData {
  /** 语言代码，如 'en-US' */
  language: string;
  /** 地区代码，如 'US' */
  region: string;
  /** 报价类型，如 'EQUITY'(股票),'ETF'(交易所交易基金),'FUTURE'(期货)等 */
  quoteType: string;
  /** 报价类型显示名称，如 'Equity' */
  typeDisp: string;
  /** 报价源名称，如 'Nasdaq Real Time Price' */
  quoteSourceName: string;
  /** 是否可触发提醒 */
  triggerable: boolean;
  /** 自定义价格提醒置信度 */
  customPriceAlertConfidence: string;
  /** 货币代码，如 'USD' */
  currency: string;
  /** 股票简称，如 'NVIDIA Corporation' */
  shortName: string;
  /** 市场状态，如 'REGULAR'(常规交易),'PRE'(盘前),'POST'(盘后),'CLOSED'(已收盘) */
  marketState: string;
  /** 公司全称，如 'NVIDIA Corporation' */
  longName: string;
  /** 交易所代码，如 'NMS'(纳斯达克) */
  exchange: string;
  /** 消息板ID */
  messageBoardId: string;
  /** 交易所时区名称，如 'America/New_York' */
  exchangeTimezoneName: string;
  /** 交易所时区短名称，如 'EDT' */
  exchangeTimezoneShortName: string;
  /** GMT偏移毫秒数，如 -14400000 (-4小时) */
  gmtOffSetMilliseconds: number;
  /** 市场名称，如 'us_market' */
  market: string;
  /** 是否填充了ESG(环境、社会和治理)数据 */
  esgPopulated: boolean;
  /** 常规市场价格变动百分比 */
  regularMarketChangePercent: number;
  /** 常规市场当前价格 */
  regularMarketPrice: number;
  /** 近12个月的年化股息率 */
  trailingAnnualDividendRate: number;
  /** 市盈率(TTM) */
  trailingPE: number;
  /** 预估年化股息率 */
  dividendRate: number;
  /** 近12个月的年化股息收益率 */
  trailingAnnualDividendYield: number;
  /** 预估股息收益率 */
  dividendYield: number;
  /** 过去12个月的每股收益 */
  epsTrailingTwelveMonths: number;
  /** 预期的每股收益 */
  epsForward: number;
  /** 当年预期的每股收益 */
  epsCurrentYear: number;
  /** 当前股价与当年每股收益比率 */
  priceEpsCurrentYear: number;
  /** 流通股数 */
  sharesOutstanding: number;
  /** 每股账面价值 */
  bookValue: number;
  /** 50日移动平均价 */
  fiftyDayAverage: number;
  /** 当前价格与50日移动平均价的差额 */
  fiftyDayAverageChange: number;
  /** 当前价格与50日移动平均价的差额百分比 */
  fiftyDayAverageChangePercent: number;
  /** 200日移动平均价 */
  twoHundredDayAverage: number;
  /** 当前价格与200日移动平均价的差额 */
  twoHundredDayAverageChange: number;
  /** 当前价格与200日移动平均价的差额百分比 */
  twoHundredDayAverageChangePercent: number;
  /** 市值 */
  marketCap: number;
  /** 预期市盈率 */
  forwardPE: number;
  /** 市净率 */
  priceToBook: number;
  /** 报价更新间隔(秒) */
  sourceInterval: number;
  /** 交易所数据延迟时间(秒) */
  exchangeDataDelayedBy: number;
  /** 公司前名称 */
  prevName: string;
  /** 公司名称变更日期 */
  nameChangeDate: Date;
  /** 分析师平均评级，如 '1.4 - Strong Buy' */
  averageAnalystRating: string;
  /** 是否可交易 */
  tradeable: boolean;
  /** 是否可进行加密货币交易 */
  cryptoTradeable: boolean;
  /** 是否有盘前盘后数据 */
  hasPrePostMarketData: boolean;
  /** 首次交易日期 */
  firstTradeDateMilliseconds: Date;
  /** 价格小数位数提示 */
  priceHint: number;
  /** 常规市场价格变动 */
  regularMarketChange: number;
  /** 常规市场当日最高价 */
  regularMarketDayHigh: number;
  /** 常规市场当日价格范围 */
  regularMarketDayRange: { 
    /** 当日最低价 */
    low: number; 
    /** 当日最高价 */
    high: number; 
  };
  /** 常规市场当日最低价 */
  regularMarketDayLow: number;
  /** 常规市场成交量 */
  regularMarketVolume: number;
  /** 常规市场昨日收盘价 */
  regularMarketPreviousClose: number;
  /** 买入价 */
  bid: number;
  /** 卖出价 */
  ask: number;
  /** 买入量 */
  bidSize: number;
  /** 卖出量 */
  askSize: number;
  /** 交易所全名，如 'NasdaqGS' */
  fullExchangeName: string;
  /** 财务报表使用的货币 */
  financialCurrency: string;
  /** 常规市场开盘价 */
  regularMarketOpen: number;
  /** 3个月平均日成交量 */
  averageDailyVolume3Month: number;
  /** 10天平均日成交量 */
  averageDailyVolume10Day: number;
  /** 相对于52周最低价的变动 */
  fiftyTwoWeekLowChange: number;
  /** 相对于52周最低价的变动百分比 */
  fiftyTwoWeekLowChangePercent: number;
  /** 52周价格范围 */
  fiftyTwoWeekRange: { 
    /** 52周最低价 */
    low: number; 
    /** 52周最高价 */
    high: number; 
  };
  /** 相对于52周最高价的变动 */
  fiftyTwoWeekHighChange: number;
  /** 相对于52周最高价的变动百分比 */
  fiftyTwoWeekHighChangePercent: number;
  /** 52周最低价 */
  fiftyTwoWeekLow: number;
  /** 52周最高价 */
  fiftyTwoWeekHigh: number;
  /** 52周内的价格变动百分比 */
  fiftyTwoWeekChangePercent: number;
  /** 分红日期 */
  dividendDate: Date;
  /** 财报发布时间 */
  earningsTimestamp: Date;
  /** 财报发布开始时间 */
  earningsTimestampStart: Date;
  /** 财报发布结束时间 */
  earningsTimestampEnd: Date;
  /** 财报电话会议开始时间戳 */
  earningsCallTimestampStart: number;
  /** 财报电话会议结束时间戳 */
  earningsCallTimestampEnd: number;
  /** 财报日期是否为估计值 */
  isEarningsDateEstimate: boolean;
  /** 公司行动记录 */
  corporateActions: any[];
  /** 常规市场时间 */
  regularMarketTime: Date;
  /** 显示名称，通常是简称，如 'NVIDIA' */
  displayName: string;
  /** 股票代码，如 'NVDA' */
  symbol: string;
  
  /** 盘前价格 */
  preMarketPrice?: number;
  /** 盘前价格变动 */
  preMarketChange?: number;
  /** 盘前价格变动百分比 */
  preMarketChangePercent?: number;
  /** 盘前交易时间 */
  preMarketTime?: Date;
  /** 盘后价格 */
  postMarketPrice?: number;
  /** 盘后价格变动 */
  postMarketChange?: number;
  /** 盘后价格变动百分比 */
  postMarketChangePercent?: number;
  /** 盘后交易时间 */
  postMarketTime?: Date;
}
