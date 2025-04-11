const Container = () => import(`../views/Layout/Container.vue`)
const Product = () => import(`../views/Product/Product.vue`)
const AddProduct = () => import(`../views/Product/AddProduct.vue`)

export default [
    {
        path: 'product',
        redirect: '/product/productmanagement',
        component: Container,
        icon: 'inventory',
        meta: {
            name: '产品',
            icon: '',
        },
        children: [
            {
                path: 'productmanagement',
                name: 'productmanagement',
                component: Product,
                id: 1001,
                meta: {
                    level: 2,
                    group: '产品',
                    name: '产品管理',
                },
            },
            {
                path: 'addproduct',
                name: 'addproduct',
                component: AddProduct,
                id: 1002,
                meta: {
                    level: 3,
                    group: '产品',
                    name: '添加产品',
                },
            }
        ]
    }
]