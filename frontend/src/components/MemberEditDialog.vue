<template>
  <el-dialog
    v-model="dialogVisible"
    :title="isEdit ? '编辑会员信息' : '新增会员'"
    width="600px"
    :close-on-click-modal="false"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
    >
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="姓名" prop="name">
            <el-input
              v-model="form.name"
              placeholder="请输入会员姓名"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="手机号" prop="phone">
            <el-input
              v-model="form.phone"
              placeholder="请输入手机号"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="性别" prop="gender">
            <el-select v-model="form.gender" placeholder="请选择性别" style="width: 100%">
              <el-option label="男" value="male" />
              <el-option label="女" value="female" />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="年龄" prop="age">
            <el-input-number
              v-model="form.age"
              :min="1"
              :max="120"
              placeholder="请输入年龄"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="身高(cm)" prop="height">
            <el-input-number
              v-model="form.height"
              :min="50"
              :max="250"
              :precision="1"
              placeholder="请输入身高"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="体重(kg)" prop="weight">
            <el-input-number
              v-model="form.weight"
              :min="20"
              :max="300"
              :precision="1"
              placeholder="请输入体重"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="健康历史" prop="health_history">
        <el-input
          v-model="form.health_history"
          type="textarea"
          :rows="3"
          placeholder="请输入健康历史（如有特殊病史请详细说明）"
        />
      </el-form-item>

      <el-form-item label="运动禁忌" prop="medical_restrictions">
        <el-input
          v-model="form.medical_restrictions"
          type="textarea"
          :rows="3"
          placeholder="请输入运动禁忌（如有运动禁忌请详细说明）"
        />
      </el-form-item>

      <el-form-item label="备注" prop="notes">
        <el-input
          v-model="form.notes"
          type="textarea"
          :rows="2"
          placeholder="请输入备注信息"
        />
      </el-form-item>
      
      <!-- 权限设置部分 -->
      <el-divider content-position="left">权限设置</el-divider>
      
      <el-form-item label="访问模式" prop="access_mode">
        <el-radio-group v-model="form.access_mode">
          <el-radio label="shared">
            <span>共享模式</span>
            <el-tag type="info" size="small" style="margin-left: 8px">所有教练可查看和服务</el-tag>
          </el-radio>
          <el-radio label="exclusive">
            <span>专属模式</span>
            <el-tag type="warning" size="small" style="margin-left: 8px">仅指定教练可查看和服务</el-tag>
          </el-radio>
        </el-radio-group>
      </el-form-item>
      
      <el-form-item 
        label="指定教练" 
        prop="coach_ids"
        v-if="form.access_mode === 'exclusive'"
      >
        <div class="coach-selection">
          <el-checkbox 
            v-model="selectAllCoaches"
            @change="handleSelectAllCoaches"
          >
            全选教练
          </el-checkbox>
          <el-divider />
          <el-checkbox-group v-model="form.coach_ids">
            <el-checkbox 
              v-for="coach in coaches" 
              :key="coach.id" 
              :label="coach.id"
            >
              {{ coach.name }} (ID: {{ coach.id }})
            </el-checkbox>
          </el-checkbox-group>
        </div>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading">
          {{ isEdit ? '保存' : '创建' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { http } from '@/utils/http'

const props = defineProps<{
  visible: boolean
  member?: any
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'success': []
}>()

const formRef = ref()
const loading = ref(false)

// 计算属性：对话框可见性
const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

// 表单数据
const form = reactive({
  name: '',
  phone: '',
  gender: 'male',
  age: 25,
  height: 170,
  weight: 65,
  health_history: '',
  medical_restrictions: '',
  notes: '',
  access_mode: 'shared', // 新增权限模式
  coach_ids: [] as number[] // 新增指定教练ID列表
})

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入会员姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '姓名长度在2到20个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  age: [
    { required: true, message: '请输入年龄', trigger: 'blur' },
    { type: 'number', min: 1, max: 120, message: '年龄必须在1-120之间', trigger: 'blur' }
  ],
  height: [
    { required: true, message: '请输入身高', trigger: 'blur' },
    { type: 'number', min: 50, max: 250, message: '身高必须在50-250cm之间', trigger: 'blur' }
  ],
  weight: [
    { required: true, message: '请输入体重', trigger: 'blur' },
    { type: 'number', min: 20, max: 300, message: '体重必须在20-300kg之间', trigger: 'blur' }
  ],
  access_mode: [
    { required: true, message: '请选择访问模式', trigger: 'change' }
  ],
  coach_ids: [
    {
      validator: (rule: any, value: number[], callback: any) => {
        if (form.access_mode === 'exclusive' && value.length === 0) {
          callback(new Error('专属模式必须选择至少一个教练'))
        } else {
          callback()
        }
      },
      trigger: 'change'
    }
  ]
}

// 监听会员数据变化，填充表单
watch(() => props.member, (member) => {
  if (member && member.id) {
    // 编辑模式
    form.name = member.name || ''
    form.phone = member.phone || ''
    form.gender = member.gender || 'male'
    form.age = member.age || 25
    form.height = member.height || 170
    form.weight = member.weight || 65
    form.health_history = member.health_history || ''
    form.medical_restrictions = member.medical_restrictions || ''
    form.notes = member.notes || ''
    form.access_mode = member.access_mode || 'shared'
    form.coach_ids = member.coach_ids || []
    
    // 加载会员的权限信息
    loadMemberPermissions(member.id)
  } else {
    // 新增模式，重置表单
    Object.assign(form, {
      name: '',
      phone: '',
      gender: 'male',
      age: 25,
      height: 170,
      weight: 65,
      health_history: '',
      medical_restrictions: '',
      notes: '',
      access_mode: 'shared',
      coach_ids: []
    })
  }
}, { immediate: true })

// 加载会员权限信息
const loadMemberPermissions = async (memberId: number) => {
  try {
    const response = await http.get(`/api/members/${memberId}/permissions`)
    const data = await response.json()
    if (data.success) {
      const permissions = data.data.permissions
      form.coach_ids = permissions.map((p: any) => p.coach_id)
    }
  } catch (error) {
    console.error('加载会员权限信息错误:', error)
  }
}

// 获取所有教练列表
const coaches = ref<any[]>([])
const fetchCoaches = async () => {
  try {
    const response = await http.get('/api/members/coaches')
    const data = await response.json()
    if (data.success) {
      coaches.value = data.data || []
      console.log('✅ 获取教练列表成功:', coaches.value.length, '个教练')
    } else {
      ElMessage.error(data.message || '获取教练列表失败')
    }
  } catch (error) {
    console.error('获取教练列表错误:', error)
    ElMessage.error('获取教练列表失败')
  }
}

// 权限设置相关
const selectAllCoaches = ref(false)

const handleSelectAllCoaches = () => {
  if (selectAllCoaches.value) {
    form.coach_ids = coaches.value.map(coach => coach.id)
  } else {
    form.coach_ids = []
  }
}

// 监听教练选择变化
watch(() => form.coach_ids, (newVal) => {
  if (newVal.length === coaches.value.length && coaches.value.length > 0) {
    selectAllCoaches.value = true
  } else {
    selectAllCoaches.value = false
  }
})

// 判断是编辑还是新增
const isEdit = computed(() => {
  return props.member && props.member.id
})

// 关闭对话框
const handleClose = () => {
  emit('update:visible', false)
  formRef.value?.resetFields()
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    // 确保教练ID是数字类型
    const coachIds = form.coach_ids.map(id => parseInt(id))
    
    let response: any
    if (isEdit.value) {
      response = await http.put(`/api/members/${props.member.id}`, {
        name: form.name,
        phone: form.phone,
        gender: form.gender,
        age: form.age,
        height: form.height,
        weight: form.weight,
        health_history: form.health_history,
        medical_restrictions: form.medical_restrictions,
        notes: form.notes,
        access_mode: form.access_mode,
        coach_ids: coachIds
      })
    } else {
      response = await http.post('/api/members', {
        name: form.name,
        phone: form.phone,
        gender: form.gender,
        age: form.age,
        height: form.height,
        weight: form.weight,
        health_history: form.health_history,
        medical_restrictions: form.medical_restrictions,
        notes: form.notes,
        access_mode: form.access_mode,
        coach_ids: coachIds
      })
    }
    
    const data = await response.json()
    
    if (data.success) {
      // 更新权限设置
      if (isEdit.value) {
        await http.post(`/api/members/${props.member.id}/permissions`, {
          access_mode: form.access_mode,
          coach_ids: coachIds
        })
      }
      
      ElMessage.success(isEdit.value ? '会员信息更新成功' : '会员创建成功')
      emit('success')
      handleClose()
    } else {
      ElMessage.error(data.message || '更新失败')
    }
  } catch (error) {
    console.error('更新会员信息错误:', error)
    ElMessage.error('更新失败')
  } finally {
    loading.value = false
  }
}

// 组件挂载时获取教练列表
onMounted(() => {
  fetchCoaches()
})
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.coach-selection {
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 16px;
  background-color: #fafafa;
}

.coach-selection .el-checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
}

.coach-selection .el-checkbox {
  margin-right: 0;
  margin-bottom: 8px;
}
</style> 