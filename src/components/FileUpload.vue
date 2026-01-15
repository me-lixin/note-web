<template>
    <a-modal title="文件上传" v-model:open="modalOpen" :footer="null">
        <!-- 上传区域 -->
        <div
            class="upload-area"
            @dragover.prevent
            @drop.prevent="handleDrop"
            @click="fileInput.click()"
        >
          <p>点击或拖拽.md/.txt/.docx文件到这里上传</p>
          <input
              ref="fileInput"
              type="file"
              multiple
              class="hidden"
              accept=".md,.tex,.doc,.docx"
              @change="handleFiles"
          />
        </div>

        <!-- 上传列表 -->
        <ul class="file-list" v-if="files.length">
          <li v-for="(file, index) in files" :key="file.name">
            <span>{{ file.name }}</span>
            <span v-if="file.progress !== undefined">{{ file.progress }}%</span>
            <span v-if="file.status == 'uploading'">上传中...</span>
            <span v-if="file.status == 'success'" style="color: green">完成</span>
            <span v-if="file.status == 'error'" style="color: red">失败</span>

            <button @click="removeFile(index)">删除</button>
          </li>
        </ul>
    </a-modal>
</template>

<script setup lang="ts">
import { ref, reactive ,computed} from 'vue'
import { message } from 'ant-design-vue'
import {fileImport} from '../api/note'

const props = defineProps({
  show: Boolean,
  cid: String,
})
interface UploadFile {
  file: File
  name: string
  progress?: number
  status:'ready' | 'uploading' | 'success' | 'error'
}
const emit = defineEmits(['update:show'])

const modalOpen = computed({
  get: () => props.show,
  set: (val) => emit('update:show', val)
})
const ALLOW_EXT = ['md', 'tex', 'doc', 'docx']
function isValidFile(file: File): boolean {
  const ext = file.name.split('.').pop()?.toLowerCase()
  return !!ext && ALLOW_EXT.includes(ext)
}
const fileInput = ref<HTMLInputElement>()
const files = reactive<UploadFile[]>([])

// 拖拽上传
function handleDrop(event: DragEvent) {
  const dt = event.dataTransfer
  if (!dt) return
  handleFileList(dt.files)
}

// 选择文件上传
function handleFiles(event: Event) {
  const input = event.target as HTMLInputElement
  handleFileList(input.files)
  // 清空 input，允许重复选择同一文件
  input.value = ''
}

function handleFileList(fileList: FileList | null) {
  if (!fileList) return
  Array.from(fileList).forEach(file => {
    if (!isValidFile(file)) {
      // Ant Design 提示
      message.error(`不支持的文件类型：${file.name}`)
      return
    }
    files.push({ file, name: file.name, progress: 0 })
  })
  // 自动上传
  files.forEach(uploadFile)
}

// 上传文件
function uploadFile(f: UploadFile) {
  f.status = 'uploading'
  f.progress = 0
  const formData = new FormData()
  formData.append('file', f.file)
  formData.append('categoryId', props.cid)   // 普通字段

  fileImport(formData, percent => {
    f.progress = percent
  })
      .then(resp => {
        if (resp.code === 200) {
          f.progress = 100
          f.status = 'success'
        } else {
          f.status = 'error'
          message.error(resp.msg)
        }
      })
}

// 删除文件
function removeFile(index: number) {
  files.splice(index, 1)
}
</script>

<style scoped>
.file-upload {
  background: #fff;
  min-width: 500px;
  max-width: 80vw;
  padding: 24px;
  border-radius: 8px;
}
.upload-area {
  border: 2px dashed #aaa;
  border-radius: 6px;
  padding: 50px;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s;
}
.upload-area:hover {
  border-color: #409eff;
}
.hidden {
  display: none;
}
.file-list {
  margin-top: 16px;
  list-style: none;
  padding: 0;
}
.file-list li {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
  border-bottom: 1px solid #eee;
}
.file-list button {
  border: none;
  background: none;
  color: red;
  cursor: pointer;
}
</style>
