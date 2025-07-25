const express = require('express')
const sqlite3 = require('sqlite3').verbose()
const path = require('path')

const router = express.Router()

// 数据库连接
const dbPath = path.join(__dirname, '../../database/wellmotion.db')
const db = new sqlite3.Database(dbPath)

// 获取训练日志列表
router.get('/', (req, res) => {
  try {
    const { page = 1, limit = 20, member_id = '', date = '' } = req.query
    const offset = (page - 1) * limit

    let sql = `
      SELECT tl.*, m.name as member_name, u.name as coach_name 
      FROM training_logs tl
      LEFT JOIN members m ON tl.member_id = m.id
      LEFT JOIN users u ON tl.coach_id = u.id
      WHERE tl.status = 'completed'
    `
    let countSql = 'SELECT COUNT(*) as total FROM training_logs WHERE status = "completed"'
    let params = []

    if (member_id) {
      sql += ' AND tl.member_id = ?'
      countSql += ' AND member_id = ?'
      params.push(member_id)
    }

    if (date) {
      sql += ' AND DATE(tl.training_date) = ?'
      countSql += ' AND DATE(training_date) = ?'
      params.push(date)
    }

    sql += ' ORDER BY tl.created_at DESC LIMIT ? OFFSET ?'
    params.push(limit, offset)

    // 获取总数
    db.get(countSql, params.slice(0, -2), (err, countResult) => {
      if (err) {
        console.error('查询训练日志总数错误:', err)
        return res.status(500).json({
          success: false,
          message: '数据库查询错误'
        })
      }

      // 获取训练日志列表
      db.all(sql, params, (err, logs) => {
        if (err) {
          console.error('查询训练日志列表错误:', err)
          return res.status(500).json({
            success: false,
            message: '数据库查询错误'
          })
        }

        res.json({
          success: true,
          data: logs,
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
    console.error('获取训练日志列表错误:', error)
    res.status(500).json({
      success: false,
      message: '获取训练日志列表失败'
    })
  }
})

// 获取单个训练日志详情
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params

    // 获取训练日志基本信息
    db.get(`
      SELECT tl.*, m.name as member_name, u.name as coach_name 
      FROM training_logs tl
      LEFT JOIN members m ON tl.member_id = m.id
      LEFT JOIN users u ON tl.coach_id = u.id
      WHERE tl.id = ?
    `, [id], (err, log) => {
      if (err) {
        console.error('查询训练日志错误:', err)
        return res.status(500).json({
          success: false,
          message: '数据库查询错误'
        })
      }

      if (!log) {
        return res.status(404).json({
          success: false,
          message: '训练日志不存在'
        })
      }

      // 获取训练详情
      db.all(`
        SELECT * FROM training_details 
        WHERE log_id = ? 
        ORDER BY phase, exercise_order, set_number
      `, [id], (err, details) => {
        if (err) {
          console.error('查询训练详情错误:', err)
          return res.status(500).json({
            success: false,
            message: '数据库查询错误'
          })
        }

        res.json({
          success: true,
          data: {
            ...log,
            details
          }
        })
      })
    })
  } catch (error) {
    console.error('获取训练日志详情错误:', error)
    res.status(500).json({
      success: false,
      message: '获取训练日志详情失败'
    })
  }
})

// 创建新训练日志
router.post('/', (req, res) => {
  try {
    const {
      member_id,
      template_id,
      pre_training_status,
      training_start_time
    } = req.body

    // 验证必填字段
    if (!member_id) {
      return res.status(400).json({
        success: false,
        message: '会员ID为必填项'
      })
    }

    db.run(`
      INSERT INTO training_logs (
        member_id, coach_id, training_date, template_id, pre_training_status,
        training_start_time, status
      ) VALUES (?, ?, DATE('now'), ?, ?, ?, 'draft')
    `, [member_id, req.user.id, template_id, pre_training_status, training_start_time], function(err) {
      if (err) {
        console.error('创建训练日志错误:', err)
        return res.status(500).json({
          success: false,
          message: '创建训练日志失败'
        })
      }

      res.status(201).json({
        success: true,
        message: '训练日志创建成功',
        data: { id: this.lastID }
      })
    })
  } catch (error) {
    console.error('创建训练日志错误:', error)
    res.status(500).json({
      success: false,
      message: '创建训练日志失败'
    })
  }
})

// 更新训练日志
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params
    const {
      completion_rate,
      member_intensity_feeling,
      member_difficulty_feeling,
      member_performance_score,
      coach_summary,
      member_rating,
      member_feedback,
      coach_signature_data,
      member_signature_data,
      total_duration,
      training_end_time,
      status
    } = req.body

    // 检查是否需要消费课程（状态为completed且有双方签名）
    const shouldConsumeCourse = status === 'completed' && 
                               coach_signature_data && 
                               member_signature_data

    db.serialize(() => {
      db.run('BEGIN TRANSACTION')

      // 更新训练日志
      db.run(`
        UPDATE training_logs SET
          completion_rate = ?, member_intensity_feeling = ?, member_difficulty_feeling = ?,
          member_performance_score = ?, coach_summary = ?, member_rating = ?,
          member_feedback = ?, coach_signature_data = ?, member_signature_data = ?,
          total_duration = ?, training_end_time = ?, status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [completion_rate, member_intensity_feeling, member_difficulty_feeling,
           member_performance_score, coach_summary, member_rating, member_feedback,
           coach_signature_data, member_signature_data, total_duration, training_end_time,
           status, id], function(err) {
        if (err) {
          console.error('更新训练日志错误:', err)
          db.run('ROLLBACK')
          return res.status(500).json({
            success: false,
            message: '更新训练日志失败'
          })
        }

        if (this.changes === 0) {
          db.run('ROLLBACK')
          return res.status(404).json({
            success: false,
            message: '训练日志不存在'
          })
        }

        // 如果需要消费课程，更新会员课程信息
        if (shouldConsumeCourse) {
          // 获取会员ID
          db.get('SELECT member_id FROM training_logs WHERE id = ?', [id], (err, log) => {
            if (err) {
              console.error('获取训练日志会员ID错误:', err)
              db.run('ROLLBACK')
              return res.status(500).json({
                success: false,
                message: '获取会员信息失败'
              })
            }

            // 获取会员课程信息
            db.get('SELECT * FROM member_courses WHERE member_id = ?', [log.member_id], (err, courseInfo) => {
              if (err) {
                console.error('获取会员课程信息错误:', err)
                db.run('ROLLBACK')
                return res.status(500).json({
                  success: false,
                  message: '获取课程信息失败'
                })
              }

              // 如果没有课程记录，创建默认记录
              if (!courseInfo) {
                db.run(`
                  INSERT INTO member_courses (member_id, purchased_courses, consumed_courses, remaining_courses)
                  VALUES (?, 0, 0, 0)
                `, [log.member_id], function(err) {
                  if (err) {
                    console.error('创建会员课程记录错误:', err)
                    db.run('ROLLBACK')
                    return res.status(500).json({
                      success: false,
                      message: '创建课程记录失败'
                    })
                  }
                  courseInfo = {
                    id: this.lastID,
                    member_id: log.member_id,
                    purchased_courses: 0,
                    consumed_courses: 0,
                    remaining_courses: 0
                  }
                  consumeCourse(courseInfo)
                })
              } else {
                consumeCourse(courseInfo)
              }

              function consumeCourse(courseInfo) {
                // 检查剩余课程是否足够
                if (courseInfo.remaining_courses < 1) {
                  db.run('ROLLBACK')
                  return res.status(400).json({
                    success: false,
                    message: '会员剩余课程不足，无法完成训练'
                  })
                }

                // 更新课程信息
                db.run(`
                  UPDATE member_courses SET
                    consumed_courses = consumed_courses + 1,
                    remaining_courses = remaining_courses - 1,
                    last_course_date = DATE('now'),
                    updated_at = CURRENT_TIMESTAMP
                  WHERE member_id = ?
                `, [log.member_id], function(err) {
                  if (err) {
                    console.error('更新课程消费信息错误:', err)
                    db.run('ROLLBACK')
                    return res.status(500).json({
                      success: false,
                      message: '更新课程信息失败'
                    })
                  }

                  // 记录课程消费操作
                  db.run(`
                    INSERT INTO course_operations (
                      member_id, operator_id, operation_type, quantity, reason,
                      before_remaining, after_remaining
                    ) VALUES (?, ?, 'consume', 1, '训练完成自动消费', ?, ?)
                  `, [log.member_id, req.user.id, courseInfo.remaining_courses, courseInfo.remaining_courses - 1], function(err) {
                    if (err) {
                      console.error('记录课程消费操作错误:', err)
                      // 不阻止提交，因为主要操作已完成
                    }

                    db.run('COMMIT')
                    console.log('✅ 训练完成，课程消费成功')
                    res.json({
                      success: true,
                      message: '训练日志更新成功，课程已消费'
                    })
                  })
                })
              }
            })
          })
        } else {
          // 不需要消费课程，直接提交
          db.run('COMMIT')
          res.json({
            success: true,
            message: '训练日志更新成功'
          })
        }
      })
    })
  } catch (error) {
    console.error('更新训练日志错误:', error)
    res.status(500).json({
      success: false,
      message: '更新训练日志失败'
    })
  }
})

// 添加训练详情
router.post('/:id/details', (req, res) => {
  try {
    const { id } = req.params
    const {
      phase,
      exercise_name,
      exercise_order,
      set_number,
      weight_or_intensity,
      weight_unit,
      reps_or_duration,
      duration_unit,
      rest_time,
      notes
    } = req.body

    // 验证必填字段
    if (!phase || !exercise_name || !exercise_order || !set_number) {
      return res.status(400).json({
        success: false,
        message: '训练阶段、动作名称、顺序和组数为必填项'
      })
    }

    db.run(`
      INSERT INTO training_details (
        log_id, phase, exercise_name, exercise_order, set_number,
        weight_or_intensity, weight_unit, reps_or_duration, duration_unit,
        rest_time, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [id, phase, exercise_name, exercise_order, set_number,
         weight_or_intensity, weight_unit, reps_or_duration, duration_unit,
         rest_time, notes], function(err) {
      if (err) {
        console.error('添加训练详情错误:', err)
        return res.status(500).json({
          success: false,
          message: '添加训练详情失败'
        })
      }

      res.status(201).json({
        success: true,
        message: '训练详情添加成功',
        data: { id: this.lastID }
      })
    })
  } catch (error) {
    console.error('添加训练详情错误:', error)
    res.status(500).json({
      success: false,
      message: '添加训练详情失败'
    })
  }
})

module.exports = router 