# Codex 任务提交指南

## 分支命名规范

**所有任务必须遵循以下分支命名格式：**

```
feature/task-{TASK_ID}
```

其中 `{TASK_ID}` 为三位数字的任务编号（如 004, 007, 015）

## 如何使用 Codex 执行 PLAN.md 中的任务

### 步骤 1: 确定任务编号

查看 `PLAN.md` 找到下一个待执行的任务，例如：
```
- [ ] TASK-004: 创建 User 数据模型
```

### 步骤 2: 准备任务描述

在提交给 Codex 时，**必须明确指定分支名称**。使用以下格式：

```
请执行 TASK-004：创建 User 数据模型

重要要求：
1. 必须在分支 feature/task-004 上进行开发
2. 遵循 SPEC.md 中的所有技术规范
3. 完成后创建 PR 合并到 main 分支

请参考 PLAN.md 和 SPEC.md 中的要求完成此任务。
```

### 步骤 3: 提交到 Codex Cloud

```bash
# 方法 1: 使用 codex cloud 交互式提交
codex cloud

# 方法 2: 直接在 Claude Code CLI 中提交任务
# 输入上面准备好的任务描述
```

### 步骤 4: 监控任务进度

使用监控脚本跟踪任务状态：

```bash
# 语法：
./scripts/monitor_cloud_task.sh <TASK_ID> <LOG_FILE>

# 示例：
./scripts/monitor_cloud_task.sh 004 ./logs/task-004.log
```

监控脚本会：
- 检查分支是否按规范创建（`feature/task-004`）
- 自动拉取并验证代码
- 运行本地测试
- 检查 PR 状态

## 常见问题

### Q: Codex 创建的分支名称不符合规范怎么办？

**A:** 这是因为任务描述中没有明确要求使用特定分支名。解决方法：

1. **在任务描述中明确指定分支名称**（推荐）：
   ```
   请在分支 feature/task-004 上完成此任务
   ```

2. **手动重命名分支**（不推荐）：
   ```bash
   git checkout codex/wrong-branch-name
   git branch -m feature/task-004
   git push origin feature/task-004
   git push origin :codex/wrong-branch-name  # 删除远程错误分支
   ```

### Q: 如何确保 Codex 遵循项目规范？

**A:** 在任务描述中明确引用规范文档：

```
请执行 TASK-XXX：任务描述

要求：
1. 严格遵循 SPEC.md 中定义的所有规范
2. 在分支 feature/task-XXX 上开发
3. 参考 PLAN.md 了解任务上下文
```

### Q: 监控脚本报错"未找到预期分支"怎么办？

**A:** 原因是分支命名不符合 `feature/task-{TASK_ID}` 格式。检查：

1. 远程分支名称：
   ```bash
   git fetch origin
   git branch -r | grep task
   ```

2. 如果分支名称错误，按照上面的方法重命名

## 任务提交模板

为方便使用，这里提供一个标准模板：

```
请执行 TASK-{TASK_ID}：{任务描述}

分支要求：
- 必须在分支 feature/task-{TASK_ID} 上进行开发

技术要求：
- 严格遵循 SPEC.md 中的所有规范
- 使用 TypeScript strict mode
- 使用 Tailwind CSS 进行样式设计
- 确保通过 npm run lint 和 npm run type-check

完成标准：
- 代码实现符合需求
- 通过所有代码质量检查
- 创建 PR 合并到 main 分支

请参考 PLAN.md 和 SPEC.md 完成此任务。
```

## 验证清单

任务完成后，确保：

- [ ] 分支名称为 `feature/task-{TASK_ID}` 格式
- [ ] 代码通过 `npm run lint`
- [ ] 代码通过 `npm run type-check`
- [ ] 已创建 PR 到 main 分支
- [ ] PR 中包含任务描述和测试说明
- [ ] 监控脚本验证通过
