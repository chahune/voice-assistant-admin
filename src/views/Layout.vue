<template>
  <el-container class="layout">
    <el-aside width="200px" class="aside">
      <div class="logo">语音助手管理</div>
      <el-menu
        :default-active="$route.path"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409eff"
      >
        <el-menu-item index="/home">
          <el-icon><House /></el-icon>
          <span>概览</span>
        </el-menu-item>
        <el-menu-item index="/voice">
          <el-icon><Microphone /></el-icon>
          <span>语音管道</span>
        </el-menu-item>
        <el-menu-item index="/devices">
          <el-icon><Setting /></el-icon>
          <span>设备管理</span>
        </el-menu-item>
        <el-menu-item index="/vector">
          <el-icon><Document /></el-icon>
          <span>知识库</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-main class="main">
      <router-view />
    </el-main>
  </el-container>
</template>

<script setup>
import { House, Microphone, Setting, Document } from '@element-plus/icons-vue'
</script>

<style scoped>
.layout { height: 100vh; }
.aside {
  background: #304156;
  color: #fff;
}
.logo {
  height: 50px;
  line-height: 50px;
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  color: #fff;
  background: #263445;
}
.main {
  background: #f0f2f5;
  padding: 20px;
  overflow-y: auto;
}
</style>
