<template>
  <div>
    <a-result v-if="isExpire" status="403" title="403" sub-title="分享已过期">
      <template #extra>
      </template>
    </a-result>
    <div v-else ref="vditorRef"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref} from 'vue'
import Vditor from 'vditor'
import 'vditor/dist/index.css'
import { useRoute } from 'vue-router'
import {accessShare} from '../../api/shareNote'

const route = useRoute()
const vditorRef = ref<HTMLDivElement | null>(null)
const vditor = ref<Vditor>()
const isExpire = ref<Boolean>(false)
const shareCode = route.params.shareCode as string

onMounted(async() => {
  const res = await accessShare(shareCode)
  if (res.code == 200){
    init(res.data.contentSnapshot)
  }else {
    isExpire.value = true
  }
})

function init(content:string) {
  vditor.value = new Vditor(vditorRef.value!, {
    height: '100vh',
    width: '100%',
    mode: 'ir',
    toolbar: [],  // 空数组隐藏所有工具栏按钮
    preview: {
      maxWidth: 1400,
    },
    cache: {
      enable: false,
      id: 'disable-cache'
    },
    value: content
  });
}
</script>