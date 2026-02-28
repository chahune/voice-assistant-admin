import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('../views/Layout.vue'),
    redirect: '/home',
    children: [
      { path: 'home', name: 'Home', component: () => import('../views/Home.vue'), meta: { title: '概览' } },
      { path: 'voice', name: 'Voice', component: () => import('../views/Voice.vue'), meta: { title: '语音管道' } },
      { path: 'devices', name: 'Devices', component: () => import('../views/Devices.vue'), meta: { title: '设备管理' } },
      { path: 'vector', name: 'Vector', component: () => import('../views/Vector.vue'), meta: { title: '知识库' } },
      { path: 'chat-history', name: 'ChatHistory', component: () => import('../views/ChatHistory.vue'), meta: { title: '问答记录' } }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
