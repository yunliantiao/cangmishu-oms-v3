import { createApp } from 'vue'
import './style.css'
import router from './router'
import store from './store'
import App from './App.vue'
import { createI18n } from 'vue-i18n'

// Import Quasar
import { Quasar, Notify, Dialog } from 'quasar'

// Import Quasar CSS
import 'quasar/dist/quasar.css'

// Import icon libraries
import '@quasar/extras/material-icons/material-icons.css'

// 导入语言文件
import zh_cn from './lib/lang/zh_cn'
import en_us from './lib/lang/en_us'

// 创建 i18n 实例
const i18n = createI18n({
  locale: localStorage.getItem('lang') || 'zh_cn', // 默认语言
  fallbackLocale: 'zh_cn', // 回退语言
  messages: {
    zh_cn,
    en_us
  }
})

const app = createApp(App)
store.dispatch('initApp')
store.dispatch('initLoginAfterInfo')

app.use(Quasar, {
  plugins: {
    Notify,
    Dialog
  }, // import Quasar plugins and add here
  config: {
    // optional quasar config
    notify: {
      position: 'top',
      timeout: 2500,
      textColor: 'white',
      actions: [{ icon: 'close', color: 'white' }]
    },
    brand: window.theme
  }
}).use(router).use(store).use(i18n)

app.mount('#app')
