import axios from 'axios'

const api = axios.create({
  baseURL: '', // 使用 Vite 代理，同源请求
  timeout: 60000
})

// 响应拦截
api.interceptors.response.use(
  res => res.data,
  err => {
    const data = err.response?.data
    let msg = '请求失败'
    if (data) {
      if (typeof data === 'string') msg = data
      else if (data.error) msg = data.error
      else if (data.message) msg = data.message
    } else if (err.message) msg = err.message
    return Promise.reject(new Error(msg))
  }
)

// ============ 语音 ============
export const voiceHealth = () => api.get('/api/voice/health')

export const voiceUpload = (file) => {
  const form = new FormData()
  form.append('file', file)
  return api.post('/api/voice/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export const voiceTts = (text) =>
  api.post('/api/voice/tts', { text })

export const voiceTtsGet = (text) =>
  api.get('/api/voice/tts', { params: { text } })

export const voiceQwen = (text) =>
  api.get('/api/voice/qwen', { params: { text } })

export const voiceQwenAsrUpload = (file) => {
  const form = new FormData()
  form.append('file', file)
  return api.post('/api/voice/qwen-asr-upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

export const getTtsUrl = (filename) => {
  const base = window.location.origin
  return `${base}/tts/${filename}`
}

// ============ 设备 ============
export const deviceList = (room, all = false) =>
  api.get('/api/device/list', { params: { ...(room ? { room } : {}), ...(all ? { all: true } : {}) } })

export const deviceGet = (id) => api.get(`/api/device/${id}`)

export const deviceCreate = (data) => api.post('/api/device', data)

export const deviceUpdate = (id, data) => api.put(`/api/device/${id}`, data)

export const deviceDelete = (id) => api.delete(`/api/device/${id}`)

export const deviceControl = (payload) =>
  api.post('/api/device/control', payload)

// ============ 向量库 ============
export const vectorAddDocument = (text, metadata) =>
  api.post('/api/vector/documents', { text, metadata })

export const vectorAddBatch = (texts) =>
  api.post('/api/vector/documents/batch', { texts })

export const vectorSearch = (query, topK = 5) =>
  api.get('/api/vector/search', { params: { query, topK } })

export const vectorStats = () => api.get('/api/vector/stats')

export const vectorClear = () => api.post('/api/vector/clear')

export const vectorSyncFromDevices = () =>
  api.post('/api/vector/sync-from-devices')

// ============ 聊天记录 ============
export const chatHistory = (page = 0, size = 20) =>
  api.get('/api/chat/history', { params: { page, size } })

// ============ 天气 ============
export const getWeather = (city) =>
  api.get('/api/weather', { params: { city } })

