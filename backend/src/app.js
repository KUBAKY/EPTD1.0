const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const path = require('path')

// 导入路由
const authRoutes = require('./routes/auth')
const memberRoutes = require('./routes/members-simple')
const dashboardRoutes = require('./routes/dashboard')
const templateRoutes = require('./routes/templates')
const trainingRoutes = require('./routes/training')
const userRoutes = require('./routes/users')
const importRoutes = require('./routes/import')
const courseRoutes = require('./routes/courses')

// 导入中间件
const { authenticateToken } = require('./middleware/auth')
const errorHandler = require('./middleware/errorHandler')

const app = express()
const PORT = process.env.PORT || 3001

// 中间件
app.use(helmet())
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true
}))
app.use(morgan('combined'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))

// API路由
app.use('/api/auth', authRoutes)
app.use('/api/dashboard', authenticateToken, dashboardRoutes)
app.use('/api/members', authenticateToken, memberRoutes)
app.use('/api/templates', authenticateToken, templateRoutes)
app.use('/api/training', authenticateToken, trainingRoutes)
app.use('/api/users', authenticateToken, userRoutes)
app.use('/api/import', importRoutes)
app.use('/api/courses', authenticateToken, courseRoutes)

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  })
})

// 错误处理中间件
app.use(errorHandler)

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: '请求的资源不存在'
  })
})

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 WellMotion Backend Server running on port ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`)
})

module.exports = app 