<template>
  <Layout>
    <div class="members-page">
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="header-left">
          <h1 class="page-title">会员管理</h1>
          <p class="page-subtitle">管理所有会员信息和档案</p>
          <div class="member-stats-summary">
            <el-tag type="info" size="small">
              总会员数: {{ pagination.total }}
            </el-tag>
            <el-tag type="success" size="small">
              活跃会员: {{ members.filter(m => m.status === 1).length }}
            </el-tag>
          </div>
        </div>
        <div class="header-right">
          <el-button type="primary" size="large" @click="handleAddMember">
            <el-icon><Plus /></el-icon>
            添加会员
          </el-button>
        </div>
      </div>

      <!-- 搜索和筛选 -->
      <div class="search-section">
        <div class="search-left">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-input
                v-model="searchQuery"
                placeholder="搜索会员姓名、电话或ID"
                clearable
                @input="handleSearch"
              >
                <template #prefix>
                  <el-icon><Search /></el-icon>
                </template>
              </el-input>
            </el-col>
            <el-col :span="4">
              <el-select v-model="genderFilter" placeholder="性别筛选" clearable @change="handleSearch">
                <el-option label="全部" value="" />
                <el-option label="男" value="male" />
                <el-option label="女" value="female" />
              </el-select>
            </el-col>
            <el-col :span="4">
              <el-select v-model="ageFilter" placeholder="年龄段" clearable @change="handleSearch">
                <el-option label="全部" value="" />
                <el-option label="18-25岁" value="18-25" />
                <el-option label="26-35岁" value="26-35" />
                <el-option label="36-45岁" value="36-45" />
                <el-option label="46岁以上" value="46+" />
              </el-select>
            </el-col>
          </el-row>
        </div>
        <div class="search-right">
          <el-button-group>
            <el-button 
              :type="viewMode === 'grid' ? 'primary' : ''"
              @click="viewMode = 'grid'"
            >
              <el-icon><Grid /></el-icon>
            </el-button>
            <el-button 
              :type="viewMode === 'list' ? 'primary' : ''"
              @click="viewMode = 'list'"
            >
              <el-icon><List /></el-icon>
            </el-button>
          </el-button-group>
        </div>
      </div>

      <!-- 会员列表 -->
      <div class="members-content">
        <el-card v-if="loading" class="loading-card">
          <div class="loading-content">
            <el-icon class="is-loading" size="32"><Loading /></el-icon>
            <p>加载中...</p>
          </div>
        </el-card>

        <div v-else-if="members.length === 0" class="empty-state">
          <el-icon size="64" color="#CCC"><User /></el-icon>
          <h3>暂无会员数据</h3>
          <p>点击"添加会员"开始创建第一个会员档案</p>
          <el-button type="primary" @click="handleAddMember">添加会员</el-button>
        </div>

        <div v-else class="members-content">
          <!-- 网格视图 -->
          <div v-if="viewMode === 'grid'" class="members-grid">
            <el-card
              v-for="member in members"
              :key="member.id"
              class="member-card"
              @click="handleViewMember(member)"
            >
              <div class="member-header">
                <el-avatar :size="60" :src="member.avatar">
                  {{ member.name.charAt(0) }}
                </el-avatar>
                <div class="member-status">
                  <el-tag :type="member.status === 1 ? 'success' : 'info'">
                    {{ member.status === 1 ? '活跃' : '非活跃' }}
                  </el-tag>
                  <!-- 权限状态显示 -->
                  <el-tag 
                    :type="member.access_mode === 'shared' ? 'info' : 'warning'" 
                    size="small"
                    style="margin-left: 8px"
                  >
                    {{ member.access_mode === 'shared' ? '共享' : '专属' }}
                  </el-tag>
                  <!-- 专属模式下显示教练姓名 -->
                  <div v-if="member.access_mode === 'exclusive' && member.coaches" class="coach-names">
                    <el-tag 
                      v-for="coach in member.coaches.slice(0, 3)" 
                      :key="coach.id"
                      type="primary" 
                      size="small"
                      style="margin-top: 4px; margin-right: 4px;"
                    >
                      {{ coach.name }}
                    </el-tag>
                  </div>
                </div>
              </div>

              <div class="member-info">
                <h3 class="member-name">{{ member.name }}</h3>
                <p class="member-phone">{{ member.phone }}</p>
                <div class="member-id">
                  <el-tag 
                    type="info" 
                    size="small" 
                    @click.stop="copyMemberId(member.id)"
                    style="cursor: pointer;"
                  >
                    ID: {{ member.id }}
                  </el-tag>
                </div>
                <div class="member-details">
                  <span class="detail-item">
                    <el-icon><User /></el-icon>
                    {{ member.gender === 'male' ? '男' : '女' }}
                  </span>
                  <span class="detail-item">
                    <el-icon><Calendar /></el-icon>
                    {{ member.age }}岁
                  </span>
                  <span v-if="member.height && member.weight" class="detail-item">
                    <el-icon><TrendCharts /></el-icon>
                    <el-tag :type="getBMIStatus(formatBMI(member.height, member.weight))" size="small">
                      BMI: {{ formatBMI(member.height, member.weight) }}
                    </el-tag>
                  </span>
                </div>
                
                <!-- 会员统计信息 -->
                <div class="member-stats">
                  <div class="stat-item">
                    <span class="stat-label">已购课程</span>
                    <span class="stat-value">{{ member.purchased_courses || 0 }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">剩余课程</span>
                    <span class="stat-value" :class="{ 'text-danger': (member.remaining_courses || 0) <= 0 }">
                      {{ member.remaining_courses || 0 }}
                    </span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">最后上课</span>
                    <span class="stat-value">{{ member.last_training_date ? new Date(member.last_training_date).toLocaleDateString() : '--' }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">加入时间</span>
                    <span class="stat-value">{{ new Date(member.created_at).toLocaleDateString() }}</span>
                  </div>
                </div>
              </div>

              <div class="member-actions">
                <el-button type="primary" size="small" @click.stop="handleStartTraining(member)">
                  <el-icon><VideoPlay /></el-icon>
                  开始训练
                </el-button>
                <el-button type="info" size="small" @click.stop="handleViewMember(member)">
                  <el-icon><View /></el-icon>
                  查看详情
                </el-button>
                <el-button type="warning" size="small" @click.stop="handleEditMember(member)">
                  <el-icon><Edit /></el-icon>
                  编辑
                </el-button>
                <el-button type="success" size="small" @click.stop="handleViewHistory(member)">
                  <el-icon><Document /></el-icon>
                  训练历史
                </el-button>
                <el-button v-if="authStore.user?.role === 'admin'" type="primary" size="small" @click.stop="handleCourseManagement(member)">
                  <el-icon><Tickets /></el-icon>
                  课程管理
                </el-button>
                <el-button type="danger" size="small" @click.stop="handleDeleteMember(member)">
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </div>
            </el-card>
          </div>

          <!-- 列表视图 -->
          <div v-else class="members-list">
            <el-table :data="members" style="width: 100%">
              <el-table-column prop="id" label="会员ID" width="100" align="center" />
              
              <el-table-column label="基本信息" min-width="200">
                <template #default="{ row }">
                  <div class="member-info-cell">
                    <el-avatar :size="40" :src="row.avatar">
                      {{ row.name.charAt(0) }}
                    </el-avatar>
                    <div class="member-basic-info">
                      <div class="member-name">{{ row.name }}</div>
                      <div class="member-phone">{{ row.phone }}</div>
                    </div>
                  </div>
                </template>
              </el-table-column>
              
              <el-table-column label="性别/年龄" width="120" align="center">
                <template #default="{ row }">
                  <div class="gender-age">
                    <span>{{ row.gender === 'male' ? '男' : '女' }}</span>
                    <span>/</span>
                    <span>{{ row.age }}岁</span>
                  </div>
                </template>
              </el-table-column>
              
              <el-table-column label="身体数据" width="150" align="center">
                <template #default="{ row }">
                  <div v-if="row.height && row.weight" class="body-data">
                    <div>{{ row.height }}cm / {{ row.weight }}kg</div>
                    <el-tag :type="getBMIStatus(formatBMI(row.height, row.weight))" size="small">
                      BMI: {{ formatBMI(row.height, row.weight) }}
                    </el-tag>
                  </div>
                  <span v-else>--</span>
                </template>
              </el-table-column>
              
              <el-table-column prop="training_count" label="训练次数" width="100" align="center">
                <template #default="{ row }">
                  {{ row.training_count || 0 }}
                </template>
              </el-table-column>
              
              <el-table-column label="状态" width="100" align="center">
                <template #default="{ row }">
                  <el-tag :type="row.status === 1 ? 'success' : 'info'" size="small">
                    {{ row.status === 1 ? '活跃' : '非活跃' }}
                  </el-tag>
                </template>
              </el-table-column>
              
              <el-table-column label="权限模式" width="100" align="center">
                <template #default="{ row }">
                  <el-tag :type="row.access_mode === 'shared' ? 'info' : 'warning'" size="small">
                    {{ row.access_mode === 'shared' ? '共享' : '专属' }}
                  </el-tag>
                </template>
              </el-table-column>
              
              <el-table-column label="加入时间" width="150" align="center">
                <template #default="{ row }">
                  {{ new Date(row.created_at).toLocaleDateString() }}
                </template>
              </el-table-column>
              
              <el-table-column label="操作" width="300" fixed="right">
                <template #default="{ row }">
                  <el-button-group>
                    <el-button size="small" type="primary" @click="handleStartTraining(row)">
                      <el-icon><VideoPlay /></el-icon>
                      开始训练
                    </el-button>
                    <el-button size="small" @click="handleViewMember(row)">
                      <el-icon><View /></el-icon>
                      查看
                    </el-button>
                    <el-button size="small" type="warning" @click="handleEditMember(row)">
                      <el-icon><Edit /></el-icon>
                      编辑
                    </el-button>
                    <el-button size="small" type="success" @click="handleViewHistory(row)">
                      <el-icon><Document /></el-icon>
                      历史
                    </el-button>
                    <el-button size="small" type="danger" @click="handleDeleteMember(row)">
                      <el-icon><Delete /></el-icon>
                      删除
                    </el-button>
                  </el-button-group>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>

        <!-- 分页 -->
        <div v-if="pagination.total > 0" class="pagination-section">
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.limit"
            :total="pagination.total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>

      <!-- 会员编辑对话框 -->
      <MemberEditDialog
        v-model:visible="showMemberDialog"
        :member="currentMember"
        @success="handleMemberSuccess"
      />

      <!-- 课程管理对话框 -->
      <el-dialog
        v-model="showCourseDialog"
        title="会员课程管理"
        width="500px"
        :close-on-click-modal="false"
      >
        <div v-if="currentMember" class="course-dialog-content">
          <div class="member-info">
            <h4>{{ currentMember.name }} - 课程信息</h4>
            <div class="course-stats">
              <el-row :gutter="20">
                <el-col :span="12">
                  <div class="stat-item">
                    <span class="stat-label">已购课程</span>
                    <span class="stat-value">{{ currentMember.purchased_courses || 0 }}</span>
                  </div>
                </el-col>
                <el-col :span="12">
                  <div class="stat-item">
                    <span class="stat-label">剩余课程</span>
                    <span class="stat-value" :class="{ 'text-danger': (currentMember.remaining_courses || 0) <= 0 }">
                      {{ currentMember.remaining_courses || 0 }}
                    </span>
                  </div>
                </el-col>
              </el-row>
            </div>
          </div>

          <el-form
            ref="courseFormRef"
            :model="courseForm"
            :rules="courseFormRules"
            label-width="100px"
            class="course-form"
          >
            <el-form-item label="操作类型" prop="operationType">
              <el-radio-group v-model="courseForm.operationType">
                <el-radio label="add">增加课程</el-radio>
                <el-radio label="subtract">减少课程</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="数量" prop="quantity">
              <el-input-number
                v-model="courseForm.quantity"
                :min="1"
                :max="100"
                controls-position="right"
                style="width: 100%"
              />
            </el-form-item>

            <el-form-item label="操作原因" prop="reason">
              <el-input
                v-model="courseForm.reason"
                type="textarea"
                :rows="3"
                placeholder="请输入操作原因，如：购买课程包、课程消费、课程调整等"
              />
            </el-form-item>
          </el-form>
        </div>

        <template #footer>
          <div class="dialog-footer">
            <el-button @click="showCourseDialog = false">取消</el-button>
            <el-button type="info" @click="handleViewOperations">查看操作记录</el-button>
            <el-button type="primary" @click="handleCourseSubmit">确认提交</el-button>
          </div>
        </template>
      </el-dialog>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  User, Calendar, TrendCharts, VideoPlay, View, Edit, Document, Delete, Grid, List, Tickets, Loading, Search
} from '@element-plus/icons-vue'
import Layout from '@/components/Layout.vue'
import { http } from '@/utils/http'
import MemberEditDialog from '@/components/MemberEditDialog.vue'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// 响应式数据
const loading = ref(false)
const members = ref([])
const searchQuery = ref('')
const genderFilter = ref('')
const ageFilter = ref('')
const pagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  pages: 0
})
const viewMode = ref('grid') // 'grid' or 'list'
const showMemberDialog = ref(false)
const currentMember = ref(null)

// 课程管理相关
const showCourseDialog = ref(false)
const courseForm = ref({
  operationType: 'add',
  quantity: 1,
  reason: ''
})
const courseFormRules = {
  quantity: [
    { required: true, message: '请输入数量', trigger: 'blur' },
    { type: 'number', min: 1, message: '数量必须大于0', trigger: 'blur' }
  ],
  reason: [
    { required: true, message: '请输入操作原因', trigger: 'blur' }
  ]
}

// 获取会员列表
const fetchMembers = async () => {
  try {
    loading.value = true
    console.log('🔄 开始获取会员列表...')
    
    const params = new URLSearchParams({
      page: pagination.value.page.toString(),
      limit: pagination.value.limit.toString(),
      search: searchQuery.value,
      gender: genderFilter.value,
      age: ageFilter.value
    })

    console.log('📤 请求参数:', params.toString())
    const response = await http.get(`/api/members?${params}`)
    console.log('📥 收到响应:', response.status, response.statusText)
    
    const data = await response.json()
    console.log('📋 响应数据:', data)
    console.log('📋 响应数据类型:', typeof data)
    console.log('📋 响应数据键:', Object.keys(data))
    console.log('📋 success字段:', data.success)
    console.log('📋 data字段:', data.data)
    console.log('📋 pagination字段:', data.pagination)

    if (data.success) {
      members.value = data.data || []
      pagination.value = data.pagination || {
        page: 1,
        limit: 20,
        total: 0,
        pages: 0
      }
      console.log('✅ 会员数据已更新:', members.value.length, '条记录')
      
      // 获取课程汇总信息
      await loadCourseSummary()
      
      // 为专属模式的会员加载教练信息
      await loadCoachesForExclusiveMembers()
    } else {
      console.error('❌ API返回错误:', data.message || '未知错误')
      ElMessage.error(data.message || '获取会员列表失败')
    }
  } catch (error) {
    console.error('❌ 获取会员列表错误:', error)
    ElMessage.error('获取会员列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  pagination.value.page = 1
  fetchMembers()
}

// 分页处理
const handleSizeChange = (size: number) => {
  pagination.value.limit = size
  pagination.value.page = 1
  fetchMembers()
}

const handleCurrentChange = (page: number) => {
  pagination.value.page = page
  fetchMembers()
}

// 操作处理
const handleAddMember = () => {
  currentMember.value = null
  showMemberDialog.value = true
}

const handleViewMember = (member: any) => {
  router.push(`/members/${member.id}`)
}

const handleEditMember = (member: any) => {
  currentMember.value = member
  showMemberDialog.value = true
}

const handleDeleteMember = async (member: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除会员"${member.name}"吗？此操作不可恢复。`,
      '确认删除',
      {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const response = await http.delete(`/api/members/${member.id}`)
    if (response.ok) {
      ElMessage.success('会员删除成功')
      fetchMembers() // 重新获取列表
    } else {
      const data = await response.json()
      ElMessage.error(data.message || '删除失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 课程管理处理
const handleCourseManagement = (member: any) => {
  currentMember.value = member
  courseForm.value = {
    operationType: 'add',
    quantity: 1,
    reason: ''
  }
  showCourseDialog.value = true
}

const handleCourseSubmit = async () => {
  try {
    const response = await http.post(`/api/courses/member/${currentMember.value.id}/update`, courseForm.value)
    const data = await response.json()

    if (data.success) {
      ElMessage.success('课程信息更新成功')
      showCourseDialog.value = false
      fetchMembers() // 刷新会员列表以更新课程信息
    } else {
      ElMessage.error(data.message || '更新失败')
    }
  } catch (error) {
    console.error('❌ 更新课程信息错误:', error)
    ElMessage.error('更新课程信息失败')
  }
}

const handleViewOperations = () => {
  showCourseDialog.value = false
  router.push('/course-operations')
}

const handleStartTraining = (member: any) => {
  router.push(`/training/${member.id}`)
}

const handleViewHistory = (member: any) => {
  router.push(`/logs?member_id=${member.id}`)
}

const handleMemberSuccess = () => {
  showMemberDialog.value = false
  fetchMembers()
}

// 格式化年龄
const formatAge = (birthDate: string) => {
  const birth = new Date(birthDate)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  
  return age
}

// 格式化BMI
const formatBMI = (height: number, weight: number) => {
  if (!height || !weight) return '--'
  const heightInMeters = height / 100
  const bmi = weight / (heightInMeters * heightInMeters)
  return bmi.toFixed(1)
}

// 获取BMI状态
const getBMIStatus = (bmi: string) => {
  if (bmi === '--') return 'info'
  const bmiValue = parseFloat(bmi)
  if (bmiValue < 18.5) return 'warning'
  if (bmiValue >= 18.5 && bmiValue < 24) return 'success'
  if (bmiValue >= 24 && bmiValue < 28) return 'warning'
  return 'danger'
}

// 复制会员ID
const copyMemberId = (id: string) => {
  navigator.clipboard.writeText(id).then(() => {
    ElMessage.success('会员ID已复制到剪贴板')
  }).catch(() => {
    ElMessage.error('复制失败，请手动复制')
  })
}

// 获取课程汇总信息
const loadCourseSummary = async () => {
  try {
    const response = await http.get('/api/courses/members/summary')
    const data = await response.json()
    
    if (data.success) {
      const courseSummary = data.data || []
      
      // 将课程信息合并到会员数据中
      members.value = members.value.map(member => {
        const courseInfo = courseSummary.find(c => c.id === member.id)
        return {
          ...member,
          purchased_courses: courseInfo?.purchased_courses || 0,
          remaining_courses: courseInfo?.remaining_courses || 0,
          last_training_date: courseInfo?.last_training_date || null
        }
      })
      
      console.log('✅ 课程汇总信息已加载')
    }
  } catch (error) {
    console.error('❌ 加载课程汇总信息失败:', error)
  }
}

// 为专属模式的会员加载教练信息
const loadCoachesForExclusiveMembers = async () => {
  const exclusiveMembers = members.value.filter(m => m.access_mode === 'exclusive')
  
  for (const member of exclusiveMembers) {
    try {
      const response = await http.get(`/api/members/${member.id}/coaches`)
      const data = await response.json()
      if (data.success) {
        member.coaches = data.data || []
      }
    } catch (error) {
      console.error(`加载会员 ${member.id} 的教练信息失败:`, error)
    }
  }
}

// 初始化
onMounted(() => {
  fetchMembers()
})
</script>

<style scoped>
.members-page {
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header-left {
  flex: 1;
}

.page-title {
  font-size: 24px;
  font-weight: bold;
  color: var(--text-color);
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.member-stats-summary {
  display: flex;
  gap: 10px;
  margin-top: 10px;
  flex-wrap: wrap;
}

.search-section {
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.search-left {
  flex: 1;
}

.search-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.members-content {
  min-height: 400px;
}

.loading-card {
  text-align: center;
  padding: 60px 20px;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #999;
}

.empty-state h3 {
  margin: 16px 0 8px 0;
  font-size: 18px;
}

.empty-state p {
  margin: 0 0 24px 0;
  font-size: 14px;
}

.members-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.member-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  border-radius: 12px;
}

.member-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
}

.member-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.member-info {
  margin-bottom: 16px;
}

.member-name {
  font-size: 18px;
  font-weight: bold;
  color: var(--text-color);
  margin: 0 0 8px 0;
}

.member-phone {
  font-size: 14px;
  color: #666;
  margin: 0 0 12px 0;
}

.member-id {
  margin-bottom: 12px;
}

.member-details {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #666;
}

.member-stats {
  display: flex;
  justify-content: space-around;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #eee;
}

.stat-item {
  text-align: center;
}

.stat-label {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 16px;
  font-weight: bold;
  color: var(--text-color);
}

.member-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.pagination-section {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

.members-list {
  margin-bottom: 24px;
}

.member-info-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.member-basic-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.member-basic-info .member-name {
  font-weight: bold;
  color: var(--text-color);
  font-size: 14px;
}

.member-basic-info .member-phone {
  font-size: 12px;
  color: #666;
}

.gender-age {
  display: flex;
  justify-content: center;
  gap: 4px;
  font-size: 14px;
}

.body-data {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  font-size: 12px;
}

.coach-names {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.coach-names .el-tag {
  font-size: 11px;
  padding: 2px 6px;
}

/* 平板设备优化 */
@media (max-width: 1024px) {
  .members-grid {
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .members-page {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  
  .members-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .member-actions {
    flex-direction: column;
  }
  
  .member-actions .el-button {
    width: 100%;
  }
}

/* 课程管理对话框样式 */
.course-dialog-content {
  padding: 20px 0;
}

.member-info {
  margin-bottom: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.member-info h4 {
  margin: 0 0 16px 0;
  color: #333;
  font-size: 16px;
}

.course-stats {
  margin-bottom: 16px;
}

.course-stats .stat-item {
  text-align: center;
  padding: 12px;
  background: white;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.course-stats .stat-label {
  display: block;
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.course-stats .stat-value {
  display: block;
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.course-stats .text-danger {
  color: #f56c6c;
}

.course-form {
  margin-top: 20px;
}

.dialog-footer {
  text-align: right;
  padding-top: 20px;
  border-top: 1px solid #eee;
}
</style> 