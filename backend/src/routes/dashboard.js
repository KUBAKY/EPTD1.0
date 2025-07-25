const express = require('express')
const router = express.Router()
const sqlite3 = require('sqlite3').verbose()
const path = require('path')

// 数据库连接
const dbPath = path.join(__dirname, '../../database/wellmotion.db')
const db = new sqlite3.Database(dbPath)

// 获取仪表板统计数据
router.get('/stats', (req, res) => {
  const userId = req.user.id
  
  try {
    // 获取总会员数
    db.get('SELECT COUNT(*) as count FROM members', (err, result) => {
      if (err) {
        console.error('获取会员数错误:', err)
        return res.status(500).json({ 
          success: false, 
          message: '获取统计数据失败' 
        })
      }
      
      const totalMembers = result.count
      
      // 获取今日课程数
      const today = new Date().toISOString().split('T')[0]
      db.get('SELECT COUNT(*) as count FROM training_logs WHERE DATE(training_date) = ?', [today], (err, result) => {
        if (err) {
          console.error('获取今日课程数错误:', err)
          return res.status(500).json({ 
            success: false, 
            message: '获取统计数据失败' 
          })
        }
        
        const todaySessions = result.count
        
        // 获取训练模板数
        db.get('SELECT COUNT(*) as count FROM training_templates', (err, result) => {
          if (err) {
            console.error('获取模板数错误:', err)
            return res.status(500).json({ 
              success: false, 
              message: '获取统计数据失败' 
            })
          }
          
          const totalTemplates = result.count
          
          // 获取本月课程数
          const currentMonth = new Date().getFullYear() + '-' + String(new Date().getMonth() + 1).padStart(2, '0')
          db.get('SELECT COUNT(*) as count FROM training_logs WHERE strftime("%Y-%m", training_date) = ?', [currentMonth], (err, result) => {
            if (err) {
              console.error('获取本月课程数错误:', err)
              return res.status(500).json({ 
                success: false, 
                message: '获取统计数据失败' 
              })
            }
            
            const monthlySessions = result.count
            
            res.json({
              success: true,
              data: {
                totalMembers,
                todaySessions,
                totalTemplates,
                monthlySessions
              }
            })
          })
        })
      })
    })
  } catch (error) {
    console.error('获取统计数据错误:', error)
    res.status(500).json({ 
      success: false, 
      message: '获取统计数据失败' 
    })
  }
})

module.exports = router

// 获取今日课程安排
router.get('/today-sessions', (req, res) => {
  const userId = req.user.id
  const today = new Date().toISOString().split('T')[0]
  
  try {
    // 基于训练记录获取今日课程，而不是课程安排
    const query = `
      SELECT 
        tl.id,
        tl.training_start_time as time,
        m.name as memberName,
        '训练课程' as type,
        tl.status,
        tl.coach_summary as notes,
        tl.member_id,
        tl.template_id
      FROM training_logs tl
      JOIN members m ON tl.member_id = m.id
      WHERE DATE(tl.training_date) = ? AND tl.coach_id = ?
      ORDER BY tl.training_start_time ASC
    `
    
    db.all(query, [today, userId], (err, rows) => {
      if (err) {
        console.error('获取今日课程错误:', err)
        return res.status(500).json({ 
          success: false, 
          message: '获取今日课程失败' 
        })
      }
      
      res.json({
        success: true,
        data: rows
      })
    })
  } catch (error) {
    console.error('获取今日课程错误:', error)
    res.status(500).json({ 
      success: false, 
      message: '获取今日课程失败' 
    })
  }
})

// 添加课程安排
router.post('/add-session', (req, res) => {
  const userId = req.user.id
  const { memberId, scheduleDate, startTime, endTime, courseType, templateId, notes } = req.body
  
  try {
    // 验证必填字段
    if (!memberId || !scheduleDate || !startTime || !endTime || !courseType) {
      return res.status(400).json({
        success: false,
        message: '请填写所有必填字段'
      })
    }
    
    // 验证时间格式
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return res.status(400).json({
        success: false,
        message: '时间格式不正确'
      })
    }
    
    // 验证时间间隔
    const startMinutes = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1])
    const endMinutes = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1])
    const diffMinutes = endMinutes - startMinutes
    
    if (diffMinutes < 30) {
      return res.status(400).json({
        success: false,
        message: '课程时长必须至少30分钟'
      })
    }
    
    if (diffMinutes > 180) {
      return res.status(400).json({
        success: false,
        message: '课程时长不能超过3小时'
      })
    }
    
    const query = `
      INSERT INTO course_schedules 
      (member_id, coach_id, schedule_date, start_time, end_time, course_type, template_id, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `
    
    db.run(query, [memberId, userId, scheduleDate, startTime, endTime, courseType, templateId, notes], function(err) {
      if (err) {
        console.error('添加课程安排错误:', err)
        return res.status(500).json({ 
          success: false, 
          message: '添加课程安排失败: ' + err.message
        })
      }
      
      res.json({
        success: true,
        message: '课程安排添加成功',
        data: { id: this.lastID }
      })
    })
  } catch (error) {
    console.error('添加课程安排错误:', error)
    res.status(500).json({ 
      success: false, 
      message: '添加课程安排失败: ' + error.message
    })
  }
})

// 更新课程状态
router.put('/session/:id/status', (req, res) => {
  const userId = req.user.id
  const sessionId = req.params.id
  const { status } = req.body
  
  try {
    const query = `
      UPDATE course_schedules 
      SET status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND coach_id = ?
    `
    
    db.run(query, [status, sessionId, userId], function(err) {
      if (err) {
        console.error('更新课程状态错误:', err)
        return res.status(500).json({ 
          success: false, 
          message: '更新课程状态失败' 
        })
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ 
          success: false, 
          message: '课程不存在或无权限' 
        })
      }
      
      res.json({
        success: true,
        message: '课程状态更新成功'
      })
    })
  } catch (error) {
    console.error('更新课程状态错误:', error)
    res.status(500).json({ 
      success: false, 
      message: '更新课程状态失败' 
    })
  }
})

// 删除课程安排
router.delete('/session/:id', (req, res) => {
  const userId = req.user.id
  const sessionId = req.params.id
  
  try {
    const query = `
      DELETE FROM course_schedules 
      WHERE id = ? AND coach_id = ?
    `
    
    db.run(query, [sessionId, userId], function(err) {
      if (err) {
        console.error('删除课程安排错误:', err)
        return res.status(500).json({ 
          success: false, 
          message: '删除课程安排失败' 
        })
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ 
          success: false, 
          message: '课程不存在或无权限' 
        })
      }
      
      res.json({
        success: true,
        message: '课程安排删除成功'
      })
    })
  } catch (error) {
    console.error('删除课程安排错误:', error)
    res.status(500).json({ 
      success: false, 
      message: '删除课程安排失败' 
    })
  }
})