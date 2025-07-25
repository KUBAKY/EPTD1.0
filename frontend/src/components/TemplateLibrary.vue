<template>
  <div class="template-library">
    <div class="library-header">
      <div class="search-section">
        <el-input 
          v-model="searchKeyword" 
          placeholder="搜索模板名称"
          prefix-icon="Search"
          clearable
          style="width: 300px"
        />
        <el-select 
          v-model="selectedCategory" 
          placeholder="选择分类"
          clearable
          style="width: 200px"
        >
          <el-option
            v-for="category in categories"
            :key="category.value"
            :label="category.label"
            :value="category.value"
          />
        </el-select>
      </div>
      <el-button type="primary" @click="createTemplate">
        <el-icon><Plus /></el-icon>
        创建模板
      </el-button>
    </div>

    <div class="templates-grid">
      <div 
        v-for="item in filteredTemplates" 
        :key="item.id"
        class="template-card"
        @click="selectTemplate(item)"
      >
        <div class="template-header">
          <div class="template-category">
            <el-tag :type="getCategoryType(item.category)" size="small">
              {{ getCategoryLabel(item.category) }}
            </el-tag>
          </div>
          <div class="template-actions">
            <el-button 
              type="text" 
              size="small" 
              @click.stop="handlePreviewTemplate(item)"
            >
              <el-icon><View /></el-icon>
            </el-button>
            <el-button 
              type="text" 
              size="small" 
              @click.stop="editTemplate(item)"
            >
              <el-icon><Edit /></el-icon>
            </el-button>
          </div>
        </div>

        <div class="template-content">
          <h4 class="template-name">{{ item.name }}</h4>
          <p class="template-description">{{ item.description }}</p>
          
          <div class="template-stats">
            <div class="stat-item">
              <span class="stat-label">动作数</span>
              <span class="stat-value">{{ item.exerciseCount }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">使用次数</span>
              <span class="stat-value">{{ item.useCount }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">创建者</span>
              <span class="stat-value">{{ item.creator }}</span>
            </div>
          </div>

          <div class="template-exercises">
            <div class="exercises-preview">
              <span class="preview-label">动作预览:</span>
              <div class="exercise-tags">
                <el-tag 
                  v-for="exercise in item.exercises.slice(0, 3)" 
                  :key="exercise"
                  size="small"
                  class="exercise-tag"
                >
                  {{ exercise }}
                </el-tag>
                <el-tag 
                  v-if="item.exercises.length > 3" 
                  size="small"
                  type="info"
                >
                  +{{ item.exercises.length - 3 }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>

        <div class="template-footer">
          <el-button 
            type="primary" 
            size="small" 
            @click.stop="selectTemplate(item)"
          >
            使用模板
          </el-button>
        </div>
      </div>
    </div>

    <div v-if="filteredTemplates.length === 0" class="empty-state">
      <el-empty description="暂无训练模板">
        <el-button type="primary" @click="createTemplate">创建第一个模板</el-button>
      </el-empty>
    </div>

    <!-- 模板预览对话框 -->
    <el-dialog 
      v-model="showPreviewDialog" 
      title="模板预览" 
      width="60%"
      class="template-preview-dialog"
    >
      <div v-if="previewTemplate" class="template-preview">
        <div class="preview-header">
          <h3>{{ previewTemplate.name }}</h3>
          <el-tag :type="getCategoryType(previewTemplate.category)">
            {{ getCategoryLabel(previewTemplate.category) }}
          </el-tag>
        </div>
        
        <div class="preview-description">
          <p>{{ previewTemplate.description }}</p>
        </div>

        <div class="preview-sections">
          <div class="preview-section">
            <h4>热身激活</h4>
            <div class="exercise-list">
              <div 
                v-for="exercise in previewTemplate.warmup" 
                :key="exercise.name"
                class="exercise-item"
              >
                <span class="exercise-name">{{ exercise.name }}</span>
                <span class="exercise-sets">{{ exercise.sets }}组</span>
              </div>
            </div>
          </div>

          <div class="preview-section">
            <h4>主体训练</h4>
            <div class="exercise-list">
              <div 
                v-for="exercise in previewTemplate.main" 
                :key="exercise.name"
                class="exercise-item"
              >
                <span class="exercise-name">{{ exercise.name }}</span>
                <span class="exercise-sets">{{ exercise.sets }}组</span>
              </div>
            </div>
          </div>

          <div class="preview-section">
            <h4>拉伸松解</h4>
            <div class="exercise-list">
              <div 
                v-for="exercise in previewTemplate.stretch" 
                :key="exercise.name"
                class="exercise-item"
              >
                <span class="exercise-name">{{ exercise.name }}</span>
                <span class="exercise-sets">{{ exercise.sets }}组</span>
              </div>
            </div>
          </div>
        </div>

        <div class="preview-footer">
          <el-button @click="showPreviewDialog = false">关闭</el-button>
          <el-button type="primary" @click="usePreviewTemplate">使用此模板</el-button>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Search, Plus, View, Edit } from '@element-plus/icons-vue'

interface Exercise {
  name: string
  sets: number
  weight: number
  reps: number
  rest: number
}

interface Template {
  id: number
  name: string
  category: string
  description: string
  creator: string
  exerciseCount: number
  useCount: number
  exercises: string[]
  warmup: Exercise[]
  main: Exercise[]
  stretch: Exercise[]
}

interface Emits {
  (e: 'select', template: Template): void
}

const emit = defineEmits<Emits>()

const searchKeyword = ref('')
const selectedCategory = ref('')
const showPreviewDialog = ref(false)
const selectedTemplate = ref<Template | null>(null)

const categories = [
  { label: '力量抗阻', value: 'strength' },
  { label: '综合体能', value: 'comprehensive' },
  { label: '功能性', value: 'functional' }
]

const templates = ref<Template[]>([
  {
    id: 1,
    name: '上肢力量训练',
    category: 'strength',
    description: '专注于胸、肩、臂部肌肉的力量训练计划',
    creator: '李教练',
    exerciseCount: 8,
    useCount: 15,
    exercises: ['卧推', '哑铃飞鸟', '肩推', '侧平举', '弯举', '臂屈伸'],
    warmup: [
      { name: '肩部环绕', sets: 2, weight: 0, reps: 10, rest: 30 },
      { name: '手臂摆动', sets: 2, weight: 0, reps: 15, rest: 30 }
    ],
    main: [
      { name: '卧推', sets: 4, weight: 60, reps: 12, rest: 90 },
      { name: '哑铃飞鸟', sets: 3, weight: 15, reps: 15, rest: 60 },
      { name: '肩推', sets: 3, weight: 40, reps: 10, rest: 90 }
    ],
    stretch: [
      { name: '胸部拉伸', sets: 2, weight: 0, reps: 30, rest: 0 },
      { name: '肩部拉伸', sets: 2, weight: 0, reps: 30, rest: 0 }
    ]
  },
  {
    id: 2,
    name: '下肢力量训练',
    category: 'strength',
    description: '强化腿部肌肉，提升下肢力量',
    creator: '王教练',
    exerciseCount: 6,
    useCount: 12,
    exercises: ['深蹲', '硬拉', '腿举', '腿弯举', '小腿提踵'],
    warmup: [
      { name: '腿部摆动', sets: 2, weight: 0, reps: 20, rest: 30 },
      { name: '膝关节活动', sets: 2, weight: 0, reps: 15, rest: 30 }
    ],
    main: [
      { name: '深蹲', sets: 4, weight: 80, reps: 10, rest: 120 },
      { name: '硬拉', sets: 3, weight: 100, reps: 8, rest: 120 },
      { name: '腿举', sets: 3, weight: 120, reps: 12, rest: 90 }
    ],
    stretch: [
      { name: '大腿前侧拉伸', sets: 2, weight: 0, reps: 30, rest: 0 },
      { name: '大腿后侧拉伸', sets: 2, weight: 0, reps: 30, rest: 0 }
    ]
  },
  {
    id: 3,
    name: '核心力量训练',
    category: 'strength',
    description: '强化腹部和核心肌群，提升身体稳定性',
    creator: '张教练',
    exerciseCount: 5,
    useCount: 8,
    exercises: ['平板支撑', '卷腹', '俄罗斯转体', '死虫式'],
    warmup: [
      { name: '猫牛式', sets: 2, weight: 0, reps: 10, rest: 30 },
      { name: '骨盆倾斜', sets: 2, weight: 0, reps: 15, rest: 30 }
    ],
    main: [
      { name: '平板支撑', sets: 3, weight: 0, reps: 60, rest: 60 },
      { name: '卷腹', sets: 3, weight: 0, reps: 20, rest: 60 },
      { name: '俄罗斯转体', sets: 3, weight: 0, reps: 30, rest: 60 }
    ],
    stretch: [
      { name: '腹部拉伸', sets: 2, weight: 0, reps: 30, rest: 0 },
      { name: '腰部扭转', sets: 2, weight: 0, reps: 20, rest: 0 }
    ]
  },
  {
    id: 4,
    name: '全身综合训练',
    category: 'comprehensive',
    description: '全身性综合训练，提升整体体能',
    creator: '刘教练',
    exerciseCount: 10,
    useCount: 20,
    exercises: ['深蹲', '俯卧撑', '引体向上', '划船', '硬拉'],
    warmup: [
      { name: '全身热身', sets: 2, weight: 0, reps: 10, rest: 30 },
      { name: '动态拉伸', sets: 2, weight: 0, reps: 15, rest: 30 }
    ],
    main: [
      { name: '深蹲', sets: 3, weight: 60, reps: 12, rest: 90 },
      { name: '俯卧撑', sets: 3, weight: 0, reps: 15, rest: 60 },
      { name: '引体向上', sets: 3, weight: 0, reps: 8, rest: 90 }
    ],
    stretch: [
      { name: '全身拉伸', sets: 2, weight: 0, reps: 30, rest: 0 },
      { name: '放松按摩', sets: 1, weight: 0, reps: 60, rest: 0 }
    ]
  }
])

const filteredTemplates = computed(() => {
  let filtered = templates.value

  if (searchKeyword.value) {
    filtered = filtered.filter(template => 
      template.name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      template.description.toLowerCase().includes(searchKeyword.value.toLowerCase())
    )
  }

  if (selectedCategory.value) {
    filtered = filtered.filter(template => template.category === selectedCategory.value)
  }

  return filtered
})

const getCategoryType = (category: string) => {
  const types = {
    strength: 'danger',
    comprehensive: 'warning',
    functional: 'success'
  }
  return types[category as keyof typeof types] || 'info'
}

const getCategoryLabel = (category: string) => {
  const labels = {
    strength: '力量抗阻',
    comprehensive: '综合体能',
    functional: '功能性'
  }
  return labels[category as keyof typeof labels] || category
}

const selectTemplate = (template: Template) => {
  emit('select', template)
}

const handlePreviewTemplate = (template: Template) => {
  previewTemplate.value = template
  showPreviewDialog.value = true
}

const editTemplate = (template: Template) => {
  // 编辑模板功能
  console.log('编辑模板:', template)
}

const createTemplate = () => {
  // 创建模板功能
  console.log('创建模板')
}

const usePreviewTemplate = () => {
  if (previewTemplate.value) {
    selectTemplate(previewTemplate.value)
    showPreviewDialog.value = false
  }
}
</script>

<style scoped>
.template-library {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.library-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e5e5;
}

.search-section {
  display: flex;
  gap: 16px;
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  flex: 1;
  overflow-y: auto;
  padding-right: 8px;
}

.template-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e5e5e5;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.template-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.template-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.template-actions {
  display: flex;
  gap: 8px;
}

.template-content {
  margin-bottom: 16px;
}

.template-name {
  margin: 0 0 8px 0;
  color: #2E4057;
  font-size: 18px;
}

.template-description {
  margin: 0 0 16px 0;
  color: #6c757d;
  font-size: 14px;
  line-height: 1.5;
}

.template-stats {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-label {
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 4px;
}

.stat-value {
  font-size: 16px;
  font-weight: bold;
  color: #FF6B35;
}

.template-exercises {
  margin-bottom: 16px;
}

.exercises-preview {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.preview-label {
  font-size: 12px;
  color: #6c757d;
  font-weight: 500;
}

.exercise-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.exercise-tag {
  font-size: 11px;
}

.template-footer {
  display: flex;
  justify-content: flex-end;
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 模板预览对话框 */
.template-preview-dialog {
  max-height: 80vh;
  overflow-y: auto;
}

.template-preview {
  padding: 20px 0;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e5e5;
}

.preview-header h3 {
  margin: 0;
  color: #2E4057;
}

.preview-description {
  margin-bottom: 24px;
}

.preview-description p {
  margin: 0;
  color: #6c757d;
  line-height: 1.6;
}

.preview-sections {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 24px;
}

.preview-section h4 {
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e5e5e5;
}

.exercise-name {
  font-size: 14px;
  color: #2E4057;
}

.exercise-sets {
  font-size: 12px;
  color: #6c757d;
  background: #FF6B35;
  color: #fff;
  padding: 2px 8px;
  border-radius: 12px;
}

.preview-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid #e5e5e5;
}

/* 滚动条样式 */
.templates-grid::-webkit-scrollbar {
  width: 6px;
}

.templates-grid::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.templates-grid::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.templates-grid::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .library-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .search-section {
    flex-direction: column;
  }
  
  .templates-grid {
    grid-template-columns: 1fr;
  }
  
  .template-stats {
    flex-direction: column;
    gap: 8px;
  }
}
</style> 