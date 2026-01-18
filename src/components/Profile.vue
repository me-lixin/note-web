<template>
  <a-modal
      title="个人资料"
      v-model:open="modalOpen"
      width="400px"
      @cancel="handleClose"
      :footer="null"
      destroyOnClose
  >
    <div class="profile-container">
      <!-- 昵称 -->
      <div class="profile-row">
        <div class="profile-label">昵称:</div>
        <div class="profile-content">
          <a-avatar style="color: #f5f5f5; background-color: #8d6e63; margin-right: 10px;">
            {{ user?.nickname }}
          </a-avatar>
        </div>
      </div>

      <!-- 用户名 -->
      <div class="profile-row">
        <div class="profile-label">用户名:</div>
        <div class="profile-content">{{ user?.username || '—' }}</div>
      </div>

      <!-- 注册时间 -->
      <div class="profile-row">
        <div class="profile-label">注册时间:</div>
        <div class="profile-content">{{ user?.createTime || '—' }}</div>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits(['update:show'])

const modalOpen = computed({
  get: () => props.show,
  set: (val) => emit('update:show', val)
})

const user = JSON.parse(localStorage.getItem('user') || '{}')

function handleClose() {
  modalOpen.value = false
}
</script>

<style scoped>
.profile-container {
  display: flex;
  flex-direction: column;
  border: 1px solid #d9d9d9; /* 整体边框 */
  border-radius: 6px;
  overflow: hidden;
}

.profile-row {
  display: flex;
  justify-content: center; /* 水平居中 */
  align-items: center;
  border-bottom: 1px solid #d9d9d9; /* 每行下边框 */
  padding: 12px 0;
}

.profile-row:last-child {
  border-bottom: none; /* 最后一行不加下边框 */
}

.profile-label {
  width: 100px;
  font-weight: 600;
  color: #555;
  text-align: center;
  margin-right: 15px;
}

.profile-content {
  flex: 1;
  display: flex;
  justify-content: center; /* 内容水平居中 */
  align-items: center;
  color: #333;
}
</style>
