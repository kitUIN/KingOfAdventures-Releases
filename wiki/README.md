# 冒险王 · K版 Wiki

安装 Node.js 22，在此目录运行 `npm ci` 和 `npm run dev`，打开终端给出的项目路径。运行 `npm run build` 生成静态网站，并检查图标、词条链接和章节锚点。

在游戏仓库运行以下命令，将已发布版本的数据和对应的 LFS 图片导出到本目录。导出器仅读取指定标签；如果涉及手写说明的规则发生变化，先核对该版规则并更新导出器。

```powershell
. .\Tools\Use-ProjectTemp.ps1
python .\Tools\FlashResearch\export_wiki.py --tag 1.4-release --out ..\KingOfAdventures-Releases\wiki
```

更新版本时，在分支上比较 `src/data/release.json` 和 `public/art/`，本地预览新增词条、数值和掉落地点，并检查首页的快捷查询。提交到公开发布仓库后，Pull Request 会构建并检查全站，合入 main 后由 Wiki Pages 工作流部署。网页底部的「建议修改」会预填 GitHub Issues 表单。版本相关数值在导出器与游戏规则中核对。经审核的词条补充写入 `src/data/notes.json`，按正式版标签、分类和词条 ID 匹配，重新导出数据时会保留。
