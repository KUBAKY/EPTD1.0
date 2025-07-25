<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="$emit('update:visible', $event)"
    :title="isEdit ? '编辑用户' : '添加用户'"
    width="500px"
    :close-on-click-modal="false"
  >
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-width="100px"
    >
      <el-form-item label="用户名" prop="username">
        <el-input
          v-model="form.username"
          placeholder="请输入用户名"
          :disabled="isEdit"
        />
      </el-form-item>

      <el-form-item label="姓名" prop="name">
        <el-input
          v-model="form.name"
          placeholder="请输入姓名"
        />
      </el-form-item>

      <el-form-item label="密码" prop="password" v-if="!isEdit">
        <el-input
          v-model="form.password"
          type="password"
          placeholder="请输入密码"
          show-password
        />
      </el-form-item>

      <el-form-item label="角色" prop="role">
        <el-select v-model="form.role" placeholder="请选择角色" style="width: 100%">
          <el-option label="教练" value="coach" />
          <el-option label="管理员" value="admin" />
        </el-select>
      </el-form-item>

      <el-form-item label="手机号" prop="phone">
        <el-input
          v-model="form.phone"
          placeholder="请输入手机号"
        />
      </el-form-item>

      <el-form-item label="状态" prop="status">
        <el-switch
          v-model="form.status"
          :active-value="1"
          :inactive-value="0"
          active-text="活跃"
          inactive-text="非活跃"
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
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { http } from '@/utils/http'

const props = defineProps<{
  visible: boolean
  user?: any
  isEdit: boolean
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  'success': []
}>()

const formRef = ref()
const loading = ref(false)

const form = reactive({
  username: '',
  name: '',
  password: '',
  role: 'coach',
  phone: '',
  status: 1
})

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在3到20个字符', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6个字符', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
}

// 监听用户数据变化
watch(() => props.user, (user) => {
  if (user && props.isEdit) {
    form.username = user.username
    form.name = user.name
    form.role = user.role
    form.phone = user.phone || ''
    form.status = user.status
    form.password = '' // 编辑时不显示密码
  } else {
    // 重置表单
    form.username = ''
    form.name = ''
    form.password = ''
    form.role = 'coach'
    form.phone = ''
    form.status = 1
  }
}, { immediate: true })

const handleClose = () => {
  emit('update:visible', false)
  formRef.value?.resetFields()
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    if (props.isEdit) {
      // 编辑用户
      const response = await http.put(`/api/users/${props.user.id}`, {
        name: form.name,
        role: form.role,
        phone: form.phone,
        status: form.status
      })
      
      const data = await response.json()
      
      if (data.success) {
        ElMessage.success('用户信息更新成功')
        emit('success')
        handleClose()
      } else {
        ElMessage.error(data.message || '更新失败')
      }
    } else {
      // 添加用户
      const response = await http.post('/api/users', {
        username: form.username,
        password: form.password,
        name: form.name,
        role: form.role,
        phone: form.phone
      })
      
      const data = await response.json()
      
      if (data.success) {
        ElMessage.success('用户添加成功')
        emit('success')
        handleClose()
      } else {
        ElMessage.error(data.message || '添加失败')
      }
    }
  } catch (error) {
    console.error('提交表单错误:', error)
    ElMessage.error('操作失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style> 