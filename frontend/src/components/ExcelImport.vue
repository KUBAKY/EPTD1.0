<template>
  <div class="excel-import">
    <el-card class="import-card">
      <template #header>
        <div class="card-header">
          <span class="title">{{ title }}</span>
          <el-button type="primary" @click="downloadTemplate" :loading="downloading">
            下载模板
          </el-button>
        </div>
      </template>

      <div class="import-content">
        <!-- 文件上传区域 -->
        <el-upload
          ref="uploadRef"
          class="upload-area"
          drag
          :action="uploadUrl"
          :headers="uploadHeaders"
          :before-upload="beforeUpload"
          :on-success="onUploadSuccess"
          :on-error="onUploadError"
          :show-file-list="false"
          accept=".xlsx,.xls"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            将文件拖到此处，或<em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              只能上传 xlsx/xls 文件，且不超过 10MB
            </div>
          </template>
        </el-upload>

        <!-- 模板说明 -->
        <div class="template-info" v-if="templateInfo">
          <h4>模板说明：</h4>
          <p>{{ templateInfo.description }}</p>
          
          <h4>必填字段：</h4>
          <el-tag 
            v-for="field in templateInfo.headers" 
            :key="field"
            class="field-tag"
            :type="isRequiredField(field) ? 'danger' : 'info'"
          >
            {{ field }}
          </el-tag>

          <h4>示例数据：</h4>
          <el-table :data="templateInfo.example" border size="small" class="example-table">
            <el-table-column 
              v-for="(header, index) in templateInfo.headers" 
              :key="index"
              :prop="String(index)"
              :label="header"
              width="120"
            />
          </el-table>
        </div>

        <!-- 导入结果 -->
        <div class="import-results" v-if="importResults">
          <h4>导入结果：</h4>
          
          <div class="result-summary">
            <el-tag type="success" class="result-tag">
              成功: {{ importResults.totalSuccess }}
            </el-tag>
            <el-tag type="danger" class="result-tag" v-if="importResults.totalErrors > 0">
              失败: {{ importResults.totalErrors }}
            </el-tag>
          </div>

          <!-- 成功列表 -->
          <div v-if="importResults.success.length > 0" class="success-list">
            <h5>成功导入：</h5>
            <el-tag 
              v-for="(item, index) in importResults.success" 
              :key="index"
              type="success"
              class="result-item"
            >
              {{ item }}
            </el-tag>
          </div>

          <!-- 错误列表 -->
          <div v-if="importResults.errors.length > 0" class="error-list">
            <h5>导入失败：</h5>
            <el-tag 
              v-for="(item, index) in importResults.errors" 
              :key="index"
              type="danger"
              class="result-item"
            >
              {{ item }}
            </el-tag>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import { http } from '@/utils/http'

interface Props {
  type: 'members' | 'coaches' | 'templates' | 'exercises'
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: 'Excel批量导入'
})

const emit = defineEmits(['import-success'])

const authStore = useAuthStore()
const uploadRef = ref()
const downloading = ref(false)
const templateInfo = ref<any>(null)
const importResults = ref<any>(null)

// 计算属性
const uploadUrl = computed(() => {
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
  return `${baseUrl}/api/import/${props.type}`
})

const uploadHeaders = computed(() => ({
  'Authorization': `Bearer ${authStore.token}`
}))

const displayTitle = computed(() => {
  const titles = {
    members: '会员信息批量导入',
    coaches: '教练信息批量导入',
    templates: '训练模板批量导入',
    exercises: '训练动作批量导入'
  }
  return titles[props.type] || props.title
})

// 方法
const isRequiredField = (field: string) => {
  const requiredFields = {
    members: ['姓名', '手机号', '性别', '年龄'],
    coaches: ['用户名', '姓名', '密码', '角色', '手机号', '状态'],
    templates: ['模板名称', '模板分类', '功能说明', '禁忌条件', '训练内容(JSON格式)'],
    exercises: ['动作名称', '类别', '描述', '目标肌群', '难度等级', '注意事项', '变量1类型', '变量2类型']
  }
  return requiredFields[props.type]?.includes(field) || false
}

const loadTemplateInfo = async () => {
  try {
    const response = await http.get(`/api/import/templates/${props.type}`)
    if (response && 'success' in response && response.success) {
      templateInfo.value = (response as any).data
    }
  } catch (error) {
    console.error('加载模板信息失败:', error)
  }
}

const downloadTemplate = async () => {
  downloading.value = true
  try {
    // 从后端下载模板文件
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
    const response = await fetch(`${baseUrl}/api/import/download/${props.type}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${authStore.token}`
      }
    })
    
    if (!response.ok) {
      throw new Error('下载失败')
    }
    
    // 获取文件名
    const contentDisposition = response.headers.get('content-disposition')
    let fileName = `${displayTitle.value}_模板.xlsx`
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/)
      if (filenameMatch) {
        fileName = filenameMatch[1]
      }
    }
    
    // 创建blob并下载
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    ElMessage.success('模板下载成功')
  } catch (error) {
    console.error('下载模板失败:', error)
    ElMessage.error('模板下载失败')
  } finally {
    downloading.value = false
  }
}

const beforeUpload = (file: File) => {
  const isExcel = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                  file.type === 'application/vnd.ms-excel' ||
                  file.name.endsWith('.xlsx') ||
                  file.name.endsWith('.xls')
  
  if (!isExcel) {
    ElMessage.error('只能上传Excel文件!')
    return false
  }
  
  const isLt10M = file.size / 1024 / 1024 < 10
  if (!isLt10M) {
    ElMessage.error('文件大小不能超过10MB!')
    return false
  }
  
  return true
}

const onUploadSuccess = (response: any) => {
  if (response.success) {
    importResults.value = response.data
    ElMessage.success(response.message)
    emit('import-success', response.data)
  } else {
    ElMessage.error(response.message || '导入失败')
  }
}

const onUploadError = (error: any) => {
  console.error('上传失败:', error)
  ElMessage.error('文件上传失败，请重试')
}

// 生命周期
onMounted(() => {
  loadTemplateInfo()
})
</script>

<style scoped>
.excel-import {
  max-width: 800px;
  margin: 0 auto;
}

.import-card {
  margin: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title {
  font-size: 18px;
  font-weight: bold;
}

.import-content {
  padding: 20px 0;
}

.upload-area {
  width: 100%;
  margin-bottom: 30px;
}

.template-info {
  margin-top: 30px;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.template-info h4 {
  margin: 15px 0 10px 0;
  color: #303133;
}

.template-info p {
  margin: 10px 0;
  color: #606266;
  line-height: 1.6;
}

.field-tag {
  margin: 5px;
}

.example-table {
  margin-top: 15px;
}

.import-results {
  margin-top: 30px;
  padding: 20px;
  background-color: #f0f9ff;
  border-radius: 8px;
}

.result-summary {
  margin-bottom: 20px;
}

.result-tag {
  margin-right: 10px;
}

.success-list,
.error-list {
  margin-top: 15px;
}

.success-list h5,
.error-list h5 {
  margin: 10px 0;
  color: #303133;
}

.result-item {
  margin: 5px;
  display: block;
}

:deep(.el-upload-dragger) {
  width: 100%;
  height: 200px;
}

:deep(.el-upload__text) {
  margin-top: 10px;
}

:deep(.el-upload__tip) {
  margin-top: 10px;
}
</style> 