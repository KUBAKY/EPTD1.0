const fetch = require('node-fetch');

async function testLogin() {
  try {
    console.log('🧪 测试登录API...');
    
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'liyawei123',
        password: '123liyawei'
      })
    });

    const data = await response.json();
    
    console.log('📊 响应状态:', response.status);
    console.log('📄 响应数据:', JSON.stringify(data, null, 2));
    
    if (response.ok && data.success) {
      console.log('✅ 登录测试成功！');
    } else {
      console.log('❌ 登录测试失败！');
    }
  } catch (error) {
    console.error('❌ 测试错误:', error);
  }
}

testLogin(); 