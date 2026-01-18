<template>
  <div ref="vditorRef" style="height: 100%;"></div>
  <div class="floating-actions">
    <a-tooltip title="搜索" placement="left">
      <a-button
          shape="circle"
          type="default"
          @click="onSearch"
      >
        <SearchOutlined />
      </a-button>
    </a-tooltip>
    <a-tooltip title="保存" placement="left">
      <a-button
          shape="circle"
          type="primary"
          @click="onSave"
      >
        <SaveOutlined />
      </a-button>
    </a-tooltip>
    <a-tooltip title="分享" placement="left">
      <a-button
          shape="circle"
          type="default"
          @click="onCreatLink"
      >
        <ShareAltOutlined />
      </a-button>
    </a-tooltip>
  </div>
  <Search v-model:show="searchShow" :onEditTab="edit"/>
</template>

<script setup lang="ts">
import { onMounted, ref,defineExpose,nextTick  } from 'vue'
import Vditor from 'vditor'
import 'vditor/dist/index.css'
import {saveNote, getNoteById} from '../../api/note'
import {getLink} from '../../api/shareNote'
import { SearchOutlined,ShareAltOutlined,SaveOutlined } from '@ant-design/icons-vue'
import {message,Modal} from "ant-design-vue";
import Search from '../../components/Search.vue'


const props = defineProps<{
  onEditTabKey: (...any) => void
  onEditTab: (...any) => void
  activeKey:string
}>()
const vditorRef = ref<HTMLDivElement | null>(null)
const vditor = ref<Vditor>()
const searchShow = ref(false)
const note = ref({
  categoryId:'',
  title:'',
  id:'',
  content:' '
})
function onCreatLink(){
  let arr = props.activeKey.split('/')
  let id = arr[arr.length-1]
  let expireDay = localStorage.getItem('validDays') ?? 36500
  getLink({
    noteId:Number.parseInt(id),
    expireDay:Number.parseInt(expireDay),
    prefix:'http://localhost:5173/public/',
  }).then(resp=>{
    if (resp.code == 200){
      navigator.clipboard.writeText(resp.data)
      message.success('链接已复制')
    } else {
      message.error(resp.msg)
    }
  })
}
function checkSave(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (note.value.content.length == vditor.value.getValue().length) {
      resolve()
      return
    }

    Modal.confirm({
      title: '内容未保存，是否保存？',
      onOk: async () => {
        await onSave()
        resolve()
      },
      onCancel: () => {
        resolve()
      }
    })
  })
}
function onSearch(){
  searchShow.value = true
}

function edit(item){
  props.onEditTab(item.categoryId,item)
}
// 异步加载笔记内容
async function loadData(noteId?){
  if (noteId){
    getNoteById(noteId).then(resp=>{
      if (resp.code==200){
        note.value = resp.data
        init()

      }else {
        message.error(resp.msg)
      }
    })
  } else {
    init()
  }

}
function onSave(){
  if (vditor.value.getValue().length < 2) return
  let arr = props.activeKey.split('/')
  if (props.activeKey.includes('new')){
    note.value.categoryId = arr[arr.length-2]
  }else {
    note.value.id = arr[arr.length-1]
  }
  note.value.content = vditor.value.getValue();
  let tmplTitle = vditor.value.getValue().split('\n')[0]

  note.value.title = tmplTitle.slice(0, Math.min(tmplTitle.length, 30));
  saveNote(note.value).then(resp=>{
    if (resp.code==200){
      if (props.activeKey.includes('new')){
        props.onEditTabKey(arr[arr.length-1],resp.data,note.value.title)
        note.value.id = resp.data
      }
      message.success("已保存")
    }else {
      message.error(resp.msg)
    }
  })
}
onMounted(() => {
  loadData()
})

async function init(){
  await nextTick()
  vditor.value = new Vditor(vditorRef.value!, {
    height	: '100vh',
    width:'100%',
    mode: 'ir',
    counter: {
      enable: true,
      type: 'text', // 可选：markdown / text
    },
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
    value: note.value.content
  })
}
defineExpose({
  loadData,
  checkSave
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