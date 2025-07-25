<template>
  <Layout>
    <div class="test-page">
      <h2>模板选择对话框测试</h2>
      
      <el-button type="primary" @click="showTemplateDialog = true">
        打开模板选择对话框
      </el-button>
      
      <div class="test-info">
        <h3>测试数据说明：</h3>
        <ul>
          <li>包含3个创建人：管理员、王教练、张教练</li>
          <li>包含3个分类：力量抗阻、综合体能、功能性</li>
          <li>可以通过关键词、分类、创建人进行筛选</li>
        </ul>
      </div>
      
      <!-- 模板选择对话框 -->
      <TemplateSelectionDialog
        v-model="showTemplateDialog"
        :templates="testTemplates"
        @use-template="handleUseTemplate"
        @create-template="handleCreateTemplate"
      />
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import Layout from '@/components/Layout.vue'
import TemplateSelectionDialog from '@/components/TemplateSelectionDialog.vue'

const showTemplateDialog = ref(false)

// 测试模板数据
const testTemplates = ref([
  {
    id: 1,
    name: '基础力量训练',
    category: 'strength',
    description: '适合初学者的基础力量训练计划',
    creator: '管理员',
    createdAt: '2025-01-24 11:34:44',
    useCount: 0,
    warmup: [
      { name: '全身热身', variable1: 'intensity', variable2: 'duration' }
    ],
    main: [
      { name: '深蹲', variable1: 'weight', variable2: 'reps' },
      { name: '硬拉', variable1: 'weight', variable2: 'reps' },
      { name: '卧推', variable1: 'weight', variable2: 'reps' }
    ],
    stretch: [
      { name: '大腿拉伸', variable1: 'intensity', variable2: 'duration' }
    ]
  },
  {
    id: 2,
    name: '上肢力量训练',
    category: 'strength',
    description: '专注于胸、肩、臂部肌肉的力量训练计划',
    creator: '王教练',
    createdAt: '2025-01-24 10:20:15',
    useCount: 2,
    warmup: [
      { name: '肩部热身', variable1: 'intensity', variable2: 'duration' }
    ],
    main: [
      { name: '卧推', variable1: 'weight', variable2: 'reps' },
      { name: '肩推', variable1: 'weight', variable2: 'reps' },
      { name: '引体向上', variable1: 'weight', variable2: 'reps' },
      { name: '弯举', variable1: 'weight', variable2: 'reps' }
    ],
    stretch: [
      { name: '胸部拉伸', variable1: 'intensity', variable2: 'duration' }
    ]
  },
  {
    id: 3,
    name: '下肢力量训练',
    category: 'strength',
    description: '强化腿部肌肉，提升下肢力量',
    creator: '张教练',
    createdAt: '2025-01-24 09:15:30',
    useCount: 1,
    warmup: [
      { name: '腿部热身', variable1: 'intensity', variable2: 'duration' }
    ],
    main: [
      { name: '深蹲', variable1: 'weight', variable2: 'reps' },
      { name: '腿举', variable1: 'weight', variable2: 'reps' },
      { name: '腿弯举', variable1: 'weight', variable2: 'reps' }
    ],
    stretch: [
      { name: '腿部拉伸', variable1: 'intensity', variable2: 'duration' }
    ]
  },
  {
    id: 4,
    name: '综合体能训练',
    category: 'comprehensive',
    description: '全面提升体能和协调性的综合训练',
    creator: '管理员',
    createdAt: '2025-01-23 16:45:22',
    useCount: 3,
    warmup: [
      { name: '全身热身', variable1: 'intensity', variable2: 'duration' }
    ],
    main: [
      { name: '波比跳', variable1: 'intensity', variable2: 'reps' },
      { name: '平板支撑', variable1: 'intensity', variable2: 'duration' },
      { name: '登山者', variable1: 'intensity', variable2: 'reps' }
    ],
    stretch: [
      { name: '全身拉伸', variable1: 'intensity', variable2: 'duration' }
    ]
  },
  {
    id: 5,
    name: '功能性训练',
    category: 'functional',
    description: '提升日常生活功能性的专项训练',
    creator: '王教练',
    createdAt: '2025-01-23 14:30:10',
    useCount: 1,
    warmup: [
      { name: '关节活动', variable1: 'intensity', variable2: 'duration' }
    ],
    main: [
      { name: '单腿深蹲', variable1: 'weight', variable2: 'reps' },
      { name: '土耳其起立', variable1: 'weight', variable2: 'reps' },
      { name: '农夫行走', variable1: 'weight', variable2: 'duration' }
    ],
    stretch: [
      { name: '功能性拉伸', variable1: 'intensity', variable2: 'duration' }
    ]
  },
  {
    id: 6,
    name: '有氧训练计划',
    category: 'comprehensive',
    description: '提升心肺功能的有氧训练计划',
    creator: '张教练',
    createdAt: '2025-01-23 11:20:45',
    useCount: 0,
    warmup: [
      { name: '轻度有氧', variable1: 'intensity', variable2: 'duration' }
    ],
    main: [
      { name: '跑步', variable1: 'intensity', variable2: 'duration' },
      { name: '划船机', variable1: 'intensity', variable2: 'duration' },
      { name: '椭圆机', variable1: 'intensity', variable2: 'duration' }
    ],
    stretch: [
      { name: '有氧后拉伸', variable1: 'intensity', variable2: 'duration' }
    ]
  }
])

const handleUseTemplate = (template: any) => {
  ElMessage.success(`已选择模板：${template.name}`)
  console.log('选择的模板:', template)
}

const handleCreateTemplate = () => {
  ElMessage.info('跳转到创建模板页面')
}
</script>

<style scoped>
.test-page {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.test-page h2 {
  color: #2E4057;
  margin-bottom: 20px;
}

.test-info {
  margin-top: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #409eff;
}

.test-info h3 {
  color: #2E4057;
  margin-bottom: 15px;
}

.test-info ul {
  margin: 0;
  padding-left: 20px;
}

.test-info li {
  margin-bottom: 8px;
  color: #606266;
  line-height: 1.5;
}
</style> 