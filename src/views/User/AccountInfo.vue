<template>
  <div class="account-info">
    <q-card class="account-card">
      <q-card-section>
        <div class="text-h6 q-mb-sm">{{ $t('账号信息') }}</div>
        
        <div class="row q-col-gutter-x-xl q-col-gutter-y-md">
          <div class="col-12 col-sm-6">
            <div class="row items-center">
              <div class="text-grey q-mr-md">{{ $t('账号名') }}</div>
              <div>{{ userInfo.name }}</div>
            </div>
          </div>
          
          <div class="col-12 col-sm-6">
            <div class="row items-center">
              <div class="text-grey q-mr-md">{{ $t('电话') }}</div>
              <div>{{ userInfo.phone }}</div>
            </div>
          </div>
          
          <div class="col-12 col-sm-6">
            <div class="row items-center">
              <div class="text-grey q-mr-md">{{ $t('登录邮箱') }}</div>
              <div>{{ userInfo.email }}</div>
            </div>
          </div>
          
          <div class="col-12 col-sm-6">
            <div class="row items-center">
              <div class="text-grey q-mr-md">{{ $t('登录密码') }}</div>
              <div>
                <span>******</span>
                <q-btn
                  flat
                  dense
                  color="primary"
                  class="q-ml-sm"
                  :label="$t('修改')"
                  @click="handleModifyPassword"
                />
              </div>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <q-card class="account-card q-mt-md">
      <q-card-section>
        <div class="text-h6 q-mb-sm">{{ $t('仓库权限') }}</div>
        
        <div class="row q-col-gutter-y-md">
          <div class="col-12">
            <div class="row items-center">
              <div class="text-grey q-mr-md">{{ $t('已开通仓库') }}</div>
              <div>
                <q-chip
                  v-for="warehouse in userInfo.warehouses"
                  :key="warehouse"
                  dense
                  class="q-mr-sm"
                >
                  {{ warehouse }}
                </q-chip>
              </div>
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import { useStore } from 'vuex';
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

export default {
  name: 'AccountInfo',
  setup() {
    const store = useStore();
    const { t } = useI18n();
    
    // 从Vuex获取用户信息
    const userInfo = computed(() => ({
      ...store.state.userInfo,
      warehouses: ['USC'] // 临时添加仓库信息，后续可以从接口获取
    }));

    const handleModifyPassword = () => {
      // TODO: 处理修改密码
      console.log('修改密码');
    };

    return {
      userInfo,
      handleModifyPassword
    };
  }
}
</script>

<style lang="scss" scoped>
.account-info {
  .account-card {
    border-radius: 8px;
  }
  
  .text-grey {
    color: rgba(0, 0, 0, 0.6);
  }
}
</style> 