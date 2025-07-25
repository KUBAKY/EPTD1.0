const path = require('path');

module.exports = {
  // 服务器配置
  server: {
    port: process.env.PORT || 3001,
    host: process.env.HOST || '0.0.0.0',
    environment: 'production'
  },

  // 数据库配置
  database: {
    path: process.env.DB_PATH || path.join(__dirname, '../database/wellmotion.db'),
    backupPath: process.env.DB_BACKUP_PATH || path.join(__dirname, '../database/backup/'),
    maxConnections: 10,
    timeout: 30000
  },

  // JWT配置
  jwt: {
    secret: process.env.JWT_SECRET || 'wellmotion-production-secret-key-2024',
    expiresIn: '24h',
    refreshExpiresIn: '7d'
  },

  // 日志配置
  logging: {
    level: 'info',
    file: path.join(__dirname, '../logs/app.log'),
    maxSize: '10m',
    maxFiles: 5
  },

  // 安全配置
  security: {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true
    },
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15分钟
      max: 100 // 限制每个IP 15分钟内最多100个请求
    },
    helmet: {
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"]
        }
      }
    }
  },

  // 性能配置
  performance: {
    compression: true,
    cache: {
      maxAge: 86400000 // 24小时
    },
    timeout: 30000
  },

  // 监控配置
  monitoring: {
    healthCheck: {
      enabled: true,
      interval: 30000 // 30秒
    },
    metrics: {
      enabled: true,
      port: process.env.METRICS_PORT || 3002
    }
  },

  // 备份配置
  backup: {
    enabled: true,
    schedule: '0 2 * * *', // 每天凌晨2点
    retention: 7, // 保留7天
    compression: true
  },

  // 邮件配置（用于通知）
  email: {
    enabled: false,
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  }
}; 