<template>
  <div>
    <q-form @submit="saveComboInfo">
      <div class="text-h5 q-mb-md">
        {{ route.query.id ? t("编辑组合产品") : t("添加组合产品") }}
      </div>

      <div class="compile-combo">
        <div ref="containerRef" class="combo-content">
          <!-- 基础信息卡片 -->
          <q-card class="box-card q-mb-sm" flat id="base-content">
            <q-card-section class="q-pb-none">
              <div class="text-h6 bg-white">{{ t('基础信息') }}</div>
            </q-card-section>

            <q-card-section>
              <div class="row q-col-gutter-lg">
                <!-- 产品图片 -->
                <div class="col-12">
                  <div class="q-mb-md">{{ t('产品图片') }}</div>
                  <div class="full-width">
                    <upload-image
                      v-model="images"
                      :main-image="main_image"
                      @mainImageUpdate="mainImageUpdate"
                    />
                    <div class="text-negative" v-if="!combo.image">
                      {{ t('请上传产品图片') }}
                    </div>
                  </div>
                </div>
                <!-- SKU输入框 -->
                <div class="col-12">
                  <q-input
                    v-model="combo.code"
                    :label="t('SKU')"
                    outlined
                    dense
                    :placeholder="t('请输入SKU')"
                    :rules="[(val) => !!val || t('请输入SKU')]"
                    maxlength="50"
                  >
                    <template v-slot:append>
                      <div class="text-caption text-grey-7">{{ combo.code ? combo.code.length : 0 }}/50</div>
                    </template>
                  </q-input>
                </div>
                <!-- 组合产品名称 - 使用较大的输入框 -->
                <div class="col-12">
                  <q-input
                    v-model="combo.name"
                    :label="t('组合产品名称')"
                    outlined
                    type="textarea"
                    rows="3"
                    :placeholder="t('请输入组合产品名称')"
                    :rules="[(val) => !!val || t('请输入组合产品名称')]"
                    maxlength="200"
                  >
                    <template v-slot:append>
                      <div class="text-caption text-grey-7">{{ combo.name ? combo.name.length : 0 }}/200</div>
                    </template>
                  </q-input>
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- 组合商品列表卡片 -->
          <q-card class="box-card q-mb-sm" flat id="combo-content">
            <q-card-section class="q-pb-none">
              <div class="text-h6 bg-white">{{ t('组合商品列表') }}</div>
            </q-card-section>

            <q-card-section>
              <div class="row justify-end q-mb-md">
                <q-btn
                  color="primary"
                  :label="t('选择商品')"
                  @click="openSkuDialog"
                />
              </div>

              <q-table
                :rows="combo.specs"
                :columns="comboColumns"
                row-key="sku"
                flat
                bordered
              >
                <template v-slot:body="props">
                  <q-tr :props="props">
                    <q-td key="skuInfo" :props="props">
                      <div class="row no-wrap items-center">
                        <div class="q-mr-sm">
                          <img 
                            :src="props.row.image" 
                            style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;"
                          />
                        </div>
                        <div class="ellipsis">
                          <div>SKU: {{ props.row.sku }}</div>
                          <div class="ellipsis">{{ props.row.product_name }}</div>
                          <div>{{ props.row.spec_name }}</div>
                        </div>
                      </div>
                    </q-td>
                    <q-td key="quantity" :props="props" class="text-center">
                      <div class="row justify-center items-center">
                        <q-input
                          v-model.number="props.row.quantity"
                          type="number"
                          dense
                          outlined
                          min="1"
                          class="quantity-input"
                          style="width: 80px"
                          @update:model-value="val => handleQuantityChange(val, props.row)"
                        />
                      </div>
                    </q-td>
                    <q-td key="operations" :props="props" class="text-center">
                      <q-btn
                        flat
                        round
                        color="negative"
                        icon="delete"
                        @click="removeSpec(props.rowIndex)"
                      />
                    </q-td>
                  </q-tr>
                </template>
              </q-table>
            </q-card-section>
          </q-card>
        </div>

        <!-- 底部固定操作栏 -->
        <div class="fixed-bottom-bar">
          <div class="row justify-center q-pa-md">
            <q-btn outline :label="t('取消')" color="grey-7" @click="$router.back()" />
            <q-btn
              color="primary"
              :label="t('保存')"
              type="submit"
              class="q-mx-sm"
            />
          </div>
        </div>

        <!-- 底部占位,防止内容被固定栏遮挡 -->
        <div class="bottom-placeholder" />
      </div>
    </q-form>

    <!-- SKU选择弹窗 -->
    <sku-select-dialog
      ref="skuDialogRef"
      @selected="handleSkuSelected"
      @cancel="handleSkuCancel"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import UploadImage from "@/components/UploadImage.vue";
import SkuSelectDialog from "@/components/SkuSelectDialog/SkuSelectDialog.vue";
import api from '@/api/index';

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const $q = useQuasar();

// 组合产品数据
const combo = reactive({
  name: '',
  code: '',
  image: '',
  specs: [],
  sale_price: 0
});

// 图片上传相关
const images = ref([]);
const main_image = ref({ url: '' });

// 获取组合产品详情
const getComboDetail = async (id) => {
  try {
    const response = await api.getComboDetail(id);
    if (response.success) {
      const data = response.data;
      // 回显基础信息
      combo.name = data.name;
      combo.code = data.code;
      combo.image = data.image;
      combo.sale_price = data.sale_price;
      
      // 回显图片
      if (data.image) {
        main_image.value = { url: data.image };
        images.value = [{ url: data.image }];
      }
      
      // 回显规格信息
      combo.specs = data.specs.map(spec => ({
        sku: spec.sku,
        quantity: spec.quantity,
        image: spec.spec.image,
        product_name: spec.spec.product.name,
        spec_name: spec.spec.name
      }));
    }
  } catch (error) {
    console.error('获取详情失败:', error);
    $q.notify({
      type: 'negative',
      message: t('获取详情失败')
    });
  }
};

// 在组件挂载时判断是否为编辑模式
onMounted(async () => {
  const id = route.query.id;
  if (id) {
    await getComboDetail(id);
  }
});

// 主图更新
const mainImageUpdate = (mainImage) => {
  main_image.value = mainImage;
  combo.image = mainImage.url || '';
};

// SKU选择弹窗引用
const skuDialogRef = ref(null);

// 组合商品表格列定义
const comboColumns = [
  {
    name: 'skuInfo',
    required: true,
    label: t('商品信息'),
    align: 'left',
    field: row => row.sku,
    style: 'width: 60%'
  },
  {
    name: 'quantity',
    required: true,
    label: t('数量'),
    align: 'center',
    field: 'quantity',
    style: 'width: 20%'
  },
  {
    name: 'operations',
    label: t('操作'),
    align: 'center',
    style: 'width: 20%'
  }
];

// 打开SKU选择弹窗
const openSkuDialog = () => {
  skuDialogRef.value.open();
};

// 处理SKU选择
const handleSkuSelected = (selectedSkus) => {
  selectedSkus.forEach(sku => {
    // 检查是否已存在
    const exists = combo.specs.some(spec => spec.sku === sku.sku);
    if (!exists) {
      combo.specs.push({
        sku: sku.sku,
        quantity: 1,
        // 用于显示的额外信息
        image: sku.image,
        product_name: sku.product?.name,
        spec_name: sku.name
      });
    }
  });
};

// 处理SKU选择取消
const handleSkuCancel = () => {
  // 处理取消选择的逻辑
};

// 移除规格
const removeSpec = (index) => {
  combo.specs.splice(index, 1);
};

// 处理数量变化
const handleQuantityChange = (val, row) => {
  // 确保数量不小于1
  if (val < 1) {
    row.quantity = 1;
  }
};

// 保存组合产品信息
const saveComboInfo = async () => {
  try {
    // 构建请求参数
    const params = {
      name: combo.name,
      code: combo.code,
      image: combo.image,
      sale_price: combo.sale_price,
      specs: combo.specs.map(spec => ({
        sku: spec.sku,
        quantity: spec.quantity
      }))
    };

    // 判断是新增还是编辑
    const id = route.query.id;
    let response;
    if (id) {
      // 编辑模式
      response = await api.editCombo(id, params);
    } else {
      // 新增模式
      response = await api.addCombo(params);
    }
    
    if (response.success) {
      $q.notify({
        type: 'positive',
        message: t('保存成功')
      });
      router.push('/product');
    }
  } catch (error) {
    console.error('保存失败:', error);
    $q.notify({
      type: 'negative',
      message: t('保存失败')
    });
  }
};
</script>

<style lang="scss" scoped>
.compile-combo {
  margin: 0 auto;
  position: relative;

  .combo-content {
    height: calc(100vh - 205px);
    overflow-y: auto;
    padding-bottom: 70px;

    /* 美化滚动条 */
    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.03);
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.12);
      border-radius: 3px;

      &:hover {
        background: rgba(0, 0, 0, 0.2);
      }
    }
  }

  .fixed-bottom-bar {
    margin: 0!important;
    position: fixed;
    bottom: 0;
    left: 240px;
    right: 0;
    background: white;
    box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
    z-index: 1000;
  }

  .bottom-placeholder {
    height: 72px;
  }

  /* 卡片样式优化 */
  .box-card {
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05) !important;
    transition: all 0.3s ease;
    overflow: hidden;
    margin-bottom: 24px;

    &:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08) !important;
    }

    .q-card__section:first-child {
      padding: 20px 24px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      background-color: #ffffff;
    }

    .q-card__section:not(:first-child) {
      padding: 24px;
      background-color: #ffffff;
    }

    .text-h6 {
      font-size: 18px;
      font-weight: 500;
      color: #333;
    }
  }

  /* 表单控件样式优化 */
  :deep(.q-field) {
    margin-bottom: 8px;
  }

  :deep(.q-field--outlined .q-field__control) {
    border-radius: 6px;
    transition: all 0.2s ease;
  }

  :deep(.q-field--focused .q-field__control) {
    box-shadow: 0 0 0 1px var(--q-primary),
      0 0 0 4px rgba(var(--q-primary-rgb), 0.1);
  }

  :deep(.q-field__label) {
    font-weight: 500;
    color: #555;
  }

  /* 按钮样式优化 */
  :deep(.q-btn) {
    border-radius: 6px;
  }

  :deep(.q-btn--outline) {
    border-width: 1px;
  }

  .ellipsis {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 400px;
  }

  .required-field {
    &::after {
      content: "*";
      color: #ff0000;
      margin-left: 4px;
    }
  }

  .text-subtitle2 {
    font-size: 14px;
    font-weight: 500;
  }

  .text-caption {
    font-size: 12px;
  }

  .quantity-input {
    :deep(.q-field__native) {
      text-align: center;
    }
    
    :deep(.q-field__control) {
      height: 32px;
    }
  }
}
</style> 