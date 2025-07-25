const XLSX = require('xlsx')
const bcrypt = require('bcryptjs')
const path = require('path')
const sqlite3 = require('sqlite3').verbose()

// 数据库连接
const dbPath = path.join(__dirname, '../../database/wellmotion.db')
const db = new sqlite3.Database(dbPath)

class ExcelImporter {
  constructor() {
    this.results = {
      success: [],
      errors: []
    }
  }

  // 解析Excel文件
  parseExcelFile(filePath) {
    try {
      const workbook = XLSX.readFile(filePath)
      const sheets = {}
      
      workbook.SheetNames.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName]
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 })
        sheets[sheetName] = data
      })
      
      return sheets
    } catch (error) {
      throw new Error(`Excel文件解析失败: ${error.message}`)
    }
  }

  // 验证数据格式
  validateData(data, type) {
    const validators = {
      members: this.validateMemberData,
      coaches: this.validateCoachData,
      templates: this.validateTemplateData,
      exercises: this.validateExerciseData
    }
    
    return validators[type] ? validators[type](data) : false
  }

  // 验证会员数据
  validateMemberData(data) {
    if (!data || data.length < 2) return false
    
    const headers = data[0]
    const requiredFields = ['姓名', '手机号', '性别', '年龄']
    
    return requiredFields.every(field => headers.includes(field))
  }

  // 验证教练数据
  validateCoachData(data) {
    if (!data || data.length < 2) return false
    
    const headers = data[0]
    const requiredFields = ['用户名', '姓名', '手机号']
    
    return requiredFields.every(field => headers.includes(field))
  }

  // 验证模板数据
  validateTemplateData(data) {
    if (!data || data.length < 2) return false
    
    const headers = data[0]
    const requiredFields = ['模板名称', '分类', '描述']
    
    return requiredFields.every(field => headers.includes(field))
  }

  // 验证动作数据
  validateExerciseData(data) {
    if (!data || data.length < 2) return false
    
    const headers = data[0]
    const requiredFields = ['动作名称', '分类', '描述']
    
    return requiredFields.every(field => headers.includes(field))
  }

  // 批量导入会员
  async importMembers(data, coachId) {
    const headers = data[0]
    const rows = data.slice(1)
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      if (row.length === 0) continue
      
      try {
        const memberData = this.mapRowToObject(headers, row)
        await this.insertMember(memberData, coachId)
        this.results.success.push(`会员 ${memberData.姓名} 导入成功`)
      } catch (error) {
        this.results.errors.push(`第${i + 2}行: ${error.message}`)
      }
    }
  }

  // 批量导入教练
  async importCoaches(data) {
    const headers = data[0]
    const rows = data.slice(1)
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      if (row.length === 0) continue
      
      try {
        const coachData = this.mapRowToObject(headers, row)
        await this.insertCoach(coachData)
        this.results.success.push(`教练 ${coachData.姓名} 导入成功`)
      } catch (error) {
        this.results.errors.push(`第${i + 2}行: ${error.message}`)
      }
    }
  }

  // 批量导入模板
  async importTemplates(data, creatorId) {
    const headers = data[0]
    const rows = data.slice(1)
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      if (row.length === 0) continue
      
      try {
        const templateData = this.mapRowToObject(headers, row)
        await this.insertTemplate(templateData, creatorId)
        this.results.success.push(`模板 ${templateData.模板名称} 导入成功`)
      } catch (error) {
        this.results.errors.push(`第${i + 2}行: ${error.message}`)
      }
    }
  }

  // 批量导入动作
  async importExercises(data) {
    const headers = data[0]
    const rows = data.slice(1)
    
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      if (row.length === 0) continue
      
      try {
        const exerciseData = this.mapRowToObject(headers, row)
        await this.insertExercise(exerciseData)
        this.results.success.push(`动作 ${exerciseData.动作名称} 导入成功`)
      } catch (error) {
        this.results.errors.push(`第${i + 2}行: ${error.message}`)
      }
    }
  }

  // 将行数据映射为对象
  mapRowToObject(headers, row) {
    const obj = {}
    headers.forEach((header, index) => {
      if (header && row[index] !== undefined) {
        obj[header] = row[index]
      }
    })
    return obj
  }

  // 插入会员数据
  insertMember(memberData, coachId) {
    return new Promise((resolve, reject) => {
      const {
        姓名, 手机号, 性别, 年龄, 身高, 体重, BMI, 
        健康史, 运动禁忌, 紧急联系人, 紧急电话, 备注
      } = memberData

      if (!姓名 || !手机号 || !性别 || !年龄) {
        reject(new Error('必填字段不能为空'))
        return
      }

      const height = 身高 ? parseFloat(身高) : null
      const weight = 体重 ? parseFloat(体重) : null
      const bmi = BMI ? parseFloat(BMI) : null
      const age = parseInt(年龄)

      const sql = `
        INSERT INTO members (
          name, phone, gender, age, height, weight, bmi,
          health_history, medical_restrictions, emergency_contact,
          emergency_phone, notes, coach_id, access_mode
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `

      db.run(sql, [
        姓名, 手机号, 性别, age, height, weight, bmi,
        健康史 || '', 运动禁忌 || '', 紧急联系人 || '',
        紧急电话 || '', 备注 || '', coachId, 'shared'
      ], function(err) {
        if (err) {
          reject(new Error(`数据库插入失败: ${err.message}`))
        } else {
          resolve(this.lastID)
        }
      })
    })
  }

  // 插入教练数据
  insertCoach(coachData) {
    return new Promise((resolve, reject) => {
      const { 用户名, 姓名, 手机号, 密码 = '123456' } = coachData

      if (!用户名 || !姓名 || !手机号) {
        reject(new Error('必填字段不能为空'))
        return
      }

      // 检查用户名是否已存在
      db.get('SELECT id FROM users WHERE username = ?', [用户名], (err, user) => {
        if (err) {
          reject(new Error(`数据库查询失败: ${err.message}`))
          return
        }

        if (user) {
          reject(new Error('用户名已存在'))
          return
        }

        const passwordHash = bcrypt.hashSync(密码, 10)
        const sql = `
          INSERT INTO users (username, password_hash, role, name, phone, status)
          VALUES (?, ?, 'coach', ?, ?, 1)
        `

        db.run(sql, [用户名, passwordHash, 姓名, 手机号], function(err) {
          if (err) {
            reject(new Error(`数据库插入失败: ${err.message}`))
          } else {
            resolve(this.lastID)
          }
        })
      })
    })
  }

  // 插入模板数据
  insertTemplate(templateData, creatorId) {
    return new Promise((resolve, reject) => {
      const { 模板名称, 分类, 描述, 限制条件, 模板内容 } = templateData

      if (!模板名称 || !分类 || !描述) {
        reject(new Error('必填字段不能为空'))
        return
      }

      // 验证分类
      const validCategories = ['strength', 'comprehensive', 'functional']
      if (!validCategories.includes(分类)) {
        reject(new Error('分类必须是: strength, comprehensive, functional'))
        return
      }

      const templateContent = 模板内容 ? JSON.parse(模板内容) : {
        warmup: [],
        main: [],
        stretch: []
      }

      const sql = `
        INSERT INTO training_templates (
          name, category, description, restrictions, creator_id, template_content
        ) VALUES (?, ?, ?, ?, ?, ?)
      `

      db.run(sql, [
        模板名称, 分类, 描述, 限制条件 || '', creatorId, JSON.stringify(templateContent)
      ], function(err) {
        if (err) {
          reject(new Error(`数据库插入失败: ${err.message}`))
        } else {
          resolve(this.lastID)
        }
      })
    })
  }

  // 插入动作数据
  insertExercise(exerciseData) {
    return new Promise((resolve, reject) => {
      const { 动作名称, 分类, 描述, 目标肌群, 难度等级, 注意事项 } = exerciseData

      if (!动作名称 || !分类 || !描述) {
        reject(new Error('必填字段不能为空'))
        return
      }

      // 检查动作是否已存在
      db.get('SELECT id FROM exercises WHERE name = ?', [动作名称], (err, exercise) => {
        if (err) {
          reject(new Error(`数据库查询失败: ${err.message}`))
          return
        }

        if (exercise) {
          reject(new Error('动作名称已存在'))
          return
        }

        const sql = `
          INSERT INTO exercises (name, category, description, target_muscles, difficulty_level, notes)
          VALUES (?, ?, ?, ?, ?, ?)
        `

        db.run(sql, [
          动作名称, 分类, 描述, 目标肌群 || '', 难度等级 || 'medium', 注意事项 || ''
        ], function(err) {
          if (err) {
            reject(new Error(`数据库插入失败: ${err.message}`))
          } else {
            resolve(this.lastID)
          }
        })
      })
    })
  }

  // 获取导入结果
  getResults() {
    return {
      success: this.results.success,
      errors: this.results.errors,
      totalSuccess: this.results.success.length,
      totalErrors: this.results.errors.length
    }
  }

  // 重置结果
  resetResults() {
    this.results = {
      success: [],
      errors: []
    }
  }
}

module.exports = ExcelImporter 