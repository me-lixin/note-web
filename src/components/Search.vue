<template>
  <!-- 全局搜索弹层 -->
  <a-modal
      v-model:open="modalOpen"
      :footer="null"
      :closable="false"
      :maskClosable="true"
      width="600px"
      class="global-search-modal"
      @afterOpenChange="handleAfterOpen"
  >
    <div class="search-box">
      <a-input
          ref="inputRef"
          v-model:value="queryParams.keyword"
          placeholder="搜索内容…"
          size="large"
          allow-clear
          @pressEnter="onSearch"
      />
    </div>

    <!-- 可选：搜索结果 -->
    <div class="search-result">
      <div class="result-item" v-for="item in searchResult.records" @click="onDetails(item)">{{ item.title }}</div>
    </div>
  </a-modal>
</template>
<script setup lang="ts">
import { ref, nextTick, onMounted, onBeforeUnmount,computed } from 'vue'
import {searchNote} from '../api/note'
import { message } from 'ant-design-vue'

const props = defineProps<{
  show: Boolean,
  onEditTab: (...any) => void
}>()
const emit = defineEmits(['update:show'])

const modalOpen = computed({
  get: () => props.show,
  set: (val) => emit('update:show', val)
})
const inputRef = ref()
const queryParams = ref({
  current:1,
  size:90,
  keyword:''
})
const searchResult = ref([])

function handleAfterOpen(open: boolean) {
  if (open) {
    nextTick(() => {
      inputRef.value?.focus()
    })
  }
}

function onSearch() {
  searchNote(queryParams.value).then(resp=>{
    if (resp.code == 200){
      searchResult.value = resp.data
    } else {
      message.error(resp.msg)
    }
  })
}
function onDetails(item){
  console.log(item)
  props.onEditTab(item)
}

</script>
<style scoped>
/* 覆盖 Ant Modal 样式 */
.global-search-modal :deep(.ant-modal-content) {
  background: transparent;
  box-shadow: none;
}

.global-search-modal :deep(.ant-modal-body) {
  padding: 0;
}


/* 搜索结果 */
.search-result {
  margin-top: 12px;
  background: #fff;
  border-radius: 12px;
  overflow: auto;
  max-height: 500px;
}

.result-item {
  padding: 12px 16px;
  cursor: pointer;
}

.result-item:hover {
  background: #f5f5f5;
}
</style>
