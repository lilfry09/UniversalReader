# 代码审查报告

**日期**: 2026-06-07  
**审查范围**: electron/handlers.ts, electron/main.ts, electron/qa-service.ts  
**审查人**: Claude Code

---

## 执行摘要

本次审查发现 **1 个关键问题** 导致应用无法启动，已修复。同时识别出多个高优先级和中优先级的改进建议。

---

## 🔴 CRITICAL - 已修复

### 1. IPC 处理器重复注册

**位置**: `electron/handlers.ts:602, 641`

**问题描述**:
```typescript
// 第 602 行
ipcMain.handle('qa-get-status', async () => {
  return qaService.getStatus()
})

// 第 641 行（重复！）
ipcMain.handle('qa-get-status', async () => {
  return qaService.getStatus()
})
```

**影响**: 
- 应用启动失败
- 错误信息: `Attempted to register a second handler for 'qa-get-status'`

**修复方案**: ✅ 已删除第 641-643 行的重复代码

---

## 🟡 HIGH - 建议修复

### 2. SQL 动态拼接存在注入风险

**位置**: `electron/handlers.ts:574`

**问题描述**:
```typescript
const stmt = db.prepare(`UPDATE annotations SET ${fields.join(', ')} WHERE id = ? RETURNING *`)
```

**风险**: 
- 虽然字段名通过代码控制，但动态 SQL 拼接仍存在潜在风险
- 如果未来添加新功能可能引入安全漏洞

**建议修复**:
```typescript
// 使用白名单验证
const ALLOWED_FIELDS = ['note', 'color', 'updatedAt'];
const safeFields = fields.filter(f => {
  const fieldName = f.split(' = ')[0];
  return ALLOWED_FIELDS.includes(fieldName);
});

if (safeFields.length === 0) return null;
const stmt = db.prepare(`UPDATE annotations SET ${safeFields.join(', ')} WHERE id = ? RETURNING *`)
```

### 3. 内存管理风险

**位置**: `electron/qa-service.ts:418-507`

**问题描述**:
- 整个文档内容完全加载到内存
- 没有文件大小限制
- 大型 PDF 或 EPUB 可能导致内存溢出

**建议修复**:
```typescript
async function loadBookForQA(bookPath: string, format: string) {
  // 添加文件大小检查
  const stats = await fs.promises.stat(bookPath);
  const maxSize = 100 * 1024 * 1024; // 100MB
  
  if (stats.size > maxSize) {
    throw new Error(`文件过大 (${Math.round(stats.size / 1024 / 1024)}MB)，超过 100MB 限制`);
  }
  
  // ... 继续加载
}
```

### 4. 错误处理不一致

**位置**: 多处

**问题示例**:
```typescript
// handlers.ts:509 - 静默失败
fs.promises.unlink(book.coverPath).catch(() => {})

// handlers.ts:329 - 返回 null
if (result.canceled) return null

// qa-service.ts:500 - 抛出异常
throw new Error("Unknown error");
```

**建议**: 
- 统一使用 `Promise<Result<T, Error>>` 模式
- 或统一使用异常处理
- 避免静默失败

---

## 🟢 MEDIUM - 可以优化

### 5. 硬编码配置值

**位置**: `electron/qa-service.ts`

**问题**:
```typescript
const chunkSize = 1000;           // 行 469
const timeoutId = setTimeout(..., 30000); // 行 236
async function chat(messages, retries = 3) // 行 228
```

**建议**:
```typescript
// 提取为配置常量
const QA_CONFIG = {
  CHUNK_SIZE: 1000,
  REQUEST_TIMEOUT: 30000,
  MAX_RETRIES: 3,
  MAX_FILE_SIZE: 100 * 1024 * 1024,
  MAX_CHUNKS: 10000,
} as const;
```

### 6. 长函数需要重构

**问题**:
- `extractEpubCover`: 165 行 (handlers.ts:86-166)
- `loadBookForQA`: 88 行 (qa-service.ts:418-507)
- `extractTextFromFile`: 97 行 (qa-service.ts:316-415)

**建议**: 拆分为更小的函数，每个函数职责单一

### 7. 类型安全改进

**位置**: `electron/qa-service.ts:354-360`

```typescript
// 当前：使用类型断言和运行时检查
const pageText = textContent.items
  .map((item: unknown) => {
    if (typeof item === 'object' && item !== null && 'str' in item) {
      return (item as { str: string }).str;
    }
    return "";
  })
```

**建议**: 定义明确的接口类型
```typescript
interface PDFTextItem {
  str: string;
  // 其他属性...
}

const pageText = (textContent.items as PDFTextItem[])
  .map(item => item.str)
  .join(" ");
```

### 8. 重复代码

**位置**: `electron/handlers.ts`

**问题**: 封面提取逻辑重复
- `extractEpubCover` (86-166)
- `extractPdfCover` (168-201)

**建议**: 提取通用的封面处理逻辑

---

## 代码质量指标

| 指标 | 状态 |
|------|------|
| TypeScript 编译 | ✅ 通过 |
| ESLint 检查 | ✅ 通过 (0 warnings) |
| 构建 | ✅ 成功 |
| 启动 | ✅ 修复后正常 |

---

## 安全性检查

### ✅ 已通过
- 使用参数化查询防止 SQL 注入
- 使用 better-sqlite3 (安全的绑定)
- 路径处理正确 (path.join)
- 凭证存储使用 secure-store

### ⚠️ 需要关注
- SQL 动态拼接 (已标记)
- 内存限制缺失 (已标记)
- 文件上传未验证 MIME 类型

---

## 性能优化建议

1. **索引优化**: ✅ 已创建必要的数据库索引
2. **准备语句缓存**: ✅ 已使用 prepared statements
3. **内存管理**: ⚠️ 需要添加大文件限制
4. **并发处理**: ⚠️ 考虑使用 worker_threads 处理 PDF

---

## 后续行动项

### 高优先级
- [ ] 添加文件大小限制（100MB）
- [ ] 修复 SQL 动态拼接风险
- [ ] 统一错误处理策略

### 中优先级
- [ ] 提取配置常量
- [ ] 重构长函数
- [ ] 添加 MIME 类型验证

### 低优先级
- [ ] 改进类型定义
- [ ] 消除代码重复
- [ ] 添加单元测试

---

## 审查结论

✅ **关键问题已修复，代码可以部署**

修复了导致应用无法启动的 IPC 处理器重复注册问题。其他发现的问题不影响核心功能，可以在后续迭代中逐步改进。

**总体代码质量**: Good  
**可维护性**: Medium-High  
**安全性**: Medium (需要后续改进)
