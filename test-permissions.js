const http = require('http')

// 测试会员权限设置
async function testMemberPermissions() {
  console.log('🧪 开始测试会员权限设置...')
  
  // 测试数据
  const testMember = {
    name: '测试会员',
    phone: '13800138000',
    gender: 'male',
    age: 25,
    height: 175,
    weight: 70,
    health_history: '无特殊病史',
    medical_restrictions: '无运动禁忌',
    access_mode: 'exclusive',
    coach_ids: [5, 6] // 指定教练ID
  }
  
  // 创建会员
  console.log('📝 创建测试会员...')
  const createData = JSON.stringify(testMember)
  
  const createOptions = {
    hostname: 'localhost',
    port: 3002,
    path: '/api/members',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(createData)
    }
  }
  
  const createReq = http.request(createOptions, (res) => {
    let data = ''
    res.on('data', (chunk) => {
      data += chunk
    })
    res.on('end', () => {
      console.log('📊 创建会员响应:', data)
      try {
        const result = JSON.parse(data)
        if (result.success) {
          console.log('✅ 会员创建成功, ID:', result.data.id)
          testUpdateMember(result.data.id)
        } else {
          console.log('❌ 会员创建失败:', result.message)
        }
      } catch (error) {
        console.log('❌ 解析响应失败:', error)
      }
    })
  })
  
  createReq.on('error', (error) => {
    console.log('❌ 创建会员请求失败:', error)
  })
  
  createReq.write(createData)
  createReq.end()
}

// 测试更新会员权限
function testUpdateMember(memberId) {
  console.log('📝 更新会员权限...')
  
  const updateData = JSON.stringify({
    name: '测试会员(已更新)',
    phone: '13800138000',
    gender: 'male',
    age: 26,
    height: 175,
    weight: 71,
    health_history: '无特殊病史',
    medical_restrictions: '无运动禁忌',
    access_mode: 'exclusive',
    coach_ids: [6] // 只指定一个教练
  })
  
  const updateOptions = {
    hostname: 'localhost',
    port: 3002,
    path: `/api/members/${memberId}`,
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(updateData)
    }
  }
  
  const updateReq = http.request(updateOptions, (res) => {
    let data = ''
    res.on('data', (chunk) => {
      data += chunk
    })
    res.on('end', () => {
      console.log('📊 更新会员响应:', data)
      try {
        const result = JSON.parse(data)
        if (result.success) {
          console.log('✅ 会员更新成功')
          testPermissions(memberId)
        } else {
          console.log('❌ 会员更新失败:', result.message)
        }
      } catch (error) {
        console.log('❌ 解析响应失败:', error)
      }
    })
  })
  
  updateReq.on('error', (error) => {
    console.log('❌ 更新会员请求失败:', error)
  })
  
  updateReq.write(updateData)
  updateReq.end()
}

// 测试权限设置
function testPermissions(memberId) {
  console.log('📝 设置会员权限...')
  
  const permissionData = JSON.stringify({
    access_mode: 'exclusive',
    coach_ids: [5, 6]
  })
  
  const permissionOptions = {
    hostname: 'localhost',
    port: 3002,
    path: `/api/members/${memberId}/permissions`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(permissionData)
    }
  }
  
  const permissionReq = http.request(permissionOptions, (res) => {
    let data = ''
    res.on('data', (chunk) => {
      data += chunk
    })
    res.on('end', () => {
      console.log('📊 权限设置响应:', data)
      try {
        const result = JSON.parse(data)
        if (result.success) {
          console.log('✅ 权限设置成功')
        } else {
          console.log('❌ 权限设置失败:', result.message)
        }
      } catch (error) {
        console.log('❌ 解析响应失败:', error)
      }
    })
  })
  
  permissionReq.on('error', (error) => {
    console.log('❌ 权限设置请求失败:', error)
  })
  
  permissionReq.write(permissionData)
  permissionReq.end()
}

// 运行测试
testMemberPermissions() 