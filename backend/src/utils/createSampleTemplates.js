const XLSX = require('xlsx')
const path = require('path')
const fs = require('fs')

// 创建示例模板
function createSampleTemplates() {
  const templatesDir = path.join(__dirname, '../../sample-templates')
  
  // 确保目录存在
  if (!fs.existsSync(templatesDir)) {
    fs.mkdirSync(templatesDir, { recursive: true })
  }

  // 会员信息模板
  const membersData = [
    ['姓名', '手机号', '性别', '年龄', '身高', '体重', 'BMI', '健康史', '运动禁忌', '紧急联系人', '紧急电话', '备注'],
    ['张三', '13800138001', 'male', '28', '175.5', '70.2', '22.8', '无特殊病史', '无运动禁忌', '张父', '13900139001', ''],
    ['李四', '13800138002', 'female', '32', '165.0', '58.5', '21.5', '无特殊病史', '无运动禁忌', '李母', '13900139002', ''],
    ['王五', '13800138003', 'male', '25', '180.0', '75.0', '23.1', '无特殊病史', '无运动禁忌', '王父', '13900139003', '']
  ]

  // 教练信息模板
  const coachesData = [
    ['用户名', '姓名', '手机号', '密码'],
    ['coach001', '王教练', '13800138001', '123456'],
    ['coach002', '张教练', '13800138002', '123456'],
    ['coach003', '刘教练', '13800138003', '123456']
  ]

  // 训练模板模板
  const templatesData = [
    ['模板名称', '分类', '描述', '限制条件', '模板内容'],
    ['基础力量训练', 'strength', '适合初学者的基础力量训练计划', '无特殊禁忌', '{"warmup":[],"main":[],"stretch":[]}'],
    ['上肢训练', 'strength', '专注于胸、肩、臂部肌肉的训练', '无特殊禁忌', '{"warmup":[],"main":[],"stretch":[]}'],
    ['下肢训练', 'strength', '专注于腿部肌肉的训练', '无特殊禁忌', '{"warmup":[],"main":[],"stretch":[]}']
  ]

  // 训练动作模板
  const exercisesData = [
    ['动作名称', '分类', '描述', '目标肌群', '难度等级', '注意事项'],
    ['深蹲', 'strength', '基础下肢力量训练动作', '股四头肌、臀大肌', 'intermediate', '注意膝盖不要超过脚尖'],
    ['卧推', 'strength', '经典胸部力量训练动作', '胸大肌、三角肌前束', 'intermediate', '注意肩胛骨收紧'],
    ['硬拉', 'strength', '全身复合训练动作', '背部、腿部', 'advanced', '注意保持背部挺直'],
    ['引体向上', 'strength', '背部力量训练动作', '背阔肌、二头肌', 'intermediate', '注意控制动作节奏'],
    ['平板支撑', 'functional', '核心稳定性训练', '腹肌、核心肌群', 'beginner', '保持身体成一条直线']
  ]

  // 创建Excel文件
  const templates = [
    { name: '会员信息导入模板', data: membersData, filename: 'members_template.xlsx' },
    { name: '教练信息导入模板', data: coachesData, filename: 'coaches_template.xlsx' },
    { name: '训练模板导入模板', data: templatesData, filename: 'templates_template.xlsx' },
    { name: '训练动作导入模板', data: exercisesData, filename: 'exercises_template.xlsx' }
  ]

  templates.forEach(template => {
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.aoa_to_sheet(template.data)
    
    // 设置列宽
    const colWidths = template.data[0].map(() => ({ wch: 15 }))
    worksheet['!cols'] = colWidths
    
    // 添加工作表
    XLSX.utils.book_append_sheet(workbook, worksheet, '数据')
    
    // 保存文件
    const filePath = path.join(templatesDir, template.filename)
    XLSX.writeFile(workbook, filePath)
    
    console.log(`✅ 已创建 ${template.name}: ${filePath}`)
  })

  console.log('\n📁 示例模板文件已保存到:', templatesDir)
  console.log('📋 您可以使用这些模板文件进行测试导入')
}

// 运行脚本
if (require.main === module) {
  createSampleTemplates()
}

module.exports = { createSampleTemplates } 