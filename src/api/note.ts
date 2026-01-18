import request from '@/utils/request'

/* ================= 通用类型 ================= */

export interface ApiResult<T = void> {
    code: number
    msg: string
    data: T
}

export interface Note {
    id: string
    title: string
    content: string
    updateTime?: string
}

export interface PageResult<T> {
    records: T[]
    total: number
}

/* ================= 接口定义 ================= */

// 获取笔记列表（分页）
export const getNotes = (params: any) =>
    request.get<ApiResult<PageResult<Note>>>('/api/note/list', {
        params
    })

// 全局搜索
export const searchNote = (params: any) =>
    request.get<ApiResult<PageResult<Note>>>('/api/note/search', {
        params
    })

// 获取单条笔记
export const getNoteById = (id: string) =>
    request.get<ApiResult<Note>>(`/api/note/${id}`)

// 新增 / 修改笔记
export const saveNote = (data: Partial<Note>) =>
    request.put<ApiResult<void>>(`/api/note`, data)
// 移动笔记目录
export const moveNote = (data: Partial<Note>) =>
    request.put<ApiResult<void>>(`/api/note/move`, data)

// 删除笔记
export const deleteNote = (id: string) =>
    request.delete<ApiResult<void>>(`/api/note/${id}`)

// 上传笔记（带进度）
export const fileImport = (
    formData: FormData,
    onProgress?: (percent: number) => void
) =>
    request.post<ApiResult<void>>('/api/note/import', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        onUploadProgress(e) {
            if (!e.total) return
            const percent = Math.round((e.loaded * 100) / e.total)
            onProgress?.(percent)
        }
    })
