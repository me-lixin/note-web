<template>
  <div style="height: 620px;overflow: scroll">
    <div ref="vditorRef">
      <a-result title="正在努力加载中......">
        <template #icon>
          <loading-outlined />
        </template>
      </a-result>
    </div>
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
    <a-tooltip title="保存" placement="left">
      <a-button
          shape="circle"
          type="primary"
          @click="onSave(true)"
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
import { onMounted, ref,defineExpose,nextTick } from 'vue'
import Vditor from 'vditor'
import 'vditor/dist/index.css'
import {saveNote, getNoteById} from '../../api/note'
import {getLink} from '../../api/shareNote'
import { SearchOutlined,ShareAltOutlined,ToolOutlined,LoadingOutlined,SaveOutlined } from '@ant-design/icons-vue'
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
  id:'',
  content:'\n'
})
const isHide = ref(false)

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
function checkSave(): Boolean {
  if (!localStorage.getItem(note.value.id)
      || localStorage.getItem(note.value.id)=='\n'
      || vditor.value.getValue() == note.value.content
  ) {
    localStorage.removeItem(note.value.id)
    return false
  }else {
    localStorage.removeItem(note.value.id)
    return true
  }

}
function onSearch(){
  searchShow.value = true
}

function edit(item){
  props.onEditTab(item.categoryId,item)
}
function onSave(isReload?){
  let arr = props.activeKey.split('/')
  if (props.activeKey.includes('new')){
    note.value.categoryId = arr[arr.length-2]
    note.value.id = null
  }else {
    note.value.id = arr[arr.length-1]
  }
  note.value.title = stripMarkdown(vditor.value.getValue().slice(0, Math.min(vditor.value.getValue().indexOf('\n'), 30)));
  note.value.content = vditor.value.getValue();
  saveNote(note.value).then(resp=>{
    if (resp.code==200){
      if (props.activeKey.includes('new') && isReload){
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
  return str.replace("[^a-zA-Z0-9\\u4e00-\\u9fa5,，\\.。]", "");
}
async function loadData(noteId?){
  if (noteId){
    getNoteById(noteId).then(resp=>{
      if (resp.code==200){
        note.value = JSON.parse(JSON.stringify(resp.data))
        init(noteId)
      }else {
        message.error(resp.msg)
      }
    })
  }else {
    let arr = props.activeKey.split('/')
    note.value.id = arr[arr.length-1]
    init(arr[arr.length-1])
  }
}
// 隐藏工具栏
function hideShowToolbar() {
  isHide.value = !isHide.value
  const toolbar = vditorRef.value.querySelector('.vditor-toolbar')
  if (!isHide.value) {
    toolbar.style.display = 'none'
  }else {
    toolbar.style.display = 'flex'
  }
}
onMounted(() => {
  if (props.activeKey.includes('new')){
    loadData()
  }
})

async function init(id){
  await nextTick()
  vditor.value = new Vditor(vditorRef.value!, {
    height	: '100%',
    width:'100%',
    mode: 'ir',
    // lang: 'zh_CN',
    // cdn: '',
    paste: {
      upload: true,
    },
    upload: {
      url: '/api/note/upload',
      fieldName: 'file',
      max: 10 * 1024 * 1024,
      multiple: false,
      accept: 'image/*',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      format(files, responseText) {
        const res = JSON.parse(responseText);
        const name = files[0].name;
        const url = res.uplaodRes;
        const result = JSON.stringify({
          code: 0,
          data: res.data,
        });
        console.log('result',result)
        return result;
      },
    },
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
      enable: true,
      id: id  // 即使不启用也必须提供
    },
    placeholder: '请输入笔记内容...',
    value: note.value.content,
    after() {
      const toolbar = vditorRef.value.querySelector('.vditor-toolbar')
      if (toolbar) {
        toolbar.style.display = 'none'
      }
    }
  })
}

defineExpose({
  loadData,
  onSave,
  checkSave
})
</script>

<style>
.vditor {
  border: none;
  box-shadow: none;
}
.vditor-toolbar {
  position: sticky;
  top: 0px;
  padding-bottom: 20px;
  background-color: #fff;   /* 背景色 */
  min-height: 50px;         /* 高度 */
  display: flex;            /* 必须是 flex 布局 */
  flex-wrap: nowrap;        /* ⭐ 阻止换行 */
  align-items: center;      /* 垂直居中 */
  border: none !important;
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