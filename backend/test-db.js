const sqlite3 = require('sqlite3').verbose()
const path = require('path')

const dbPath = path.join(__dirname, 'database/wellmotion.db')
const db = new sqlite3.Database(dbPath)

console.log('检查会员数据...')

db.all('SELECT id, name, access_mode FROM members', (err, rows) => {
  if (err) {
    console.error('错误:', err)
  } else {
    console.log('会员数据:', rows)
  }
  db.close()
}) 