import { createRouter, createWebHistory } from 'vue-router'
import Panel from './panel.js'
import Product from './product.js'
import Storage from './storage.js'
import Stock from './stock.js'
import Outbound from './outbound.js'
import User from './user.js'

import { loadonDemand } from '@/utils/common.js'
const Layout = () => import(`../App.vue`)
const NotFound = loadonDemand('NotFound')
const Login = loadonDemand('Login')

export const routerMap = []
    .concat(Panel)
    .concat(Product)
    .concat(Storage)
    .concat(Stock)
    .concat(Outbound)
    .concat(User)
const constantRouterMap = [
    {
        path: '/login',
        name: 'Login',
        component: Login,
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: NotFound,
    },
    {
        path: '/',
        name: 'main',
        redirect: '/home/panel',
        component: Layout,
        children: routerMap,
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes: constantRouterMap,
})
// router.beforeEach(router)
export default router
