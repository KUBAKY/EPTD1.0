<template>
  <el-dialog 
    :model-value="visible" 
    @update:model-value="$emit('update:visible', $event)"
    title="添加课程安排" 
    width="600px"
    :before-close="handleClose"
  >
    <el-form 
      ref="formRef" 
      :model="form" 
      :rules="rules" 
      label-width="100px"
    >
      <el-form-item label="会员" prop="memberId">
        <el-select 
          v-model="form.memberId" 
          placeholder="选择会员"
          style="width: 100%"
          filterable
        >
          <el-option
            v-for="member in members"
            :key="member.id"
            :label="member.name"
            :value="member.id"
          >
            <span>{{ member.name }}</span>
            <span style="float: right; color: #8492a6; font-size: 13px">
              {{ member.phone }}
            </span>
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="课程日期" prop="scheduleDate">
        <el-date-picker
          v-model="form.scheduleDate"
          type="date"
          placeholder="选择日期"
          style="width: 100%"
          value-format="YYYY-MM-DD"
          :disabled-date="disabledDate"
        />
      </el-form-item>

      <el-form-item label="开始时间" prop="startTime">
        <el-time-picker
          v-model="form.startTime"
          placeholder="选择时间"
          style="width: 100%"
          format="HH:mm"
          value-format="HH:mm"
          :picker-options="{
            selectableRange: '00:00:00 - 23:30:00',
            step: 30,
            format: 'HH:mm',
            valueFormat: 'HH:mm',
            minuteStep: 30
          }"
          @change="handleStartTimeChange"
        />
      </el-form-item>

      <el-form-item label="结束时间" prop="endTime">
        <el-time-picker
          v-model="form.endTime"
          placeholder="选择时间"
          style="width: 100%"
          format="HH:mm"
          value-format="HH:mm"
          :picker-options="{
            selectableRange: '00:00:00 - 23:30:00',
            step: 30,
            format: 'HH:mm',
            valueFormat: 'HH:mm',
            minuteStep: 30
          }"
          :disabled="!form.startTime"
          @change="handleEndTimeChange"
        />
      </el-form-item>

      <el-form-item label="课程类型" prop="courseType">
        <el-select 
          v-model="form.courseType" 
          placeholder="选择课程类型"
          style="width: 100%"
        >
          <el-option label="力量训练" value="力量训练" />
          <el-option label="有氧训练" value="有氧训练" />
          <el-option label="综合训练" value="综合训练" />
          <el-option label="核心训练" value="核心训练" />
          <el-option label="柔韧性训练" value="柔韧性训练" />
          <el-option label="功能性训练" value="功能性训练" />
        </el-select>
      </el-form-item>

      <el-form-item label="训练模板" prop="templateId">
        <el-select 
          v-model="form.templateId" 
          placeholder="选择训练模板（可选）"
          style="width: 100%"
          clearable
        >
          <el-option
            v-for="template in templates"
            :key="template.id"
            :label="template.name"
            :value="template.id"
          >
            <span>{{ template.name }}</span>
            <span style="float: right; color: #8492a6; font-size: 13px">
              {{ template.type }}
            </span>
          </el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="备注" prop="notes">
        <el-input
          v-model="form.notes"
          type="textarea"
          :rows="3"
          placeholder="课程备注（可选）"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit">
          确定
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { http } from '@/utils/http'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'success': []
}>()

const formRef = ref()
const loading = ref(false)
const members = ref([])
const templates = ref([])

const form = reactive({
  memberId: '',
  scheduleDate: '',
  startTime: '',
  endTime: '',
  courseType: '',
  templateId: '',
  notes: ''
})

// 验证函数
const validateStartTime = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请选择开始时间'))
    return
  }
  
  // 检查是否为整点或半点
  const minutes = parseInt(value.split(':')[1])
  if (minutes !== 0 && minutes !== 30) {
    callback(new Error('开始时间必须是整点或半点'))
    return
  }
  
  callback()
}

const validateEndTime = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请选择结束时间'))
    return
  }
  
  if (!form.startTime) {
    callback(new Error('请先选择开始时间'))
    return
  }
  
  // 检查是否为整点或半点
  const minutes = parseInt(value.split(':')[1])
  if (minutes !== 0 && minutes !== 30) {
    callback(new Error('结束时间必须是整点或半点'))
    return
  }
  
  // 检查时间间隔
  const startTime = new Date(`2000-01-01 ${form.startTime}`)
  const endTime = new Date(`2000-01-01 ${value}`)
  const diffMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60)
  
  if (diffMinutes < 30) {
    callback(new Error('课程时长必须至少30分钟'))
    return
  }
  
  if (diffMinutes > 180) {
    callback(new Error('课程时长不能超过3小时'))
    return
  }
  
  callback()
}

const rules = {
  memberId: [
    { required: true, message: '请选择会员', trigger: 'change' }
  ],
  scheduleDate: [
    { required: true, message: '请选择课程日期', trigger: 'change' }
  ],
  startTime: [
    { required: true, message: '请选择开始时间', trigger: 'change' },
    { validator: validateStartTime, trigger: 'change' }
  ],
  endTime: [
    { required: true, message: '请选择结束时间', trigger: 'change' },
    { validator: validateEndTime, trigger: 'change' }
  ],
  courseType: [
    { required: true, message: '请选择课程类型', trigger: 'change' }
  ]
}

const handleStartTimeChange = (value: string) => {
  // 当开始时间改变时，清空结束时间
  form.endTime = ''
  
  // 确保时间格式正确（整点或半点）
  if (value) {
    const [hours, minutes] = value.split(':')
    const minuteValue = parseInt(minutes)
    if (minuteValue !== 0 && minuteValue !== 30) {
      // 如果不是整点或半点，自动调整为最近的半点
      const adjustedMinutes = minuteValue < 30 ? '00' : '30'
      form.startTime = `${hours}:${adjustedMinutes}`
    }
  }
}

const handleEndTimeChange = (value: string) => {
  // 确保时间格式正确（整点或半点）
  if (value) {
    const [hours, minutes] = value.split(':')
    const minuteValue = parseInt(minutes)
    if (minuteValue !== 0 && minuteValue !== 30) {
      // 如果不是整点或半点，自动调整为最近的半点
      const adjustedMinutes = minuteValue < 30 ? '00' : '30'
      form.endTime = `${hours}:${adjustedMinutes}`
    }
  }
}

const disabledDate = (time: Date) => {
  return time.getTime() < Date.now() - 8.64e7 // 不能选择过去的日期
}

const handleClose = () => {
  emit('update:visible', false)
  formRef.value?.resetFields()
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    const response = await http.post('/api/dashboard/add-session', {
      memberId: form.memberId,
      scheduleDate: form.scheduleDate,
      startTime: form.startTime,
      endTime: form.endTime,
      courseType: form.courseType,
      templateId: form.templateId || null,
      notes: form.notes
    })
    
    const data = await response.json()
    
    if (data.success) {
      ElMessage.success('课程安排添加成功！')
      emit('success')
      handleClose()
    } else {
      ElMessage.error(data.message || '添加失败')
    }
  } catch (error) {
    console.error('添加课程安排错误:', error)
    ElMessage.error('添加课程安排失败')
  } finally {
    loading.value = false
  }
}

const loadMembers = async () => {
  try {
    const response = await http.get('/api/members')
    const data = await response.json()
    
    if (data.success) {
      members.value = data.data
    }
  } catch (error) {
    console.error('加载会员列表失败:', error)
  }
}

const loadTemplates = async () => {
  try {
    const response = await http.get('/api/templates')
    const data = await response.json()
    
    if (data.success) {
      templates.value = data.data
    }
  } catch (error) {
    console.error('加载模板列表失败:', error)
  }
}

onMounted(() => {
  loadMembers()
  loadTemplates()
})
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style> 