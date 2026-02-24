<template>
  <div>
    <h2>设备管理</h2>
    <el-card style="margin-top: 20px">
      <el-form inline class="filter-form">
        <el-form-item label="房间">
          <el-input v-model="roomFilter" placeholder="可选" clearable style="width: 120px" />
        </el-form-item>
        <el-form-item label="包含禁用">
          <el-switch v-model="showAll" />
        </el-form-item>
        <el-form-item>
          <el-space :size="12">
            <el-button type="primary" @click="loadDevices">查询</el-button>
            <el-button @click="openForm()">新增设备</el-button>
          </el-space>
        </el-form-item>
      </el-form>
      <el-table :data="devices" stripe>
        <el-table-column prop="deviceId" label="设备ID" width="120" />
        <el-table-column prop="deviceName" label="名称" width="100" />
        <el-table-column prop="room" label="房间" width="80" />
        <el-table-column prop="deviceType" label="类型" width="80" />
        <el-table-column prop="connectionUrl" label="连接地址" min-width="160" show-overflow-tooltip />
        <el-table-column prop="controlMethod" label="方式" width="70" />
        <el-table-column prop="enabled" label="启用" width="70">
          <template #default="{ row }">
            <el-tag :type="row.enabled ? 'success' : 'info'">{{ row.enabled ? '是' : '否' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="控制" width="240" fixed="right">
          <template #default="{ row }">
            <el-space :size="8" wrap>
              <el-button size="small" type="success" @click="control(row, true)">开</el-button>
              <el-button size="small" type="danger" @click="control(row, false)">关</el-button>
              <el-button size="small" @click="openForm(row)">编辑</el-button>
              <el-button size="small" type="danger" link @click="del(row)">删除</el-button>
            </el-space>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 表单弹窗 -->
    <el-dialog
      v-model="formVisible"
      :title="formData.id ? '编辑设备' : '新增设备'"
      width="500px"
      @close="resetForm"
    >
      <el-form :model="formData" label-width="100px">
        <el-form-item label="设备ID" required>
          <el-input v-model="formData.deviceId" placeholder="device_001" :disabled="!!formData.id" />
        </el-form-item>
        <el-form-item label="名称">
          <el-input v-model="formData.deviceName" placeholder="客厅主灯" />
        </el-form-item>
        <el-form-item label="房间" required>
          <el-input v-model="formData.room" placeholder="客厅" />
        </el-form-item>
        <el-form-item label="房间ID">
          <el-input v-model="formData.roomId" placeholder="living_room" />
        </el-form-item>
        <el-form-item label="类型">
          <el-input v-model="formData.deviceType" placeholder="light" />
        </el-form-item>
        <el-form-item label="连接地址" required>
          <el-input v-model="formData.connectionUrl" placeholder="http://192.168.1.100:8080" />
        </el-form-item>
        <el-form-item label="控制方式">
          <el-select v-model="formData.controlMethod" placeholder="POST">
            <el-option label="GET" value="GET" />
            <el-option label="POST" value="POST" />
          </el-select>
        </el-form-item>
        <el-form-item label="开指令">
          <el-input v-model="formData.controlOn" type="textarea" placeholder='GET: /on 或 POST: {"action":"on"}' />
        </el-form-item>
        <el-form-item label="关指令">
          <el-input v-model="formData.controlOff" type="textarea" placeholder='GET: /off 或 POST: {"action":"off"}' />
        </el-form-item>
        <el-form-item label="启用">
          <el-switch v-model="formData.enabled" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { deviceList, deviceCreate, deviceUpdate, deviceDelete, deviceControl } from '../api'

const roomFilter = ref('')
const showAll = ref(true)
const devices = ref([])
const formVisible = ref(false)
const submitting = ref(false)
const formData = reactive({
  id: null,
  deviceId: '',
  deviceName: '',
  room: '',
  roomId: '',
  deviceType: 'light',
  connectionUrl: '',
  controlMethod: 'POST',
  controlOn: '{"action":"on"}',
  controlOff: '{"action":"off"}',
  enabled: true
})

const loadDevices = async () => {
  try {
    devices.value = await deviceList(roomFilter.value || undefined, showAll.value)
  } catch (e) {
    ElMessage.error(e.message || '加载失败')
  }
}

const openForm = (row) => {
  if (!row) {
    resetForm()
  } else {
    Object.assign(formData, {
      id: row.id,
      deviceId: row.deviceId,
      deviceName: row.deviceName,
      room: row.room,
      roomId: row.roomId,
      deviceType: row.deviceType || 'light',
      connectionUrl: row.connectionUrl,
      controlMethod: row.controlMethod || 'POST',
      controlOn: row.controlOn || '{"action":"on"}',
      controlOff: row.controlOff || '{"action":"off"}',
      enabled: row.enabled !== false
    })
  }
  formVisible.value = true
}

const resetForm = () => {
  formData.id = null
  formData.deviceId = ''
  formData.deviceName = ''
  formData.room = ''
  formData.roomId = ''
  formData.deviceType = 'light'
  formData.connectionUrl = ''
  formData.controlMethod = 'POST'
  formData.controlOn = '{"action":"on"}'
  formData.controlOff = '{"action":"off"}'
  formData.enabled = true
}

const submitForm = async () => {
  if (!formData.deviceId?.trim() || !formData.room?.trim() || !formData.connectionUrl?.trim()) {
    ElMessage.warning('请填写设备ID、房间、连接地址')
    return
  }
  submitting.value = true
  try {
    const payload = { ...formData }
    delete payload.id
    if (formData.id) {
      await deviceUpdate(formData.id, payload)
      ElMessage.success('更新成功')
    } else {
      await deviceCreate(payload)
      ElMessage.success('新增成功')
    }
    formVisible.value = false
    loadDevices()
  } catch (e) {
    ElMessage.error(e.message || '操作失败')
  } finally {
    submitting.value = false
  }
}

const control = async (row, turnOn) => {
  try {
    const res = await deviceControl({
      deviceId: row.deviceId,
      action: turnOn ? 'on' : 'off'
    })
    ElMessage.success(res.success ? '指令已下发' : '下发失败或设备无响应')
    if (res.success) loadDevices()
  } catch (e) {
    ElMessage.error(e.message || '控制失败')
  }
}

const del = async (row) => {
  await ElMessageBox.confirm('确定删除该设备？', '提示', {
    type: 'warning'
  })
  try {
    await deviceDelete(row.id)
    ElMessage.success('删除成功')
    loadDevices()
  } catch (e) {
    ElMessage.error(e.message || '删除失败')
  }
}

onMounted(loadDevices)
</script>

<style scoped>
.filter-form :deep(.el-form-item) {
  margin-right: 20px;
}
</style>
