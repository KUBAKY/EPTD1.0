const sqlite3 = require('sqlite3').verbose()
const path = require('path')

const dbPath = path.join(__dirname, 'database/wellmotion.db')
const db = new sqlite3.Database(dbPath)

console.log('🧹 清理重复的会员数据...')

// 删除重复的会员数据，保留ID为4-13的会员
db.run('DELETE FROM members WHERE id = 1', (err) => {
  if (err) {
    console.error('❌ 删除重复会员错误:', err)
  } else {
    console.log('✅ 删除重复会员成功')
    
    // 重新设置自增ID
    db.run('DELETE FROM sqlite_sequence WHERE name = "members"', (err) => {
      if (err) {
        console.error('❌ 重置自增ID错误:', err)
      } else {
        console.log('✅ 重置自增ID成功')
        
        // 验证清理结果
        db.all('SELECT id, name, phone FROM members ORDER BY id', (err, rows) => {
          if (err) {
            console.error('❌ 查询会员数据错误:', err)
          } else {
            console.log('📋 清理后的会员数据:', rows)
          }
          db.close()
        })
      }
    })
  }
}) 