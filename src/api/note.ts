import request from '@/utils/request'


// 获取笔记列表
export const getNotes = (params: any) =>
    request.get<any[]>('/api/note/list', {
        params
    })
// 获取单条笔记
export const getNoteById = (id: string) => request.get<any>(`/api/note/${id}`)

// 新增笔记
export const addNote = (data: any) => request.post('/notes', data)

// 修改笔记
export const saveNote = (data: any) => request.put(`/api/note`, data)

// 删除笔记
export const deleteNote = (id: string) => request.delete(`/api/note/${id}`)

