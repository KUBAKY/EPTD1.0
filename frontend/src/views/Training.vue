<template>
  <Layout>
    <div class="training-page">
      <!-- 1. 课程计时系统模块 -->
      <div class="timer-section">
        <div class="timer-container">
          <div class="timer-display">
            <div class="timer-time">{{ formatTime(timerTime) }}</div>
            <div class="timer-status" :class="timerStatus">
              {{ getStatusText() }}
            </div>
          </div>
          <div class="timer-controls">
            <el-button 
              v-if="!isStarted" 
              type="success" 
              size="large" 
              @click="startTraining"
              class="timer-btn start-btn"
            >
              <el-icon><VideoPlay /></el-icon>
              开始训练
            </el-button>
            <el-button 
              v-if="isStarted && !isPaused" 
              type="warning" 
              size="large" 
              @click="pauseTraining"
              class="timer-btn pause-btn"
            >
              <el-icon><VideoPause /></el-icon>
              暂停
            </el-button>
            <el-button 
              v-if="isPaused" 
              type="primary" 
              size="large" 
              @click="resumeTraining"
              class="timer-btn resume-btn"
            >
              <el-icon><VideoPlay /></el-icon>
              继续
            </el-button>
            <el-button 
              v-if="isStarted" 
              type="danger" 
              size="large" 
              @click="endTraining"
              class="timer-btn end-btn"
            >
              <el-icon><CircleClose /></el-icon>
              结束训练
            </el-button>
          </div>
        </div>
      </div>

      <!-- 时间数据显示区域 -->
      <div class="time-data-section">
        <div class="time-data-container">
          <div class="time-card">
            <div class="time-label">开始时间</div>
            <div class="time-value">{{ startTime || '--:--' }}</div>
            <div class="time-status" :class="{ active: isStarted }"></div>
          </div>
          <div class="time-card">
            <div class="time-label">预计结束</div>
            <div class="time-value">{{ estimatedEndTime || '--:--' }}</div>
            <div class="time-status" :class="{ active: isStarted }"></div>
          </div>
          <div class="time-card">
            <div class="time-label">训练时长</div>
            <div class="time-value">{{ formatTime(timerTime) }}</div>
            <div class="time-status" :class="{ active: isStarted }"></div>
          </div>
        </div>
        <div class="time-comparison">
          <span class="comparison-text">历史平均: {{ averageDuration || '50分钟' }}</span>
        </div>
      </div>

      <!-- 主要内容区域 - 上下布局 -->
      <div class="main-content">
        <!-- 2. 上课会员基本信息模块 -->
        <div class="member-info-section">
          <div class="section-header">
            <h3>会员基本信息</h3>
          </div>
          <div class="member-info-grid">
            <div class="member-basic-info">
              <div class="member-avatar">
                <el-avatar :size="80" :src="memberInfo.avatar">
                  {{ memberInfo.name?.charAt(0) }}
                </el-avatar>
              </div>
              <div class="member-details">
                <h4>{{ memberInfo.name }}</h4>
                <p class="member-id">ID: {{ memberInfo.phone }}</p>
                <p class="member-details">{{ memberInfo.age }}岁 | {{ memberInfo.gender === 'male' ? '男' : '女' }}</p>
                <div class="member-stats">
                  <div class="stat-item">
                    <span class="stat-label">已完成课程</span>
                    <span class="stat-value">{{ memberInfo.trainingCount || 0 }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-label">平均时长</span>
                    <span class="stat-value">{{ memberInfo.averageDuration || '50分钟' }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="health-info">
              <h5>健康信息</h5>
              <div class="health-content">
                <div class="health-item">
                  <span class="health-label">健康历史:</span>
                  <span class="health-value">{{ memberInfo.healthHistory || '无特殊病史' }}</span>
                </div>
                <div class="health-item">
                  <span class="health-label">运动禁忌:</span>
                  <span class="health-value">{{ memberInfo.exerciseContraindications || '无运动禁忌' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 3. 课前查询执行模块 -->
        <div class="pre-training-section">
          <div class="section-header">
            <h3>课前状态查询</h3>
          </div>
          <div class="pre-training-grid">
            <div class="query-item">
              <span class="query-label">饮食情况</span>
              <el-select v-model="preTraining.diet" placeholder="请选择饮食情况" style="width: 100%">
                <el-option label="正常饮食" value="normal" />
                <el-option label="节食中" value="dieting" />
                <el-option label="增重中" value="bulking" />
                <el-option label="其他" value="other" />
              </el-select>
            </div>
            <div class="query-item">
              <span class="query-label">睡眠情况</span>
              <el-rate v-model="preTraining.sleepQuality" :max="5" />
            </div>
            <div class="query-item">
              <span class="query-label">疲劳程度</span>
              <el-rate v-model="preTraining.fatigueLevel" :max="5" />
            </div>
            <div class="query-item">
              <span class="query-label">注意事项</span>
              <el-input 
                v-model="preTraining.notes" 
                type="textarea" 
                :rows="3"
                placeholder="请输入注意事项..."
              />
            </div>
          </div>
        </div>

        <!-- 4. 课程训练内容模块 -->
        <div class="training-content-section">
          <div class="section-header">
            <h3>训练内容</h3>
            <el-button type="primary" @click="showTemplateDialog = true">
              调用训练计划模板
            </el-button>
          </div>
          
          <!-- 训练内容栏 - 热身激活 -->
          <div class="training-phase-section">
            <div class="phase-header">
              <span class="phase-title">热身激活</span>
              <el-button 
                type="primary" 
                size="small" 
                @click="openAddExerciseDialog('warmup')"
                :disabled="warmupExercises.length >= 6"
              >
                <el-icon><Plus /></el-icon>
                添加动作
              </el-button>
            </div>
            <div class="exercises-list">
              <div 
                v-for="(exercise, index) in warmupExercises" 
                :key="index"
                class="exercise-item"
              >
                <div class="exercise-header">
                  <div class="exercise-info">
                    <span class="exercise-name">{{ exercise.name }}</span>
                    <div class="exercise-variables">
                      <span class="variable-label">{{ getVariable1Label(exercise.variable1) }}</span>
                      <span class="variable-separator">×</span>
                      <span class="variable-label">{{ getVariable2Label(exercise.variable2) }}</span>
                    </div>
                  </div>
                  <div class="exercise-actions">
                    <el-button 
                      type="text" 
                      size="small" 
                      @click="addSet('warmup', index)"
                      :disabled="exercise.sets >= 3"
                    >
                      <el-icon><Plus /></el-icon>
                      增加组数
                    </el-button>
                    <span class="sets-count">{{ exercise.sets }}组</span>
                    <el-button 
                      type="danger" 
                      size="small" 
                      @click="removeExercise('warmup', index)"
                      :icon="Delete"
                    />
                  </div>
                </div>
                <!-- 组数数据记录 -->
                <div class="sets-data">
                  <div 
                    v-for="(set, setIndex) in exercise.setData" 
                    :key="setIndex"
                    class="set-item"
                  >
                    <span class="set-number">第{{ setIndex + 1 }}组</span>
                    <el-input-number 
                      v-model="set.variable1Value" 
                      :placeholder="getVariable1Placeholder(exercise.variable1)"
                      size="small"
                      style="width: 100px"
                    />
                    <span class="unit">{{ getVariable1Unit(exercise.variable1) }}</span>
                    <el-input-number 
                      v-model="set.variable2Value" 
                      :placeholder="getVariable2Placeholder(exercise.variable2)"
                      size="small"
                      style="width: 100px"
                    />
                    <span class="unit">{{ getVariable2Unit(exercise.variable2) }}</span>
                    <el-button 
                      type="danger" 
                      size="small" 
                      @click="removeSet('warmup', index, setIndex)"
                      :icon="Delete"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 训练内容栏 - 主体训练 -->
          <div class="training-phase-section">
            <div class="phase-header">
              <span class="phase-title">主体训练</span>
              <el-button 
                type="primary" 
                size="small" 
                @click="openAddExerciseDialog('main')"
                :disabled="mainExercises.length >= 30"
              >
                <el-icon><Plus /></el-icon>
                添加动作
              </el-button>
            </div>
            <div class="exercises-list">
              <div 
                v-for="(exercise, index) in mainExercises" 
                :key="index"
                class="exercise-item"
              >
                <div class="exercise-header">
                  <div class="exercise-info">
                    <span class="exercise-name">{{ exercise.name }}</span>
                    <div class="exercise-variables">
                      <span class="variable-label">{{ getVariable1Label(exercise.variable1) }}</span>
                      <span class="variable-separator">×</span>
                      <span class="variable-label">{{ getVariable2Label(exercise.variable2) }}</span>
                    </div>
                  </div>
                  <div class="exercise-actions">
                    <el-button 
                      type="text" 
                      size="small" 
                      @click="addSet('main', index)"
                      :disabled="exercise.sets >= 20"
                    >
                      <el-icon><Plus /></el-icon>
                      增加组数
                    </el-button>
                    <span class="sets-count">{{ exercise.sets }}组</span>
                    <el-button 
                      type="danger" 
                      size="small" 
                      @click="removeExercise('main', index)"
                      :icon="Delete"
                    />
                  </div>
                </div>
                <!-- 组数数据记录 -->
                <div class="sets-data">
                  <div 
                    v-for="(set, setIndex) in exercise.setData" 
                    :key="setIndex"
                    class="set-item"
                  >
                    <span class="set-number">第{{ setIndex + 1 }}组</span>
                    <el-input-number 
                      v-model="set.variable1Value" 
                      :placeholder="getVariable1Placeholder(exercise.variable1)"
                      size="small"
                      style="width: 100px"
                    />
                    <span class="unit">{{ getVariable1Unit(exercise.variable1) }}</span>
                    <el-input-number 
                      v-model="set.variable2Value" 
                      :placeholder="getVariable2Placeholder(exercise.variable2)"
                      size="small"
                      style="width: 100px"
                    />
                    <span class="unit">{{ getVariable2Unit(exercise.variable2) }}</span>
                    <el-button 
                      type="danger" 
                      size="small" 
                      @click="removeSet('main', index, setIndex)"
                      :icon="Delete"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 训练内容栏 - 拉伸松解 -->
          <div class="training-phase-section">
            <div class="phase-header">
              <span class="phase-title">拉伸松解</span>
              <el-button 
                type="primary" 
                size="small" 
                @click="openAddExerciseDialog('stretch')"
                :disabled="stretchExercises.length >= 12"
              >
                <el-icon><Plus /></el-icon>
                添加动作
              </el-button>
            </div>
            <div class="exercises-list">
              <div 
                v-for="(exercise, index) in stretchExercises" 
                :key="index"
                class="exercise-item"
              >
                <div class="exercise-header">
                  <div class="exercise-info">
                    <span class="exercise-name">{{ exercise.name }}</span>
                    <div class="exercise-variables">
                      <span class="variable-label">{{ getVariable1Label(exercise.variable1) }}</span>
                      <span class="variable-separator">×</span>
                      <span class="variable-label">{{ getVariable2Label(exercise.variable2) }}</span>
                    </div>
                  </div>
                  <div class="exercise-actions">
                    <el-button 
                      type="text" 
                      size="small" 
                      @click="addSet('stretch', index)"
                      :disabled="exercise.sets >= 3"
                    >
                      <el-icon><Plus /></el-icon>
                      增加组数
                    </el-button>
                    <span class="sets-count">{{ exercise.sets }}组</span>
                    <el-button 
                      type="danger" 
                      size="small" 
                      @click="removeExercise('stretch', index)"
                      :icon="Delete"
                    />
                  </div>
                </div>
                <!-- 组数数据记录 -->
                <div class="sets-data">
                  <div 
                    v-for="(set, setIndex) in exercise.setData" 
                    :key="setIndex"
                    class="set-item"
                  >
                    <span class="set-number">第{{ setIndex + 1 }}组</span>
                    <el-input-number 
                      v-model="set.variable1Value" 
                      :placeholder="getVariable1Placeholder(exercise.variable1)"
                      size="small"
                      style="width: 100px"
                    />
                    <span class="unit">{{ getVariable1Unit(exercise.variable1) }}</span>
                    <el-input-number 
                      v-model="set.variable2Value" 
                      :placeholder="getVariable2Placeholder(exercise.variable2)"
                      size="small"
                      style="width: 100px"
                    />
                    <span class="unit">{{ getVariable2Unit(exercise.variable2) }}</span>
                    <el-button 
                      type="danger" 
                      size="small" 
                      @click="removeSet('stretch', index, setIndex)"
                      :icon="Delete"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 5. 课程总结与评价模块 -->
        <div class="summary-section">
          <div class="section-header">
            <h3>课程总结与评价</h3>
          </div>
          <div class="summary-grid">
            <!-- 教练点评 -->
            <div class="coach-evaluation">
              <h4>教练点评</h4>
              <div class="evaluation-items">
                <div class="evaluation-item">
                  <span class="evaluation-label">课程完成度</span>
                  <el-slider 
                    v-model="summary.completionRate" 
                    :min="0" 
                    :max="100" 
                    show-input
                  />
                </div>
                <div class="evaluation-item">
                  <span class="evaluation-label">动作技巧完成度</span>
                  <el-slider 
                    v-model="summary.skillCompletion" 
                    :min="0" 
                    :max="100" 
                    show-input
                  />
                </div>
                <div class="evaluation-item">
                  <span class="evaluation-label">训练强度定位</span>
                  <el-slider 
                    v-model="summary.intensityLevel" 
                    :min="1" 
                    :max="10" 
                    show-input
                  />
                </div>
                <div class="evaluation-item">
                  <span class="evaluation-label">教练总结</span>
                  <el-input 
                    v-model="summary.coachSummary" 
                    type="textarea" 
                    :rows="4"
                    placeholder="请输入教练总结..."
                  />
                </div>
              </div>
            </div>

            <!-- 会员主观感受 -->
            <div class="member-feedback">
              <h4>会员主观感受</h4>
              <div class="feedback-items">
                <div class="feedback-item">
                  <span class="feedback-label">课程难度</span>
                  <el-slider 
                    v-model="summary.difficultyFeeling" 
                    :min="1" 
                    :max="10" 
                    show-input
                  />
                </div>
                <div class="feedback-item">
                  <span class="feedback-label">训练强度</span>
                  <el-slider 
                    v-model="summary.intensityFeeling" 
                    :min="1" 
                    :max="10" 
                    show-input
                  />
                </div>
                <div class="feedback-item">
                  <span class="feedback-label">课程满意度</span>
                  <el-rate v-model="summary.memberRating" :max="5" />
                </div>
                <div class="feedback-item">
                  <span class="feedback-label">会员反馈</span>
                  <el-input 
                    v-model="summary.memberFeedback" 
                    type="textarea" 
                    :rows="4"
                    placeholder="请输入会员反馈..."
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 6. 手写签字模块 -->
        <div class="signature-section">
          <div class="section-header">
            <h3>电子签字</h3>
          </div>
          <div class="signature-grid">
            <div class="signature-item">
              <span class="signature-label">教练签字</span>
              <SignaturePadComponent 
                ref="coachSignatureRef"
                :width="300"
                :height="120"
                @change="(isEmpty) => console.log('教练签字变化:', isEmpty)"
                @data="(data) => console.log('教练签字数据:', data)"
              />
            </div>
            <div class="signature-item">
              <span class="signature-label">会员签字</span>
              <SignaturePadComponent 
                ref="memberSignatureRef"
                :width="300"
                :height="120"
                @change="(isEmpty) => console.log('会员签字变化:', isEmpty)"
                @data="(data) => console.log('会员签字数据:', data)"
              />
            </div>
          </div>
        </div>

        <!-- 7. 课程完成保存提交按钮 -->
        <div class="save-section">
          <el-button type="primary" size="large" @click="saveTrainingLog">
            保存训练记录
          </el-button>
        </div>
      </div>
    </div>

    <!-- 添加动作对话框 -->
    <AddExerciseDialog
      v-model="showAddExerciseDialog"
      :phase="currentPhase"
      :current-exercise-count="getCurrentExerciseCount()"
      @confirm="addExercise"
    />

    <!-- 模板选择对话框 -->
    <TemplateSelectionDialog
      v-model="showTemplateDialog"
      :templates="templates"
      @use-template="useTemplate"
      @create-template="handleCreateTemplate"
    />

    <!-- 创建模板对话框 -->
    <el-dialog 
      v-model="showCreateDialog" 
      title="创建训练模板" 
      width="80%"
      class="create-template-dialog"
    >
      <CreateTemplate @created="handleTemplateCreated" />
    </el-dialog>
  </Layout>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  VideoPlay, 
  VideoPause, 
  CircleClose, 
  Plus, 
  Delete, 
  Minus 
} from '@element-plus/icons-vue'
import Layout from '@/components/Layout.vue'
import SignaturePadComponent from '@/components/SignaturePad.vue'
import AddExerciseDialog from '@/components/AddExerciseDialog.vue'
import TemplateSelectionDialog from '@/components/TemplateSelectionDialog.vue'
import CreateTemplate from '@/components/CreateTemplate.vue' // Added import for CreateTemplate
import { loadTemplates, getTemplates, type Template } from '@/services/templateService'
import { http } from '@/utils/http'

// 路由参数
const route = useRoute()
const router = useRouter()
const memberId = route.params.member_id as string

// 计时器相关
const timerTime = ref(0)
const isStarted = ref(false)
const isPaused = ref(false)
const timerStatus = ref('stopped')
const startTime = ref('')
const estimatedEndTime = ref('')
const averageDuration = ref('50分钟')

// 训练阶段
const activePhase = ref('warmup')
const warmupExercises = ref<any[]>([])
const mainExercises = ref<any[]>([])
const stretchExercises = ref<any[]>([])

// 添加动作对话框
const showAddExerciseDialog = ref(false)
const currentPhase = ref<'warmup' | 'main' | 'stretch'>('warmup')

// 会员信息
const memberInfo = reactive({
  id: 0,
  name: '',
  phone: '',
  age: 0,
  gender: '',
  avatar: '',
  trainingCount: 0,
  averageDuration: '50分钟',
  healthHistory: '',
  exerciseContraindications: ''
})

// 课前查询数据
const preTraining = reactive({
  diet: '',
  sleepQuality: 3,
  fatigueLevel: 3,
  notes: ''
})

// 模板相关
const selectedTemplate = ref<number | null>(null)
const showTemplateDialog = ref(false)
const templates = ref<Template[]>([])
const showCreateDialog = ref(false) // Added for create template dialog

// 训练总结
const summary = reactive({
  completionRate: 0,
  skillCompletion: 0,
  intensityLevel: 5,
  coachSummary: '',
  difficultyFeeling: 5,
  intensityFeeling: 5,
  memberRating: 0,
  memberFeedback: ''
})

// 签名相关
const coachSignatureRef = ref()
const memberSignatureRef = ref()

// 计时器
let timerInterval: number | null = null

// 格式化时间
const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 获取状态文本
const getStatusText = () => {
  if (!isStarted.value) return '未开始'
  if (isPaused.value) return '已暂停'
  return '进行中'
}

// 开始训练
const startTraining = () => {
  isStarted.value = true
  isPaused.value = false
  timerStatus.value = 'running'
  startTime.value = new Date().toLocaleTimeString('zh-CN', { hour12: false })
  
  timerInterval = setInterval(() => {
    timerTime.value++
  }, 1000)
}

// 暂停训练
const pauseTraining = () => {
  isPaused.value = true
  timerStatus.value = 'paused'
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
}

// 继续训练
const resumeTraining = () => {
  isPaused.value = false
  timerStatus.value = 'running'
  timerInterval = setInterval(() => {
    timerTime.value++
  }, 1000)
}

// 结束训练
const endTraining = async () => {
  try {
    await ElMessageBox.confirm('确定要结束训练吗？', '确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    isStarted.value = false
    isPaused.value = false
    timerStatus.value = 'stopped'
    
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
    
    ElMessage.success('训练已结束')
  } catch {
    // 用户取消
  }
}

// 阶段切换
const handlePhaseChange = (tab: any) => {
  activePhase.value = tab.props.name
}

// 显示添加动作对话框
const openAddExerciseDialog = (phase: 'warmup' | 'main' | 'stretch') => {
  currentPhase.value = phase
  showAddExerciseDialog.value = true
}

// 添加动作
const addExercise = (exerciseData: any) => {
  const newExercise = {
    name: exerciseData.name,
    variable1: exerciseData.variable1,
    variable2: exerciseData.variable2,
    sets: 1,
    setData: [{
      variable1Value: 0,
      variable2Value: 0
    }]
  }
  
  switch (currentPhase.value) {
    case 'warmup':
      warmupExercises.value.push(newExercise)
      break
    case 'main':
      mainExercises.value.push(newExercise)
      break
    case 'stretch':
      stretchExercises.value.push(newExercise)
      break
  }
}

// 获取变量1标签
const getVariable1Label = (variable1: string) => {
  const labels = {
    weight: '重量',
    intensity: '强度',
    difficulty: '难度'
  }
  return labels[variable1 as keyof typeof labels] || variable1
}

// 获取变量2标签
const getVariable2Label = (variable2: string) => {
  const labels = {
    reps: '次数',
    duration: '时长'
  }
  return labels[variable2 as keyof typeof labels] || variable2
}

// 获取变量1占位符
const getVariable1Placeholder = (variable1: string) => {
  const placeholders = {
    weight: '重量',
    intensity: '强度',
    difficulty: '难度'
  }
  return placeholders[variable1 as keyof typeof placeholders] || ''
}

// 获取变量2占位符
const getVariable2Placeholder = (variable2: string) => {
  const placeholders = {
    reps: '次数',
    duration: '时长'
  }
  return placeholders[variable2 as keyof typeof placeholders] || ''
}

// 获取变量1单位
const getVariable1Unit = (variable1: string) => {
  const units = {
    weight: 'kg',
    intensity: '%',
    difficulty: '%'
  }
  return units[variable1 as keyof typeof units] || ''
}

// 获取变量2单位
const getVariable2Unit = (variable2: string) => {
  const units = {
    reps: '次',
    duration: '秒'
  }
  return units[variable2 as keyof typeof units] || ''
}

// 删除动作
const removeExercise = (phase: string, index: number) => {
  switch (phase) {
    case 'warmup':
      warmupExercises.value.splice(index, 1)
      break
    case 'main':
      mainExercises.value.splice(index, 1)
      break
    case 'stretch':
      stretchExercises.value.splice(index, 1)
      break
  }
}

// 添加组数
const addSet = (phase: string, exerciseIndex: number) => {
  let exercises: any[]
  let maxSets: number
  
  switch (phase) {
    case 'warmup':
      exercises = warmupExercises.value
      maxSets = 3
      break
    case 'main':
      exercises = mainExercises.value
      maxSets = 20
      break
    case 'stretch':
      exercises = stretchExercises.value
      maxSets = 3
      break
    default:
      return
  }
  
  const exercise = exercises[exerciseIndex]
  if (exercise.sets < maxSets) {
    exercise.sets++
    exercise.setData.push({
      variable1Value: 0,
      variable2Value: 0
    })
  }
}

// 删除组数
const removeSet = (phase: string, exerciseIndex: number, setIndex: number) => {
  let exercises: any[]
  switch (phase) {
    case 'warmup':
      exercises = warmupExercises.value
      break
    case 'main':
      exercises = mainExercises.value
      break
    case 'stretch':
      exercises = stretchExercises.value
      break
    default:
      return
  }
  
  const exercise = exercises[exerciseIndex]
  if (exercise.sets > 1) {
    exercise.sets--
    exercise.setData.splice(setIndex, 1)
  }
}

// 使用模板
const useTemplate = (template: Template) => {
  // 清空现有动作
  warmupExercises.value = []
  mainExercises.value = []
  stretchExercises.value = []
  
  // 填充热身动作
  if (template.warmup && template.warmup.length > 0) {
    template.warmup.forEach((exercise: any) => {
      warmupExercises.value.push({
        name: exercise.name,
        variable1: exercise.variable1,
        variable2: exercise.variable2,
        sets: 1,
        setData: [{
          variable1Value: 0,
          variable2Value: 0
        }]
      })
    })
  }
  
  // 填充主体动作
  if (template.main && template.main.length > 0) {
    template.main.forEach((exercise: any) => {
      mainExercises.value.push({
        name: exercise.name,
        variable1: exercise.variable1,
        variable2: exercise.variable2,
        sets: 1,
        setData: [{
          variable1Value: 0,
          variable2Value: 0
        }]
      })
    })
  }
  
  // 填充拉伸动作
  if (template.stretch && template.stretch.length > 0) {
    template.stretch.forEach((exercise: any) => {
      stretchExercises.value.push({
        name: exercise.name,
        variable1: exercise.variable1,
        variable2: exercise.variable2,
        sets: 1,
        setData: [{
          variable1Value: 0,
          variable2Value: 0
        }]
      })
    })
  }
  
  ElMessage.success('模板已应用')
}

// 创建新模板
const handleCreateTemplate = () => {
  showCreateDialog.value = true
}

// 处理模板创建成功
const handleTemplateCreated = async () => {
  showCreateDialog.value = false
  // 重新加载模板数据
  await loadTemplateData()
  ElMessage.success('模板创建成功，数据已刷新')
}

// 获取当前阶段的动作数量
const getCurrentExerciseCount = () => {
  switch (currentPhase.value) {
    case 'warmup':
      return warmupExercises.value.length
    case 'main':
      return mainExercises.value.length
    case 'stretch':
      return stretchExercises.value.length
    default:
      return 0
  }
}

// 加载模板数据
const loadTemplateData = async () => {
  try {
    await loadTemplates()
    templates.value = getTemplates()
    console.log('模板数据已加载:', templates.value.length, '个模板')
  } catch (error) {
    console.error('加载模板数据失败:', error)
    ElMessage.error('加载模板数据失败')
  }
}

// 清除签字
const clearSignature = (type: 'coach' | 'member') => {
  const signatureRef = type === 'coach' ? coachSignatureRef.value : memberSignatureRef.value
  if (signatureRef) {
    signatureRef.clear()
  }
}

// 保存训练记录
const saveTrainingLog = async () => {
  try {
    // 获取签字数据
    const coachSignatureData = coachSignatureRef.value?.getData() || ''
    const memberSignatureData = memberSignatureRef.value?.getData() || ''
    
    // 构建课前查体状态
    const preTrainingStatus = `饮食情况: ${preTraining.diet || '正常'}, 睡眠质量: ${preTraining.sleepQuality}/5, 疲劳程度: ${preTraining.fatigueLevel}/5, 备注: ${preTraining.notes || '无'}`
    
    // 构建训练记录数据
    const trainingData = {
      member_id: memberId,
      coach_id: 1, // 当前登录的教练ID
      training_date: new Date().toISOString().split('T')[0],
      pre_training_status: preTrainingStatus,
      completion_rate: summary.completionRate,
      member_intensity_feeling: summary.intensityFeeling,
      member_difficulty_feeling: summary.difficultyFeeling,
      member_performance_score: summary.skillCompletion,
      coach_summary: summary.coachSummary,
      member_rating: summary.memberRating,
      member_feedback: summary.memberFeedback,
      coach_signature_data: coachSignatureData,
      member_signature_data: memberSignatureData,
      total_duration: timerTime.value,
      training_start_time: startTime.value,
      training_end_time: new Date().toLocaleTimeString('zh-CN', { hour12: false }),
      status: 'completed'
    }
    
    // 发送到后端保存训练日志
    const response = await http.post('/api/training', trainingData)
    
    if (response.ok) {
      const result = await response.json()
      const logId = result.data.id
      
      // 保存训练详情数据
      await saveTrainingDetails(logId)
      
      ElMessage.success('训练记录保存成功')
      router.push('/logs')
    } else {
      throw new Error('保存失败')
    }
  } catch (error) {
    console.error('保存训练记录失败:', error)
    ElMessage.error('保存训练记录失败')
  }
}

// 保存训练详情数据
const saveTrainingDetails = async (logId: number) => {
  try {
    // 保存热身阶段数据
    for (const exercise of warmupExercises.value) {
      for (let i = 0; i < exercise.sets; i++) {
        const setData = exercise.setData[i] || { variable1Value: 0, variable2Value: 0 }
        await http.post(`/api/training/${logId}/details`, {
          log_id: logId,
          phase: 'warmup',
          exercise_name: exercise.name,
          exercise_order: warmupExercises.value.indexOf(exercise) + 1,
          set_number: i + 1,
          weight_or_intensity: setData.variable1Value,
          weight_unit: exercise.variable1 === 'intensity' ? 'percent' : 'kg',
          reps_or_duration: setData.variable2Value,
          duration_unit: exercise.variable2 === 'duration' ? 'seconds' : 'reps',
          rest_time: 30,
          notes: exercise.description || ''
        })
      }
    }
    
    // 保存主体训练阶段数据
    for (const exercise of mainExercises.value) {
      for (let i = 0; i < exercise.sets; i++) {
        const setData = exercise.setData[i] || { variable1Value: 0, variable2Value: 0 }
        await http.post(`/api/training/${logId}/details`, {
          log_id: logId,
          phase: 'main',
          exercise_name: exercise.name,
          exercise_order: mainExercises.value.indexOf(exercise) + 1,
          set_number: i + 1,
          weight_or_intensity: setData.variable1Value,
          weight_unit: exercise.variable1 === 'intensity' ? 'percent' : 'kg',
          reps_or_duration: setData.variable2Value,
          duration_unit: exercise.variable2 === 'duration' ? 'seconds' : 'reps',
          rest_time: 60,
          notes: exercise.description || ''
        })
      }
    }
    
    // 保存拉伸阶段数据
    for (const exercise of stretchExercises.value) {
      for (let i = 0; i < exercise.sets; i++) {
        const setData = exercise.setData[i] || { variable1Value: 0, variable2Value: 0 }
        await http.post(`/api/training/${logId}/details`, {
          log_id: logId,
          phase: 'stretch',
          exercise_name: exercise.name,
          exercise_order: stretchExercises.value.indexOf(exercise) + 1,
          set_number: i + 1,
          weight_or_intensity: setData.variable1Value,
          weight_unit: exercise.variable1 === 'intensity' ? 'percent' : 'kg',
          reps_or_duration: setData.variable2Value,
          duration_unit: exercise.variable2 === 'duration' ? 'seconds' : 'reps',
          rest_time: 0,
          notes: exercise.description || ''
        })
      }
    }
  } catch (error) {
    console.error('保存训练详情失败:', error)
    throw error
  }
}

// 加载会员信息
const loadMemberInfo = async () => {
  if (!memberId) {
    ElMessage.error('会员ID不能为空')
    return
  }
  
  try {
    const response = await http.get(`/api/members/${memberId}`)
    if (response.ok) {
      const data = await response.json()
      const member = data.data
      
      // 更新会员信息
      memberInfo.id = member.id
      memberInfo.name = member.name
      memberInfo.phone = member.phone
      memberInfo.age = member.age
      memberInfo.gender = member.gender
      memberInfo.healthHistory = member.health_history || '无特殊病史'
      memberInfo.exerciseContraindications = member.medical_restrictions || '无运动禁忌'
      memberInfo.trainingCount = member.training_count || 0
      
      console.log('✅ 会员信息已加载:', memberInfo.name)
    } else {
      ElMessage.error('加载会员信息失败')
    }
  } catch (error) {
    console.error('❌ 加载会员信息错误:', error)
    ElMessage.error('加载会员信息失败')
  }
}

// 组件挂载时加载数据
onMounted(async () => {
  await loadMemberInfo()
  await loadTemplateData()
})

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval)
  }
})
</script>

<style scoped>
.training-page {
  min-height: 100vh;
  background: #f5f7fa;
}

/* 计时器区域 */
.timer-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
  color: white;
}

.timer-container {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
}

.timer-display {
  margin-bottom: 20px;
}

.timer-time {
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 10px;
}

.timer-status {
  font-size: 18px;
  opacity: 0.9;
}

.timer-status.active {
  color: #28A745;
}

.timer-status.paused {
  color: #FFC107;
}

.timer-status.idle {
  color: #6c757d;
}

.timer-controls {
  display: flex;
  justify-content: center;
  gap: 15px;
}

.timer-btn {
  min-width: 120px;
}

/* 时间数据显示 */
.time-data-section {
  background: white;
  padding: 20px;
  border-bottom: 1px solid #e4e7ed;
}

.time-data-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-around;
}

.time-card {
  text-align: center;
  padding: 15px;
  border-radius: 8px;
  background: #f8f9fa;
  min-width: 150px;
}

.time-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.time-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.time-status {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #dcdfe6;
  margin: 8px auto 0;
}

.time-status.active {
  background: #67c23a;
}

.time-comparison {
  text-align: center;
  margin-top: 15px;
}

.comparison-text {
  color: #909399;
  font-size: 14px;
}

/* 主要内容区域 - 上下布局 */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 通用section样式 */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e4e7ed;
}

.section-header h3 {
  margin: 0;
  color: #303133;
  font-size: 18px;
}

/* 会员信息模块 */
.member-info-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.member-info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.member-basic-info {
  display: flex;
  gap: 20px;
  align-items: center;
}

.member-details h4 {
  margin: 0 0 8px 0;
  color: #303133;
  font-size: 20px;
}

.member-id {
  color: #909399;
  font-size: 14px;
  margin: 5px 0;
}

.member-details p {
  color: #606266;
  font-size: 14px;
  margin: 5px 0;
}

.member-stats {
  display: flex;
  gap: 20px;
  margin-top: 10px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: #909399;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
}

.health-info h5 {
  margin: 0 0 15px 0;
  color: #303133;
  font-size: 16px;
}

.health-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.health-item {
  display: flex;
  gap: 10px;
}

.health-label {
  font-weight: bold;
  color: #606266;
  min-width: 80px;
}

.health-value {
  color: #303133;
}

/* 课前查询模块 */
.pre-training-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.pre-training-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.query-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.query-label {
  font-size: 14px;
  color: #606266;
  font-weight: bold;
}

/* 训练内容模块 */
.training-content-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.training-phase-section {
  margin-bottom: 32px;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  overflow: hidden;
}

.training-phase-section:last-child {
  margin-bottom: 0;
}

.phase-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #e5e5e5;
}

.phase-title {
  font-size: 16px;
  font-weight: 600;
  color: #2E4057;
}

.exercises-list {
  padding: 20px;
}

.exercise-item {
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  margin-bottom: 16px;
  overflow: hidden;
}

.exercise-item:last-child {
  margin-bottom: 0;
}

.exercise-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #fafafa;
  border-bottom: 1px solid #e5e5e5;
}

.exercise-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.exercise-name {
  font-size: 16px;
  font-weight: 600;
  color: #2E4057;
}

.exercise-variables {
  display: flex;
  align-items: center;
  gap: 8px;
}

.variable-label {
  font-size: 12px;
  color: #606266;
  background: #f0f0f0;
  padding: 2px 8px;
  border-radius: 4px;
}

.variable-separator {
  font-size: 12px;
  color: #909399;
  font-weight: bold;
}

.exercise-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sets-count {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.sets-data {
  padding: 16px 20px;
}

.set-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.set-item:last-child {
  border-bottom: none;
}

.set-number {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
  min-width: 60px;
}

.unit {
  font-size: 12px;
  color: #909399;
  min-width: 20px;
}

/* 总结评价模块 */
.summary-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.summary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.coach-evaluation h4,
.member-feedback h4 {
  margin: 0 0 20px 0;
  color: #303133;
  font-size: 16px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e4e7ed;
}

.evaluation-items,
.feedback-items {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.evaluation-item,
.feedback-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.evaluation-label,
.feedback-label {
  font-size: 14px;
  color: #606266;
  font-weight: bold;
}

/* 签字模块 */
.signature-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.signature-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
}

.signature-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.signature-label {
  font-size: 14px;
  color: #606266;
  font-weight: bold;
}



/* 保存按钮 */
.save-section {
  text-align: center;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

/* 模板选择对话框 */
.template-list {
  max-height: 400px;
  overflow-y: auto;
}

.template-item {
  padding: 15px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  margin-bottom: 10px;
  cursor: pointer;
  transition: all 0.3s;
}

.template-item:hover {
  border-color: #409eff;
  background: #f0f9ff;
}

.template-item h4 {
  margin: 0 0 8px 0;
  color: #303133;
}

.template-item p {
  margin: 0 0 10px 0;
  color: #606266;
  font-size: 14px;
}

.template-meta {
  display: flex;
  gap: 15px;
  font-size: 12px;
  color: #909399;
}

/* 响应式设计 - 平板适配 */
@media (max-width: 1024px) {
  .member-info-grid,
  .pre-training-grid,
  .summary-grid,
  .signature-grid {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .member-basic-info {
    flex-direction: column;
    text-align: center;
  }
  
  .timer-time {
    font-size: 36px;
  }
  
  .time-data-container {
    flex-direction: column;
    gap: 15px;
  }
  
  .time-card {
    min-width: auto;
  }
  
  .timer-controls {
    flex-wrap: wrap;
  }
}

@media (max-width: 768px) {
  .main-content {
    padding: 15px;
  }
  
  .section-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
  
  .phase-header {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
  
  .exercise-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .exercise-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .set-item {
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .set-item .el-input-number {
    width: 80px !important;
  }
}

/* 动画效果 */
@keyframes timerAlert {
  0%, 100% { border-color: #FF6B35; }
  50% { border-color: #FFD700; box-shadow: 0 0 20px #FFD700; }
}

.timer-container.alert {
  animation: timerAlert 0.5s ease-in-out infinite;
}

@keyframes numberPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.timer-time.pulse {
  animation: numberPulse 0.3s ease-in-out;
}
</style> 