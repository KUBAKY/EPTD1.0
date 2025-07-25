# 任务：Dashboard页面快速操作模块添加会员按钮功能实现
状态: 规划中

## 目标
在dashboard页面的快速操作模块中正确实现添加会员按钮功能，确保点击后能够打开会员创建对话框。

## 问题分析
通过分析Dashboard.vue文件，发现以下问题：
1. 快速操作中的"添加会员"按钮目前只是简单跳转到 `/members/new` 路由
2. 但是路由配置中没有 `/members/new` 路由
3. 应该使用现有的 `MemberEditDialog` 组件来创建会员

## 执行步骤
- [x] 步骤 1: 分析会员管理页面的添加会员实现方式
- [x] 步骤 2: 在Dashboard.vue中引入MemberEditDialog组件
- [x] 步骤 3: 添加对话框状态管理和相关方法
- [x] 步骤 4: 修改快速操作中的添加会员按钮功能
- [x] 步骤 5: 测试添加会员功能是否正常工作

## 相关文件
- frontend/src/views/Dashboard.vue
- frontend/src/components/MemberEditDialog.vue
- frontend/src/router/index.ts

## 技术方案
1. 在Dashboard.vue中导入MemberEditDialog组件
2. 添加对话框显示状态控制
3. 修改快速操作中的添加会员按钮，改为打开对话框而不是跳转路由
4. 添加会员创建成功后的回调处理 