import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import 'vditor/dist/js/icons/ant.js'

createApp(App)
    .use(router)
    .use(Antd)
    .mount('#app')
