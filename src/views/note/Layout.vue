<template>
  <a-layout style="height: 100vh">
    <a-layout>
      <a-layout-sider
          zeroWidthTriggerStyle="position: absolute; top: 350px; left: 0px; border-radius: 50px;"
          collapsible
          :collapsedWidth="0"
          theme="light"
          width="200"
      >
        <a-card style="height: 100%;border-radius: 0;">
          <template #title>
            <div class="card-title">
              <EditOutlined class="title-icon" />
              <span>肄宁在线笔记</span>
            </div>
          </template>
          <NoteTree />
        </a-card>
      </a-layout-sider>

      <a-layout style="background: #fff">
        <a-tabs
            type="editable-card"
            size="small"
            :activeKey="activeKey"
            :tabBarGutter="0"
            @change="onTabChange"
            @edit="onTabEdit"
            :tabBarStyle="{ background:'#f0f0f0' }"
        >
          <a-tab-pane
              v-for="tab in tabs"
              :key="tab.key"
              :tab="tab.title"
              :closable="tab.closable"
          />
          <!-- 右侧额外内容 -->
          <template #rightExtra>
            <a-dropdown>
              <template #overlay>
                <a-menu>
                  <a-menu-item key="profile">个人资料</a-menu-item>
                  <a-menu-item key="logout">退出登录</a-menu-item>
                </a-menu>
              </template>
              <a-avatar style="color: #f56a00; background-color: #fde3cf; margin-right: 15px;">U</a-avatar>
            </a-dropdown>
          </template>
        </a-tabs>
        <a-layout-content style="padding: 0; position: relative">
          <router-view />
        </a-layout-content>
        <!-- 右侧悬浮操作区 -->
        <div class="floating-actions">
          <a-tooltip title="搜索">
            <a-button
                shape="circle"
                type="primary"
                @click="onSearch"
            >
              <SearchOutlined />
            </a-button>
          </a-tooltip>
          <a-tooltip title="分享">
            <a-button
                shape="circle"
                type="default"
                @click="onShare"
            >
              <ShareAltOutlined />
            </a-button>
          </a-tooltip>
        </div>
      </a-layout>
    </a-layout>
  </a-layout>
</template>


<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { EditOutlined } from '@ant-design/icons-vue'
import NoteTree from '@/components/NoteTree.vue'



const route = useRoute()
const router = useRouter()

/**
 * Tabs 完全由当前路由 + 已访问路由派生
 * 这里只保留一个“访问过的 route 集合”
 */
const visitedRoutes = new Set()

/**
 * 当前激活 tab
 */
const activeKey = computed(() => route.fullPath)

/**
 * 根据 route 生成 tab 信息
 */
function resolveTab(route) {
  const { path, params, query, fullPath } = route

  if (path === '/list') {
    return {
      key: fullPath,
      title: '概览',
      closable: false
    }
  }

  if (path === '/note/new') {
    return {
      key: fullPath,
      title: '新笔记',
      closable: true
    }
  }

  if (path.startsWith('/note/') && params.id) {
    return {
      key: fullPath,
      title: `笔记 ${params.id}`,
      closable: true
    }
  }

  return {
    key: fullPath,
    title: fullPath,
    closable: true
  }
}

/**
 * Tabs 列表（派生数据）
 */
const tabs = computed(() => {
  // 记录访问过的路由
  visitedRoutes.add(route.fullPath)
  let tabs = Array.from(visitedRoutes).map(path => {
    return resolveTab(router.resolve(path))
  })
  console.log('tabs',tabs)
  return tabs
})

/**
 * 点击 tab：只做 router.push
 */
function onTabChange(key: string) {
  if (key !== route.fullPath) {
    router.push(key)
  }
}

/**
 * 关闭 tab
 */
function onTabEdit(targetKey: string, action: 'remove') {
  if (action !== 'remove') return

  const paths = Array.from(visitedRoutes)
  const index = paths.indexOf(targetKey)

  visitedRoutes.delete(targetKey)

  // 如果关闭的是当前 tab，跳转到前一个
  if (targetKey === route.fullPath) {
    const next =
        paths[index - 1] ||
        paths[index + 1] ||
        '/list'

    router.push(next)
  }
}
</script>

<style>
#components-layout-demo-fixed-sider .logo {
  height: 32px;
  background: rgba(255, 255, 255, 0.2);
  margin: 16px;
}
.site-layout .site-layout-background {
  background: #fff;
}

[data-theme='dark'] .site-layout .site-layout-background {
  background: #141414;
}
.card-title {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.title-icon {
  font-size: 16px;
}
.ant-tabs-top > .ant-tabs-nav,
.ant-tabs-bottom > .ant-tabs-nav {
  margin-bottom: 0 !important;
}
.editor-wrapper {
  position: relative;
  height: 100%;
}

/* 悬浮按钮容器 */
.floating-actions {
  position: fixed;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1000;

  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 按钮增强一点质感 */
.floating-actions .ant-btn {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
/* Tab 标签本身 */
.ant-tabs-card > .ant-tabs-nav .ant-tabs-tab,
.ant-tabs-card > .ant-tabs-nav .ant-tabs-tab-active {
  border-radius: 0 !important;
  border-left: none;
  border-bottom: none !important;}
/* 去掉 + 按钮边框 */
.ant-tabs-nav-add {
  border: none !important;
}

</style>