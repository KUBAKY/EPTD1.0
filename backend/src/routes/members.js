const express = require('express')
const sqlite3 = require('sqlite3').verbose()
const path = require('path')

const router = express.Router()

// 数据库连接
const dbPath = path.join(__dirname, '../../database/wellmotion.db')
const db = new sqlite3.Database(dbPath)

// 获取教练列表（用于权限设置）
router.get('/coaches', (req, res) => {
  try {
    db.all('SELECT id, name, username FROM users WHERE role = "coach" AND status = 1 ORDER BY name', (err, coaches) => {
      if (err) {
        console.error('获取教练列表错误:', err)
        return res.status(500).json({
          success: false,
          message: '获取教练列表失败'
        })
      }

      res.json({
        success: true,
        data: coaches
      })
    })
  } catch (error) {
    console.error('获取教练列表错误:', error)
    res.status(500).json({
      success: false,
      message: '获取教练列表失败'
    })
  }
})

// 获取会员列表
router.get('/', (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', gender = '', age = '' } = req.query
    const offset = (page - 1) * limit

    let sql = `
      SELECT m.*, 
             COALESCE(m.access_mode, 'shared') as access_mode,
             (SELECT COUNT(*) FROM training_logs tl WHERE tl.member_id = m.id) as training_count
      FROM members m 
      WHERE m.status = 1
    `
    let countSql = 'SELECT COUNT(*) as total FROM members WHERE status = 1'
    let params = []
    let conditions = []

    if (search) {
      conditions.push('(m.name LIKE ? OR m.phone LIKE ?)')
      params.push(`%${search}%`, `%${search}%`)
    }

    if (gender) {
      conditions.push('m.gender = ?')
      params.push(gender)
    }

    if (age) {
      // 年龄段筛选逻辑
      const [minAge, maxAge] = age.split('-').map(Number)
      if (maxAge) {
        conditions.push('m.age BETWEEN ? AND ?')
        params.push(minAge, maxAge)
      } else {
        conditions.push('m.age >= ?')
        params.push(minAge)
      }
    }

    if (conditions.length > 0) {
      const whereClause = ' AND ' + conditions.join(' AND ')
      sql += whereClause
      countSql += whereClause
    }

    sql += ' ORDER BY m.created_at DESC LIMIT ? OFFSET ?'
    params.push(parseInt(limit), offset)

    // 获取总数
    db.get(countSql, params.slice(0, -2), (err, countResult) => {
      if (err) {
        console.error('查询会员总数错误:', err)
        return res.status(500).json({
          success: false,
          message: '数据库查询错误'
        })
      }

      // 获取会员列表
      db.all(sql, params, (err, members) => {
        if (err) {
          console.error('查询会员列表错误:', err)
          return res.status(500).json({
            success: false,
            message: '数据库查询错误'
          })
        }

        res.json({
          success: true,
          data: members,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: countResult.total,
            pages: Math.ceil(countResult.total / limit)
          }
        })
      })
    })
  } catch (error) {
    console.error('获取会员列表错误:', error)
    res.status(500).json({
      success: false,
      message: '获取会员列表失败'
    })
  }
})

// 获取单个会员详情
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params
    
    db.get('SELECT * FROM members WHERE id = ? AND status = 1', [id], (err, member) => {
      if (err) {
        console.error('查询会员详情错误:', err)
        return res.status(500).json({
          success: false,
          message: '数据库查询错误'
        })
      }

      if (!member) {
        return res.status(404).json({
          success: false,
          message: '会员不存在'
        })
      }

      res.json({
        success: true,
        data: member
      })
    })
  } catch (error) {
    console.error('获取会员详情错误:', error)
    res.status(500).json({
      success: false,
      message: '获取会员详情失败'
    })
  }
})

// 创建新会员
router.post('/', (req, res) => {
  try {
    const {
      name,
      phone,
      gender,
      age,
      height,
      weight,
      health_history,
      medical_restrictions,
      emergency_contact,
      emergency_phone,
      notes,
      access_mode = 'shared',
      coach_ids = []
    } = req.body

    // 验证必填字段
    if (!name || !phone || !gender || !age) {
      return res.status(400).json({
        success: false,
        message: '姓名、电话、性别、年龄为必填项'
      })
    }

    // 计算BMI
    let bmi = null
    if (height && weight) {
      bmi = (weight / Math.pow(height / 100, 2)).toFixed(1)
    }

    // 开始事务
    db.serialize(() => {
      db.run('BEGIN TRANSACTION')

      // 插入会员基本信息
      db.run(`
        INSERT INTO members (
          name, phone, gender, age, height, weight, bmi,
          health_history, medical_restrictions, emergency_contact, emergency_phone, notes, 
          coach_id, access_mode
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [name, phone, gender, age, height, weight, bmi,
          health_history, medical_restrictions, emergency_contact, emergency_phone, notes, 
          req.user.id, access_mode], function(err) {
        if (err) {
          console.error('创建会员错误:', err)
          db.run('ROLLBACK')
          return res.status(500).json({
            success: false,
            message: '创建会员失败'
          })
        }

        const memberId = this.lastID

        // 如果是专属模式且有指定教练，则插入权限记录
        if (access_mode === 'exclusive' && coach_ids.length > 0) {
          // 构建正确的SQL插入语句
          const permissionValues = coach_ids.map(coachId => `(${memberId}, ${coachId}, 'full')`).join(',')
          const permissionSql = `
            INSERT INTO member_coach_permissions (member_id, coach_id, permission_type)
            VALUES ${permissionValues}
          `
          
          console.log('📝 权限SQL:', permissionSql)
          
          db.run(permissionSql, (err) => {
            if (err) {
              console.error('创建权限记录错误:', err)
              db.run('ROLLBACK')
              return res.status(500).json({
                success: false,
                message: '创建权限记录失败'
              })
            }

            db.run('COMMIT')
            res.status(201).json({
              success: true,
              message: '会员创建成功',
              data: { id: memberId }
            })
          })
        } else {
          // 共享模式或没有指定教练，直接提交
          db.run('COMMIT')
          res.status(201).json({
            success: true,
            message: '会员创建成功',
            data: { id: memberId }
          })
        }
      })
    })
  } catch (error) {
    console.error('创建会员错误:', error)
    res.status(500).json({
      success: false,
      message: '创建会员失败'
    })
  }
})

// 更新会员信息
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params
    const {
      name,
      phone,
      gender,
      age,
      height,
      weight,
      health_history,
      medical_restrictions,
      emergency_contact,
      emergency_phone,
      notes,
      access_mode = 'shared'
    } = req.body

    // 检查会员是否存在
    db.get('SELECT * FROM members WHERE id = ? AND status = 1', [id], (err, existingMember) => {
      if (err) {
        console.error('查询会员错误:', err)
        return res.status(500).json({
          success: false,
          message: '数据库查询错误'
        })
      }

      if (!existingMember) {
        return res.status(404).json({
          success: false,
          message: '会员不存在'
        })
      }

      // 计算BMI
      let bmi = null
      if (height && weight) {
        bmi = (weight / Math.pow(height / 100, 2)).toFixed(1)
      }

      db.run(`
        UPDATE members SET
          name = ?, phone = ?, gender = ?, age = ?, height = ?, weight = ?, bmi = ?,
          health_history = ?, medical_restrictions = ?, emergency_contact = ?, emergency_phone = ?, notes = ?,
          access_mode = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [name, phone, gender, age, height, weight, bmi,
          health_history, medical_restrictions, emergency_contact, emergency_phone, notes, access_mode, id], function(err) {
        if (err) {
          console.error('更新会员错误:', err)
          return res.status(500).json({
            success: false,
            message: '更新会员信息失败'
          })
        }

        res.json({
          success: true,
          message: '会员信息更新成功'
        })
      })
    })
  } catch (error) {
    console.error('更新会员错误:', error)
    res.status(500).json({
      success: false,
      message: '更新会员信息失败'
    })
  }
})

// 删除会员（软删除）
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params

    db.run('UPDATE members SET status = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [id], function(err) {
      if (err) {
        console.error('删除会员错误:', err)
        return res.status(500).json({
          success: false,
          message: '删除会员失败'
        })
      }

      if (this.changes === 0) {
        return res.status(404).json({
          success: false,
          message: '会员不存在'
        })
      }

      res.json({
        success: true,
        message: '会员删除成功'
      })
    })
  } catch (error) {
    console.error('删除会员错误:', error)
    res.status(500).json({
      success: false,
      message: '删除会员失败'
    })
  }
})

// 获取会员权限信息
router.get('/:id/permissions', (req, res) => {
  try {
    const { id } = req.params

    // 获取会员基本信息
    db.get('SELECT * FROM members WHERE id = ?', [id], (err, member) => {
      if (err) {
        console.error('查询会员错误:', err)
        return res.status(500).json({
          success: false,
          message: '数据库查询错误'
        })
      }

      if (!member) {
        return res.status(404).json({
          success: false,
          message: '会员不存在'
        })
      }

      // 获取会员的教练权限
      db.all(`
        SELECT mcp.coach_id, mcp.permission_type, u.name as coach_name
        FROM member_coach_permissions mcp
        LEFT JOIN users u ON mcp.coach_id = u.id
        WHERE mcp.member_id = ?
      `, [id], (err, permissions) => {
        if (err) {
          console.error('查询权限错误:', err)
          return res.status(500).json({
            success: false,
            message: '数据库查询错误'
          })
        }

        res.json({
          success: true,
          data: {
            member,
            permissions
          }
        })
      })
    })
  } catch (error) {
    console.error('获取会员权限错误:', error)
    res.status(500).json({
      success: false,
      message: '获取会员权限失败'
    })
  }
})

// 获取会员的教练信息（用于专属模式显示）
router.get('/:id/coaches', (req, res) => {
  try {
    const { id } = req.params

    // 获取会员信息
    db.get('SELECT access_mode FROM members WHERE id = ?', [id], (err, member) => {
      if (err) {
        console.error('查询会员错误:', err)
        return res.status(500).json({
          success: false,
          message: '数据库查询错误'
        })
      }

      if (!member) {
        return res.status(404).json({
          success: false,
          message: '会员不存在'
        })
      }

      if (member.access_mode === 'shared') {
        // 共享模式，返回所有教练
        db.all(`
          SELECT u.id, u.name, COUNT(tl.id) as training_count
          FROM users u
          LEFT JOIN training_logs tl ON u.id = tl.coach_id AND tl.member_id = ?
          WHERE u.role = 'coach' AND u.status = 1
          GROUP BY u.id, u.name
          ORDER BY training_count DESC, u.name
          LIMIT 3
        `, [id], (err, coaches) => {
          if (err) {
            console.error('查询教练信息错误:', err)
            return res.status(500).json({
              success: false,
              message: '数据库查询错误'
            })
          }

          res.json({
            success: true,
            data: coaches
          })
        })
      } else {
        // 专属模式，返回指定教练
        db.all(`
          SELECT u.id, u.name, COUNT(tl.id) as training_count
          FROM users u
          INNER JOIN member_coach_permissions mcp ON u.id = mcp.coach_id
          LEFT JOIN training_logs tl ON u.id = tl.coach_id AND tl.member_id = ?
          WHERE mcp.member_id = ? AND u.role = 'coach' AND u.status = 1
          GROUP BY u.id, u.name
          ORDER BY training_count DESC, u.name
          LIMIT 3
        `, [id, id], (err, coaches) => {
          if (err) {
            console.error('查询教练信息错误:', err)
            return res.status(500).json({
              success: false,
              message: '数据库查询错误'
            })
          }

          res.json({
            success: true,
            data: coaches
          })
        })
      }
    })
  } catch (error) {
    console.error('获取会员教练信息错误:', error)
    res.status(500).json({
      success: false,
      message: '获取会员教练信息失败'
    })
  }
})

// 设置会员教练权限
router.post('/:id/permissions', (req, res) => {
  try {
    const { id } = req.params
    const { access_mode, coach_ids = [] } = req.body

    // 检查会员是否存在
    db.get('SELECT * FROM members WHERE id = ?', [id], (err, member) => {
      if (err) {
        console.error('查询会员错误:', err)
        return res.status(500).json({
          success: false,
          message: '数据库查询错误'
        })
      }

      if (!member) {
        return res.status(404).json({
          success: false,
          message: '会员不存在'
        })
      }

      // 开始事务
      db.serialize(() => {
        db.run('BEGIN TRANSACTION')

        // 更新会员的访问模式
        db.run('UPDATE members SET access_mode = ? WHERE id = ?', [access_mode, id], (err) => {
          if (err) {
            console.error('更新会员访问模式错误:', err)
            db.run('ROLLBACK')
            return res.status(500).json({
              success: false,
              message: '更新会员访问模式失败'
            })
          }

          // 删除现有权限记录
          db.run('DELETE FROM member_coach_permissions WHERE member_id = ?', [id], (err) => {
            if (err) {
              console.error('删除权限记录错误:', err)
              db.run('ROLLBACK')
              return res.status(500).json({
                success: false,
                message: '删除权限记录失败'
              })
            }

            // 如果是专属模式且有指定教练，则插入新的权限记录
            if (access_mode === 'exclusive' && coach_ids.length > 0) {
              // 构建正确的SQL插入语句
              const permissionValues = coach_ids.map(coachId => `(${id}, ${coachId}, 'full')`).join(',')
              const permissionSql = `
                INSERT INTO member_coach_permissions (member_id, coach_id, permission_type)
                VALUES ${permissionValues}
              `
              
              console.log('📝 权限SQL:', permissionSql)
              
              db.run(permissionSql, (err) => {
                if (err) {
                  console.error('创建权限记录错误:', err)
                  db.run('ROLLBACK')
                  return res.status(500).json({
                    success: false,
                    message: '创建权限记录失败'
                  })
                }

                db.run('COMMIT')
                res.json({
                  success: true,
                  message: '权限设置成功'
                })
              })
            } else {
              // 共享模式或没有指定教练，直接提交
              db.run('COMMIT')
              res.json({
                success: true,
                message: '权限设置成功'
              })
            }
          })
        })
      })
    })
  } catch (error) {
    console.error('设置会员权限错误:', error)
    res.status(500).json({
      success: false,
      message: '设置会员权限失败'
    })
  }
})

module.exports = router 