<template>
  <a-layout style="height: 100vh">
    <a-layout>
      <a-layout-sider
          zeroWidthTriggerStyle="position: absolute; top: 350px; left: 0px; border-radius: 50px;"
          collapsible
          :collapsedWidth="0"
          theme="light"
          width="220"
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
            @change="onTabChange"
            @edit="onTabEdit"
            :tabBarStyle="{ background:'#f0f0f0' }"
        >

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
                    :cid="cid"
                    :onEditTab="handleEditTabFromList"
                    :onEditTabKey="handleEditTabFromEditor"
                />
              </router-view>
            </a-layout-content>
          </a-tab-pane>
          <!-- 右侧额外内容 -->
          <template #rightExtra>
            <a-dropdown>
              <template #overlay>
                <a-menu @click="({ key: menuKey }) => onContextMenuClick(menuKey)">
                  <a-menu-item key="profile">个人资料</a-menu-item>
                  <a-menu-item key="logout">退出登录</a-menu-item>
                </a-menu>
              </template>
              <a-avatar style="color: #f5f5f5; background-color: #8d6e63; margin-right: 15px;">{{user.nickname}}</a-avatar>
            </a-dropdown>
          </template>
        </a-tabs>

      </a-layout>
    </a-layout>
  </a-layout>
</template>


<script setup lang="ts">
import { computed,ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { EditOutlined} from '@ant-design/icons-vue'
import NoteTree from '@/components/NoteTree.vue'


const router = useRouter()
const route = useRoute()
//状态管理
const cid = ref()
const activeKey = computed(()=> route.fullPath)
const tabs = ref([{key: '/list', title: '笔记列表', closable: false}])
const user = JSON.parse(localStorage.getItem('user'))
console.log('user',user)
function handleEditTabFromEditor(nid,title){
  let path = `/note/new/${cid.value}/${route.params.tempId}`
  let tab = tabs.value.find(tab=> tab.key == path)
  tab.key = `/note/edit/${cid.value}/${nid}`
  tab.title = title
  route.params.tempId = nid
  router.replace(tab.key)
}
function onContextMenuClick(menuKey){
  console.log(menuKey)
  if (menuKey == 'logout'){
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.replace('/login')
  }
}
async function handleEditTabFromTree(tid){
  cid.value = tid
}
function handleEditTabFromList(tid,note){
  let tabKey = `/note/edit/${tid}/${note.id}`
  let exist = tabs.value.find((tab=> tab.key == tabKey))
  if(exist){
    router.replace(tabKey)
  }else {
    tabs.value.push({key: tabKey, title: note.title, closable: true})
    router.replace(tabKey)
  }
  console.log('tabs',tabs.value)
}
function onTabChange(key){
  if (key == 'home'){
    router.replace('/list')
  }else {
    router.replace(key)
  }
}
function onTabEdit(tabKey,action){
  if (action == 'remove'){
    const index = tabs.value.findIndex(tab => tab.key === tabKey)
    const isActive = activeKey.value == tabKey

    tabs.value.splice(index, 1)

    if (!isActive) return

    router.replace(tabs.value[index - 1].key)
  }
  if (action == 'add'){
    let tempId = Date.now() as string
    let path = `/note/new/${cid.value}/${tempId}`
    tabs.value.push({key: path, title: '笔记', closable: true})
    router.replace(path)
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