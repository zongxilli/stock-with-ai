# Smart Stock Market Analysis Platform

一个基于Next.js 14、Prisma、Redis和Supabase构建的股票市场分析应用，利用AI提供市场洞察和交易建议。

## ✨ 功能特点

- **实时市场数据仪表板** - 自动刷新的股票、期货和商品市场数据（5秒间隔）
- **交互式图表** - 多时间范围的专业股票价格图表，包括日内、周、月、年视图
- **智能搜索** - 实时股票搜索功能，支持股票、ETF、指数和加密货币
- **AI市场分析** - 智能分析市场趋势、情绪和波动性，提供每日市场总结和交易建议
- **行业板块分析** - 详细的行业板块表现分析，包括表现得分和前景展望
- **深色/浅色模式** - 支持主题切换，适合各种使用环境
- **响应式设计** - 完全兼容移动端和桌面端的现代用户界面
- **高性能架构** - 利用Redis缓存提升应用性能和响应速度
- **用户认证系统** - 基于Supabase的安全身份验证和用户管理

## 🚀 快速开始

### 前提条件

- Node.js 18+和npm/yarn
- Supabase账号（已设置）
- Redis数据库（本地或云服务如Redis Cloud）
- PostgreSQL数据库（由Prisma管理）

### 安装步骤

1. 克隆仓库

```bash
git clone https://github.com/your-username/smart-stock-analysis.git
cd smart-stock-analysis
```

2. 安装依赖

```bash
npm install
# 或
yarn install
```

3. 配置环境变量

创建`.env.local`文件并添加以下内容：

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
REDIS_URL=redis://default:your_password@redis-host:port
DATABASE_URL=postgresql://user:password@host:port/dbname
DIRECT_URL=postgresql://user:password@host:port/dbname
```

4. 初始化数据库

```bash
# 运行prisma迁移
npx prisma migrate dev

# 填充示例数据
npm run seed
```

5. 运行开发服务器

```bash
npm run dev
# 或
yarn dev
```

6. 打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 📚 项目结构

```
smart-stock-analysis/
├── app/                  # Next.js App Router目录
│   ├── actions/          # 服务器操作（Server Actions）
│   │   ├── marketAnalysis.ts      # 市场分析数据操作
│   │   ├── redis-actions.ts       # Redis数据操作
│   │   ├── user/                  # 用户相关操作
│   │   └── yahoo/                 # Yahoo财经API相关操作
│   │       ├── get-stock-realtime-data.ts  # 实时股票数据获取
│   │       ├── get-volatile-stocks.ts      # 波动性股票获取
│   │       ├── get-stock-chart-data.ts     # 股票图表数据获取
│   │       ├── get-main-indices.ts         # 主要指数数据获取
│   │       └── utils/                      # Yahoo API工具函数
│   ├── (auth-pages)/     # 认证相关页面
│   ├── auth/             # 认证相关API和组件
│   ├── home/             # 首页和相关组件
│   ├── account/          # 用户账户管理页面
│   ├── stock/            # 股票详情页
│   │   └── [symbol]/     # 动态路由股票页面
│   │       └── components/  # 股票页面组件
│   ├── api/              # API路由
│   ├── protected/        # 需要认证的页面
│   ├── error.tsx         # 错误处理组件
│   ├── global-error.tsx  # 全局错误处理
│   └── not-found.tsx     # 404页面
├── components/           # 可重用React组件
│   ├── custom/           # 自定义组件
│   ├── ui/               # shadcn/ui组件
│   ├── error/            # 错误处理相关组件
│   ├── typography/       # 排版相关组件
│   ├── stock-search.tsx  # 股票搜索组件
│   ├── theme-switcher.tsx # 主题切换组件
│   ├── header-auth.tsx   # 带认证的头部组件
│   └── submit-button.tsx # 提交按钮组件
├── hooks/                # 自定义React钩子
│   ├── useDebounce.tsx   # 防抖钩子
│   └── useIsMounted.tsx  # 挂载状态钩子
├── lib/                  # 核心库文件
│   ├── prisma.ts         # Prisma客户端
│   ├── redis.ts          # Redis客户端和工具
│   ├── services/         # 服务层
│   │   └── marketAnalysisService.ts # 市场分析服务
│   └── utils.ts          # 工具函数
├── prisma/               # Prisma相关文件
│   ├── migrations/       # 数据库迁移
│   ├── schema.prisma     # 数据库模型
│   └── seeds/            # 数据填充脚本
├── stores/               # 状态管理
│   └── marketStore.ts    # 市场数据状态存储
├── utils/                # 工具函数
│   └── supabase/         # Supabase客户端
├── middleware.ts         # Next.js中间件（用于路由保护等）
├── tailwind.config.ts    # Tailwind CSS配置
├── next.config.ts        # Next.js配置
└── eslint.config.js      # ESLint配置
```

## 💡 技术栈

- **Next.js 14**: 全栈React框架，带App Router
- **React 19**: 前端UI库
- **TypeScript**: 类型安全的JavaScript
- **Prisma**: 现代ORM工具简化数据库操作
- **PostgreSQL**: 强大的关系型数据库
- **Redis**: 高性能缓存解决方案
- **Supabase**: 开源后端服务平台，提供认证
- **Tailwind CSS**: 实用优先的CSS框架
- **shadcn/ui**: 高度可定制的UI组件库
- **Zustand**: 轻量级状态管理
- **Yahoo Finance API**: 实时金融数据
- **Recharts**: 强大的React图表库

## 📊 主要功能详解

### 首页市场概览

首页展示主要市场指数和实时数据，包括：

- 标普500、道琼斯、纳斯达克期货
- 罗素2000指数
- 原油和黄金期货
- 比特币价格
- 10年期美国国债收益率

数据每5秒自动刷新，使用Zustand进行状态管理，确保用户获得最新的市场信息。

### AI市场分析

系统利用AI分析每日市场数据，提供以下见解：

- 市场总结：对当日市场情况的简明概述
- 情绪分析：量化市场整体情绪的得分指标
- 安全评估：市场交易风险水平分析
- 波动性监测：市场波动程度的量化指标
- 领涨领跌股：当日表现最佳和最差的股票列表
- 关键事件：影响市场的重要新闻和事件
- 交易建议：基于市场分析的投资策略建议
- 行业板块分析：各主要行业的表现和前景评估

### 股票详情页

股票详情页提供全面的个股信息：

- 基本价格数据（当前价格、涨跌幅、交易量）
- 交互式价格图表，支持多个时间范围（1天到5年）
- 日内高低价、52周高低价等关键指标
- 灵活的图表UI，支持深色/浅色主题

### 全局搜索功能

应用顶部的搜索栏支持查找各类金融工具：

- 股票、ETF、指数和加密货币
- 实时搜索建议
- 搜索结果分类显示
- 键盘导航支持

### 用户账户管理

基于Supabase的用户管理系统：

- 安全的邮箱注册和登录
- 用户资料管理
- 个性化设置管理
- 账户安全控制

### 自适应设计

- 完全响应式界面，适配从手机到桌面的各种设备尺寸
- 针对小屏幕优化的组件布局
- 自动调整的图表尺寸
- 优化的触摸操作支持

### 数据缓存策略

应用利用Redis实现高效的数据缓存：

- 短期缓存实时市场数据（4秒）
- 中等期限缓存图表数据（根据时间范围从1分钟到1小时不等）
- 长期缓存搜索结果（24小时）
- AI分析结果缓存（按日期）

这种分层缓存策略显著提高了应用性能和用户体验。

## 🧰 自定义钩子

项目包含多个自定义React钩子，提升开发效率：

- **useDebounce**: 防抖实现，用于搜索输入优化
- **useIsMounted**: 安全处理组件挂载状态
- **useMarketStore**: Zustand状态管理钩子，处理市场数据

## 🔮 AI分析模型

项目使用多维度分析模型，评估市场状况：

- **情绪评分(Sentiment Score)**: 从-10到10的量表，反映市场情绪
- **安全评分(Safety Score)**: 从0到100的量表，评估市场风险水平
- **波动性指标(Volatility Level)**: 从0到100的量表，衡量市场波动程度
- **市场趋势(Market Trend)**: 分为看涨(bullish)、看跌(bearish)和中性(neutral)
- **行业板块分析**: 对技术、金融、医疗、能源和消费等主要行业提供详细分析

## 📝 当前进度和未来计划

已完成:

- [x] 基础应用架构设计和开发
- [x] Supabase认证系统集成
- [x] 市场数据获取和显示
- [x] AI市场分析模型实现
- [x] 响应式UI开发

进行中:

- [ ] 高级图表分析工具开发
- [ ] 用户个人投资组合管理
- [ ] 实时新闻流集成

未来计划:

- [ ] 高级技术分析指标和图表模式识别
- [ ] 社区功能和交易想法分享
- [ ] 移动应用开发
- [ ] 推送通知系统
- [ ] AI驱动的投资建议优化
- [ ] 历史数据回测工具

## 📄 许可证

[MIT](LICENSE)

## 🙏 致谢

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Prisma](https://www.prisma.io/)
- [Redis](https://redis.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Yahoo Finance](https://finance.yahoo.com/)
