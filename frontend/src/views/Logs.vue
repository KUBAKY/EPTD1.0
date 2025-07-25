<template>
  <Layout>
    <div class="logs-page">
      <div class="page-header">
        <div class="header-left">
          <h2>{{ pageTitle }}</h2>
          <p class="header-desc">{{ pageDescription }}</p>
        </div>
        <div class="header-actions">
          <el-button type="primary" @click="exportData">
            <el-icon><Download /></el-icon>
            导出数据
          </el-button>
        </div>
      </div>

      <!-- 筛选和搜索 -->
      <div class="filter-section">
        <div class="filter-left">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 300px"
          />
          <el-select 
            v-model="selectedMember" 
            placeholder="选择会员"
            clearable
            style="width: 200px"
          >
            <el-option
              v-for="member in members"
              :key="member.id"
              :label="`${member.name} (ID: ${member.id})`"
              :value="member.name"
            />
          </el-select>
          <el-select 
            v-model="selectedCoach" 
            placeholder="选择教练"
            clearable
            style="width: 200px"
          >
            <el-option
              v-for="coach in coaches"
              :key="coach.id"
              :label="`${coach.name} (ID: ${coach.id})`"
              :value="coach.id"
            />
          </el-select>
          <el-select 
            v-model="selectedStatus" 
            placeholder="选择状态"
            clearable
            style="width: 150px"
          >
            <el-option label="已完成" value="completed" />
            <el-option label="草稿" value="draft" />
          </el-select>
        </div>
        <div class="filter-right">
          <el-input 
            v-model="searchKeyword" 
            placeholder="搜索训练记录"
            prefix-icon="Search"
            clearable
            style="width: 250px"
          />
        </div>
      </div>

      <!-- 统计卡片 -->
      <div class="stats-section">
        <div class="stat-card">
          <div class="stat-icon">
            <el-icon><Calendar /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ totalLogs }}</div>
            <div class="stat-label">总训练次数</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <el-icon><Clock /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ averageDuration }}</div>
            <div class="stat-label">平均时长</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <el-icon><Star /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ averageRating }}</div>
            <div class="stat-label">平均评分</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <el-icon><TrendCharts /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ completionRate }}%</div>
            <div class="stat-label">完成率</div>
          </div>
        </div>
      </div>

      <!-- 训练记录列表 -->
      <div class="logs-content">
        <el-table 
          :data="filteredLogs" 
          style="width: 100%"
          @row-click="viewLogDetail"
          class="logs-table"
        >
          <el-table-column prop="date" label="训练日期" width="120">
            <template #default="{ row }">
              <div class="date-cell">
                <div class="date-main">{{ formatDate(row.date) }}</div>
                <div class="date-time">{{ row.startTime }}</div>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column prop="memberName" label="会员" width="150">
            <template #default="{ row }">
              <div class="member-cell">
                <el-avatar :size="32" :src="row.memberAvatar">
                  {{ row.memberName?.charAt(0) }}
                </el-avatar>
                <div class="member-info">
                  <span class="member-name">{{ row.memberName }}</span>
                  <span class="member-id">(ID: {{ row.memberId }})</span>
                </div>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column prop="coachName" label="教练" width="150">
            <template #default="{ row }">
              <div class="coach-cell">
                <span class="coach-name">{{ row.coachName }}</span>
                <span class="coach-id">(ID: {{ row.coachId }})</span>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column prop="duration" label="训练时长" width="100">
            <template #default="{ row }">
              <span class="duration">{{ formatTime(row.duration) }}</span>
            </template>
          </el-table-column>
          
          <el-table-column prop="completionRate" label="完成度" width="100">
            <template #default="{ row }">
              <el-progress 
                :percentage="row.completionRate" 
                :color="getProgressColor(row.completionRate)"
                :stroke-width="8"
              />
            </template>
          </el-table-column>
          
          <el-table-column prop="memberRating" label="会员评分" width="120">
            <template #default="{ row }">
              <div class="rating-cell">
                <el-rate 
                  :model-value="row.memberRating / 20" 
                  disabled 
                  :max="5"
                  size="small"
                />
                <span class="rating-score">{{ row.memberRating }}分</span>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.status === 'completed' ? 'success' : 'warning'">
                {{ row.status === 'completed' ? '已完成' : '草稿' }}
              </el-tag>
            </template>
          </el-table-column>
          
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button-group>
                <el-button size="small" @click.stop="viewLogDetail(row)">
                  查看
                </el-button>
                <el-button size="small" @click.stop="editLog(row)">
                  编辑
                </el-button>
                <el-button 
                  size="small" 
                  type="danger" 
                  @click.stop="deleteLog(row)"
                >
                  删除
                </el-button>
              </el-button-group>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-section">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="totalLogs"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>

      <!-- 训练记录详情对话框 -->
      <el-dialog 
        v-model="showDetailDialog" 
        title="训练记录详情" 
        width="80%"
        class="log-detail-dialog"
      >
        <div v-if="selectedLog" class="log-detail">
          <div class="detail-header">
            <div class="detail-info">
              <h3>{{ selectedLog.memberName }} - {{ formatDate(selectedLog.date) }}</h3>
              <p class="detail-meta">
                教练: {{ selectedLog.coachName }} | 
                时长: {{ formatTime(selectedLog.duration) }} | 
                评分: {{ selectedLog.memberRating }}分
              </p>
            </div>
            <div class="detail-actions">
              <el-button @click="editLog(selectedLog)">编辑</el-button>
              <el-button type="primary" @click="printLog">打印</el-button>
            </div>
          </div>

          <el-tabs v-model="activeDetailTab" class="detail-tabs">
            <el-tab-pane label="课前查体" name="pre-training">
              <div class="pre-training-content">
                <div class="status-section">
                  <h4>课前状态评估</h4>
                  <div class="status-content">
                    <p>{{ selectedLog.pre_training_status || '暂无课前查体记录' }}</p>
                  </div>
                </div>
              </div>
            </el-tab-pane>
            
            <el-tab-pane label="训练内容" name="content">
              <div class="training-content">
                <div class="content-section">
                  <h4>热身激活</h4>
                  <div class="exercise-list">
                    <div 
                      v-for="exercise in selectedLog.warmup" 
                      :key="`${exercise.exercise_name}-${exercise.set_number}`"
                      class="exercise-item"
                    >
                      <div class="exercise-header">
                        <span class="exercise-name">{{ exercise.exercise_name }}</span>
                        <span class="exercise-variables">
                          {{ getVariable1Label(exercise.weight_unit === 'percent' ? 'intensity' : 'weight') }} × {{ getVariable2Label(exercise.duration_unit === 'seconds' ? 'duration' : 'reps') }}
                        </span>
                      </div>
                      <div class="exercise-sets">
                        <div class="set-item">
                          <span class="set-number">第{{ exercise.set_number }}组:</span>
                          <span class="set-data">
                            {{ exercise.weight_or_intensity }}{{ exercise.weight_unit === 'percent' ? '%' : 'kg' }} × 
                            {{ exercise.reps_or_duration }}{{ exercise.duration_unit === 'seconds' ? '秒' : '次' }}
                          </span>
                          <span class="rest-time" v-if="exercise.rest_time">休息: {{ exercise.rest_time }}秒</span>
                        </div>
                      </div>
                      <div class="exercise-notes" v-if="exercise.notes">
                        <span class="notes-label">备注:</span>
                        <span class="notes-content">{{ exercise.notes }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="content-section">
                  <h4>主体训练</h4>
                  <div class="exercise-list">
                    <div 
                      v-for="exercise in selectedLog.main" 
                      :key="`${exercise.exercise_name}-${exercise.set_number}`"
                      class="exercise-item"
                    >
                      <div class="exercise-header">
                        <span class="exercise-name">{{ exercise.exercise_name }}</span>
                        <span class="exercise-variables">
                          {{ getVariable1Label(exercise.weight_unit === 'percent' ? 'intensity' : 'weight') }} × {{ getVariable2Label(exercise.duration_unit === 'seconds' ? 'duration' : 'reps') }}
                        </span>
                      </div>
                      <div class="exercise-sets">
                        <div class="set-item">
                          <span class="set-number">第{{ exercise.set_number }}组:</span>
                          <span class="set-data">
                            {{ exercise.weight_or_intensity }}{{ exercise.weight_unit === 'percent' ? '%' : 'kg' }} × 
                            {{ exercise.reps_or_duration }}{{ exercise.duration_unit === 'seconds' ? '秒' : '次' }}
                          </span>
                          <span class="rest-time" v-if="exercise.rest_time">休息: {{ exercise.rest_time }}秒</span>
                        </div>
                      </div>
                      <div class="exercise-notes" v-if="exercise.notes">
                        <span class="notes-label">备注:</span>
                        <span class="notes-content">{{ exercise.notes }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="content-section">
                  <h4>拉伸松解</h4>
                  <div class="exercise-list">
                    <div 
                      v-for="exercise in selectedLog.stretch" 
                      :key="`${exercise.exercise_name}-${exercise.set_number}`"
                      class="exercise-item"
                    >
                      <div class="exercise-header">
                        <span class="exercise-name">{{ exercise.exercise_name }}</span>
                        <span class="exercise-variables">
                          {{ getVariable1Label(exercise.weight_unit === 'percent' ? 'intensity' : 'weight') }} × {{ getVariable2Label(exercise.duration_unit === 'seconds' ? 'duration' : 'reps') }}
                        </span>
                      </div>
                      <div class="exercise-sets">
                        <div class="set-item">
                          <span class="set-number">第{{ exercise.set_number }}组:</span>
                          <span class="set-data">
                            {{ exercise.weight_or_intensity }}{{ exercise.weight_unit === 'percent' ? '%' : 'kg' }} × 
                            {{ exercise.reps_or_duration }}{{ exercise.duration_unit === 'seconds' ? '秒' : '次' }}
                          </span>
                          <span class="rest-time" v-if="exercise.rest_time">休息: {{ exercise.rest_time }}秒</span>
                        </div>
                      </div>
                      <div class="exercise-notes" v-if="exercise.notes">
                        <span class="notes-label">备注:</span>
                        <span class="notes-content">{{ exercise.notes }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </el-tab-pane>

            <el-tab-pane label="评价总结" name="evaluation">
              <div class="evaluation-content">
                <div class="evaluation-section">
                  <h4>客观评价</h4>
                  <div class="evaluation-grid">
                    <div class="eval-item">
                      <span class="eval-label">课程完成度:</span>
                      <span class="eval-value">{{ selectedLog.completionRate }}%</span>
                    </div>
                    <div class="eval-item">
                      <span class="eval-label">技术完成度:</span>
                      <span class="eval-value">{{ selectedLog.technicalCompletion }}%</span>
                    </div>
                    <div class="eval-item">
                      <span class="eval-label">训练强度:</span>
                      <span class="eval-value">{{ selectedLog.trainingIntensity }}%</span>
                    </div>
                  </div>
                </div>

                <div class="evaluation-section">
                  <h4>主观感受</h4>
                  <div class="evaluation-grid">
                    <div class="eval-item">
                      <span class="eval-label">感受强度:</span>
                      <span class="eval-value">{{ selectedLog.memberIntensity }}%</span>
                    </div>
                    <div class="eval-item">
                      <span class="eval-label">感受难度:</span>
                      <span class="eval-value">{{ selectedLog.memberDifficulty }}%</span>
                    </div>
                    <div class="eval-item">
                      <span class="eval-label">整体满意度:</span>
                      <span class="eval-value">{{ selectedLog.memberRating }}分</span>
                    </div>
                  </div>
                </div>

                <div class="evaluation-section">
                  <h4>教练总结</h4>
                  <div class="summary-content">
                    <p>{{ selectedLog.coachSummary }}</p>
                  </div>
                </div>

                <div class="evaluation-section">
                  <h4>会员反馈</h4>
                  <div class="feedback-content">
                    <p>{{ selectedLog.memberFeedback }}</p>
                  </div>
                </div>
              </div>
            </el-tab-pane>

            <el-tab-pane label="电子签字" name="signatures">
              <div class="signatures-content">
                <div class="signature-item">
                  <h4>教练签字</h4>
                  <div class="signature-display">
                    <img 
                      v-if="selectedLog.coachSignature" 
                      :src="selectedLog.coachSignature" 
                      alt="教练签字"
                      class="signature-image"
                    />
                    <div v-else class="no-signature">未签字</div>
                  </div>
                </div>

                <div class="signature-item">
                  <h4>会员签字</h4>
                  <div class="signature-display">
                    <img 
                      v-if="selectedLog.memberSignature" 
                      :src="selectedLog.memberSignature" 
                      alt="会员签字"
                      class="signature-image"
                    />
                    <div v-else class="no-signature">未签字</div>
                  </div>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
      </el-dialog>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Download, Calendar, Clock, User, Star, Search, View, Edit, Delete 
} from '@element-plus/icons-vue'
import Layout from '@/components/Layout.vue'
import { http } from '@/utils/http'

const route = useRoute()

// 响应式数据
const dateRange = ref([])
const selectedMember = ref('')
const selectedCoach = ref('')
const selectedStatus = ref('')
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(20)
const showDetailDialog = ref(false)
const selectedLog = ref(null)
const activeDetailTab = ref('pre-training')

// 从URL参数获取member_id
const memberIdFromUrl = computed(() => {
  return route.query.member_id as string
})

// 页面标题和描述
const pageTitle = computed(() => {
  if (memberIdFromUrl.value) {
    const memberId = parseInt(memberIdFromUrl.value)
    const member = members.value.find(m => m.id === memberId)
    return member ? `${member.name}的训练记录 (ID: ${member.id})` : '训练记录'
  }
  return '训练记录'
})

const pageDescription = computed(() => {
  if (memberIdFromUrl.value) {
    const memberId = parseInt(memberIdFromUrl.value)
    const member = members.value.find(m => m.id === memberId)
    return member ? `查看会员 ${member.name} (ID: ${member.id}) 的历史训练记录` : '查看和管理历史训练记录'
  }
  return '查看和管理历史训练记录'
})

interface Member {
  id: number
  name: string
  phone: string
  gender: string
  age: number
  height?: number
  weight?: number
  bmi?: number
  health_history?: string
  medical_restrictions?: string
  emergency_contact?: string
  emergency_phone?: string
  notes?: string
  coach_id?: number
  access_mode: string
  status: number
  created_at: string
  updated_at: string
}

const members = ref<Member[]>([])

// 教练员数据
const coaches = ref([
  { id: 1, name: '李亚伟', role: 'admin' },
  { id: 2, name: '李教练', role: 'coach' },
  { id: 3, name: '王教练', role: 'coach' },
  { id: 4, name: '张教练', role: 'coach' }
])



interface TrainingLog {
  id: number
  date: string
  startTime: string
  memberName: string
  memberId: number
  coachName: string
  coachId: number
  memberAvatar: string
  duration: number
  completionRate: number
  memberRating: number
  status: string
  warmup: any[]
  main: any[]
  stretch: any[]
  technicalCompletion: number
  trainingIntensity: number
  memberIntensity: number
  memberDifficulty: number
  coachSummary: string
  memberFeedback: string
  coachSignature: string
  memberSignature: string
}

const logs = ref<TrainingLog[]>([])

// 获取训练日志数据
const fetchTrainingLogs = async () => {
  try {
    const response = await http.get('/api/training')
    const data = await response.json()
    if (data.success) {
      // 转换API数据格式为前端需要的格式
      logs.value = data.data.map((log: any) => ({
        id: log.id,
        date: log.training_date,
        startTime: log.training_start_time || '--',
        memberName: log.member_name || '未知会员',
        memberId: log.member_id,
        coachName: log.coach_name || '未知教练',
        coachId: log.coach_id,
        memberAvatar: '',
        duration: log.total_duration || 0,
        completionRate: log.completion_rate || 0,
        memberRating: log.member_rating || 0,
        status: log.status || 'draft',
        warmup: [], // 暂时为空，后续可以从模板数据获取
        main: [], // 暂时为空，后续可以从模板数据获取
        stretch: [], // 暂时为空，后续可以从模板数据获取
        technicalCompletion: log.completion_rate || 0,
        trainingIntensity: log.member_intensity_feeling || 5,
        memberIntensity: log.member_intensity_feeling || 5,
        memberDifficulty: log.member_difficulty_feeling || 5,
        coachSummary: log.coach_summary || '',
        memberFeedback: log.member_feedback || '',
        coachSignature: log.coach_signature_data || '',
        memberSignature: log.member_signature_data || ''
      }))
      console.log('✅ 训练日志数据加载成功:', logs.value.length, '条记录')
    }
  } catch (error) {
    console.error('❌ 加载训练日志数据失败:', error)
    ElMessage.error('加载训练日志数据失败')
  }
}

const filteredLogs = computed(() => {
  let filtered = logs.value
  console.log('🔍 开始筛选训练记录...')
  console.log('📊 原始记录数量:', logs.value.length)
  console.log('🔗 URL中的member_id:', memberIdFromUrl.value)

  // 如果URL中有member_id参数，优先使用该参数筛选
  if (memberIdFromUrl.value) {
    const memberId = parseInt(memberIdFromUrl.value)
    console.log('🎯 查找会员ID:', memberId)
    const member = members.value.find(m => m.id === memberId)
    if (member) {
      console.log('✅ 找到会员:', member.name)
      filtered = filtered.filter(log => log.memberId === memberId)
      console.log('📋 筛选后记录数量:', filtered.length)
    } else {
      console.log('❌ 未找到ID为', memberId, '的会员')
    }
  } else if (selectedMember.value) {
    console.log('🎯 使用selectedMember筛选:', selectedMember.value)
    const member = members.value.find(m => m.name === selectedMember.value)
    if (member) {
      filtered = filtered.filter(log => log.memberId === member.id)
    }
  }

  // 只显示已完成的训练记录
  filtered = filtered.filter(log => log.status === 'completed')
  console.log('✅ 只显示已完成记录，筛选后数量:', filtered.length)

  if (dateRange.value && dateRange.value.length === 2) {
    const [startDate, endDate] = dateRange.value
    filtered = filtered.filter(log => 
      log.date >= startDate && log.date <= endDate
    )
  }

  if (selectedCoach.value) {
    filtered = filtered.filter(log => log.coachId === selectedCoach.value)
  }

  if (selectedStatus.value) {
    filtered = filtered.filter(log => log.status === selectedStatus.value)
  }

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    filtered = filtered.filter(log => 
      log.memberName.toLowerCase().includes(keyword) ||
      log.coachName.toLowerCase().includes(keyword) ||
      log.date.includes(keyword)
    )
  }

  console.log('📊 最终筛选结果数量:', filtered.length)
  return filtered
})

const totalLogs = computed(() => filteredLogs.value.length)
const averageDuration = computed(() => {
  if (filteredLogs.value.length === 0) return '00:00'
  const total = filteredLogs.value.reduce((sum, log) => sum + log.duration, 0)
  const avg = total / filteredLogs.value.length
  return formatTime(avg)
})
const averageRating = computed(() => {
  if (filteredLogs.value.length === 0) return 0
  const total = filteredLogs.value.reduce((sum, log) => sum + log.memberRating, 0)
  return Math.round(total / filteredLogs.value.length)
})
const completionRate = computed(() => {
  if (filteredLogs.value.length === 0) return 0
  const completed = filteredLogs.value.filter(log => log.status === 'completed').length
  return Math.round((completed / filteredLogs.value.length) * 100)
})

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString()
}

const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

const getProgressColor = (percentage: number) => {
  if (percentage >= 80) return '#28A745'
  if (percentage >= 60) return '#FFC107'
  return '#DC3545'
}

const viewLogDetail = async (log: any) => {
  try {
    // 获取训练日志详情
    const response = await http.get(`/api/training/${log.id}`)
    const data = await response.json()
    if (data.success) {
      selectedLog.value = {
        ...log,
        ...data.data,
        // 处理训练详情数据
        warmup: data.data.details?.filter((d: any) => d.phase === 'warmup') || [],
        main: data.data.details?.filter((d: any) => d.phase === 'main') || [],
        stretch: data.data.details?.filter((d: any) => d.phase === 'stretch') || []
      }
      showDetailDialog.value = true
    } else {
      ElMessage.error('获取训练详情失败')
    }
  } catch (error) {
    console.error('获取训练详情失败:', error)
    ElMessage.error('获取训练详情失败')
  }
}

const editLog = (log: any) => {
  ElMessage.info('编辑功能开发中')
}

const deleteLog = (log: any) => {
  ElMessageBox.confirm(
    `确定要删除这条训练记录吗？`,
    '确认删除',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    const index = logs.value.findIndex(l => l.id === log.id)
    if (index > -1) {
      logs.value.splice(index, 1)
      ElMessage.success('记录删除成功')
    }
  })
}

const printLog = () => {
  ElMessage.info('打印功能开发中')
}

const exportData = () => {
  ElMessage.success('数据导出成功')
}

const handleSizeChange = (size: number) => {
  pageSize.value = size
  currentPage.value = 1
}

const handleCurrentChange = (page: number) => {
  currentPage.value = page
}

// 辅助函数：获取变量1标签
const getVariable1Label = (variable1: string) => {
  const labels = {
    weight: '重量',
    intensity: '强度',
    difficulty: '难度'
  }
  return labels[variable1 as keyof typeof labels] || variable1
}

// 辅助函数：获取变量2标签
const getVariable2Label = (variable2: string) => {
  const labels = {
    reps: '次数',
    duration: '时长'
  }
  return labels[variable2 as keyof typeof labels] || variable2
}

// 辅助函数：获取变量1单位
const getVariable1Unit = (variable1: string) => {
  const units = {
    weight: 'kg',
    intensity: '%',
    difficulty: '%'
  }
  return units[variable1 as keyof typeof units] || ''
}

// 辅助函数：获取变量2单位
const getVariable2Unit = (variable2: string) => {
  const units = {
    reps: '次',
    duration: '秒'
  }
  return units[variable2 as keyof typeof units] || ''
}

// 获取会员数据
const fetchMembers = async () => {
  try {
    const response = await http.get('/api/members')
    const data = await response.json()
    if (data.success) {
      members.value = data.data || []
      console.log('✅ 会员数据加载成功:', members.value.length, '个会员')
    }
  } catch (error) {
    console.error('❌ 加载会员数据失败:', error)
    ElMessage.error('加载会员数据失败')
  }
}

// 初始化
onMounted(async () => {
  // 先加载会员数据
  await fetchMembers()
  
  // 加载训练日志数据
  await fetchTrainingLogs()
  
  // 如果URL中有member_id参数，自动设置页面标题和筛选条件
  if (memberIdFromUrl.value) {
    const memberId = parseInt(memberIdFromUrl.value)
    const member = members.value.find(m => m.id === memberId)
    if (member) {
      // 设置selectedMember为对应的会员
      selectedMember.value = member.name
      console.log(`显示会员 ${member.name} 的训练记录`)
    }
  }
})
</script>

<style scoped>
.logs-page {
  padding: 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.header-left h2 {
  margin: 0 0 8px 0;
  color: #2E4057;
}

.header-desc {
  margin: 0;
  color: #6c757d;
  font-size: 14px;
}

.filter-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e5e5e5;
}

.filter-left {
  display: flex;
  gap: 16px;
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e5e5e5;
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: linear-gradient(135deg, #FF6B35 0%, #F7931E 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 24px;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #2E4057;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #6c757d;
}

.logs-content {
  flex: 1;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #e5e5e5;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.logs-table {
  flex: 1;
}

.date-cell {
  display: flex;
  flex-direction: column;
}

.date-main {
  font-weight: 500;
  color: #2E4057;
}

.date-time {
  font-size: 12px;
  color: #6c757d;
}

.member-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.member-name {
  font-weight: 500;
  color: #2E4057;
}

.member-id {
  font-size: 12px;
  color: #6c757d;
}

.duration {
  font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
  color: #FF6B35;
  font-weight: 500;
}

.rating-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rating-score {
  font-size: 12px;
  color: #6c757d;
}

.pagination-section {
  padding: 16px;
  border-top: 1px solid #e5e5e5;
  display: flex;
  justify-content: center;
}

/* 详情对话框样式 */
.log-detail {
  max-height: 70vh;
  overflow-y: auto;
}

.detail-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e5e5;
}

.detail-info h3 {
  margin: 0 0 8px 0;
  color: #2E4057;
}

.detail-meta {
  margin: 0;
  color: #6c757d;
  font-size: 14px;
}

.detail-tabs {
  height: 100%;
}

.training-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.content-section h4 {
  margin: 0 0 12px 0;
  color: #2E4057;
  font-size: 16px;
}

.exercise-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.exercise-item {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e5e5e5;
  margin-bottom: 12px;
}

.exercise-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.exercise-name {
  font-weight: 600;
  color: #2E4057;
  font-size: 16px;
}

.exercise-variables {
  font-size: 12px;
  color: #6c757d;
  background: #e9ecef;
  padding: 4px 8px;
  border-radius: 4px;
}

.exercise-sets {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.set-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: white;
  border-radius: 6px;
  border: 1px solid #dee2e6;
}

.set-number {
  font-size: 12px;
  color: #6c757d;
  min-width: 60px;
}

.set-data {
  font-size: 14px;
  color: #2E4057;
  font-weight: 500;
}

.rest-time {
  color: #FF6B35;
  font-size: 12px;
  margin-left: 8px;
}

.evaluation-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.evaluation-section h4 {
  margin: 0 0 16px 0;
  color: #2E4057;
  font-size: 16px;
}

.evaluation-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.eval-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e5e5e5;
}

.eval-label {
  font-size: 14px;
  color: #6c757d;
}

.eval-value {
  font-weight: bold;
  color: #FF6B35;
}

.summary-content,
.feedback-content {
  padding: 16px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e5e5e5;
}

.summary-content p,
.feedback-content p {
  margin: 0;
  line-height: 1.6;
  color: #2E4057;
}

.signatures-content {
  display: flex;
  gap: 24px;
}

.signature-item {
  flex: 1;
}

.signature-item h4 {
  margin: 0 0 16px 0;
  color: #2E4057;
  font-size: 16px;
}

.signature-display {
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 20px;
  background: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
}

.signature-image {
  max-width: 100%;
  max-height: 100px;
  border-radius: 4px;
}

.no-signature {
  color: #6c757d;
  font-style: italic;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .filter-section {
    flex-direction: column;
    gap: 16px;
  }
  
  .filter-left {
    flex-direction: column;
    width: 100%;
  }
  
  .stats-section {
    grid-template-columns: 1fr;
  }
  
  .signatures-content {
    flex-direction: column;
  }
}
</style> 