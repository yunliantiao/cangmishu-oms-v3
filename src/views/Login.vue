<template>
  <div class="login-container">
    <div class="login-wrapper">
      <!-- 左侧显示信息区域 -->
      <div class="login-info-section">
        <div class="logo-container">
          <!-- <img src="../../assets/logo.png" alt="Logo" class="logo"> -->
          <span class="logo-text">仓秘书oms</span>
        </div>
        <div class="info-content">
          <h1 class="info-title">电商仓储管理系统！</h1>
          <ul class="feature-list">
            <!-- <li>免注册费！免年费！免ERP对接费、物流对接费！</li> -->
            <li>对接大量物流，解锁全球！</li>
            <!-- <li>支持中、英、西、葡、印尼、越、泰等多国语言！</li> -->
            <li>一对一指导，帮助您快速上手！</li>
          </ul>
        </div>
      </div>

      <!-- 右侧登录表单区域 -->
      <div class="login-form-section">
        <div class="form-container">
          <q-form @submit="onSubmit" class="login-form" v-show="loginType == 1">
            <h2 class="login-title">登录</h2>
            <q-input
              v-model="ruleForm.email"
              filled
              type="email"
              label="邮箱"
              class="q-mb-md"
              :rules="[(val) => !!val || '请输入邮箱']"
            />
            <q-input
              v-model="ruleForm.password"
              filled
              :type="isPwd ? 'password' : 'text'"
              label="密码"
              class="q-mb-md"
              :rules="[(val) => !!val || '请输入密码']"
            >
              <template v-slot:append>
                <q-icon
                  :name="isPwd ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="isPwd = !isPwd"
                />
              </template>
            </q-input>

            <!-- <div class="captcha-container q-mb-md">
              <q-input
                v-model="ruleForm.captcha"
                filled
                label="请输入图形验证码"
                :rules="[(val) => !!val || '请输入验证码']"
              />
              <div class="captcha-image">
                <img
                  src="https://placehold.co/110x40/001F4D/FFFFFF?text=CAPTCHA"
                  alt="验证码"
                  @click="refreshCaptcha"
                />
              </div>
            </div> -->

            <q-btn
              label="登录"
              type="submit"
              color="primary"
              class="full-width login-btn"
              :loading="loading"
            />

            <div class="login-options">
              <span>还没有账号？</span>
              <q-btn
                flat
                color="primary"
                label="免费注册"
                class="register-link"
                @click="loginType = 2"
              />
              <q-space />
              <q-btn
                flat
                color="primary"
                label="找回密码"
                class="forgot-pwd-link"
                @click="goToResetPassword"
              />
            </div>
          </q-form>
          <div v-show="loginType == 2" style="margin: auto">
            <Register v-model="loginType" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { useQuasar } from "quasar";
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
    };
  },
};
</script>

<style lang="scss" scoped>
.login-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: stretch;
  justify-content: center;
  background-color: #f8f9fa;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.login-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: stretch;
  justify-content: center;
  overflow: hidden;
  margin: 0;
  padding: 0;
  box-shadow: none;
  border-radius: 0;
}

.login-info-section {
  width: 50%;
  flex: 0 0 50%;
  background: #2979ff;
  color: white;
  padding: 40px;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  box-sizing: border-box;

  /* 移除之前的背景图和渐变效果，使其与参考图片一致 */
  &::before,
  &::after {
    display: none;
  }
}

.logo-container {
  display: flex;
  align-items: center;
  position: relative;
  z-index: 1;
  margin-bottom: 60px;
  padding-left: 10px;

  .logo-text {
    font-size: 22px;
    font-weight: 600;
    letter-spacing: 0.5px;
  }
}

.info-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  z-index: 1;
  padding-left: 10px;
}

.info-title {
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 40px;
  line-height: 1.3;
}

.feature-list {
  list-style-type: none;
  padding: 0;

  li {
    padding: 10px 0 10px 24px;
    position: relative;
    font-size: 15px;
    margin-bottom: 12px;

    &:before {
      content: "•";
      position: absolute;
      left: 0;
      color: white;
      font-size: 16px;
    }
  }
}

.login-form-section {
  width: 50%;
  flex: 0 0 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background-color: white;
  box-sizing: border-box;
}

.form-container {
  width: 100%;
  max-width: 380px;
  padding: 0 10px;
}

.login-title {
  text-align: center;
  font-size: 24px;
  font-weight: 500;
  margin-bottom: 24px;
  color: #333;
}

.q-form {
  .q-mb-md {
    margin-bottom: 12px !important;
  }
}

.q-input {
  :deep(.q-field__control) {
    // height: 50px;
    border-radius: 4px;
    background-color: #f5f5f5;
  }

  :deep(.q-field__native) {
    padding-top: 14px;
    font-size: 15px;
  }
}

.captcha-container {
  display: flex;
  gap: 8px;
  margin-bottom: 12px !important;

  .q-input {
    flex: 1;
  }

  .captcha-image {
    width: 110px;
    height: 42px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 4px;
      background-color: #0f1f3d;
    }
  }
}

.login-btn {
  height: 42px;
  font-size: 15px;
  font-weight: 500;
  border-radius: 4px;
  margin-top: 16px;
  background-color: #0f1f3d !important;
}

.login-options {
  display: flex;
  align-items: center;
  margin-top: 12px;
  font-size: 13px;

  span {
    color: #666;
  }

  .register-link,
  .forgot-pwd-link {
    font-weight: 500;
    color: #2979ff !important;
    min-height: 32px !important;

    :deep(.q-btn__content) {
      padding: 0 4px;
    }
  }
}

// 响应式适配
@media (max-width: 767px) {
  .login-wrapper {
    flex-direction: column;
  }

  .login-info-section,
  .login-form-section {
    width: 100%;
    flex: none;
  }

  .login-info-section {
    height: 40%;
    padding: 20px;
  }

  .login-form-section {
    height: 60%;
    padding: 20px;
  }

  .logo-container {
    margin-bottom: 20px;
  }

  .info-title {
    font-size: 24px;
    margin-bottom: 20px;
  }

  .feature-list li {
    font-size: 14px;
    margin-bottom: 6px;
  }
}
</style> 