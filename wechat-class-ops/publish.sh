#!/usr/bin/env bash
# 把本项目发布到 GitHub 的 main 分支下 wechat-class-ops/ 目录
# 用法：./publish.sh            （提交本地改动并推送）
#       ./publish.sh "提交说明"
set -euo pipefail
cd "$(dirname "$0")"

PREFIX=wechat-class-ops
BRANCH=main

if [ -n "${1:-}" ]; then MSG="$1"; else MSG="update: $(date '+%Y-%m-%d %H:%M')"; fi

# 1) 本地有改动就先提交
# 注意：未跟踪的新文件不会出现在 git diff 里，必须用 status 判断
if [ -n "$(git status --porcelain)" ]; then
  git add -A
  git commit -m "$MSG"
  echo "已提交本地改动"
fi

# 2) 拉取远端 main（只取目录结构，不下载历史大文件）
git fetch --depth=1 --filter=blob:none origin "$BRANCH"

PARENT=$(git rev-parse "origin/$BRANCH")
PARENTTREE=$(git rev-parse "$PARENT^{tree}")
OURTREE=$(git rev-parse 'HEAD^{tree}')

# 3) 远端树 + 我们的子树 → 新树
TMP=$(mktemp)
# 父树里可能有同名目录（上一次已发布过），先剔除，否则会生成重复条目被服务端拒绝
git cat-file -p "$PARENTTREE" | awk -F'\t' -v p="$PREFIX" '$2 != p' > "$TMP"
printf '040000 tree %s\t%s\n' "$OURTREE" "$PREFIX" >> "$TMP"
TREE=$(git mktree --missing < "$TMP")
rm -f "$TMP"

if [ "$TREE" = "$PARENTTREE" ]; then
  echo "远端已是最新，没有需要推送的内容"
  exit 0
fi

# 4) 基于远端 main 生成提交并推送
COMMIT=$(git commit-tree "$TREE" -p "$PARENT" -m "$MSG")
git push origin "$COMMIT:refs/heads/$BRANCH"
echo "已推送：$COMMIT"
