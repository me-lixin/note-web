import request from '@/utils/request'


// 登陆
export const login = (data: any) => request.post('/api/auth/login', data)
// 注册
export const register = (data: any) => request.post('/api/auth/register', data)