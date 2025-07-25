<template>
  <el-dialog
    v-model="visible"
    title="选择训练计划模板"
    width="800px"
    :before-close="handleClose"
  >
    <!-- 搜索和筛选区域 -->
    <div class="search-section">
      <div class="search-row">
        <el-input
          v-model="searchKeyword"
          placeholder="搜索模板名称或功能说明"
          style="width: 250px"
          clearable
          @input="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        
        <el-select
          v-model="selectedCategory"
          placeholder="选择分类"
          style="width: 120px"
          clearable
          @change="handleSearch"
        >
          <el-option label="全部" value="" />
          <el-option label="力量抗阻" value="strength" />
          <el-option label="综合体能" value="comprehensive" />
          <el-option label="功能性" value="functional" />
        </el-select>
        
        <el-select
          v-model="selectedCreator"
          placeholder="选择创建人"
          style="width: 120px"
          clearable
          @change="handleSearch"
        >
          <el-option label="全部" value="" />
          <el-option 
            v-for="creator in creatorOptions" 
            :key="creator" 
            :label="creator" 
            :value="creator" 
          />
        </el-select>
        
        <el-button 
          v-if="hasActiveFilters"
          type="info" 
          size="small" 
          @click="clearAllFilters"
          class="clear-filters-btn"
        >
          清除筛选
        </el-button>
      </div>
    </div>

    <!-- 筛选统计信息 -->
    <div class="filter-stats">
      <span class="stats-text">
        共找到 {{ filteredTemplates.length }} 个模板
        <span v-if="searchKeyword || selectedCategory || selectedCreator" class="filter-info">
          (已筛选)
        </span>
      </span>
    </div>

    <!-- 模板列表 -->
    <div class="template-list">
      <div
        v-for="template in filteredTemplates"
        :key="template.id"
        class="template-card"
        @click="handleTemplateClick(template)"
      >
        <div class="template-header">
          <h4 class="template-name">{{ template.name }}</h4>
          <div class="template-meta">
            <el-tag size="small" :type="getCategoryType(template.category)">
              {{ getCategoryLabel(template.category) }}
            </el-tag>
            <span class="use-count">使用 {{ template.useCount || 0 }} 次</span>
          </div>
        </div>
        
        <div class="template-description">
          {{ template.description }}
        </div>
        
        <div class="template-exercises">
          <div class="exercise-preview">
            <span class="preview-label">动作预览:</span>
            <span class="preview-content">{{ getExercisePreview(template) }}</span>
          </div>
          <div class="exercise-count">
            共 {{ getTotalExerciseCount(template) }} 个动作
          </div>
        </div>
        
        <div class="template-footer">
          <div class="template-info">
            <span class="creator">创建者: {{ template.creator }}</span>
            <span class="created-date">{{ template.createdAt }}</span>
          </div>
          <el-button
            type="primary"
            size="small"
            @click.stop="handleUseTemplate(template)"
          >
            使用模板
          </el-button>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="filteredTemplates.length === 0" class="empty-state">
      <el-empty description="暂无匹配的训练模板">
        <el-button type="primary" @click="handleCreateTemplate">
          创建新模板
        </el-button>
      </el-empty>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleCreateTemplate">
          创建新模板
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

interface Template {
  id: number
  name: string
  category: string
  description: string
  creator: string
  createdAt: string
  useCount: number
  warmup: any[]
  main: any[]
  stretch: any[]
}

interface Props {
  modelValue: boolean
  templates: Template[]
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'use-template', template: Template): void
  (e: 'create-template'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const visible = ref(false)
const searchKeyword = ref('')
const selectedCategory = ref('')
const selectedCreator = ref('')

// 监听modelValue变化
watch(() => props.modelValue, (newValue) => {
  visible.value = newValue
  if (newValue) {
    // 重置搜索条件
    searchKeyword.value = ''
    selectedCategory.value = ''
    selectedCreator.value = ''
  }
})

// 监听visible变化
watch(visible, (newValue) => {
  emit('update:modelValue', newValue)
})

// 获取所有创建人选项
const creatorOptions = computed(() => {
  const creators = new Set<string>()
  props.templates.forEach(template => {
    if (template.creator) {
      creators.add(template.creator)
    }
  })
  return Array.from(creators).sort()
})

// 过滤后的模板列表
const filteredTemplates = computed(() => {
  let templates = props.templates

  // 按关键词搜索
  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase()
    templates = templates.filter(template => 
      template.name.toLowerCase().includes(keyword) ||
      template.description.toLowerCase().includes(keyword)
    )
  }

  // 按分类筛选
  if (selectedCategory.value) {
    templates = templates.filter(template => 
      template.category === selectedCategory.value
    )
  }

  // 按创建人筛选
  if (selectedCreator.value) {
    templates = templates.filter(template => 
      template.creator === selectedCreator.value
    )
  }

  return templates
})

// 检查是否有活跃的筛选条件
const hasActiveFilters = computed(() => {
  return searchKeyword.value || selectedCategory.value || selectedCreator.value
})

// 监听模板数据变化，更新统计信息
watch(() => props.templates, (newTemplates) => {
  console.log('模板数据更新:', newTemplates.length, '个模板')
}, { immediate: true })

const handleClose = () => {
  visible.value = false
}

const handleSearch = () => {
  // 搜索逻辑已在computed中处理
}

const clearAllFilters = () => {
  searchKeyword.value = ''
  selectedCategory.value = ''
  selectedCreator.value = ''
}

const handleTemplateClick = (template: Template) => {
  // 点击模板卡片，可以显示详情或直接使用
  console.log('点击模板:', template)
}

const handleUseTemplate = (template: Template) => {
  emit('use-template', template)
  visible.value = false
}

const handleCreateTemplate = () => {
  emit('create-template')
  visible.value = false
}

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

const getExercisePreview = (template: Template) => {
  const exercises = []
  
  // 添加热身动作
  if (template.warmup && template.warmup.length > 0) {
    exercises.push(...template.warmup.slice(0, 2).map((ex: any) => {
      const variable1Label = ex.variable1 === 'weight' ? '重量' : ex.variable1 === 'intensity' ? '强度' : '难度'
      const variable2Label = ex.variable2 === 'reps' ? '次数' : '时长'
      return `${ex.name}(${variable1Label}×${variable2Label})`
    }))
  }
  
  // 添加主要动作
  if (template.main && template.main.length > 0) {
    exercises.push(...template.main.slice(0, 2).map((ex: any) => {
      const variable1Label = ex.variable1 === 'weight' ? '重量' : ex.variable1 === 'intensity' ? '强度' : '难度'
      const variable2Label = ex.variable2 === 'reps' ? '次数' : '时长'
      return `${ex.name}(${variable1Label}×${variable2Label})`
    }))
  }
  
  // 添加拉伸动作
  if (template.stretch && template.stretch.length > 0) {
    exercises.push(...template.stretch.slice(0, 1).map((ex: any) => {
      const variable1Label = ex.variable1 === 'weight' ? '重量' : ex.variable1 === 'intensity' ? '强度' : '难度'
      const variable2Label = ex.variable2 === 'reps' ? '次数' : '时长'
      return `${ex.name}(${variable1Label}×${variable2Label})`
    }))
  }
  
  return exercises.slice(0, 3).join('、')
}

const getTotalExerciseCount = (template: Template) => {
  const warmupCount = template.warmup ? template.warmup.length : 0
  const mainCount = template.main ? template.main.length : 0
  const stretchCount = template.stretch ? template.stretch.length : 0
  
  return warmupCount + mainCount + stretchCount
}
</script>

<style scoped>
.search-section {
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.filter-stats {
  margin-bottom: 16px;
  padding: 8px 0;
  border-bottom: 1px solid #e5e5e5;
}

.stats-text {
  font-size: 14px;
  color: #606266;
}

.filter-info {
  color: #409eff;
  font-weight: 500;
}

.search-row {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.search-row .el-button {
  margin-left: auto;
}

@media (max-width: 768px) {
  .search-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-row .el-input,
  .search-row .el-select {
    width: 100% !important;
  }
  
  .search-row .el-button {
    margin-left: 0;
    margin-top: 8px;
  }
}

.template-list {
  max-height: 500px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.template-card {
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.template-card:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
}

.template-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.template-name {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #2E4057;
}

.template-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}

.use-count {
  font-size: 12px;
  color: #909399;
}

.template-description {
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 12px;
}

.template-exercises {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 8px 0;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
}

.exercise-preview {
  display: flex;
  align-items: center;
  gap: 8px;
}

.preview-label {
  font-size: 12px;
  color: #909399;
}

.preview-content {
  font-size: 12px;
  color: #606266;
}

.exercise-count {
  font-size: 12px;
  color: #909399;
}

.template-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.template-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.creator,
.created-date {
  font-size: 12px;
  color: #909399;
}

.empty-state {
  padding: 40px 0;
}

.dialog-footer {
  text-align: right;
}
</style> 