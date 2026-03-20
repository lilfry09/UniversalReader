# UniversalReader AI 问答助手 - 项目说明

## 项目目标

在 UniversalReader 电子书阅读器基础上添加 AI 问答功能，让用户可以针对正在阅读的书籍提问。

---

## MANDATORY: Agent 工作流程

### Step 1: 初始化环境

```bash
cd D:\SJTUlearning\25Winter\UniversalReader
npm install
```

确认依赖安装成功后再继续。

### Step 2: 选择下一个任务

读取 `task.json`，选择一个 `passes: false` 的任务。优先选择没有依赖的基础任务。

### Step 3: 实现任务

仔细阅读任务描述，按步骤实现功能。遵循现有代码风格（React + TypeScript + Tailwind）。

### Step 4: 测试验证

**前端 UI 修改：**
- 使用 `npm run dev` 启动开发服务器
- 用浏览器测试界面是否正常渲染

**后端逻辑：**
- 检查 TypeScript 编译 `npx tsc --noEmit`
- 确保 lint 通过 `npm run lint`

### Step 5: 更新进度

在 `progress.txt` 中记录完成的工作：

```
## [日期] - 任务: [任务名称]

### 完成内容:
- [具体修改]

### 测试:
- [如何验证]

### 备注:
- [需要注意的事项]
```

### Step 6: 提交更改

**所有更改必须在同一个 commit 中提交，包括 task.json 更新！**

1. 更新 `task.json`，将任务的 `passes` 设为 `true`
2. 更新 `progress.txt`
3. 提交：

```bash
git add .
git commit -m "[任务名称] - completed"
```

---

## 项目结构

```
UniversalReader/
├── CLAUDE.md           # 本文件 - 工作流程说明
├── task.json           # 任务列表（truth source）
├── progress.txt        # 进度记录
├── src/
│   ├── electron/       # Electron 主进程
│   │   ├── main.ts    # 主进程入口
│   │   └── qa-service.ts  # LangChain QA 服务
│   ├── components/    # React 组件
│   │   └── QA Panel/  # QA 相关组件
│   └── pages/         # 页面
└── ...
```

---

## 常用命令

```bash
npm run dev      # 启动开发服务器
npm run build    # 生产构建
npm run lint    # 代码检查
npx tsc --noEmit  # TypeScript 检查
```

---

## 技术栈

- **前端**: React 18 + TypeScript + Tailwind CSS
- **桌面**: Electron 34
- **AI**: LangChain + OpenAI API (或 Ollama)
- **向量库**: Chroma

---

## 关键规则

1. **一次一任务** - 专注完成一个任务
2. **测试后再标记完成** - 必须验证通过才能改 passes
3. **UI 修改必须浏览器测试** - 打开页面确认正常
4. **记录到 progress.txt** - 帮助后续 agent 了解进度
5. **一个任务一个 commit** - 代码、progress、task.json 一起提交
6. **不删除任务** - 只能把 false 改为 true
7. **遇到阻塞则停止** - 需要人工介入时，输出阻塞信息并停止
