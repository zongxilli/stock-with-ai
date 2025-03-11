# 智能股市分析平台

一个基于Next.js、Prisma、Redis和Supabase构建的股市分析应用，利用AI提供市场见解和交易建议。

## ✨ 功能特点

- **市场分析仪表盘** - 直观展示市场趋势、情绪评分和波动性分析
- **投资建议** - 基于AI分析的交易建议和行业洞察
- **全栈技术** - 使用Next.js App Router架构，支持服务端和客户端组件
- **数据持久化** - 通过Prisma ORM连接PostgreSQL数据库
- **高性能缓存** - 使用Redis缓存频繁访问的数据，提升应用性能
- **用户认证** - 基于Supabase的安全用户验证系统
- **响应式UI** - 使用Tailwind CSS和shadcn/ui组件库构建的现代界面
- **深色/浅色模式** - 支持主题切换

## 🚀 快速开始

### 前提条件

- Node.js 18+ 和 npm/yarn
- Supabase账号 (已设置)
- Redis数据库 (本地或云服务，如Redis Cloud)

### 安装步骤

1. 克隆仓库

```bash
git clone https://github.com/your-username/stock-with-ai.git
cd stock-with-ai
```

2. 安装依赖

```bash
npm install
# 或
yarn install
```

3. 配置环境变量

环境变量已配置：

- `.env` - 包含数据库连接信息
- `.env.local` - 包含Supabase认证信息和Redis连接URL

示例 `.env.local` 配置：

```
NEXT_PUBLIC_SUPABASE_URL=你的Supabase_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=你的Supabase密钥
REDIS_URL=redis://default:你的密码@redis-host:port
```

4. 初始化数据库

```bash
# 执行prisma迁移
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

## 📚 项目结构说明

```
stock-with-ai/
├── app/                  # Next.js 13+ App Router目录
│   ├── actions/          # 服务器端动作(Server Actions)
│   │   └── redis-actions.ts # Redis操作动作
│   ├── (auth-pages)/     # 认证相关页面路由组
│   ├── home/             # 首页
│   └── protected/        # 需要登录才能访问的页面
├── components/           # 可复用的React组件
├── lib/                  # 核心库文件
│   ├── prisma.ts         # Prisma客户端初始化
│   ├── redis.ts          # Redis客户端初始化和工具函数
│   ├── services/         # 服务层
│   └── utils.ts          # 通用工具函数
├── prisma/               # Prisma相关文件
│   ├── migrations/       # 数据库迁移文件
│   ├── schema.prisma     # 数据库模型定义
│   └── seeds/            # 数据填充脚本
└── utils/                # 实用工具
    └── supabase/         # Supabase客户端工具
```

## 💡 技术栈简介

- **Next.js**：基于React的全栈框架，支持服务端渲染(SSR)、静态生成(SSG)和客户端渲染
- **Prisma**：现代ORM(对象关系映射)工具，简化数据库操作
- **Redis**：高性能内存数据库，用于缓存和临时数据存储
- **Supabase**：开源的Firebase替代品，提供认证、数据库等服务
- **PostgreSQL**：强大的开源关系型数据库
- **TypeScript**：JavaScript的超集，提供类型检查
- **Tailwind CSS**：实用优先的CSS框架
- **shadcn/ui**：基于Radix UI的组件库，高度可定制

## 📊 数据模型

项目使用的主要数据模型`MarketAnalysis`包含以下字段：

- `id`: UUID - 唯一标识符
- `date`: String - 分析日期
- `summary`: String - 市场总结
- `sentimentScore`: Float - 市场情绪评分
- `safetyScore`: Float - 安全交易评分
- `marketTrend`: String - 市场趋势(看涨/看跌/中性)
- `volatilityLevel`: Float - 波动级别
- `topGainers`: Json - 表现最佳的股票
- `topLosers`: Json - 表现最差的股票
- `keyEvents`: String - 关键市场事件
- `tradingSuggestions`: String - 交易建议
- `sectors`: Json - 行业分析数据

## 🔧 常用命令

```bash
# 开发模式
npm run dev

# 构建项目
npm run build

# 生产环境运行
npm run start

# 数据填充
npm run seed

# 代码风格检查
npm run lint

# 代码风格自动修复
npm run lint:fix
```

## 🗄️ Redis数据管理

本项目使用Redis作为缓存层，提供以下功能：

- 缓存频繁访问的市场分析数据，减少数据库查询
- 存储临时数据和会话信息
- 提高应用响应速度和用户体验

Redis数据操作示例：

```typescript
import { setCache, getCache } from '@/lib/redis';

// 存储数据到Redis (设置1小时过期)
await setCache('market:latest', marketData, 3600);

// 从Redis获取数据
const cachedData = await getCache('market:latest');

// 如果缓存未命中，则从数据库获取
if (!cachedData) {
	// 从数据库获取数据...
}
```

在首页上，你可以使用简单的UI界面操作Redis：

- 添加随机数据到Redis
- 查看当前Redis中的所有数据
- 直观了解Redis的工作机制

## 📝 后续计划

- [ ] 添加实时市场数据API集成
- [ ] 实现个人投资组合管理
- [ ] 开发自动化交易策略测试平台
- [ ] 加入社区功能，分享投资见解
- [ ] 优化移动端体验
- [ ] 扩展Redis缓存策略，提升应用性能
- [ ] 实现Redis缓存与数据库之间的数据同步

## 📄 许可证

[MIT](LICENSE)

## 🙏 致谢

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Prisma](https://www.prisma.io/)
- [Redis](https://redis.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
