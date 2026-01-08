// import request from '@/utils/request'
//
// export interface Note {
//     id?: string
//     title: string
//     content: string // Markdown 内容
//     folderId?: string
// }
//
// // 获取笔记列表
// export const getNotes = () => request.get<Note[]>('/notes')
//
// // 获取单条笔记
// export const getNoteById = (id: string) => request.get<Note>(`/notes/${id}`)
//
// // 新增笔记
// export const addNote = (data: Note) => request.post('/notes', data)
//
// // 修改笔记
// export const updateNote = (id: string, data: Note) =>
//     request.put(`/notes/${id}`, data)
//
// // 删除笔记
// export const deleteNote = (id: string) => request.delete(`/notes/${id}`)


// src/api/note.ts
export interface Note {
    id?: string
    title: string
    content: string // Markdown 内容
    folderId?: string
}

// 假数据存储
let fakeNotes: Note[] = [
    {
        id: '1',
        title: '第一篇笔记',
        content: '# Hello Markdown\n这是第一篇笔记内容',
        folderId: 'f1',
    },
    {
        id: '2',
        title: '第二篇笔记',
        content: '## Vue3 + Vite\n测试笔记内容',
        folderId: 'f1',
    },
]

// 模拟异步请求延迟
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// 获取笔记列表
export const getNotes = async (): Promise<Note[]> => {
    await delay(300)
    return [...fakeNotes]
}

// 获取单条笔记
export const getNoteById = async (id: string): Promise<Note | undefined> => {
    await delay(200)
    return fakeNotes.find(n => n.id === id)
}

// 新增笔记
export const addNote = async (data: Note): Promise<Note> => {
    await delay(300)
    const newNote = { ...data, id: (Date.now() + Math.random()).toString() }
    fakeNotes.push(newNote)
    return newNote
}

// 修改笔记
export const updateNote = async (id: string, data: Note): Promise<Note | undefined> => {
    await delay(300)
    const index = fakeNotes.findIndex(n => n.id === id)
    if (index === -1) return undefined
    fakeNotes[index] = { ...fakeNotes[index], ...data }
    return fakeNotes[index]
}

// 删除笔记
export const deleteNote = async (id: string): Promise<boolean> => {
    await delay(200)
    const index = fakeNotes.findIndex(n => n.id === id)
    if (index === -1) return false
    fakeNotes.splice(index, 1)
    return true
}
