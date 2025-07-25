<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

onMounted(async () => {
  // 初始化认证状态
  await authStore.initAuth()
})
</script>

<style>
/* 全局样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
}

#app {
  height: 100vh;
  background-color: #F8F9FA;
}

/* 平板设备优化 */
@media (max-width: 1024px) {
  .el-button {
    min-height: 48px;
    min-width: 120px;
    font-size: 18px;
  }
  
  .el-input {
    height: 44px;
  }
}

/* 自定义主题色 */
:root {
  --primary-color: #FF6B35;
  --secondary-color: #2E4057;
  --success-color: #28A745;
  --warning-color: #FFC107;
  --danger-color: #DC3545;
  --info-color: #17A2B8;
  --text-color: #333333;
  --background-color: #F8F9FA;
}
</style> 