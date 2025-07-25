const errorHandler = (err, req, res, next) => {
  console.error('错误详情:', err)

  // 默认错误状态码和消息
  let statusCode = 500
  let message = '服务器内部错误'

  // 根据错误类型设置不同的状态码和消息
  if (err.name === 'ValidationError') {
    statusCode = 400
    message = '数据验证失败'
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401
    message = '未授权访问'
  } else if (err.name === 'ForbiddenError') {
    statusCode = 403
    message = '禁止访问'
  } else if (err.name === 'NotFoundError') {
    statusCode = 404
    message = '资源不存在'
  } else if (err.code === 'SQLITE_CONSTRAINT') {
    statusCode = 400
    message = '数据约束冲突'
  } else if (err.code === 'SQLITE_BUSY') {
    statusCode = 503
    message = '数据库繁忙，请稍后重试'
  }

  // 返回错误响应
  res.status(statusCode).json({
    error: true,
    message: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
}

module.exports = errorHandler 