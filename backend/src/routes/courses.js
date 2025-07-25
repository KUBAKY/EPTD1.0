const express = require('express')
const sqlite3 = require('sqlite3').verbose()
const path = require('path')

const router = express.Router()

// 数据库连接
const dbPath = path.join(__dirname, '../../database/wellmotion.db')
const db = new sqlite3.Database(dbPath)

// 获取会员课程信息
router.get('/member/:memberId', (req, res) => {
  const { memberId } = req.params

  try {
    // 获取会员课程信息
    db.get(`
      SELECT * FROM member_courses 
      WHERE member_id = ?
    `, [memberId], (err, courseInfo) => {
      if (err) {
        console.error('❌ 获取会员课程信息错误:', err)
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
        `, [memberId], function(err) {
          if (err) {
            console.error('❌ 创建会员课程记录错误:', err)
            return res.status(500).json({
              success: false,
              message: '创建课程记录失败'
            })
          }

          courseInfo = {
            id: this.lastID,
            member_id: parseInt(memberId),
            purchased_courses: 0,
            consumed_courses: 0,
            remaining_courses: 0,
            last_course_date: null
          }
        })
      }

      // 获取最后一节课日期（从训练日志）
      db.get(`
        SELECT training_date FROM training_logs 
        WHERE member_id = ? AND status = 'completed'
        ORDER BY training_date DESC 
        LIMIT 1
      `, [memberId], (err, lastTraining) => {
        if (err) {
          console.error('❌ 获取最后训练日期错误:', err)
        }

        const result = {
          ...courseInfo,
          last_course_date: lastTraining ? lastTraining.training_date : null
        }

        console.log('✅ 获取会员课程信息成功:', result)
        res.json({
          success: true,
          data: result
        })
      })
    })
  } catch (error) {
    console.error('❌ 获取会员课程信息错误:', error)
    res.status(500).json({
      success: false,
      message: '获取课程信息失败'
    })
  }
})

// 更新会员课程数量
router.post('/member/:memberId/update', (req, res) => {
  const { memberId } = req.params
  const { operationType, quantity, reason } = req.body
  const operatorId = req.user.id

  if (!operationType || !quantity || quantity <= 0) {
    return res.status(400).json({
      success: false,
      message: '参数错误'
    })
  }

  try {
    db.serialize(() => {
      db.run('BEGIN TRANSACTION')

      // 获取当前课程信息
      db.get(`
        SELECT * FROM member_courses 
        WHERE member_id = ?
      `, [memberId], (err, courseInfo) => {
        if (err) {
          console.error('❌ 获取课程信息错误:', err)
          db.run('ROLLBACK')
          return res.status(500).json({
            success: false,
            message: '获取课程信息失败'
          })
        }

        // 如果没有记录，创建默认记录
        if (!courseInfo) {
          db.run(`
            INSERT INTO member_courses (member_id, purchased_courses, consumed_courses, remaining_courses)
            VALUES (?, 0, 0, 0)
          `, [memberId], function(err) {
            if (err) {
              console.error('❌ 创建课程记录错误:', err)
              db.run('ROLLBACK')
              return res.status(500).json({
                success: false,
                message: '创建课程记录失败'
              })
            }
            courseInfo = {
              id: this.lastID,
              member_id: parseInt(memberId),
              purchased_courses: 0,
              consumed_courses: 0,
              remaining_courses: 0
            }
            updateCourseInfo(courseInfo)
          })
        } else {
          updateCourseInfo(courseInfo)
        }

        function updateCourseInfo(courseInfo) {
          let newPurchased = courseInfo.purchased_courses
          let newConsumed = courseInfo.consumed_courses
          let newRemaining = courseInfo.remaining_courses

          // 根据操作类型更新数量
          switch (operationType) {
            case 'add':
              newPurchased += quantity
              newRemaining += quantity
              break
            case 'subtract':
              if (newRemaining < quantity) {
                db.run('ROLLBACK')
                return res.status(400).json({
                  success: false,
                  message: '剩余课程数量不足'
                })
              }
              newRemaining -= quantity
              break
            default:
              db.run('ROLLBACK')
              return res.status(400).json({
                success: false,
                message: '无效的操作类型'
              })
          }

          // 更新课程信息
          db.run(`
            UPDATE member_courses 
            SET purchased_courses = ?, consumed_courses = ?, remaining_courses = ?, updated_at = CURRENT_TIMESTAMP
            WHERE member_id = ?
          `, [newPurchased, newConsumed, newRemaining, memberId], function(err) {
            if (err) {
              console.error('❌ 更新课程信息错误:', err)
              db.run('ROLLBACK')
              return res.status(500).json({
                success: false,
                message: '更新课程信息失败'
              })
            }

            // 记录操作
            db.run(`
              INSERT INTO course_operations (member_id, operator_id, operation_type, quantity, reason, before_remaining, after_remaining)
              VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [memberId, operatorId, operationType, quantity, reason, courseInfo.remaining_courses, newRemaining], function(err) {
              if (err) {
                console.error('❌ 记录操作错误:', err)
                db.run('ROLLBACK')
                return res.status(500).json({
                  success: false,
                  message: '记录操作失败'
                })
              }

              db.run('COMMIT')
              console.log('✅ 课程信息更新成功')
              res.json({
                success: true,
                message: '课程信息更新成功',
                data: {
                  purchased_courses: newPurchased,
                  consumed_courses: newConsumed,
                  remaining_courses: newRemaining
                }
              })
            })
          })
        }
      })
    })
  } catch (error) {
    console.error('❌ 更新课程信息错误:', error)
    res.status(500).json({
      success: false,
      message: '更新课程信息失败'
    })
  }
})

// 获取课程操作记录
router.get('/operations', (req, res) => {
  const { page = 1, limit = 20, memberId } = req.query
  const offset = (page - 1) * limit

  try {
    let sql = `
      SELECT co.*, m.name as member_name, u.name as operator_name
      FROM course_operations co
      JOIN members m ON co.member_id = m.id
      JOIN users u ON co.operator_id = u.id
    `
    let countSql = `
      SELECT COUNT(*) as total
      FROM course_operations co
      JOIN members m ON co.member_id = m.id
      JOIN users u ON co.operator_id = u.id
    `
    let params = []

    if (memberId) {
      sql += ' WHERE co.member_id = ?'
      countSql += ' WHERE co.member_id = ?'
      params.push(memberId)
    }

    sql += ' ORDER BY co.created_at DESC LIMIT ? OFFSET ?'
    params.push(parseInt(limit), offset)

    // 获取总数
    db.get(countSql, params.slice(0, -2), (err, countResult) => {
      if (err) {
        console.error('❌ 查询操作记录总数错误:', err)
        return res.status(500).json({
          success: false,
          message: '查询失败'
        })
      }

      // 获取操作记录
      db.all(sql, params, (err, operations) => {
        if (err) {
          console.error('❌ 查询操作记录错误:', err)
          return res.status(500).json({
            success: false,
            message: '查询失败'
          })
        }

        console.log('✅ 获取操作记录成功:', operations.length, '条记录')
        res.json({
          success: true,
          data: {
            operations,
            pagination: {
              total: countResult.total,
              page: parseInt(page),
              limit: parseInt(limit),
              pages: Math.ceil(countResult.total / limit)
            }
          }
        })
      })
    })
  } catch (error) {
    console.error('❌ 获取操作记录错误:', error)
    res.status(500).json({
      success: false,
      message: '获取操作记录失败'
    })
  }
})

// 获取所有会员的课程信息（用于会员列表显示）
router.get('/members/summary', (req, res) => {
  try {
    db.all(`
      SELECT 
        m.id,
        m.name,
        COALESCE(mc.purchased_courses, 0) as purchased_courses,
        COALESCE(mc.remaining_courses, 0) as remaining_courses,
        mc.last_course_date,
        (
          SELECT training_date 
          FROM training_logs 
          WHERE member_id = m.id AND status = 'completed'
          ORDER BY training_date DESC 
          LIMIT 1
        ) as last_training_date
      FROM members m
      LEFT JOIN member_courses mc ON m.id = mc.member_id
      WHERE m.status = 1
      ORDER BY m.created_at DESC
    `, (err, results) => {
      if (err) {
        console.error('❌ 获取会员课程汇总错误:', err)
        return res.status(500).json({
          success: false,
          message: '获取课程汇总失败'
        })
      }

      console.log('✅ 获取会员课程汇总成功:', results.length, '个会员')
      res.json({
        success: true,
        data: results
      })
    })
  } catch (error) {
    console.error('❌ 获取会员课程汇总错误:', error)
    res.status(500).json({
      success: false,
      message: '获取课程汇总失败'
    })
  }
})

module.exports = router 