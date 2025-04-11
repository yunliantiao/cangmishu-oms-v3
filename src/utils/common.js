export const loadonDemand = path => {
    return () => import(`../views/${path}.vue`)
}