<template>

  <div @contextmenu.prevent>
    <!-- 树形组件 -->
    <a-directory-tree
        :tree-data="treeData"
        :defaultExpandedKeys="expandedKeys"
        :defaultSelectedKeys="selectedKeys"
        :field-names="{ title: 'name', key: 'id', children: 'children' }"
        @select="handleSelect"
    >
      <template #title="{ name, dataRef }">
        <a-dropdown :trigger="['contextmenu']">
          <span>{{ name }}</span>
          <template #overlay>
            <a-menu @click="({ key: menuKey }) => onContextMenuClick(dataRef.id, menuKey)">
              <a-menu-item key="addDir">新增目录</a-menu-item>
              <a-menu-item key="rename">重命名</a-menu-item>
              <a-menu-item key="delete">删除</a-menu-item>
            </a-menu>
          </template>
        </a-dropdown>
      </template>
    </a-directory-tree>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted,defineProps } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps<{
  onEditTab: (any) => void
}>()

// 树数据
const treeData = ref([])
// 默认展开/选中
const expandedKeys = ref([1])
const selectedKeys = ref([1])

// 点击节点跳转
const handleSelect = (selectedKeysArr) => {
  props.onEditTab(selectedKeysArr[0])
}

const onContextMenuClick = (treeKey, menuKey) => {
  const node = findNodeByKey(treeData.value, treeKey)
  console.log('treeKey',treeKey)
  console.log('menuKey',menuKey)
  if (!node) return

  switch (menuKey) {
    case 'addDir':
      console.log('新增目录', node)
      break
    case 'rename':
      console.log('重命名', node)
      break
    case 'delete':
      console.log('删除', node)
      break
  }
}

// 辅助方法：根据 key 查找节点
const findNodeByKey = (nodes, key) => {
  for (const n of nodes) {
    if (n.id == key) return n
    if (n.children) {
      const child = findNodeByKey(n.children, key)
      if (child) return child
    }
  }
  return null
}
onMounted(() => {
  treeData.value = [
    {
      id: 1,
      name: '个人笔记',
      level: 1,
      children: [
        {
          id: 11,
          name: '学习',
          level: 2,
          children: [
            { id: 111, name: 'Java 基础', level: 3, children: [] },
            { id: 112, name: 'Spring Boot', level: 3, children: [] }
          ]
        },
        { id: 12, name: '生活', level: 2, children: [] }
      ]
    },
    {
      id: 2,
      name: '工作笔记',
      level: 1,
      children: [
        { id: 21, name: '需求分析', level: 2, children: [] },
        { id: 22, name: '会议纪要', level: 2, children: [] }
      ]
    }
  ]
  handleSelect(selectedKeys.value)
})
</script>
