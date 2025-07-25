<template>
  <Layout>
    <div class="users-page">
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="header-left">
          <h1 class="page-title">用户管理</h1>
          <p class="page-subtitle">管理系统用户和权限</p>
          <div class="user-stats-summary">
            <el-tag type="info" size="small">
              总用户数: {{ pagination.total }}
            </el-tag>
            <el-tag type="success" size="small">
              活跃用户: {{ users.filter(u => u.status === 1).length }}
            </el-tag>
            <el-tag type="primary" size="small">
              教练员: {{ users.filter(u => u.role === 'coach').length }}
            </el-tag>
            <el-tag type="danger" size="small">
              管理员: {{ users.filter(u => u.role === 'admin').length }}
            </el-tag>
          </div>
        </div>
        <div class="header-right">
          <el-button type="primary" size="large" @click="handleAddUser">
            <el-icon><Plus /></el-icon>
            添加用户
          </el-button>
        </div>
      </div>

      <!-- 搜索和筛选 -->
      <div class="search-section">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-input
              v-model="searchQuery"
              placeholder="搜索用户名、姓名或ID"
              clearable
              @input="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-col>
          <el-col :span="4">
            <el-select v-model="roleFilter" placeholder="角色筛选" clearable @change="handleSearch">
              <el-option label="全部" value="" />
              <el-option label="管理员" value="admin" />
              <el-option label="教练" value="coach" />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-select v-model="statusFilter" placeholder="状态筛选" clearable @change="handleSearch">
              <el-option label="全部" value="" />
              <el-option label="活跃" value="1" />
              <el-option label="非活跃" value="0" />
            </el-select>
          </el-col>
        </el-row>
      </div>

      <!-- 用户列表 -->
      <div class="users-content">
        <el-card v-if="loading" class="loading-card">
          <div class="loading-content">
            <el-icon class="is-loading" size="32"><Loading /></el-icon>
            <p>加载中...</p>
          </div>
        </el-card>

        <div v-else-if="users.length === 0" class="empty-state">
          <el-icon size="64" color="#CCC"><User /></el-icon>
          <h3>暂无用户数据</h3>
          <p>点击"添加用户"开始创建第一个用户</p>
          <el-button type="primary" @click="handleAddUser">添加用户</el-button>
        </div>

        <div v-else class="users-grid">
          <el-card
            v-for="user in users"
            :key="user.id"
            class="user-card"
          >
            <div class="user-header">
              <el-avatar :size="60" :src="user.avatar">
                {{ user.name.charAt(0) }}
              </el-avatar>
              <div class="user-status">
                <el-tag :type="user.status === 1 ? 'success' : 'info'">
                  {{ user.status === 1 ? '活跃' : '非活跃' }}
                </el-tag>
                <el-tag :type="user.role === 'admin' ? 'danger' : 'primary'" size="small">
                  {{ user.role === 'admin' ? '管理员' : '教练' }}
                </el-tag>
              </div>
            </div>

            <div class="user-info">
              <h3 class="user-name">{{ user.name }}</h3>
              <p class="user-username">{{ user.username }}</p>
              <div class="user-id">
                <el-tag 
                  type="info" 
                  size="small" 
                  @click.stop="copyUserId(user.id)"
                  style="cursor: pointer;"
                >
                  ID: {{ user.id }}
                </el-tag>
              </div>
              <div class="user-details">
                <span class="detail-item">
                  <el-icon><Phone /></el-icon>
                  {{ user.phone || '未设置' }}
                </span>
                <span class="detail-item">
                  <el-icon><Calendar /></el-icon>
                  {{ formatDate(user.created_at) }}
                </span>
              </div>
            </div>

            <div class="user-actions">
              <el-button type="primary" size="small" @click="handleEditUser(user)">
                编辑
              </el-button>
              <el-button type="warning" size="small" @click="handleResetPassword(user)">
                重置密码
              </el-button>
              <el-button 
                v-if="user.id !== currentUser.id"
                type="danger" 
                size="small" 
                @click="handleDeleteUser(user)"
              >
                删除
              </el-button>
            </div>
          </el-card>
        </div>
      </div>

      <!-- 分页 -->
      <div v-if="pagination.total > 0" class="pagination-section">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.limit"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>

    <!-- 用户对话框 -->
    <UserDialog
      v-model:visible="showUserDialog"
      :user="currentUserData"
      :is-edit="isEditMode"
      @success="handleUserSuccess"
    />
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import Layout from '@/components/Layout.vue'
import UserDialog from '@/components/UserDialog.vue'
import { http } from '@/utils/http'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// 响应式数据
const loading = ref(false)
const users = ref([])
const searchQuery = ref('')
const roleFilter = ref('')
const statusFilter = ref('')
const pagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  pages: 0
})

const currentUser = authStore.user

// 用户对话框状态
const showUserDialog = ref(false)
const isEditMode = ref(false)
const currentUserData = ref(null)

// 获取用户列表
const fetchUsers = async () => {
  try {
    loading.value = true
    
    const params = new URLSearchParams({
      page: pagination.value.page.toString(),
      limit: pagination.value.limit.toString(),
      search: searchQuery.value,
      role: roleFilter.value,
      status: statusFilter.value
    })

    const response = await http.get(`/api/users?${params}`)
    const data = await response.json()

    if (data.success) {
      users.value = data.data
      pagination.value = data.pagination
    } else {
      ElMessage.error(data.message || '获取用户列表失败')
    }
  } catch (error) {
    console.error('获取用户列表错误:', error)
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  pagination.value.page = 1
  fetchUsers()
}

// 分页处理
const handleSizeChange = (size: number) => {
  pagination.value.limit = size
  pagination.value.page = 1
  fetchUsers()
}

const handleCurrentChange = (page: number) => {
  pagination.value.page = page
  fetchUsers()
}

// 操作处理
const handleAddUser = () => {
  isEditMode.value = false
  currentUserData.value = null
  showUserDialog.value = true
}

const handleEditUser = (user: any) => {
  isEditMode.value = true
  currentUserData.value = user
  showUserDialog.value = true
}

const handleUserSuccess = () => {
  fetchUsers()
}

const handleResetPassword = async (user: any) => {
  try {
    const { value: password } = await ElMessageBox.prompt(
      `请输入用户 ${user.name} 的新密码`,
      '重置密码',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputType: 'password',
        inputPattern: /.{6,}/,
        inputErrorMessage: '密码长度至少6个字符',
        inputPlaceholder: '请输入新密码'
      }
    )
    
    if (password) {
      const response = await http.post(`/api/users/${user.id}/reset-password`, {
        password: password
      })
      const data = await response.json()
      
      if (data.success) {
        ElMessage.success('密码重置成功')
      } else {
        ElMessage.error(data.message || '密码重置失败')
      }
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('密码重置失败')
    }
  }
}

const handleDeleteUser = async (user: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户 ${user.name} 吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const response = await http.delete(`/api/users/${user.id}`)
    const data = await response.json()
    
    if (data.success) {
      ElMessage.success('用户删除成功')
      fetchUsers()
    } else {
      ElMessage.error(data.message || '用户删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('用户删除失败')
    }
  }
}

// 格式化日期
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('zh-CN')
}

// 复制用户ID
const copyUserId = (id: string) => {
  navigator.clipboard.writeText(id).then(() => {
    ElMessage.success('用户ID已复制到剪贴板')
  }).catch(() => {
    ElMessage.error('复制用户ID失败')
  })
}

// 生命周期
onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.users-page {
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.user-stats-summary {
  display: flex;
  gap: 10px;
  margin-top: 10px;
  flex-wrap: wrap;
}

.search-section {
  margin-bottom: 24px;
}

.loading-card {
  text-align: center;
  padding: 40px;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #999;
}

.empty-state h3 {
  margin: 16px 0 8px 0;
  font-size: 18px;
  color: #666;
}

.empty-state p {
  margin: 0 0 24px 0;
  font-size: 14px;
}

.users-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.user-card {
  border-radius: 12px;
  transition: transform 0.2s, box-shadow 0.2s;
}

.user-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.user-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.user-status {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-info {
  margin-bottom: 16px;
}

.user-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-color);
  margin: 0 0 4px 0;
}

.user-username {
  font-size: 14px;
  color: #666;
  margin: 0 0 12px 0;
}

.user-id {
  margin-bottom: 12px;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666;
}

.user-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.pagination-section {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

/* 平板设备优化 */
@media (max-width: 1024px) {
  .users-grid {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
}

@media (max-width: 768px) {
  .users-grid {
    grid-template-columns: 1fr;
  }
  
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
}
</style> 