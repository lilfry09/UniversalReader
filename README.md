# Universal Reader 📖

一个基于 Electron + React + Vite 构建的多功能本地阅读器。旨在提供丝滑的阅读体验，支持多种文档格式，并具备本地库管理功能。

## ✨ 特性

- **多格式支持**: 
  - 📄 **PDF**: 完整的 PDF 阅读体验。
  - 📚 **EPUB**: 流式布局阅读，支持章节跳转。
  - 📝 **Markdown**: 漂亮的文档渲染。
- **本地书库**: 基于 SQLite 的图书管理，支持书籍导入和持久化存储。
- **现代化 UI**: 使用 Tailwind CSS 构建，拥有简洁的侧边栏导航和响应式布局。
- **跨平台**: 基于 Electron，可运行于 Windows, macOS 和 Linux。

## 🚀 快速开始

### 前置要求

- [Node.js](https://nodejs.org/) (建议 v18+)
- npm 或 yarn

### 安装步骤

1. 克隆仓库:
   ```bash
   git clone https://github.com/lilfry09/UniversalReader.git
   cd UniversalReader
   ```

2. 安装依赖:
   ```bash
   npm install
   ```

3. 启动开发环境:
   ```bash
   npm run dev
   ```

### 构建打包

如果你想构建可执行文件，请运行：
```bash
npm run build
```
生成的文件将位于 `dist` 和 `dist-electron` 目录下。

## 🛠️ 技术栈

- **前端**: React, TypeScript, Vite, Tailwind CSS
- **桌面运行环境**: Electron
- **数据库**: better-sqlite3
- **阅读引擎**: 
  - react-pdf (PDF)
  - foliate-js (EPUB)
  - react-markdown (Markdown)

## 📌 待办事项 / 计划

- [ ] 支持书籍封面预览
- [ ] 增加夜间模式/主题切换
- [ ] 书籍标签与分类功能
- [ ] 阅读历史记录

---

如果你觉得这个项目对你有帮助，欢迎点个 Star! ⭐
