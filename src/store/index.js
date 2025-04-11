import { createStore } from 'vuex'
import router from '@/router'
import { Notify } from 'quasar'

// 创建store实例
export default createStore({
  state: {
    leftDrawerOpen: true, // 侧边栏默认打开
    token: "",
    userInfo: {},
    btnLoading: false,
  },
  getters: {
    isLeftDrawerOpen: (state) => state.leftDrawerOpen,
    getToken: (state) => state.token,
  },
  mutations: {
    // 更新全局loading
    LOADING(state, loading) {
      state.btnLoading = loading
    },
    // 设置侧边栏状态
    SET_LEFT_DRAWER(state, isOpen) {
      state.leftDrawerOpen = isOpen
    },
    // 切换侧边栏状态
    TOGGLE_LEFT_DRAWER(state) {
      state.leftDrawerOpen = !state.leftDrawerOpen
    },
    // 更新token
    UPDATE_TOKEN(state, token) {
      state.token = token;
    },
    // 用户信息
    SET_USER_INFO(state, user) {
      state.userInfo = user;
      localStorage.setItem('userInfo', JSON.stringify(user))
    },

    DESTROY_TOKEN(state) {
      state.token = ''
      state.userInfo = {}
      localStorage.setItem('updateToken', '')
      localStorage.setItem('userInfo', '')
      Notify.create({
        message: '已退出登录',
        color: 'positive',
      })
      router.push('/login')
    },
  },
  actions: {
    initApp({ commit }) {
      if (localStorage.getItem('updateToken')) {
        commit('UPDATE_TOKEN', localStorage.getItem('updateToken'))
      }
    },
    initLoginAfterInfo({ commit }) {
      let userInfo = localStorage.getItem('userInfo')
      if (userInfo) {
        commit('SET_USER_INFO', JSON.parse(userInfo))
      }
    },
    // 设置侧边栏状态的异步操作
    setLeftDrawer({ commit }, isOpen) {
      commit('SET_LEFT_DRAWER', isOpen)
    },
    // 切换侧边栏状态的异步操作
    toggleLeftDrawer({ commit }) {
      commit("TOGGLE_LEFT_DRAWER");
    },
    // 更新token的异步操作
    updateToken({ commit }, token) {
      commit("UPDATE_TOKEN", token);
    },
  },
  modules: {},
});
