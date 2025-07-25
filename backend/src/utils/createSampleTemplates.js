const XLSX = require('xlsx')
const path = require('path')
const fs = require('fs')

// 确保目录存在
const templatesDir = path.join(__dirname, '../sample-templates')
if (!fs.existsSync(templatesDir)) {
  fs.mkdirSync(templatesDir, { recursive: true })
}

// 创建会员信息模板
function createMembersTemplate() {
  const headers = [
    '姓名', '手机号', '性别', '年龄', '身高(cm)', '体重(kg)', 
    '健康历史', '运动禁忌', '紧急联系人', '紧急电话', '备注', 
    '访问模式', '教练用户名'
  ]
  
  const exampleData = [
    ['张三', '13800138001', 'male', 28, 175.5, 70.2, 
     '无特殊病史', '无运动禁忌', '张父', '13900139001', '健身爱好者，目标增肌', 
     'shared', 'coach001'],
    ['李四', '13800138002', 'female', 32, 165.0, 58.5, 
     '无特殊病史', '无运动禁忌', '李母', '13900139002', '产后恢复，目标减脂塑形', 
     'exclusive', 'coach002']
  ]
  
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...exampleData])
  
  // 设置列宽
  const colWidths = [
    { wch: 12 }, // 姓名
    { wch: 15 }, // 手机号
    { wch: 8 },  // 性别
    { wch: 8 },  // 年龄
    { wch: 12 }, // 身高
    { wch: 12 }, // 体重
    { wch: 20 }, // 健康历史
    { wch: 20 }, // 运动禁忌
    { wch: 15 }, // 紧急联系人
    { wch: 15 }, // 紧急电话
    { wch: 30 }, // 备注
    { wch: 12 }, // 访问模式
    { wch: 15 }  // 教练用户名
  ]
  worksheet['!cols'] = colWidths
  
  XLSX.utils.book_append_sheet(workbook, worksheet, '会员信息')
  XLSX.writeFile(workbook, path.join(templatesDir, 'members_template_optimized.xlsx'))
  
  console.log('✅ 会员信息模板已创建')
}

// 创建教练信息模板
function createCoachesTemplate() {
  const headers = [
    '用户名', '姓名', '密码', '角色', '手机号', '状态'
  ]
  
  const exampleData = [
    ['coach001', '王教练', '123456', 'coach', '13800138001', 1],
    ['coach002', '张教练', '123456', 'coach', '13800138002', 1],
    ['admin001', '李管理员', '123456', 'admin', '13800138003', 1]
  ]
  
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...exampleData])
  
  // 设置列宽
  const colWidths = [
    { wch: 15 }, // 用户名
    { wch: 12 }, // 姓名
    { wch: 12 }, // 密码
    { wch: 10 }, // 角色
    { wch: 15 }, // 手机号
    { wch: 8 }   // 状态
  ]
  worksheet['!cols'] = colWidths
  
  XLSX.utils.book_append_sheet(workbook, worksheet, '教练信息')
  XLSX.writeFile(workbook, path.join(templatesDir, 'coaches_template_optimized.xlsx'))
  
  console.log('✅ 教练信息模板已创建')
}

// 创建训练模板模板
function createTemplatesTemplate() {
  const headers = [
    '模板名称', '模板分类', '功能说明', '禁忌条件', '训练内容(JSON格式)'
  ]
  
  const exampleData = [
    ['初级力量训练', 'strength', '适合初学者的基础力量训练计划，重点培养正确的动作模式', 
     '无特殊禁忌，建议在教练指导下进行', 
     '{"warmup":[{"name":"关节活动","description":"全身关节活动","variable1":"intensity","variable2":"duration"}],"main":[{"name":"深蹲","description":"基础下肢力量训练","variable1":"weight","variable2":"reps"}],"stretch":[{"name":"静态拉伸","description":"全身肌肉拉伸","variable1":"intensity","variable2":"duration"}]}'],
    ['上肢训练', 'strength', '专注于胸、肩、臂部肌肉的训练', 
     '无特殊禁忌', 
     '{"warmup":[{"name":"肩部环绕","description":"肩部热身","variable1":"intensity","variable2":"duration"}],"main":[{"name":"卧推","description":"胸部力量训练","variable1":"weight","variable2":"reps"}],"stretch":[{"name":"胸部拉伸","description":"胸部肌肉拉伸","variable1":"intensity","variable2":"duration"}]}']
  ]
  
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...exampleData])
  
  // 设置列宽
  const colWidths = [
    { wch: 20 }, // 模板名称
    { wch: 15 }, // 模板分类
    { wch: 40 }, // 功能说明
    { wch: 30 }, // 禁忌条件
    { wch: 80 }  // 训练内容
  ]
  worksheet['!cols'] = colWidths
  
  XLSX.utils.book_append_sheet(workbook, worksheet, '训练模板')
  XLSX.writeFile(workbook, path.join(templatesDir, 'templates_template_optimized.xlsx'))
  
  console.log('✅ 训练模板模板已创建')
}

// 创建训练动作模板
function createExercisesTemplate() {
  const headers = [
    '动作名称', '类别', '描述', '目标肌群', '难度等级', '注意事项', 
    '变量1类型', '变量2类型'
  ]
  
  const exampleData = [
    ['深蹲', 'strength', '经典的下肢力量训练动作，主要锻炼大腿前侧肌群', 
     '股四头肌、臀大肌、核心肌群', 'intermediate', '注意膝盖不要超过脚尖', 
     'weight', 'reps'],
    ['卧推', 'strength', '上肢推举动作，主要锻炼胸部肌群', 
     '胸大肌、三角肌前束、肱三头肌', 'intermediate', '注意肩胛骨收紧', 
     'weight', 'reps'],
    ['跑步', 'cardio', '有氧运动，提升心肺功能', 
     '全身肌群', 'beginner', '注意运动强度，循序渐进', 
     'intensity', 'duration']
  ]
  
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...exampleData])
  
  // 设置列宽
  const colWidths = [
    { wch: 15 }, // 动作名称
    { wch: 12 }, // 类别
    { wch: 40 }, // 描述
    { wch: 25 }, // 目标肌群
    { wch: 12 }, // 难度等级
    { wch: 30 }, // 注意事项
    { wch: 12 }, // 变量1类型
    { wch: 12 }  // 变量2类型
  ]
  worksheet['!cols'] = colWidths
  
  XLSX.utils.book_append_sheet(workbook, worksheet, '训练动作')
  XLSX.writeFile(workbook, path.join(templatesDir, 'exercises_template_optimized.xlsx'))
  
  console.log('✅ 训练动作模板已创建')
}

// 创建说明文档
function createReadmeFile() {
  const readmeContent = `# Excel导入模板说明

## 会员信息模板 (members_template_optimized.xlsx)

### 必填字段：
- 姓名：会员姓名
- 手机号：11位手机号码
- 性别：male(男) 或 female(女)
- 年龄：数字，1-120

### 可选字段：
- 身高(cm)：数字，50-250
- 体重(kg)：数字，20-300
- 健康历史：文本描述
- 运动禁忌：文本描述
- 紧急联系人：联系人姓名
- 紧急电话：联系电话
- 备注：其他备注信息
- 访问模式：shared(共享) 或 exclusive(专属)
- 教练用户名：已存在的教练用户名

### 示例数据：
- 张三，13800138001，male，28，175.5，70.2，无特殊病史，无运动禁忌，张父，13900139001，健身爱好者，shared，coach001

---

## 教练信息模板 (coaches_template_optimized.xlsx)

### 必填字段：
- 用户名：唯一用户名
- 姓名：教练姓名
- 密码：登录密码
- 角色：coach(教练) 或 admin(管理员)
- 手机号：11位手机号码
- 状态：1(活跃) 或 0(非活跃)

### 示例数据：
- coach001，王教练，123456，coach，13800138001，1

---

## 训练模板模板 (templates_template_optimized.xlsx)

### 必填字段：
- 模板名称：模板名称
- 模板分类：strength(力量) / comprehensive(综合) / functional(功能)
- 功能说明：模板功能描述
- 禁忌条件：使用禁忌
- 训练内容：JSON格式的训练内容

### 训练内容JSON格式：
\`\`\`json
{
  "warmup": [
    {
      "name": "动作名称",
      "description": "动作描述",
      "variable1": "weight|intensity|difficulty",
      "variable2": "reps|duration"
    }
  ],
  "main": [...],
  "stretch": [...]
}
\`\`\`

---

## 训练动作模板 (exercises_template_optimized.xlsx)

### 必填字段：
- 动作名称：动作名称
- 类别：strength(力量) / cardio(有氧) / flexibility(柔韧) / functional(功能)
- 描述：动作描述
- 目标肌群：主要锻炼的肌群
- 难度等级：beginner(初级) / intermediate(中级) / advanced(高级)
- 注意事项：动作注意事项
- 变量1类型：weight(重量) / intensity(强度) / difficulty(难度)
- 变量2类型：reps(次数) / duration(时长)

### 示例数据：
- 深蹲，strength，经典的下肢力量训练动作，股四头肌、臀大肌、核心肌群，intermediate，注意膝盖不要超过脚尖，weight，reps

---

## 使用说明

1. 下载对应的Excel模板
2. 按照模板格式填写数据
3. 保存为.xlsx格式
4. 在系统中上传文件进行批量导入
5. 查看导入结果，确认成功导入的数据

## 注意事项

- 请严格按照模板格式填写，不要修改表头
- 必填字段不能为空
- 数据格式要符合要求（如手机号11位、年龄数字等）
- 训练模板的训练内容必须是有效的JSON格式
- 教练用户名必须是系统中已存在的用户名
`

  fs.writeFileSync(path.join(templatesDir, 'README.md'), readmeContent)
  console.log('✅ 说明文档已创建')
}

// 主函数
function createAllTemplates() {
  console.log('🚀 开始创建优化的Excel模板...')
  
  createMembersTemplate()
  createCoachesTemplate()
  createTemplatesTemplate()
  createExercisesTemplate()
  createReadmeFile()
  
  console.log('✅ 所有模板创建完成！')
  console.log('📁 模板文件位置：', templatesDir)
}

// 如果直接运行此脚本
if (require.main === module) {
  createAllTemplates()
}

module.exports = {
  createMembersTemplate,
  createCoachesTemplate,
  createTemplatesTemplate,
  createExercisesTemplate,
  createAllTemplates
} 