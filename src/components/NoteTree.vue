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
        <a-dropdown v-if="!dataRef.editing" :trigger="['contextmenu']" style="position: relative">


          <span style="max-width: 100px; display: block;overflow: auto; min-height: 20px;"
                class="tree-drop-node"
                :id="dataRef.id"
                @dragover.prevent
                @drop="(e) => onDrop(e, dataRef)"
          >{{dataRef.name}}
            <a-tooltip title="该目录下的笔记数量">
              <span v-if="dataRef.count<100" class="count">{{dataRef.count ?? 0}}</span>
              <span v-else class="count count-max">99+</span>
            </a-tooltip>
          </span>

          <template #overlay>
            <a-menu v-if="dataRef.level<3" @click="({ key: menuKey }) => onContextMenuClick(dataRef.id, menuKey)">
              <a-menu-item key="addDir">新增目录</a-menu-item>
              <a-menu-item key="rename">重命名</a-menu-item>
              <a-menu-item key="delete">删除</a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </template>
    </a-tree>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted,nextTick } from 'vue'
import {getTree,updateCategory,deleteCategory} from '../api/noteCategory'
import {moveNote} from '../api/note'
import { message } from 'ant-design-vue'

const props = defineProps<{
  onEditTab: (any) => void
}>()

// 树数据
const treeData = ref([])
// 展开/选中
const expandedKeys = ref<string[]>([])
const selectedKeys = ref<string[]>([])
const customExpanded = ref<Set<string>>(new Set())
const inputRef = ref()

function onDragStart(e: DragEvent) {
  console.log(e.node.id)
  console.log(e)
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
const handleSelect = (keys) => {
  if (keys.length ) {
    selectedKeys.value = keys
    props.onEditTab(keys[0])
  }
  if (keys.length == 0 && customExpanded.value.size > 1){
    customExpanded.value.delete(selectedKeys.value.pop())
  } else if(keys.length > 0){
    customExpanded.value.add(keys[0])
  }
  expandedKeys.value = [...customExpanded.value]
  if (expandedKeys.value.length == 0){
    selectedKeys.value = []
  }
  console.log(keys)
  console.log(customExpanded.value)
  console.log(expandedKeys.value)
}

const onContextMenuClick = (treeKey, menuKey) => {
  const node = findNodeByKey(treeData.value, treeKey)
  if (!node) return
  switch (menuKey) {
    case 'addDir':
      addDir(treeKey)
      break
    case 'rename':
      renameDir(treeKey)
      break
    case 'delete':
      deleteDir(node)
      break
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

function addDir(parentId) {
  const parent = findNodeByKey(treeData.value, parentId)
  if (!parent) return

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

  if (!expandedKeys.value.includes(parentId)) {
    expandedKeys.value.push(parentId)
  }
  parent.children.unshift(newNode)

  nextTick(() => {
    focusInput()
  })
}

function renameDir(id: string) {
  const node = findNodeByKey(treeData.value, id)
  if (!node) return

  node.editing = true

  nextTick(() => {
    focusInput()
  })
}

function deleteDir(node: any) {
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
      handleSelect(['1'])
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
    }
  })
}
function removeNode(id){
  deleteCategory(id).then(resp=>{
    if (resp.code == 500){
      message.error(resp.msg)
    }
    loadTree()
  })
}

onMounted( () => {
  loadTree()
})
</script>
<style>
.count{
  position: absolute;
  display: inline-block;
  width: 20px;
  top: 2px;
  text-align: center;
  background: #f0f0f0;
  left: -20px;
  line-height: 20px;
  border-radius: 50%;
  font-size: 10px;
  color: rgba(0, 0, 0, 0.88);
}
.count-max{
  font-size: 7px;
}
</style>