<template>
  <div class="edit-template">
    <el-form 
      ref="formRef" 
      :model="templateForm" 
      :rules="formRules" 
      label-width="120px"
      class="template-form"
    >
      <!-- 基本信息 -->
      <div class="form-section">
        <h4>基本信息</h4>
        
        <el-form-item label="模板名称" prop="name">
          <el-input 
            v-model="templateForm.name" 
            placeholder="请输入模板名称"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="模板分类" prop="category">
          <el-select 
            v-model="templateForm.category" 
            placeholder="选择模板分类"
            style="width: 100%"
          >
            <el-option
              v-for="category in categories"
              :key="category.value"
              :label="category.label"
              :value="category.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="功能说明" prop="description">
          <el-input 
            v-model="templateForm.description" 
            type="textarea" 
            :rows="3"
            placeholder="请详细描述模板的功能、适用人群等..."
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="禁忌条件" prop="restrictions">
          <el-input 
            v-model="templateForm.restrictions" 
            type="textarea" 
            :rows="2"
            placeholder="请说明使用此模板的禁忌条件..."
            maxlength="300"
            show-word-limit
          />
        </el-form-item>
      </div>

      <!-- 训练内容 -->
      <div class="form-section">
        <h4>训练内容</h4>
        
        <el-tabs v-model="activePhase" class="training-tabs">
          <el-tab-pane label="热身激活" name="warmup">
            <div class="phase-content">
              <div class="phase-header">
                <span class="phase-title">热身激活 (1-6个动作)</span>
                <el-button type="primary" size="small" @click="addExercise('warmup')">
                  <el-icon><Plus /></el-icon>
                  添加动作
                </el-button>
              </div>
              
              <div class="exercises-list">
                <div 
                  v-for="(exercise, index) in templateForm.warmup" 
                  :key="index"
                  class="exercise-item"
                >
                  <div class="exercise-header">
                    <el-input 
                      v-model="exercise.name" 
                      placeholder="动作名称"
                      style="width: 200px"
                    />
                    <div class="exercise-variables">
                      <el-select 
                        v-model="exercise.variable1" 
                        placeholder="变量1"
                        size="small"
                        style="width: 100px"
                      >
                        <el-option label="重量" value="weight" />
                        <el-option label="强度" value="intensity" />
                        <el-option label="难度" value="difficulty" />
                      </el-select>
                      <span class="variable-separator">×</span>
                      <el-select 
                        v-model="exercise.variable2" 
                        placeholder="变量2"
                        size="small"
                        style="width: 100px"
                      >
                        <el-option label="次数" value="reps" />
                        <el-option label="时长" value="duration" />
                      </el-select>
                    </div>
                    <el-button 
                      type="danger" 
                      size="small" 
                      @click="removeExercise('warmup', index)"
                      :icon="Delete"
                    />
                  </div>
                  
                  <div class="exercise-params">
                    <el-form-item label="动作说明">
                      <el-input 
                        v-model="exercise.description" 
                        type="textarea" 
                        :rows="2"
                        placeholder="请输入动作的详细说明..."
                        maxlength="200"
                        show-word-limit
                      />
                    </el-form-item>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="主体训练" name="main">
            <div class="phase-content">
              <div class="phase-header">
                <span class="phase-title">主体训练 (3-8个动作)</span>
                <el-button type="primary" size="small" @click="addExercise('main')">
                  <el-icon><Plus /></el-icon>
                  添加动作
                </el-button>
              </div>
              
              <div class="exercises-list">
                <div 
                  v-for="(exercise, index) in templateForm.main" 
                  :key="index"
                  class="exercise-item"
                >
                  <div class="exercise-header">
                    <el-input 
                      v-model="exercise.name" 
                      placeholder="动作名称"
                      style="width: 200px"
                    />
                    <div class="exercise-variables">
                      <el-select 
                        v-model="exercise.variable1" 
                        placeholder="变量1"
                        size="small"
                        style="width: 100px"
                      >
                        <el-option label="重量" value="weight" />
                        <el-option label="强度" value="intensity" />
                        <el-option label="难度" value="difficulty" />
                      </el-select>
                      <span class="variable-separator">×</span>
                      <el-select 
                        v-model="exercise.variable2" 
                        placeholder="变量2"
                        size="small"
                        style="width: 100px"
                      >
                        <el-option label="次数" value="reps" />
                        <el-option label="时长" value="duration" />
                      </el-select>
                    </div>
                    <el-button 
                      type="danger" 
                      size="small" 
                      @click="removeExercise('main', index)"
                      :icon="Delete"
                    />
                  </div>
                  
                  <div class="exercise-params">
                    <el-form-item label="动作说明">
                      <el-input 
                        v-model="exercise.description" 
                        type="textarea" 
                        :rows="2"
                        placeholder="请输入动作的详细说明..."
                        maxlength="200"
                        show-word-limit
                      />
                    </el-form-item>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>
          
          <el-tab-pane label="拉伸松解" name="stretch">
            <div class="phase-content">
              <div class="phase-header">
                <span class="phase-title">拉伸松解 (2-4个动作)</span>
                <el-button type="primary" size="small" @click="addExercise('stretch')">
                  <el-icon><Plus /></el-icon>
                  添加动作
                </el-button>
              </div>
              
              <div class="exercises-list">
                <div 
                  v-for="(exercise, index) in templateForm.stretch" 
                  :key="index"
                  class="exercise-item"
                >
                  <div class="exercise-header">
                    <el-input 
                      v-model="exercise.name" 
                      placeholder="动作名称"
                      style="width: 200px"
                    />
                    <div class="exercise-variables">
                      <el-select 
                        v-model="exercise.variable1" 
                        placeholder="变量1"
                        size="small"
                        style="width: 100px"
                      >
                        <el-option label="重量" value="weight" />
                        <el-option label="强度" value="intensity" />
                        <el-option label="难度" value="difficulty" />
                      </el-select>
                      <span class="variable-separator">×</span>
                      <el-select 
                        v-model="exercise.variable2" 
                        placeholder="变量2"
                        size="small"
                        style="width: 100px"
                      >
                        <el-option label="次数" value="reps" />
                        <el-option label="时长" value="duration" />
                      </el-select>
                    </div>
                    <el-button 
                      type="danger" 
                      size="small" 
                      @click="removeExercise('stretch', index)"
                      :icon="Delete"
                    />
                  </div>
                  
                  <div class="exercise-params">
                    <el-form-item label="动作说明">
                      <el-input 
                        v-model="exercise.description" 
                        type="textarea" 
                        :rows="2"
                        placeholder="请输入动作的详细说明..."
                        maxlength="200"
                        show-word-limit
                      />
                    </el-form-item>
                  </div>
                </div>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>

      <!-- 专业指导 -->
      <div class="form-section">
        <h4>专业指导</h4>
        
        <el-form-item label="执行要点" prop="executionPoints">
          <el-input 
            v-model="templateForm.executionPoints" 
            type="textarea" 
            :rows="3"
            placeholder="请详细说明每个动作的执行要点、技术要领..."
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="常见错误" prop="commonMistakes">
          <el-input 
            v-model="templateForm.commonMistakes" 
            type="textarea" 
            :rows="3"
            placeholder="请说明训练中常见的错误动作和注意事项..."
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="安全提醒" prop="safetyReminders">
          <el-input 
            v-model="templateForm.safetyReminders" 
            type="textarea" 
            :rows="2"
            placeholder="请说明训练中的安全注意事项..."
            maxlength="300"
            show-word-limit
          />
        </el-form-item>
        
        <el-form-item label="预期效果" prop="expectedResults">
          <el-input 
            v-model="templateForm.expectedResults" 
            type="textarea" 
            :rows="2"
            placeholder="请说明使用此模板的预期训练效果..."
            maxlength="300"
            show-word-limit
          />
        </el-form-item>
      </div>

      <!-- 操作按钮 -->
      <div class="form-actions">
        <el-button @click="$emit('cancel')">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          保存修改
        </el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { http } from '@/utils/http'

interface Exercise {
  name: string
  description: string
  variable1: 'weight' | 'intensity' | 'difficulty'
  variable2: 'reps' | 'duration'
}

interface TemplateForm {
  id: number
  name: string
  category: string
  description: string
  restrictions: string
  warmup: Exercise[]
  main: Exercise[]
  stretch: Exercise[]
  executionPoints: string
  commonMistakes: string
  safetyReminders: string
  expectedResults: string
}

interface Props {
  template: any
}

interface Emits {
  (e: 'updated', template: any): void
  (e: 'cancel'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const formRef = ref()
const activePhase = ref('warmup')
const submitting = ref(false)

const categories = [
  { label: '力量抗阻', value: 'strength' },
  { label: '综合体能', value: 'comprehensive' },
  { label: '功能性', value: 'functional' }
]

const templateForm = reactive<TemplateForm>({
  id: 0,
  name: '',
  category: '',
  description: '',
  restrictions: '',
  warmup: [],
  main: [],
  stretch: [],
  executionPoints: '',
  commonMistakes: '',
  safetyReminders: '',
  expectedResults: ''
})

// 初始化表单数据
const initTemplateForm = () => {
  if (props.template) {
    // 清空现有数据
    Object.assign(templateForm, {
      id: 0,
      name: '',
      category: '',
      description: '',
      restrictions: '',
      warmup: [],
      main: [],
      stretch: [],
      executionPoints: '',
      commonMistakes: '',
      safetyReminders: '',
      expectedResults: ''
    })
    
    // 加载新模板数据
    Object.assign(templateForm, props.template)
  }
}

// 监听模板变化
watch(() => props.template, () => {
  initTemplateForm()
}, { deep: true })

const formRules = {
  name: [
    { required: true, message: '请输入模板名称', trigger: 'blur' },
    { min: 2, max: 100, message: '模板名称长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择模板分类', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请输入功能说明', trigger: 'blur' },
    { min: 10, max: 500, message: '功能说明长度在 10 到 500 个字符', trigger: 'blur' }
  ]
}

const createDefaultExercise = (phase: string): Exercise => {
  return {
    name: '',
    description: '',
    variable1: 'weight',
    variable2: 'reps'
  }
}

const addExercise = (phase: string) => {
  const exercise = createDefaultExercise(phase)
  templateForm[phase as keyof TemplateForm].push(exercise)
}

const removeExercise = (phase: string, index: number) => {
  templateForm[phase as keyof TemplateForm].splice(index, 1)
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    
    // 验证训练内容
    if (templateForm.warmup.length === 0 && 
        templateForm.main.length === 0 && 
        templateForm.stretch.length === 0) {
      ElMessage.error('请至少添加一个训练动作')
      return
    }
    
    submitting.value = true
    
    // 构建模板数据
    const templateData = {
      name: templateForm.name,
      category: templateForm.category,
      description: templateForm.description,
      restrictions: templateForm.restrictions,
      template_content: JSON.stringify({
        warmup: templateForm.warmup,
        main: templateForm.main,
        stretch: templateForm.stretch
      })
    }
    
    // 调用后端API更新模板
    const response = await http.put(`/api/templates/${templateForm.id}`, templateData)
    
    if (response.ok) {
      const result = await response.json()
      ElMessage.success('模板更新成功')
      emit('updated', { ...templateForm, ...result.data })
    } else {
      const errorData = await response.json()
      ElMessage.error(errorData.message || '更新模板失败')
    }
    
  } catch (error) {
    console.error('更新模板失败:', error)
    ElMessage.error('更新模板失败')
  } finally {
    submitting.value = false
  }
}

// 初始化表单数据
onMounted(() => {
  initTemplateForm()
})
</script>

<style scoped>
.edit-template {
  max-height: 80vh;
  overflow-y: auto;
}

.template-form {
  margin-bottom: 24px;
}

.form-section {
  margin-bottom: 32px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e5e5e5;
}

.form-section h4 {
  margin: 0 0 20px 0;
  color: #2E4057;
  font-size: 16px;
}

.training-tabs {
  margin-top: 16px;
}

.phase-content {
  padding: 16px 0;
}

.phase-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e5e5;
}

.phase-title {
  font-weight: 500;
  color: #2E4057;
}

.exercises-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.exercise-item {
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e5e5e5;
}

.exercise-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.exercise-variables {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 16px;
}

.variable-separator {
  color: #606266;
  font-size: 14px;
}

.exercise-params {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.exercise-params .el-form-item {
  margin-bottom: 0;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid #e5e5e5;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .exercise-params {
    grid-template-columns: 1fr;
  }
  
  .phase-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .exercise-header {
    flex-direction: column;
    gap: 12px;
  }
}
</style> 