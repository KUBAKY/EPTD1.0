# 使用官方Node.js镜像作为基础镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 复制package.json文件
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# 安装依赖
RUN cd backend && npm ci --only=production
RUN cd frontend && npm ci --only=production

# 复制源代码
COPY backend ./backend
COPY frontend ./frontend

# 构建前端
RUN cd frontend && npm run build

# 创建必要目录
RUN mkdir -p logs database/backup

# 设置环境变量
ENV NODE_ENV=production
ENV PORT=3001

# 暴露端口
EXPOSE 3001 4173

# 创建启动脚本
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'cd /app/backend && node src/database/init.js' >> /app/start.sh && \
    echo 'cd /app/backend && npm start &' >> /app/start.sh && \
    echo 'cd /app/frontend && npm run preview' >> /app/start.sh && \
    chmod +x /app/start.sh

# 启动应用
CMD ["/app/start.sh"] 