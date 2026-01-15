<template>
  <div>
    <a-list :grid="{ column: 3}"
        :data-source="notes.records"
        style="height: 645px"
        bordered
        :locale="{emptyText:'还没有笔记,快点击➕添加你的笔记吧!'}"
    >
      <!-- 使用 renderItem 插槽 -->
      <template #renderItem="{ item }">
        <a-list-item >
          <a-card :title="item.title" :bodyStyle="{ height: '90px', overflow: 'auto',padding:'10px' }"   draggable="true"
                  @dragstart="(e) => onDragStart(e, item)"
          >
            {{item.content}}
            <template #actions>
              <delete-outlined key="delete" style="color: red" @click="onDelete(item.id)"/>
              <edit-outlined key="edit" @click="edit(item)"/>
            </template>
          </a-card>
        </a-list-item>
      </template>
    </a-list>
    <div class="pagination-wrapper">

      <a-pagination @change="loadData" v-model:current="queryParams.current" :total="notes.total" />
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
import { DeleteOutlined, EditOutlined,SearchOutlined,CloudUploadOutlined } from '@ant-design/icons-vue';
import { ref, watch} from 'vue'
import {getNotes,deleteNote} from '../../api/note'
import { Modal,message } from 'ant-design-vue'
import FileUpload from '../../components/FileUpload.vue'
import Search from '../../components/Search.vue'

const props = defineProps<{
  cid: string,
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

const queryParams = ref({
  current:1,
  size:9,
  categoryId:null
})
const notes = ref<{ records: Note[] }>({ records: [] })
function onDragStart(e: DragEvent, note) {
  e.dataTransfer?.setData(
      'application/json',
      JSON.stringify({ noteId: note.id })
  )
}
function onUpload() {
  uploadShow.value = true
}
function onSearch(){
  searchShow.value = true
}
function loadData() {
  queryParams.value.categoryId = props.cid
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
          message.success('删除成功')
        } else {
          message.error(resp.msg)
        }
      })
    }
  })
}
watch(
    () => props.cid,
    async (tid) => {
      if (!tid) {
        notes.value.records = []
        return
      }
      loadData()
    },
    { immediate: true }
)
</script>

<style>
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
</style>