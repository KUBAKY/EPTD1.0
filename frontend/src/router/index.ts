import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/members',
    name: 'Members',
    component: () => import('@/views/Members.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/members/:id',
    name: 'MemberDetail',
    component: () => import('@/views/MemberDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/templates',
    name: 'Templates',
    component: () => import('@/views/Templates.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/training/:member_id',
    name: 'Training',
    component: () => import('@/views/Training.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/training/new',
    name: 'NewTraining',
    component: () => import('@/views/Training.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/logs',
    name: 'Logs',
    component: () => import('@/views/Logs.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/users',
    name: 'Users',
    component: () => import('@/views/Users.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/exercises',
    name: 'Exercises',
    component: () => import('@/views/Exercises.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/test',
    name: 'Test',
    component: () => import('@/views/TestPage.vue'),
    meta: { requiresAuth: false }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('@/views/Profile.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/Settings.vue'),
    meta: { requiresAuth: true }
  },
  {
  path: '/import',
  name: 'Import',
  component: () => import('@/views/Import.vue'),
  meta: { requiresAuth: true }
},
{
  path: '/course-operations',
  name: 'CourseOperations',
  component: () => import('@/views/CourseOperations.vue'),
  meta: { requiresAuth: true }
}
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth) {
    // 检查认证状态
    if (!authStore.isAuthenticated) {
      next('/login')
      return
    }
    
    // 验证token有效性
    try {
      const isValid = await authStore.checkAuth()
      if (!isValid) {
        next('/login')
        return
      }
    } catch (error) {
      console.error('认证验证失败:', error)
      next('/login')
      return
    }
  }
  
  // 已登录用户访问登录页，重定向到工作台
  if (to.path === '/login' && authStore.isAuthenticated) {
    next('/dashboard')
    return
  }
  
  next()
})

export default router 