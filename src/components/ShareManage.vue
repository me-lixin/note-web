<template>
  <a-modal
      title="分享管理"
      v-model:open="modalOpen"
      width="1000px"
      @cancel="handleClose"
      :footer="null"
      destroyOnClose
  >
    <!-- 分享链接 -->
    <a-card size="small" class="mb-3">
      <a-form layout="inline">
        <a-form-item label="有效天数">
          <a-input-number
              v-model:value="validDays"
              :min="1"
              :max="3650000"
              @change="onChangeDays()"
              style="width: 120px"
          />
        </a-form-item>
      </a-form>
    </a-card>

    <!-- 分享链接表格 -->
    <a-table
        row-key="id"
        :columns="columns"
        :data-source="tableData"
        :pagination="{
                      current: pagination.current,
                      pageSize: pagination.size,
                      total: pagination.total
                    }"
        style="width: 100%"
        :scroll="{ x: 'max-content' }"
        @change="handleTableChange"
        size="small"
        bordered
    >
      <template #bodyCell="{ column, record }">
        <!-- 分享链接列 -->
        <template v-if="column.key === 'url'">
          <a-tooltip :title="record.url">
            <span style="display:inline-block; max-width: 200px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              {{ record.url }}
            </span>
          </a-tooltip>
        </template>
        <template v-if="column.key === 'titleSnapshot'">
          <a-tooltip :title="record.titleSnapshot">
            <span style="display:inline-block; max-width: 120px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              {{ record.titleSnapshot }}
            </span>
          </a-tooltip>
        </template>
        <template v-if="column.key === 'createTime'">
            {{ record.createTime.replace('T',' ')}}
        </template>
        <template v-if="column.key === 'expired'">
          <a-tag :color="new Date(record.expireTime) < new Date() ? 'red' : 'green'">
            {{ new Date(record.expireTime) < new Date() ? '过期' : '有效' }}
          </a-tag>
        </template>

        <template v-if="column.key === 'action'">
          <a-space>
            <a-button type="link" @click="copyLink(record.url)">
              复制
            </a-button>
            <a-popconfirm
                title="确定删除该分享链接？"
                @confirm="handleDelete(record.id)"
                cancelText="取消"
                okText="确定"
            >
              <a-button type="link" danger>删除</a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>
  </a-modal>
</template>
<script setup lang="ts">
import { ref, reactive,computed,watch,onMounted } from 'vue'
import { message } from 'ant-design-vue'
import {getSharePage,deleteShare} from '../api/shareNote'
import {copyText} from "../utils/copyUtil";

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits(['update:show'])

const modalOpen = computed({
  get: () => props.show,
  set: (val) => emit('update:show', val)
})
/** 生成表单 */
const validDays = ref(36500)


/** 表格 */
const columns = [
  { title: '分享链接', dataIndex: 'url', key: 'url',align: 'center' },
  { title: '文章标题', dataIndex: 'titleSnapshot', key: 'titleSnapshot',align: 'center'},
  { title: '生成时间', dataIndex: 'createTime', key: 'createTime',align: 'center'},
  { title: '状态', dataIndex: 'expired', key: 'expired',align: 'center' },
  { title: '操作', key: 'action',align: 'center'},
]

const tableData = ref<any[]>([])

const pagination = reactive({
  current: 1,
  size: 5,
  total: 0,
})
function onChangeDays(){
  localStorage.setItem('validDays',validDays.value)
}
/** 关闭弹窗 */
function handleClose() {
  emit('update:open', false)
}

/** 表格分页 */
function handleTableChange(pag: any) {
  console.log('pag',pag)
  pagination.current = pag.current
  pagination.size = pag.pageSize
  loadTable()
}

/** 加载表格数据 */
async function loadTable() {
  getSharePage(pagination).then(resp=>{
    if (resp.code==200){
      tableData.value = resp.data.records
      pagination.current=resp.data.current
      pagination.size=resp.data.size
      pagination.total=resp.data.total
    }
  })

}

/** 复制链接 */
function copyLink(url: string) {
  copyText(url)
      .then(() => message.success('复制成功'))
      .catch(() => message.error('复制失败'))
}

/** 删除 */
function handleDelete(id: number) {
  deleteShare(id).then(resp=>{
    if (resp.code==200){
      message.success('删除成功')
      loadTable()
    }
  })
}

watch(modalOpen, (newVal) => {
  if (newVal) {
    loadTable()
  }
})
</script>
