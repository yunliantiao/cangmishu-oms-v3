// import { i18n } from '@/utils/i18n'
import axios from 'axios'
import baseApi from './baseApi.js'
import nprogress from 'nprogress'
import store from '../store'
import { Notify } from "quasar";
import qs from 'qs'
import router from '../router'

nprogress.configure({ showSpinner: false })

function filterFunc(prefix, value) {
  return value === undefined ? null : value
}

export const ax = axios.create({
  baseURL: baseApi,
  timeout: 120000,
  responseType: 'json',
  headers: {
    post: {
      ['Content-Type']: 'application/json'
    },
    put: {
      ['Content-Type']: 'application/json'
    },
    delete: {
      ['Content-Type']: 'application/json'
    }
  },
  transformRequest: [
    function(data) {
      return JSON.stringify(data);
    }
  ]
})


ax.defaults.withCredentials = false
let currentProcessingCount = 0
function interceptorsRequestSuccess(config) {
  nprogress.start()
  nprogress.inc(1)
  ++currentProcessingCount
  store.commit('LOADING', true)
  
  // 获取 token
  const token = localStorage.getItem('updateToken') || store.state.token || '';
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // 设置仓库 ID
  const warehouseId = localStorage.getItem('warehouseId') || '5';
  config.headers['X-Warehouse-Id'] = warehouseId;
  
  // 设置接受类型
  config.headers.Accept = 'application/json';
  
  return config;
}
function interceptorsRequestError(error) {
  console.log(error,'操作失败');
  // 使用Quasar的Notify方法替代$q.notify
  Notify.create({
    message: 'Service Error',
    color: 'negative',
  })
  return Promise.reject(error)
}

function interceptorsResponse(config) {
  --currentProcessingCount
  if (currentProcessingCount <= 0) {
    nprogress.done()
    store.commit('LOADING', false)
  }

  // 如果是二进制响应，直接返回
  if (config.config.responseType === 'blob') {
    return config.data
  }

  if (config.data && !config.data.success) {
    if (config.data.code === 1001) {
      store.commit('DESTROY_TOKEN')
      Notify.create({
        message: '重新登录',
        color: 'negative',
      })
    }
  } else if (
    config.status === 200 &&
    config.data &&
    config.data.success &&
    config.config.method !== 'get'
  ) {    
    Notify.create({
      message: config.data.message,
      color: 'positive',
    })
  }
  
  if (!config.data.success && config.config.method !== 'get') {
    Notify.create({
      message: config.data.message,
      color: 'negative',
    })
  }
  return config.data
}

function interceptorsResponseError(error) {
  const { response } = error
  let msg
  console.log(response,'response');
  
  nprogress.done()
  currentProcessingCount = 0
  store.commit('LOADING', false)
  if (response && response.status === 401) {
    // store.commit('DESTROY_TOKEN')
    Notify.create({
      message: '请先登录',
      color: 'negative',
    })
    router.push('/login')
  } else if (response && response.status === 500) {
    msg = response?.data?.message || 'Service Error'
  } else if (response?.data?.data?.message) {
    msg = response.data.data.message
  } else if (response?.data?.data && Object.keys(response.data.data).length > 0) {
    // 处理验证错误信息
    const errorMessages = []
    Object.entries(response.data.data).forEach(([field, messages]) => {
      if (Array.isArray(messages)) {
        messages.forEach(msg => errorMessages.push(msg))
      } else {
        errorMessages.push(messages)
      }
    })
    msg = errorMessages.join('\n')
  } else {
    msg = 'RequestFailed'
  }
  
  if (msg) {
    Notify.create({
      message: msg,
      color: 'negative',
      position: 'top',
      classes: 'notify-error',
      timeout: 5000
    })
  }
  return Promise.reject(response?.data || error)
}
let $file = axios.create({
  baseURL: baseApi,
  headers: {
    'Content-Type': 'multipart/form-data;'
  },
  transformRequest: [
    function (params) {
      return params
    }
  ]
})

$file.interceptors.request.use(interceptorsRequestSuccess, interceptorsRequestError)
$file.interceptors.response.use(interceptorsResponse, interceptorsResponseError)

ax.interceptors.request.use(interceptorsRequestSuccess, interceptorsRequestError)
ax.interceptors.response.use(interceptorsResponse, interceptorsResponseError)

export function GET(url, params, config) {
  return ax.get(url, { params, ...config })
}

export function POST(url, data, config) {
  return ax.post(url, data, config)
}

export function PUT(url, data, config) {
  return ax.put(url, data, config)
}

export function PATCH(url, data, config) {
  return ax.patch(url, data, config)
}

export function DEL(url, data, config) {
  return ax.delete(url, { data, ...config })
}
export { $file }

