const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const sqlite3 = require('sqlite3').verbose()
const path = require('path')

// 数据库连接
const dbPath = path.join(__dirname, '../../database/wellmotion.db')
const db = new sqlite3.Database(dbPath)

// JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'wellmotion-secret-key'

// 验证Token中间件
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ 
      error: 'Unauthorized',
      message: '访问令牌缺失' 
    })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: '访问令牌无效' 
      })
    }
    req.user = user
    next()
  })
}

// 验证管理员权限中间件
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Forbidden',
      message: '需要管理员权限' 
    })
  }
  next()
}

// 验证教练权限中间件
const requireCoach = (req, res, next) => {
  if (req.user.role !== 'coach' && req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Forbidden',
      message: '需要教练权限' 
    })
  }
  next()
}

// 登录验证
const loginUser = async (username, password) => {
  return new Promise((resolve, reject) => {
    try {
      db.get('SELECT * FROM users WHERE username = ? AND status = 1', [username], async (err, user) => {
        if (err) {
          console.error('数据库查询错误:', err)
          resolve({ success: false, message: '登录失败' })
          return
        }

        if (!user) {
          resolve({ success: false, message: '用户不存在' })
          return
        }

        const isValidPassword = await bcrypt.compare(password, user.password_hash)
        if (!isValidPassword) {
          resolve({ success: false, message: '密码错误' })
          return
        }

        // 更新最后登录时间
        db.run('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?', [user.id], (err) => {
          if (err) {
            console.error('更新登录时间错误:', err)
          }
        })

        // 生成JWT Token
        const token = jwt.sign(
          { 
            id: user.id, 
            username: user.username, 
            role: user.role,
            name: user.name 
          },
          JWT_SECRET,
          { expiresIn: '7d' }
        )

        resolve({
          success: true,
          token,
          user: {
            id: user.id,
            username: user.username,
            name: user.name,
            role: user.role,
            phone: user.phone
          }
        })
      })
    } catch (error) {
      console.error('登录验证错误:', error)
      resolve({ success: false, message: '登录失败' })
    }
  })
}

// 获取当前用户信息
const getCurrentUser = async (userId) => {
  return new Promise((resolve, reject) => {
    try {
      db.get('SELECT id, username, name, role, phone FROM users WHERE id = ? AND status = 1', [userId], (err, user) => {
        if (err) {
          console.error('获取用户信息错误:', err)
          resolve(null)
          return
        }
        resolve(user)
      })
    } catch (error) {
      console.error('获取用户信息错误:', error)
      resolve(null)
    }
  })
}

module.exports = {
  authenticateToken,
  requireAdmin,
  requireCoach,
  loginUser,
  getCurrentUser,
  JWT_SECRET
} 