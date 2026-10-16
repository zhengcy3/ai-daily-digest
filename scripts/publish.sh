#!/usr/bin/env bash
# 用法: scripts/publish.sh YYYY-MM-DD
# 前提: /workspace/learning 下已拉取并注释当日数据（见 README），且 gh 已登录 zhengcy3
set -euo pipefail
D=${1:-$(date +%F)}; cd "$(dirname "$0")/.."
python3 scripts/build_data.py "$D"
git add -A && git commit -m "digest $D" || echo "nothing to commit"
if ! git remote get-url origin >/dev/null 2>&1; then
  gh repo view zhengcy3/ai-daily-digest >/dev/null 2>&1 || gh repo create zhengcy3/ai-daily-digest --public --description "AI 博主日报"
  git remote add origin https://github.com/zhengcy3/ai-daily-digest.git
fi
git push -u origin main
gh api repos/zhengcy3/ai-daily-digest/pages >/dev/null 2>&1 || \
  gh api -X POST repos/zhengcy3/ai-daily-digest/pages -f 'source[branch]=main' -f 'source[path]=/' >/dev/null
echo "已发布: https://zhengcy3.github.io/ai-daily-digest/issue.html?d=$D"
