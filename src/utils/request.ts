import axios from 'axios'

// 创建 axios 实例
const request = axios.create({
    baseURL: '/api',
    timeout: 30000
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
        if (error.status == 401){
            localStorage.removeItem("token")
            localStorage.removeItem("user")
            window.location.href = '/login'
        }else {
        }
        return Promise.reject(error)
    }
)

export default request
