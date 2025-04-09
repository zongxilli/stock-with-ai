# Smart Stock Market Analysis Platform

A stock market analysis application built with Next.js 14, Prisma, Redis, and Supabase, utilizing AI to provide market insights and trading recommendations.

## ✨ Features

- **Real-time Market Data Dashboard** - Automatically refreshing stock, futures, and commodity market data (5-second intervals)
- **Interactive Charts** - Professional stock price charts with multiple time ranges, including intraday, weekly, monthly, and yearly views
- **Advanced Chart Views** - Support for switching to advanced chart analysis mode, providing richer chart data and functionality
- **Smart Search** - Real-time stock search functionality, supporting stocks, ETFs, indices, and cryptocurrencies
- **AI Market Analysis** - Intelligent analysis of market trends, sentiment, and volatility, providing daily market summaries and trading recommendations
- **Industry Sector Analysis** - Detailed industry sector performance analysis, including performance scores and outlook forecasts
- **Technical Indicator Analysis** - Provides over 20 professional technical indicators, such as RSI, MACD, Bollinger Bands, etc.
- **Historical Data Analysis** - Supports historical data queries and analysis across multiple time spans
- **Split-Adjusted Data** - Supports processing and display of split-adjusted stock data
- **Dark/Light Mode** - Supports theme switching, suitable for various usage environments
- **Responsive Design** - Fully compatible modern user interface for mobile and desktop
- **High-Performance Architecture** - Utilizes Redis caching to enhance application performance and response speed
- **User Authentication System** - Secure authentication and user management based on Supabase
- **Error Monitoring and Tracking** - Integrated Sentry for error monitoring and performance analysis

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account (set up)
- Redis database (local or cloud service like Redis Cloud)
- PostgreSQL database (managed by Prisma)

### Installation Steps

1. Clone the repository

```bash
git clone https://github.com/your-username/smart-stock-analysis.git
cd smart-stock-analysis
```

2. Install dependencies

```bash
npm install
# or
yarn install
```

3. Configure environment variables

Create a `.env.local` file and add the following content:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
REDIS_URL=redis://default:your_password@redis-host:port
DATABASE_URL=postgresql://user:password@host:port/dbname
DIRECT_URL=postgresql://user:password@host:port/dbname
EODHD_API_KEY=your_eodhd_api_key
SENTRY_DSN=your_sentry_dsn
```

4. Initialize the database

```bash
# Run prisma migrations
npx prisma migrate dev

# Seed sample data
npm run seed
```

5. Run the development server

```bash
npm run dev
# or use Turbopack to accelerate development
npm run dev -- --turbopack
```

6. Open your browser and visit [http://localhost:3000](http://localhost:3000)

## 📚 Project Structure

```
stock-with-ai/
├── app/                  # Next.js App Router directory
│   ├── actions/          # Server Actions
│   │   ├── marketAnalysis.ts      # Market analysis data operations
│   │   ├── redis-actions.ts       # Redis data operations
│   │   ├── user/                  # User-related operations
│   │   ├── yahoo/                 # Yahoo Finance API related operations
│   │   │   ├── get-stock-realtime-data.ts     # Real-time stock data retrieval
│   │   │   ├── get-comprehensive-stock-data.ts # Comprehensive stock data retrieval
│   │   │   ├── get-volatile-stocks.ts         # Volatile stocks retrieval
│   │   │   ├── get-stock-chart-data.ts        # Stock chart data retrieval
│   │   │   ├── get-main-indices.ts            # Main indices data retrieval
│   │   │   ├── search-stock.ts                # Stock search functionality
│   │   │   └── utils/                         # Yahoo API utility functions
│   │   └── eodhd/                 # EODHD API related operations
│   │       ├── get-technical-indicators.ts            # Technical indicators retrieval
│   │       ├── get-historical-data.ts                 # Historical data retrieval
│   │       ├── get-historical-data-1-month-full.ts    # Complete monthly historical data
│   │       ├── get-historical-data-by-period.ts       # Historical data by period
│   │       ├── search-stock.ts                        # EODHD stock search
│   │       ├── indicators/                            # Technical indicators implementation
│   │       │   ├── rsi.ts                             # Relative Strength Index
│   │       │   ├── macd.ts                            # Moving Average Convergence/Divergence
│   │       │   ├── bollinger.ts                       # Bollinger Bands
│   │       │   ├── stochastic.ts                      # Stochastic Oscillator
│   │       │   ├── adx.ts                             # Average Directional Index
│   │       │   ├── atr.ts                             # Average True Range
│   │       │   └── ...                                # Other technical indicators
│   │       ├── utils/                                 # EODHD utility functions
│   │       └── types/                                 # EODHD type definitions
│   ├── (auth-pages)/     # Authentication-related pages
│   ├── auth/             # Authentication-related APIs and components
│   ├── home/             # Homepage and related components
│   ├── account/          # User account management pages
│   ├── stock/            # Stock details page
│   │   ├── [symbol]/     # Dynamic route stock pages
│   │   │   ├── page.tsx  # Stock details page
│   │   │   └── components/  # Stock page components
│   │   │       ├── stoct-chart.tsx          # Basic stock chart component
│   │   │       ├── rangeSelector.tsx        # Time range selector
│   │   │       ├── stock-chart-advanced/    # Advanced chart components
│   │   │       │   ├── stock-chart-advanced.tsx     # Advanced chart implementation
│   │   │       │   ├── chart-legend.ts              # Chart legend configuration
│   │   │       │   └── chart-options.ts             # Chart options configuration
│   │   │       ├── ai-analysis-result.tsx   # AI analysis results component
│   │   │       ├── ai-assistant-dialog.tsx  # AI assistant dialog component
│   │   │       ├── stock-details.tsx        # Stock details component
│   │   │       ├── stock-header.tsx         # Stock page header component
│   │   │       └── stock-news.tsx           # Stock news component
│   │   └── actions/      # Stock-related operations
│   ├── sentry-example-page/ # Sentry example page
│   ├── api/              # API routes
│   ├── types/            # Global type definitions
│   ├── protected/        # Pages requiring authentication
│   ├── error.tsx         # Error handling component
│   ├── global-error.tsx  # Global error handling
│   └── not-found.tsx     # 404 page
├── components/           # Reusable React components
│   ├── custom/           # Custom components
│   ├── ui/               # shadcn/ui components
│   ├── error/            # Error handling related components
│   ├── typography/       # Typography related components
│   ├── stock-search.tsx  # Stock search component
│   ├── theme-switcher.tsx # Theme switcher component
│   ├── header-auth.tsx   # Header with authentication component
│   └── submit-button.tsx # Submit button component
├── hooks/                # Custom React hooks
│   ├── useDebounce.tsx   # Debounce hook
│   └── useIsMounted.tsx  # Mount status hook
├── lib/                  # Core library files
│   ├── prisma.ts         # Prisma client
│   ├── redis.ts          # Redis client and tools
│   ├── format.ts         # Data formatting tools
│   ├── services/         # Service layer
│   │   └── marketAnalysisService.ts # Market analysis service
│   └── utils.ts          # Utility functions
├── prisma/               # Prisma related files
│   ├── migrations/       # Database migrations
│   ├── schema.prisma     # Database models
│   ├── services/         # Database services
│   └── seeds/            # Data seeding scripts
├── stores/               # State management
│   └── marketStore.ts    # Market data state storage
├── utils/                # Utility functions
│   └── supabase/         # Supabase client
├── middleware.ts         # Next.js middleware (for route protection, etc.)
├── sentry.client.config.ts  # Sentry client configuration
├── sentry.server.config.ts  # Sentry server configuration
├── sentry.edge.config.ts    # Sentry edge runtime configuration
├── tailwind.config.ts    # Tailwind CSS configuration
├── next.config.ts        # Next.js configuration
└── eslint.config.js      # ESLint configuration
```

## 💡 Tech Stack

- **Next.js 14**: Full-stack React framework with App Router and Server Actions
- **React 19**: Frontend UI library
- **TypeScript**: Type-safe JavaScript
- **Prisma 6**: Modern ORM tool simplifying database operations
- **PostgreSQL**: Powerful relational database
- **Redis**: High-performance caching solution
- **Supabase**: Open-source backend service platform providing authentication
- **Sentry**: Error monitoring and performance analysis
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Highly customizable UI component library
- **Zustand**: Lightweight state management
- **Yahoo Finance API**: Financial market data
- **EODHD API**: High-quality financial data and technical indicators
- **TradingView Lightweight Charts**: Professional financial chart library
- **Recharts**: Powerful React chart library
- **Zod**: Runtime type validation
- **React Hook Form**: Form handling and validation
- **Turbopack**: Accelerated development experience

## 📊 Main Features Explained

### Homepage Market Overview

The homepage displays major market indices and real-time data, including:

- S&P 500, Dow Jones, Nasdaq futures
- Russell 2000 index
- Crude oil and gold futures
- Bitcoin price
- 10-year US Treasury yield

Data automatically refreshes every 5 seconds, using Zustand for state management, ensuring users receive the latest market information.

### AI Market Analysis

The system uses AI to analyze daily market data, providing the following insights:

- Market Summary: A concise overview of the day's market conditions
- Sentiment Analysis: A quantified score metric of overall market sentiment
- Safety Assessment: Analysis of market trading risk levels
- Volatility Monitoring: Quantified indicators of market volatility
- Leading Gainers and Losers: Lists of the day's best and worst-performing stocks
- Key Events: Important news and events affecting the market
- Trading Recommendations: Investment strategy suggestions based on market analysis
- Industry Sector Analysis: Performance and outlook assessment for major industries

### Stock Details Page

The stock details page provides comprehensive individual stock information:

- Basic price data (current price, price change, volume)
- Interactive price charts supporting multiple time ranges (1 day to 5 years)
- Key indicators like intraday high/low, 52-week high/low
- Company fundamentals (market cap, PE ratio, dividends, etc.)
- Comprehensive technical indicator analysis
- Flexible chart UI supporting dark/light themes

### Advanced Chart View

The stock details page supports advanced chart view mode:

- Toggle through the RangeSelector component on the right side
- Richer chart configuration and data display
- Custom chart legends and options
- Support for displaying and analyzing split-adjusted data
- Integrated professional technical analysis functionality

### Technical Indicator Analysis

Supports over 20 professional technical indicators:

- RSI (Relative Strength Index)
- MACD (Moving Average Convergence/Divergence)
- Bollinger Bands
- Stochastic Oscillator
- ADX (Average Directional Index)
- Moving Averages (SMA, EMA, WMA)
- ATR (Average True Range)
- CCI (Commodity Channel Index)
- Volatility indicators
- Standard Deviation
- Trendline analysis
- More professional analysis indicators

### Global Search Functionality

The search bar at the top of the application supports finding various financial instruments:

- Stocks, ETFs, indices, and cryptocurrencies
- Real-time search suggestions
- Categorized search results
- Keyboard navigation support
- Multi-data source search (Yahoo Finance and EODHD)

### User Account Management

Supabase-based user management system:

- Secure email registration and login
- User profile management
- Personalized settings management
- Account security controls

### Adaptive Design

- Fully responsive interface, adapting to various device sizes from phones to desktops
- Component layouts optimized for small screens
- Automatically adjusting chart sizes
- Optimized touch operation support

### Data Caching Strategy

The application utilizes Redis for efficient data caching:

- Short-term caching for real-time market data (4 seconds)
- Medium-term caching for chart data (from 1 minute to 1 hour depending on time range)
- Long-term caching for search results (24 hours)
- Technical indicator data caching (from 5 minutes to 1 hour based on complexity)
- AI analysis result caching (by date)

This layered caching strategy significantly improves application performance and user experience.

### Error Monitoring and Performance Analysis

Integrated Sentry for comprehensive error monitoring and performance analysis:

- Client-side error capture and reporting
- Server-side error monitoring
- Edge runtime error handling
- Performance metrics collection and analysis
- User experience monitoring
- Detailed error reports and stack traces

## 🧰 Custom Hooks

The project includes multiple custom React hooks to enhance development efficiency:

- **useDebounce**: Debounce implementation for search input optimization
- **useIsMounted**: Safely handle component mount states
- **useMarketStore**: Zustand state management hook for handling market data

## 🔮 AI Analysis Model

The project uses a multi-dimensional analysis model to evaluate market conditions:

- **Sentiment Score**: A scale from -10 to 10, reflecting market sentiment
- **Safety Score**: A scale from 0 to 100, evaluating market risk level
- **Volatility Level**: A scale from 0 to 100, measuring market volatility
- **Market Trend**: Categorized as bullish, bearish, or neutral
- **Industry Sector Analysis**: Detailed analysis of major industries including technology, finance, healthcare, energy, and consumer sectors

## 📝 Current Progress and Future Plans

Completed:

- [x] Basic application architecture design and development
- [x] Supabase authentication system integration
- [x] Market data retrieval and display
- [x] AI market analysis model implementation
- [x] Responsive UI development
- [x] Technical indicator analysis system
- [x] Historical data query and analysis
- [x] Error monitoring and reporting system
- [x] Basic advanced chart view functionality

In Progress:

- [ ] Advanced chart analysis tool improvements
- [ ] Split-adjusted data processing optimization
- [ ] User personal portfolio management
- [ ] Real-time news feed integration
- [ ] Technical indicator visualization optimization

Future Plans:

- [ ] Advanced technical analysis indicators and chart pattern recognition
- [ ] Community features and trading idea sharing
- [ ] Mobile application development
- [ ] Push notification system
- [ ] AI-driven investment recommendation optimization
- [ ] Historical data backtesting tools
- [ ] Personalized portfolio analysis
- [ ] Market anomaly detection system

## 📄 License

[MIT](LICENSE)

## 🙏 Acknowledgements

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Prisma](https://www.prisma.io/)
- [Redis](https://redis.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Yahoo Finance](https://finance.yahoo.com/)
- [EODHD](https://eodhistoricaldata.com/)
- [TradingView Lightweight Charts](https://tradingview.github.io/lightweight-charts/)
- [Sentry](https://sentry.io/)
