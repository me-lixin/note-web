<template>
  <div ref="vditorRef" style="height: 100%;"></div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch  } from 'vue'
import { useRoute } from 'vue-router'
import Vditor from 'vditor'
import 'vditor/dist/index.css'
import { updateNote,getNoteById } from '@/api/note'
import { defineProps } from 'vue'

const props = defineProps<{
  editors: Map<string, Vditor>
  noteId: string
}>()

const route = useRoute()
const vditorRef = ref<HTMLDivElement | null>(null)
const content = ref('')
const editor = ref<Vditor>()


// 异步加载笔记内容
const loadNoteContent = async (id) => {
  content.value = '模拟数据:' + id
}

onMounted(() => {
  if (props.noteId.includes('new')){
    editor.value = new Vditor(vditorRef.value!, {
      height	: '100vh',
      width:'100%',
      mode: 'ir',
      toolbarConfig: {
        pin: true,        // 是否固定在顶部
      },
      preview:{
        maxWidth:1200,
        // mode:editor,
      },
      cache: {
        enable: false,
        id: 'disable-cache'  // 即使不启用也必须提供
      },
      placeholder: '请输入笔记内容...',
      value: content.value
    })
    props.editors.set(props.noteId,editor)
  } else {
    editor.value = props.editors.get(props.noteId)
    loadNoteContent(route.query.id)
    editor.value.value = content.value
  }
})

</script>

<style>
.vditor {
  border: none;
  box-shadow: none;
}
/* 整个工具栏 */
.vditor-toolbar {
  background-color: #fff;  /* 背景色 */
  min-height: 50px;                /* 高度 */
  align-items: flex-start;         /* 垂直居中 */
  border: none !important;
}
/* 按钮大小和间距 */
.vditor-toolbar__item {
  width: 36px;                 /* 按钮宽度 */
  height: 36px;                /* 按钮高度 */
  margin: 10px 4px 9px 4px;               /* 按钮左右间距 */
}
.vditor-toolbar__divider{
  margin-top: 10px;
  height: 36px;
}


/* 编辑区内容背景和内边距 */
.vditor-ir-wrap,
.vditor-ir .vditor-reset {
  background-color: #fff !important;
}

</style>