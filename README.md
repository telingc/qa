# QA — public working notes

独立静态网站，来自 Quiet Atlas 的本地 Markdown 草稿。英文界面，沿用博客的深灰背景、Helvetica/Arial、蓝色链接与简洁文章列表。没有编辑接口、账户或服务器数据库。原博客不参与本项目构建。

页头保留 `telingc atlas` 标题与返回 QA 首页的链接，旁边是与博客 RSS 图标呼应的橙底白色节点图标；图标本身没有操作。页脚 `A learning process, left open.` 下的 `telingc blog` 返回原博客。

## 本机使用

需要 Node.js 22 或以上、npm；发布另需 Git。当前项目目录为 `E:/workspace/qa`。

首次在项目目录运行 `npm ci`。随后双击 **Preview QA.cmd**，或依次运行：

```text
npm run build
npm start
```

打开 `http://127.0.0.1:5190/qa/`。修改本地笔记后重新 build 并刷新页面；没有自动监视或自动发布。首页按科目列出文章，右上角 Atlas 进入图谱；图谱点击节点或例子，再点 Details 阅读，Back 返回列表。图谱支持滚轮缩放、拖动和双指缩放；从文章返回图谱时保留选择与视角。仅两个操作入口，不需要 Focus。

`config.example.json` 的默认 vault 是 `../life-project/knowledge-map/learning-vault`。有不同路径时复制成忽略提交的 `config.local.json`，修改 `vault`；也可设置环境变量 `QA_VAULT`。发布基路径默认为 `/qa/`。实际路径不写入公开页面。

## 导出规则

- `atlas_status >= 1`，即 **Can explain** 起：导出节点草稿正文。
- `atlas_status >= 2`，即 **Reproduce unaided** 起：导出该节点的所有例子，每个节点最多四个。例子本身没有学习阶段。
- 只使用 `Knowledge Atlas/graph.json` 中两端均公开的直接关系。隐藏节点不出现，也不跨过它新造连线。
- Markdown 正文按原内容渲染，不自动润色、修订公式或评定成熟度；frontmatter 中的历史/复习等内部字段、Cards、回收站和备份不进入公开站点。正文里的手写记录作为草稿内容保留。
- Markdown、代码高亮和 KaTeX 公式在构建时渲染；字体、所用本地图片随站打包，阅读不需要 CDN。普通图片和 Obsidian 图片嵌入均解析；不改变原图片。
- 当前支持本地 PNG/JPEG/GIF/WebP/AVIF。外部图片、SVG 附件或无法解析的图片保留缺失提示并列入构建警告，不能静默上传整个附件目录。链接到未公开笔记显示为普通文字。
- 复杂的不支持公式保留原 TeX 并列入警告，不猜公式。长行公式和代码在自己的区域内滚动。作者 HTML 的主动脚本与事件属性会过滤。
- 标题取文件名，URL 由稳定 ID 派生；改文件名不会让 URL 跟着改变。

导出只读 vault。损坏的关系文件、重复 ID、异常 stage 或第五个例子会停止构建；已有成功构建保留。`dist/` 是可重新生成的公开产物，不要手工维护；`publish-review.json` 是本机审查清单。

## 发布到独立 qa 仓库

本次只完成本地实现，尚未连接 GitHub、推送或部署。先确认独立远程仓库后，在本项目配置 `origin`；不要使用原博客远程仓库。

1. 双击 **Publish QA.cmd**，会先重新构建并生成发布清单。
2. 检查本地预览与 `publish-review.json`，确认将要公开的正文、例子和图片。
3. 在脚本的本地确认中选择 Y，才会把生成文件提交到独立 qa 远程的 `gh-pages` 分支。脚本拒绝名称不是 qa 的远程；不推送本地 vault 和本机配置。确认前后快照变化会停止。
4. 首次在 GitHub Pages 中选择从 `gh-pages` 根目录发布。此项仍需在用户 GitHub 上配置和验证。

命令行也可以先 `npm run publish` 准备，再 `npm run publish -- --confirm` 发布。后者要求存在一致的已准备快照。更新使用正常的快进提交，不强制覆盖远程历史；失败不会覆盖本地笔记。

构建器：[Markdown-it](https://github.com/markdown-it/markdown-it)、[YAML](https://eemeli.org/yaml/)、[KaTeX](https://katex.org/docs/api)、highlight.js、sanitize-html。层次布局改编自本地 Quiet Atlas 的纯显示算法，增加了例子占位。KaTeX 字体许可证随产物保留。

## 验证

`npm test` 检查发布阈值、原始直连关系、笔记字节保护、降阶段撤下、图片和链接、公式与代码、危险 HTML、异常数据和四例子布局。实际生成页面另以隔离 Edge 检查；详见 `VERIFICATION.md`。手机宽度模拟不等同于 iPhone Safari 实机验证。
