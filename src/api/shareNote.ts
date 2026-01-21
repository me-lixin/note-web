import request from '@/utils/request'

// 创建链接
export const getLink = (params) =>
    request.get(`/note/share`,{params} )

// 分页查询
export const getSharePage = (params) => {
    return request.get<{ records; total: number }>('/note/share/page', { params })
}

// 删除分享
export const deleteShare = (id: number) => {
    return request.delete(`/note/share/${id}`)
}
// 访问分享
export const accessShare = (shareCode) => {
    return request.get(`/note/share/public/${shareCode}`)
}