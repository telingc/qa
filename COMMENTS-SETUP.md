# QA source links and comments

源码范围由用户确认：`Knowledge Atlas/Nodes/scripts/` 与 `Knowledge Atlas/Examples/scripts/` 全部源码，与节点阶段无关。公开网页的节点/例子阶段门槛保持不变。

## 文件与发布

- 源码随同一份网页快照发布到 `gh-pages` 的 `code/Nodes/`、`code/Examples/`，保持目录结构和原始字节，不在构建时执行。
- 正文相对链接和普通 wiki 链接自动指向 `https://github.com/telingc/qa/blob/gh-pages/code/...`。带空格、Unicode 和编码 # 的文件名可用；`#L2` 等行号片段保留。
- 不依赖文章是否已发布、是否引用该脚本。脚本更新/删除反映在下一次发布中；不会修改原 vault。GitHub 历史仍可找回过去提交中的代码。
- 同步源码、文档和文本依赖；排除缓存、环境目录、隐藏文件、凭据文件、编译产物与二进制输出。`publish-review.json` 列出全部文件、SHA-256 和排除原因；Notebook 保留原内容，发布前可在清单中检查。
- `code/manifest.json` 是公开源码清单，不含本机绝对路径。`.publish-state.json` 是本机最近成功发布记录，忽略提交；新增/修改/删除对比以这份本机记录为准，首次使用会明确说明没有历史基线。

## 一次性启用 giscus

2026-10-21 已从官方配置页读取并设置 QA 的公开仓库/分类 ID，默认使用 Announcements。正常使用无需重复配置；以下步骤供重建或更换仓库时参考。

1. 用自己的 GitHub 账号打开 `https://github.com/telingc/qa/settings`，在 General → Features 启用 Discussions。
2. 打开 `https://github.com/apps/giscus` 安装官方 App，只选择 `telingc/qa`，不需要授权博客仓库。安装会授予该 App 对所选仓库 Discussions 的访问权限，按 GitHub 页面实际显示的权限核对。
3. 直接使用现有默认分类 `Announcements`，无需新建分类；如需独立分组，也可创建 Announcements 类型的新分类。
4. 打开 `https://giscus.app/`，仓库填 `telingc/qa`，选择该分类。把生成配置中的 `data-repo-id` 和 `data-category-id` 分别填入 `config.local.json` 的 `comments.repoId` 和 `comments.categoryId`；category 填真实分类名。
5. 配置文件可从 config.example.json 复制，保留 vault、basePath、title 与 github 配置。ID 是公开标识，不是 token；这里不使用 GitHub PAT 或模型 API key。

```json
{
  "vault": "../life-project/knowledge-map/learning-vault",
  "basePath": "/qa/",
  "title": "telingc atlas",
  "github": {"repository": "telingc/qa", "branch": "gh-pages"},
  "comments": {
    "enabled": true,
    "repository": "telingc/qa",
    "repoId": "",
    "category": "Announcements",
    "categoryId": ""
  }
}
```

保留当前工作流：Publish QA.cmd 先生成预览与清单，再确认发布。评论配置缺失时可以预览 GitHub 讨论入口，但确认发布会停止，避免把未连接的评论当作已启用。若以后确实需要关闭评论，显式设置 comments.enabled=false。

## 评论行为

- 节点与例子各自有一条讨论：`qa:node:<atlas_id>` 和 `qa:example:<atlas_example_id>`。按 specific term 严格匹配，改标题不会换评论串；两种对象即使 ID 相同也不会共用讨论。
- 首页和 Atlas 图谱不加评论。文章底部接近视口时才加载 giscus，界面英文、深色、默认关闭主帖反应计数。
- 原文、图谱与评论分开工作；加载失败保留正文和 GitHub 入口，提供重试。发表评论需访客 GitHub 授权，管理评论在 GitHub Discussions 中完成。
- 首次评论才由 giscus 创建对应讨论。撤回文章不删除已存在的 GitHub 讨论，也不会自动改学习阶段或原笔记。
- 自动测试仅使用隔离 Git 仓库或模拟评论客户端，不向真实讨论发送测试评论。真实 App 权限、登录与评论提交需要在 GitHub 配置后验证。

官方配置说明：https://giscus.app/ 。严格匹配说明：https://github.com/giscus/giscus/blob/main/ADVANCED-USAGE.md#data-strict 。
