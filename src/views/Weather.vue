<template>
  <div>
    <h2>天气查询</h2>
    <el-card style="margin-top: 20px; max-width: 480px">
      <el-input
        v-model="city"
        placeholder="输入城市名，如：成都"
        clearable
        style="margin-bottom: 12px"
      >
        <template #append>
          <el-button type="primary" :loading="loading" @click="doQuery">查询</el-button>
        </template>
      </el-input>
      <div v-if="result" class="result">
        <p><strong>{{ result.province }}{{ result.city }}</strong></p>
        <p>气温：{{ result.temperature != null ? result.temperature + '℃' : '-' }}，体感：{{ result.feelst != null ? result.feelst + '℃' : '-' }}</p>
        <p>湿度：{{ result.humidity != null ? result.humidity + '%' : '-' }}</p>
        <p>风力：{{ result.wind || '-' }}</p>
        <p class="muted">发布时间：{{ result.publishTime || '-' }}</p>
      </div>
      <div v-else-if="error" class="error">{{ error }}</div>
      <div v-else class="muted">输入城市后点击查询，数据来源：中央气象台</div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { getWeather } from '../api'

const city = ref('成都')
const loading = ref(false)
const result = ref(null)
const error = ref('')

const doQuery = async () => {
  const c = city.value?.trim()
  if (!c) {
    ElMessage.warning('请输入城市名')
    return
  }
  loading.value = true
  result.value = null
  error.value = ''
  try {
    const data = await getWeather(c)
    if (data.error) throw new Error(data.error)
    result.value = data
    ElMessage.success('查询成功')
  } catch (e) {
    error.value = e.message || '获取天气失败'
    ElMessage.error(error.value)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.result {
  margin-top: 16px;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
  line-height: 1.8;
}
.result p { margin: 0 0 4px; }
.error { color: #f56c6c; margin-top: 12px; }
.muted { color: #909399; font-size: 13px; }
</style>
