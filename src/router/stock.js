const Container = () => import(`../views/Layout/Container.vue`)

export default [
    {
        path: 'stock',
        name: 'Stock',
        redirect: '/stock/stocklist',
        component: Container,
        icon: 'inventory_2',
        meta: {
            name: '库存',
            icon: '',
        },
        children: [
            {
                path: 'stocklist',
                name: 'StockList',
                component: () => import('@/views/Stock/StockList.vue'),
                id: 1001,
                meta: {
                    level: 2,
                    group: '库存',
                    name: '库存清单',
                },
            },
            {
                path: 'stockflow',
                name: 'StockFlow',
                component: () => import('@/views/Stock/StockFlow.vue'),
                id: 1002,
                meta: {
                    level: 2,
                    group: '库存',
                    name: '库存流水',
                },
            },
            {
                path: 'stockage',
                name: 'StockAge',
                component: () => import('@/views/Stock/StockAge.vue'),
                id: 1003,
                meta: {
                    level: 2,
                    group: '库存',
                    name: '库龄报表',
                },
            }
        ]
    }
] 