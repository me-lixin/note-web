<template>
  <div ref="vditorRef" style="height: 100%;"></div>
  <div class="floating-actions">
    <a-tooltip title="搜索">
      <a-button
          shape="circle"
          type="default"
          @click="onSearch"
      >
        <SearchOutlined />
      </a-button>
    </a-tooltip>
    <a-tooltip title="保存">
      <a-button
          shape="circle"
          type="primary"
          @click="onSave"
      >
        <SaveOutlined />
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

</template>

<script setup lang="ts">
import { onMounted, ref, watch,computed  } from 'vue'
import { useRoute } from 'vue-router'
import Vditor from 'vditor'
import 'vditor/dist/index.css'
import { saveNote, getNoteById} from '../api/note'
import { SearchOutlined,ShareAltOutlined,SaveOutlined,CloudUploadOutlined } from '@ant-design/icons-vue'
import {message} from "ant-design-vue";

const route = useRoute()

const props = defineProps<{
  onEditTabKey: (...any) => void
}>()
const vditorRef = ref<HTMLDivElement | null>(null)
const vditor = ref<Vditor>()
const note = ref({
  categoryId:'',
  title:'',
  id:'',
  content:''
})
// 异步加载笔记内容
function loadData(noteId){
    getNoteById(noteId).then(resp=>{
      if (resp.code==200){
        note.value = resp.data || note.value
        init(note.value.content)
      }else {
        message.error(resp.msg)
      }
    })
}
function onSave(){
  console.log('route',route)
  if (route.params.nid){
    note.value.id = route.params.nid as string
  } else {
    note.value.categoryId = route.params.tid as string
    note.value.content = vditor.value.getValue();
    note.value.title = vditor.value.getValue().split('\n')[0];
  }
  console.log('note.value',note.value)

  saveNote(note.value).then(resp=>{
    if (resp.code==200){
      props.onEditTabKey(resp.data,note.value.title)
      note.value.id = resp.data
      message.success("已保存")
    }else {
      message.error(resp.msg)
    }
  })
}
onMounted(() => {
  console.log('onMounted',route)
  if (route.params.nid){
    loadData(route.params.nid)
  } else {
    init('')
  }
})

watch(()=>route.params.nid,(nid)=>{
  if (nid){
    console.log('watch',route.params.nid)
    loadData(route.params.nid)
  } else {
    init('')
  }
})

function init(content){
  vditor.value = new Vditor(vditorRef.value!, {
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
    value: content
  })
}
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
/* 悬浮按钮容器 */
.floating-actions {
  position: fixed;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;

  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 按钮增强一点质感 */
.floating-actions .ant-btn {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>