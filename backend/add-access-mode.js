const sqlite3 = require('sqlite3').verbose()
const path = require('path')

// 数据库文件路径
const dbPath = path.join(__dirname, 'database/wellmotion.db')
const db = new sqlite3.Database(dbPath)

console.log('🗄️ 正在添加access_mode字段...')

// 添加access_mode字段
db.run('ALTER TABLE members ADD COLUMN access_mode TEXT DEFAULT "shared"', (err) => {
  if (err) {
    console.error('❌ 添加access_mode字段错误:', err)
  } else {
    console.log('✅ access_mode字段添加成功')
    
    // 更新所有现有会员为共享模式
    db.run('UPDATE members SET access_mode = "shared" WHERE access_mode IS NULL', (err) => {
      if (err) {
        console.error('❌ 更新会员权限模式错误:', err)
      } else {
        console.log('✅ 所有会员已设置为共享模式')
        
        // 验证更新结果
        db.all('SELECT id, name, access_mode FROM members', (err, rows) => {
          if (err) {
            console.error('❌ 查询会员数据错误:', err)
          } else {
            console.log('📋 会员数据:', rows)
          }
          db.close()
        })
      }
    })
  }
}) 