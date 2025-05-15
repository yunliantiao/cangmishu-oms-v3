<template>
  <q-layout view="hHh lpR fFf" class="bg-grey-2">
    <!-- 使用Header组件 -->
    <HeaderComponent 
      :leftDrawerOpen="leftDrawerOpen"
      @toggle-drawer="toggleLeftDrawer"
    />

    <!-- 使用Asides组件 -->
    <AsidesComponent 
      :isOpen="leftDrawerOpen"
      @close-sidebar="closeSidebar"
    />

    <q-page-container :class="{'content-with-sidebar': leftDrawerOpen, 'content-without-sidebar': !leftDrawerOpen}">
        <div class="q-pa-md">
            <router-view />
        </div>
    </q-page-container>
  </q-layout>
</template>

<script>
import { useQuasar } from 'quasar'
import { computed, onBeforeUnmount, onMounted } from 'vue'
import { useStore } from 'vuex'
import AsidesComponent from './Asides.vue'
import HeaderComponent from './Header.vue'

export default {
  name: 'ContainerLayout',
  components: {
    HeaderComponent,
    AsidesComponent
  },

  setup () {
    const $q = useQuasar()
    const store = useStore()
    
    // 从Vuex获取侧边栏状态
    const leftDrawerOpen = computed(() => store.state.leftDrawerOpen)
    const isMobile = computed(() => $q.screen.lt.md)
    
    // 监听窗口大小变化，在移动端自动关闭侧边栏
    function updateDrawerState() {
      if (isMobile.value) {
        store.dispatch('setLeftDrawer', false)
      } else if (!leftDrawerOpen.value && !isMobile.value) {
        // 从移动端变为桌面端时，打开侧边栏
        store.dispatch('setLeftDrawer', true)
      }
    }
    
    // 切换侧边栏状态
    function toggleLeftDrawer () {
      store.dispatch('toggleLeftDrawer')
    }
    
    // 关闭侧边栏（由子组件触发）
    function closeSidebar() {
      store.dispatch('setLeftDrawer', false)
    }
    
    // 组件挂载和卸载时添加/移除窗口大小变化监听
    onMounted(() => {
      updateDrawerState()
      window.addEventListener('resize', updateDrawerState)
    })
    
    onBeforeUnmount(() => {
      window.removeEventListener('resize', updateDrawerState)
    })

    return {
      leftDrawerOpen,
      toggleLeftDrawer,
      closeSidebar,
      isMobile
    }
  }
}
</script>

<style lang="scss" scoped>
.content-with-sidebar {
  margin-left: 240px; /* 与侧栏宽度相同 */
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.content-without-sidebar {
//   margin-left: 64px;
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 移动端适配 */
@media (max-width: 767px) {
  .content-with-sidebar,
  .content-without-sidebar {
    margin-left: 0;
  }
}
</style>