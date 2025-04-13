<template>
  <q-dialog v-model="dialogVisible" persistent>
    <q-card style="min-width: 800px">
      <q-card-section class="row items-center">
        <div class="text-h6">{{ t('编辑商品') }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pt-none">
        <q-form @submit="handleSubmit" class="q-gutter-md">
          <div class="row items-center">
            <div class="col-2">{{ t('系统SKU') }}:</div>
            <div class="col-9">{{ skuDetail.sku }}</div>
          </div>

          <div class="row items-center">
            <div class="col-2">{{ t('产品名称') }}:</div>
            <div class="col-9">{{ skuDetail.product?.name || '-' }}</div>
          </div>

          <div class="row items-center">
            <div class="col-2">{{ t('sku名称') }}:</div>
            <div class="col-9">
              <q-input
                v-model="form.name"
                outlined
                dense
                :placeholder="t('请输入商品名称')"
              />
            </div>
          </div>

          <div class="row items-center">
            <div class="col-2">{{ t('商品图片') }}:</div>
            <div class="col-9">
              <div
                class="image-uploader"
                style="width: 104px; height: 104px"
                @click="triggerUpload"
              >
                <q-img
                  v-if="form.image"
                  :src="form.image"
                  style="width: 100%; height: 100%"
                />
                <template v-else>
                  <div class="flex flex-center" style="height: 100%">
                    <q-icon name="add" size="24px" />
                  </div>
                </template>
                <q-circular-progress
                  v-if="uploadProgress > 0 && uploadProgress < 100"
                  class="absolute-center"
                  :value="uploadProgress"
                  size="60px"
                  color="primary"
                  show-value
                />
              </div>
              <q-file
                v-model="imageFile"
                accept="image/*"
                @update:model-value="handleImageUpload"
                style="display: none"
                ref="fileInput"
              />
            </div>
          </div>

          <div class="row items-center">
            <div class="col-2">{{ t('商品规格') }}:</div>
            <div class="col-9">
              <div class="row q-col-gutter-sm">
                <div class="col-2">
                  <q-input
                    v-model.number="form.size_length"
                    type="number"
                    outlined
                    dense
                    :placeholder="t('长')"
                  />
                </div>
                <div class="col-2">
                  <q-input
                    v-model.number="form.size_width"
                    type="number"
                    outlined
                    dense
                    :placeholder="t('宽')"
                  />
                </div>
                <div class="col-2">
                  <q-input
                    v-model.number="form.size_height"
                    type="number"
                    outlined
                    dense
                    :placeholder="t('高')"
                  />
                </div>
                <div class="col-12 text-caption text-grey">
                  {{ t('单位') }}: cm
                </div>
              </div>
            </div>
          </div>

          <div class="row items-center">
            <div class="col-2">{{ t('商品重量') }}:</div>
            <div class="col-9">
              <div class="row items-center">
                <div class="col-4">
                  <q-input
                    v-model.number="form.weight"
                    type="number"
                    outlined
                    dense
                    :placeholder="t('重量')"
                  />
                </div>
                <div class="col-8 text-caption text-grey q-pl-sm">
                  {{ t('单位') }}: g
                </div>
              </div>
            </div>
          </div>
<!-- 
          <div class="row items-center">
            <div class="col-2">{{ t('采购价格') }}:</div>
            <div class="col-9">
              <q-input
                v-model.number="form.purchase_price"
                type="number"
                outlined
                dense
                :placeholder="t('请输入采购价格')"
              />
            </div>
          </div>

          <div class="row items-center">
            <div class="col-2">{{ t('销售价格') }}:</div>
            <div class="col-9">
              <q-input
                v-model.number="form.sale_price"
                type="number"
                outlined
                dense
                :placeholder="t('请输入销售价格')"
              />
            </div>
          </div> -->
        </q-form>
      </q-card-section>

      <q-card-actions align="right" class="bg-white text-primary q-pa-md">
        <q-btn 
          outline 
          color="primary" 
          :label="t('取消')" 
          v-close-popup 
          class="q-px-md"
        />
        <q-btn 
          unelevated 
          color="primary" 
          :label="t('确认')" 
          @click="handleSubmit" 
          :loading="submitting"
          class="q-ml-sm q-px-md"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, defineEmits, defineExpose } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import api from '@/api/index';

const $q = useQuasar();
const { t } = useI18n();
const emit = defineEmits(['success']);

const dialogVisible = ref(false);
const skuDetail = ref({});
const submitting = ref(false);
const uploadProgress = ref(0);
const imageFile = ref(null);
const fileInput = ref(null);

const form = ref({
    sku:'',
  name: '',
  image: '',
  size_length: 0,
  size_width: 0,
  size_height: 0,
  weight: 0,
  purchase_price: 0,
  sale_price: 0
});

// 打开弹窗并获取SKU详情
const open = async (id) => {
  dialogVisible.value = true;
  try {
    const response = await api.getSKUDetail(id);
    if (response.success) {
      skuDetail.value = response.data;
      // 初始化表单数据
      form.value = {
        sku: response.data.sku,
        name: response.data.name,
        image: response.data.image,
        size_length: response.data.size_length,
        size_width: response.data.size_width,
        size_height: response.data.size_height,
        weight: response.data.weight,
        purchase_price: response.data.purchase_price,
        sale_price: response.data.sale_price
      };
    }
  } catch (error) {
    console.error(t('获取SKU详情失败') + ':', error);
  }
};

// 触发文件上传
const triggerUpload = () => {
  fileInput.value.$el.click();
};

// 处理图片上传
const handleImageUpload = async (file) => {
  if (!file) return;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', 'image');

  try {
    uploadProgress.value = 0;
    const response = await api.uploads(formData, (e) => {
      uploadProgress.value = Math.round((e.loaded * 100) / e.total);
    });

    if (response.success) {
      form.value.image = response.data.url;
      uploadProgress.value = 100;
    }
  } catch (error) {
    console.error(t('上传图片失败') + ':', error);
    $q.notify({
      type: 'negative',
      message: t('上传图片失败')
    });
  }
};

// 提交表单
const handleSubmit = async () => {
  try {
    submitting.value = true;
    const response = await api.editSKU(skuDetail.value.id, form.value);
    if (response.success) {
      dialogVisible.value = false;
      emit('success');
    }
  } catch (error) {
    console.error(t('修改失败') + ':', error);
  } finally {
    submitting.value = false;
  }
};

// 暴露方法给父组件
defineExpose({
  open
});
</script>

<style lang="scss" scoped>
.image-uploader {
  border: 1px dashed rgba(0, 0, 0, 0.15);
  border-radius: 4px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  background-color: #fafafa;

  &:hover {
    border-color: var(--q-primary);
  }
}
</style> 