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

    <!-- 修改密码弹窗 -->
    <q-dialog v-model="passwordDialogVisible" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center">
          <div class="text-h6">{{ t('修改密码') }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <div class="column q-gutter-y-md">
            <q-input
              v-model="passwordForm.old_password"
              :label="t('原密码')"
              :placeholder="t('请输入原密码')"
              outlined
              dense
              type="password"
              :rules="[val => !!val || t('原密码不能为空')]"
            >
              <template v-slot:append>
                <span class="text-red">*</span>
              </template>
            </q-input>

            <q-input
              v-model="passwordForm.password"
              :label="t('新密码')"
              :placeholder="t('请输入新密码')"
              outlined
              dense
              type="password"
              :rules="[
                val => !!val || t('新密码不能为空'),
                val => val.length >= 6 || t('密码长度不能小于6位')
              ]"
            >
              <template v-slot:append>
                <span class="text-red">*</span>
              </template>
            </q-input>

            <q-input
              v-model="passwordForm.password_confirmation"
              :label="t('确认新密码')"
              :placeholder="t('请再次输入新密码')"
              outlined
              dense
              type="password"
              :rules="[
                val => !!val || t('确认密码不能为空'),
                val => val === passwordForm.password || t('两次输入的密码不一致')
              ]"
            >
              <template v-slot:append>
                <span class="text-red">*</span>
              </template>
            </q-input>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn :label="t('取消')" color="grey-7" v-close-popup flat />
          <q-btn :label="t('确定')" color="primary" @click="handlePasswordConfirm" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { useStore } from 'vuex';
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';
import api from '@/api/index';

export default {
  name: 'AccountInfo',
  setup() {
    const store = useStore();
    const { t } = useI18n();
    const $q = useQuasar();
    
    // 从Vuex获取用户信息
    const userInfo = computed(() => ({
      ...store.state.userInfo,
      warehouses: ['USC'] // 临时添加仓库信息，后续可以从接口获取
    }));

    // 密码修改相关
    const passwordDialogVisible = ref(false);
    const passwordForm = ref({
      old_password: '',
      password: '',
      password_confirmation: ''
    });

    // 处理修改密码按钮点击
    const handleModifyPassword = () => {
      passwordDialogVisible.value = true;
    };

    // 处理密码修改确认
    const handlePasswordConfirm = async () => {
      // 表单验证
      if (!passwordForm.value.old_password) {
        $q.notify({
          type: 'warning',
          message: t('请输入原密码')
        });
        return;
      }
      if (!passwordForm.value.password) {
        $q.notify({
          type: 'warning',
          message: t('请输入新密码')
        });
        return;
      }
      if (passwordForm.value.password.length < 6) {
        $q.notify({
          type: 'warning',
          message: t('密码长度不能小于6位')
        });
        return;
      }
      if (!passwordForm.value.password_confirmation) {
        $q.notify({
          type: 'warning',
          message: t('请确认新密码')
        });
        return;
      }
      if (passwordForm.value.password !== passwordForm.value.password_confirmation) {
        $q.notify({
          type: 'warning',
          message: t('两次输入的密码不一致')
        });
        return;
      }

      try {
        const response = await api.resetPassword({
          old_password: passwordForm.value.old_password,
          password: passwordForm.value.password,
          password_confirmation: passwordForm.value.password_confirmation
        });

        if (response.success) {
          passwordDialogVisible.value = false;
          $q.notify({
            type: 'positive',
            message: t('密码修改成功')
          });
          // 重置表单
          passwordForm.value = {
            old_password: '',
            password: '',
            password_confirmation: ''
          };
        }
      } catch (error) {
        console.error('修改密码失败:', error);
        $q.notify({
          type: 'negative',
          message: t('修改密码失败')
        });
      }
    };

    // 监听弹窗关闭
    watch(passwordDialogVisible, (newVal) => {
      if (!newVal) {
        // 重置表单
        passwordForm.value = {
          old_password: '',
          password: '',
          password_confirmation: ''
        };
      }
    });

    return {
      userInfo,
      handleModifyPassword,
      passwordDialogVisible,
      passwordForm,
      handlePasswordConfirm,
      t
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