# 电子健身训练课程日志Web项目需求分析文档

## 项目概述
**项目名称**: 电子私教课程训练日志系统  
**使用平台**: 安卓平板电脑Web应用  
**目标用户**: 私人健身教练  
**数据库**: SQLite  

## 项目背景与目标

### 业务背景
传统私教课程记录依赖纸质表格，存在以下痛点：
- 记录不规范，数据难以统计分析
- 纸质文件易丢失，无法长期保存
- 手写记录效率低，影响训练节奏
- 会员课程进度追踪困难
- 教练无法快速调用历史训练计划
- 课程纠纷时缺乏有效凭证

### 项目目标
**主要目标**：
- 提升私教课程记录效率50%以上
- 实现训练数据数字化存储和管理
- 建立标准化的私教服务流程
- 提供课程争议解决的电子凭证
- 支持训练数据统计分析和优化

**次要目标**：
- 提升会员满意度和服务体验
- 降低教练工作强度和出错率
- 建立可复制的训练计划模板库
- 为健身房管理提供数据支撑

### 目标用户分析

**主要用户：私人健身教练**
- 用户特征：25-45岁，体育相关专业背景，熟悉基础数字设备操作
- 使用场景：健身房内，与会员一对一训练时使用
- 核心需求：快速记录训练数据，调用训练计划，评价课程效果，共享会员资源
- 痛点：纸质记录繁琐，数据统计困难，计划复用性差，会员资源分配不均

**次要用户：健身房管理员**
- 用户特征：管理层人员，负责教练团队管理和数据分析
- 使用场景：办公室内，进行数据分析和团队管理
- 核心需求：查看整体训练数据，管理教练账户，监控服务质量，分配会员资源
- 痛点：缺乏统一的数据管理平台，服务质量难以量化，会员分配管理复杂

**间接用户：私教会员**
- 用户特征：各年龄段，健身需求多样化
- 使用场景：训练结束后查看训练记录，提供课程反馈
- 核心需求：了解训练进度，参与课程评价，获得训练建议，享受多教练服务
- 痛点：训练记录不透明，进度跟踪困难，教练选择受限

## 核心业务流程详细分析

### 主流程：完整私教课程记录
```
1. 教练登录系统
   ├── 验证身份信息
   ├── 进入个人工作台
   └── 查看当日课程安排

2. 选择训练会员
   ├── 从会员列表选择
   ├── 查看会员基本信息
   ├── 查看健康状况和运动禁忌
   └── 查看历史训练记录

3. 课前准备阶段
   ├── 询问会员当前身体状态
   ├── 记录课前运动状态细项
   ├── 确认当日训练目标
   └── 选择或制定训练计划

4. 训练计划制定
   ├── 从模板库选择计划(快速)
   │   ├── 按分类筛选模板
   │   ├── 预览模板内容
   │   └── 一键导入训练计划
   └── 手动创建训练计划(灵活)
       ├── 设计热身激活动作
       ├── 安排主体训练动作
       └── 配置拉伸松解动作

5. 训练执行与记录
   ├── 热身激活阶段(5-15分钟)
   │   ├── 选择1-6个激活动作
   │   ├── 设置每个动作1-3组
   │   ├── 记录重量/强度 + 次数/时长
   │   └── 实时记录执行情况
   ├── 主体训练阶段(30-50分钟)
   │   ├── 选择1-30个训练动作
   │   ├── 设置每个动作1-12组
   │   ├── 每组都记录重量/强度 + 次数/时长
   │   ├── 每组记录组间休息时间
   │   └── 监控训练强度和会员反应
   └── 拉伸松解阶段(5-15分钟)
       ├── 选择1-12个拉伸动作
       ├── 设置每个动作1-3组
       ├── 记录拉伸强度和时长
       └── 确保充分放松

6. 课程总结评价
   ├── 课程完成度评估(0-100%)
   ├── 会员主观感受记录
   │   ├── 训练强度感受(0-100%)
   │   ├── 计划难度感受(0-100%)
   │   └── 整体课程评分(1-100分)
   ├── 教练专业评价
   │   ├── 会员训练表现评分(1-100分)
   │   ├── 详细总结文字记录
   │   └── 下次训练建议
   └── 会员反馈收集
       ├── 会员课程评分(1-100分)
       ├── 会员文字反馈
       └── 改进建议收集

7. 电子签字确认
   ├── 教练签字确认训练内容
   ├── 会员签字确认课程完成
   ├── 生成课程完成凭证
   └── 保存所有训练数据

8. 数据提交保存
   ├── 验证数据完整性
   ├── 保存到本地数据库
   ├── 生成训练报告
   └── 为下次训练做准备
```

### 支持流程：会员管理
```
1. 新会员注册
   ├── 录入基本信息(姓名、电话、性别、年龄)
   ├── 测量体征数据(身高、体重、BMI)
   ├── 了解健康历史和运动经历
   ├── 识别运动禁忌和风险因素
   ├── 设定健身目标和期望
   ├── 建立会员档案
   └── 设置教练服务权限(可选)

2. 会员信息维护
   ├── 更新基本信息
   ├── 记录体征变化
   ├── 补充健康信息
   ├── 调整运动禁忌
   ├── 修正健身目标
   └── 调整教练服务权限

3. 会员历史查询
   ├── 查看训练历史记录
   ├── 分析训练数据趋势
   ├── 评估训练效果
   ├── 制定下阶段计划
   └── 生成进度报告

4. 教练权限管理
   ├── 查看所有会员列表
   ├── 查看会员详细信息
   ├── 为会员创建训练记录
   ├── 查看会员训练历史
   └── 管理员分配专属教练
```

### 支持流程：训练模板管理
```
1. 模板创建流程
   ├── 定义模板基本信息
   │   ├── 模板名称和描述
   │   ├── 适用课程分类
   │   ├── 目标人群定义
   │   └── 禁忌条件说明
   ├── 设计训练内容
   │   ├── 热身激活动作配置
   │   ├── 主体训练动作安排
   │   ├── 拉伸松解动作选择
   │   └── 参数默认值设定
   ├── 模板验证测试
   │   ├── 逻辑合理性检查
   │   ├── 时间安排验证
   │   ├── 强度搭配评估
   │   └── 安全性确认
   └── 发布到模板库

2. 模板使用流程
   ├── 按需求筛选模板
   ├── 预览模板详细内容
   ├── 根据会员情况调整
   ├── 导入到训练日志
   └── 记录使用反馈

3. 模板优化流程
   ├── 收集使用数据
   ├── 分析效果反馈
   ├── 识别改进点
   ├── 更新模板内容
   └── 版本迭代管理
```

## 功能需求详细分析

### 1. 用户认证与权限管理需求

**功能描述**：建立安全的用户认证体系，支持不同角色权限控制

**详细需求**：
- **登录认证**
  - 支持用户名+密码登录方式
  - 密码强度要求：至少8位，包含字母和数字
  - 登录状态保持7天（可配置）
  - 连续5次登录失败锁定账户30分钟
  - 记录登录日志和IP地址

- **权限控制**
  - 基于角色的访问控制(RBAC)
  - 管理员权限：用户管理、系统配置、数据统计
  - 教练权限：会员管理、训练记录、模板查看
  - 菜单和功能按权限显示
  - API接口权限验证

- **安全机制**
  - JWT Token认证机制
  - Token自动续期和过期处理
  - 防止跨站请求伪造(CSRF)
  - 输入数据过滤和验证

**验收标准**：
- 用户可以安全登录和退出系统
- 不同角色只能访问授权功能
- 系统能够抵御常见安全攻击
- 登录响应时间小于2秒

### 2. 会员管理功能需求

**功能描述**：提供完整的会员信息管理功能，支持会员档案建立和维护，实现教练共享会员资源

**详细需求**：
- **会员档案管理**
  - 基本信息：姓名、电话、性别、年龄、地址
  - 身体数据：身高、体重、BMI、体脂率、肌肉量
  - 健康信息：疾病史、手术史、过敏史、用药情况
  - 运动禁忌：关节限制、心血管限制、特殊注意事项
  - 紧急联系人：姓名、关系、电话
  - 健身目标：减脂、增肌、塑形、康复、竞技等
  - 教练权限：专属教练设置、多教练服务权限

- **会员搜索和筛选**
  - 支持姓名、电话模糊搜索
  - 按性别、年龄段、加入时间筛选
  - 按训练频率、活跃度排序
  - 收藏常练会员快速访问
  - 按教练权限筛选（我的会员/所有会员）

- **会员档案验证**
  - 手机号格式验证和唯一性检查
  - 年龄范围验证（16-80岁）
  - 身高体重数据合理性检查
  - 必填字段完整性验证

- **教练权限管理**
  - **共享模式**：所有教练可查看和服务所有会员
  - **专属模式**：管理员可指定会员由特定教练服务
  - **混合模式**：部分会员共享，部分会员专属
  - **权限切换**：管理员可随时调整会员教练权限
  - **权限显示**：会员列表中显示教练权限状态

- **数据隐私保护**
  - 敏感信息加密存储
  - 操作日志记录
  - 数据访问权限控制
  - 符合个人信息保护要求

**验收标准**：
- 能够快速创建和编辑会员档案
- 搜索响应时间小于1秒
- 数据验证准确率100%
- 支持1000+会员数据管理
- 教练权限切换响应时间小于2秒
- 权限管理操作成功率100%

### 3. 训练计划模板库需求

**功能描述**：建立标准化的训练计划模板库，提高计划制定效率和专业性

**详细需求**：
- **模板分类体系**
  - 力量抗阻训练：上肢力量、下肢力量、核心力量、全身力量
  - 综合体能训练：心肺耐力、爆发力、敏捷性、平衡性
  - 功能性训练：日常活动、运动专项、康复训练、特殊人群

- **模板内容结构**
  - 基本信息：名称、分类、创建者、创建时间
  - 适用条件：目标人群、体能水平、设备要求
  - 训练内容：
    - 热身激活：动作名称、组数、参数范围、注意事项
    - 主体训练：动作名称、组数、参数范围、休息时间、强度递进
    - 拉伸松解：动作名称、组数、参数范围、放松重点
  - 使用指导：执行要点、常见错误、安全提醒、效果预期

- **模板编辑功能**
  - 可视化编辑器，拖拽排序动作
  - 动作库集成，快速选择常用动作
  - 参数模板设置，自动填充默认值
  - 预览功能，实时查看模板效果
  - 复制和修改现有模板

- **模板质量控制**
  - 专业性审核：动作搭配合理性、强度递进科学性
  - 安全性检查：禁忌动作排查、风险评估
  - 实用性验证：使用数据统计、效果反馈收集
  - 版本管理：修改历史记录、版本对比功能

**验收标准**：
- 模板库包含50+专业训练模板
- 模板调用速度小于3秒
- 支持复杂训练计划的完整描述
- 模板使用率达到80%以上

### 4. 训练日志核心功能需求

**功能描述**：提供专业的训练过程记录功能，确保数据准确性和完整性

**详细需求**：
- **训练前准备**
  - 会员状态询问：睡眠质量、饮食情况、身体感受、疲劳程度
  - 体征快速测量：心率、血压（如有设备）、主观疲劳度
  - 训练目标确认：当日重点、期望强度、特殊要求
  - 计划选择：模板调用或自定义计划

- **训练计时系统**
  - **开始上课计时时钟**：
    - 训练开始按钮：点击后启动计时器，记录训练总时长
    - 实时显示：大号数字显示当前训练时长（时:分:秒格式）
    - 状态指示：绿色表示训练进行中，红色表示暂停状态
    - 暂停/继续：支持训练过程中暂停和继续计时
    - 结束训练：点击结束按钮停止计时，记录总训练时长
  - **定时提醒功能**：
    - 15分钟提醒：每15分钟发出提示声，提醒教练注意训练节奏
    - 30分钟提醒：每30分钟发出不同音调的提示声
    - 45分钟提醒：每45分钟发出提醒，建议开始拉伸阶段
    - 60分钟提醒：每60分钟发出结束提醒，建议结束训练
    - 声音设置：可调节音量，支持静音模式
    - 视觉提醒：配合声音的视觉闪烁提示
  - **时间数据显示功能**：
    - 上课开始时间：显示训练开始的具体时间（时:分）
    - 结束时间：显示训练结束的具体时间（时:分）
    - 课程时长：显示总训练时长（时:分:秒）
    - 实时更新：训练过程中实时更新显示时间
    - 历史记录：保存并显示历史训练的时间数据

- **实时训练记录**
  - 分阶段记录：热身→主体→拉伸，清晰的阶段划分
  - 动态表格：根据计划自动生成记录表格
  - 多参数记录：
    - 重量：支持kg为单位的精确记录
    - 强度：支持%为单位的相对强度
    - 次数：支持标准次数记录
    - 时长：支持秒为单位的时间记录
    - 休息：记录组间休息时间
  - 实时保存：每30秒自动保存，防止数据丢失

- **智能辅助功能**
  - 历史数据参考：显示上次训练的相关数据
  - 参数建议：基于会员能力给出合理建议
  - 进度提醒：根据计划进度提供操作指引
  - 异常提醒：数据异常时给出提示

- **数据验证机制**
  - 范围验证：重量、次数等参数合理性检查
  - 逻辑验证：前后数据一致性检查
  - 完整性验证：必填项目完成度检查
  - 安全验证：超负荷训练风险提醒

**验收标准**：
- 训练记录精确度达到100%
- 数据录入速度提升50%以上
- 自动保存成功率99.9%
- 支持60分钟连续使用不卡顿
- 计时器精度误差小于1秒
- 定时提醒功能准确率100%
- 声音提醒在平板设备上正常工作
- 时间数据显示准确率100%
- 时间数据实时更新延迟小于1秒
- 历史时间数据查询响应时间小于2秒

### 5. 课程评价与签字确认需求

**功能描述**：建立完整的课程评价体系和电子签字确认机制

**详细需求**：
- **多维度评价体系**
  - 客观评价：
    - 课程完成度：实际完成训练量占计划量的百分比
    - 技术完成度：动作标准程度评估
    - 训练强度：实际强度与计划强度对比
  - 主观评价：
    - 会员感受强度：会员主观感受的训练强度(0-100%)
    - 会员感受难度：会员主观感受的动作难度(0-100%)
    - 会员整体满意度：对课程的整体评分(1-100分)
  - 专业评价：
    - 教练对会员表现评分：技术、态度、进步程度(1-100分)
    - 教练专业总结：文字描述会员表现和改进建议
    - 下次训练建议：针对性的训练计划调整建议

- **评价数据收集**
  - 滑块组件：直观的百分比选择
  - 星级评分：1-5星对应20-100分
  - 文本输入：支持富文本编辑，表情符号
  - 语音转文字：支持语音输入长文本

- **电子签字系统**
  - HTML5 Canvas实现手写签名
  - 签名区域：300x150px，适配平板操作
  - 签名工具：可调节笔触粗细、颜色
  - 签名管理：清空、撤销、重做功能
  - 签名存储：转换为base64图片格式保存
  - 双重确认：教练签字+会员签字都必须完成

- **凭证生成机制**
  - 训练摘要：自动生成训练数据摘要
  - 签字凭证：包含双方签字的电子凭证
  - 时间戳：确保数据的不可篡改性
  - 唯一标识：为每次训练生成唯一ID

**验收标准**：
- 评价数据采集完整率100%
- 电子签字成功率99.9%
- 凭证生成时间小于5秒
- 签字图像清晰度满足法律要求

### 6. 数据管理与统计分析需求

**功能描述**：提供完整的数据管理和统计分析功能，支持训练效果评估

**详细需求**：
- **数据存储管理**
  - 本地存储：SQLite数据库确保离线可用
  - 数据备份：自动定时备份到云端
  - 数据同步：多设备间数据同步
  - 数据恢复：支持从备份恢复数据

- **历史数据查询**
  - 多维度查询：按时间、会员、教练、课程类型
  - 快速筛选：常用时间段、热门训练项目
  - 详细记录：查看完整的历史训练记录
  - 数据对比：不同时期的训练数据对比

- **统计分析功能**
  - 训练趋势：会员训练频率、强度变化趋势
  - 进步评估：各项指标的进步幅度统计
  - 效果分析：训练目标达成情况分析
  - 课程统计：最受欢迎的训练项目统计

- **报表生成**
  - 个人报表：单个会员的训练报告
  - 汇总报表：教练整体工作统计
  - 对比报表：会员间训练数据对比
  - 导出功能：支持PDF、Excel格式导出

**验收标准**：
- 查询响应时间小于3秒
- 支持1年以上历史数据查询
- 统计准确率100%
- 报表生成时间小于10秒

## 非功能性需求分析

### 性能需求
- **响应时间**：
  - 页面加载时间：首屏<3秒，后续页面<1秒
  - 数据查询时间：简单查询<1秒，复杂查询<3秒
  - 数据保存时间：单次保存<2秒
  - 报表生成时间：<10秒

- **并发能力**：
  - 支持10个教练同时使用
  - 支持50个会员数据并发访问
  - 数据库连接池：最大20个连接

- **存储容量**：
  - 支持1000+会员数据存储
  - 支持10000+训练记录存储
  - 本地数据库大小限制：2GB
  - 单次训练记录大小：<100KB

### 可用性需求
- **界面友好性**：
  - 符合平板操作习惯的UI设计
  - 大按钮设计，最小点触面积44px
  - 清晰的视觉层次和信息架构
  - 支持横屏和竖屏切换

- **操作便捷性**：
  - 常用功能3步内完成
  - 支持快捷键和手势操作
  - 智能表单填充和数据联想
  - 错误操作撤销功能

- **学习成本**：
  - 新用户15分钟内掌握基本操作
  - 提供操作指南和视频教程
  - 关键功能有操作提示
  - 错误消息清晰易懂

### 可靠性需求
- **系统稳定性**：
  - 连续使用8小时无崩溃
  - 内存占用稳定，无内存泄漏
  - 网络断开时仍能正常使用
  - 异常情况自动恢复

- **数据完整性**：
  - 数据保存成功率99.9%
  - 自动数据校验和修复
  - 操作日志完整记录
  - 数据备份和恢复机制

- **容错能力**：
  - 单个模块故障不影响整体使用
  - 网络异常时自动重连
  - 数据损坏时自动修复
  - 用户操作错误时友好提示

### 安全性需求
- **身份认证**：
  - 强密码策略强制执行
  - 会话超时自动登出
  - 登录失败次数限制
  - 操作日志详细记录

- **数据保护**：
  - 敏感数据加密存储
  - 数据传输HTTPS加密
  - 访问权限严格控制
  - 数据备份加密保护

- **系统安全**：
  - SQL注入防护
  - XSS攻击防护
  - CSRF攻击防护
  - 文件上传安全检查

### 兼容性需求
- **设备兼容**：
  - Android 7.0以上系统
  - 分辨率支持：1024x768以上
  - 内存要求：2GB以上
  - 存储空间：500MB可用空间

- **浏览器兼容**：
  - Chrome 80+
  - Firefox 75+
  - Edge 80+
  - Safari 13+(如需要)

- **网络环境**：
  - 支持Wi-Fi和4G网络
  - 网络断开时离线使用
  - 低网速下正常加载
  - 网络恢复时自动同步

## 约束条件与假设

### 技术约束
- 必须使用SQLite作为本地数据库
- 必须支持Android平板设备
- 必须实现离线使用功能
- 必须支持触控操作优化

### 业务约束
- 仅限私人健身教练使用
- 不涉及会员直接使用功能
- 不包含支付和商务功能
- 不涉及会员数据对外分享

### 项目假设
- 教练具备基本的平板操作能力
- 健身房提供稳定的Wi-Fi网络
- 会员配合完成训练记录和签字
- 管理员定期进行数据备份维护

## 功能模块设计

### 1. 用户权限管理
**管理员角色**
- 默认账号: `liyawei123` 密码: `123liyawei`
- 权限: 教练账户管理、会员管理、训练计划模板管理、训练日志查看、教练权限分配

**教练员角色**
- 权限: 修改个人密码、会员查询/新增、训练日志创建/查看、训练计划模板查看
- 会员权限: 可查看和服务所有会员（除非被管理员限制为专属教练）

### 2. 会员管理模块
**会员列表页**
- 显示字段: 姓名、电话、性别、年龄、教练权限状态
- 操作按钮: 上课、会员详情、新增会员、权限管理
- 筛选功能: 我的会员/所有会员切换

**会员信息页**
- 基础信息: 姓名、电话、性别、年龄
- 详细信息: 体征信息、健康历史、运动禁忌
- 教练权限: 专属教练设置、权限状态显示

### 3. 训练计划模板库
**模板列表页**
- 显示字段: 计划名称、课程分类、功能说明、禁忌条件
- 课程分类: 力量抗阻、综合体能、功能性体能
- 操作按钮: 计划详情、新增模板

**新增模板页**
- 基础信息: 计划名称、课程分类、创建人、功能说明、禁忌条件
- 训练内容配置:
  - 热身激活: 1-6个动作
  - 主体训练: 1-30个动作  
  - 拉伸松解: 1-12个动作

### 4. 训练日志核心模块
**训练计时系统**
- **开始上课计时时钟**
  - 训练开始/暂停/继续/结束按钮
  - 实时显示训练总时长 (时:分:秒)
  - 训练状态指示器 (进行中/暂停/结束)
  - 定时提醒设置 (音量调节、静音开关)
- **时间数据显示面板**
  - 上课开始时间显示 (时:分格式)
  - 预计结束时间显示 (时:分格式)
  - 当前训练时长显示 (时:分:秒格式)
  - 历史平均训练时长对比
  - 时间数据实时更新
- **时间数据管理**
  - 训练开始时间自动记录
  - 训练结束时间自动记录
  - 课程总时长自动计算
  - 历史时间数据统计分析

**课前准备**
- 会员基础信息展示（同步会员信息页）
- 当日运动状态细项查询

**当日课程计划**
- 手动配置训练动作
- 一键调用模板库计划

**训练记录结构**
- **热身激活部分** (1-6个动作)
  - 每动作1-3组
  - 每组的记录项: 重量kg/强度% + 次数reps/时长S
  
- **主体训练部分** (1-30个动作)
  - 每动作1-12组
  - 每组的记录项: 重量kg/强度% + 次数reps/时长S + 组后休息时长S
  
- **拉伸松解部分** (1-12个动作)  
  - 每动作1-3组
  - 每组的记录项: 重量kg/强度% + 次数reps/时长S

**训练总结评价**
- 课程完成度% (0-100)
- 会员感受强度% (0-100)  
- 会员感受难度% (0-100)
- 会员训练表现评分 (1-100)
- 教练总结文字
- 会员课程评分 (1-100)
- 会员反馈文字
- 电子签字板 (教练+会员签字)
- 确认提交保存

## 数据表设计要点

### 用户表 (users)
```sql
id, username, password, role, name, created_at
```

### 会员表 (members)  
```sql
id, name, phone, gender, age, health_info, medical_restrictions, created_at
```

### 训练模板表 (training_templates)
```sql
id, name, category, description, restrictions, creator_id, template_content, created_at
```

### 训练日志表 (training_logs)
```sql
id, member_id, coach_id, date, plan_content, completion_rate, member_intensity, 
member_difficulty, member_performance, coach_summary, member_rating, 
member_feedback, coach_signature, member_signature, training_duration, 
training_start_time, training_end_time, created_at
```

### 训练记录详情表 (training_details)
```sql
id, log_id, phase, exercise_name, set_number, weight_intensity, 
reps_duration, rest_time, created_at
```

## 页面路由结构
```
/login - 登录页
/dashboard - 主控制台
/members - 会员管理
/members/new - 新增会员
/members/:id - 会员详情
/templates - 训练模板库
/templates/new - 新增模板
/training/:member_id - 训练日志页面
/training/:id/timer - 训练计时器页面
/training/:id/time-data - 训练时间数据页面
/logs - 历史训练记录
```

## 详细功能规格说明

### 登录认证模块
**登录页面**
- 输入框: 用户名、密码
- 登录按钮: 验证用户身份
- 记住登录状态: 7天免登录
- 错误提示: 用户名或密码错误
- 防暴力破解: 5次错误后锁定30分钟

**权限控制**
- 路由守卫: 未登录自动跳转登录页
- 角色验证: 根据用户角色显示不同菜单
- 会话管理: 2小时无操作自动退出

### 会员管理详细规格

**会员列表页面**
- 搜索功能: 支持姓名、电话模糊搜索
- 分页显示: 每页20条记录
- 排序功能: 按创建时间、姓名排序
- 快速筛选: 性别、年龄段筛选
- 批量操作: 批量删除(仅管理员)

**会员信息表单**
- 必填字段: 姓名、电话、性别、年龄
- 电话验证: 11位手机号格式验证
- 年龄限制: 16-80岁范围验证
- 体征信息: 身高(cm)、体重(kg)、BMI自动计算
- 健康历史: 多行文本输入，最多500字
- 运动禁忌: 复选框选择常见禁忌项+自定义输入
- 数据保存: 实时保存草稿，防止数据丢失

### 训练计划模板库详细规格

**模板列表功能**
- 分类筛选: 力量抗阻/综合体能/功能性体能
- 搜索功能: 模板名称、功能说明搜索
- 预览功能: 鼠标悬停显示模板详情
- 使用统计: 显示模板被使用次数
- 收藏功能: 教练可收藏常用模板

**模板编辑器**
- 拖拽排序: 动作顺序可拖拽调整
- 动作库: 预设常用健身动作库
- 自定义动作: 支持添加新动作到动作库
- 模板预览: 实时预览模板效果
- 参数配置: 默认组数、次数、重量等参数设置
- 版本管理: 模板修改历史记录

### 训练日志核心功能详细规格

**训练日志页面布局**
- 顶部区域: 计时器控制面板 + 时间数据显示
- 左侧区域: 会员信息、课程计划选择
- 中间区域: 训练记录表单(占70%屏幕宽度)
- 右侧区域: 快速操作工具栏

**时间数据显示区域**
- 开始时间卡片: 显示训练开始时间，实时更新
- 预计结束卡片: 基于历史数据计算预计结束时间
- 当前时长卡片: 显示实时训练时长，每秒更新
- 历史对比卡片: 显示与历史平均时长的对比

**实时数据录入**
- 自动保存: 每30秒自动保存一次
- 快捷输入: 数字键盘快速输入重量/次数
- 计时器功能: 内置休息时间倒计时
- 语音输入: 支持语音录入总结内容
- 数据验证: 实时验证数据合理性

**训练记录表格**
- 动态表格: 根据动作数量自动调整表格行数
- 单元格类型: 
  - 重量/强度选择: 单选按钮切换
  - 次数/时长选择: 单选按钮切换
  - 数值输入: 数字键盘输入
  - 休息时间: 计时器组件
- 行操作: 增加组数、删除组数、复制上组数据
- 批量操作: 批量填充相同数值

**训练阶段管理**
- 阶段切换: Tab页切换热身/主体/拉伸
- 进度指示: 显示当前阶段完成进度
- 阶段统计: 各阶段用时、完成度统计
- 快速跳转: 一键跳转到指定阶段

### 评价签字模块详细规格

**评价表单**
- 滑块组件: 百分比数值用滑块选择
- 评分组件: 1-100分用星级+数字输入
- 文本输入: 支持富文本编辑器
- 字数限制: 总结内容最多1000字
- 表情评价: 快速选择表情符号

**电子签字板**
- Canvas实现: HTML5 Canvas绘制
- 签字区域: 300x150px签字区域
- 画笔设置: 可调节线条粗细、颜色
- 操作功能: 清空、撤销、重做
- 签字验证: 检查是否已签字
- 图片保存: 签字转换为base64图片存储

### 数据存储详细设计

**SQLite数据库结构**
```sql
-- 用户表
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'coach') NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(11),
    status TINYINT DEFAULT 1,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 会员表
CREATE TABLE members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(11) UNIQUE NOT NULL,
    gender ENUM('male', 'female') NOT NULL,
    age INTEGER NOT NULL,
    height DECIMAL(5,2),
    weight DECIMAL(5,2),
    bmi DECIMAL(4,2),
    health_history TEXT,
    medical_restrictions TEXT,
    emergency_contact VARCHAR(100),
    emergency_phone VARCHAR(11),
    coach_id INTEGER,
    access_mode ENUM('shared', 'exclusive') DEFAULT 'shared',
    status TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (coach_id) REFERENCES users(id)
);

-- 会员教练权限关联表
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

-- 训练模板表
CREATE TABLE training_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(200) NOT NULL,
    category ENUM('strength', 'comprehensive', 'functional') NOT NULL,
    description TEXT,
    restrictions TEXT,
    creator_id INTEGER NOT NULL,
    template_content JSON NOT NULL,
    use_count INTEGER DEFAULT 0,
    is_active TINYINT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES users(id)
);

-- 训练日志表
CREATE TABLE training_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    member_id INTEGER NOT NULL,
    coach_id INTEGER NOT NULL,
    training_date DATE NOT NULL,
    template_id INTEGER,
    pre_training_status TEXT,
    completion_rate INTEGER DEFAULT 0,
    member_intensity_feeling INTEGER,
    member_difficulty_feeling INTEGER,
    member_performance_score INTEGER,
    coach_summary TEXT,
    member_rating INTEGER,
    member_feedback TEXT,
    coach_signature_data TEXT,
    member_signature_data TEXT,
    total_duration INTEGER,
    status ENUM('draft', 'completed') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (member_id) REFERENCES members(id),
    FOREIGN KEY (coach_id) REFERENCES users(id),
    FOREIGN KEY (template_id) REFERENCES training_templates(id)
);

-- 训练详情表
CREATE TABLE training_details (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    log_id INTEGER NOT NULL,
    phase ENUM('warmup', 'main', 'stretch') NOT NULL,
    exercise_name VARCHAR(200) NOT NULL,
    exercise_order INTEGER NOT NULL,
    set_number INTEGER NOT NULL,
    weight_or_intensity DECIMAL(6,2),
    weight_unit ENUM('kg', 'percent') DEFAULT 'kg',
    reps_or_duration INTEGER,
    duration_unit ENUM('reps', 'seconds') DEFAULT 'reps',
    rest_time INTEGER,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (log_id) REFERENCES training_logs(id)
);

-- 动作库表
CREATE TABLE exercises (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(200) NOT NULL,
    category VARCHAR(100),
    muscle_groups TEXT,
    equipment VARCHAR(100),
    description TEXT,
    video_url VARCHAR(500),
    image_url VARCHAR(500),
    difficulty_level INTEGER DEFAULT 1,
    is_custom TINYINT DEFAULT 0,
    creator_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (creator_id) REFERENCES users(id)
);
```

**数据关系说明**
- 一个教练可以管理多个会员 (1:N)
- 一个会员可以有多条训练日志 (1:N)
- 一条训练日志包含多个训练详情 (1:N)
- 一个模板可以被多次使用 (1:N)
- 一个会员可以被多个教练服务 (M:N，通过member_coach_permissions表)
- 一个教练可以服务多个会员 (M:N，通过member_coach_permissions表)

## 技术架构详细设计

### 前端技术栈
- **框架**: Vue.js 3 + TypeScript
- **UI组件库**: Element Plus (适配平板操作)
- **状态管理**: Pinia
- **路由管理**: Vue Router 4
- **HTTP客户端**: Axios
- **图表组件**: ECharts (训练数据可视化)
- **签字组件**: Signature Pad
- **计时器组件**: 自定义计时器组件 + Web Audio API (声音提醒)
- **PWA支持**: 支持离线使用和应用安装

### 后端技术栈
- **运行时**: Node.js + Express.js
- **数据库**: SQLite3 + better-sqlite3
- **认证**: JWT Token
- **文件上传**: Multer
- **API文档**: Swagger
- **数据验证**: Joi
- **日志记录**: Winston

### 部署方案
- **容器化**: Docker部署
- **反向代理**: Nginx
- **SSL证书**: Let's Encrypt
- **数据备份**: 定时SQLite数据库备份
- **监控**: PM2进程守护

## 用户体验设计要点

### 平板适配设计
- **屏幕适配**: 支持横屏1024x768以上分辨率
- **触控优化**: 按钮最小点触面积44px
- **手势支持**: 支持滑动切换、双指缩放
- **输入优化**: 虚拟键盘适配、语音输入

### 操作流程优化
- **快速录入**: 数字输入采用九宫格布局
- **智能提示**: 根据历史数据智能提示常用数值
- **批量操作**: 支持批量复制、快速填充
- **快捷键**: 支持常用操作快捷键

### 性能优化要求
- **页面加载**: 首屏加载时间<3秒
- **操作响应**: 用户操作响应时间<200ms
- **数据同步**: 本地缓存+后台同步机制
- **内存管理**: 长时间使用内存占用<100MB

## 测试计划

### 功能测试
- 用户登录认证测试
- 会员管理CRUD测试
- 训练日志记录完整性测试
- 训练计时系统测试
- 时间数据显示准确性测试
- 模板库功能测试
- 数据同步测试

### 兼容性测试
- Android平板浏览器兼容(Chrome, Edge)
- 不同分辨率屏幕适配测试
- 触控操作响应测试
- 离线功能测试

### 性能测试
- 大量数据加载性能测试
- 长时间使用稳定性测试
- 内存泄漏检测
- 数据库查询性能测试
- 计时器精度测试
- 时间数据实时更新性能测试

### 安全测试
- SQL注入防护测试
- XSS攻击防护测试
- 身份认证安全测试
- 数据传输加密测试

## 开发优先级与里程碑

### 第一阶段 (2周) - 核心功能MVP
- [ ] 用户登录认证系统
- [ ] 基础会员管理功能
- [ ] 简化版训练日志记录
- [ ] SQLite数据库搭建
- [ ] 基础UI界面

### 第二阶段 (2周) - 完善核心功能
- [ ] 训练模板库基础功能
- [ ] 训练日志完整记录功能
- [ ] 训练计时系统（计时器 + 时间数据显示）
- [ ] 电子签字功能
- [ ] 数据验证和错误处理
- [ ] 响应式设计优化

### 第三阶段 (1周) - 用户体验优化
- [ ] 界面美化和交互优化
- [ ] 性能优化和缓存机制
- [ ] 数据导出功能
- [ ] 操作指南和帮助文档

### 第四阶段 (1周) - 测试和部署
- [ ] 功能测试和bug修复
- [ ] 性能测试和优化
- [ ] 部署配置和上线
- [ ] 用户培训和反馈收集

## 风险评估与应对

### 技术风险
- **数据丢失**: 实施多重数据备份策略
- **性能瓶颈**: 提前进行性能测试和优化
- **兼容性问题**: 在目标设备上进行充分测试

### 业务风险
- **用户接受度**: 提供详细培训和操作指南
- **数据迁移**: 提供从纸质记录到电子记录的迁移方案
- **法律合规**: 确保数据隐私保护符合相关法规

### 项目风险
- **开发周期**: 采用敏捷开发，分阶段交付
- **需求变更**: 建立需求变更管理流程
- **团队协作**: 建立清晰的开发规范和沟通机制