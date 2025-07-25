<template>
  <Layout>
    <div class="profile-page">
      <!-- 页面头部 -->
      <div class="page-header">
        <h1 class="page-title">个人信息</h1>
        <p class="page-subtitle">查看和管理您的个人信息</p>
      </div>

      <div class="profile-content">
        <el-row :gutter="24">
          <!-- 左侧：个人信息卡片 -->
          <el-col :span="12">
            <el-card class="profile-card">
              <template #header>
                <div class="card-header">
                  <span>基本信息</span>
                  <el-button type="primary" size="small" @click="handleEdit">
                    编辑信息
                  </el-button>
                </div>
              </template>
              
              <div class="profile-info">
                <div class="avatar-section">
                  <el-avatar :size="80" :src="userAvatar">
                    {{ userInitials }}
                  </el-avatar>
                  <div class="user-basic">
                    <h3>{{ user.name }}</h3>
                    <p class="username">{{ user.username }}</p>
                    <el-tag :type="user.role === 'admin' ? 'danger' : 'primary'">
                      {{ user.role === 'admin' ? '管理员' : '教练' }}
                    </el-tag>
                  </div>
                </div>
                
                <el-divider />
                
                <div class="info-list">
                  <div class="info-item">
                    <span class="label">用户ID：</span>
                    <span class="value">{{ user.id }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">手机号：</span>
                    <span class="value">{{ user.phone || '未设置' }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">注册时间：</span>
                    <span class="value">{{ formatDate(user.created_at) }}</span>
                  </div>
                  <div class="info-item">
                    <span class="label">最后登录：</span>
                    <span class="value">{{ formatDate(user.last_login_at) || '从未登录' }}</span>
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>

          <!-- 右侧：修改密码卡片 -->
          <el-col :span="12">
            <el-card class="password-card">
              <template #header>
                <span>修改密码</span>
              </template>
              
              <el-form
                ref="passwordFormRef"
                :model="passwordForm"
                :rules="passwordRules"
                label-width="100px"
              >
                <el-form-item label="当前密码" prop="currentPassword">
                  <el-input
                    v-model="passwordForm.currentPassword"
                    type="password"
                    placeholder="请输入当前密码"
                    show-password
                  />
                </el-form-item>
                
                <el-form-item label="新密码" prop="newPassword">
                  <el-input
                    v-model="passwordForm.newPassword"
                    type="password"
                    placeholder="请输入新密码"
                    show-password
                  />
                </el-form-item>
                
                <el-form-item label="确认密码" prop="confirmPassword">
                  <el-input
                    v-model="passwordForm.confirmPassword"
                    type="password"
                    placeholder="请再次输入新密码"
                    show-password
                  />
                </el-form-item>
                
                <el-form-item>
                  <el-button type="primary" @click="handleChangePassword" :loading="passwordLoading">
                    修改密码
                  </el-button>
                </el-form-item>
              </el-form>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <!-- 编辑信息对话框 -->
      <el-dialog
        v-model="editDialogVisible"
        title="编辑个人信息"
        width="500px"
        :close-on-click-modal="false"
      >
        <el-form
          ref="editFormRef"
          :model="editForm"
          :rules="editRules"
          label-width="100px"
        >
          <el-form-item label="姓名" prop="name">
            <el-input v-model="editForm.name" placeholder="请输入姓名" />
          </el-form-item>
          
          <el-form-item label="手机号" prop="phone">
            <el-input v-model="editForm.phone" placeholder="请输入手机号" />
          </el-form-item>
        </el-form>
        
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="editDialogVisible = false">取消</el-button>
            <el-button type="primary" @click="handleSaveProfile" :loading="editLoading">
              保存
            </el-button>
          </div>
        </template>
      </el-dialog>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
import Layout from '@/components/Layout.vue'
import { http } from '@/utils/http'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

// 响应式数据
const passwordFormRef = ref()
const editFormRef = ref()
const passwordLoading = ref(false)
const editLoading = ref(false)
const editDialogVisible = ref(false)

// 用户信息
const user = computed(() => authStore.user)

// 头像和用户名首字母
const userAvatar = computed(() => '')
const userInitials = computed(() => {
  const name = user.value?.name || ''
  return name.charAt(0).toUpperCase()
})

// 密码表单
const passwordForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 编辑表单
const editForm = reactive({
  name: '',
  phone: ''
})

// 表单验证规则
const passwordRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule: any, value: string, callback: any) => {
        if (value !== passwordForm.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const editRules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
}

// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleString('zh-CN')
}

// 编辑个人信息
const handleEdit = () => {
  editForm.name = user.value?.name || ''
  editForm.phone = user.value?.phone || ''
  editDialogVisible.value = true
}

// 保存个人信息
const handleSaveProfile = async () => {
  if (!editFormRef.value) return
  
  try {
    await editFormRef.value.validate()
    editLoading.value = true
    
    const response = await http.put(`/api/users/${user.value.id}`, {
      name: editForm.name,
      phone: editForm.phone
    })
    
    const data = await response.json()
    
    if (data.success) {
      ElMessage.success('个人信息更新成功')
      // 更新本地用户信息
      authStore.updateUserInfo({
        name: editForm.name,
        phone: editForm.phone
      })
      editDialogVisible.value = false
    } else {
      ElMessage.error(data.message || '更新失败')
    }
  } catch (error) {
    console.error('更新个人信息错误:', error)
    ElMessage.error('更新失败')
  } finally {
    editLoading.value = false
  }
}

// 修改密码
const handleChangePassword = async () => {
  if (!passwordFormRef.value) return
  
  try {
    await passwordFormRef.value.validate()
    passwordLoading.value = true
    
    const response = await http.post(`/api/users/${user.value.id}/change-password`, {
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword
    })
    
    const data = await response.json()
    
    if (data.success) {
      ElMessage.success('密码修改成功')
      // 清空表单
      passwordForm.currentPassword = ''
      passwordForm.newPassword = ''
      passwordForm.confirmPassword = ''
      passwordFormRef.value?.resetFields()
    } else {
      ElMessage.error(data.message || '密码修改失败')
    }
  } catch (error) {
    console.error('修改密码错误:', error)
    ElMessage.error('密码修改失败')
  } finally {
    passwordLoading.value = false
  }
}
</script>

<style scoped>
.profile-page {
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

.profile-content {
  margin-bottom: 24px;
}

.profile-card,
.password-card {
  height: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.profile-info {
  padding: 20px 0;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.user-basic h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: var(--text-color);
}

.username {
  margin: 0 0 12px 0;
  color: #666;
  font-size: 14px;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-item:last-child {
  border-bottom: none;
}

.label {
  font-weight: 500;
  color: #666;
}

.value {
  color: var(--text-color);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 平板设备优化 */
@media (max-width: 768px) {
  .profile-content .el-col {
    margin-bottom: 20px;
  }
}
</style> 