<!-- 充值页面 -->
<template>
  <div class="recharge-page">
    <div class="flex items-center q-mb-lg">
      <q-btn flat round dense icon="arrow_back" color="primary" @click="router.back()" />
      <div class="text-h5 q-ml-sm">{{ t('充值') }}</div>
    </div>

    <div class="content">
      <!-- 第一步：选择付款方式 -->
      <div class="step-section q-mb-lg">
        <div class="text-subtitle1 q-mb-md">{{ t('第一步：选择付款方式并付款') }}</div>
        <q-select
          v-model="form.payment_method_id"
          :options="paymentMethods"
          :label="t('付款方式')"
          option-value="id"
          option-label="name"
          outlined
          dense
          emit-value
          map-options
          class="q-mb-md"
          style="max-width: 300px"
          @update:model-value="handlePaymentMethodChange"
        />

        <!-- 付款说明 -->
        <template v-if="selectedPaymentMethod">
          <div class="payment-info q-pa-md q-mt-md">
            <div class="text-subtitle2 q-mb-sm">{{ t('付款说明：') + selectedPaymentMethod.name }}</div>
            <div class="description q-mb-md">{{ selectedPaymentMethod.description }}</div>
            
            <div class="qr-code-section">
              <template v-if="selectedPaymentMethod.qr_code">
                <img :src="selectedPaymentMethod.qr_code" class="qr-code" />
              </template>
              <template v-else>
                <div class="no-qr-code">
                  <q-icon name="image_not_supported" size="48px" color="grey-6" />
                  <div class="text-grey-6 q-mt-sm">{{ t('暂无二维码') }}</div>
                </div>
              </template>
            </div>
          </div>
        </template>
      </div>

      <!-- 第二步：填写付款信息 -->
      <div class="step-section">
        <div class="text-subtitle1 q-mb-md">{{ t('第二步：填写付款信息并等待仓库审核') }}</div>
        <div class="row q-col-gutter-md">
          <!-- 第一行：付款金额、付款时间、交易号 -->
          <div class="col-xs-12">
            <div class="row q-col-gutter-md">
              <div class="col">
                <q-input
                  v-model="form.amount"
                  type="number"
                  :label="t('付款金额')"
                  outlined
                  dense
                  :suffix="'USD'"
                  :rules="[val => !!val || t('请输入付款金额')]"
                />
              </div>
              <div class="col">
                <q-input
                  v-model="form.payment_time"
                  :label="t('付款时间')"
                  outlined
                  dense
                  readonly
                >
                  <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date v-model="form.payment_time" mask="YYYY-MM-DD HH:mm">
                          <div class="row items-center justify-end">
                            <q-btn v-close-popup :label="t('确定')" color="primary" flat />
                          </div>
                        </q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
              <div class="col">
                <q-input
                  v-model="form.transaction_number"
                  :label="t('交易号')"
                  outlined
                  dense
                  :rules="[val => !!val || t('请输入交易号')]"
                />
              </div>
            </div>
          </div>

          <!-- 第二行：备注 -->
          <div class="col-xs-12">
            <q-input
              v-model="form.user_remark"
              type="textarea"
              :label="t('备注')"
              outlined
              dense
              autogrow
            />
          </div>

          <!-- 第三行：上传水单 -->
          <div class="col-xs-12">
            <div class="text-subtitle2 q-mb-sm">{{ t('上传水单') }}</div>
            <div class="upload-image-container" @click="triggerFileInput">
              <input
                type="file"
                ref="fileInput"
                accept="image/*"
                style="display: none"
                @change="handleFileChange"
              >
              <div v-if="!imagePreview" class="upload-placeholder">
                <q-icon name="add" size="40px" color="grey-6" />
                <div class="text-grey-6 q-mt-sm">{{ t('点击上传') }}</div>
              </div>
              <div v-else class="image-preview">
                <img :src="imagePreview" alt="preview">
                <div class="image-actions">
                  <q-btn
                    round
                    flat
                    dense
                    color="negative"
                    icon="delete"
                    @click.stop="removeImage"
                  />
                </div>
                <q-circular-progress
                  v-if="uploadProgress > 0 && uploadProgress < 100"
                  class="upload-progress"
                  :value="uploadProgress"
                  size="40px"
                  color="primary"
                  show-value
                  font-size="8px"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 提交按钮 -->
    <div class="fixed-bottom-padding">
      <q-btn
        :label="t('提交审核')"
        color="primary"
        :loading="submitting"
        style="width: 200px"
        @click="handleSubmit"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import api from '@/api';

const { t } = useI18n();
const router = useRouter();
const $q = useQuasar();
const fileInput = ref(null);
const imagePreview = ref(null);
const uploadProgress = ref(0);

// 付款方式数据
const paymentMethods = ref([]);
const selectedPaymentMethod = ref(null);

// 获取付款方式列表
const fetchPaymentMethods = async () => {
  try {
    const response = await api.paymentMethods();
    if (response.success) {
      paymentMethods.value = response.data;
      // 添加测试数据
      paymentMethods.value.push({
        id: 1,
        name: "线下收款",
        currency: "USD",
        qr_code: "https://qr.alipay.com/test",
        description: "1. 请使用支付宝扫描二维码进行支付\n2. 支付时请务必填写正确的金额\n3. 支付完成后请保存好支付凭证\n4. 如有问题请联系客服"
      });
    }
  } catch (error) {
    console.error('获取付款方式失败:', error);
    $q.notify({
      type: 'negative',
      message: t('获取付款方式失败')
    });
  }
};

// 处理付款方式变更
const handlePaymentMethodChange = (value) => {
  const method = paymentMethods.value.find(method => method.id === value);
  if (method) {
    selectedPaymentMethod.value = method;
  }
};

// 表单数据
const form = reactive({
  payment_method_id: null,
  amount: null,
  transaction_number: '',
  payment_time: '',
  user_remark: '',
  payment_proof: ''
});

const submitting = ref(false);

// 触发文件选择
const triggerFileInput = () => {
  fileInput.value.click();
};

// 处理文件选择
const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    $q.notify({
      type: 'negative',
      message: t('请上传图片文件')
    });
    return;
  }

  // 预览图片
  const reader = new FileReader();
  reader.onload = (e) => {
    imagePreview.value = e.target.result;
  };
  reader.readAsDataURL(file);

  // TODO: 上传图片
  handleFileUpload(file);
};

// 移除图片
const removeImage = () => {
  imagePreview.value = null;
  form.payment_proof = '';
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

// 处理文件上传
const handleFileUpload = async (file) => {
  if (!file) return;
  
  uploadProgress.value = 0;
  
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'image');
    
    const response = await api.uploads(formData, (e) => {
      // 更新上传进度
      uploadProgress.value = Math.ceil((e.loaded / e.total) * 100);
    });
    
    if (response.success) {
      form.payment_proof = response.data.url;
      $q.notify({
        type: 'positive',
        message: t('上传成功')
      });
    } else {
      imagePreview.value = null;
      if (fileInput.value) {
        fileInput.value.value = '';
      }
      $q.notify({
        type: 'negative',
        message: t('上传失败')
      });
    }
  } catch (error) {
    console.error('文件上传失败:', error);
    imagePreview.value = null;
    if (fileInput.value) {
      fileInput.value.value = '';
    }
    $q.notify({
      type: 'negative',
      message: t('文件上传失败')
    });
  } finally {
    uploadProgress.value = 0;
  }
};

// 提交表单
const handleSubmit = async () => {
  if (!form.payment_proof) {
    $q.notify({
      type: 'warning',
      message: t('请上传水单')
    });
    return;
  }
  console.log(form);
  return;

  try {
    submitting.value = true;
    // TODO: 实现提交逻辑
    // await api.submitRecharge(form);
    $q.notify({
      type: 'positive',
      message: t('提交成功')
    });
    router.back();
  } catch (error) {
    console.error('提交失败:', error);
    $q.notify({
      type: 'negative',
      message: t('提交失败')
    });
  } finally {
    submitting.value = false;
  }
};

// 页面加载时获取付款方式
onMounted(() => {
  fetchPaymentMethods();
});
</script>

<style lang="scss" scoped>
.recharge-page {
  padding: 24px;
  background: white;
  border-radius: 8px;
  min-height: calc(100vh - 48px);
  position: relative;
  padding-bottom: 80px;

  .step-section {
    padding: 24px;
    border: 1px solid #eee;
    border-radius: 8px;
  }

  .payment-info {
    background: #f5f5f5;
    border-radius: 8px;

    .description {
      white-space: pre-line;
      color: #666;
      line-height: 1.5;
    }

    .qr-code-section {
      display: flex;
      justify-content: center;
      padding: 20px 0;

      .qr-code {
        max-width: 200px;
        max-height: 200px;
        object-fit: contain;
      }

      .no-qr-code {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 200px;
        height: 200px;
        background: #eee;
        border-radius: 8px;
      }
    }
  }

  .upload-image-container {
    width: 120px;
    height: 120px;
    border: 2px dashed #ddd;
    border-radius: 8px;
    cursor: pointer;
    overflow: hidden;
    position: relative;

    &:hover {
      border-color: var(--q-primary);
    }

    .upload-placeholder {
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .image-preview {
      width: 100%;
      height: 100%;
      position: relative;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .image-actions {
        position: absolute;
        top: 0;
        right: 0;
        padding: 4px;
        background: rgba(0, 0, 0, 0.5);
        border-bottom-left-radius: 8px;
        opacity: 0;
        transition: opacity 0.3s;
      }

      &:hover .image-actions {
        opacity: 1;
      }

      .upload-progress {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(255, 255, 255, 0.8);
        border-radius: 50%;
      }
    }
  }

  .fixed-bottom-padding {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 16px 24px;
    background: white;
    box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: center;
  }
}
</style> 