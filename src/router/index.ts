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
            path: '/layout',
            name: 'Layout',
            component: () => import('@/components/Layout.vue'),
        },
        {
            path: '/public/:shareCode',
            name: 'ShareEditor',
            component: () => import('@/views/note/ShareEditor.vue')
        },
        {
            path: '/:pathMatch(.*)*',
            redirect: '/layout'
        }
    ]
})
const whiteArr = ['/login','/register']
router.beforeEach((to, from, next) => {

    console.log(to.path)
    const token = localStorage.getItem('token')
    if (to.path.startsWith('/public')){
        next()
        return;
    }
    if (!token && !whiteArr.includes(to.path)) {
        next('/login')
        return

    }
    if (token && (to.path === '/login' || to.path === '/register')) {
        next('/')
        return
    }
    console.log('2')

    next()
})


export default router
