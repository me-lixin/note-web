import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/login',
            name: 'Login',
            component: () => import('@/views/MinimalLogin.vue')
        },
        {
            path: '/register',
            name: 'Register',
            component: () => import('@/views/MinimalRegister.vue')
        },
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
                    path: 'note/new/:tid/:tempId',
                    name: 'NoteNew',
                    component: () => import('@/components/Editor.vue'),
                    props:true
                },
                {
                    path: 'note/edit/:tid/:nid',
                    name: 'NoteEdit',
                    component: () => import('@/components/Editor.vue'),
                    props:true
                },
            ]
        },
        {
            path: '/:pathMatch(.*)*',
            redirect: '/'
        }
    ]
})
// router.beforeEach((to, from, next) => {
//     const token = localStorage.getItem('token')
//     console.log(token)
//     if (!token && to.path !== '/login' && to.path !== '/register') {
//         next('/login')
//         return
//     }
//
//     if (token && (to.path === '/login' || to.path === '/register')) {
//         next('/')
//         return
//     }
//     if (from.name === undefined && to.path !== '/list') {
//         next('/list')
//     }
//     next()
// })


export default router
