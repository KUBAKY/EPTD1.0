const express = require('express')
const { loginUser, getCurrentUser, authenticateToken } = require('../middleware/auth')

const router = express.Router()

// 用户登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body

    // 验证输入
    if (!username || !password) {
      return res.status(400).json({
        error: true,
        message: '用户名和密码不能为空'
      })
    }

    // 验证登录
    const result = await loginUser(username, password)

    if (!result.success) {
      return res.status(401).json({
        error: true,
        message: result.message
      })
    }

    // 返回成功响应
    res.json({
      success: true,
      message: '登录成功',
      token: result.token,
      user: result.user
    })
  } catch (error) {
    console.error('登录错误:', error)
    res.status(500).json({
      error: true,
      message: '登录失败，请重试'
    })
  }
})

// 获取当前用户信息
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await getCurrentUser(req.user.id)
    
    if (!user) {
      return res.status(404).json({
        error: true,
        message: '用户不存在'
      })
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        phone: user.phone
      }
    })
  } catch (error) {
    console.error('获取用户信息错误:', error)
    res.status(500).json({
      error: true,
      message: '获取用户信息失败'
    })
  }
})

// 用户登出
router.post('/logout', (req, res) => {
  // 由于使用JWT，客户端只需要删除token即可
  res.json({
    success: true,
    message: '登出成功'
  })
})

module.exports = router 