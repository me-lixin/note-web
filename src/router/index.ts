import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/login',
            name: 'Login',
            component: () => import('@/views/MinimalLogin.vue'),
            meta: { public: true } // 公共路由
        },
        {
            path: '/register',
            name: 'Register',
            component: () => import('@/views/MinimalRegister.vue'),
            meta: { public: true }
        },
        {
            path: '/layout',
            name: 'Layout',
            component: () => import('@/components/Layout.vue')
        },
        {
            path: '/public/:shareCode',
            name: 'ShareEditor',
            component: () => import('@/views/note/ShareEditor.vue'),
            meta: { public: true }
        },
        {
            path: '/:pathMatch(.*)*',
            redirect: '/layout'
        }
    ]
})
router.beforeEach((to, from, next) => {
    const token = localStorage.getItem('token')
    console.log(to.name )
    if (!token && to.name != 'Login' && to.name != 'Register' && to.name != 'ShareEditor') {
        console.log('/login' )
        next('/login')
        return
    }
    next()
})
export default router
