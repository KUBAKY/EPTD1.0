<template>
  <Layout>
    <div class="member-detail-container">
      <div class="page-header">
        <div class="header-left">
          <h1>会员详情</h1>
          <p class="page-subtitle">查看和管理会员信息</p>
          <div v-if="member" class="member-id-display">
            <el-tag type="info" size="small">
              当前会员ID: {{ member.id }}
            </el-tag>
          </div>
        </div>
        <div class="header-actions">
          <el-button @click="$router.go(-1)" icon="ArrowLeft">返回</el-button>
          <el-button type="primary" @click="startTraining" icon="VideoPlay">
            开始训练
          </el-button>
        </div>
      </div>
      
      <el-card v-if="member" class="member-detail-card">
        <el-descriptions title="基本信息" :column="2" border>
          <el-descriptions-item label="会员ID">
            <el-tag 
              type="info" 
              @click="copyMemberId(member.id)"
              style="cursor: pointer;"
            >
              {{ member.id }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="姓名">{{ member.name }}</el-descriptions-item>
          <el-descriptions-item label="手机号">{{ member.phone }}</el-descriptions-item>
          <el-descriptions-item label="性别">{{ member.gender === 'male' ? '男' : '女' }}</el-descriptions-item>
          <el-descriptions-item label="年龄">{{ member.age }}岁</el-descriptions-item>
          <el-descriptions-item label="身高">{{ member.height }}cm</el-descriptions-item>
          <el-descriptions-item label="体重">{{ member.weight }}kg</el-descriptions-item>
          <el-descriptions-item label="BMI">{{ member.bmi }}</el-descriptions-item>
          <el-descriptions-item label="加入时间">{{ formatDate(member.created_at) }}</el-descriptions-item>
        </el-descriptions>
        
        <el-divider />
        
        <el-descriptions title="健康信息" :column="1" border>
          <el-descriptions-item label="健康历史">
            {{ member.health_history || '无特殊病史' }}
          </el-descriptions-item>
          <el-descriptions-item label="运动禁忌">
            {{ member.medical_restrictions || '无运动禁忌' }}
          </el-descriptions-item>
        </el-descriptions>
        
        <el-divider />
        
        <div class="action-buttons">
          <el-button type="primary" @click="startTraining" icon="VideoPlay">
            开始训练
          </el-button>
          <el-button @click="editMember" icon="Edit">
            编辑信息
          </el-button>
          <el-button @click="viewHistory" icon="Document">
            训练历史
          </el-button>
        </div>
      </el-card>
      
      <el-empty v-else description="会员信息加载中..." />
    </div>

    <!-- 编辑会员对话框 -->
    <MemberEditDialog
      v-model:visible="showEditDialog"
      :member="member"
      @success="handleEditSuccess"
    />
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, VideoPlay, Edit, Document } from '@element-plus/icons-vue'
import Layout from '@/components/Layout.vue'
import MemberEditDialog from '@/components/MemberEditDialog.vue'
import { http } from '@/utils/http'

const route = useRoute()
const router = useRouter()
const member = ref(null)
const showEditDialog = ref(false)

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

const loadMember = async () => {
  try {
    const response = await http.get(`/api/members/${route.params.id}`)
    if (response.ok) {
      const data = await response.json()
      member.value = data.data
    } else {
      ElMessage.error('加载会员信息失败')
    }
  } catch (error: any) {
    ElMessage.error('加载会员信息失败')
  }
}

const startTraining = () => {
  router.push(`/training/${route.params.id}`)
}

const editMember = () => {
  showEditDialog.value = true
}

const handleEditSuccess = () => {
  loadMember() // 重新加载会员信息
}

const viewHistory = () => {
  router.push(`/logs?member_id=${route.params.id}`)
}

const copyMemberId = (id: string) => {
  navigator.clipboard.writeText(id).then(() => {
    ElMessage.success('会员ID已复制到剪贴板')
  }).catch(() => {
    ElMessage.error('复制会员ID失败')
  })
}

onMounted(() => {
  loadMember()
})
</script>

<style scoped>
.member-detail-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-left {
  flex-grow: 1;
}

.page-subtitle {
  font-size: 14px;
  color: #606266;
  margin-top: 5px;
}

.member-id-display {
  margin-top: 10px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.member-detail-card {
  max-width: 800px;
  margin: 0 auto;
}

.action-buttons {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 20px;
}
</style>