<template>
  <Layout>
    <div class="settings-page">
      <!-- 页面头部 -->
      <div class="page-header">
        <h1 class="page-title">系统设置</h1>
        <p class="page-subtitle">管理系统配置和偏好设置</p>
      </div>

      <div class="settings-content">
        <el-row :gutter="24">
          <!-- 左侧：基本设置 -->
          <el-col :span="12">
            <el-card class="settings-card">
              <template #header>
                <span>基本设置</span>
              </template>
              
              <el-form label-width="120px">
                <el-form-item label="语言设置">
                  <el-select v-model="settings.language" placeholder="选择语言">
                    <el-option label="简体中文" value="zh-CN" />
                    <el-option label="English" value="en-US" />
                  </el-select>
                </el-form-item>
                
                <el-form-item label="主题设置">
                  <el-select v-model="settings.theme" placeholder="选择主题">
                    <el-option label="浅色主题" value="light" />
                    <el-option label="深色主题" value="dark" />
                    <el-option label="自动" value="auto" />
                  </el-select>
                </el-form-item>
                
                <el-form-item label="页面大小">
                  <el-select v-model="settings.pageSize" placeholder="选择页面大小">
                    <el-option label="10条/页" :value="10" />
                    <el-option label="20条/页" :value="20" />
                    <el-option label="50条/页" :value="50" />
                    <el-option label="100条/页" :value="100" />
                  </el-select>
                </el-form-item>
                
                <el-form-item label="自动保存">
                  <el-switch
                    v-model="settings.autoSave"
                    active-text="开启"
                    inactive-text="关闭"
                  />
                </el-form-item>
                
                <el-form-item label="消息通知">
                  <el-switch
                    v-model="settings.notifications"
                    active-text="开启"
                    inactive-text="关闭"
                  />
                </el-form-item>
              </el-form>
            </el-card>
          </el-col>

          <!-- 右侧：高级设置 -->
          <el-col :span="12">
            <el-card class="settings-card">
              <template #header>
                <span>高级设置</span>
              </template>
              
              <el-form label-width="120px">
                <el-form-item label="数据导出">
                  <el-button type="primary" @click="handleExportData">
                    导出数据
                  </el-button>
                  <span class="setting-description">导出您的训练记录和会员数据</span>
                </el-form-item>
                
                <el-form-item label="数据备份">
                  <el-button type="success" @click="handleBackupData">
                    创建备份
                  </el-button>
                  <span class="setting-description">创建系统数据的完整备份</span>
                </el-form-item>
                
                <el-form-item label="清除缓存">
                  <el-button type="warning" @click="handleClearCache">
                    清除缓存
                  </el-button>
                  <span class="setting-description">清除浏览器缓存和本地存储</span>
                </el-form-item>
                
                <el-form-item label="系统信息">
                  <div class="system-info">
                    <p><strong>版本：</strong>v1.0.0</p>
                    <p><strong>构建时间：</strong>{{ buildTime }}</p>
                    <p><strong>数据库：</strong>SQLite</p>
                    <p><strong>后端：</strong>Node.js + Express</p>
                    <p><strong>前端：</strong>Vue 3 + TypeScript</p>
                  </div>
                </el-form-item>
              </el-form>
            </el-card>
          </el-col>
        </el-row>

        <!-- 保存按钮 -->
        <div class="settings-actions">
          <el-button type="primary" @click="handleSaveSettings" :loading="saving">
            保存设置
          </el-button>
          <el-button @click="handleResetSettings">
            重置设置
          </el-button>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import Layout from '@/components/Layout.vue'

// 响应式数据
const saving = ref(false)

// 设置数据
const settings = reactive({
  language: 'zh-CN',
  theme: 'light',
  pageSize: 20,
  autoSave: true,
  notifications: true
})

// 构建时间
const buildTime = new Date().toLocaleDateString('zh-CN')

// 保存设置
const handleSaveSettings = async () => {
  try {
    saving.value = true
    
    // 保存到本地存储
    localStorage.setItem('wellmotion-settings', JSON.stringify(settings))
    
    // 模拟API调用
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    ElMessage.success('设置保存成功')
  } catch (error) {
    ElMessage.error('设置保存失败')
  } finally {
    saving.value = false
  }
}

// 重置设置
const handleResetSettings = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要重置所有设置吗？此操作不可恢复。',
      '确认重置',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 重置为默认设置
    Object.assign(settings, {
      language: 'zh-CN',
      theme: 'light',
      pageSize: 20,
      autoSave: true,
      notifications: true
    })
    
    localStorage.removeItem('wellmotion-settings')
    ElMessage.success('设置已重置')
  } catch {
    // 用户取消
  }
}

// 导出数据
const handleExportData = async () => {
  try {
    ElMessage.info('数据导出功能开发中...')
    // TODO: 实现数据导出功能
  } catch (error) {
    ElMessage.error('数据导出失败')
  }
}

// 数据备份
const handleBackupData = async () => {
  try {
    ElMessage.info('数据备份功能开发中...')
    // TODO: 实现数据备份功能
  } catch (error) {
    ElMessage.error('数据备份失败')
  }
}

// 清除缓存
const handleClearCache = async () => {
  try {
    await ElMessageBox.confirm(
      '确定要清除缓存吗？这将清除所有本地存储的数据。',
      '确认清除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 清除本地存储
    localStorage.clear()
    sessionStorage.clear()
    
    ElMessage.success('缓存清除成功')
  } catch {
    // 用户取消
  }
}

// 初始化设置
const initSettings = () => {
  const savedSettings = localStorage.getItem('wellmotion-settings')
  if (savedSettings) {
    try {
      const parsed = JSON.parse(savedSettings)
      Object.assign(settings, parsed)
    } catch (error) {
      console.error('加载设置失败:', error)
    }
  }
}

// 页面加载时初始化设置
initSettings()
</script>

<style scoped>
.settings-page {
  padding: 24px;
}

.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  color: var(--text-color);
  margin: 0;
}

.page-subtitle {
  font-size: 14px;
  color: #666;
  margin: 8px 0 0 0;
}

.settings-content {
  margin-bottom: 24px;
}

.settings-card {
  height: 100%;
  margin-bottom: 20px;
}

.setting-description {
  margin-left: 12px;
  font-size: 12px;
  color: #999;
}

.system-info {
  font-size: 14px;
  color: #666;
}

.system-info p {
  margin: 4px 0;
}

.settings-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
}

/* 平板设备优化 */
@media (max-width: 768px) {
  .settings-content .el-col {
    margin-bottom: 20px;
  }
  
  .settings-actions {
    flex-direction: column;
    align-items: center;
  }
}
</style> 