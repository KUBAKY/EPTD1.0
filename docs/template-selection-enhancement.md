# 训练计划模板选择功能增强

## 功能概述

为训练计划模板选择对话框增加了"创建人"下拉菜单筛选功能，提升用户查找和使用模板的效率。

## 新增功能

### 1. 创建人筛选
- **筛选选项**：自动从现有模板中提取所有创建人
- **动态更新**：当模板数据变化时，创建人选项会自动更新
- **排序显示**：创建人选项按字母顺序排列

### 2. 多条件筛选
- **关键词搜索**：支持模板名称和功能说明的模糊搜索
- **分类筛选**：按训练类型筛选（力量抗阻、综合体能、功能性）
- **创建人筛选**：按模板创建人筛选
- **组合筛选**：支持多个条件同时筛选

### 3. 用户体验优化
- **筛选统计**：显示当前筛选结果数量
- **清除筛选**：一键清除所有筛选条件
- **响应式设计**：适配不同屏幕尺寸
- **实时反馈**：筛选结果实时更新

## 技术实现

### 组件结构
```vue
<template>
  <!-- 搜索和筛选区域 -->
  <div class="search-section">
    <div class="search-row">
      <!-- 关键词搜索 -->
      <el-input v-model="searchKeyword" />
      
      <!-- 分类筛选 -->
      <el-select v-model="selectedCategory" />
      
      <!-- 创建人筛选 -->
      <el-select v-model="selectedCreator" />
      
      <!-- 清除筛选按钮 -->
      <el-button v-if="hasActiveFilters" @click="clearAllFilters" />
    </div>
  </div>
  
  <!-- 筛选统计 -->
  <div class="filter-stats">
    <span>共找到 {{ filteredTemplates.length }} 个模板</span>
  </div>
</template>
```

### 核心逻辑
```typescript
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
```

## 使用方法

### 1. 基本筛选
1. 打开训练页面
2. 点击"调用训练计划模板"按钮
3. 在对话框中输入关键词或选择分类/创建人
4. 查看筛选结果

### 2. 组合筛选
- 可以同时使用关键词、分类、创建人进行筛选
- 筛选条件之间是"与"的关系
- 使用"清除筛选"按钮可以一键重置所有条件

### 3. 测试功能
- 访问 `/test` 页面可以测试模板选择对话框
- 测试页面包含6个不同创建人和分类的模板数据

## 样式设计

### 响应式布局
```css
.search-row {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
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
}
```

### 筛选统计样式
```css
.filter-stats {
  margin-bottom: 16px;
  padding: 8px 0;
  border-bottom: 1px solid #e5e5e5;
}

.filter-info {
  color: #409eff;
  font-weight: 500;
}
```

## 测试数据

测试页面包含以下模板数据：

| 模板名称 | 分类 | 创建人 | 使用次数 |
|---------|------|--------|----------|
| 基础力量训练 | 力量抗阻 | 管理员 | 0 |
| 上肢力量训练 | 力量抗阻 | 王教练 | 2 |
| 下肢力量训练 | 力量抗阻 | 张教练 | 1 |
| 综合体能训练 | 综合体能 | 管理员 | 3 |
| 功能性训练 | 功能性 | 王教练 | 1 |
| 有氧训练计划 | 综合体能 | 张教练 | 0 |

## 未来改进

1. **高级筛选**：添加使用次数、创建时间等筛选条件
2. **收藏功能**：允许用户收藏常用模板
3. **排序功能**：支持按名称、使用次数、创建时间排序
4. **批量操作**：支持批量选择和使用模板
5. **模板预览**：提供更详细的模板预览功能 