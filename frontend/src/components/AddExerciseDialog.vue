<template>
  <el-dialog
    v-model="visible"
    title="添加动作"
    width="500px"
    :before-close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="动作名称" prop="name">
        <el-input
          v-model="form.name"
          placeholder="请输入动作名称"
          style="width: 100%"
        />
      </el-form-item>

      <el-form-item label="变量标签">
        <div class="variable-selection">
          <el-select
            v-model="form.variable1"
            placeholder="变量1"
            style="width: 120px"
          >
            <el-option label="重量" value="weight" />
            <el-option label="强度" value="intensity" />
            <el-option label="难度" value="difficulty" />
          </el-select>
          
          <span class="variable-separator">×</span>
          
          <el-select
            v-model="form.variable2"
            placeholder="变量2"
            style="width: 120px"
          >
            <el-option label="次数" value="reps" />
            <el-option label="时长" value="duration" />
          </el-select>
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleConfirm" :loading="submitting">
          确认
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'

interface ExerciseForm {
  name: string
  variable1: 'weight' | 'intensity' | 'difficulty'
  variable2: 'reps' | 'duration'
}

interface Props {
  modelValue: boolean
  phase: 'warmup' | 'main' | 'stretch'
  currentExerciseCount?: number
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm', exercise: ExerciseForm): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const visible = ref(false)
const submitting = ref(false)
const formRef = ref()

const form = reactive<ExerciseForm>({
  name: '',
  variable1: 'weight',
  variable2: 'reps'
})

const rules = {
  name: [
    { required: true, message: '请输入动作名称', trigger: 'blur' },
    { min: 2, max: 50, message: '动作名称长度在 2 到 50 个字符', trigger: 'blur' }
  ]
}

// 监听modelValue变化
watch(() => props.modelValue, (newValue) => {
  visible.value = newValue
  if (newValue) {
    // 重置表单
    form.name = ''
    form.variable1 = 'weight'
    form.variable2 = 'reps'
  }
})

// 监听visible变化
watch(visible, (newValue) => {
  emit('update:modelValue', newValue)
})

const handleClose = () => {
  visible.value = false
}

const handleConfirm = async () => {
  try {
    await formRef.value.validate()
    
    submitting.value = true
    
    // 验证动作数量限制
    const exerciseCount = props.currentExerciseCount || 0
    const maxCount = getMaxExerciseCount()
    
    if (exerciseCount >= maxCount) {
      ElMessage.error(`当前阶段最多只能添加${maxCount}个动作`)
      submitting.value = false
      return
    }
    
    // 延迟模拟提交
    setTimeout(() => {
      emit('confirm', { ...form })
      submitting.value = false
      visible.value = false
    }, 300)
    
  } catch (error) {
    console.error('表单验证失败:', error)
    submitting.value = false
  }
}

// 获取最大动作数量限制
const getMaxExerciseCount = () => {
  const limits = {
    warmup: 6,
    main: 30,
    stretch: 12
  }
  return limits[props.phase]
}
</script>

<style scoped>
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
</style> 