const axios = require('axios');
const assert = require('assert');

// 测试配置
const BASE_URL = 'http://localhost:3001/api';
const FRONTEND_URL = 'http://localhost:3000';

// 测试数据
const testUser = {
  username: 'liyawei123',
  password: '123liyawei'
};

const testMember = {
  name: '测试会员',
  phone: '13800138000',
  gender: '男',
  age: 25,
  height: 175,
  weight: 70,
  target: '增肌',
  notes: '测试会员数据'
};

class WellMotionTester {
  constructor() {
    this.token = null;
    this.testResults = [];
  }

  // 记录测试结果
  logTest(name, passed, message = '') {
    const result = {
      name,
      passed,
      message,
      timestamp: new Date().toISOString()
    };
    this.testResults.push(result);
    console.log(`${passed ? '✅' : '❌'} ${name}: ${message}`);
  }

  // 用户认证测试
  async testAuthentication() {
    console.log('\n=== 用户认证测试 ===');
    
    try {
      // 测试登录
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, testUser);
      assert(loginResponse.data.token, '登录应该返回token');
      this.token = loginResponse.data.token;
      this.logTest('用户登录', true, '成功获取token');
      
      // 测试获取用户信息
      const userResponse = await axios.get(`${BASE_URL}/auth/profile`, {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      assert(userResponse.data.username === testUser.username, '用户信息应该匹配');
      this.logTest('获取用户信息', true, '成功获取用户信息');
      
      // 测试错误密码登录
      try {
        await axios.post(`${BASE_URL}/auth/login`, {
          username: testUser.username,
          password: 'wrongpassword'
        });
        this.logTest('错误密码登录', false, '应该拒绝错误密码');
      } catch (error) {
        this.logTest('错误密码登录', true, '正确拒绝错误密码');
      }
      
    } catch (error) {
      this.logTest('用户认证测试', false, error.message);
    }
  }

  // 会员管理测试
  async testMemberManagement() {
    console.log('\n=== 会员管理测试 ===');
    
    try {
      // 测试创建会员
      const createResponse = await axios.post(`${BASE_URL}/members`, testMember, {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      assert(createResponse.data.id, '创建会员应该返回ID');
      const memberId = createResponse.data.id;
      this.logTest('创建会员', true, `成功创建会员，ID: ${memberId}`);
      
      // 测试获取会员列表
      const listResponse = await axios.get(`${BASE_URL}/members`, {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      assert(Array.isArray(listResponse.data), '会员列表应该是数组');
      this.logTest('获取会员列表', true, `成功获取 ${listResponse.data.length} 个会员`);
      
      // 测试获取单个会员
      const memberResponse = await axios.get(`${BASE_URL}/members/${memberId}`, {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      assert(memberResponse.data.name === testMember.name, '会员信息应该匹配');
      this.logTest('获取单个会员', true, '成功获取会员详情');
      
      // 测试更新会员
      const updateData = { ...testMember, name: '更新后的会员' };
      const updateResponse = await axios.put(`${BASE_URL}/members/${memberId}`, updateData, {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      assert(updateResponse.data.name === updateData.name, '会员信息应该更新');
      this.logTest('更新会员', true, '成功更新会员信息');
      
      // 测试删除会员
      await axios.delete(`${BASE_URL}/members/${memberId}`, {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      this.logTest('删除会员', true, '成功删除会员');
      
    } catch (error) {
      this.logTest('会员管理测试', false, error.message);
    }
  }

  // 训练日志测试
  async testTrainingLogs() {
    console.log('\n=== 训练日志测试 ===');
    
    try {
      // 先创建一个测试会员
      const memberResponse = await axios.post(`${BASE_URL}/members`, testMember, {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      const memberId = memberResponse.data.id;
      
      // 测试创建训练日志
      const trainingLog = {
        memberId: memberId,
        date: new Date().toISOString().split('T')[0],
        duration: 60,
        notes: '测试训练日志'
      };
      
      const createLogResponse = await axios.post(`${BASE_URL}/training`, trainingLog, {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      assert(createLogResponse.data.id, '创建训练日志应该返回ID');
      const logId = createLogResponse.data.id;
      this.logTest('创建训练日志', true, `成功创建训练日志，ID: ${logId}`);
      
      // 测试获取训练日志列表
      const logsResponse = await axios.get(`${BASE_URL}/training`, {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      assert(Array.isArray(logsResponse.data), '训练日志列表应该是数组');
      this.logTest('获取训练日志列表', true, `成功获取 ${logsResponse.data.length} 个训练日志`);
      
      // 测试获取单个训练日志
      const logResponse = await axios.get(`${BASE_URL}/training/${logId}`, {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      assert(logResponse.data.memberId === memberId, '训练日志信息应该匹配');
      this.logTest('获取单个训练日志', true, '成功获取训练日志详情');
      
      // 清理测试数据
      await axios.delete(`${BASE_URL}/members/${memberId}`, {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      
    } catch (error) {
      this.logTest('训练日志测试', false, error.message);
    }
  }

  // 模板管理测试
  async testTemplates() {
    console.log('\n=== 模板管理测试 ===');
    
    try {
      // 测试创建模板
      const template = {
        name: '测试模板',
        description: '这是一个测试模板',
        exercises: [
          {
            name: '深蹲',
            sets: 3,
            reps: 12,
            weight: 50
          },
          {
            name: '卧推',
            sets: 3,
            reps: 10,
            weight: 40
          }
        ]
      };
      
      const createTemplateResponse = await axios.post(`${BASE_URL}/templates`, template, {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      assert(createTemplateResponse.data.id, '创建模板应该返回ID');
      const templateId = createTemplateResponse.data.id;
      this.logTest('创建训练模板', true, `成功创建模板，ID: ${templateId}`);
      
      // 测试获取模板列表
      const templatesResponse = await axios.get(`${BASE_URL}/templates`, {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      assert(Array.isArray(templatesResponse.data), '模板列表应该是数组');
      this.logTest('获取模板列表', true, `成功获取 ${templatesResponse.data.length} 个模板`);
      
      // 测试获取单个模板
      const templateResponse = await axios.get(`${BASE_URL}/templates/${templateId}`, {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      assert(templateResponse.data.name === template.name, '模板信息应该匹配');
      this.logTest('获取单个模板', true, '成功获取模板详情');
      
      // 测试删除模板
      await axios.delete(`${BASE_URL}/templates/${templateId}`, {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      this.logTest('删除模板', true, '成功删除模板');
      
    } catch (error) {
      this.logTest('模板管理测试', false, error.message);
    }
  }

  // 性能测试
  async testPerformance() {
    console.log('\n=== 性能测试 ===');
    
    try {
      const startTime = Date.now();
      
      // 测试API响应时间
      const response = await axios.get(`${BASE_URL}/health`);
      const responseTime = Date.now() - startTime;
      
      assert(responseTime < 1000, 'API响应时间应该在1秒内');
      this.logTest('API响应时间', true, `响应时间: ${responseTime}ms`);
      
      // 测试并发请求
      const concurrentRequests = 10;
      const promises = [];
      
      for (let i = 0; i < concurrentRequests; i++) {
        promises.push(axios.get(`${BASE_URL}/health`));
      }
      
      const concurrentStartTime = Date.now();
      await Promise.all(promises);
      const concurrentTime = Date.now() - concurrentStartTime;
      
      assert(concurrentTime < 5000, '并发请求应该在5秒内完成');
      this.logTest('并发请求测试', true, `${concurrentRequests}个并发请求耗时: ${concurrentTime}ms`);
      
    } catch (error) {
      this.logTest('性能测试', false, error.message);
    }
  }

  // 生成测试报告
  generateReport() {
    console.log('\n=== 测试报告 ===');
    
    const totalTests = this.testResults.length;
    const passedTests = this.testResults.filter(r => r.passed).length;
    const failedTests = totalTests - passedTests;
    
    console.log(`总测试数: ${totalTests}`);
    console.log(`通过测试: ${passedTests}`);
    console.log(`失败测试: ${failedTests}`);
    console.log(`通过率: ${((passedTests / totalTests) * 100).toFixed(2)}%`);
    
    if (failedTests > 0) {
      console.log('\n失败的测试:');
      this.testResults
        .filter(r => !r.passed)
        .forEach(r => console.log(`- ${r.name}: ${r.message}`));
    }
    
    // 保存测试报告到文件
    const fs = require('fs');
    const report = {
      summary: {
        total: totalTests,
        passed: passedTests,
        failed: failedTests,
        passRate: ((passedTests / totalTests) * 100).toFixed(2)
      },
      results: this.testResults,
      timestamp: new Date().toISOString()
    };
    
    fs.writeFileSync('tests/test-report.json', JSON.stringify(report, null, 2));
    console.log('\n测试报告已保存到: tests/test-report.json');
  }

  // 运行所有测试
  async runAllTests() {
    console.log('开始运行 WellMotion 功能测试...\n');
    
    await this.testAuthentication();
    await this.testMemberManagement();
    await this.testTrainingLogs();
    await this.testTemplates();
    await this.testPerformance();
    
    this.generateReport();
  }
}

// 运行测试
if (require.main === module) {
  const tester = new WellMotionTester();
  tester.runAllTests().catch(console.error);
}

module.exports = WellMotionTester; 