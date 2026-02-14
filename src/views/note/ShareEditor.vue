<template>
  <div class="markdown-preview">
    <a-result v-if="isExpire" status="403" title="分享已过期">
      <template #extra>
      </template>
    </a-result>
    <a-result v-if="htmlContent==''" status="404" title="没有内容">
      <template #extra>
      </template>
    </a-result>
<!--    <div v-else ref="vditorRef"></div>-->
    <div class="markdown-body" v-else v-html="htmlContent"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref} from 'vue'
import { useRoute } from 'vue-router'
import {accessShare} from '../../api/shareNote'
import { marked } from 'marked';

marked.setOptions({
  breaks: true, // 单个换行也转换为 <br>
  gfm: true,    // GitHub 风格换行
});
const route = useRoute()
const isExpire = ref<Boolean>(false)
const shareCode = route.params.shareCode as string
const htmlContent = ref('');
onMounted(async() => {
  const res = await accessShare(shareCode)
  if (res.code == 200){
    htmlContent.value = marked.parse(res.data.contentSnapshot)
  }else {
    isExpire.value = true
  }
})
</script>
<style>

/* 页面容器 */
.markdown-preview {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  background: #fff;
}

/* 过期提示容器居中 */
.expire-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80vh;
}

/* Markdown 内容额外美化 */
.markdown-body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji";
  line-height: 1.6;
  word-break: break-word;
  color: #24292e;
}

/* 图片自适应 */
.markdown-body img {
  max-width: 100%;
  height: auto;
  display: block;
  margin: 10px 0;
}

/* 代码块高亮 */
.markdown-body pre {
  background-color: #f6f8fa;
  padding: 12px;
  border-radius: 6px;
  overflow-x: auto;
}

/* 行内代码 */
.markdown-body code {
  background-color: #f6f8fa;
  padding: 2px 4px;
  border-radius: 4px;
  font-size: 0.9em;
}

/* 表格样式 */
.markdown-body table {
  border-collapse: collapse;
  width: 100%;
  margin: 16px 0;
}

.markdown-body th,
.markdown-body td {
  border: 1px solid #d0d7de;
  padding: 6px 13px;
}

.markdown-body th {
  background-color: #f6f8fa;
  font-weight: 600;
}

/* 引用样式 */
.markdown-body blockquote {
  padding: 0 1em;
  color: #6a737d;
  border-left: 0.25em solid #d0d7de;
  margin: 0.8em 0;
}

/* 列表样式 */
.markdown-body ul,
.markdown-body ol {
  padding-left: 2em;
  margin: 0.8em 0;
}

/* 响应式处理，移动端适配 */
@media (max-width: 768px) {
  .markdown-preview {
    padding: 10px;
  }
  .markdown-body pre {
    font-size: 0.85em;
  }
}
</style>