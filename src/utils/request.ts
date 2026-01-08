import axios from 'axios'

// 创建 axios 实例
const request = axios.create({
    baseURL: 'http://172.16.110.46:8080', // 你的后端服务地址
    timeout: 10000
})

// 请求拦截器
request.interceptors.request.use(
    config => {
        // 可以加 token
        // config.headers.Authorization = `Bearer ${localStorage.getItem('token')}`
        return config
    },
    error => Promise.reject(error)
)

// 响应拦截器
request.interceptors.response.use(
    response => response.data,
    error => {
        console.error('请求错误:', error)
        return Promise.reject(error)
    }
)

export default request
