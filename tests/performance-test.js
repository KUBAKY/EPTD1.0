const axios = require('axios');
const fs = require('fs');

class PerformanceTester {
  constructor() {
    this.baseUrl = 'http://localhost:3001/api';
    this.token = null;
    this.results = [];
  }

  async login() {
    try {
      const response = await axios.post(`${this.baseUrl}/auth/login`, {
        username: 'liyawei123',
        password: '123liyawei'
      });
      this.token = response.data.token;
      console.log('✅ 登录成功，获取到token');
    } catch (error) {
      console.error('❌ 登录失败:', error.message);
      throw error;
    }
  }

  // 测量API响应时间
  async measureResponseTime(url, method = 'GET', data = null) {
    const startTime = Date.now();
    try {
      const config = {
        method,
        url: `${this.baseUrl}${url}`,
        headers: this.token ? { Authorization: `Bearer ${this.token}` } : {}
      };
      
      if (data) {
        config.data = data;
      }
      
      await axios(config);
      const responseTime = Date.now() - startTime;
      return { success: true, time: responseTime };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return { success: false, time: responseTime, error: error.message };
    }
  }

  // 并发测试
  async concurrentTest(url, method = 'GET', concurrentCount = 10, data = null) {
    console.log(`\n🔄 开始并发测试: ${method} ${url} (${concurrentCount}个并发请求)`);
    
    const promises = [];
    const startTime = Date.now();
    
    for (let i = 0; i < concurrentCount; i++) {
      promises.push(this.measureResponseTime(url, method, data));
    }
    
    const results = await Promise.all(promises);
    const totalTime = Date.now() - startTime;
    
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    const avgTime = successful.length > 0 
      ? successful.reduce((sum, r) => sum + r.time, 0) / successful.length 
      : 0;
    
    const result = {
      url,
      method,
      concurrentCount,
      totalTime,
      avgResponseTime: avgTime,
      successCount: successful.length,
      failureCount: failed.length,
      successRate: (successful.length / concurrentCount) * 100
    };
    
    console.log(`✅ 并发测试完成:`);
    console.log(`   - 总耗时: ${totalTime}ms`);
    console.log(`   - 平均响应时间: ${avgTime.toFixed(2)}ms`);
    console.log(`   - 成功率: ${result.successRate.toFixed(2)}%`);
    console.log(`   - 成功: ${successful.length}, 失败: ${failed.length}`);
    
    this.results.push(result);
    return result;
  }

  // 压力测试
  async stressTest(url, method = 'GET', maxConcurrent = 50, step = 10) {
    console.log(`\n🔥 开始压力测试: ${method} ${url}`);
    console.log(`   最大并发: ${maxConcurrent}, 步长: ${step}`);
    
    const stressResults = [];
    
    for (let concurrent = step; concurrent <= maxConcurrent; concurrent += step) {
      console.log(`\n   测试 ${concurrent} 个并发请求...`);
      const result = await this.concurrentTest(url, method, concurrent);
      stressResults.push(result);
      
      // 如果成功率低于80%，停止测试
      if (result.successRate < 80) {
        console.log(`⚠️  成功率低于80%，停止压力测试`);
        break;
      }
      
      // 等待1秒再进行下一轮测试
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return stressResults;
  }

  // 内存使用测试
  async memoryTest() {
    console.log('\n💾 开始内存使用测试');
    
    const initialMemory = process.memoryUsage();
    console.log('初始内存使用:');
    console.log(`  - RSS: ${(initialMemory.rss / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  - Heap Used: ${(initialMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  - Heap Total: ${(initialMemory.heapTotal / 1024 / 1024).toFixed(2)} MB`);
    
    // 执行一系列操作
    const operations = [];
    for (let i = 0; i < 100; i++) {
      operations.push(this.measureResponseTime('/health'));
    }
    
    await Promise.all(operations);
    
    const finalMemory = process.memoryUsage();
    console.log('\n最终内存使用:');
    console.log(`  - RSS: ${(finalMemory.rss / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  - Heap Used: ${(finalMemory.heapUsed / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  - Heap Total: ${(finalMemory.heapTotal / 1024 / 1024).toFixed(2)} MB`);
    
    const memoryIncrease = {
      rss: finalMemory.rss - initialMemory.rss,
      heapUsed: finalMemory.heapUsed - initialMemory.heapUsed,
      heapTotal: finalMemory.heapTotal - initialMemory.heapTotal
    };
    
    console.log('\n内存增长:');
    console.log(`  - RSS: ${(memoryIncrease.rss / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  - Heap Used: ${(memoryIncrease.heapUsed / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  - Heap Total: ${(memoryIncrease.heapTotal / 1024 / 1024).toFixed(2)} MB`);
    
    return {
      initial: initialMemory,
      final: finalMemory,
      increase: memoryIncrease
    };
  }

  // 数据库性能测试
  async databasePerformanceTest() {
    console.log('\n🗄️  开始数据库性能测试');
    
    const dbTests = [
      { name: '获取会员列表', url: '/members', method: 'GET' },
      { name: '获取训练日志', url: '/training', method: 'GET' },
      { name: '获取模板列表', url: '/templates', method: 'GET' }
    ];
    
    const dbResults = [];
    
    for (const test of dbTests) {
      console.log(`\n   测试: ${test.name}`);
      
      // 测试单个请求响应时间
      const singleResult = await this.measureResponseTime(test.url, test.method);
      console.log(`   - 单个请求: ${singleResult.time}ms`);
      
      // 测试并发请求
      const concurrentResult = await this.concurrentTest(test.url, test.method, 20);
      
      dbResults.push({
        name: test.name,
        url: test.url,
        singleResponseTime: singleResult.time,
        concurrentResult
      });
    }
    
    return dbResults;
  }

  // 生成性能报告
  generatePerformanceReport() {
    console.log('\n📊 生成性能测试报告');
    
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalTests: this.results.length,
        averageResponseTime: this.results.length > 0 
          ? this.results.reduce((sum, r) => sum + r.avgResponseTime, 0) / this.results.length 
          : 0,
        averageSuccessRate: this.results.length > 0 
          ? this.results.reduce((sum, r) => sum + r.successRate, 0) / this.results.length 
          : 0
      },
      results: this.results
    };
    
    // 保存报告到文件
    fs.writeFileSync('tests/performance-report.json', JSON.stringify(report, null, 2));
    console.log('✅ 性能测试报告已保存到: tests/performance-report.json');
    
    // 打印摘要
    console.log('\n📈 性能测试摘要:');
    console.log(`   - 总测试数: ${report.summary.totalTests}`);
    console.log(`   - 平均响应时间: ${report.summary.averageResponseTime.toFixed(2)}ms`);
    console.log(`   - 平均成功率: ${report.summary.averageSuccessRate.toFixed(2)}%`);
    
    // 性能评级
    let performanceGrade = 'A';
    if (report.summary.averageResponseTime > 1000) performanceGrade = 'C';
    else if (report.summary.averageResponseTime > 500) performanceGrade = 'B';
    
    if (report.summary.averageSuccessRate < 90) performanceGrade = 'D';
    else if (report.summary.averageSuccessRate < 95) performanceGrade = 'C';
    
    console.log(`   - 性能评级: ${performanceGrade}`);
    
    return report;
  }

  // 运行所有性能测试
  async runAllTests() {
    console.log('🚀 开始 WellMotion 性能测试...\n');
    
    try {
      // 登录获取token
      await this.login();
      
      // 基础性能测试
      console.log('\n=== 基础性能测试 ===');
      await this.concurrentTest('/health', 'GET', 10);
      await this.concurrentTest('/members', 'GET', 10);
      await this.concurrentTest('/training', 'GET', 10);
      
      // 压力测试
      console.log('\n=== 压力测试 ===');
      await this.stressTest('/health', 'GET', 30, 5);
      
      // 数据库性能测试
      console.log('\n=== 数据库性能测试 ===');
      await this.databasePerformanceTest();
      
      // 内存使用测试
      console.log('\n=== 内存使用测试 ===');
      await this.memoryTest();
      
      // 生成报告
      this.generatePerformanceReport();
      
    } catch (error) {
      console.error('❌ 性能测试失败:', error.message);
    }
  }
}

// 运行性能测试
if (require.main === module) {
  const tester = new PerformanceTester();
  tester.runAllTests().catch(console.error);
}

module.exports = PerformanceTester; 