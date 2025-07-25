const sqlite3 = require('sqlite3').verbose()
const path = require('path')
const bcrypt = require('bcryptjs')

// 数据库文件路径
const dbPath = path.join(__dirname, '../../database/wellmotion.db')

console.log('🗄️ 正在初始化数据库...')
console.log('数据库路径:', dbPath)

// 创建数据库连接
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('数据库连接错误:', err)
    return
  }
  console.log('✅ 数据库连接成功')
  
  // 启用外键约束
  db.run('PRAGMA foreign_keys = ON')
  
  // 创建用户表
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username VARCHAR(50) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      role TEXT NOT NULL DEFAULT 'coach',
      name VARCHAR(100) NOT NULL,
      phone VARCHAR(11),
      status INTEGER DEFAULT 1,
      last_login_at TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('创建用户表错误:', err)
    } else {
      console.log('✅ 用户表创建成功')
      
      // 创建会员表
      db.run(`
        CREATE TABLE IF NOT EXISTS members (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name VARCHAR(100) NOT NULL,
          phone VARCHAR(11) UNIQUE NOT NULL,
          gender TEXT NOT NULL,
          age INTEGER NOT NULL,
          height REAL,
          weight REAL,
          bmi REAL,
          health_history TEXT,
          medical_restrictions TEXT,
          emergency_contact VARCHAR(100),
          emergency_phone VARCHAR(11),
          coach_id INTEGER,
          status INTEGER DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (coach_id) REFERENCES users(id)
        )
      `, (err) => {
        if (err) {
          console.error('创建会员表错误:', err)
        } else {
          console.log('✅ 会员表创建成功')
          
          // 创建训练模板表
          db.run(`
            CREATE TABLE IF NOT EXISTS training_templates (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name VARCHAR(200) NOT NULL,
              category TEXT NOT NULL,
              description TEXT,
              restrictions TEXT,
              creator_id INTEGER NOT NULL,
              template_content TEXT NOT NULL,
              use_count INTEGER DEFAULT 0,
              is_active INTEGER DEFAULT 1,
              created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
              FOREIGN KEY (creator_id) REFERENCES users(id)
            )
          `, (err) => {
            if (err) {
              console.error('创建训练模板表错误:', err)
            } else {
              console.log('✅ 训练模板表创建成功')
              
              // 创建训练日志表
              db.run(`
                CREATE TABLE IF NOT EXISTS training_logs (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  member_id INTEGER NOT NULL,
                  coach_id INTEGER NOT NULL,
                  training_date DATE NOT NULL,
                  template_id INTEGER,
                  pre_training_status TEXT,
                  completion_rate INTEGER DEFAULT 0,
                  member_intensity_feeling INTEGER,
                  member_difficulty_feeling INTEGER,
                  member_performance_score INTEGER,
                  coach_summary TEXT,
                  member_rating INTEGER,
                  member_feedback TEXT,
                  coach_signature_data TEXT,
                  member_signature_data TEXT,
                  total_duration INTEGER,
                  status TEXT DEFAULT 'draft',
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  FOREIGN KEY (member_id) REFERENCES members(id),
                  FOREIGN KEY (coach_id) REFERENCES users(id),
                  FOREIGN KEY (template_id) REFERENCES training_templates(id)
                )
              `, (err) => {
                if (err) {
                  console.error('创建训练日志表错误:', err)
                } else {
                  console.log('✅ 训练日志表创建成功')
                  
                  // 创建训练详情表
                  db.run(`
                    CREATE TABLE IF NOT EXISTS training_details (
                      id INTEGER PRIMARY KEY AUTOINCREMENT,
                      log_id INTEGER NOT NULL,
                      phase TEXT NOT NULL,
                      exercise_name VARCHAR(200) NOT NULL,
                      exercise_order INTEGER NOT NULL,
                      set_number INTEGER NOT NULL,
                      weight_or_intensity REAL,
                      weight_unit TEXT DEFAULT 'kg',
                      reps_or_duration INTEGER,
                      duration_unit TEXT DEFAULT 'reps',
                      rest_time INTEGER,
                      notes TEXT,
                      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                      FOREIGN KEY (log_id) REFERENCES training_logs(id)
                    )
                  `, (err) => {
                    if (err) {
                      console.error('创建训练详情表错误:', err)
                    } else {
                      console.log('✅ 训练详情表创建成功')
                      
                      // 插入默认管理员用户
                      const adminPassword = bcrypt.hashSync('123liyawei', 10)
                      db.run(`
                        INSERT OR IGNORE INTO users (username, password_hash, role, name, phone)
                        VALUES (?, ?, ?, ?, ?)
                      `, ['liyawei123', adminPassword, 'admin', '李亚伟', '13800138000'], (err) => {
                        if (err) {
                          console.error('插入管理员用户错误:', err)
                        } else {
                          console.log('✅ 管理员用户创建成功')
                          
                          // 插入示例会员数据
                          db.run(`
                            INSERT OR IGNORE INTO members (name, phone, gender, age, height, weight, bmi, health_history, medical_restrictions)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                          `, ['张三', '13800138001', 'male', 28, 175.5, 70.2, 22.8, '无特殊病史', '无运动禁忌'], (err) => {
                            if (err) {
                              console.error('插入会员数据错误:', err)
                            } else {
                              console.log('✅ 示例会员数据创建成功')
                              
                              console.log('')
                              console.log('=======================================')
                              console.log('✅ 数据库初始化完成！')
                              console.log('=======================================')
                              console.log('👤 默认管理员账户：liyawei123 / 123liyawei')
                              console.log('📊 已创建示例数据')
                              console.log('')
                              
                              // 关闭数据库连接
                              db.close((err) => {
                                if (err) {
                                  console.error('关闭数据库连接错误:', err)
                                } else {
                                  console.log('🗄️ 数据库连接已关闭')
                                }
                              })
                            }
                          })
                        }
                      })
                    }
                  })
                }
              })
            }
          })
        }
      })
    }
  })
})