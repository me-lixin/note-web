import request from '@/utils/request'


// 获取目录树
export const getTree = () => request.get<any[]>('/api/category/tree')

// 修改目录
export const updateCategory = (data: any) =>
    request.put(`/api/category`, data)

// 删除笔记
export const deleteCategory = (id: string) => request.delete(`/api/category/${id}`)

