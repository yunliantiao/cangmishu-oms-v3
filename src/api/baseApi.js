const baseUrl = location.hostname
let baseApi
let baseApiNotAdmin
let basePcd
if (baseUrl == '127.0.0.1' || baseUrl == 'localhost') {
    // 开发环境使用代理
    baseApi = 'https://test-api.cangmishu.com/api/oms/'
    baseApiNotAdmin = 'https://test-api.cangmishu.com/api/oms/'
    basePcd = 'https://test-api.cangmishu.com'
} 
export { baseApiNotAdmin, basePcd }
export default baseApi
