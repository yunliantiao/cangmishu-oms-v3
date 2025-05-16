<template>
  <div class="fixed-sidebar" :class="{ 'sidebar-hidden': !isOpen }">
    <q-list v-show="isOpen" padding class="rounded-borders route-menu">
      <!-- 遍历路由 -->
      <template v-for="route in routerMap" :key="route.path">
        <!-- 当有多个子菜单时显示可展开的父菜单 -->
        <q-expansion-item
          v-if="hasMultipleChildren(route)"
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
              <img
                v-if="getImg(route)"
                :src="getImg(route)"
                alt=""
                class="img-icon"
              />
              <div class="menu-title">
                {{ route.meta?.name || route.name || route.path }}
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
            @click.stop.prevent="
              toPath(`/${route.path}/${childRoute.path}`, childRoute)
            "
            class="route-item"
            active-class="q-item--active"
          >
            <q-item-section class="submenu-title">
              <q-item-label>{{
                childRoute.meta?.name || childRoute.name
              }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-expansion-item>

        <!-- 当只有一个子菜单时，直接显示可点击的父菜单 -->
        <q-item
          v-else
          v-ripple
          clickable
          :to="getSingleChildPath(route)"
          class="menu-header route-item"
          active-class="q-item--active"
        >
          <div class="menu-header-content">
            <img
              v-if="getImg(route)"
              :src="getImg(route)"
              alt=""
              class="img-icon"
            />
            <div class="menu-title">
              {{ route.meta?.name || route.name || route.path }}
            </div>
          </div>
        </q-item>
      </template>
    </q-list>

    <!-- <div v-if="isOpen" class="fix-menu" @click="toggleLeftDrawer">
      <q-icon name="chevron_left" />
    </div> -->
  </div>
</template>

<script>
import { useQuasar } from "quasar";
import { computed, watch, ref, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import { routerMap } from "../../router";

export default {
  name: "AsidesComponent",

  setup() {
    const router = useRouter();
    const route = useRoute();
    const store = useStore();
    const $q = useQuasar();

    // 图标缓存
    const iconCache = reactive({});

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

    // 判断路由是否有多个子路由
    const hasMultipleChildren = (route) => {
      const level2Routes = getLevel2Routes(route.children);
      return level2Routes.length > 1;
    };

    // 获取唯一子路由的路径
    const getSingleChildPath = (route) => {
      const level2Routes = getLevel2Routes(route.children);
      if (level2Routes.length === 1) {
        return `/${route.path}/${level2Routes[0].path}`;
      }
      return `/${route.path}`;
    };

    // 过滤level=2的二级路由
    function getLevel2Routes(children) {
      if (!children) return [];
      return children.filter((child) => child.meta && child.meta.level === 2);
    }

    // 切换侧边栏状态
    function toggleLeftDrawer() {
      store.dispatch("toggleLeftDrawer");
    }

    // 预加载所有图标
    const preloadIcons = () => {
      routerMap.forEach((route) => {
        if (route.icon) {
          // 加载默认图标
          import(`../../assets/images/asides/${route.icon}.png`)
            .then((module) => {
              const cacheKey = `${route.icon}`;
              iconCache[cacheKey] = module.default;
            })
            .catch((error) =>
              console.error(`无法加载图标: ${route.icon}`, error)
            );

          // 加载选中态图标
          import(`../../assets/images/asides/${route.icon}-select.png`)
            .then((module) => {
              const cacheKey = `${route.icon}-select`;
              iconCache[cacheKey] = module.default;
            })
            .catch((error) =>
              console.error(`无法加载选中态图标: ${route.icon}-select`, error)
            );
        }
      });
    };

    // 组件初始化时预加载图标
    preloadIcons();

    // 获取图标路径
    const getImg = (route) => {
      if (!route.icon) return "";

      const isActive = isRouteActive(route);
      const hasMulti = hasMultipleChildren(route);

      // 多子菜单时使用普通图标
      if (hasMulti) {
        const cacheKey = route.icon;
        return iconCache[cacheKey] || "";
      } else {
        // 单子菜单时根据激活状态选择图标
        const cacheKey = isActive ? `${route.icon}-select` : route.icon;
        return iconCache[cacheKey] || "";
      }
    };

    const toPath = (path, childRoute) => {
      if (childRoute.redirect && !childRoute?.is_self) {
        let origin = window.location.origin;
        window.open(origin + childRoute.redirect, "_blank");
      } else {
        router.push(path);
      }
    };

    return {
      isOpen,
      isCollapse,
      isMobile,
      routerMap,
      toPath,
      getImg,
      toggleLeftDrawer,
      getLevel2Routes,
      isRouteActive,
      hasMultipleChildren,
      getSingleChildPath,
    };
  },
};
</script>

<style lang="scss" scoped>
.fixed-sidebar {
  position: fixed;
  top: 58px; /* 与顶部导航栏高度保持一致 */
  left: 0;
  width: 240px;
  height: calc(100vh - 58px);
  background-color: white;
  z-index: 2000;
  overflow-y: auto;
  border-right: 1px solid rgba(0, 31, 77, 0.06);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03);
  overflow: visible;

  .fix-menu {
    position: absolute;
    right: -10px;
    top: 100px;
    cursor: pointer;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    z-index: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background-color: #d1d5db;
    color: #2c3e50;
    transition: all 0.3s ease-in-out;
    &:hover {
      background-color: rgba($color: #2c3e50, $alpha: 0.8);
      color: #ffffff;
    }
  }
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
  padding: 20px;
  transition: all 0.25s ease;

  // 父级菜单项,会与子级route-item重叠,所以用!important
  .menu-header {
    min-height: 44px !important;
    padding: 12px !important;
    margin: 20px 0 !important;
    border-radius: 8px;
    transition: all 0.25s ease;
    cursor: pointer;

    &:hover {
      background-color: rgba(0, 31, 77, 0.04);
    }
    .menu-header-content {
      display: flex;
      align-items: center;
      width: 100%;
    }
  }

  // 默认父级菜单项
  .route-item {
    padding: 6px 12px 6px 16px;
    min-height: 40px;
    margin: 10px 0;
    border-radius: 6px;
    transition: background-color 0.2s ease;
    &:last-child {
      margin-bottom: 0;
    }

    .submenu-icon {
      min-width: 24px;
      opacity: 0.7;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .submenu-title {
      font-size: 13px;
      text-indent: 32px;
      color: #555;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .q-icon {
      color: #1f1f1f;
    }
  }

  /* 激活状态的菜单项 */
  :deep(.q-item--active) {
    background-color: rgba($color: $primary, $alpha: 0.1);
    color: var(--q-primary);
    font-weight: 500;
    box-shadow: 0 2px 4px rgba(0, 31, 77, 0.05);
    .menu-title,
    .q-item__label,
    .menu-icon {
      color: $primary !important;
    }
    .submenu-icon {
      opacity: 1;
    }
    .q-icon {
      color: $primary !important;
    }
  }

  .img-icon {
    width: 24px;
    height: 24px;
  }
}

.menu-icon {
  min-width: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #1f1f1f;
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
  line-height: normal;
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
    // background-color: rgba(0, 31, 77, 0.03);
    min-height: 40px;
    border-radius: 6px;
  }
}

.q-expansion-item {
  margin-bottom: 20px;
  // 去掉父级菜单展开显示的上下边框
  :deep(.q-expansion-item__border) {
    opacity: 0 !important;
  }
}
/* 隐藏默认的展开图标 - 让整个标题区域可点击 */
:deep(.q-focusable) {
  height: 40px;
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

:deep(.q-item--dense) {
  padding: 2px 12px;
}

:deep(.q-expansion-item__content) {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  padding-left: 0 !important;
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
