import { loadonDemand } from '@/utils/common.js'

const Container = () => import(`../views/Layout/Container.vue`)

export default [
    {
        path: 'user',
        name: 'User',
        redirect: '/user/account',
        component: Container,
        icon: 'person',
        meta: {
            name: '用户',
            icon: '',
        },
        children: [
            {
                path: 'account',
                name: 'AccountInfo',
                component: () => import('@/views/User/AccountInfo.vue'),
                id: 3001,
                meta: {
                    level: 2,
                    group: '用户',
                    name: '账号信息',
                },
            },
            {
                path: 'recharge',
                name: 'Recharge',
                component: () => import('@/views/User/Recharge.vue'),
                id: 3002,
                meta: {
                    level: 3,
                    group: '用户',
                    name: '充值',
                },
            }
        ]
    }
] 