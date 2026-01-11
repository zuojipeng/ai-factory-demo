# Project Specification

> **⚠️ Codex Cloud 执行规范 - 必读**
>
> 如果你是 Codex Cloud 代理在执行任务，请务必阅读并遵守本规范的所有要求。

## 0. Codex Cloud 执行要求

### 📦 项目仓库配置

**仓库地址**：`git@github.com:zuojipeng/ai-factory-demo.git`

**重要**：在推送代码前，必须确保已配置远程仓库。执行以下命令检查并配置：

```bash
# 添加 GitHub 到 known_hosts（避免首次连接提示）
ssh-keyscan github.com >> ~/.ssh/known_hosts 2>/dev/null

# 检查是否已配置远程仓库
git remote -v

# 如果为空，则配置远程仓库（使用 SSH 协议）
git remote add origin git@github.com:zuojipeng/ai-factory-demo.git
```

### 🚨 分支命名规范（CRITICAL - 最高优先级）

**强制要求：必须使用以下分支命名格式**

```bash
git checkout -b feature/task-{TASK_ID}
```

**示例：**
- 执行 TASK-004 → 分支名必须是 `feature/task-004`
- 执行 TASK-007 → 分支名必须是 `feature/task-007`
- 执行 TASK-015 → 分支名必须是 `feature/task-015`

**重要说明：**
- ❌ 不能使用 `codex/` 前缀
- ❌ 不能自己创造分支名
- ❌ 不能使用任务描述作为分支名
- ✅ 必须严格使用 `feature/task-{TASK_ID}` 格式
- ✅ TASK_ID 使用三位数字（如 004, 007, 015）

**执行流程：**
1. 开始工作前，先创建并切换到正确的分支
2. 在该分支上完成所有开发工作
3. 提交代码到该分支
4. 推送到远程仓库

### 提交信息规范

```
Complete TASK-{TASK_ID}: {任务描述}
```

示例：
```
Complete TASK-004: 创建 User 数据模型
```

### 工作流程

1. **创建分支**：`git checkout -b feature/task-{TASK_ID}`
2. **开发代码**：按照下面的技术规范完成任务
3. **运行检查**：确保通过 `npm run lint` 和 `npm run type-check`
4. **提交代码**：使用规范的提交信息
5. **配置远程**（如需要）：
   ```bash
   # 添加 GitHub 到 known_hosts
   ssh-keyscan github.com >> ~/.ssh/known_hosts 2>/dev/null

   # 检查远程仓库配置
   git remote -v
   # 如果为空，则添加远程仓库（使用 SSH 协议）
   git remote add origin git@github.com:zuojipeng/ai-factory-demo.git
   ```
6. **推送远程**：`git push -u origin feature/task-{TASK_ID}`

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

## 5. 测试要求

每个 API 必须包含：
- [ ] 正常流程测试
- [ ] 错误处理测试
- [ ] 边界条件测试