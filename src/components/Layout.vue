<template>
  <a-layout >
    <a-layout>
      <a-layout-sider
          zeroWidthTriggerStyle="position: absolute; top: 350px; left: 0px; width: 20px;background: black;"
          collapsible
          :collapsed="isMobile"
          :collapsedWidth="0"
          theme="light"
          :width="220"
          @collapse="handleCollapse"
      >
        <a-card style="height: 100%;border-radius: 0;">
          <template #title>
            <div class="card-title">
              <img src="@/assets/vue.svg" class="title-icon" />
              <span>肄宁在线笔记</span>
            </div>
          </template>
          <NoteTree ref="treeRef"
              :onEditTab="handleEditTabFromTree"
          />
        </a-card>
      </a-layout-sider>

      <a-layout style="background: #fff">
        <div class="tabs-sticky-wrapper">
          <a-tabs
              type="editable-card"
              size="small"
              :activeKey="activeKey"
              :tabBarGutter="0"
              @change="onTabChange"
              @edit="onTabEdit"
              :tabBarStyle="{ background:'#f0f0f0',position: 'sticky',top: 0,zIndex: '100' }"
          >
            <a-tab-pane
                v-for="tab in tabs"
                :key="tab.key"
                :tab="tab.title"
                :closable="tab.closable"
            >
              <a-layout-content style="padding: 0; position: relative">
                  <NoteList
                      v-if="tab.key === '/list'"
                      :key="tab.key"
                      :cid="cid"
                      :onLoadTree="handleLoadTree"
                      :onEditTab="handleEditTabFromList"
                      :ref="setEditorRef(tab.key)"
                  />
                <Editor
                    v-else
                    :key="tab.key"
                    :activeKey="activeKey"
                    :onEditTab="handleEditTabFromList"
                    :onEditTabKey="handleEditTabFromEditor"
                    :ref="setEditorRef(tab.key)"
                />
              </a-layout-content>
            </a-tab-pane>
            <!-- 右侧额外内容 -->
            <template #rightExtra>
              <a-dropdown>
                <template #overlay>
                  <a-menu @click="({ key: menuKey }) => onContextMenuClick(menuKey)">
                    <a-menu-item key="profile">个人资料</a-menu-item>
                    <a-menu-item key="share">分享管理</a-menu-item>
                    <a-menu-item key="logout">退出登录</a-menu-item>
                  </a-menu>
                </template>
                <a-avatar style="color: #f5f5f5; background-color: #8d6e63; margin-right: 15px;">{{user.nickname}}</a-avatar>
              </a-dropdown>
            </template>
          </a-tabs>
        </div>

      </a-layout>
    </a-layout>
  </a-layout>
  <ShareManage v-model:show="shareShow"/>
  <Profile v-model:show="profileShow"/>

</template>

<script setup lang="ts">
import {nextTick, ref, onMounted, onUnmounted, watch, computed} from 'vue'
import { useRouter } from 'vue-router'
import { EditOutlined} from '@ant-design/icons-vue'
import {message,Modal} from "ant-design-vue";
import NoteTree from './NoteTree.vue'
import Editor from '../views/note/Editor.vue'
import NoteList from '../views/note/NoteList.vue'
import ShareManage from '../components/ShareManage.vue'
import Profile from '../components/Profile.vue'

const router = useRouter()
//状态管理
const cid = ref()
const activeKey = ref('/list')
const profileShow = ref(false)
const treeRef = ref()

const tabs = ref([{key: '/list', title: '笔记列表', closable: false}])
const user = JSON.parse(localStorage.getItem('user'))
const shareShow = ref(false)
const editorRefs = new Map<string, any>()
//响应式管理
const isMobile = ref(window.innerWidth < 450)

function handleCollapse(state){
  isMobile.value = state
}
function setEditorRef(key: string) {
  return (el: any | null) => {
    if (el) {
      editorRefs.set(key, el)
    } else {
      editorRefs.delete(key)
    }
  }
}
function handleLoadTree(){
  treeRef.value.loadTree()
}
function getActiveEditor(key?:string) {
  return editorRefs.get(key ?? activeKey.value)
}
async function handleEditTabFromEditor(tempId,nid,title){
  let path = `/note/new/${cid.value}/${tempId}`
  console.log('path',path)
  let tab = tabs.value.find(tab=> tab.key == path)
  console.log('tab',tab)
  tab.key = `/note/edit/${cid.value}/${nid}`
  tab.title = title
  treeRef.value.loadTree()
  activeKey.value = tab.key
  await nextTick()
  getActiveEditor().loadData(nid)
}
function onContextMenuClick(menuKey){
  if (menuKey == 'logout'){
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.replace('/login')
    return
  }
  if (menuKey == 'profile'){
    profileShow.value = true
  }
  if (menuKey == 'share'){
    shareShow.value = true
  }
}
async function handleEditTabFromTree(tid,name){
  cid.value = tid
  activeKey.value = '/list'
  const tab = tabs.value.find(tab=>tab.key == '/list');
  tab.title = name
  await nextTick()
  getActiveEditor().loadData(tid)
}
async function handleEditTabFromList(tid,note){
  let tabKey = `/note/edit/${tid}/${note.id}`
  let exist = tabs.value.find((tab=> tab.key == tabKey))
  if(exist){
    activeKey.value = exist.key
  }else {
    tabs.value.push({key: tabKey, title: note.title, closable: true})
    activeKey.value = tabKey
  }
  await nextTick()
  getActiveEditor().loadData(note.id)

}
async function onTabChange(key){
  if (key == '/list'){
    activeKey.value = '/list'
    getActiveEditor().loadData(cid.value)
  }
  if (key.includes('new')){
    activeKey.value = key
  }
  if (key.includes('edit')){
    activeKey.value = key
    let arr = key.split('/')
    await nextTick()
    getActiveEditor().loadData(arr[arr.length-1])
  }
}
async function onTabEdit(tabKey,action){
  if (action == 'remove'){
    const editor = getActiveEditor(tabKey)
    if (!editor) return
    if (editor.checkSave()) {
      await new Promise<void>((resolve) => {
        Modal.confirm({
          title: '本次编辑内容未保存，是否保存？',
          okText:"保存",
          cancelText:"丢弃",
          onOk: async () => {
            await editor.onSave()
            resolve()
          },
          onCancel: () => resolve()
        })
      })
    }
    const index = tabs.value.findIndex(tab => tab.key === tabKey)
    const isActive = activeKey.value == tabKey
    tabs.value.splice(index, 1)
    let tab = tabs.value[index-1]
    if (!isActive) return
    activeKey.value = tab.key
    if (activeKey.value =='/list'){
      await getActiveEditor().loadData(cid.value)
      treeRef.value.loadTree()
    }
  }
  if (action == 'add'){
    let tempId = Date.now() as string
    let path = `/note/new/${cid.value}/${tempId}`
    tabs.value.push({key: path, title: '笔记', closable: true})
    activeKey.value = path
  }

}
</script>

<style>
.tabs-sticky-wrapper {

}
.ant-layout-sider-zero-width-trigger .anticon {
  display: none;
}

/* 收起状态 */
.ant-layout-sider-zero-width-trigger::before {
  content: "▶";
  color: white;
}

/* 展开后（父级 sider 展开时） */
.ant-layout-sider:not(.ant-layout-sider-collapsed)
.ant-layout-sider-zero-width-trigger::before {
  content: "◀";
  color: white;
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
  width: 40px;
  height: 40px;
  margin-top: -15px;
}
.ant-tabs-top > .ant-tabs-nav,
.ant-tabs-bottom > .ant-tabs-nav {
  margin-bottom: 10px !important;
  height: 40px;
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
  max-width: 140px;
  border-bottom: none !important;
}
/* 去掉 + 按钮边框 */
.ant-tabs-nav-add {
  border: none !important;
}
.ant-tabs-tab-btn {
  display: inline-block;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

</style>