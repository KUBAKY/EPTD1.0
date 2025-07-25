<template>
  <div class="import-page">
    <el-page-header @back="goBack" title="返回">
      <template #content>
        <span class="page-title">数据批量导入</span>
      </template>
    </el-page-header>

    <div class="import-container">
      <el-tabs v-model="activeTab" type="card" class="import-tabs">
        <el-tab-pane label="会员信息导入" name="members">
          <ExcelImport 
            type="members" 
            @import-success="handleImportSuccess"
          />
        </el-tab-pane>
        
        <el-tab-pane label="教练信息导入" name="coaches" v-if="isAdmin">
          <ExcelImport 
            type="coaches" 
            @import-success="handleImportSuccess"
          />
        </el-tab-pane>
        
        <el-tab-pane label="训练模板导入" name="templates">
          <ExcelImport 
            type="templates" 
            @import-success="handleImportSuccess"
          />
        </el-tab-pane>
        
        <el-tab-pane label="训练动作导入" name="exercises" v-if="isAdmin">
          <ExcelImport 
            type="exercises" 
            @import-success="handleImportSuccess"
          />
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'
import ExcelImport from '@/components/ExcelImport.vue'

const router = useRouter()
const authStore = useAuthStore()

const activeTab = ref('members')

// 计算属性
const isAdmin = computed(() => {
  return authStore.user?.role === 'admin'
})

// 方法
const goBack = () => {
  router.back()
}

const handleImportSuccess = (results: any) => {
  console.log('导入成功:', results)
  ElMessage.success(`导入完成！成功: ${results.totalSuccess}, 失败: ${results.totalErrors}`)
}
</script>

<style scoped>
.import-page {
  padding: 20px;
  background-color: #f5f7fa;
  min-height: 100vh;
}

.page-title {
  font-size: 20px;
  font-weight: bold;
  color: #303133;
}

.import-container {
  margin-top: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.import-tabs {
  padding: 20px;
}

:deep(.el-tabs__header) {
  margin-bottom: 20px;
}

:deep(.el-tabs__nav-wrap) {
  padding: 0 20px;
}

:deep(.el-tab-pane) {
  padding: 20px 0;
}
</style> 