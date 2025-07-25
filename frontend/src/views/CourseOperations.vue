<template>
  <Layout>
    <div class="course-operations-page">
      <!-- 页面头部 -->
      <div class="page-header">
        <div class="header-left">
          <h1 class="page-title">课程消费管理记录</h1>
          <p class="page-subtitle">查看所有课程管理操作的详细记录</p>
        </div>
        <div class="header-right">
          <el-button type="primary" @click="$router.push('/members')">
            <el-icon><ArrowLeft /></el-icon>
            返回会员管理
          </el-button>
        </div>
      </div>

      <!-- 搜索和筛选 -->
      <div class="search-section">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-input
              v-model="searchQuery"
              placeholder="搜索会员姓名"
              clearable
              @input="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-col>
          <el-col :span="4">
            <el-select v-model="operationTypeFilter" placeholder="操作类型" clearable @change="handleSearch">
              <el-option label="全部" value="" />
              <el-option label="增加课程" value="add" />
              <el-option label="减少课程" value="subtract" />
              <el-option label="消费课程" value="consume" />
            </el-select>
          </el-col>
          <el-col :span="4">
            <el-date-picker
              v-model="dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              format="YYYY-MM-DD"
              value-format="YYYY-MM-DD"
              @change="handleSearch"
            />
          </el-col>
        </el-row>
      </div>

      <!-- 操作记录列表 -->
      <div class="operations-content">
        <el-card v-if="loading" class="loading-card">
          <div class="loading-content">
            <el-icon class="is-loading" size="32"><Loading /></el-icon>
            <p>加载中...</p>
          </div>
        </el-card>

        <div v-else-if="operations.length === 0" class="empty-state">
          <el-icon size="64" color="#CCC"><Document /></el-icon>
          <h3>暂无操作记录</h3>
          <p>还没有任何课程管理操作记录</p>
        </div>

        <div v-else class="operations-list">
          <el-table :data="operations" style="width: 100%">
            <el-table-column prop="id" label="记录ID" width="80" align="center" />
            
            <el-table-column label="会员信息" min-width="150">
              <template #default="{ row }">
                <div class="member-info-cell">
                  <div class="member-name">{{ row.member_name }}</div>
                  <div class="member-id">ID: {{ row.member_id }}</div>
                </div>
              </template>
            </el-table-column>
            
            <el-table-column label="操作类型" width="120" align="center">
              <template #default="{ row }">
                <el-tag :type="getOperationTypeColor(row.operation_type)">
                  {{ getOperationTypeText(row.operation_type) }}
                </el-tag>
              </template>
            </el-table-column>
            
            <el-table-column prop="quantity" label="数量" width="80" align="center">
              <template #default="{ row }">
                <span :class="{ 'text-danger': row.operation_type === 'subtract' || row.operation_type === 'consume' }">
                  {{ row.operation_type === 'subtract' || row.operation_type === 'consume' ? '-' : '+' }}{{ row.quantity }}
                </span>
              </template>
            </el-table-column>
            
            <el-table-column label="课程变化" width="150" align="center">
              <template #default="{ row }">
                <div class="course-change">
                  <div class="before-after">
                    <span class="before">{{ row.before_remaining }}</span>
                    <el-icon><ArrowRight /></el-icon>
                    <span class="after">{{ row.after_remaining }}</span>
                  </div>
                </div>
              </template>
            </el-table-column>
            
            <el-table-column prop="reason" label="操作原因" min-width="200" show-overflow-tooltip />
            
            <el-table-column label="操作人" width="120" align="center">
              <template #default="{ row }">
                <div class="operator-info">
                  <div class="operator-name">{{ row.operator_name }}</div>
                </div>
              </template>
            </el-table-column>
            
            <el-table-column label="操作时间" width="180" align="center">
              <template #default="{ row }">
                <div class="operation-time">
                  <div>{{ new Date(row.created_at).toLocaleDateString() }}</div>
                  <div class="time">{{ new Date(row.created_at).toLocaleTimeString() }}</div>
                </div>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 分页 -->
        <div v-if="pagination.total > 0" class="pagination-section">
          <el-pagination
            v-model:current-page="pagination.page"
            v-model:page-size="pagination.limit"
            :total="pagination.total"
            :page-sizes="[10, 20, 50, 100]"
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  Document, Search, ArrowLeft, ArrowRight, Loading
} from '@element-plus/icons-vue'
import Layout from '@/components/Layout.vue'
import { http } from '@/utils/http'

// 响应式数据
const loading = ref(false)
const operations = ref([])
const searchQuery = ref('')
const operationTypeFilter = ref('')
const dateRange = ref([])
const pagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  pages: 0
})

// 获取操作记录
const fetchOperations = async () => {
  try {
    loading.value = true
    console.log('🔄 开始获取操作记录...')
    
    const params = new URLSearchParams({
      page: pagination.value.page.toString(),
      limit: pagination.value.limit.toString()
    })

    if (searchQuery.value) {
      params.append('memberName', searchQuery.value)
    }

    if (operationTypeFilter.value) {
      params.append('operationType', operationTypeFilter.value)
    }

    if (dateRange.value && dateRange.value.length === 2) {
      params.append('startDate', dateRange.value[0])
      params.append('endDate', dateRange.value[1])
    }

    console.log('📤 请求参数:', params.toString())
    const response = await http.get(`/api/courses/operations?${params}`)
    console.log('📥 收到响应:', response.status, response.statusText)
    
    const data = await response.json()
    console.log('📋 响应数据:', data)

    if (data.success) {
      operations.value = data.data.operations || []
      pagination.value = data.data.pagination || {
        page: 1,
        limit: 20,
        total: 0,
        pages: 0
      }
      console.log('✅ 操作记录已更新:', operations.value.length, '条记录')
    } else {
      console.error('❌ API返回错误:', data.message || '未知错误')
      ElMessage.error(data.message || '获取操作记录失败')
    }
  } catch (error) {
    console.error('❌ 获取操作记录错误:', error)
    ElMessage.error('获取操作记录失败')
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  pagination.value.page = 1
  fetchOperations()
}

// 分页处理
const handleSizeChange = (size: number) => {
  pagination.value.limit = size
  pagination.value.page = 1
  fetchOperations()
}

const handleCurrentChange = (page: number) => {
  pagination.value.page = page
  fetchOperations()
}

// 获取操作类型颜色
const getOperationTypeColor = (type: string) => {
  switch (type) {
    case 'add':
      return 'success'
    case 'subtract':
      return 'warning'
    case 'consume':
      return 'danger'
    default:
      return 'info'
  }
}

// 获取操作类型文本
const getOperationTypeText = (type: string) => {
  switch (type) {
    case 'add':
      return '增加课程'
    case 'subtract':
      return '减少课程'
    case 'consume':
      return '消费课程'
    default:
      return '未知操作'
  }
}

// 初始化
onMounted(() => {
  fetchOperations()
})
</script>

<style scoped>
.course-operations-page {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}

.header-left {
  flex: 1;
}

.page-title {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: bold;
  color: var(--text-color);
}

.page-subtitle {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.search-section {
  margin-bottom: 24px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.operations-content {
  min-height: 400px;
}

.loading-card {
  text-align: center;
  padding: 60px 20px;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: #999;
}

.empty-state h3 {
  margin: 16px 0 8px 0;
  font-size: 18px;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
}

.operations-list {
  margin-bottom: 24px;
}

.member-info-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.member-name {
  font-weight: bold;
  color: var(--text-color);
  font-size: 14px;
}

.member-id {
  font-size: 12px;
  color: #666;
}

.course-change {
  display: flex;
  justify-content: center;
}

.before-after {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.before {
  color: #666;
}

.after {
  font-weight: bold;
  color: #333;
}

.operator-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.operator-name {
  font-size: 14px;
  color: #333;
}

.operation-time {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  font-size: 12px;
}

.operation-time .time {
  color: #666;
}

.text-danger {
  color: #f56c6c;
}

.pagination-section {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}

/* 平板设备优化 */
@media (max-width: 1024px) {
  .course-operations-page {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .course-operations-page {
    padding: 12px;
  }
  
  .search-section {
    padding: 16px;
  }
  
  .search-section .el-row {
    margin: 0;
  }
  
  .search-section .el-col {
    margin-bottom: 12px;
  }
}
</style> 