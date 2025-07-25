<template>
  <Layout>
  <div class="templates-page">
    <div class="page-header">
      <div class="header-left">
        <h2>训练模板库</h2>
        <p class="header-desc">管理和使用标准化的训练计划模板</p>
      </div>
      <div class="header-actions">
        <el-button type="primary" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon>
          创建模板
        </el-button>
      </div>
    </div>

    <!-- 统计信息 -->
    <div class="stats-section">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon">
                <el-icon size="24" color="#409EFF"><Document /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ templateStats.totalTemplates }}</div>
                <div class="stat-label">模板总数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon">
                <el-icon size="24" color="#67C23A"><TrendCharts /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ templateStats.totalUseCount }}</div>
                <div class="stat-label">总使用次数</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon">
                <el-icon size="24" color="#E6A23C"><Filter /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ templateStats.filteredCount }}</div>
                <div class="stat-label">筛选结果</div>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card class="stat-card">
            <div class="stat-content">
              <div class="stat-icon">
                <el-icon size="24" color="#F56C6C"><DataAnalysis /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ templateStats.filteredUseCount }}</div>
                <div class="stat-label">筛选使用次数</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 筛选和搜索 -->
    <div class="filter-section">
      <div class="filter-left">
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
        <el-select 
          v-model="selectedCreator" 
          placeholder="选择创建者"
          clearable
          style="width: 200px"
        >
          <el-option
            v-for="creator in creators"
            :key="creator"
            :label="creator"
            :value="creator"
          />
        </el-select>
      </div>
      <div class="filter-right">
        <div class="filter-status" v-if="hasActiveFilters">
          <el-tag type="info" size="small">
            筛选结果: {{ templateStats.filteredCount }} / {{ templateStats.totalTemplates }}
          </el-tag>
        </div>
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

    <!-- 模板列表 -->
    <div class="templates-content">
      <!-- 网格视图 -->
      <div v-if="viewMode === 'grid'" class="templates-grid">
        <div 
            v-for="item in filteredTemplates" 
            :key="item.id"
          class="template-card"
        >
          <div class="template-header">
            <div class="template-category">
                <el-tag :type="getCategoryType(item.category || '')" size="small">
                  {{ getCategoryLabel(item.category || '') }}
              </el-tag>
            </div>
            <div class="template-actions">
              <el-dropdown @command="handleTemplateAction">
                <el-button type="text" size="small">
                  <el-icon><MoreFilled /></el-icon>
                </el-button>
                  <template #dropdown="{ }">
                  <el-dropdown-menu>
                      <el-dropdown-item :command="{ action: 'preview', template: item }">
                      <el-icon><View /></el-icon>
                      预览
                    </el-dropdown-item>
                      <el-dropdown-item :command="{ action: 'edit', template: item }">
                      <el-icon><Edit /></el-icon>
                      编辑
                    </el-dropdown-item>
                      <el-dropdown-item :command="{ action: 'copy', template: item }">
                      <el-icon><CopyDocument /></el-icon>
                      复制
                    </el-dropdown-item>
                    <el-dropdown-item 
                        :command="{ action: 'delete', template: item }"
                      divided
                    >
                      <el-icon><Delete /></el-icon>
                      删除
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>

          <div class="template-content">
              <h4 class="template-name">{{ item.name || '未命名模板' }}</h4>
              <p class="template-description">{{ item.description || '暂无描述' }}</p>
            
            <div class="template-stats">
              <div class="stat-item">
                <span class="stat-label">动作数</span>
                  <span class="stat-value">{{ item.exerciseCount || 0 }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">使用次数</span>
                  <span class="stat-value">{{ item.useCount || 0 }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">创建者</span>
                  <span class="stat-value">{{ item.creator || '未知' }}</span>
              </div>
            </div>

            <div class="template-exercises">
              <div class="exercises-preview">
                <span class="preview-label">动作预览:</span>
                <div class="exercise-tags">
                  <el-tag 
                      v-for="exercise in getExercisePreview(item)" 
                    :key="exercise"
                    size="small"
                    class="exercise-tag"
                  >
                    {{ exercise }}
                  </el-tag>
                  <el-tag 
                      v-if="getTotalExerciseCount(item) > 3" 
                    size="small"
                    type="info"
                  >
                      +{{ getTotalExerciseCount(item) - 3 }}
                  </el-tag>
                </div>
              </div>
            </div>
          </div>

          <div class="template-footer">
            <el-button 
              type="primary" 
              size="small" 
                @click="useTemplate(item)"
            >
              使用模板
            </el-button>
            <el-button 
              type="success" 
              size="small" 
                @click="previewTemplate(item)"
            >
              预览
            </el-button>
          </div>
        </div>
      </div>

      <!-- 列表视图 -->
      <div v-else class="templates-list">
        <el-table :data="filteredTemplates" style="width: 100%">
          <el-table-column prop="name" label="模板名称" min-width="200">
            <template #default="{ row }">
              <div class="template-name-cell">
                <span class="template-name">{{ row.name }}</span>
                <el-tag :type="getCategoryType(row.category)" size="small">
                  {{ getCategoryLabel(row.category) }}
                </el-tag>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column prop="description" label="描述" min-width="300">
            <template #default="{ row }">
              <span class="template-description">{{ row.description }}</span>
            </template>
          </el-table-column>
          
          <el-table-column prop="exerciseCount" label="动作数" width="100" align="center" />
          
          <el-table-column prop="useCount" label="使用次数" width="100" align="center" />
          
          <el-table-column prop="creator" label="创建者" width="120" />
          
          <el-table-column prop="createdAt" label="创建时间" width="150">
            <template #default="{ row }">
              {{ formatDate(row.createdAt) }}
            </template>
          </el-table-column>
          
          <el-table-column label="操作" width="200" fixed="right">
            <template #default="{ row }">
              <el-button-group>
                <el-button size="small" @click="previewTemplate(row)">
                  预览
                </el-button>
                <el-button size="small" type="primary" @click="useTemplate(row)">
                  使用
                </el-button>
                <el-button size="small" @click="editTemplate(row)">
                  编辑
                </el-button>
                <el-button size="small" type="danger" @click="deleteTemplate(row)">
                  删除
                </el-button>
              </el-button-group>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 创建模板对话框 -->
    <el-dialog 
      v-model="showCreateDialog" 
      title="创建训练模板" 
      width="80%"
      class="create-template-dialog"
    >
      <CreateTemplate @created="handleTemplateCreated" />
    </el-dialog>

    <!-- 预览模板对话框 -->
    <el-dialog 
      v-model="showPreviewDialog" 
      title="模板预览" 
        width="70%"
      class="template-preview-dialog"
    >
        <div v-if="previewTemplateData" class="template-preview">
        <div class="preview-header">
            <div class="preview-title">
              <h3>{{ previewTemplateData.name }}</h3>
              <el-tag :type="getCategoryType(previewTemplateData.category)">
                {{ getCategoryLabel(previewTemplateData.category) }}
          </el-tag>
            </div>
            <div class="preview-meta">
              <span>创建者: {{ previewTemplateData.creator }}</span>
              <span>使用次数: {{ previewTemplateData.useCount }}</span>
              <span>动作数: {{ previewTemplateData.exerciseCount }}</span>
            </div>
        </div>
        
        <div class="preview-description">
            <p>{{ previewTemplateData.description }}</p>
        </div>

        <div class="preview-sections">
            <!-- 热身激活 -->
          <div class="preview-section">
            <h4>热身激活</h4>
            <div class="exercise-list">
              <div 
                  v-for="exercise in previewTemplateData.warmup" 
                :key="exercise.name"
                class="exercise-item"
              >
                  <div class="exercise-name">{{ exercise.name }}</div>
                  <div class="exercise-description" v-if="exercise.description">
                    {{ exercise.description }}
                  </div>
              </div>
            </div>
          </div>

            <!-- 主体训练 -->
          <div class="preview-section">
            <h4>主体训练</h4>
            <div class="exercise-list">
              <div 
                  v-for="exercise in previewTemplateData.main" 
                :key="exercise.name"
                class="exercise-item"
              >
                  <div class="exercise-name">{{ exercise.name }}</div>
                  <div class="exercise-description" v-if="exercise.description">
                    {{ exercise.description }}
                  </div>
              </div>
            </div>
          </div>

            <!-- 拉伸松解 -->
          <div class="preview-section">
            <h4>拉伸松解</h4>
            <div class="exercise-list">
              <div 
                  v-for="exercise in previewTemplateData.stretch" 
                :key="exercise.name"
                class="exercise-item"
              >
                  <div class="exercise-name">{{ exercise.name }}</div>
                  <div class="exercise-description" v-if="exercise.description">
                    {{ exercise.description }}
                  </div>
              </div>
            </div>
          </div>
        </div>

        <div class="preview-footer">
          <el-button @click="showPreviewDialog = false">关闭</el-button>
            <el-button type="primary" @click="useTemplate(previewTemplateData)">使用此模板</el-button>
        </div>
      </div>
    </el-dialog>

      <!-- 编辑模板对话框 -->
      <el-dialog 
        v-model="showEditDialog" 
        title="编辑训练模板" 
        width="80%"
        class="edit-template-dialog"
      >
        <EditTemplate 
          :template="currentTemplate" 
          @updated="handleTemplateUpdated"
        />
      </el-dialog>
  </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Plus, 
  Edit, 
  Delete, 
  View, 
  Search, 
  Filter,
  Document,
  TrendCharts,
  DataAnalysis,
  Grid,
  List,
  MoreFilled,
  CopyDocument
} from '@element-plus/icons-vue'
import Layout from '@/components/Layout.vue'
import CreateTemplate from '@/components/CreateTemplate.vue'
import EditTemplate from '@/components/EditTemplate.vue'
import { loadTemplates, getTemplates, refreshTemplates, type Template } from '@/services/templateService'

const router = useRouter()

// 响应式数据
const searchKeyword = ref('')
const selectedCategory = ref('')
const selectedCreator = ref('')
const viewMode = ref('grid')
const showCreateDialog = ref(false)
const showPreviewDialog = ref(false)
const showEditDialog = ref(false)
const currentTemplate = ref(null)
const previewTemplateData = ref(null)

// 模板数据
const templates = ref<Template[]>([])
const loading = ref(false)

// 加载模板数据
const loadTemplatesData = async () => {
  try {
    loading.value = true
    await loadTemplates()
    templates.value = getTemplates()
    console.log('Templates loaded:', templates.value.length, 'templates')
  } catch (error) {
    console.error('加载模板数据失败:', error)
    ElMessage.error('加载模板数据失败')
  } finally {
    loading.value = false
  }
}

// 刷新模板数据
const refreshTemplatesData = async () => {
  try {
    loading.value = true
    await refreshTemplates()
    templates.value = getTemplates()
    ElMessage.success('模板数据已刷新')
  } catch (error) {
    console.error('刷新模板数据失败:', error)
    ElMessage.error('刷新模板数据失败')
  } finally {
    loading.value = false
  }
}

// 初始化模板数据
onMounted(() => {
  loadTemplatesData()
})

// 分类和创建者选项
const categories = [
  { label: '力量抗阻', value: 'strength' },
  { label: '综合体能', value: 'comprehensive' },
  { label: '功能性', value: 'functional' }
]

const creators = ['管理员', '王教练', '张教练', '刘教练']

// 计算属性
const filteredTemplates = computed(() => {
  console.log('Computing filtered templates, templates.value:', templates.value)
  const filtered = templates.value.filter(template => {
    const matchKeyword = !searchKeyword.value || 
      template.name.toLowerCase().includes(searchKeyword.value.toLowerCase()) ||
      template.description.toLowerCase().includes(searchKeyword.value.toLowerCase())

    const matchCategory = !selectedCategory.value || 
      template.category === selectedCategory.value

    const matchCreator = !selectedCreator.value || 
      template.creator === selectedCreator.value

    return matchKeyword && matchCategory && matchCreator
  })
  console.log('Filtered templates result:', filtered)
  return filtered
})

// 统计数据计算
const templateStats = computed(() => {
  const totalTemplates = templates.value.length
  const totalUseCount = templates.value.reduce((sum, template) => sum + (template.useCount || 0), 0)
  const filteredCount = filteredTemplates.value.length
  const filteredUseCount = filteredTemplates.value.reduce((sum, template) => sum + (template.useCount || 0), 0)
  
  return {
    totalTemplates,
    totalUseCount,
    filteredCount,
    filteredUseCount
  }
})

// 是否有活跃的筛选条件
const hasActiveFilters = computed(() => {
  return searchKeyword.value || selectedCategory.value || selectedCreator.value
})

// 方法
const getCategoryType = (category: string) => {
  const types: Record<string, 'danger' | 'success' | 'warning' | 'info'> = {
    strength: 'danger',
    comprehensive: 'success',
    functional: 'warning'
  }
  return types[category] || 'info'
}

const getCategoryLabel = (category: string) => {
  const labels: Record<string, string> = {
    strength: '力量抗阻',
    comprehensive: '综合体能',
    functional: '功能性'
  }
  return labels[category] || category
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-CN')
}

// 模板操作
const handleTemplateAction = (command: any) => {
  console.log('Template action command:', command)
  const { action, template } = command
  
  if (!template) {
    console.error('Template is undefined in handleTemplateAction')
    return
  }
  
  switch (action) {
    case 'preview':
      previewTemplate(template)
      break
    case 'edit':
      editTemplate(template)
      break
    case 'copy':
      copyTemplate(template)
      break
    case 'delete':
      deleteTemplate(template)
      break
    default:
      console.warn('Unknown action:', action)
  }
}

const previewTemplate = (template: any) => {
  previewTemplateData.value = template
  showPreviewDialog.value = true
}

const editTemplate = (template: any) => {
  currentTemplate.value = { ...template }
  showEditDialog.value = true
}

const copyTemplate = async (template: any) => {
  try {
    const newTemplate = {
      ...template,
      id: Date.now(),
      name: `${template.name} (副本)`,
      useCount: 0,
      createdAt: new Date().toISOString().split('T')[0]
    }
    
    templates.value.push(newTemplate)
  ElMessage.success('模板复制成功')
  } catch (error) {
    ElMessage.error('模板复制失败')
  }
}

const deleteTemplate = async (template: any) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除模板"${template.name}"吗？此操作不可恢复。`,
    '确认删除',
    {
        confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'warning'
    }
    )
    
    const index = templates.value.findIndex(t => t.id === template.id)
    if (index > -1) {
      templates.value.splice(index, 1)
      ElMessage.success('模板删除成功')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const useTemplate = (template: any) => {
  // 跳转到训练页面，并传递模板数据
  router.push({
    path: '/training/new',
    query: { template_id: template.id }
  })
}

const handleTemplateCreated = async (template: any) => {
  showCreateDialog.value = false
  // 重新从后端加载模板数据
  await loadTemplatesData()
  ElMessage.success('模板创建成功！')
}

const handleTemplateUpdated = async (template: any) => {
  showEditDialog.value = false
  // 重新从后端加载模板数据
  await loadTemplatesData()
  ElMessage.success('模板更新成功！')
}

const getExercisePreview = (template: any) => {
  if (!template) {
    console.warn('Template is undefined in getExercisePreview')
    return []
  }
  
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
  
  return exercises.slice(0, 3)
}

const getTotalExerciseCount = (template: any) => {
  if (!template) {
    console.warn('Template is undefined in getTotalExerciseCount')
    return 0
  }
  
  const warmupCount = template.warmup ? template.warmup.length : 0
  const mainCount = template.main ? template.main.length : 0
  const stretchCount = template.stretch ? template.stretch.length : 0
  
  return warmupCount + mainCount + stretchCount
}
</script>

<style scoped>
.templates-page {
  padding: 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 统计卡片样式 */
.stats-section {
  margin-bottom: 24px;
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
  padding: 8px;
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: rgba(64, 158, 255, 0.1);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #2E4057;
  line-height: 1;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #666;
  line-height: 1;
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

.filter-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.filter-status {
  display: flex;
  align-items: center;
}

.templates-content {
  flex: 1;
  overflow: hidden;
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
  height: 100%;
  overflow-y: auto;
  padding-right: 8px;
}

.template-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e5e5e5;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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
  gap: 8px;
}

.templates-list {
  height: 100%;
  overflow-y: auto;
}

.template-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.template-name {
  font-weight: 500;
  color: #2E4057;
}

.template-description {
  color: #6c757d;
  font-size: 14px;
}

/* 滚动条样式 */
.templates-grid::-webkit-scrollbar,
.templates-list::-webkit-scrollbar {
  width: 6px;
}

.templates-grid::-webkit-scrollbar-track,
.templates-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.templates-grid::-webkit-scrollbar-thumb,
.templates-list::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.templates-grid::-webkit-scrollbar-thumb:hover,
.templates-list::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
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
  
  .templates-grid {
    grid-template-columns: 1fr;
  }
  
  .template-stats {
    flex-direction: column;
    gap: 8px;
  }
}

/* 模板预览对话框样式 */
.template-preview-dialog .el-dialog__body {
  padding: 0;
}

.template-preview {
  padding: 24px;
}

.preview-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e5e5;
}

.preview-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.preview-title h3 {
  margin: 0;
  color: #2E4057;
  font-size: 20px;
}

.preview-meta {
  display: flex;
  gap: 24px;
  color: #666;
  font-size: 14px;
}

.preview-description {
  margin-bottom: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #409EFF;
}

.preview-description p {
  margin: 0;
  color: #2E4057;
  line-height: 1.6;
}

.preview-sections {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.preview-section {
  background: #fff;
  border: 1px solid #e5e5e5;
  border-radius: 8px;
  padding: 20px;
}

.preview-section h4 {
  margin: 0 0 16px 0;
  color: #2E4057;
  font-size: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid #409EFF;
}

.exercise-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.exercise-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e5e5e5;
}

.exercise-name {
  font-weight: 500;
  color: #2E4057;
}

.exercise-description {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  padding: 8px 12px;
  background: #fff;
  border-radius: 4px;
  border-left: 3px solid #409EFF;
}

.preview-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e5e5e5;
}

/* 编辑模板对话框样式 */
.edit-template-dialog .el-dialog__body {
  padding: 0;
  max-height: 80vh;
  overflow-y: auto;
}
</style> 