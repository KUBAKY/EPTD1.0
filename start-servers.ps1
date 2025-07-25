# WellMotion 服务器启动脚本
Write-Host "========================================" -ForegroundColor Green
Write-Host "WellMotion Personal Trainer Assistant" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# 检查Node.js
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ 错误: 未找到Node.js，请先安装Node.js" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Node.js版本: $(node --version)" -ForegroundColor Green
Write-Host ""

# 启动后端
Write-Host "🚀 启动后端服务器..." -ForegroundColor Yellow
Set-Location "D:\游戏\eptd1.1\backend"

# 安装后端依赖
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 安装后端依赖..." -ForegroundColor Cyan
    npm install
}

# 初始化数据库
Write-Host "🗄️ 初始化数据库..." -ForegroundColor Cyan
node src/database/init.js

# 启动后端服务器
Write-Host "🔧 启动后端服务..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'D:\游戏\eptd1.1\backend'; npm run dev" -WindowStyle Normal

Write-Host ""

# 启动前端
Write-Host "🎨 启动前端服务器..." -ForegroundColor Yellow
Set-Location "D:\游戏\eptd1.1\frontend"

# 安装前端依赖
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 安装前端依赖..." -ForegroundColor Cyan
    npm install
}

# 启动前端服务器
Write-Host "🔧 启动前端服务..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'D:\游戏\eptd1.1\frontend'; npm run dev" -WindowStyle Normal

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ 开发环境启动完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 前端地址: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔧 后端地址: http://localhost:3001" -ForegroundColor Cyan
Write-Host "📊 健康检查: http://localhost:3001/api/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "👤 默认管理员账户:" -ForegroundColor Yellow
Write-Host "   用户名: liyawei123" -ForegroundColor White
Write-Host "   密码: 123liyawei" -ForegroundColor White
Write-Host ""
Write-Host "⏳ 请等待几秒钟让服务器完全启动..." -ForegroundColor Yellow
Write-Host ""