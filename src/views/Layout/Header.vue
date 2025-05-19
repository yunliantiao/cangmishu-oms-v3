<template>
  <q-header elevated class="bg-primary text-white q-py-xs" height-hint="58">
    <q-toolbar>
      <q-btn
        flat
        dense
        round
        @click="toggleDrawer"
        aria-label="Menu"
        :icon="leftDrawerOpen ? 'menu_open' : 'read_more'"
      />

      <q-btn flat no-caps no-wrap class="q-ml-xs" v-if="$q.screen.gt.xs">
        <!-- <q-avatar>
          <img src="https://cdn.quasar.dev/img/avatar.png" />
        </q-avatar> -->
        <q-toolbar-title shrink class="text-weight-bold">
          {{ warehouse.name }}
        </q-toolbar-title>
      </q-btn>

      <q-space />

      <div class="q-gutter-sm row items-center no-wrap">
        <!-- 语言切换 -->
        <q-select
          v-model="currentLang"
          :options="langOptions"
          dense
          outlined
          emit-value
          map-options
          style="min-width: 120px"
          @update:model-value="handleLangChange"
          class="language-select"
        />

        <q-btn round flat>
          <q-avatar size="26px">
            <img src="https://cdn.quasar.dev/img/boy-avatar.png" />
          </q-avatar>
          <q-tooltip>Account</q-tooltip>
        </q-btn>
        <q-btn color="primary" :label="userInfo.email">
          <q-menu style="width: 100px">
            <q-list>
              <q-item>
                <q-item-section class="pointer">
                  <q-item-label @click="handleLogout" class="cursor-pointer">退出</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </div>
    </q-toolbar>
  </q-header>
</template>

<script>
import { fabYoutube } from '@quasar/extras/fontawesome-v6';
import { useStore } from 'vuex';
import { computed, ref, onMounted, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';

export default {
  name: 'HeaderComponent',

  setup() {
    const store = useStore();
    const { locale } = useI18n();
    const $q = useQuasar();

    // 语言选项
    const langOptions = [
      { label: '简体中文', value: 'zh_cn' },
      { label: 'English', value: 'en_us' },
    ];

    // 当前语言
    const currentLang = ref(localStorage.getItem('lang') || 'zh_cn');

    // 从Vuex获取侧边栏状态
    const leftDrawerOpen = computed(() => store.state.leftDrawerOpen);

    // 从Vuex获取用户信息
    const userInfo = computed(() => store.state.userInfo);

    // 切换语言
    const handleLangChange = (value) => {
      locale.value = value;
      localStorage.setItem('lang', value);
      currentLang.value = value;

      // 直接刷新页面
      window.location.reload();
    };

    function toggleDrawer() {
      store.dispatch('toggleLeftDrawer');
    }

    function handleLogout() {
      store.commit('DESTROY_TOKEN');
    }

    const warehouse = computed(() => window.warehouse);

    // 初始化语言
    onMounted(() => {
      const savedLang = localStorage.getItem('lang');
      if (savedLang) {
        locale.value = savedLang;
        currentLang.value = savedLang;
      }
      console.log(warehouse.value, '78978979');
    });

    return {
      fabYoutube,
      toggleDrawer,
      leftDrawerOpen,
      handleLogout,
      userInfo,
      langOptions,
      currentLang,
      handleLangChange,
      warehouse,
    };
  },
};
</script>

<style lang="scss" scoped>
.language-select {
  :deep(.q-field__native),
  :deep(.q-field__prefix),
  :deep(.q-field__suffix),
  :deep(.q-field__label) {
    color: white !important;
  }

  :deep(.q-field__control) {
    color: white !important;
    background: transparent !important;
  }

  :deep(.q-field__control:before) {
    border: 1px solid white !important;
  }

  :deep(.q-field__control:after) {
    border: 1px solid white !important;
  }

  :deep(.q-icon) {
    color: white !important;
  }

  :deep(.q-field--outlined .q-field__control:hover:before) {
    border: 1px solid rgba(255, 255, 255, 0.8) !important;
  }
}

.cursor-pointer {
  cursor: pointer;
}
</style>
