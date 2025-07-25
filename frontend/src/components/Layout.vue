<template>
  <div class="layout">
    <!-- 顶部导航栏 -->
    <header class="header">
      <div class="header-left">
        <img src="/logo.png" alt="WellMotion" class="logo" />
        <h1 class="title">WellMotion</h1>
      </div>
      
      <div class="header-center">
        <h2 class="page-title">{{ pageTitle }}</h2>
      </div>
      
      <div class="header-right">
        <el-dropdown @command="handleUserCommand">
          <span class="user-info">
            <el-avatar :size="32" :src="userAvatar">
              {{ userInitials }}
            </el-avatar>
            <span class="username">{{ authStore.user?.name }}</span>
            <el-icon><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="profile">个人信息</el-dropdown-item>
              <el-dropdown-item command="settings">设置</el-dropdown-item>
              <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </header>

    <!-- 侧边导航栏 -->
    <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <nav class="nav-menu">
        <el-menu
          :default-active="activeMenu"
          :collapse="sidebarCollapsed"
          background-color="#2E4057"
          text-color="#FFFFFF"
          active-text-color="#FF6B35"
          router
        >
          <el-menu-item index="/dashboard">
            <el-icon><House /></el-icon>
            <span>工作台</span>
          </el-menu-item>
          
          <el-menu-item index="/members">
            <el-icon><User /></el-icon>
            <span>会员管理</span>
          </el-menu-item>
          
          <el-menu-item index="/templates">
            <el-icon><Files /></el-icon>
            <span>训练模板</span>
          </el-menu-item>
          
          <el-menu-item index="/logs">
            <el-icon><Document /></el-icon>
            <span>训练记录</span>
          </el-menu-item>
          
          <!-- 管理员菜单 -->
          <template v-if="authStore.user?.role === 'admin'">
            <el-divider />
            <el-menu-item index="/users">
              <el-icon><Setting /></el-icon>
              <span>用户管理</span>
            </el-menu-item>
            
            <el-menu-item index="/exercises">
              <el-icon><Operation /></el-icon>
              <span>训练动作</span>
            </el-menu-item>
            
            <el-menu-item index="/import">
              <el-icon><Upload /></el-icon>
              <span>数据导入</span>
            </el-menu-item>
          </template>
        </el-menu>
      </nav>
      
      <div class="sidebar-toggle" @click="toggleSidebar">
        <el-icon>
          <component :is="sidebarCollapsed ? 'Expand' : 'Fold'" />
        </el-icon>
      </div>
    </aside>

    <!-- 主内容区域 -->
    <main class="main-content">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { 
  House, User, Files, Document, Setting, ArrowDown, Expand, Fold, Operation, Upload 
} from '@element-plus/icons-vue'

import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const sidebarCollapsed = ref(false)

// 计算属性
const activeMenu = computed(() => route.path)
const pageTitle = computed(() => {
  const routeMap: Record<string, string> = {
    '/dashboard': '工作台',
    '/members': '会员管理',
    '/templates': '训练模板',
    '/logs': '训练记录',
    '/users': '用户管理',
    '/exercises': '训练动作',
    '/profile': '个人信息',
    '/settings': '系统设置'
  }
  return routeMap[route.path] || 'WellMotion'
})

const userAvatar = computed(() => '')
const userInitials = computed(() => {
  const name = authStore.user?.name || ''
  return name.charAt(0).toUpperCase()
})

// 方法
const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

const handleUserCommand = async (command: string) => {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'settings':
      router.push('/settings')
      break
    case 'logout':
      try {
        await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        })
        authStore.logout()
        router.push('/login')
      } catch {
        // 用户取消
      }
      break
  }
}
</script>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: white;
  border-bottom: 1px solid #E5E5E5;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  z-index: 1000;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  width: 32px;
  height: 32px;
}

.title {
  font-size: 20px;
  font-weight: bold;
  color: var(--primary-color);
  margin: 0;
}

.header-center {
  flex: 1;
  text-align: center;
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-color);
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.user-info:hover {
  background-color: #F5F5F5;
}

.username {
  font-size: 14px;
  color: var(--text-color);
}

.sidebar {
  position: fixed;
  top: 60px;
  left: 0;
  bottom: 0;
  width: 240px;
  background: linear-gradient(180deg, #2E4057 0%, #1E2A3A 100%);
  transition: width 0.3s;
  z-index: 999;
}

.sidebar.collapsed {
  width: 60px;
}

.nav-menu {
  height: calc(100% - 60px);
  overflow-y: auto;
}

.sidebar-toggle {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.1);
  cursor: pointer;
  color: white;
  transition: background-color 0.2s;
}

.sidebar-toggle:hover {
  background: rgba(0, 0, 0, 0.2);
}

.main-content {
  flex: 1;
  margin-left: 240px;
  margin-top: 60px;
  padding: 24px;
  background: var(--background-color);
  min-height: calc(100vh - 60px);
  transition: margin-left 0.3s;
}

.sidebar.collapsed + .main-content {
  margin-left: 60px;
}

/* 平板设备优化 */
@media (max-width: 1024px) {
  .sidebar {
    width: 200px;
  }
  
  .sidebar.collapsed {
    width: 50px;
  }
  
  .main-content {
    margin-left: 200px;
  }
  
  .sidebar.collapsed + .main-content {
    margin-left: 50px;
  }
}

@media (max-width: 768px) {
  .header {
    padding: 0 16px;
  }
  
  .title {
    font-size: 18px;
  }
  
  .page-title {
    font-size: 16px;
  }
  
  .sidebar {
    width: 180px;
  }
  
  .sidebar.collapsed {
    width: 40px;
  }
  
  .main-content {
    margin-left: 180px;
    padding: 16px;
  }
  
  .sidebar.collapsed + .main-content {
    margin-left: 40px;
  }
}
</style> 