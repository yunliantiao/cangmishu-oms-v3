const Container = () => import(`../views/Layout/Container.vue`)

export default [
    {
        path: 'outbound',
        name: 'Outbound',
        redirect: '/outbound/list',
        component: Container,
        icon: 'local_shipping',
        meta: {
            name: '出库',
            icon: '',
        },
        children: [
            {
                path: 'list',
                name: 'OutboundList',
                component: () => import('@/views/Outbound/OutboundList.vue'),
                id: 2001,
                meta: {
                    level: 2,
                    group: '出库',
                    name: '出库单列表',
                },
            },
            {
                path: 'create',
                name: 'OutboundCreate',
                component: () => import('@/views/Outbound/OutboundCreate.vue'),
                id: 2002,
                meta: {
                    level: 2,
                    group: '出库',
                    name: '新建出库单',
                },
            },
            {
                path: 'detail',
                name: 'OutboundDetail',
                component: () => import('@/views/Outbound/OutboundDetail.vue'),
                id: 2003,
                meta: {
                    level: 3,
                    group: '出库',
                    name: '出库单详情',
                },
            }
        ]
    }
] 