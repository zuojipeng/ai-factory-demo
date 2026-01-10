# Codex Cloud 使用指南

本项目使用 Codex Cloud 执行 PLAN.md 中的任务。

## 🎯 快速开始

在 Claude Code CLI 中使用 sdcl-mode skill：

```
使用 sdcl-mode 执行任务
```

sdcl-mode 会自动：
- ✅ 读取 PLAN.md 找到下一个任务
- ✅ 读取 SPEC.md 获取项目规范
- ✅ 提交任务到 Codex Cloud
- ✅ 监控任务完成
- ✅ 验证并更新状态

## 📋 项目规范文件

### SPEC.md
定义项目的技术规范，Codex 必须严格遵守：
- 技术栈要求
- 代码质量标准
- 命名规范
- **分支命名规范**（重要！）
- API 设计规范

### PLAN.md
任务清单，格式：
```markdown
- [ ] TASK-001: 任务描述
- [x] TASK-002: 已完成的任务
```

### .codex-env
Codex Cloud 环境配置（不提交到 Git）：
```bash
CODEX_ENV_ID=your-environment-id
```

## 🚨 重要规范

### 分支命名（CRITICAL）

**所有 Codex 任务必须使用以下分支格式：**

```
feature/task-{TASK_ID}
```

示例：
- TASK-004 → `feature/task-004`
- TASK-007 → `feature/task-007`

**注意**：这是强制性要求，验证流程依赖此命名规范。

## 📂 项目结构

```
ai-factory-demo/
├── .codex-env          # Codex 环境配置
├── SPEC.md             # 项目技术规范
├── PLAN.md             # 任务清单
├── CODEX_GUIDE.md      # 本文件
├── scripts/
│   ├── validator.sh           # 项目特定验证
│   └── monitor_cloud_task.sh  # 任务监控（可选）
└── logs/
    └── completion.log         # 任务完成记录
```

## 🔧 验证脚本（可选）

### validator.sh
项目特定的验证逻辑：

```bash
./scripts/validator.sh <TASK_ID>
```

功能：
- TypeScript 类型检查
- ESLint 检查
- 任务特定验证（如检查 Prisma schema）

## 💡 最佳实践

1. **保持 SPEC.md 详细且明确**
   - 列出所有技术约束
   - 明确禁止的做法
   - 详细的代码规范

2. **PLAN.md 任务要清晰**
   - 每个任务独立完整
   - 描述具体明确
   - 按依赖关系排序

3. **让 sdcl-mode 处理自动化**
   - 不需要手动构建提示词
   - 不需要手动修正分支
   - 不需要手动更新 PLAN.md

4. **在浏览器查看 Codex 进度**
   - sdcl-mode 会提供任务 URL
   - 实时了解代码生成过程

## ❓ 常见问题

### Q: Codex 创建的分支名不对怎么办？

A: sdcl-mode 会自动检测并修正分支名。如果出现问题，检查 SPEC.md 中的分支命名规范是否明确。

### Q: 如何确保 Codex 遵循项目规范？

A: 在 SPEC.md 中详细列出所有规范，sdcl-mode 会将 SPEC.md 内容包含在提示词中。

### Q: 本地修改了代码需要手动推送吗？

A: 不需要。sdcl-mode 在执行下一个任务前会自动同步本地修改到远程。

## 📚 相关文档

- [SPEC.md](./SPEC.md) - 项目技术规范
- [PLAN.md](./PLAN.md) - 任务清单
- Codex Cloud: https://chatgpt.com/codex
