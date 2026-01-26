<template>
  <div class="page">
    <div class="card">
      <div class="header">


        <h1><img src="@/assets/vue.svg" class="title-icon" />肄宁在线笔记</h1>
        <p>简单 · 专注 · 高效</p>
      </div>

      <a-form :model="form" layout="vertical" @finish="onSubmit">
        <a-form-item name="username" :rules="[{ required: true, message: '请输入用户名' }]">
          <a-input v-model:value="form.username" placeholder="用户名" size="large" :maxlength="12"/>
        </a-form-item>

        <a-form-item name="password" :rules="[{ required: true, message: '请输入密码' }]">
          <a-input-password v-model:value="form.password" placeholder="密码" size="large" :maxlength="16"/>
        </a-form-item>

        <a-button type="primary" html-type="submit" size="large" block>
          登录
        </a-button>
      </a-form>

      <div class="footer">
        <a-button type="link" @click="toRegister">还没有账号？注册</a-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import router from "../router";
import { login } from "../api/user.ts"

const form = ref({
  username: '',
  password: ''
})

function onSubmit() {
  console.log('login', form.value)
  login(form.value).then(resp=>{
    if (resp.code == 200){
      localStorage.setItem('token',resp.data.token)
      localStorage.setItem('user', JSON.stringify(resp.data))

      message.success('登录成功')
      // window.location.reload()
      // router.replace('/layout')
      window.location.href = '/layout'
    } else {
      message.error(resp.msg)
    }
  })
}

function toRegister() {
  router.replace('/register')
}
</script>

<style scoped>
.page {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(18deg, rgba(5, 145, 255, 0.1), #fff)
}

.card {
  width: 360px;
  padding: 32px 28px 24px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
}

.header {
  text-align: center;
  margin-bottom: 24px;
}

.header h1 {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
}

.header p {
  margin-top: 6px;
  font-size: 13px;
  color: #888;
}

.footer {
  margin-top: 20px;
  text-align: center;
  font-size: 13px;
  color: #666;
}

.footer a {
  margin-left: 4px;
}
.title-icon {
  width: 60px;
  height: 60px;
  margin: -21px 11px 1px -18px;
}
</style>
