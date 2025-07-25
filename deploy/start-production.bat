@echo off
echo ========================================
echo WellMotion Production Deployment
echo ========================================
echo.

echo 正在启动生产环境...

echo.
echo 1. 检查环境变量...
if not defined NODE_ENV (
    set NODE_ENV=production
    echo 设置 NODE_ENV=production
)

echo.
echo 2. 创建必要目录...
if not exist "logs" mkdir logs
if not exist "database\backup" mkdir database\backup

echo.
echo 3. 安装生产依赖...
cd backend
call npm ci --only=production
cd ..

cd frontend
call npm ci --only=production
call npm run build
cd ..

echo.
echo 4. 初始化数据库...
cd backend
node src/database/init.js
cd ..

echo.
echo 5. 启动后端服务...
start "WellMotion Backend (Production)" cmd /k "cd backend && npm start"

echo.
echo 6. 启动前端服务...
start "WellMotion Frontend (Production)" cmd /k "cd frontend && npm run preview"

echo.
echo ========================================
echo 生产环境启动完成！
echo ========================================
echo.
echo 前端地址: http://localhost:4173
echo 后端地址: http://localhost:3001
echo 健康检查: http://localhost:3001/api/health
echo.
echo 默认管理员账户:
echo 用户名: liyawei123
echo 密码: 123liyawei
echo.
echo 生产环境配置:
echo - 数据库: SQLite (wellmotion.db)
echo - 日志: logs/app.log
echo - 备份: database/backup/
echo.
pause 