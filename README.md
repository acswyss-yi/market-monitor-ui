# Market Monitor UI

[Market Monitor](../Market%20Monitor) 的前端项目，基于 React + Ant Design 构建的实时行情监控与预警规则管理界面。

**Demo：** http://8.149.245.12:5173/

## 功能特性

- **Dashboard**：实时展示活跃规则数、今日触发次数、在监资产数，以及当前缓存行情价格
- **预警规则管理**：创建、编辑、删除、启用/禁用价格预警规则
- **市场行情**：展示全量缓存价格，支持按资产类型和 Symbol 过滤
- 行情数据每 15 秒自动刷新，规则列表每 30 秒自动刷新

## 技术栈

- React 18 + TypeScript
- Ant Design 5
- TanStack React Query（数据请求与缓存）
- React Router 6
- Axios
- Vite

## 快速启动

### 前置要求

- Node.js 18+
- 后端服务运行在 `http://localhost:8090`（参见 [Market Monitor](../Market%20Monitor)）

### 本地运行

```bash
npm install
npm run dev
```

开发服务器运行在 `http://localhost:5173`，`/api/` 请求自动代理至后端。

### 生产构建

```bash
npm run build
```

构建产物输出至 `dist/`。

### Docker 运行

```bash
docker build -t market-monitor-ui .
docker run -d -p 80:80 --name market-monitor-ui market-monitor-ui
```

Nginx 将 `/api/` 请求代理至 `http://market-monitor:8090`（Docker 服务名）。

## 项目结构

```
src/
├── main.tsx          # 入口，React Query 全局配置
├── App.tsx           # 布局与路由
├── pages/
│   ├── Dashboard.tsx     # 概览页
│   ├── AlertRules.tsx    # 预警规则管理
│   └── MarketPrices.tsx  # 行情浏览
├── api/
│   └── index.ts      # Axios 实例与所有 API 函数
└── types/
    └── index.ts      # TypeScript 类型定义
```

## 页面说明

### Dashboard

- 统计卡片：活跃规则数 / 今日触发次数 / 在监资产数
- 行情价格卡片：展示后端缓存的实时价格，每 15 秒刷新
- 近期触发记录：最近被触发的预警规则列表

### 预警规则

| 字段 | 说明 |
|------|------|
| 资产类型 | `CRYPTO`（加密货币）或 `STOCK`（美股） |
| Symbol | 加密货币填 CoinGecko ID（如 `bitcoin`），美股填 Ticker（如 `AAPL`） |
| 触发条件 | `ABOVE`（高于阈值）或 `BELOW`（低于阈值） |
| 通知渠道 | `EMAIL` 或 `DINGTALK` |
| 通知目标 | 邮件地址或钉钉 Webhook URL |
| 冷却时间 | 两次通知的最小间隔（分钟），防止重复告警 |

### 市场行情

- 以卡片网格展示所有缓存价格
- 支持按 Symbol 搜索与资产类型筛选
- 每 15 秒自动刷新