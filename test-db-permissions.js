const sqlite3 = require('sqlite3').verbose()
const path = require('path')

// 数据库连接
const dbPath = path.join(__dirname, 'backend/database/wellmotion.db')
const db = new sqlite3.Database(dbPath)

console.log('🧪 测试权限SQL语句...')

// 测试数据
const memberId = 1
const coachIds = [5, 6]

// 构建SQL语句
const permissionValues = coachIds.map(coachId => `(${memberId}, ${coachId}, 'full')`).join(',')
const permissionSql = `
  INSERT INTO member_coach_permissions (member_id, coach_id, permission_type)
  VALUES ${permissionValues}
`

console.log('📝 权限SQL:', permissionSql)

// 测试SQL语句
db.run(permissionSql, (err) => {
  if (err) {
    console.error('❌ 权限SQL执行失败:', err)
  } else {
    console.log('✅ 权限SQL执行成功')
  }
  
  // 查询验证
  db.all('SELECT * FROM member_coach_permissions WHERE member_id = ?', [memberId], (err, rows) => {
    if (err) {
      console.error('❌ 查询权限记录失败:', err)
    } else {
      console.log('📊 权限记录:', rows)
    }
    
    // 清理测试数据
    db.run('DELETE FROM member_coach_permissions WHERE member_id = ?', [memberId], (err) => {
      if (err) {
        console.error('❌ 清理测试数据失败:', err)
      } else {
        console.log('✅ 测试数据清理完成')
      }
      db.close()
    })
  })
}) 