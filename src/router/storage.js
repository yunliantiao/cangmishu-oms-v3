const Container = () => import(`../views/Layout/Container.vue`)
const WarehouseWarrant = () => import(`../views/Storage/WarehouseWarrant.vue`)
const CreateWarehouse = () => import(`../views/Storage/CreateWarehouse.vue`)

export default [
    {
        path: 'inbound',
        name: 'Inbound',
        redirect: '/inbound/warehousewarrant',
        component: Container,
        icon: 'warehouse',
        meta: {
            name: '入库',
            icon: '',
        },
        children: [
            {
                path: 'warehousewarrant',
                name: 'WarehouseWarrant',
                component: () => import('@/views/Storage/WarehouseWarrant.vue'),
                id: 1001,
                meta: {
                    level: 2,
                    group: '入库',
                    name: '入库单管理',
                },
            },
            {
                path: 'warehousewarrant/:id',
                name: 'WarehouseDetail',
                component: () => import('@/views/Storage/WarehouseDetail.vue'),
            },
            {
                path: 'createwarehouse',
                name: 'CreateWarehouse',
                component: CreateWarehouse,
                id: 1002,
                meta: {
                    level: 3,
                    group: '入库',
                    name: '创建入库单',
                },
            }
        ]
    }
]