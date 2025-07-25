const ExcelImporter = require('./src/utils/excelImporter')
const path = require('path')

async function testImport() {
  console.log('🧪 开始测试Excel导入功能...')
  
  const importer = new ExcelImporter()
  
  // 测试会员数据验证
  console.log('\n📋 测试会员数据验证:')
  const memberData = [
    ['姓名', '手机号', '性别', '年龄', '身高(cm)', '体重(kg)', '健康历史', '运动禁忌', '紧急联系人', '紧急电话', '备注', '访问模式', '教练用户名'],
    ['张三', '13800138001', 'male', 28, 175.5, 70.2, '无特殊病史', '无运动禁忌', '张父', '13900139001', '健身爱好者', 'shared', 'coach001']
  ]
  
  const isValidMembers = importer.validateData(memberData, 'members')
  console.log('会员数据验证结果:', isValidMembers ? '✅ 通过' : '❌ 失败')
  
  // 测试教练数据验证
  console.log('\n👨‍🏫 测试教练数据验证:')
  const coachData = [
    ['用户名', '姓名', '密码', '角色', '手机号', '状态'],
    ['coach001', '王教练', '123456', 'coach', '13800138001', 1]
  ]
  
  const isValidCoaches = importer.validateData(coachData, 'coaches')
  console.log('教练数据验证结果:', isValidCoaches ? '✅ 通过' : '❌ 失败')
  
  // 测试模板数据验证
  console.log('\n📋 测试模板数据验证:')
  const templateData = [
    ['模板名称', '模板分类', '功能说明', '禁忌条件', '训练内容(JSON格式)'],
    ['初级力量训练', 'strength', '适合初学者的基础力量训练', '无特殊禁忌', '{"warmup":[],"main":[],"stretch":[]}']
  ]
  
  const isValidTemplates = importer.validateData(templateData, 'templates')
  console.log('模板数据验证结果:', isValidTemplates ? '✅ 通过' : '❌ 失败')
  
  // 测试动作数据验证
  console.log('\n🏋️ 测试动作数据验证:')
  const exerciseData = [
    ['动作名称', '类别', '描述', '目标肌群', '难度等级', '注意事项', '变量1类型', '变量2类型'],
    ['深蹲', 'strength', '经典的下肢力量训练动作', '股四头肌、臀大肌', 'intermediate', '注意膝盖不要超过脚尖', 'weight', 'reps']
  ]
  
  const isValidExercises = importer.validateData(exerciseData, 'exercises')
  console.log('动作数据验证结果:', isValidExercises ? '✅ 通过' : '❌ 失败')
  
  // 测试字段映射
  console.log('\n🔄 测试字段映射:')
  const headers = ['姓名', '手机号', '性别', '年龄', '身高(cm)', '体重(kg)', '健康历史', '运动禁忌', '紧急联系人', '紧急电话', '备注', '访问模式', '教练用户名']
  const row = ['张三', '13800138001', 'male', 28, 175.5, 70.2, '无特殊病史', '无运动禁忌', '张父', '13900139001', '健身爱好者', 'shared', 'coach001']
  
  const mappedData = importer.mapRowToObject(headers, row)
  console.log('字段映射结果:', mappedData)
  
  console.log('\n✅ 测试完成！')
}

// 运行测试
if (require.main === module) {
  testImport().catch(console.error)
}

module.exports = { testImport } 