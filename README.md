# Stock With AI 📈 智能股票市场分析平台

一个先进的股票市场分析应用，基于Next.js 14、Prisma、Redis和Supabase构建，结合AI技术提供实时市场洞察和个性化交易建议。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![React](https://img.shields.io/badge/React-19-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6)

<p align="center">
  <img src="https://via.placeholder.com/800x400?text=Stock+With+AI+Dashboard" alt="Stock With AI Dashboard" />
</p>

## 🌟 主要特点

- **实时市场数据** - 自动刷新的股票、指数和商品市场数据（5秒间隔）
- **专业交互式图表** - 多时间范围（日内到5年）的高级股票价格图表
- **AI驱动的市场分析** - 智能分析市场趋势、情绪和波动性，提供每日市场总结
- **技术指标分析** - 支持超过20种专业技术指标（RSI、MACD、布林带等）
- **智能搜索功能** - 实时股票搜索，支持多种金融工具类型
- **完整行业板块分析** - 详细的行业板块表现分析和前景展望
- **高性能缓存策略** - 基于Redis的多层缓存系统，优化数据加载速度
- **完全响应式设计** - 从移动设备到桌面的全面自适应界面
- **深色/浅色主题** - 支持主题切换，适应不同使用场景

## 🚀 快速开始

### 前提条件

- Node.js 18+
- Supabase账号（用于认证功能）
- Redis数据库（本地或云服务）
- PostgreSQL数据库（由Prisma管理）

### 安装步骤

1. **克隆仓库**

```bash
git clone https://github.com/zongxilli/stock-with-ai.git
cd stock-with-ai
```

2. **安装依赖**

```bash
npm install
```

3. **配置环境变量**

创建`.env.local`文件并添加以下必要配置：

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
REDIS_URL=redis://default:your_password@redis-host:port
DATABASE_URL=postgresql://user:password@host:port/dbname
DIRECT_URL=postgresql://user:password@host:port/dbname
EODHD_API_KEY=your_eodhd_api_key
SENTRY_DSN=your_sentry_dsn
```

4. **数据库初始化**

```bash
# 运行Prisma迁移
npx prisma migrate dev

# 填充示例数据
npm run seed
```

5. **启动开发服务器**

```bash
# 使用Turbopack加速开发（推荐）
npm run dev

# 或不使用Turbopack
npm run dev:non-turbopack
```

6. **访问应用**

打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 💻 核心功能详解

### 市场数据仪表板

首页展示关键市场指标和实时数据，包括：

- **主要市场指数** - 标普500、道琼斯、纳斯达克等
- **商品期货** - 原油、黄金等关键商品价格
- **加密货币** - 比特币和主要加密货币价格
- **债券市场** - 10年期美国国债收益率等
- **自动数据刷新** - 每5秒更新一次，确保实时数据准确性

### AI市场分析系统

应用集成了先进的AI分析模型，提供：

- **市场总结报告** - 每日市场状况的简明概述
- **多维情绪分析** - 使用-10到10的量表评估市场情绪
- **风险评估** - 0-100的安全评分指标
- **波动性监测** - 量化市场波动程度
- **领涨领跌股分析** - 实时识别表现最佳和最差的股票
- **关键事件追踪** - 分析重要新闻和事件对市场的影响

### 高级股票详情页

每个股票详情页提供全面的数据和分析：

- **基本价格数据** - 实时价格、涨跌幅、成交量等
- **多时间范围图表** - 支持从1天到5年的不同时间视图
- **关键价格指标** - 日内高低价、52周高低价等
- **公司基本面数据** - 市值、PE比率、股息等
- **拆分调整数据** - 显示和分析历史拆分调整数据
- **高级图表模式** - 通过切换开关启用更丰富的图表功能

### 技术指标分析套件

支持多种专业技术指标分析：

- **动量指标** - RSI（相对强弱指标）、随机指标等
- **趋势指标** - MACD、移动平均线（SMA、EMA、WMA）
- **波动性指标** - 布林带、ATR（真实波动幅度）
- **其他高级指标** - ADX（平均方向指数）、CCI（商品通道指数）等
- **可视化分析** - 直观展示各种技术指标结果

### 用户账户与设置

基于Supabase的用户系统提供：

- **安全认证** - 邮箱注册和登录功能
- **个人资料管理** - 用户信息维护
- **偏好设置** - 界面和分析偏好定制
- **语言偏好** - 多语言支持（中文/英文）

## 🛠️ 架构与技术栈

### 前端技术

- **Next.js 14** - 全栈React框架，使用App Router
- **React 19** - 前端UI库的最新版本
- **TypeScript** - 类型安全的JavaScript超集
- **TailwindCSS** - 实用优先的CSS框架
- **shadcn/ui** - 高度可定制的UI组件库
- **TradingView轻量级图表** - 专业金融图表库

### 后端技术

- **Server Actions** - Next.js 14的服务器端操作
- **Prisma 6** - 现代化ORM工具
- **Redis** - 高性能缓存解决方案
- **PostgreSQL** - 强大的关系型数据库
- **Supabase** - 开源后端服务平台提供认证
- **Sentry** - 错误监控和性能分析

### 数据源和API

- **Yahoo Finance API** - 财经市场实时数据
- **EODHD API** - 高质量金融历史数据和技术指标
- **OpenAI API** - 先进的AI分析和内容生成

### 状态管理与优化

- **Zustand** - 轻量级状态管理
- **React Query** - 数据获取和缓存
- **数据缓存策略** - 多层次的Redis缓存架构

## 📚 文件结构概览

```
stock-with-ai/
├── app/                   # Next.js App Router目录
│   ├── actions/           # 服务器操作
│   │   ├── eodhd/         # EODHD API相关操作
│   │   ├── redis/         # Redis缓存操作
│   │   ├── yahoo/         # Yahoo财经API操作
│   │   └── ...
│   ├── (auth-pages)/      # 认证相关页面
│   ├── account/           # 用户账户管理
│   ├── home/              # 首页和组件
│   ├── stock/             # 股票详情页
│   │   └── [symbol]/      # 动态路由股票页面
│   │       ├── components/  # 股票页面组件
│   │       └── page.tsx   # 股票详情页面
│   ├── api/               # API路由
│   └── ...
├── components/            # 可重用组件
│   ├── custom/            # 自定义组件
│   ├── ui/                # shadcn/ui组件
│   └── ...
├── hooks/                 # 自定义React钩子
├── lib/                   # 核心库文件
├── prisma/                # Prisma数据库配置
├── stores/                # 状态管理
├── public/                # 静态资源
└── ...
```

## 🔧 高级配置

### 缓存策略设置

应用使用多层缓存策略优化性能：

- **短期缓存** - 实时市场数据缓存4秒
- **中期缓存** - 图表数据根据时间范围从1分钟到1小时不等
- **长期缓存** - 搜索结果缓存24小时

要自定义缓存时间，可以修改`app/actions/redis/`目录下相关文件中的TTL值。

### 图表配置

高级图表视图可以通过以下方式配置：

1. 检查用户偏好设置中的`advancedView`选项
2. 修改`app/stock/[symbol]/components/stock-chart-advanced/chart-options.ts`文件自定义图表属性

### 错误监控

Sentry集成提供全面的错误监控：

1. 确保在`.env.local`中设置了`SENTRY_DSN`
2. 可通过`sentry.client.config.ts`和`sentry.server.config.ts`文件调整监控配置

## 📊 数据获取与处理

### 实时数据流

应用使用多种技术确保数据实时性：

- **轮询机制** - 根据市场状态自动调整轮询频率（交易时段5秒，非交易时段更长）
- **缓存优化** - 使用Redis减少对外部API的请求次数
- **增量更新** - 只更新变化的数据，减少网络负载

### AI分析流程

AI分析功能通过以下步骤工作：

1. 收集综合股票数据（价格、指标、新闻等）
2. 将数据发送到OpenAI或DeepSeek API进行分析
3. 使用流式响应实时展示分析进度
4. 处理和格式化返回的分析结果
5. 缓存分析结果以优化性能

## 🔮 未来计划

- [ ] **高级图表分析工具完善** - 添加更多专业图表工具和模式识别
- [ ] **用户投资组合管理** - 个人投资组合跟踪和分析功能
- [ ] **实时新闻集成** - 直接整合财经新闻源
- [ ] **社区功能** - 允许用户分享交易想法和策略
- [ ] **移动应用开发** - 打造原生移动体验
- [ ] **推送通知系统** - 价格警报和重要事件提醒
- [ ] **历史数据回测工具** - 交易策略回测功能
- [ ] **市场异常检测系统** - 自动识别市场异常模式

## 📝 贡献指南

欢迎贡献代码、报告问题或提出新功能建议。请遵循以下步骤：

1. Fork仓库
2. 创建您的特性分支 (`git checkout -b feature/amazing-feature`)
3. 提交您的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开Pull Request

## 📄 许可证

本项目采用MIT许可证 - 详情请见[LICENSE](LICENSE)文件

## 🙏 致谢

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Prisma](https://www.prisma.io/)
- [Redis](https://redis.io/)
- [TailwindCSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Yahoo Finance](https://finance.yahoo.com/)
- [EODHD](https://eodhistoricaldata.com/)
- [TradingView Lightweight Charts](https://tradingview.github.io/lightweight-charts/)
- [Sentry](https://sentry.io/)

---

<p align="center">
  <b>📫 联系方式</b><br>
  如果您有任何问题或建议，请随时联系我们<br>
  <a href="mailto:example@domain.com">Email</a> | 
  <a href="https://github.com/zongxilli">GitHub</a>
</p>
