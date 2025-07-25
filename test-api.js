const http = require('http')

// 测试教练列表API
function testCoachesAPI() {
  console.log('🔍 测试教练列表API...')
  
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/members/coaches',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }

  const req = http.request(options, (res) => {
    console.log(`📊 状态码: ${res.statusCode}`)
    
    let data = ''
    res.on('data', (chunk) => {
      data += chunk
    })
    
    res.on('end', () => {
      try {
        const result = JSON.parse(data)
        console.log('✅ 教练列表API响应:', result)
      } catch (error) {
        console.error('❌ 解析响应失败:', error)
      }
    })
  })

  req.on('error', (error) => {
    console.error('❌ 请求失败:', error)
  })

  req.end()
}

// 测试会员列表API
function testMembersAPI() {
  console.log('🔍 测试会员列表API...')
  
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/members',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  }

  const req = http.request(options, (res) => {
    console.log(`📊 状态码: ${res.statusCode}`)
    
    let data = ''
    res.on('data', (chunk) => {
      data += chunk
    })
    
    res.on('end', () => {
      try {
        const result = JSON.parse(data)
        console.log('✅ 会员列表API响应:', result)
        if (result.success && result.data) {
          console.log(`📋 会员数量: ${result.data.length}`)
          result.data.forEach((member, index) => {
            console.log(`  ${index + 1}. ${member.name} (ID: ${member.id}) - 权限模式: ${member.access_mode}`)
          })
        }
      } catch (error) {
        console.error('❌ 解析响应失败:', error)
      }
    })
  })

  req.on('error', (error) => {
    console.error('❌ 请求失败:', error)
  })

  req.end()
}

// 运行测试
console.log('🚀 开始API测试...')
setTimeout(testCoachesAPI, 1000)
setTimeout(testMembersAPI, 2000) 