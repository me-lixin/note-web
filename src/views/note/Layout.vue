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
          <NoteTree
              :onEditTab="handleEditTabFromTree"
          />
        </a-card>
      </a-layout-sider>

      <a-layout style="background: #fff">
        <a-tabs
            type="editable-card"
            size="small"
            :activeKey="activeKey"
            :tabBarGutter="0"

            :tabBarStyle="{ background:'#f0f0f0' }"
        >
          <!--            @change="onTabChange"-->
          <!--            @edit="onTabEdit"-->
          <a-tab-pane
              v-for="tab in tabs"
              :key="tab.key"
              :tab="tab.title"
              :closable="tab.closable"
          >
            <a-layout-content style="padding: 0; position: relative">
              <router-view v-slot="{ Component }">
                <component
                    :is="Component"
                    :noteId="noteId"
                    :cid="cid"
                    :editors="editors"
                    :onEditTab="handleEditTabFromList"
                />
              </router-view>
            </a-layout-content>
          </a-tab-pane>
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
import { computed,ref,nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { EditOutlined } from '@ant-design/icons-vue'
import NoteTree from '@/components/NoteTree.vue'
//状态管理
const noteId = ref()
const cid = ref()
const editors = ref(new Map)
const activeKey = ref('home')
const tabs = ref([{key: 'home', title: '笔记列表', closable: false}])
const router = useRouter()

async function handleEditTabFromTree(tid,nid){
  cid.value = tid
}
function handleEditTabFromList(tid,nid){
  noteId.value = nid
  console.log('tid',tid)
  console.log('nid',nid)
  router.push(`note/${tid}/${nid}`)

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