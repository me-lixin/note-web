<template>
  <div class="page">
    <div class="card">
      <div class="header">
        <h1>创建账号</h1>
        <p>只需一步，开始记录</p>
      </div>

      <a-form :model="form" layout="vertical" @finish="onSubmit">
        <a-form-item name="nickname" :rules="[{ required: true, message: '请输入昵称' }]">
          <a-input v-model:value="form.nickname" placeholder="昵称" size="large" :maxlength="12"/>
        </a-form-item>
        <a-form-item name="username" :rules="[{ required: true, message: '请输入用户名' }]">
          <a-input v-model:value="form.username" placeholder="用户名" size="large" :maxlength="12"/>
        </a-form-item>
        <a-form-item name="password" :rules="[{ required: true, message: '请输入密码'}]">
          <a-input-password v-model:value="form.password" placeholder="密码" size="large" :maxlength="16"/>
        </a-form-item>
        <a-button type="primary" html-type="submit" size="large" block>
          注册
        </a-button>
      </a-form>

      <div class="footer">
        <a-button type="link" @click="toLogin">已有账号？返回登录</a-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { register } from '../api/user'
const router = useRouter()

const form = ref({
  nickname:'',
  username: '',
  password: '',
  confirm: ''
})

function validateConfirm(_: any, value: string) {
  if (value !== form.value.password) {
    return Promise.reject('两次密码不一致')
  }
  return Promise.resolve()
}

function onSubmit() {
  console.log('register', form.value)
  register(form.value).then(resp=>{
    if (resp.code == 200){
      message.success('注册成功，请登录')
      router.replace('/login')
    } else {
      message.error(resp.msg)
    }
  })

}

function toLogin() {
  router.replace('/login')
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
</style>
