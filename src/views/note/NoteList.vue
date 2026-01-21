<template>
  <div>
    <a-list
        v-if="!isMobile"
        :data-source="notes.records"
        style="height: 550px;overflow: auto;border-radius:0px"
        bordered
        :locale="{emptyText:'还没有笔记,快点击➕添加你的笔记吧!'}"
    >
      <!-- 使用 renderItem 插槽 -->
      <template #renderItem="{ item,index }">
        <a-list-item @click="edit(item)" :class="index % 2 == 0 ? 'list-item-even' : 'list-item-odd'">
            <span class="single-line-ellipsis">{{item.title}}</span>

            <template #actions>
              <div style="margin-right: 30px">
                <span style="font-size: 10px;font-family: monospace;">{{item.updateTime.replace('T', ' ')}}更新</span>
                <span style="font-size: 10px;font-family: monospace;margin-left: 80px">{{item.createTime.replace('T', ' ')}}创建</span>

                <share-alt-outlined key="share" style="margin-left: 100px" @click.stop="onCreatLink(item.id)"/>
                <delete-outlined key="delete" style="color: red;margin-left: 20px" @click.stop="onDelete(item.id)"/>
              </div>
            </template>
        </a-list-item>
      </template>
    </a-list>

    <a-list v-if="isMobile" :grid="{ column: 1}"
            :data-source="notes.records"
            bordered
            :locale="{emptyText:'还没有笔记,快点击➕添加你的笔记吧!'}"
    >
      <!-- 使用 renderItem 插槽 -->
      <template #renderItem="{ item }">
        <a-list-item >
          <a-card :title="item.title" :bodyStyle="{ height: '160px', overflow: 'auto',padding:'10px' }"   draggable="true"
                  @dragstart="(e) => onDragStart(e, item)" @dragend="onDragEnd(item)"
          >
            {{item.summary}}......
            <template #actions>
              <delete-outlined key="delete" style="color: red" @click="onDelete(item.id)"/>
              <edit-outlined key="edit" @click="edit(item)"/>
              <share-alt-outlined key="share" @click="onCreatLink(item.id)"/>
            </template>
          </a-card>
        </a-list-item>
      </template>
    </a-list>

    <div class="pagination-wrapper">
      <a-pagination @change="loadData(queryParams.categoryId)" v-model:current="queryParams.current" :total="notes.total" />
    </div>
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
      <a-tooltip title="上传">
        <a-button
            shape="circle"
            type="default"
            @click="onUpload"
        >
          <CloudUploadOutlined />
        </a-button>
      </a-tooltip>
    </div>
    <FileUpload v-model:show="uploadShow" :cid="props.cid"/>
    <Search v-model:show="searchShow" :onEditTab="edit"/>

  </div>
</template>

<script setup lang="ts">
import { DeleteOutlined, EditOutlined,SearchOutlined,CloudUploadOutlined,ShareAltOutlined } from '@ant-design/icons-vue';
import { ref,defineExpose,onMounted} from 'vue'
import {getNotes,deleteNote} from '../../api/note'
import { Modal,message } from 'ant-design-vue'
import FileUpload from '../../components/FileUpload.vue'
import Search from '../../components/Search.vue'
import {getLink} from "../../api/shareNote";
import {copyText} from "../../utils/copyUtil";

const props = defineProps<{
  cid:string,
  onLoadTree:() => void,
  onEditTab: (...any) => void
}>()
export interface Note {
  id: string
  title: string
  content: string
  updateTime?: string
}
const uploadShow = ref(false)
const searchShow = ref(false)
const apiBaseUrl = import.meta.env.VITE_WEB_SERVICE_IP
const isMobile = ref(window.innerWidth < 450)

const queryParams = ref({
  current:1,
  size:11,
  categoryId:null
})
const notes = ref<{ records: Note[] }>({ records: [] })
function onDragStart(e: DragEvent, note) {
  e.dataTransfer?.setData(
      'application/json',
      JSON.stringify({ noteId: note.id })
  )
}
function onCreatLink(id){
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
function onDragEnd(note) {
  setTimeout(()=>loadData(note.categoryId),200)
  console.log('noteDr',note)
}
function onUpload() {
  uploadShow.value = true
}
function onSearch(){
  searchShow.value = true
}

function loadData(cid?) {
  queryParams.value.categoryId = cid
  getNotes(queryParams.value).then(resp=>{
    if (resp.code == 200){
      notes.value = resp.data
    } else {
      message.error(resp.msg)
    }
  })
}
function edit(item){
  props.onEditTab(item.categoryId,item)
}

function onDelete(id) {
  Modal.confirm({
    title: '确认删除',
    content: '删除后将无法恢复，是否继续？',
    okText: '删除',
    okType: 'danger',
    cancelText: '取消',
    onOk() {
      return deleteNote(id).then(resp => {
        if (resp.code === 200) {
          notes.value.records = notes.value.records.filter(n => n.id !== id)
          props.onLoadTree()
          message.success('删除成功')
        } else {
          message.error(resp.msg)
        }
      })
    }
  })
}
defineExpose({
  loadData
})
</script>

<style>
.single-line-ellipsis {
  display: inline-block;
  white-space: nowrap;       /* 不换行 */
  overflow: hidden;          /* 超出隐藏 */
  text-overflow: ellipsis;   /* 显示省略号 */
}
.ant-list-bordered {
  margin-top: 20px;
  border: none !important;
}
.list-container {
  position: relative;
  min-height: 100vh; /* 确保分页可以固定到底部 */
  padding-bottom: 80px; /* 给底部留空间，避免遮挡 */
}

.pagination-wrapper {
  text-align: center;
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
:deep(.note-item.zebra) {
  background-color: #fafafa;
}

:deep(.note-item:hover) {
  background-color: #e6f4ff;
}
.list-item-even {
  background-color: rgba(0, 0, 0, 0.04); /* 浅灰色 */
}

.list-item-odd {
  background-color: #ffffff; /* 白色 */
}


</style>