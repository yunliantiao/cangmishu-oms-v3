<template>
  <div class="login-container">
    <div class="login-wrapper">
      <!-- 左侧显示信息区域 -->
      <div class="login-info-section">
        <div class="bg-overlay"></div>
        <div class="logo-container">
          <div class="logo-text">OMS SYSTEM</div>
          <div class="sub-text">TX</div>
        </div>
        <div class="info-content">
          <div class="slogan">
            <div class="slogan-item">专业</div>
            <div class="slogan-item">简洁</div>
            <div class="slogan-item">高效</div>
          </div>
          <div class="slogan-desc">
            <div>智能仓储管理系统</div>
            <div>让仓储更简单</div>
          </div>
        </div>
      </div>

      <!-- 右侧登录表单区域 -->
      <div class="login-form-section">
        <div class="form-container">
          <q-form @submit="onSubmit" class="login-form" v-show="loginType == 1">
            <h2 class="login-title">登录</h2>
            <q-input
              v-model="ruleForm.email"
              outlined
              type="email"
              :label="t('邮箱')"
              class="q-mb-md"
              :rules="[(val) => !!val || t('请输入邮箱')]"
            />
            <q-input
              v-model="ruleForm.password"
              outlined
              :type="isPwd ? 'password' : 'text'"
              :label="t('密码')"
              class="q-mb-md"
              :rules="[(val) => !!val || t('请输入密码')]"
            >
              <template v-slot:append>
                <q-icon
                  :name="isPwd ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="isPwd = !isPwd"
                />
              </template>
            </q-input>

            <q-btn
              :label="t('登录')"
              type="submit"
              color="primary"
              class="full-width login-btn"
              :loading="loading"
            />
          </q-form>
          <div v-show="loginType == 2" style="margin: auto">
            <Register v-model="loginType" />
          </div>
        </div>
      </div>
    </div>
    <div class="footer-text">Copyright © 2025 深圳通晓网络科技有限公司</div>
  </div>
</template>

<script>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";
import api from "@/api";
import Register from "./User/Register.vue";

export default {
  name: "LoginPage",
  components: {
    Register,
  },
  setup() {
    const router = useRouter();
    const store = useStore();
    const isPwd = ref(true);
    const loading = ref(false);
    const $q = useQuasar();
    const loginType = ref(1); //==1 登录 ==2 注册
    const { t } = useI18n();

    const ruleForm = ref({
      email: "",
      password: "",
      captcha: "",
    });

    const onSubmit = async () => {
      loading.value = true;
      try {
        // 调用登录接口
        const response = await api.login({
          email: ruleForm.value.email,
          password: ruleForm.value.password
        });
        
        if (response.success) {
          // 保存token到localStorage和store
          localStorage.setItem('updateToken', response.data.token);
          store.commit('UPDATE_TOKEN', response.data.token);
          
          // 保存用户信息到localStorage和store
          localStorage.setItem('userInfo', JSON.stringify(response.data.user));
          store.commit('SET_USER_INFO', response.data.user);

          // 登录成功后跳转到首页
          router.push("/");
        } else {
          throw new Error(response.message || "登录失败");
        }
      } catch (error) {
        console.error("登录失败:", error);

        // 显示错误提示
        $q.notify({
          type: "negative",
          message: "登录失败: " + (error.message || "用户名或密码错误"),
          position: "top",
          timeout: 2000,
        });
      } finally {
        loading.value = false;
      }
    };

    const refreshCaptcha = () => {
      // 这里添加刷新验证码的逻辑
      console.log("刷新验证码");
      $q.notify({
        type: "info",
        message: "验证码已刷新",
        position: "top",
        timeout: 1000,
      });
    };

    const goToResetPassword = () => {
      router.push("/reset-password");
    };

    return {
      isPwd,
      loading,
      ruleForm,
      loginType,
      onSubmit,
      refreshCaptcha,
      goToResetPassword,
      t,
    };
  },
};
</script>

<style lang="scss" scoped>
.login-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  margin: 0;
  padding: 0;
  overflow: hidden;
  position: relative;
}

.login-wrapper {
  width: 1000px;
  height: 600px;
  display: flex;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.login-info-section {
  width: 50%;
  background: linear-gradient(135deg, #1976d2, #0d47a1);
  color: white;
  padding: 40px;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  
  // 添加背景图片和遮罩
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: url('/src/assets/warehouse-bg.jpg');
    background-size: cover;
    background-position: center;
    opacity: 0.2;
    z-index: 1;
  }

  .bg-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(25, 118, 210, 0.95), rgba(13, 71, 161, 0.95));
    z-index: 2;
  }
}

.logo-container {
  position: relative;
  z-index: 3;
  margin-bottom: 40px;

  .logo-text {
    font-size: 32px;
    font-weight: 700;
    letter-spacing: 2px;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
  }
  
  .sub-text {
    font-size: 18px;
    margin-top: 8px;
    opacity: 0.9;
    letter-spacing: 1px;
  }
}

.info-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 3;
  
  .slogan {
    text-align: center;
    margin-bottom: 40px;
    
    .slogan-item {
      font-size: 42px;
      font-weight: bold;
      line-height: 1.4;
      margin: 16px 0;
      text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
      transform: translateX(-20px);
      opacity: 0;
      animation: slideIn 0.5s ease forwards;
      
      &:nth-child(1) { animation-delay: 0.2s; }
      &:nth-child(2) { animation-delay: 0.4s; }
      &:nth-child(3) { animation-delay: 0.6s; }
    }
  }

  .slogan-desc {
    text-align: center;
    font-size: 20px;
    line-height: 1.6;
    opacity: 0;
    animation: fadeIn 0.8s ease forwards;
    animation-delay: 1s;
    
    div {
      margin: 8px 0;
      letter-spacing: 1px;
    }
  }
}

@keyframes slideIn {
  from {
    transform: translateX(-20px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.login-form-section {
  width: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
}

.form-container {
  width: 100%;
  max-width: 360px;
}

.login-title {
  font-size: 28px;
  font-weight: 500;
  margin-bottom: 32px;
  margin-top: 0;
  color: #333;
}

.login-form {
  .q-input {
    margin-bottom: 20px;
  }
}

.login-btn {
  height: 44px;
  font-size: 16px;
  font-weight: 500;
  margin-top: 16px;
}

.footer-text {
  position: absolute;
  bottom: 20px;
  color: #666;
  font-size: 14px;
}

// 响应式适配
@media (max-width: 1024px) {
  .login-wrapper {
    width: 90%;
    height: auto;
    min-height: 500px;
  }
}

@media (max-width: 767px) {
  .login-wrapper {
    flex-direction: column;
  }

  .login-info-section,
  .login-form-section {
    width: 100%;
  }

  .login-info-section {
    padding: 30px;
  }

  .form-container {
    padding: 20px;
  }
}
</style> 