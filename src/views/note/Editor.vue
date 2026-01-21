<template>
  <div ref="vditorRef" style="height: 100%;">
    <a-result title="正在努力加载中......" >
      <template #icon>
        <loading-outlined />
      </template>
    </a-result>
  </div>
  <div class="floating-actions">
    <a-tooltip title="工具栏" placement="left">
      <a-button
          shape="circle"
          type="default"
          @click="hideShowToolbar"
      >
        <ToolOutlined />
      </a-button>
    </a-tooltip>

    <a-tooltip title="搜索" placement="left">
      <a-button
          shape="circle"
          type="default"
          @click="onSearch"
      >
        <SearchOutlined />
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
import { onMounted, ref,defineExpose,nextTick ,onBeforeUnmount } from 'vue'
import Vditor from 'vditor'
import 'vditor/dist/index.css'
import {saveNote, getNoteById} from '../../api/note'
import {getLink} from '../../api/shareNote'
import { SearchOutlined,ShareAltOutlined,ToolOutlined,LoadingOutlined } from '@ant-design/icons-vue'
import {message,Modal} from "ant-design-vue";
import Search from '../../components/Search.vue'
import {copyText} from '../../utils/copyUtil'

const props = defineProps<{
  onEditTabKey: (...any) => void
  onEditTab: (...any) => void
  activeKey:string
}>()
const apiBaseUrl = import.meta.env.VITE_WEB_SERVICE_IP
const vditorRef = ref<HTMLDivElement | null>(null)
const vditor = ref<Vditor>()
const searchShow = ref(false)
const note = ref({
  categoryId:'',
  title:'',
  summary:'',
  id:'',
  content:' '
})
const isHide = ref(false)
let autoSaveTimer: number | null = null

function onEditorInput() {
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer)
    }
    autoSaveTimer = window.setTimeout(() => {
      onSave(true)
    }, 5000) // 5 秒无输入才保存
}

function onCreatLink(){
  let arr = props.activeKey.split('/')
  let id = arr[arr.length-1]
  let expireDay = localStorage.getItem('validDays') ?? 36500
  getLink({
    noteId:Number.parseInt(id),
    expireDay:Number.parseInt(expireDay),
    prefix: apiBaseUrl,
  }).then(resp=>{
    if (resp.code == 200){
      copyText(resp.data)
          .then(() => message.success('复制成功'))
          .catch(() => message.error('复制失败'))
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
      title: '本次编辑内容未保存，是否保存？',
      okText:"保存",
      cancelText:"丢弃",
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
function onSave(show?){
  if (vditor.value.getValue() == note.value.content) return message.success("已保存")
  let arr = props.activeKey.split('/')
  if (props.activeKey.includes('new')){
    note.value.categoryId = arr[arr.length-2]
  }else {
    note.value.id = arr[arr.length-1]
  }
  note.value.content = vditor.value.getValue();
  let tmplTitle = vditor.value.getValue().split('\n')[0]

  note.value.title = stripMarkdown(tmplTitle.slice(0, Math.min(tmplTitle.length, 30)));
  let tmplSummary = vditor.value.getValue().slice(0, 150).replace('tmplTitle','')
  note.value.summary = stripMarkdown(tmplSummary);
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
function stripMarkdown(str: string) {
  return str
      .replace(/(\*\*|__)(.*?)\1/g, '$2')    // 粗体
      .replace(/(\*|_)(.*?)\1/g, '$2')       // 斜体
      .replace(/~~(.*?)~~/g, '$1')           // 删除线
      .replace(/`(.*?)`/g, '$1')             // 行内代码
      .replace(/!\[.*?\]\(.*?\)/g, '')       // 图片
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')    // 链接文字
      .replace(/#+\s*(.*)/g, '$1')           // 标题
      .replace(/^\s*[-*+]\s+/gm, '')         // 列表
      .replace(/>\s+(.*)/g, '$1')            // 块引用
      .replace(/```[\s\S]*?```/g, '')        // 代码块
      .replace(/\n{2,}/g, '\n');             // 多行换行归一
}
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
// 隐藏工具栏
function hideShowToolbar() {
  isHide.value = !isHide.value
  const toolbar = document.querySelector('.vditor-toolbar')
  if (!isHide.value) {
    toolbar.style.display = 'none'
  }else {
    console.log('isHide.value','flex')
  }
}
onMounted(() => {
  if (props.activeKey.includes('new')){
    loadData()
  }
})

async function init(){
  await nextTick()
  vditor.value = new Vditor(vditorRef.value!, {
    height	: '90vh',
    width:'100%',
    mode: 'ir',
    counter: {
      enable: true,
      type: 'text', // 可选：markdown / text
    },
    toolbar: [
      { name: 'headings', tipPosition: 's' },
      { name: 'bold', tipPosition: 's' },
      { name: 'italic', tipPosition: 's' },
      { name: 'strike', tipPosition: 's' },
      { name: 'inline-code', tipPosition: 's' },
      { name: 'code', tipPosition: 's' },
      { name: '|', tipPosition: 's' },
      { name: 'line', tipPosition: 's' },
      { name: 'quote', tipPosition: 's' },
      { name: 'list', tipPosition: 's' },
      { name: 'ordered-list', tipPosition: 's' },
      { name: 'check', tipPosition: 's' },
      { name: 'upload', tipPosition: 's' },
      { name: 'link', tipPosition: 's' },
      { name: 'table', tipPosition: 's' },
      { name: '|', tipPosition: 's' },
      { name: 'fullscreen', tipPosition: 's' },
      { name: 'outline', tipPosition: 's' },
      { name: '|', tipPosition: 's' },
      { name: 'export', tipPosition: 's' }
    ],
    toolbarConfig: {
      pin: true,        // 是否固定在顶部
    },
    preview:{
      maxWidth:1200,
    },
    cache: {
      enable: false,
      id: 'disable-cache'  // 即使不启用也必须提供
    },
    placeholder: '请输入笔记内容...',
    value: note.value.content,
    input() {
      onEditorInput()
    },
    after() {
      const toolbar = document.querySelector('.vditor-toolbar')
      if (toolbar) {
        toolbar.style.display = 'none'
      }
    }
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
.vditor-toolbar {
  padding-bottom: 20px;
  background-color: #fff;   /* 背景色 */
  min-height: 50px;         /* 高度 */
  display: flex;            /* 必须是 flex 布局 */
  flex-wrap: nowrap;        /* ⭐ 阻止换行 */
  align-items: center;      /* 垂直居中 */
  border: none !important;
  margin-bottom: 10px;
  overflow-x: auto;         /* ⭐ 横向滚动 */
  scrollbar-width: thin;    /* Firefox 横向滚动条细一点，可选 */
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
/* 编辑模式 */
.vditor-ir,
.vditor-wysiwyg {
  padding-bottom: 20px !important;
}

/* 编辑区内容背景和内边距 */
.vditor-ir-wrap,
.vditor-ir .vditor-reset {
  background-color: #fff !important;
  padding: 0px 35px !important;
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