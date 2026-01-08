<template>
  <div v-html="htmlContent" class="markdown-preview"></div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'dompurify'

const props = defineProps<{
  content: string
}>()

const htmlContent = ref('')

watch(
    () => props.content,
    value => {
      console.log('3')

      const rawHtml = marked.parse(value || '')
      htmlContent.value = DOMPurify.sanitize(rawHtml)
    },
    { immediate: true }
)
</script>

<style scoped>
.markdown-preview {
  padding: 10px;
}
</style>
