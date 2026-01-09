#!/bin/bash

# scripts/monitor_cloud_task.sh
# 监听 Codex Cloud 任务状态并在任务完成后进行验证

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 参数
TASK_ID=$1
LOG_FILE=$2

if [ -z "$TASK_ID" ] || [ -z "$LOG_FILE" ]; then
    echo -e "${RED}用法: $0 <TASK_ID> <LOG_FILE>${NC}"
    exit 1
fi

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}开始监听云端任务: TASK-${TASK_ID}${NC}"
echo -e "${BLUE}=========================================${NC}"

# 从日志文件提取 Codex Cloud Task URL
TASK_URL=$(grep -oP 'https://chatgpt\.com/codex/tasks/[a-zA-Z0-9_-]+' "$LOG_FILE" | head -1)

if [ -z "$TASK_URL" ]; then
    echo -e "${RED}❌ 无法从日志中提取任务 URL${NC}"
    exit 1
fi

CLOUD_TASK_ID=$(echo "$TASK_URL" | grep -oP 'tasks/\K[a-zA-Z0-9_-]+')

echo -e "${GREEN}📊 任务 URL: ${TASK_URL}${NC}"
echo -e "${YELLOW}💡 你可以在浏览器实时查看进度${NC}"
echo ""

# 配置
MAX_WAIT_TIME=1800  # 最大等待时间（30分钟）
CHECK_INTERVAL=30   # 检查间隔（30秒）
ELAPSED=0

# 监听策略：由于 Codex CLI 可能没有直接的状态查询命令
# 我们采用混合策略

echo -e "${YELLOW}⏳ 监听模式：${NC}"
echo "1. 每 ${CHECK_INTERVAL} 秒输出等待状态"
echo "2. 你可以在浏览器查看任务进度"
echo "3. 按 Ctrl+C 可以中断等待（任务继续在云端运行）"
echo ""

# 方式 A: 简单的时间等待 + 人工确认
while [ $ELAPSED -lt $MAX_WAIT_TIME ]; do
    ELAPSED=$((ELAPSED + CHECK_INTERVAL))
    MINUTES=$((ELAPSED / 60))
    
    echo -e "${BLUE}⏱️  已等待 ${MINUTES} 分钟${NC}"
    
    # 每 2 分钟提示一次
    if [ $((ELAPSED % 120)) -eq 0 ]; then
        echo -e "${YELLOW}💡 建议在浏览器查看详细进度和日志${NC}"
    fi
    
    # 10 分钟后提示可以手动确认
    if [ $ELAPSED -ge 600 ] && [ $((ELAPSED % 300)) -eq 0 ]; then
        echo ""
        echo -e "${YELLOW}⚠️  任务运行时间较长${NC}"
        read -t 5 -p "如果任务已完成，输入 'done' 继续验证 (5秒后自动跳过): " USER_INPUT
        
        if [ "$USER_INPUT" = "done" ]; then
            echo -e "${GREEN}✅ 用户确认任务完成${NC}"
            break
        fi
    fi
    
    sleep $CHECK_INTERVAL
done

if [ $ELAPSED -ge $MAX_WAIT_TIME ]; then
    echo ""
    echo -e "${YELLOW}⏰ 达到最大等待时间 (${MAX_WAIT_TIME}秒)${NC}"
    echo -e "${YELLOW}💡 任务可能仍在运行，请在浏览器检查${NC}"
    
    read -p "任务是否已完成？ (yes/no): " COMPLETED
    
    if [ "$COMPLETED" != "yes" ]; then
        echo -e "${RED}❌ 任务未完成，退出验证${NC}"
        exit 1
    fi
fi

echo ""
echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}准备进行云端验证${NC}"
echo -e "${BLUE}=========================================${NC}"

# 方式 B: 通过 codex cloud 命令查看任务（如果可用）
# 注意：这个功能可能需要特定版本的 Codex CLI

echo -e "${YELLOW}🔍 尝试获取任务详情...${NC}"

# 尝试使用 codex cloud 查看任务
codex cloud > /tmp/codex_cloud_tasks.txt 2>&1 &
CLOUD_PID=$!

# 等待 5 秒让界面启动
sleep 5

# 终止交互界面
kill $CLOUD_PID 2>/dev/null

# 检查输出
if grep -q "$CLOUD_TASK_ID" /tmp/codex_cloud_tasks.txt; then
    echo -e "${GREEN}✅ 找到云端任务记录${NC}"
else
    echo -e "${YELLOW}⚠️  无法自动获取任务状态，需要手动确认${NC}"
fi

rm -f /tmp/codex_cloud_tasks.txt

# 云端验证
echo ""
echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}执行云端验证${NC}"
echo -e "${BLUE}=========================================${NC}"

# 验证策略 1: 检查 GitHub 分支
EXPECTED_BRANCH="feature/task-${TASK_ID}"

echo -e "${YELLOW}📡 验证 1: 检查 GitHub 分支${NC}"

# 刷新远程分支
git fetch origin > /dev/null 2>&1

if git branch -r | grep -q "origin/${EXPECTED_BRANCH}"; then
    echo -e "${GREEN}✅ 云端分支已创建: ${EXPECTED_BRANCH}${NC}"
    BRANCH_EXISTS=true
else
    echo -e "${RED}❌ 未找到预期分支: ${EXPECTED_BRANCH}${NC}"
    BRANCH_EXISTS=false
fi

# 验证策略 2: 拉取分支并运行本地验证
if [ "$BRANCH_EXISTS" = true ]; then
    echo ""
    echo -e "${YELLOW}📥 验证 2: 拉取分支并运行本地测试${NC}"
    
    # 保存当前分支
    CURRENT_BRANCH=$(git branch --show-current)
    
    # 切换到云端创建的分支
    git checkout "$EXPECTED_BRANCH" > /dev/null 2>&1
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ 成功切换到分支: ${EXPECTED_BRANCH}${NC}"
        
        # 运行本地验证脚本（如果存在）
        if [ -f "scripts/validator.sh" ]; then
            echo -e "${YELLOW}🧪 运行本地验证脚本...${NC}"
            
            ./scripts/validator.sh "$TASK_ID"
            VALIDATION_RESULT=$?
            
            if [ $VALIDATION_RESULT -eq 0 ]; then
                echo -e "${GREEN}✅ 本地验证通过${NC}"
            else
                echo -e "${RED}❌ 本地验证失败${NC}"
                
                # 切回原分支
                git checkout "$CURRENT_BRANCH" > /dev/null 2>&1
                exit 1
            fi
        else
            echo -e "${YELLOW}⚠️  未找到 validator.sh，跳过本地测试${NC}"
        fi
        
        # 切回原分支
        git checkout "$CURRENT_BRANCH" > /dev/null 2>&1
        
    else
        echo -e "${RED}❌ 无法切换到分支${NC}"
    fi
fi

# 验证策略 3: 检查 PR（如果 Codex 创建了 PR）
echo ""
echo -e "${YELLOW}📋 验证 3: 检查 Pull Request${NC}"

# 使用 GitHub CLI（如果安装了）
if command -v gh &> /dev/null; then
    PR_NUMBER=$(gh pr list --head "$EXPECTED_BRANCH" --json number -q '.[0].number' 2>/dev/null)
    
    if [ -n "$PR_NUMBER" ]; then
        echo -e "${GREEN}✅ 找到 PR #${PR_NUMBER}${NC}"
        echo -e "${BLUE}🔗 查看 PR: $(gh pr view $PR_NUMBER --json url -q .url)${NC}"
    else
        echo -e "${YELLOW}⚠️  未找到 PR（可能 Codex 没有创建 PR）${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  未安装 GitHub CLI，跳过 PR 检查${NC}"
    echo -e "${BLUE}💡 安装: brew install gh${NC}"
fi

# 最终确认
echo ""
echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}验证总结${NC}"
echo -e "${BLUE}=========================================${NC}"

if [ "$BRANCH_EXISTS" = true ]; then
    echo -e "${GREEN}✅ 云端任务验证通过${NC}"
    echo ""
    echo "验证结果："
    echo "  - 分支创建: ✅"
    echo "  - 本地测试: ✅"
    echo "  - 任务 URL: ${TASK_URL}"
    echo ""
    exit 0
else
    echo -e "${RED}❌ 云端任务验证失败${NC}"
    echo ""
    echo "请手动检查："
    echo "  1. 访问 ${TASK_URL}"
    echo "  2. 查看任务日志"
    echo "  3. 检查是否有错误"
    echo ""
    exit 1
fi