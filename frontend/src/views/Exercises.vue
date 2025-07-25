<template>
  <Layout>
    <div class="exercises-page">
    <div class="page-header">
      <h1>训练动作管理</h1>
      <el-button type="primary" @click="showAddDialog">
        <el-icon><Plus /></el-icon>
        添加动作
      </el-button>
    </div>

    <!-- 搜索和筛选 -->
    <div class="search-section">
      <el-input
        v-model="searchQuery"
        placeholder="搜索动作名称..."
        style="width: 300px"
        clearable
        @input="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      
      <el-select v-model="filterCategory" placeholder="筛选类别" style="width: 150px" @change="handleFilter">
        <el-option label="全部" value="" />
        <el-option label="力量训练" value="strength" />
        <el-option label="有氧训练" value="cardio" />
        <el-option label="柔韧性" value="flexibility" />
        <el-option label="平衡训练" value="balance" />
      </el-select>
    </div>

    <!-- 动作列表 -->
    <div class="exercises-grid">
      <el-card
        v-for="exercise in filteredExercises"
        :key="exercise.id"
        class="exercise-card"
        shadow="hover"
      >
        <div class="exercise-header">
          <h3>{{ exercise.name }}</h3>
          <div class="exercise-actions">
            <el-button
              type="primary"
              size="small"
              @click="editExercise(exercise)"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              size="small"
              @click="deleteExercise(exercise.id)"
            >
              删除
            </el-button>
          </div>
        </div>
        
        <div class="exercise-info">
          <el-tag :type="getCategoryType(exercise.category)" size="small">
            {{ getCategoryLabel(exercise.category) }}
          </el-tag>
          
          <div class="exercise-variables">
            <span class="variable-label">变量：</span>
            <el-tag size="small" type="info">{{ exercise.variable1 }}</el-tag>
            <span class="separator">×</span>
            <el-tag size="small" type="info">{{ exercise.variable2 }}</el-tag>
          </div>
        </div>
        
        <div class="exercise-description" v-if="exercise.description">
          <p>{{ exercise.description }}</p>
        </div>
      </el-card>
    </div>

    <!-- 空状态 -->
    <el-empty
      v-if="filteredExercises.length === 0"
      description="暂无训练动作"
    >
      <el-button type="primary" @click="showAddDialog">添加第一个动作</el-button>
    </el-empty>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEditing ? '编辑动作' : '添加动作'"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="exerciseForm"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="动作名称" prop="name">
          <el-input
            v-model="exerciseForm.name"
            placeholder="请输入动作名称"
          />
        </el-form-item>
        
        <el-form-item label="类别" prop="category">
          <el-select v-model="exerciseForm.category" placeholder="选择类别" style="width: 100%">
            <el-option label="力量训练" value="strength" />
            <el-option label="有氧训练" value="cardio" />
            <el-option label="柔韧性" value="flexibility" />
            <el-option label="平衡训练" value="balance" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="变量标签">
          <div class="variable-selection">
            <el-select
              v-model="exerciseForm.variable1"
              placeholder="变量1"
              style="width: 120px"
            >
              <el-option label="重量" value="weight" />
              <el-option label="强度" value="intensity" />
              <el-option label="难度" value="difficulty" />
            </el-select>
            
            <span class="variable-separator">×</span>
            
            <el-select
              v-model="exerciseForm.variable2"
              placeholder="变量2"
              style="width: 120px"
            >
              <el-option label="次数" value="reps" />
              <el-option label="时长" value="duration" />
            </el-select>
          </div>
        </el-form-item>
        
        <el-form-item label="描述">
          <el-input
            v-model="exerciseForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入动作描述（可选）"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            {{ isEditing ? '更新' : '添加' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import Layout from '@/components/Layout.vue'

interface Exercise {
  id: string
  name: string
  category: 'strength' | 'cardio' | 'flexibility' | 'balance'
  variable1: 'weight' | 'intensity' | 'difficulty'
  variable2: 'reps' | 'duration'
  description?: string
  createdAt: string
}

const searchQuery = ref('')
const filterCategory = ref('')
const dialogVisible = ref(false)
const isEditing = ref(false)
const submitting = ref(false)
const formRef = ref()

// 模拟数据
const exercises = ref<Exercise[]>([
  {
    id: '1',
    name: '深蹲',
    category: 'strength',
    variable1: 'weight',
    variable2: 'reps',
    description: '经典的下肢力量训练动作',
    createdAt: '2024-01-01'
  },
  {
    id: '2',
    name: '俯卧撑',
    category: 'strength',
    variable1: 'intensity',
    variable2: 'reps',
    description: '上肢推举力量训练',
    createdAt: '2024-01-02'
  },
  {
    id: '3',
    name: '跑步',
    category: 'cardio',
    variable1: 'intensity',
    variable2: 'duration',
    description: '有氧耐力训练',
    createdAt: '2024-01-03'
  }
])

const exerciseForm = reactive({
  id: '',
  name: '',
  category: 'strength' as Exercise['category'],
  variable1: 'weight' as Exercise['variable1'],
  variable2: 'reps' as Exercise['variable2'],
  description: ''
})

const formRules = {
  name: [
    { required: true, message: '请输入动作名称', trigger: 'blur' },
    { min: 2, max: 50, message: '动作名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择类别', trigger: 'change' }
  ]
}

// 计算属性
const filteredExercises = computed(() => {
  let filtered = exercises.value

  // 搜索过滤
  if (searchQuery.value) {
    filtered = filtered.filter(exercise =>
      exercise.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  // 类别过滤
  if (filterCategory.value) {
    filtered = filtered.filter(exercise =>
      exercise.category === filterCategory.value
    )
  }

  return filtered
})

// 方法
const showAddDialog = () => {
  isEditing.value = false
  resetForm()
  dialogVisible.value = true
}

const editExercise = (exercise: Exercise) => {
  isEditing.value = true
  Object.assign(exerciseForm, exercise)
  dialogVisible.value = true
}

const deleteExercise = async (id: string) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除这个动作吗？删除后无法恢复。',
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const index = exercises.value.findIndex(ex => ex.id === id)
    if (index > -1) {
      exercises.value.splice(index, 1)
      ElMessage.success('动作删除成功')
    }
  } catch {
    // 用户取消
  }
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    submitting.value = true

    if (isEditing.value) {
      // 更新动作
      const index = exercises.value.findIndex(ex => ex.id === exerciseForm.id)
      if (index > -1) {
        exercises.value[index] = { ...exerciseForm }
        ElMessage.success('动作更新成功')
      }
    } else {
      // 添加新动作
      const newExercise: Exercise = {
        ...exerciseForm,
        id: Date.now().toString(),
        createdAt: new Date().toISOString().split('T')[0]
      }
      exercises.value.push(newExercise)
      ElMessage.success('动作添加成功')
    }

    dialogVisible.value = false
    resetForm()
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    submitting.value = false
  }
}

const resetForm = () => {
  Object.assign(exerciseForm, {
    id: '',
    name: '',
    category: 'strength',
    variable1: 'weight',
    variable2: 'reps',
    description: ''
  })
}

const handleSearch = () => {
  // 搜索逻辑已在计算属性中处理
}

const handleFilter = () => {
  // 筛选逻辑已在计算属性中处理
}

const getCategoryType = (category: string) => {
  const types = {
    strength: 'danger',
    cardio: 'success',
    flexibility: 'warning',
    balance: 'info'
  }
  return types[category] || 'info'
}

const getCategoryLabel = (category: string) => {
  const labels = {
    strength: '力量训练',
    cardio: '有氧训练',
    flexibility: '柔韧性',
    balance: '平衡训练'
  }
  return labels[category] || category
}

onMounted(() => {
  // 可以在这里加载数据
})
</script>

<style scoped>
.exercises-page {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-header h1 {
  margin: 0;
  color: var(--text-color);
}

.search-section {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}

.exercises-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.exercise-card {
  transition: transform 0.2s;
}

.exercise-card:hover {
  transform: translateY(-2px);
}

.exercise-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.exercise-header h3 {
  margin: 0;
  color: var(--text-color);
  font-size: 16px;
  font-weight: 600;
}

.exercise-actions {
  display: flex;
  gap: 8px;
}

.exercise-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.exercise-variables {
  display: flex;
  align-items: center;
  gap: 8px;
}

.variable-label {
  font-size: 12px;
  color: #909399;
}

.separator {
  font-size: 12px;
  color: #909399;
}

.exercise-description {
  font-size: 14px;
  color: #606266;
  line-height: 1.5;
}

.variable-selection {
  display: flex;
  align-items: center;
  gap: 12px;
}

.variable-separator {
  font-size: 16px;
  font-weight: bold;
  color: #606266;
}

.dialog-footer {
  text-align: right;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .search-section {
    flex-direction: column;
  }
  
  .exercises-grid {
    grid-template-columns: 1fr;
  }
}
</style> 