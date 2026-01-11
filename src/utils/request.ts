import axios from 'axios'
import {message} from "ant-design-vue";


// 创建 axios 实例
const request = axios.create({
    baseURL: 'http://localhost:10110', // 你的后端服务地址
    timeout: 10000
})

// 请求拦截器
request.interceptors.request.use(
    config => {
        // 可以加 token
        config.headers.Authorization = `Bearer ${localStorage.getItem('token')}`
        return config
    },
    error => Promise.reject(error)
)

// 响应拦截器
request.interceptors.response.use(
    response => response.data,
    error => {
        console.log(error)
        if (error.status == 401){
            localStorage.removeItem("token")
            localStorage.removeItem("user")
            window.location.href = '/login'
            message.error("登陆过期,请重新登陆")
        }else {
            message.error(error.message)
        }
        return Promise.reject(error)
    }
)

export default request
