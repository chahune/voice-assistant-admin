<template>
  <div>
    <h2>概览</h2>
    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>服务状态</template>
          <div v-if="loading">检测中...</div>
          <div v-else>
            <el-tag :type="health ? 'success' : 'danger'">
              {{ health ? '正常' : '异常' }}
            </el-tag>
            <p style="margin-top: 8px; color: #666; font-size: 12px">
              {{ health ? 'voice-assistant-api 运行正常' : '无法连接后端，请确认服务已启动' }}
            </p>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>知识库</template>
          <div v-if="statsLoading">加载中...</div>
          <div v-else>
            <span style="font-size: 24px; font-weight: 600">{{ stats?.count ?? '-' }}</span>
            <span style="margin-left: 8px; color: #666">条文档</span>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>设备</template>
          <div v-if="devicesLoading">加载中...</div>
          <div v-else>
            <span style="font-size: 24px; font-weight: 600">{{ devices?.length ?? 0 }}</span>
            <span style="margin-left: 8px; color: #666">台设备</span>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-card style="margin-top: 20px" shadow="hover">
      <template #header>快速操作</template>
      <el-space wrap>
        <el-button type="primary" @click="$router.push('/voice')">语音上传 / TTS</el-button>
        <el-button @click="$router.push('/devices')">设备管理</el-button>
        <el-button @click="$router.push('/vector')">知识库管理</el-button>
      </el-space>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { voiceHealth, vectorStats, deviceList } from '../api'

const loading = ref(true)
const health = ref(false)
const statsLoading = ref(true)
const stats = ref(null)
const devicesLoading = ref(true)
const devices = ref([])

onMounted(async () => {
  try {
    await voiceHealth()
    health.value = true
  } catch {
    health.value = false
  } finally {
    loading.value = false
  }

  try {
    stats.value = await vectorStats()
  } catch {}
  finally { statsLoading.value = false }

  try {
    devices.value = await deviceList(undefined, true)
  } catch {}
  finally { devicesLoading.value = false }
})
</script>
