<template>
  <div>
    <a-list :grid="{ column: 3}"
        :data-source="notes"
        bordered
    >
      <!-- 使用 renderItem 插槽 -->
      <template #renderItem="{ item }">
        <a-list-item >
          <a-card :title="item.title" :bodyStyle="{ height: '120px', overflow: 'auto' }">
            Card contentCard contentCard content
            Card contentCard contentCard content
            Card contentCard contentCard content
            <template #actions>
              <delete-outlined key="delete" style="color: red" @click="onDelete(item.id)"/>
              <edit-outlined key="edit" @click="edit(item.id)"/>
            </template>
          </a-card>
        </a-list-item>
      </template>
    </a-list>
  </div>
</template>

<script setup lang="ts">
import { useRouter,useRoute } from 'vue-router'
import { DeleteOutlined, EditOutlined } from '@ant-design/icons-vue';
import {ref,defineExpose,computed} from 'vue'

const props = defineProps<{
  cid: number,
  onEditTab: (...any) => void
}>()

const notes = computed(() => {
  return loadData(props.cid)
})

function loadData(cid: number) {
  console.log('加载数据，cid=', cid)
  return [
    { id: '1', title: `第一篇笔记 - ${cid}` },
    { id: '2', title: `第二篇笔记 - ${cid}` },
    { id: '3', title: `第三篇笔记 - ${cid}` },
    { id: '4', title: `第四篇笔记 - ${cid}` }
  ]
}
function edit(key){
  console.log(key)
  props.onEditTab(props.cid,key)
}
defineExpose({ loadData })
</script>

<style>
.ant-list-bordered {
  margin-top: 20px;
  border: none !important;
}
</style>