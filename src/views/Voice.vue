<template>
  <div>
    <h2>语音管道</h2>
    <el-tabs v-model="activeTab" style="margin-top: 20px">
      <!-- 语音上传 -->
      <el-tab-pane label="语音上传（端到端）" name="upload">
        <el-card>
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :limit="1"
            accept=".wav,.mp3"
            :on-change="onFileChange"
            :file-list="uploadFiles"
          >
            <el-button type="primary">选择 WAV/MP3 文件</el-button>
          </el-upload>
          <el-button
            type="success"
            :loading="uploading"
            :disabled="!currentFile"
            style="margin-top: 12px"
            @click="doUpload"
          >
            上传并处理（ASR → LLM → TTS）
          </el-button>
          <div v-if="uploadResult" style="margin-top: 20px; padding: 12px; background: #f5f7fa; border-radius: 8px">
            <p><strong>识别：</strong>{{ uploadResult.text }}</p>
            <p><strong>回复：</strong>{{ uploadResult.reply }}</p>
            <p v-if="uploadResult.audioUrl">
              <strong>音频：</strong>
              <el-button link type="primary" @click="playAudio(uploadResult.audioUrl)">播放</el-button>
            </p>
          </div>
        </el-card>
      </el-tab-pane>

      <!-- TTS -->
      <el-tab-pane label="文字转语音" name="tts">
        <el-card>
          <el-input
            v-model="ttsText"
            type="textarea"
            :rows="4"
            placeholder="输入要合成的文字"
          />
          <el-button
            type="primary"
            :loading="ttsLoading"
            style="margin-top: 12px"
            @click="doTts"
          >
            合成语音
          </el-button>
          <div v-if="ttsResult" style="margin-top: 16px">
            <el-button link type="primary" @click="playAudio(ttsResult)">播放</el-button>
          </div>
        </el-card>
      </el-tab-pane>

      <!-- 千问文本对话 -->
      <el-tab-pane label="千问文本对话（线上）" name="qwen">
        <el-card>
          <el-input
            v-model="qwenText"
            type="textarea"
            :rows="4"
            placeholder="输入问题（需配置 spring.profiles.active=online 及 qwen-api-key）"
          />
          <el-button
            type="primary"
            :loading="qwenLoading"
            style="margin-top: 12px"
            @click="doQwen"
          >
            发送
          </el-button>
          <div v-if="qwenResult" style="margin-top: 20px; padding: 12px; background: #f5f7fa; border-radius: 8px">
            <p><strong>回复：</strong>{{ qwenResult.text }}</p>
            <p v-if="qwenResult.audioUrl">
              <el-button link type="primary" @click="playAudio(qwenResult.audioUrl)">播放语音</el-button>
            </p>
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { voiceUpload, voiceTts, voiceQwen } from '../api'

const activeTab = ref('upload')
const uploadRef = ref()
const uploadFiles = ref([])
const currentFile = ref(null)
const uploading = ref(false)
const uploadResult = ref(null)

const onFileChange = (_file, fileList) => {
  const last = fileList?.length ? fileList[fileList.length - 1] : null
  currentFile.value = last?.raw ?? null
  uploadFiles.value = last ? [last] : []
}

const doUpload = async () => {
  if (!currentFile.value) return
  uploading.value = true
  uploadResult.value = null
  try {
    const res = await voiceUpload(currentFile.value)
    if (res.error) throw new Error(res.error)
    uploadResult.value = res
    ElMessage.success('处理完成')
  } catch (e) {
    ElMessage.error(e.message || '处理失败')
  } finally {
    uploading.value = false
  }
}

const ttsText = ref('')
const ttsLoading = ref(false)
const ttsResult = ref('')
const doTts = async () => {
  if (!ttsText.value?.trim()) {
    ElMessage.warning('请输入文字')
    return
  }
  ttsLoading.value = true
  ttsResult.value = ''
  try {
    const res = await voiceTts(ttsText.value.trim())
    if (res.error) throw new Error(res.error)
    ttsResult.value = res.audioUrl || (res.filename ? '/tts/' + res.filename : '')
    ElMessage.success('合成完成')
  } catch (e) {
    ElMessage.error(e.message || 'TTS 失败')
  } finally {
    ttsLoading.value = false
  }
}

const qwenText = ref('')
const qwenLoading = ref(false)
const qwenResult = ref(null)
const doQwen = async () => {
  if (!qwenText.value?.trim()) {
    ElMessage.warning('请输入问题')
    return
  }
  qwenLoading.value = true
  qwenResult.value = null
  try {
    const res = await voiceQwen(qwenText.value.trim())
    if (res.error) throw new Error(res.error)
    qwenResult.value = res
    ElMessage.success('完成')
  } catch (e) {
    ElMessage.error(e.message || '请求失败')
  } finally {
    qwenLoading.value = false
  }
}

const playAudio = (url) => {
  if (!url) return
  // 使用相对路径走 Vite 代理
  const path = url.includes('/tts/') ? '/tts/' + url.split('/tts/').pop() : url
  const audio = new Audio(path)
  audio.play().catch(() => ElMessage.error('播放失败'))
}
</script>
