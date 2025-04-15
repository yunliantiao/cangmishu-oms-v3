import { GET,POST, DEL, $file, PUT } from "./config.js";
export default {
  resetPass: (data) => POST("auth/register", data), // 注册
  login: (data) => POST("auth/login", data), // 登录
  logout: (data) => DEL("auth/logout", data), // 退出
  uploads: (data, config) => $file.post("uploads", data, config), // 上传文件
  importSpu: (data, config) => $file.post("products/import", data, config), // 导入SPU
  importCombo: (data, config) => $file.post("bundle-products/import", data, config), // 导入组合商品
  customsTypesList: () => GET("customs-types"), // 获取海关类型
  currenciesList: () => GET("currencies"), // 获取货币列表
  addProduct: (data) => POST("products", data), // 添加产品
  editProduct: (id,data) => PUT(`products/${id}`,data), // 编辑产品
  getProductDetail: (id) => GET(`products/${id}`), // 产品详情
  delProduct: (data) => DEL(`products`,data), // 产品详情
  editSKU: (id,data) => PUT(`skus/${id}`,data), // 编辑SKU
  getSKUDetail: (id) => GET(`skus/${id}`), // SKU详情
  delSKU: (data) => DEL(`skus`,data), // SKU详情
  getProductList: (data) => GET("products", data), // 获取产品列表
  getSkuList: (data) => GET("skus", data), // 获取产品列表
  productsLabels: (data) => POST("products/labels/generate", data, { responseType: 'blob' }), // 生成打印标签
  addCombo: (data) => POST("bundle-products", data), // 添加组合产品
  getComboList: (data) => GET("bundle-products", data), // 组合产品列表
  delCombo: (id) => DEL(`bundle-products/${id}`), // 删除组合产品
  getComboDetail: (id) => GET(`bundle-products/${id}`), // 组合产品详情
  editCombo: (id,data) => PUT(`bundle-products/${id}`,data), // 编辑组合产品


  //入库模块
  createInbound: (data) => POST("inbound", data), // 创建入库单
  getInboundList: (data) => GET("inbound", data), // 获取入库列表
  getArrivalMethods: (data) => GET("arrival-methods", data), // 到仓方式列表
  submitInbound: (id) => POST(`inbound/${id}/submit`), // 提交入库单
  getInboundDetail: (id) => GET(`inbound/${id}`), // 入库单详情
  editInbound: (id,data) => PUT(`inbound/${id}`,data), // 入库单详情
  shipInbound: (id) => POST(`inbound/${id}/ship`), // 入库单发货
  delInbound: (id) => DEL(`inbound/${id}`), // 删除单发货
  inboundBoxLabel: (id,data) => POST(`inbound/${id}/boxes/label`,data, { responseType: 'blob' }), // 打印箱唛

  // 库存模块
  getStocksList: (data) => GET("stocks", data), // 获取库存列表
  getStocksLogList: (data) => GET("stocks/logs", data), // 获取库存流水
  stocksExport: (data) => GET("stocks/export", data, { responseType: 'blob' }), // 导出库存

  // 库龄模块
  getStockAgeList: (data) => GET("stocks-ages", data), // 获取标准库龄列表
  getStockAgeGroupList: (data) => GET("stocks-ages/group-ages", data), // 获取分段库龄列表
  getGroupConfigList: (data) => GET("stocks-ages/group-ages/configs", data), // 获取分段列表
  editGroupConfig: (data) => POST("stocks-ages/group-ages/configs", data), // 修改分段列表

  // 出库模块
  createOutbound: (data) => POST("orders", data), // 创建出库单
  importOutbound: (data, config) => $file.post("orders/import", data, config), // 导入出库单
  editOutbound: (id,data) => PUT(`orders/${id}`,data), // 编辑出库单
  getOutboundList: (data) => GET("orders", data), // 获取出库列表
  submitOutbound: (id) => POST(`orders/${id}/submit`), // 提交出库单
  getOutboundDetail: (id) => GET(`orders/${id}`), // 出库单详情
  delOutbound: (id) => DEL(`orders/${id}`), // 删除出库单
  orderIntercept: (id) => POST(`orders/${id}/intercept`), // 申请截单
  orderCancelIntercept: (id) => POST(`orders/${id}/cancel-intercept`), // 取消截单
  orderRevert: (id) => POST(`orders/${id}/revert`), // 订单撤回
  orderPdf: (id,data,config) => $file.post(`orders/${id}/label`,data, config), // 上传面单


  //公用模块
  getCountryList: (data) => GET("countries", data), // 获取库存流水
  getTemplates: (data) => GET("templates", data,{ responseType: 'blob' }), // 导入模板下载

}
