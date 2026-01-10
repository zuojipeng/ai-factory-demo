# Project Specification

## 1. 技术栈约束

### 必须使用
- **框架**: Next.js 14+ (App Router)
- **语言**: TypeScript (strict mode)
- **样式**: Tailwind CSS 3.x
- **数据库**: Prisma + PostgreSQL
- **部署**: Vercel / Codex Cloud

### 禁止使用
- JavaScript (必须全部 TypeScript)
- CSS-in-JS 库 (只用 Tailwind)
- Class 组件 (只用 Function 组件)

## 2. 目录结构规范
src/
├── app/
│   ├── api/          # API 路由
│   ├── (routes)/     # 页面路由
│   └── layout.tsx    # 根布局
├── components/       # 可复用组件
├── lib/             # 工具函数
└── types/           # TypeScript 类型定义


## 3. 代码质量标准

### 必须遵守
- [ ] 严禁使用 `any` 类型
- [ ] 每个 API 必须有完整的错误处理
- [ ] 所有组件必须有 Props 类型定义
- [ ] 必须通过 `npm run lint` 无警告
- [ ] 必须通过 `npm run type-check`

### 命名规范
- 组件: PascalCase (UserProfile.tsx)
- 函数: camelCase (getUserData)
- 常量: UPPER_SNAKE_CASE (API_BASE_URL)

## 4. API 设计规范

### 成功响应格式
```json
{
  "success": true,
  "data": { ... }
}
```

### 错误响应格式
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

### 状态码使用
- 200: 成功
- 201: 创建成功
- 400: 客户端错误
- 401: 未授权
- 500: 服务器错误

## 5. Git 分支规范

### 分支命名约定
- **格式**: `feature/task-{TASK_ID}`
- **示例**:
  - TASK-004 → `feature/task-004`
  - TASK-007 → `feature/task-007`
  - TASK-015 → `feature/task-015`

### 分支创建规则
- [ ] 每个任务必须在独立分支上开发
- [ ] 分支名必须严格遵循 `feature/task-{TASK_ID}` 格式
- [ ] 任务 ID 使用三位数字（如 004, 007, 015）
- [ ] 完成后通过 PR 合并到 main 分支

## 6. 测试要求

每个 API 必须包含：
- [ ] 正常流程测试
- [ ] 错误处理测试
- [ ] 边界条件测试