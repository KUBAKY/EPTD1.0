import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface User {
  id: number
  username: string
  name: string
  role: 'admin' | 'coach'
  phone?: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const isAuthenticated = ref<boolean>(!!token.value)

  const login = async (username: string, password: string) => {
    try {
      console.log('🔐 尝试登录:', { username, password: '***' })
      
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      })

      console.log('📡 响应状态:', response.status)
      console.log('📡 响应头:', Object.fromEntries(response.headers.entries()))

      const data = await response.json()
      console.log('📄 响应数据:', data)

      if (!response.ok) {
        console.error('❌ 登录失败:', data)
        throw new Error(data.message || '登录失败')
      }

      if (data.success) {
        token.value = data.token
        user.value = data.user
        isAuthenticated.value = true
        
        localStorage.setItem('token', data.token)
        console.log('✅ 登录成功:', data.user)
        return true
      } else {
        console.error('❌ 登录失败:', data.message)
        return false
      }
    } catch (error) {
      console.error('❌ 登录错误:', error)
      return false
    }
  }

  const logout = () => {
    user.value = null
    token.value = null
    isAuthenticated.value = false
    localStorage.removeItem('token')
  }

  const checkAuth = async () => {
    if (!token.value) {
      return false
    }

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
      const response = await fetch(`${baseUrl}/api/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token.value}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        user.value = data.user
        isAuthenticated.value = true
        return true
      } else {
        logout()
        return false
      }
    } catch (error) {
      console.error('验证错误:', error)
      logout()
      return false
    }
  }

  // 获取认证头
  const getAuthHeaders = () => {
    if (!token.value) {
      return {}
    }
    return {
      'Authorization': `Bearer ${token.value}`,
      'Content-Type': 'application/json'
    }
  }

  // 初始化时检查认证状态
  const initAuth = async () => {
    if (token.value) {
      await checkAuth()
    }
  }

  // 更新用户信息
  const updateUserInfo = (userInfo: Partial<User>) => {
    if (user.value) {
      user.value = { ...user.value, ...userInfo }
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    checkAuth,
    getAuthHeaders,
    initAuth,
    updateUserInfo
  }
}) 