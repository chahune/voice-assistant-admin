# 语音助手管理后台

基于 voice-assistant-api 的 Vue 3 管理前端，支持语音管道、设备管理、知识库（RAG）管理。

## 技术栈

- Vue 3 + Vite
- Vue Router
- Element Plus
- Axios

## 功能

- **概览**：服务健康、知识库条数、设备数量
- **语音管道**：WAV 上传（ASR→LLM→TTS）、文字转语音、千问文本对话
- **设备管理**：设备 CRUD、开关控制
- **知识库**：文档入库（单条/批量）、语义检索、从设备表同步、清空

## 开发

```bash
cd voice-assistant-admin
npm install
npm run dev
```

访问 http://localhost:5173

## 生产构建

```bash
npm run build
```

产物在 `dist/`，可部署到任意静态服务器。生产环境需配置 Nginx 等将 `/api`、`/tts` 代理到后端（如 `http://localhost:8080`）。

## 后端要求

1. 启动 voice-assistant-api（默认端口 8080）
2. 开发时 Vite 已配置代理，`/api` 和 `/tts` 会转发到 `http://localhost:8080`
3. 若后端未配置 CORS，开发时请使用 Vite 代理（已配置），不要直接请求 8080

## 环境变量

可通过 `.env.development` 修改代理目标：

```
VITE_API_BASE=http://localhost:8080
```

然后在 `vite.config.js` 的 proxy 中使用该变量。
