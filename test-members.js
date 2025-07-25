const sqlite3 = require('sqlite3').verbose()
const path = require('path')

// 数据库文件路径
const dbPath = path.join(__dirname, 'backend/database/wellmotion.db')
const db = new sqlite3.Database(dbPath)

console.log('🔍 检查会员数据和权限设置...')

// 检查会员表结构
db.all('PRAGMA table_info(members)', (err, columns) => {
  if (err) {
    console.error('❌ 检查表结构错误:', err)
    return
  }
  
  console.log('📋 会员表结构:')
  columns.forEach(col => {
    console.log(`  - ${col.name}: ${col.type} (默认值: ${col.dflt_value})`)
  })
  
  // 检查会员数据
  db.all('SELECT id, name, access_mode, coach_id FROM members', (err, members) => {
    if (err) {
      console.error('❌ 查询会员数据错误:', err)
      return
    }
    
    console.log('\n📊 会员数据:')
    members.forEach(member => {
      console.log(`  - ID: ${member.id}, 姓名: ${member.name}, 权限模式: ${member.access_mode}, 教练ID: ${member.coach_id}`)
    })
    
    // 检查权限关联表
    db.all('SELECT * FROM member_coach_permissions', (err, permissions) => {
      if (err) {
        console.error('❌ 查询权限数据错误:', err)
        return
      }
      
      console.log('\n🔐 权限关联数据:')
      if (permissions.length === 0) {
        console.log('  - 暂无权限关联数据')
      } else {
        permissions.forEach(perm => {
          console.log(`  - 会员ID: ${perm.member_id}, 教练ID: ${perm.coach_id}, 权限类型: ${perm.permission_type}`)
        })
      }
      
      // 检查教练用户
      db.all('SELECT id, name, role FROM users WHERE role = "coach"', (err, coaches) => {
        if (err) {
          console.error('❌ 查询教练数据错误:', err)
          return
        }
        
        console.log('\n👨‍🏫 教练数据:')
        coaches.forEach(coach => {
          console.log(`  - ID: ${coach.id}, 姓名: ${coach.name}, 角色: ${coach.role}`)
        })
        
        db.close()
        console.log('\n✅ 检查完成！')
      })
    })
  })
}) 