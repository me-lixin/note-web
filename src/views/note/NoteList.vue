<template>
  <div>
    <a-list :grid="{ column: 3}"
        :data-source="notes"
        :rowKey="item => item.id"
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
              <edit-outlined key="edit" @click="open(item.id)"/>
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
import {defineProps} from "vue";

const props = defineProps<{
  cid: string
}>()
const router = useRouter()

const notes = [
  { id: '1', title: '第一篇笔记' },
  { id: '2', title: '第二篇笔记' },
  { id: '3', title: '第二篇笔记' },
  { id: '4', title: '第二篇笔记' }
]

const open = (id: string) => {
  router.push(`/note/${props.cid}/${id}`)
}
</script>

<style>
.ant-list-bordered {
  margin-top: 20px;
  border: none !important;
}
</style>