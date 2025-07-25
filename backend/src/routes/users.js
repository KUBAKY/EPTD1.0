const express = require('express')
const sqlite3 = require('sqlite3').verbose()
const path = require('path')
const bcrypt = require('bcryptjs')

const router = express.Router()

// 数据库连接
const dbPath = path.join(__dirname, '../../database/wellmotion.db')
const db = new sqlite3.Database(dbPath)

// 获取用户列表（仅管理员）
router.get('/', (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: '需要管理员权限'
    })
  }

  const { page = 1, limit = 20, search = '', role = '', status = '' } = req.query
  const offset = (page - 1) * limit

  let sql = 'SELECT id, username, name, role, phone, status, last_login_at, created_at FROM users'
  let countSql = 'SELECT COUNT(*) as total FROM users'
  let params = []
  let conditions = []

  if (search) {
    conditions.push('(username LIKE ? OR name LIKE ?)')
    params.push(`%${search}%`, `%${search}%`)
  }

  if (role) {
    conditions.push('role = ?')
    params.push(role)
  }

  if (status !== '') {
    conditions.push('status = ?')
    params.push(parseInt(status))
  }

  if (conditions.length > 0) {
    const whereClause = ' WHERE ' + conditions.join(' AND ')
    sql += whereClause
    countSql += whereClause
  }

  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
  params.push(parseInt(limit), offset)

  // 获取总数
  db.get(countSql, params.slice(0, -2), (err, countResult) => {
    if (err) {
      console.error('查询用户总数错误:', err)
      return res.status(500).json({
        success: false,
        message: '数据库查询错误'
      })
    }

    // 获取用户列表
    db.all(sql, params, (err, users) => {
      if (err) {
        console.error('查询用户列表错误:', err)
        return res.status(500).json({
          success: false,
          message: '数据库查询错误'
        })
      }

      res.json({
        success: true,
        data: users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: countResult.total,
          pages: Math.ceil(countResult.total / limit)
        }
      })
    })
  })
})

// 获取单个用户详情
router.get('/:id', (req, res) => {
  const { id } = req.params

  // 只有管理员可以查看其他用户信息，或者用户查看自己的信息
  if (req.user.role !== 'admin' && req.user.id !== parseInt(id)) {
    return res.status(403).json({
      success: false,
      message: '权限不足'
    })
  }

  db.get(`
    SELECT id, username, name, role, phone, status, last_login_at, created_at 
    FROM users WHERE id = ?
  `, [id], (err, user) => {
    if (err) {
      console.error('查询用户详情错误:', err)
      return res.status(500).json({
        success: false,
        message: '数据库查询错误'
      })
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      })
    }

    res.json({
      success: true,
      data: user
    })
  })
})

// 创建新用户（仅管理员）
router.post('/', (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: '需要管理员权限'
    })
  }

  const { username, password, name, role, phone } = req.body

  // 验证必填字段
  if (!username || !password || !name || !role) {
    return res.status(400).json({
      success: false,
      message: '缺少必填字段'
    })
  }

  // 验证角色
  if (!['admin', 'coach'].includes(role)) {
    return res.status(400).json({
      success: false,
      message: '无效的角色'
    })
  }

  // 加密密码
  const passwordHash = bcrypt.hashSync(password, 10)

  db.run(`
    INSERT INTO users (username, password_hash, name, role, phone)
    VALUES (?, ?, ?, ?, ?)
  `, [username, passwordHash, name, role, phone || null], function(err) {
    if (err) {
      console.error('创建用户错误:', err)
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return res.status(400).json({
          success: false,
          message: '用户名已存在'
        })
      }
      return res.status(500).json({
        success: false,
        message: '数据库操作错误'
      })
    }

    res.status(201).json({
      success: true,
      data: {
        id: this.lastID,
        username,
        name,
        role,
        phone
      }
    })
  })
})

// 更新用户信息
router.put('/:id', (req, res) => {
  const { id } = req.params
  const { name, phone, role } = req.body

  // 只有管理员可以更新用户信息
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: '需要管理员权限'
    })
  }

  db.run(`
    UPDATE users 
    SET name = ?, phone = ?, role = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [name, phone || null, role, id], function(err) {
    if (err) {
      console.error('更新用户错误:', err)
      return res.status(500).json({
        success: false,
        message: '数据库操作错误'
      })
    }

    if (this.changes === 0) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      })
    }

    res.json({
      success: true,
      message: '用户信息更新成功'
    })
  })
})

// 重置用户密码（管理员操作）
router.post('/:id/reset-password', (req, res) => {
  const { id } = req.params
  const { password } = req.body

  // 只有管理员可以重置密码
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: '需要管理员权限'
    })
  }

  if (!password) {
    return res.status(400).json({
      success: false,
      message: '请提供新密码'
    })
  }

  // 验证密码长度
  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: '密码长度至少6个字符'
    })
  }

  // 加密新密码
  const passwordHash = bcrypt.hashSync(password, 10)

  db.run(`
    UPDATE users 
    SET password_hash = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `, [passwordHash, id], function(err) {
    if (err) {
      console.error('重置密码错误:', err)
      return res.status(500).json({
        success: false,
        message: '数据库操作错误'
      })
    }

    if (this.changes === 0) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      })
    }

    res.json({
      success: true,
      message: '密码重置成功'
    })
  })
})

// 修改密码（用户自己操作）
router.post('/:id/change-password', (req, res) => {
  const { id } = req.params
  const { currentPassword, newPassword } = req.body

  // 只能修改自己的密码
  if (req.user.id !== parseInt(id)) {
    return res.status(403).json({
      success: false,
      message: '只能修改自己的密码'
    })
  }

  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      success: false,
      message: '请提供当前密码和新密码'
    })
  }

  // 验证新密码长度
  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: '新密码长度至少6个字符'
    })
  }

  // 先验证当前密码
  db.get('SELECT password_hash FROM users WHERE id = ?', [id], (err, user) => {
    if (err) {
      console.error('查询用户错误:', err)
      return res.status(500).json({
        success: false,
        message: '数据库查询错误'
      })
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      })
    }

    // 验证当前密码
    if (!bcrypt.compareSync(currentPassword, user.password_hash)) {
      return res.status(400).json({
        success: false,
        message: '当前密码错误'
      })
    }

    // 加密新密码
    const passwordHash = bcrypt.hashSync(newPassword, 10)

    // 更新密码
    db.run(`
      UPDATE users 
      SET password_hash = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [passwordHash, id], function(err) {
      if (err) {
        console.error('修改密码错误:', err)
        return res.status(500).json({
          success: false,
          message: '数据库操作错误'
        })
      }

      res.json({
        success: true,
        message: '密码修改成功'
      })
    })
  })
})

// 删除用户（软删除）
router.delete('/:id', (req, res) => {
  const { id } = req.params

  // 只有管理员可以删除用户
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: '需要管理员权限'
    })
  }

  // 不能删除自己
  if (req.user.id === parseInt(id)) {
    return res.status(400).json({
      success: false,
      message: '不能删除自己的账户'
    })
  }

  db.run('UPDATE users SET status = 0 WHERE id = ?', [id], function(err) {
    if (err) {
      console.error('删除用户错误:', err)
      return res.status(500).json({
        success: false,
        message: '数据库操作错误'
      })
    }

    if (this.changes === 0) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      })
    }

    res.json({
      success: true,
      message: '用户删除成功'
    })
  })
})

module.exports = router 