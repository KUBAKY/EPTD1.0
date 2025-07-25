const express = require('express')
const sqlite3 = require('sqlite3').verbose()
const path = require('path')

const router = express.Router()

// 数据库连接
const dbPath = path.join(__dirname, '../../database/wellmotion.db')
const db = new sqlite3.Database(dbPath)

// 获取训练模板列表
router.get('/', (req, res) => {
  try {
    const { page = 1, limit = 20, category = '', search = '' } = req.query
    const offset = (page - 1) * limit

    let sql = `
      SELECT 
        t.*,
        u.name as creator_name,
        u.username as creator_username
      FROM training_templates t
      LEFT JOIN users u ON t.creator_id = u.id
      WHERE t.is_active = 1
    `
    let countSql = 'SELECT COUNT(*) as total FROM training_templates WHERE is_active = 1'
    let params = []

    if (category) {
      sql += ' AND category = ?'
      countSql += ' AND category = ?'
      params.push(category)
    }

    if (search) {
      sql += ' AND (name LIKE ? OR description LIKE ?)'
      countSql += ' AND (name LIKE ? OR description LIKE ?)'
      params.push(`%${search}%`, `%${search}%`)
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
    params.push(limit, offset)

    // 获取总数
    db.get(countSql, params.slice(0, -2), (err, countResult) => {
      if (err) {
        console.error('查询模板总数错误:', err)
        return res.status(500).json({
          success: false,
          message: '数据库查询错误'
        })
      }

      // 获取模板列表
      db.all(sql, params, (err, templates) => {
        if (err) {
          console.error('查询模板列表错误:', err)
          return res.status(500).json({
            success: false,
            message: '数据库查询错误'
          })
        }

        // 处理创作者名称，将"李亚威"和"未知"都改为"管理员"
        const processedTemplates = templates.map(template => {
          if (template.creator_name === '李亚威' || template.creator_name === '未知' || !template.creator_name) {
            template.creator_name = '管理员'
          }
          return template
        })

        res.json({
          success: true,
          data: processedTemplates,
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
    console.error('获取训练模板列表错误:', error)
    res.status(500).json({
      success: false,
      message: '获取训练模板列表失败'
    })
  }
})

// 获取单个训练模板详情
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params
    
    db.get('SELECT * FROM training_templates WHERE id = ? AND is_active = 1', [id], (err, template) => {
      if (err) {
        console.error('查询模板详情错误:', err)
        return res.status(500).json({
          success: false,
          message: '数据库查询错误'
        })
      }

      if (!template) {
        return res.status(404).json({
          success: false,
          message: '训练模板不存在'
        })
      }

      res.json({
        success: true,
        data: template
      })
    })
  } catch (error) {
    console.error('获取训练模板详情错误:', error)
    res.status(500).json({
      success: false,
      message: '获取训练模板详情失败'
    })
  }
})

// 创建新训练模板
router.post('/', (req, res) => {
  try {
    const {
      name,
      category,
      description,
      restrictions,
      template_content
    } = req.body

    // 验证必填字段
    if (!name || !category || !template_content) {
      return res.status(400).json({
        success: false,
        message: '模板名称、分类和内容为必填项'
      })
    }

    db.run(`
      INSERT INTO training_templates (
        name, category, description, restrictions, creator_id, template_content
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [name, category, description, restrictions, req.user.id, JSON.stringify(template_content)], function(err) {
      if (err) {
        console.error('创建训练模板错误:', err)
        return res.status(500).json({
          success: false,
          message: '创建训练模板失败'
        })
      }

      res.status(201).json({
        success: true,
        message: '训练模板创建成功',
        data: { id: this.lastID }
      })
    })
  } catch (error) {
    console.error('创建训练模板错误:', error)
    res.status(500).json({
      success: false,
      message: '创建训练模板失败'
    })
  }
})

// 更新训练模板
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params
    const {
      name,
      category,
      description,
      restrictions,
      template_content
    } = req.body

    // 检查模板是否存在
    db.get('SELECT * FROM training_templates WHERE id = ? AND is_active = 1', [id], (err, existingTemplate) => {
      if (err) {
        console.error('查询模板错误:', err)
        return res.status(500).json({
          success: false,
          message: '数据库查询错误'
        })
      }

      if (!existingTemplate) {
        return res.status(404).json({
          success: false,
          message: '训练模板不存在'
        })
      }

      db.run(`
        UPDATE training_templates SET
          name = ?, category = ?, description = ?, restrictions = ?, template_content = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [name, category, description, restrictions, JSON.stringify(template_content), id], function(err) {
        if (err) {
          console.error('更新训练模板错误:', err)
          return res.status(500).json({
            success: false,
            message: '更新训练模板失败'
          })
        }

        res.json({
          success: true,
          message: '训练模板更新成功'
        })
      })
    })
  } catch (error) {
    console.error('更新训练模板错误:', error)
    res.status(500).json({
      success: false,
      message: '更新训练模板失败'
    })
  }
})

// 获取所有教练用户（用于筛选）
router.get('/creators/list', (req, res) => {
  try {
    db.all('SELECT id, name, username FROM users WHERE role = "coach" AND status = 1 ORDER BY name', (err, creators) => {
      if (err) {
        console.error('获取教练列表错误:', err)
        return res.status(500).json({
          success: false,
          message: '获取教练列表失败'
        })
      }

      // 添加"管理员"选项到列表开头
      const adminCreator = { id: 0, name: '管理员', username: 'admin' }
      const allCreators = [adminCreator, ...creators]

      res.json({
        success: true,
        data: allCreators
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

// 删除训练模板（软删除）
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params

    db.run('UPDATE training_templates SET is_active = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [id], function(err) {
      if (err) {
        console.error('删除训练模板错误:', err)
        return res.status(500).json({
          success: false,
          message: '删除训练模板失败'
        })
      }

      if (this.changes === 0) {
        return res.status(404).json({
          success: false,
          message: '训练模板不存在'
        })
      }

      res.json({
        success: true,
        message: '训练模板删除成功'
      })
    })
  } catch (error) {
    console.error('删除训练模板错误:', error)
    res.status(500).json({
      success: false,
      message: '删除训练模板失败'
    })
  }
})

module.exports = router 