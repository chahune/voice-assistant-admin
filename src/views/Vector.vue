<template>
  <div>
    <h2>知识库（向量库 / RAG）</h2>
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>添加文档</template>
          <el-input
            v-model="addText"
            type="textarea"
            :rows="5"
            placeholder="输入要入库的文档内容，支持单条或批量（换行分隔）"
          />
          <el-radio-group v-model="addMode" style="margin-top: 12px">
            <el-radio-button label="single">单条</el-radio-button>
            <el-radio-button label="batch">批量（每行一条）</el-radio-button>
          </el-radio-group>
          <el-button
            type="primary"
            :loading="addLoading"
            style="margin-top: 12px; display: block"
            @click="doAdd"
          >
            添加到知识库
          </el-button>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>语义检索</template>
          <el-input
            v-model="searchQuery"
            type="textarea"
            :rows="2"
            placeholder="输入查询，如：怎么开灯"
          />
          <el-form-item label="返回条数" style="margin-top: 12px">
            <el-input-number v-model="searchTopK" :min="1" :max="50" />
          </el-form-item>
          <el-button type="primary" :loading="searchLoading" style="margin-top: 12px" @click="doSearch">
            检索
          </el-button>
          <div v-if="searchResults.length" style="margin-top: 16px">
            <div
              v-for="(r, i) in searchResults"
              :key="i"
              style="padding: 8px; margin-bottom: 8px; background: #f5f7fa; border-radius: 6px"
            >
              <div style="font-size: 12px; color: #909399">相似度 {{ (r.score || 0).toFixed(3) }}</div>
              <div>{{ r.text }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-card style="margin-top: 20px" shadow="hover">
      <template #header>
        <span>统计与维护</span>
        <el-button type="primary" link style="float: right" @click="loadStats">刷新</el-button>
      </template>
      <el-descriptions :column="2" border>
        <el-descriptions-item label="文档数量">{{ stats?.count ?? '-' }}</el-descriptions-item>
      </el-descriptions>
      <div style="margin-top: 16px">
        <el-button type="warning" @click="syncFromDevices">从设备表同步到知识库</el-button>
        <el-button type="danger" @click="clearVector">清空向量库</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  vectorAddDocument,
  vectorAddBatch,
  vectorSearch,
  vectorStats,
  vectorClear,
  vectorSyncFromDevices
} from '../api'

const addText = ref('')
const addMode = ref('single')
const addLoading = ref(false)
const searchQuery = ref('')
const searchTopK = ref(5)
const searchLoading = ref(false)
const searchResults = ref([])
const stats = ref(null)

const loadStats = async () => {
  try {
    stats.value = await vectorStats()
  } catch {}
}

const doAdd = async () => {
  const text = addText.value?.trim()
  if (!text) {
    ElMessage.warning('请输入文档内容')
    return
  }
  addLoading.value = true
  try {
    if (addMode.value === 'batch') {
      const texts = text.split('\n').map((s) => s.trim()).filter(Boolean)
      if (!texts.length) {
        ElMessage.warning('没有有效内容')
        return
      }
      await vectorAddBatch(texts)
      ElMessage.success(`已添加 ${texts.length} 条`)
    } else {
      await vectorAddDocument(text)
      ElMessage.success('添加成功')
    }
    addText.value = ''
    loadStats()
  } catch (e) {
    ElMessage.error(e.message || '添加失败')
  } finally {
    addLoading.value = false
  }
}

const doSearch = async () => {
  const q = searchQuery.value?.trim()
  if (!q) {
    ElMessage.warning('请输入查询')
    return
  }
  searchLoading.value = true
  searchResults.value = []
  try {
    const res = await vectorSearch(q, searchTopK.value)
    searchResults.value = res.results || []
  } catch (e) {
    ElMessage.error(e.message || '检索失败')
  } finally {
    searchLoading.value = false
  }
}

const syncFromDevices = async () => {
  try {
    const res = await vectorSyncFromDevices()
    ElMessage.success(`同步完成，新增 ${res.documentsAdded ?? 0} 条`)
    loadStats()
  } catch (e) {
    ElMessage.error(e.message || '同步失败')
  }
}

const clearVector = async () => {
  await ElMessageBox.confirm('确定清空整个向量库？此操作不可恢复。', '警告', {
    type: 'warning'
  })
  try {
    await vectorClear()
    ElMessage.success('已清空')
    loadStats()
    searchResults.value = []
  } catch (e) {
    ElMessage.error(e.message || '清空失败')
  }
}

onMounted(loadStats)
</script>
