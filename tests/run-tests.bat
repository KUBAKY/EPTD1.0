@echo off
echo ========================================
echo WellMotion 测试套件
echo ========================================
echo.

echo 正在启动测试环境...

echo.
echo 1. 检查测试环境...
if not exist "node_modules" (
    echo 安装测试依赖...
    npm install axios
)

echo.
echo 2. 启动开发服务器...
start "WellMotion Backend (Test)" cmd /k "cd backend && npm run dev"
start "WellMotion Frontend (Test)" cmd /k "cd frontend && npm run dev"

echo.
echo 3. 等待服务器启动...
timeout /t 10 /nobreak > nul

echo.
echo 4. 运行功能测试...
node tests/functional-test.js

echo.
echo 5. 运行性能测试...
node tests/performance-test.js

echo.
echo ========================================
echo 测试完成！
echo ========================================
echo.
echo 测试报告位置:
echo - 功能测试: tests/test-report.json
echo - 性能测试: tests/performance-report.json
echo.
pause 