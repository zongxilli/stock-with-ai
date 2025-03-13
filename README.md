# Smart Stock Market Analysis Platform

A stock market analysis application built with Next.js, Prisma, Redis, and Supabase, leveraging AI to provide market insights and trading recommendations.

## ✨ Features

- **Market Analysis Dashboard** - Intuitive visualization of market trends, sentiment scores, and volatility analysis
- **Real-time Market Data** - Track futures and commodities with auto-refreshing data (5-second intervals)
- **Investment Recommendations** - AI-powered trading suggestions and sector insights
- **Dark/Light Mode** - Theme switching for comfortable viewing in any environment
- **Full-stack Architecture** - Using Next.js App Router with server and client components
- **Data Persistence** - PostgreSQL database managed through Prisma ORM
- **High-performance Caching** - Redis for frequently accessed data, improving application performance
- **Secure Authentication** - User authentication system based on Supabase
- **Responsive UI** - Modern interface built with Tailwind CSS and shadcn/ui component library

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account (set up)
- Redis database (local or cloud service like Redis Cloud)

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

Environment variables are already configured:

- `.env` - Contains database connection information
- `.env.local` - Contains Supabase authentication info and Redis connection URL

Example `.env.local` configuration:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
REDIS_URL=redis://default:your_password@redis-host:port
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
# or
yarn dev
```

6. Open your browser and visit [http://localhost:3000](http://localhost:3000)

## 📚 Project Structure

```
smart-stock-analysis/
├── app/                  # Next.js 13+ App Router directory
│   ├── actions/          # Server Actions
│   │   ├── marketAnalysis.ts    # Market data actions
│   │   ├── redis-actions.ts     # Redis operations
│   │   └── yahoo-finance2-actions.ts # Yahoo Finance API integration
│   ├── (auth-pages)/     # Authentication-related page routes
│   ├── home/             # Home page and components
│   └── protected/        # Pages requiring authentication
├── components/           # Reusable React components
│   ├── custom/           # Custom components like cards and market elements
│   └── ui/               # UI components from shadcn/ui
├── hooks/                # Custom React hooks
├── lib/                  # Core library files
│   ├── prisma.ts         # Prisma client initialization
│   ├── redis.ts          # Redis client initialization and utility functions
│   ├── services/         # Service layer
│   └── utils.ts          # General utility functions
├── prisma/               # Prisma-related files
│   ├── migrations/       # Database migration files
│   ├── schema.prisma     # Database model definitions
│   └── seeds/            # Data seeding scripts
├── stores/               # State management with Zustand
└── utils/                # Utility tools
    └── supabase/         # Supabase client utilities
```

## 💡 Technology Stack

- **Next.js**: Full-stack React framework supporting SSR, SSG, and client-side rendering
- **Prisma**: Modern ORM tool simplifying database operations
- **Redis**: High-performance in-memory database for caching and temporary data storage
- **Supabase**: Open-source Firebase alternative providing authentication and database services
- **PostgreSQL**: Powerful open-source relational database
- **TypeScript**: JavaScript superset providing type checking
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Component library based on Radix UI, highly customizable
- **Zustand**: Lightweight state management solution
- **Yahoo Finance API**: Real-time financial data integration
- **Recharts**: Composable charting library for data visualization

## 📊 Data Models

The main data model `MarketAnalysis` includes the following fields:

- `id`: UUID - Unique identifier
- `date`: String - Analysis date
- `summary`: String - Market summary
- `sentimentScore`: Float - Market sentiment score
- `safetyScore`: Float - Safety trading score
- `marketTrend`: String - Market trend (bullish/bearish/neutral)
- `volatilityLevel`: Float - Volatility level
- `topGainers`: Json - Best-performing stocks
- `topLosers`: Json - Worst-performing stocks
- `keyEvents`: String - Key market events
- `tradingSuggestions`: String - Trading recommendations
- `sectors`: Json - Industry sector analysis data

## 🔧 Common Commands

```bash
# Development mode
npm run dev

# Build project
npm run build

# Production run
npm run start

# Database seeding
npm run seed

# Code style check
npm run lint

# Automatic code style fix
npm run lint:fix
```

## 🗄️ Redis Data Management

This project uses Redis as a caching layer, providing the following features:

- Caching frequently accessed market analysis data, reducing database queries
- Storing temporary data and session information
- Improving application response speed and user experience

Redis data operations example:

```typescript
import { setCache, getCache } from '@/lib/redis';

// Store data in Redis (set 1-hour expiration)
await setCache('market:latest', marketData, 3600);

// Get data from Redis
const cachedData = await getCache('market:latest');

// If cache miss, get from database
if (!cachedData) {
	// Get data from database...
}
```

On the home page, real-time market data is cached for 4 seconds to balance freshness and performance.

## 📈 Real-time Market Data

The platform integrates with Yahoo Finance API to provide real-time updates on:

- **Futures Markets**: S&P, Dow, Nasdaq, and Russell 2000
- **Commodities**: Crude Oil and Gold

Data is refreshed automatically every 5 seconds to provide timely market information.

## 📝 Future Plans

- [ ] Enhanced AI analysis with predictive capabilities
- [ ] Personal portfolio management
- [ ] Automated trading strategy testing platform
- [ ] Community features for sharing investment insights
- [ ] Mobile app development
- [ ] Advanced Redis caching strategies for improved performance
- [ ] Data synchronization between Redis cache and database
- [ ] Additional technical indicators and chart patterns recognition

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
