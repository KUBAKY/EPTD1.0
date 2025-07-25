import { useAuthStore } from '@/stores/auth'

// 创建HTTP请求工具
export const http = {
  async request(url: string, options: RequestInit = {}) {
    const authStore = useAuthStore()
    
    // 添加认证头
    const headers = {
      'Content-Type': 'application/json',
      ...authStore.getAuthHeaders(),
      ...options.headers
    }

    // 使用相对路径，让Vite代理处理
    const fullUrl = url.startsWith('http') ? url : url

    try {
      const response = await fetch(fullUrl, {
        ...options,
        headers
      })

      // 处理401未授权错误
      if (response.status === 401) {
        authStore.logout()
        window.location.href = '/login'
        throw new Error('访问令牌无效，请重新登录')
      }

      return response
    } catch (error) {
      console.error('HTTP请求错误:', error)
      throw error
    }
  },

  async get(url: string) {
    return this.request(url, { method: 'GET' })
  },

  async post(url: string, data?: any) {
    return this.request(url, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    })
  },

  async put(url: string, data?: any) {
    return this.request(url, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    })
  },

  async delete(url: string) {
    return this.request(url, { method: 'DELETE' })
  }
}