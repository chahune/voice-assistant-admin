<template>
  <div>
    <h2>问答记录</h2>
    <el-card style="margin-top: 20px">
      <div style="margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center">
        <div>
          <span style="color: #666; font-size: 13px">展示最近的语音问答与千问文字问答记录。</span>
        </div>
        <el-button type="primary" text @click="loadData">刷新</el-button>
      </div>
      <el-table :data="items" stripe style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="createdAt" label="时间" width="180">
          <template #default="{ row }">
            {{ formatTime(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column prop="mode" label="模式" width="120">
          <template #default="{ row }">
            <el-tag size="small">
              {{ modeLabel(row.mode) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="answerSource" label="回答来源" width="120">
          <template #default="{ row }">
            <el-tag size="small" type="info">
              {{ row.answerSource || '-' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="question" label="问题" min-width="220" show-overflow-tooltip />
        <el-table-column prop="answer" label="回答" min-width="260" show-overflow-tooltip />
      </el-table>
      <div style="margin-top: 12px; text-align: right">
        <el-pagination
          :current-page="page + 1"
          :page-size="size"
          :total="total"
          layout="prev, pager, next, jumper"
          small
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { chatHistory } from '../api'

const items = ref([])
const page = ref(0)
const size = ref(20)
const total = ref(0)
const loading = ref(false)

const loadData = async () => {
  loading.value = true
  try {
    const res = await chatHistory(page.value, size.value)
    items.value = res.content || []
    total.value = res.totalElements || 0
  } catch (e) {
    ElMessage.error(e.message || '加载失败')
  } finally {
    loading.value = false
  }
}

const handlePageChange = (p) => {
  page.value = p - 1
  loadData()
}

const formatTime = (val) => {
  if (!val) return ''
  try {
    const d = new Date(val)
    if (Number.isNaN(d.getTime())) return val
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hh = String(d.getHours()).padStart(2, '0')
    const mm = String(d.getMinutes()).padStart(2, '0')
    const ss = String(d.getSeconds()).padStart(2, '0')
    return `${y}-${m}-${day} ${hh}:${mm}:${ss}`
  } catch {
    return val
  }
}

const modeLabel = (mode) => {
  if (mode === 'voice-local') return '语音-本地'
  if (mode === 'voice-online') return '语音-线上'
  if (mode === 'qwen-text') return '千问-文字'
  if (!mode) return '未知'
  return mode
}

onMounted(loadData)
</script>

