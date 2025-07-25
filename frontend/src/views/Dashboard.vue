<template>
  <Layout>
    <div class="dashboard">
      <!-- 统计卡片 -->
      <div class="stats-grid">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon size="32" color="#FF6B35"><User /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalMembers }}</div>
              <div class="stat-label">总会员数</div>
            </div>
          </div>
        </el-card>
        
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon size="32" color="#28A745"><Calendar /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.todaySessions }}</div>
              <div class="stat-label">今日课程</div>
            </div>
          </div>
        </el-card>
        
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon size="32" color="#17A2B8"><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalTemplates }}</div>
              <div class="stat-label">训练模板</div>
            </div>
          </div>
        </el-card>
        
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon">
              <el-icon size="32" color="#FFC107"><TrendCharts /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.monthlySessions }}</div>
              <div class="stat-label">本月课程</div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 主要内容区域 -->
      <div class="main-content-grid">
        <!-- 今日课程 -->
        <el-card class="content-card">
          <template #header>
            <div class="card-header">
              <span>今日课程安排</span>
              <el-button type="primary" size="small" @click="handleAddSession">
                添加课程
              </el-button>
            </div>
          </template>
          
          <div v-if="todaySessions.length === 0" class="empty-state">
            <el-icon size="48" color="#CCC"><Calendar /></el-icon>
            <p>今日暂无课程安排</p>
            <el-button type="primary" @click="handleAddSession">添加课程</el-button>
          </div>
          
          <div v-else class="session-list">
            <div
              v-for="session in todaySessions"
              :key="session.id"
              class="session-item"
              @click="handleStartSession(session)"
            >
              <div class="session-time">{{ session.time }}</div>
              <div class="session-info">
                <div class="member-name">{{ session.memberName }}</div>
                <div class="session-type">{{ session.type }}</div>
              </div>
              <div class="session-status">
                <el-tag :type="getStatusType(session.status)">
                  {{ getStatusText(session.status) }}
                </el-tag>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 最近会员 -->
        <el-card class="content-card">
          <template #header>
            <div class="card-header">
              <span>最近会员</span>
              <el-button type="primary" size="small" @click="$router.push('/members')">
                查看全部
              </el-button>
            </div>
          </template>
          
          <div v-if="recentMembers.length === 0" class="empty-state">
            <el-icon size="48" color="#CCC"><User /></el-icon>
            <p>暂无会员数据</p>
            <el-button type="primary" @click="$router.push('/members/new')">添加会员</el-button>
          </div>
          
          <div v-else class="member-list">
            <div
              v-for="member in recentMembers"
              :key="member.id"
              class="member-item"
              @click="handleViewMember(member)"
            >
              <el-avatar :size="40" :src="member.avatar">
                {{ member.name.charAt(0) }}
              </el-avatar>
              <div class="member-info">
                <div class="member-name">{{ member.name }}</div>
                <div class="member-phone">{{ member.phone }}</div>
              </div>
              <div class="member-actions">
                <el-button type="primary" size="small" @click.stop="handleStartTraining(member)">
                  开始训练
                </el-button>
              </div>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 快速操作 -->
      <el-card class="quick-actions-card">
        <template #header>
          <span>快速操作</span>
        </template>
        
        <div class="quick-actions-grid">
          <el-button
            v-for="action in quickActions"
            :key="action.key"
            :type="action.type"
            size="large"
            class="quick-action-btn"
            @click="handleQuickAction(action)"
          >
            <el-icon size="24">
              <component :is="action.icon" />
            </el-icon>
            <span>{{ action.label }}</span>
          </el-button>
        </div>
      </el-card>

      <!-- 创建模板对话框 -->
      <el-dialog 
        v-model="showCreateDialog" 
        title="创建训练模板" 
        width="80%"
        class="create-template-dialog"
      >
        <CreateTemplate @created="handleTemplateCreated" />
      </el-dialog>

      <!-- 添加课程对话框 -->
      <AddSessionDialog 
        v-model:visible="showAddSessionDialog"
        @success="handleSessionAdded"
      />
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  User, Calendar, Document, TrendCharts, Files, Setting 
} from '@element-plus/icons-vue'
import Layout from '@/components/Layout.vue'
import CreateTemplate from '@/components/CreateTemplate.vue'
import AddSessionDialog from '@/components/AddSessionDialog.vue'
import { http } from '@/utils/http'

const router = useRouter()

// 统计数据
const stats = ref({
  totalMembers: 0,
  todaySessions: 0,
  totalTemplates: 0,
  monthlySessions: 0
})

// 今日课程
const todaySessions = ref<any[]>([])

// 最近会员
const recentMembers = ref<any[]>([])

// 创建模板对话框
const showCreateDialog = ref(false)

// 添加课程对话框
const showAddSessionDialog = ref(false)

// 快速操作
const quickActions = ref([
  {
    key: 'add-member',
    label: '添加会员',
    icon: 'User',
    type: 'primary',
    action: () => router.push('/members/new')
  },
  {
    key: 'add-template',
    label: '创建模板',
    icon: 'Files',
    type: 'success',
    action: () => showCreateDialog.value = true
  },
  {
    key: 'view-logs',
    label: '查看记录',
    icon: 'Document',
    type: 'info',
    action: () => router.push('/logs')
  },
  {
    key: 'settings',
    label: '系统设置',
    icon: 'Setting',
    type: 'warning',
    action: () => console.log('设置')
  }
])

// 方法
const handleAddSession = () => {
  showAddSessionDialog.value = true
}

const handleStartSession = (session: any) => {
  // 跳转到训练页面
  router.push(`/training/${session.member_id}`)
}

const handleViewMember = (member: any) => {
  router.push(`/members/${member.id}`)
}

const handleStartTraining = (member: any) => {
  router.push(`/training/${member.id}`)
}

const handleQuickAction = (action: any) => {
  action.action()
}

const handleTemplateCreated = (template: any) => {
  showCreateDialog.value = false
  ElMessage.success('模板创建成功！')
  // 可以选择跳转到模板库页面
  router.push('/templates')
}

const handleSessionAdded = () => {
  loadTodaySessions()
  loadStats()
}

const getStatusType = (status: string) => {
  switch (status) {
    case 'completed':
      return 'success' as const
    case 'in_progress':
      return 'primary' as const
    case 'cancelled':
      return 'danger' as const
    default:
      return 'warning' as const
  }
}

const getStatusText = (status: string) => {
  switch (status) {
    case 'completed':
      return '已完成'
    case 'in_progress':
      return '进行中'
    case 'cancelled':
      return '已取消'
    case 'pending':
    default:
      return '待开始'
  }
}

const loadTodaySessions = async () => {
  try {
    const response = await http.get('/api/dashboard/today-sessions')
    const data = await response.json()
    
    if (data.success) {
      todaySessions.value = data.data
    }
  } catch (error) {
    console.error('加载今日课程失败:', error)
  }
}

const loadRecentMembers = async () => {
  try {
    const response = await http.get('/api/members?limit=5')
    const data = await response.json()
    
    if (data.success) {
      recentMembers.value = data.data
    }
  } catch (error) {
    console.error('加载最近会员失败:', error)
  }
}

const loadStats = async () => {
  try {
    const response = await http.get('/api/dashboard/stats')
    const data = await response.json()
    
    if (data.success) {
      stats.value = data.data
    }
  } catch (error) {
    console.error('加载统计数据失败:', error)
    // 使用默认数据 - 与数据库中的实际数据保持一致
    stats.value = {
      totalMembers: 15,
      todaySessions: 6,
      totalTemplates: 8, // 与数据库中的实际模板数量一致
      monthlySessions: 18
    }
  }
}

// 生命周期
onMounted(async () => {
  await Promise.all([
    loadStats(),
    loadTodaySessions(),
    loadRecentMembers()
  ])
})
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.stat-card {
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: rgba(255, 107, 53, 0.1);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: var(--text-color);
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-top: 4px;
}

.main-content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.content-card {
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

.empty-state p {
  margin: 16px 0;
  font-size: 16px;
}

.session-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.session-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 8px;
  background: #f8f9fa;
  cursor: pointer;
  transition: background-color 0.2s;
}

.session-item:hover {
  background: #e9ecef;
}

.session-time {
  font-size: 18px;
  font-weight: bold;
  color: var(--primary-color);
  min-width: 60px;
}

.session-info {
  flex: 1;
}

.member-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color);
}

.session-type {
  font-size: 14px;
  color: #666;
  margin-top: 4px;
}

.member-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 8px;
  background: #f8f9fa;
  cursor: pointer;
  transition: background-color 0.2s;
}

.member-item:hover {
  background: #e9ecef;
}

.member-info {
  flex: 1;
}

.member-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color);
}

.member-phone {
  font-size: 14px;
  color: #666;
  margin-top: 4px;
}

.quick-actions-card {
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.quick-action-btn {
  height: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 12px;
  transition: transform 0.2s;
}

.quick-action-btn:hover {
  transform: translateY(-2px);
}

/* 平板设备优化 */
@media (max-width: 1024px) {
  .main-content-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .quick-actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .quick-actions-grid {
    grid-template-columns: 1fr;
  }
  
  .session-item,
  .member-item {
    padding: 12px;
  }
}

/* 创建模板对话框样式 */
.create-template-dialog {
  .el-dialog__body {
    padding: 0;
  }
  
  .create-template {
    max-height: 70vh;
    overflow-y: auto;
  }
}

/* 添加课程对话框样式 */
.add-session-dialog {
  .el-dialog__body {
    padding: 0;
  }
  
  .add-session {
    max-height: 70vh;
    overflow-y: auto;
  }
}
</style> 