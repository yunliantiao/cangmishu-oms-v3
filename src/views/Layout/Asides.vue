<template>
  <div class="fixed-sidebar" :class="{ 'sidebar-hidden': !isOpen }">
    <q-list padding class="rounded-borders route-menu">
      <!-- 使用q-expansion-item模拟el-submenu -->
      <q-expansion-item
        v-for="route in routerMap"
        :key="route.path"
        :default-opened="isRouteActive(route)"
        :content-inset-level="0.5"
        :expand-separator="true"
        group="menuGroup"
        dense
        header-class="menu-header"
        expand-icon-class="expand-icon"
      >
        <template v-slot:header>
          <div class="menu-header-content">
            <q-icon
              :name="route.icon"
              color="primary"
              size="sm"
              class="menu-icon"
            />
            <div class="menu-title">
              {{ t(route.meta?.name || route.name || route.path) }}
            </div>
          </div>
        </template>

        <!-- 子菜单项 -->
        <q-item
          v-for="childRoute in getLevel2Routes(route.children)"
          :key="childRoute.path"
          v-ripple
          clickable
          :to="`/${route.path}/${childRoute.path}`"
          class="route-item"
          active-class="q-item--active"
        >
          <q-item-section avatar class="submenu-icon">
            <q-icon name="circle" size="xs" color="primary" />
          </q-item-section>
          <q-item-section class="submenu-title">
            <q-item-label>{{
              t(childRoute.meta?.name || childRoute.name)
            }}</q-item-label>
          </q-item-section>
        </q-item>
      </q-expansion-item>
    </q-list>
  </div>
</template>

<script>
import { computed, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useStore } from "vuex";
import { routerMap } from "../../router";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";

export default {
  name: "AsidesComponent",

  setup() {
    const router = useRouter();
    const route = useRoute();
    const store = useStore();
    const $q = useQuasar();
    const { t } = useI18n();

    // 从Vuex获取侧边栏状态
    const isOpen = computed(() => store.state.leftDrawerOpen);
    const isCollapse = computed(() => !isOpen.value);
    const isMobile = computed(() => $q.screen.lt.md);

    // 根据当前路由路径判断菜单项是否应该展开
    const isRouteActive = (menuRoute) => {
      const currentPath = route.path;
      // 检查当前路由是否以此菜单路径开头
      return currentPath.startsWith(`/${menuRoute.path}`);
    };

    // 监听路由变化，自动关闭移动端侧边栏
    watch(route, () => {
      if (isMobile.value && isOpen.value) {
        // 发射事件通知父组件关闭侧边栏
        store.dispatch("setLeftDrawer", false);
      }
    });

    // 过滤子路由，只显示有meta信息的路由
    function filterChildren(children) {
      if (!children) return [];
      return children.filter((child) => child.meta);
    }

    // 过滤level=2的二级路由
    function getLevel2Routes(children) {
      if (!children) return [];
      return children.filter((child) => child.meta && child.meta.level === 2);
    }

    return {
      isOpen,
      isCollapse,
      isMobile,
      routerMap,
      filterChildren,
      getLevel2Routes,
      isRouteActive,
      t,
    };
  },
};
</script>

<style lang="scss" scoped>
.fixed-sidebar {
  position: fixed;
  top: 50px; /* 与顶部导航栏高度保持一致 */
  left: 0;
  width: 240px;
  height: calc(100vh - 50px);
  background-color: white;
  z-index: 100;
  overflow-y: auto;
  border-right: 1px solid rgba(0, 31, 77, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03);
}

.sidebar-hidden {
  width: 0 !important;

  .menu-title {
    display: none;
  }

  .menu-icon {
    margin: 0 auto;
  }

  .fold {
    .q-item__section--main {
      display: none;
    }
  }
}

.route-menu {
  background-color: #ffffff;
  font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
  padding-top: 8px;
}

.menu-header {
  min-height: 56px !important;
  padding: 14px 12px;
  margin: 4px 8px;
  border-radius: 8px;
  transition: all 0.25s ease;
  cursor: pointer;

  &:hover {
    background-color: rgba(0, 31, 77, 0.04);
  }
}

.menu-header-content {
  display: flex;
  align-items: center;
  width: 100%;
}

.menu-icon {
  min-width: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.menu-title {
  font-weight: 500;
  font-size: 15px;
  letter-spacing: 0.3px;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding-left: 12px;
  line-height: 1.4;
}

.route-item {
  padding: 6px 12px 6px 16px;
  min-height: 40px;
  margin: 5px 0;
  border-radius: 6px;
  transition: background-color 0.2s ease;

  .submenu-icon {
    min-width: 24px;
    opacity: 0.7;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .submenu-title {
    font-size: 13px;
    letter-spacing: 0.2px;
    color: #555;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

/* 自定义展开图标颜色 */
:deep(.expand-icon) {
  color: var(--q-primary);
  opacity: 0.7;
  transition: all 0.3s ease;
}

:deep(.q-expansion-item--expanded) {
  .expand-icon {
    opacity: 1;
  }

  .menu-header {
    background-color: rgba(0, 31, 77, 0.03);
    min-height: 56px;
  }
}

/* 隐藏默认的展开图标 - 让整个标题区域可点击 */
:deep(.q-focusable) {
  min-height: 56px;
}

/* 激活状态的菜单项 */
:deep(.q-item--active) {
  background-color: rgba(0, 31, 77, 0.08);
  color: var(--q-primary);
  font-weight: 500;
  box-shadow: 0 2px 4px rgba(0, 31, 77, 0.05);

  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 8px;
    height: calc(100% - 16px);
    width: 3px;
    background-color: var(--q-primary);
    border-radius: 0 3px 3px 0;
  }

  .submenu-icon {
    opacity: 1;
  }
}

/* 鼠标悬停效果 */
.q-item:hover {
  background-color: rgba(0, 31, 77, 0.04);
}

/* 滚动条样式 */
.fixed-sidebar::-webkit-scrollbar {
  width: 4px;
}

.fixed-sidebar::-webkit-scrollbar-track {
  background: transparent;
}

.fixed-sidebar::-webkit-scrollbar-thumb {
  background: rgba(0, 31, 77, 0.2);
  border-radius: 4px;
}

.fixed-sidebar::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 31, 77, 0.4);
}

:deep(.q-expansion-item__content) {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 移动端适配样式 */
@media (max-width: 767px) {
  .fixed-sidebar {
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
    transform: translateX(0);
  }

  .sidebar-hidden {
    transform: translateX(-100%);
    width: 240px !important;

    .fold {
      .q-item__section--main {
        display: block;
      }
    }
  }

  /* 移动端不折叠菜单项，而是完全隐藏侧边栏 */
  .menu-title {
    display: block !important;
  }
}
</style>