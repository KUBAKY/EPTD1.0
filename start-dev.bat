@echo off
echo ========================================
echo WellMotion Personal Trainer Assistant
echo ========================================
echo.

echo 正在启动开发环境...

echo.
echo 1. 初始化数据库...
cd backend
node src/database/init.js
cd ..

echo.
echo 2. 安装前端依赖...
cd frontend
npm install
cd ..

echo.
echo 3. 安装后端依赖...
cd backend
npm install
cd ..

echo.
echo 4. 启动后端服务...
start "WellMotion Backend" cmd /k "cd backend && npm run dev"

echo.
echo 5. 启动前端服务...
start "WellMotion Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo 开发环境启动完成！
echo ========================================
echo.
echo 前端地址: http://localhost:3000
echo 后端地址: http://localhost:3001
echo 健康检查: http://localhost:3001/api/health
echo.
echo 默认管理员账户:
echo 用户名: liyawei123
echo 密码: 123liyawei
echo.
pause 