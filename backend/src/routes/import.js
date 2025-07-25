const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const ExcelImporter = require('../utils/excelImporter')
const { authenticateToken, requireAdmin } = require('../middleware/auth')

const router = express.Router()

// 配置文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../uploads')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
      'application/octet-stream'
    ]
    
    if (allowedTypes.includes(file.mimetype) || file.originalname.endsWith('.xlsx') || file.originalname.endsWith('.xls')) {
      cb(null, true)
    } else {
      cb(new Error('只支持Excel文件格式 (.xlsx, .xls)'), false)
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
})

// 获取导入模板
router.get('/templates/:type', (req, res) => {
  const { type } = req.params
  
  const templates = {
    members: {
      headers: ['姓名', '手机号', '性别', '年龄', '身高(cm)', '体重(kg)', '健康历史', '运动禁忌', '紧急联系人', '紧急电话', '备注', '访问模式', '教练用户名'],
      description: '会员信息导入模板，必填字段：姓名、手机号、性别、年龄。可选字段：身高、体重、健康历史、运动禁忌、紧急联系人、紧急电话、备注、访问模式、教练用户名',
      example: [
        ['张三', '13800138001', 'male', 28, 175.5, 70.2, '无特殊病史', '无运动禁忌', '张父', '13900139001', '健身爱好者，目标增肌', 'shared', 'coach001'],
        ['李四', '13800138002', 'female', 32, 165.0, 58.5, '无特殊病史', '无运动禁忌', '李母', '13900139002', '产后恢复，目标减脂塑形', 'exclusive', 'coach002']
      ]
    },
    coaches: {
      headers: ['用户名', '姓名', '密码', '角色', '手机号', '状态'],
      description: '教练信息导入模板，必填字段：用户名、姓名、密码、角色、手机号、状态',
      example: [
        ['coach001', '王教练', '123456', 'coach', '13800138001', 1],
        ['coach002', '张教练', '123456', 'coach', '13800138002', 1],
        ['admin001', '李管理员', '123456', 'admin', '13800138003', 1]
      ]
    },
    templates: {
      headers: ['模板名称', '模板分类', '功能说明', '禁忌条件', '训练内容(JSON格式)'],
      description: '训练模板导入模板，必填字段：模板名称、模板分类、功能说明、禁忌条件、训练内容',
      example: [
        ['初级力量训练', 'strength', '适合初学者的基础力量训练计划，重点培养正确的动作模式', '无特殊禁忌，建议在教练指导下进行', '{"warmup":[{"name":"关节活动","description":"全身关节活动","variable1":"intensity","variable2":"duration"}],"main":[{"name":"深蹲","description":"基础下肢力量训练","variable1":"weight","variable2":"reps"}],"stretch":[{"name":"静态拉伸","description":"全身肌肉拉伸","variable1":"intensity","variable2":"duration"}]}'],
        ['上肢训练', 'strength', '专注于胸、肩、臂部肌肉的训练', '无特殊禁忌', '{"warmup":[{"name":"肩部环绕","description":"肩部热身","variable1":"intensity","variable2":"duration"}],"main":[{"name":"卧推","description":"胸部力量训练","variable1":"weight","variable2":"reps"}],"stretch":[{"name":"胸部拉伸","description":"胸部肌肉拉伸","variable1":"intensity","variable2":"duration"}]}']
      ]
    },
    exercises: {
      headers: ['动作名称', '类别', '描述', '目标肌群', '难度等级', '注意事项', '变量1类型', '变量2类型'],
      description: '训练动作导入模板，必填字段：动作名称、类别、描述、目标肌群、难度等级、注意事项、变量1类型、变量2类型',
      example: [
        ['深蹲', 'strength', '经典的下肢力量训练动作，主要锻炼大腿前侧肌群', '股四头肌、臀大肌、核心肌群', 'intermediate', '注意膝盖不要超过脚尖', 'weight', 'reps'],
        ['卧推', 'strength', '上肢推举动作，主要锻炼胸部肌群', '胸大肌、三角肌前束、肱三头肌', 'intermediate', '注意肩胛骨收紧', 'weight', 'reps'],
        ['跑步', 'cardio', '有氧运动，提升心肺功能', '全身肌群', 'beginner', '注意运动强度，循序渐进', 'intensity', 'duration']
      ]
    }
  }
  
  const template = templates[type]
  if (!template) {
    return res.status(400).json({
      error: true,
      message: '不支持的导入类型'
    })
  }
  
  res.json({
    success: true,
    data: template
  })
})

// 下载模板文件
router.get('/download/:type', (req, res) => {
  const { type } = req.params
  
  const templateFiles = {
    members: 'members_template_optimized.xlsx',
    coaches: 'coaches_template_optimized.xlsx',
    templates: 'templates_template_optimized.xlsx',
    exercises: 'exercises_template_optimized.xlsx'
  }
  
  const fileName = templateFiles[type]
  if (!fileName) {
    return res.status(400).json({
      error: true,
      message: '不支持的模板类型'
    })
  }
  
  const filePath = path.join(__dirname, '../sample-templates', fileName)
  
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      error: true,
      message: '模板文件不存在'
    })
  }
  
  // 设置响应头
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)
  
  // 发送文件
  res.sendFile(filePath)
})

// 批量导入会员
router.post('/members', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: true,
        message: '请上传Excel文件'
      })
    }

    const importer = new ExcelImporter()
    const sheets = importer.parseExcelFile(req.file.path)
    
    // 查找会员数据工作表
    const memberSheet = Object.keys(sheets).find(sheet => 
      sheet.toLowerCase().includes('会员') || 
      sheet.toLowerCase().includes('member') ||
      sheet.toLowerCase().includes('members')
    ) || Object.keys(sheets)[0]
    
    const data = sheets[memberSheet]
    
    if (!importer.validateData(data, 'members')) {
      return res.status(400).json({
        error: true,
        message: 'Excel文件格式不正确，请使用正确的会员导入模板'
      })
    }
    
    await importer.importMembers(data, req.user.id)
    const results = importer.getResults()
    
    // 删除临时文件
    fs.unlinkSync(req.file.path)
    
    res.json({
      success: true,
      message: '会员导入完成',
      data: results
    })
    
  } catch (error) {
    console.error('会员导入错误:', error)
    
    // 删除临时文件
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path)
    }
    
    res.status(500).json({
      error: true,
      message: error.message
    })
  }
})

// 批量导入教练
router.post('/coaches', authenticateToken, requireAdmin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: true,
        message: '请上传Excel文件'
      })
    }

    const importer = new ExcelImporter()
    const sheets = importer.parseExcelFile(req.file.path)
    
    // 查找教练数据工作表
    const coachSheet = Object.keys(sheets).find(sheet => 
      sheet.toLowerCase().includes('教练') || 
      sheet.toLowerCase().includes('coach') ||
      sheet.toLowerCase().includes('coaches')
    ) || Object.keys(sheets)[0]
    
    const data = sheets[coachSheet]
    
    if (!importer.validateData(data, 'coaches')) {
      return res.status(400).json({
        error: true,
        message: 'Excel文件格式不正确，请使用正确的教练导入模板'
      })
    }
    
    await importer.importCoaches(data)
    const results = importer.getResults()
    
    // 删除临时文件
    fs.unlinkSync(req.file.path)
    
    res.json({
      success: true,
      message: '教练导入完成',
      data: results
    })
    
  } catch (error) {
    console.error('教练导入错误:', error)
    
    // 删除临时文件
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path)
    }
    
    res.status(500).json({
      error: true,
      message: error.message
    })
  }
})

// 批量导入模板
router.post('/templates', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: true,
        message: '请上传Excel文件'
      })
    }

    const importer = new ExcelImporter()
    const sheets = importer.parseExcelFile(req.file.path)
    
    // 查找模板数据工作表
    const templateSheet = Object.keys(sheets).find(sheet => 
      sheet.toLowerCase().includes('模板') || 
      sheet.toLowerCase().includes('template') ||
      sheet.toLowerCase().includes('templates')
    ) || Object.keys(sheets)[0]
    
    const data = sheets[templateSheet]
    
    if (!importer.validateData(data, 'templates')) {
      return res.status(400).json({
        error: true,
        message: 'Excel文件格式不正确，请使用正确的模板导入模板'
      })
    }
    
    await importer.importTemplates(data, req.user.id)
    const results = importer.getResults()
    
    // 删除临时文件
    fs.unlinkSync(req.file.path)
    
    res.json({
      success: true,
      message: '模板导入完成',
      data: results
    })
    
  } catch (error) {
    console.error('模板导入错误:', error)
    
    // 删除临时文件
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path)
    }
    
    res.status(500).json({
      error: true,
      message: error.message
    })
  }
})

// 批量导入动作
router.post('/exercises', authenticateToken, requireAdmin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: true,
        message: '请上传Excel文件'
      })
    }

    const importer = new ExcelImporter()
    const sheets = importer.parseExcelFile(req.file.path)
    
    // 查找动作数据工作表
    const exerciseSheet = Object.keys(sheets).find(sheet => 
      sheet.toLowerCase().includes('动作') || 
      sheet.toLowerCase().includes('exercise') ||
      sheet.toLowerCase().includes('exercises')
    ) || Object.keys(sheets)[0]
    
    const data = sheets[exerciseSheet]
    
    if (!importer.validateData(data, 'exercises')) {
      return res.status(400).json({
        error: true,
        message: 'Excel文件格式不正确，请使用正确的动作导入模板'
      })
    }
    
    await importer.importExercises(data)
    const results = importer.getResults()
    
    // 删除临时文件
    fs.unlinkSync(req.file.path)
    
    res.json({
      success: true,
      message: '动作导入完成',
      data: results
    })
    
  } catch (error) {
    console.error('动作导入错误:', error)
    
    // 删除临时文件
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path)
    }
    
    res.status(500).json({
      error: true,
      message: error.message
    })
  }
})

// 错误处理中间件
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: true,
        message: '文件大小不能超过10MB'
      })
    }
  }
  
  console.error('导入路由错误:', error)
  res.status(500).json({
    error: true,
    message: error.message || '导入失败'
  })
})

module.exports = router 