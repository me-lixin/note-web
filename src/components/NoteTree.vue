<template>

  <div >
    <!-- 树形组件 -->
    <a-tree
        draggable
        :tree-data="treeData"
        :expandedKeys="expandedKeys"
        :selectedKeys="selectedKeys"
        :field-names="{ title: 'name', key: 'id', children: 'children' }"
        @select="handleSelect"
        @dragstart="(e) => onDragStart(e)"
        style="height: 560px;overflow: auto;"
    >
      <template #title="{ name, dataRef }">
        <a-input
            v-if="dataRef.editing"
            size="small"
            v-model:value="dataRef.name"
            ref="inputRef"
            @blur="finishEdit(dataRef)"
        />
        <a-dropdown v-if="!dataRef.editing"
                    :open="activeMenuId === dataRef.id"
                    trigger="contextmenu"
                    style="position: relative">


          <span style="max-width: 100px; display: block;overflow: auto; min-height: 20px;"
                class="tree-drop-node"
                :id="dataRef.id"
                @dragover.prevent
                @drop="(e) => onDrop(e, dataRef)"
                @contextmenu.prevent="(e) => onRightClick(e, dataRef)"
                @touchstart="(e) => onTouchStart(e)"
                @touchend="onTouchEnd(dataRef)"
                @touchcancel="onTouchCancel"
          >
              {{dataRef.name}}
            <a-tooltip title="该目录下的笔记数量">
              <span v-if="dataRef.count > 100" class="count count-max">99+</span>
              <span v-else class="count">{{dataRef.count ?? 0}}</span>
            </a-tooltip>
          </span>

          <template #overlay>
            <a-menu @click="() => closeMenu()">
              <a-menu-item v-if="dataRef.level<3" @click="addDir(dataRef)">新增目录</a-menu-item>
              <a-menu-item v-if="dataRef.level<3" @click="renameDir(dataRef)">重命名</a-menu-item>
              <a-menu-item key="delete" @click="deleteDir(dataRef)">删除</a-menu-item>
              <a-menu-item key="clean">取消</a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </template>
    </a-tree>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted, nextTick, defineExpose} from 'vue'
import {getTree,updateCategory,deleteCategory} from '../api/noteCategory'
import {moveNote} from '../api/note'
import { message } from 'ant-design-vue'

const props = defineProps<{
  onEditTab: (any,string) => void
}>()

// 树数据
const treeData = ref([])
// 展开/选中
const expandedKeys = ref<string[]>([])
const selectedKeys = ref<string[]>([])
const customExpanded = ref<Set<string>>(new Set())
const inputRef = ref()
const rootId = ref()
const trigger = window.innerWidth < 450 ? ['click'] : ['contextmenu']
let timer: number | null = null
let isLongPress = false
const activeMenuId = ref<string | null>(null)

function onDragStart(e: DragEvent) {
  e.event.dataTransfer?.setData(
      'application/json',
      JSON.stringify({ cid: e.node.id })
  )
}
function onDrop(e: DragEvent, to) {
    const raw = e.dataTransfer?.getData('application/json') ?? ''
    if (raw == '') return

    if (raw.includes('cid')){
      let cid = JSON.parse(raw).cid
      let node = findNodeByKey(treeData.value,cid)
      if (to.level >1 && node.children.length > 0){
        message.error('目录层级将超过3级,迁移失败!')
        return;
      }
      if (to.id==node.parentId) return;
      const dragKey = node.id
      const dropKey = to.id
      // 1. 深拷贝，避免引用问题
      const data = JSON.parse(JSON.stringify(treeData.value))
      // 2. 先移除被拖动节点
      const dragNode = findAndRemoveNode(data, dragKey)
      // 3. 插入到新位置
      insertNode(
          data,
          dropKey,
          dragNode,
          null
      )
      // 4. 更新 treeData
      treeData.value = data
    }
  if (raw.includes('noteId')){
    let noteId = JSON.parse(raw).noteId
    moveNote({id:noteId,categoryId:to.id})
  }
}
/* ========== PC 右键 ========== */
function onRightClick(e: MouseEvent, node) {
  activeMenuId.value = node.id
}

/* ========== Mobile 长按 ========== */
function onTouchStart(e:TouchEvent) {
  e.stopPropagation()
  isLongPress = false
  timer = window.setTimeout(() => {
    isLongPress = true
  }, 600)
}

function onTouchEnd(node) {
  clearTimer()
  if (isLongPress){
    activeMenuId.value = node.id
  }
}

function onTouchCancel() {
  clearTimer()
}

/* ========== 通用 ========== */
function closeMenu() {
  activeMenuId.value = null
}

function clearTimer() {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
}

function findAndRemoveNode(tree, key) {
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i]
    if (node.id === key) {
      return tree.splice(i, 1)[0]
    }
    if (node.children) {
      const res = findAndRemoveNode(node.children, key)
      if (res) return res
    }
  }
}
function insertNode(tree, targetKey, node, dropToGap) {
  for (let i = 0; i < tree.length; i++) {
    const item = tree[i]

    if (item.id === targetKey) {
      if (!dropToGap) {
        // 插到节点内部
        item.children = item.children || []
        item.children.push(node)
        node.parentId = item.id
        editNode(node)
      }
      return true
    }

    if (item.children && insertNode(item.children, targetKey, node, dropToGap)) {
      return true
    }
  }
}


function focusInput() {
  inputRef.value?.focus?.()
}

// 点击节点跳转
const handleSelect = (keys,info) => {
  if (keys.length ) {
    selectedKeys.value = keys
    props.onEditTab(keys[0], info.name ?? info.node.name)
  }
  if (keys.length == 0 && customExpanded.value.size > 1){
    let nodeId = selectedKeys.value.pop();
    if (rootId.value != nodeId){
      customExpanded.value.delete(nodeId)
    }
  } else if(keys.length > 0){
    customExpanded.value.add(keys[0])
  }
  expandedKeys.value = [...customExpanded.value]
  if (expandedKeys.value.length == 0){
    selectedKeys.value = []
  }
}

// 辅助方法：根据 key 查找节点
function findNodeByKey(tree: any[], key: any): any | null {
  for (const node of tree) {
    if (node.id === key) {
      return node
    }
    if (node.children) {
      const found = findNodeByKey(node.children, key)
      if (found) return found
    }
  }
  return null
}

function addDir(parent) {
  if (!parent.children) {
    parent.children = []
  }

  const newNode = {
    id: Date.now()  as string,
    name: `新建目录${parent.children.length+1}`,
    children: [],
    parentId: parent.id,
    level: parent.level+1,
    sort: parent.sort+10+parent.children.length,
    editing: true,
    isNew: true
  }

  if (!expandedKeys.value.includes(parent.id)) {
    expandedKeys.value.push(parent.id)
  }
  parent.children.unshift(newNode)

  nextTick(() => {
    focusInput()
  })
}

function renameDir(node) {
  if (!node) return

  node.editing = true

  nextTick(() => {
    focusInput()
  })
}

function deleteDir(node: any) {
  if (node.level==1){
    message.warn("无法删除根目录!")
    return
  }
    removeNode(node.id)
}

function finishEdit(node: any) {
  const name = node.name?.trim()
  // 新建但没输入，直接删除
  if (!name) {
    if (node.isNew) {
      deleteDir(node)
    }
    node.editing = false
    return
  }
  editNode(node)
}

function loadTree(){
  getTree().then(resp=>{
    if (resp.code == 200){
      treeData.value = resp.data
      if (rootId.value){
        return
      }
      expandedKeys.value=[treeData.value[0].id]
      customExpanded.value.add(treeData.value[0].id)
      handleSelect([treeData.value[0].id],treeData.value[0])
      rootId.value = treeData.value[0].id
    } else {
      message.error(resp.msg)
    }
  })
}
function editNode(node){
  console.log(node)
  updateCategory(node).then(resp=>{
    if (resp.code == 500){
      message.error(resp.msg)
    }else {
      node.editing = false
      node.isNew = false
      loadTree()
    }
  })
}
function removeNode(id){
  deleteCategory(id).then(resp=>{
    if (resp.code == 500){
      message.error(resp.msg)
    }else {
      message.success('删除成功!')
    }
    loadTree()
  })
}

onMounted( () => {
  loadTree()
})
defineExpose({
  loadTree
})
</script>
<style>
.count{
  position: absolute;
  display: inline-block;
  width: 15px;
  top: 4px;
  text-align: center;
  background: #f0f0f0;
  left: -24px;
  line-height: 15px;
  border-radius: 50%;
  font-size: 9px;
  color: rgba(0, 0, 0, 0.88);
}
.count-max{
  font-size: 7px;
}
.ant-tree-switcher,
.ant-tree-switcher_open,
.ant-tree-switcher-noop {
  left: 10px; /* 或 padding-left，根据布局调整 */
}
</style>