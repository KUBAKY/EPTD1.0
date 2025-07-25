# 教练权限管理系统开发计划

## 功能概述

新增教练权限管理系统，实现以下核心功能：
- 所有教练可查看和服务所有会员（共享模式）
- 管理员可指定会员由特定教练服务（专属模式）
- 支持混合模式：部分会员共享，部分会员专属
- 权限状态可视化显示
- 多教练服务支持

## 数据库设计

### 新增数据表

#### 1. 会员表扩展
```sql
-- 在members表中新增字段
ALTER TABLE members ADD COLUMN access_mode ENUM('shared', 'exclusive') DEFAULT 'shared';
```

#### 2. 会员教练权限关联表
```sql
CREATE TABLE member_coach_permissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL,
    coach_id INTEGER NOT NULL,
    permission_type ENUM('view', 'train', 'full') DEFAULT 'full',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id),
    FOREIGN KEY (coach_id) REFERENCES users(id),
    UNIQUE(member_id, coach_id)
);
```

## 功能模块设计

### 1. 权限管理界面

#### 会员列表页面增强
- **权限状态显示**: 在会员卡片上显示权限状态标签
- **筛选功能**: 添加"我的会员"/"所有会员"切换
- **权限管理按钮**: 每个会员卡片添加权限管理按钮

#### 权限管理面板
- **教练选择**: 多选框选择可服务的教练
- **权限类型**: 单选按钮设置权限类型（查看/训练/完全权限）
- **权限预览**: 实时显示权限设置效果
- **批量操作**: 支持批量设置权限

### 2. 权限控制逻辑

#### 共享模式（默认）
- 所有教练可查看所有会员信息
- 所有教练可为所有会员创建训练记录
- 所有教练可查看所有训练历史

#### 专属模式
- 只有指定教练可查看会员信息
- 只有指定教练可为会员创建训练记录
- 只有指定教练可查看会员训练历史

#### 混合模式
- 部分会员共享，部分会员专属
- 根据会员的access_mode字段判断权限

### 3. API接口设计

#### 会员管理接口扩展
```javascript
// 获取会员列表（支持权限筛选）
GET /api/members?filter=all|my|shared|exclusive

// 设置会员教练权限
POST /api/members/:id/permissions
{
  "coachIds": [1, 2, 3],
  "permissionType": "full"
}

// 获取会员权限信息
GET /api/members/:id/permissions

// 批量设置权限
POST /api/members/permissions/batch
{
  "memberIds": [1, 2, 3],
  "coachIds": [1, 2],
  "permissionType": "train"
}
```

#### 权限验证中间件
```javascript
// 检查教练是否有权限访问会员
const checkMemberPermission = (req, res, next) => {
  const { memberId } = req.params;
  const coachId = req.user.id;
  
  // 检查权限逻辑
  // 1. 如果是共享模式，允许访问
  // 2. 如果是专属模式，检查是否是指定教练
  // 3. 如果是管理员，允许访问
}
```

## 前端组件设计

### 1. 权限状态组件
```vue
<template>
  <div class="permission-status">
    <el-tag :type="statusType">{{ statusText }}</el-tag>
  </div>
</template>

<script>
export default {
  props: {
    accessMode: {
      type: String,
      default: 'shared'
    },
    coachIds: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    statusType() {
      switch(this.accessMode) {
        case 'shared': return 'success';
        case 'exclusive': return 'warning';
        default: return 'info';
      }
    },
    statusText() {
      switch(this.accessMode) {
        case 'shared': return '共享';
        case 'exclusive': return '专属';
        default: return '混合';
      }
    }
  }
}
</script>
```

### 2. 权限管理面板
```vue
<template>
  <el-dialog title="教练权限管理" :visible.sync="visible">
    <div class="permission-panel">
      <!-- 权限模式选择 -->
      <el-form-item label="权限模式">
        <el-radio-group v-model="permissionMode">
          <el-radio label="shared">共享模式</el-radio>
          <el-radio label="exclusive">专属模式</el-radio>
        </el-radio-group>
      </el-form-item>
      
      <!-- 教练选择 -->
      <el-form-item label="选择教练" v-if="permissionMode === 'exclusive'">
        <el-checkbox-group v-model="selectedCoaches">
          <el-checkbox 
            v-for="coach in coaches" 
            :key="coach.id" 
            :label="coach.id"
          >
            {{ coach.name }}
          </el-checkbox>
        </el-checkbox-group>
      </el-form-item>
      
      <!-- 权限类型 -->
      <el-form-item label="权限类型">
        <el-radio-group v-model="permissionType">
          <el-radio label="view">仅查看</el-radio>
          <el-radio label="train">可训练</el-radio>
          <el-radio label="full">完全权限</el-radio>
        </el-radio-group>
      </el-form-item>
    </div>
    
    <div slot="footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="savePermissions">保存</el-button>
    </div>
  </el-dialog>
</template>
```

### 3. 会员列表增强
```vue
<template>
  <div class="member-list">
    <!-- 筛选器 -->
    <div class="filter-bar">
      <el-select v-model="filterMode" placeholder="选择筛选模式">
        <el-option label="所有会员" value="all"></el-option>
        <el-option label="我的会员" value="my"></el-option>
        <el-option label="共享会员" value="shared"></el-option>
        <el-option label="专属会员" value="exclusive"></el-option>
      </el-select>
    </div>
    
    <!-- 会员卡片 -->
    <div class="member-grid">
      <div 
        v-for="member in filteredMembers" 
        :key="member.id" 
        class="member-card"
      >
        <div class="member-avatar">
          <el-avatar :src="member.avatar"></el-avatar>
        </div>
        <div class="member-info">
          <h3>{{ member.name }}</h3>
          <p>{{ member.phone }}</p>
          <permission-status 
            :access-mode="member.accessMode"
            :coach-ids="member.coachIds"
          />
        </div>
        <div class="member-actions">
          <el-button @click="startTraining(member)">上课</el-button>
          <el-button @click="viewDetails(member)">详情</el-button>
          <el-button @click="managePermissions(member)">权限</el-button>
        </div>
      </div>
    </div>
  </div>
</template>
```

## 开发任务清单

### 第一阶段：数据库和API开发
- [ ] 创建member_coach_permissions表
- [ ] 修改members表，添加access_mode字段
- [ ] 开发权限管理API接口
- [ ] 实现权限验证中间件
- [ ] 编写权限管理单元测试

### 第二阶段：前端组件开发
- [ ] 开发权限状态显示组件
- [ ] 开发权限管理面板组件
- [ ] 增强会员列表页面
- [ ] 实现权限筛选功能
- [ ] 添加权限管理按钮

### 第三阶段：功能集成和测试
- [ ] 集成权限管理功能到现有系统
- [ ] 测试权限控制逻辑
- [ ] 测试权限切换功能
- [ ] 测试多教练服务场景
- [ ] 性能测试和优化

### 第四阶段：UI优化和文档
- [ ] 优化权限管理界面
- [ ] 添加权限状态可视化
- [ ] 更新用户使用指南
- [ ] 更新管理员操作指南
- [ ] 编写权限管理最佳实践

## 测试计划

### 功能测试
- [ ] 共享模式：所有教练可访问所有会员
- [ ] 专属模式：只有指定教练可访问会员
- [ ] 权限切换：管理员可随时调整权限
- [ ] 权限验证：API接口正确验证权限
- [ ] 批量操作：支持批量设置权限

### 性能测试
- [ ] 大量会员数据下的权限查询性能
- [ ] 权限切换操作的响应时间
- [ ] 多教练并发访问的性能

### 安全测试
- [ ] 权限绕过攻击测试
- [ ] 数据泄露测试
- [ ] 权限提升攻击测试

## 部署和上线

### 数据库迁移
```sql
-- 执行数据库迁移脚本
-- 1. 添加新字段
-- 2. 创建新表
-- 3. 初始化默认权限
```

### 功能开关
- 添加功能开关，支持渐进式上线
- 支持回滚到旧版本
- 监控新功能使用情况

### 用户培训
- 为管理员提供权限管理培训
- 为教练提供新功能使用指南
- 收集用户反馈并优化

## 预期效果

### 业务价值
- **提升服务质量**: 会员可享受多教练服务
- **优化资源配置**: 教练资源得到充分利用
- **增强管理灵活性**: 管理员可根据需要调整权限
- **提高工作效率**: 教练可快速访问所有会员信息

### 技术价值
- **系统扩展性**: 支持复杂的权限管理需求
- **数据安全性**: 严格的权限控制确保数据安全
- **用户体验**: 直观的权限状态显示和操作
- **维护便利性**: 清晰的权限管理界面

这个教练权限管理系统将显著提升WellMotion系统的实用性和灵活性，为健身房管理提供更强大的工具。 