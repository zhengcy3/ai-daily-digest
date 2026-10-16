# AI 博主日报（ai-daily-digest）

静态网站（纯 HTML/JS，无构建依赖），由 `data/*.json` 驱动，部署在 GitHub Pages。

- `index.html` 各期列表（一句话总结 + 帖子数）
- `issue.html?d=YYYY-MM-DD` 每期：学习海绵见解、按主题/按博主切换、搜索、标签筛选、英文原文折叠
- `bloggers.html` 博主累计发帖与活跃天数（红色＝从未发帖，便于删减名单）
- `data/YYYY-MM-DD.json` 每日数据；`data/index.json` 期数索引；`data/bloggers.json` 博主统计

## 每日流程（工作目录 /workspace/learning）
1. `python3 gen.py queries YYYY-MM-DD` 打印两组查询（各 50 人）与时间窗（前一天 13:45 至当天 13:45 北京时间）。
2. 用 X MCP `search_posts_all`（max_results=25, sort_order=recency, `-is:retweet -is:reply`），带 next_token 翻页直到 result_count=0；每页 `python3 merge.py A|B <结果文件>`。约 15–20 次调用/天。
   - 新的一天先清空 `raw/A.json raw/B.json`。
3. `python3 gen.py dump` → `raw/dump.txt`，逐条写 `ann/*.json`：`{id: [一句话中文结论, 英文帖中文译文, [长帖关键点]]}`。
4. 写 `meta.json`：`date, window, summary, highlights[3-5 个帖子 id], insights[{title, body}]`，可选 `topic_overrides{id: 主题}`。
5. 发布：`/workspace/ai-daily-digest/scripts/publish.sh YYYY-MM-DD`
   （生成 data JSON → commit → push → 首次自动建仓库并开启 Pages）。

主题分类由 `scripts/build_data.py` 关键词规则自动生成，可用 `topic_overrides` 纠正。

本地预览：`python3 -m http.server -d /workspace/ai-daily-digest 8000` 后打开 http://localhost:8000

## 静态资源版本号（缓存）
页面通过 `assets/base.css?v=YYYYMMDD`、`assets/theme.css?v=…`、`assets/app.js?v=…` 引用资源。
**每次修改 assets 下的 css/js 并发布时**，把 index.html、archive.html、search.html、bloggers.html 中的 `v=` 统一改为发布日期，例如：
`sed -i 's/?v=[0-9]*/?v=20261020/g' index.html archive.html search.html bloggers.html`
只发布 data/ 时无需改。`assets/common.js` 为 v5 迁移保留：旧缓存页面会加载它并强制刷新一次（sessionStorage 标记 `aidd-v5-reload`，不会循环）；`style.css home.js issue.js search.js bloggers.js theme-toggle.js` 为空文件，避免旧缓存页 404。
