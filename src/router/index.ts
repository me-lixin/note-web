import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            component: () => import('@/views/note/Layout.vue'),
            redirect: '/list',
            children: [
                {
                    path: 'list',
                    name: 'List',
                    component: () => import('@/views/note/NoteList.vue')
                },
                {
                    path: 'note/new',
                    name: 'NoteNew',
                    component: () => import('@/components/Editor.vue')
                },
                {
                    path: 'note/:id',
                    name: 'NoteEdit',
                    component: () => import('@/components/Editor.vue'),
                    props: true
                }
            ]
        }
    ]
})

export default router
