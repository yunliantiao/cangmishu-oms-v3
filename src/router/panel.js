const Container = () => import(`../views/Layout/Container.vue`)
const Panel = () => import(`../views/Home/Panel.vue`)

export default [
    {
        path: 'home',
        redirect: '/home/panel',
        component: Container,
        icon: 'home',
        meta: {
            name: '首页',
            icon: '',
        },
        children: [
            {
                path: 'panel',
                name: 'Panel',
                component: Panel,
                id: 1001,
                meta: {
                    level: 2,
                    group: '首页',
                    name: '控制面板',
                },
            },
        ]
    }
]

