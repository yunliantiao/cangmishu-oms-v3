<template>
  <div class="outbound-create">
    <q-form @submit="submitForm" class="q-gutter-md">
      <!-- 主卡片 -->
      <q-card flat bordered>
        <!-- 基本信息区域 -->
        <q-card-section>
          <div class="text-h6 q-mb-md">{{ t('基本信息') }}</div>

          <div class="row q-col-gutter-md">
            <!-- 第一行 -->
            <div class="col-12 col-md-4">
              <div class="form-item">
                <div class="form-item-label">
                  {{ t('订单号') }}
                  <span class="text-negative">*</span>
                </div>
                <q-input
                  v-model="form.order_number"
                  outlined
                  dense
                  :placeholder="t('请输入')"
                  :rules="[(val) => !!val || t('请输入订单号')]"
                />
              </div>
            </div>

            <div class="col-12 col-md-4">
              <div class="form-item">
                <div class="form-item-label">
                  {{ t('平台') }}
                  <span class="text-negative">*</span>
                </div>
                <q-select
                  v-model="form.platform"
                  :options="platformOptions"
                  outlined
                  dense
                  emit-value
                  map-options
                  :label="t('请选择平台')"
                  :rules="[(val) => !!val || t('请选择平台')]"
                />
              </div>
            </div>

            <div class="col-12 col-md-4">
              <div class="form-item">
                <div class="form-item-label">
                  {{ t('面单类型') }}
                  <span class="text-negative">*</span>
                </div>
                <q-select
                  v-model="form.label_type"
                  :options="labelTypeOptions"
                  outlined
                  dense
                  emit-value
                  map-options
                  :label="t('请选择面单类型')"
                  :rules="[(val) => !!val || t('请选择面单类型')]"
                />
              </div>
            </div>

            <!-- 第二行 -->
            <div class="col-12 col-md-4">
              <div class="form-item">
                <div class="form-item-label">{{ t('参考号') }}</div>
                <q-input v-model="form.reference_number" outlined dense :placeholder="t('请输入')" />
              </div>
            </div>

            <!-- 第三行 -->
            <div class="col-12 col-md-4">
              <div class="form-item">
                <div class="form-item-label">
                  {{ t('订单金额') }}
                </div>
                <div class="row q-col-gutter-sm">
                  <div class="col-8">
                    <q-input v-model="form.order_amount" outlined dense type="number" :placeholder="t('请输入')" />
                  </div>
                  <div class="col-4">
                    <q-select
                      v-model="form.currency"
                      :options="currencyOptions"
                      outlined
                      dense
                      emit-value
                      map-options
                      :label="t('币种')"
                      :hint="!form.currency ? t('请选择币种') : ''"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- 运单号输入框 - 仅在自有面单时显示 -->
            <div v-if="form.label_type === 'self_label'" class="col-12 col-md-4">
              <div class="form-item">
                <div class="form-item-label">
                  {{ t('运单号') }}
                  <span class="text-negative">*</span>
                </div>
                <q-input
                  v-model="form.tracking_number"
                  outlined
                  dense
                  :placeholder="t('请输入运单号')"
                  :rules="[(val) => !!val || t('请输入运单号')]"
                />
              </div>
            </div>

            <!-- 备注 -->
            <div class="col-12">
              <div class="form-item">
                <div class="form-item-label">
                  {{ t('备注') }}
                </div>
                <q-input
                  v-model="form.remark"
                  outlined
                  dense
                  type="textarea"
                  :placeholder="t('请输入')"
                  rows="4"
                  maxlength="200"
                  counter
                />
              </div>
            </div>
          </div>
        </q-card-section>

        <q-separator />
        <!-- 自有面单上传区域 - 在面单类型为自有面单时显示 -->
        <q-card-section v-if="form.label_type === 'self_label'">
          <div class="text-h6 q-mb-md">{{ t('面单信息') }}</div>
          <div class="row q-col-gutter-md">
            <div class="col-12">
              <div class="form-item">
                <div class="form-item-label">
                  {{ t('上传面单') }}
                  <span class="text-negative">*</span>
                </div>
                <div class="upload-area q-pa-md" :class="{ 'has-file': form.label_pdf }">
                  <template v-if="!form.label_pdf">
                    <input ref="fileInput" type="file" accept=".pdf" style="display: none" @change="handleFileUpload" />
                    <q-btn
                      outline
                      color="primary"
                      :label="t('点击上传')"
                      class="q-mb-sm"
                      icon="upload"
                      @click="$refs.fileInput.click()"
                    >
                      <q-tooltip>{{ t('仅限上传PDF格式文件') }}</q-tooltip>
                    </q-btn>
                    <div class="text-caption text-grey">{{ t('仅限上传PDF格式文件') }}</div>
                  </template>

                  <template v-else>
                    <div class="row items-center justify-between q-pa-sm full-width">
                      <div class="row items-center">
                        <q-icon name="picture_as_pdf" color="primary" size="24px" class="q-mr-sm" />
                        <div class="text-body2">{{ form.label_pdf.split('/').pop() }}</div>
                      </div>
                      <div>
                        <q-btn flat round dense color="grey" icon="close" @click="handleRemoveFile">
                          <q-tooltip>{{ t('删除') }}</q-tooltip>
                        </q-btn>
                      </div>
                    </div>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </q-card-section>

        <q-separator v-if="form.label_type === 'warehouse_label' || form.label_type === 'self_label'" />
        <!-- 收件信息区域 - 移除条件判断，始终显示 -->
        <q-card-section>
          <div class="text-h6 q-mb-md">{{ t('收件信息') }}</div>
          <div class="row q-col-gutter-md">
            <!-- 第一行 -->
            <div class="col-12 col-md-4">
              <div class="form-item">
                <div class="form-item-label">
                  {{ t('收件人') }}
                  <span class="text-negative">*</span>
                </div>
                <q-input
                  v-model="form.recipient.first_name"
                  outlined
                  dense
                  :placeholder="t('请输入')"
                  :rules="[(val) => !!val || t('请输入收件人')]"
                />
              </div>
            </div>

            <div class="col-12 col-md-4">
              <div class="form-item">
                <div class="form-item-label">
                  {{ t('手机号') }}
                  <span class="text-negative">*</span>
                </div>
                <q-input
                  v-model="form.recipient.phone"
                  outlined
                  dense
                  :placeholder="t('请输入')"
                  :rules="[(val) => !!val || t('请输入手机号')]"
                />
              </div>
            </div>

            <div class="col-12 col-md-4">
              <div class="form-item">
                <div class="form-item-label">
                  {{ t('邮箱') }}
                </div>
                <q-input v-model="form.recipient.email" outlined dense :placeholder="t('请输入')" />
              </div>
            </div>

            <!-- 第二行 -->
            <div class="col-12 col-md-4">
              <div class="form-item">
                <div class="form-item-label">
                  {{ t('邮政编码') }}
                  <span class="text-negative">*</span>
                </div>
                <q-input
                  v-model="form.recipient.postcode"
                  outlined
                  dense
                  :placeholder="t('请输入')"
                  :rules="[(val) => !!val || t('请输入邮政编码')]"
                />
              </div>
            </div>

            <div class="col-12 col-md-4">
              <div class="form-item">
                <div class="form-item-label">
                  {{ t('国家/地区') }}
                  <span class="text-negative">*</span>
                </div>
                <q-select
                  v-model="form.recipient.country_code"
                  :options="countryOptions"
                  outlined
                  dense
                  emit-value
                  map-options
                  :label="t('请选择')"
                  option-label="label"
                  option-value="value"
                  :rules="[(val) => !!val || t('请选择国家/地区')]"
                  use-input
                  input-debounce="0"
                  @filter="filterCountry"
                  :loading="countryLoading"
                />
              </div>
            </div>

            <!-- 第三行 -->
            <div class="col-12 col-md-4">
              <div class="form-item">
                <div class="form-item-label">
                  {{ t('省/州') }}
                  <span class="text-negative">*</span>
                </div>
                <q-input
                  v-model="form.recipient.province"
                  outlined
                  dense
                  :placeholder="t('请输入')"
                  :rules="[(val) => !!val || t('请输入省/州')]"
                />
              </div>
            </div>

            <div class="col-12 col-md-4">
              <div class="form-item">
                <div class="form-item-label">
                  {{ t('市/府') }}
                  <span class="text-negative">*</span>
                </div>
                <q-input
                  v-model="form.recipient.city"
                  outlined
                  dense
                  :placeholder="t('请输入')"
                  :rules="[(val) => !!val || t('请输入市/府')]"
                />
              </div>
            </div>

            <div class="col-12 col-md-4">
              <div class="form-item">
                <div class="form-item-label">
                  {{ t('区/县') }}
                </div>
                <q-input v-model="form.recipient.district" outlined dense :placeholder="t('请输入')" />
              </div>
            </div>

            <!-- 第四行 -->
            <div class="col-12">
              <div class="form-item">
                <div class="form-item-label">
                  {{ t('地址1') }}
                  <span class="text-negative">*</span>
                </div>
                <q-input
                  v-model="form.recipient.address1"
                  outlined
                  dense
                  type="textarea"
                  :placeholder="t('请输入')"
                  :rules="[(val) => !!val || t('请输入地址1')]"
                />
              </div>
            </div>

            <div class="col-12">
              <div class="form-item">
                <div class="form-item-label">
                  {{ t('地址2') }}
                </div>
                <q-input v-model="form.recipient.address2" outlined dense type="textarea" :placeholder="t('请输入')" />
              </div>
            </div>
          </div>
        </q-card-section>

        <q-separator v-if="form.label_type === 'warehouse_label' || form.label_type === 'self_label'" />

        <!-- 商品信息区域 -->
        <q-card-section>
          <div class="text-h6 q-mb-md">{{ t('商品信息') }}</div>
          <div class="q-mb-md">
            <q-btn color="primary" :label="t('选择商品')" @click="openSkuDialog" />
          </div>

          <q-table
            flat
            :rows="form.items"
            :columns="[
              {
                name: 'skuInfo',
                label: '商品信息',
                field: (row) => row.sku,
                align: 'left',
                style: 'width: 40%',
              },
              {
                name: 'spec',
                label: '实际规格',
                field: (row) =>
                  `${row.warehouse_size_length || 0}*${row.warehouse_size_width || 0}*${
                    row.warehouse_size_height || 0
                  } cm\n${row.warehouse_weight || 0} g`,
                align: 'center',
                style: 'width: 20%',
              },
              {
                name: 'stock',
                label: '可用库存',
                field: 'stock',
                align: 'right',
              },
              {
                name: 'quantity',
                label: '数量',
                field: 'quantity',
                align: 'right',
              },
              {
                name: 'unit_price',
                label: '单价',
                field: 'unit_price',
                align: 'right',
              },
              {
                name: 'actions',
                label: '操作',
                field: 'actions',
                align: 'center',
              },
            ]"
            hide-pagination
          >
            <!-- 加载动画插槽 -->
            <template v-slot:loading>
              <q-inner-loading showing color="primary">
                <q-spinner-dots size="50px" />
              </q-inner-loading>
            </template>

            <!-- 无数据时的显示 -->
            <template v-slot:no-data>
              <div
                v-if="!loading && (!form.items || form.items.length === 0)"
                class="full-width row flex-center q-my-lg"
              >
                <span class="text-grey">{{ t('暂无商品') }}</span>
              </div>
            </template>

            <template v-slot:body-cell-skuInfo="props">
              <q-td :props="props">
                <div class="row no-wrap items-center">
                  <div class="q-mr-sm">
                    <img
                      :src="props.row?.image"
                      style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px"
                    />
                  </div>
                  <div class="ellipsis">
                    <div>SKU: {{ props.row?.sku || '-' }}</div>
                    <div class="ellipsis">{{ props.row?.product_name || '-' }}</div>
                    <div>规格: {{ props.row?.name || '-' }}</div>
                  </div>
                </div>
              </q-td>
            </template>

            <template v-slot:body-cell-spec="props">
              <q-td :props="props" class="text-center" style="white-space: pre-line">
                {{
                  `${props.row?.warehouse_size_length || 0}*${props.row?.warehouse_size_width || 0}*${
                    props.row?.warehouse_size_height || 0
                  } cm\n${props.row?.warehouse_weight || 0} g`
                }}
              </q-td>
            </template>

            <template v-slot:body-cell-quantity="props">
              <q-td :props="props" class="text-center">
                <q-input
                  v-model.number="props.row.quantity"
                  type="number"
                  dense
                  outlined
                  class="input-sm text-right"
                  style="margin-left: auto"
                />
              </q-td>
            </template>

            <template v-slot:body-cell-unit_price="props">
              <q-td :props="props" class="text-center">
                <q-input
                  v-model.number="props.row.unit_price"
                  type="number"
                  dense
                  outlined
                  class="input-sm text-right"
                  style="margin-left: auto"
                />
              </q-td>
            </template>

            <template v-slot:body-cell-actions="props">
              <q-td :props="props" class="text-center">
                <q-btn
                  flat
                  round
                  dense
                  color="negative"
                  icon="delete"
                  @click="form.items = form.items.filter((item) => item !== props.row)"
                >
                  <q-tooltip>{{ t('删除') }}</q-tooltip>
                </q-btn>
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>

      <!-- 底部操作按钮 -->
      <div class="fixed-bottom-bar">
        <div class="row justify-center q-pa-md">
          <q-btn outline :label="t('取消')" color="grey-7" @click="handleCancel" />
          <q-btn color="primary" outline :label="t('保存')" @click="handleSave" :loading="submitting" class="q-mx-sm" />
          <q-btn type="submit" :label="t('保存并提交')" color="primary" :loading="submitting" />
        </div>
      </div>

      <!-- 底部占位,防止内容被固定栏遮挡 -->
      <div class="bottom-placeholder" />

      <!-- SKU选择弹窗 -->
      <sku-select-dialog ref="skuSelectDialog" @selected="handleSkusSelected" />
    </q-form>
  </div>
</template>

<script setup>
import api from '@/api/index';
import { useQuasar } from 'quasar';
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import SkuSelectDialog from './components/SelectSkuDialog.vue';

const router = useRouter();
const route = useRoute();
const isEdit = computed(() => !!route.query.id);
const outboundId = computed(() => route.query.id);
const { t } = useI18n();
const $q = useQuasar();

// 表单数据
const form = ref({
  order_number: '',
  platform: '',
  label_type: '',
  label_pdf: '',
  tracking_number: '',
  reference_number: '',
  order_amount: null,
  currency: 'CNY',
  remark: '',
  items: [],
  recipient: {
    first_name: '',
    phone: '',
    email: '',
    postcode: '',
    country_code: '',
    province: '',
    city: '',
    district: '',
    address1: '',
    address2: '',
  },
});

// 平台选项
const platformOptions = computed(() => [
  { label: t('DSFulfill'), value: 'dsfulfill' },
  { label: t('其他'), value: 'other' },
  { label: t('客户'), value: 'customer' },
]);

// 面单类型选项
const labelTypeOptions = computed(() => [
  { label: t('发货仓库面单'), value: 'warehouse_label' },
  { label: t('自有面单'), value: 'self_label' },
]);

// 币种选项
const currencyOptions = [
  { label: 'USD', value: 'USD' },
  { label: 'CNY', value: 'CNY' },
];

// 国家列表数据
const countryOptions = ref([]);
const allCountryOptions = ref([]); // 保存所有国家选项的副本
const countryLoading = ref(false); // 国家选择加载状态

// 获取国家列表
const fetchCountryList = async () => {
  try {
    const data = await api.getCountryList();
    if (data?.data) {
      countryOptions.value = data.data.map((country) => ({
        label: country.name,
        value: country.code,
      }));
      // 保存所有国家选项的副本
      allCountryOptions.value = [...countryOptions.value];
    }
    console.log(countryOptions.value, '789');
  } catch (error) {
    console.error('获取国家列表失败:', error);
  }
};

// 过滤国家选项
const filterCountry = (val, update, abort) => {
  update(() => {
    countryLoading.value = true;
    const needle = val.toLowerCase();

    // 如果输入为空，显示所有选项
    if (needle === '') {
      countryOptions.value = [...allCountryOptions.value];
      countryLoading.value = false;
      return;
    }

    // 过滤匹配的国家
    countryOptions.value = allCountryOptions.value.filter(
      (country) => country.label.toLowerCase().indexOf(needle) > -1
    );

    countryLoading.value = false;
  });
};

// SKU选择弹窗引用
const skuSelectDialog = ref(null);

// 打开SKU选择弹窗
const openSkuDialog = () => {
  skuSelectDialog.value.open();
};

// 处理选中的SKUs
const handleSkusSelected = (selectedSkus) => {
  selectedSkus.forEach((sku) => {
    const existing = form.value.items.find((item) => item.sku === sku.sku);
    if (!existing) {
      form.value.items.push({
        sku: sku.sku,
        name: sku.name,
        product_name: sku.product_name,
        spec: sku.name,
        image: sku.image,
        warehouse_size_length: sku.warehouse_size_length,
        warehouse_size_width: sku.warehouse_size_width,
        warehouse_size_height: sku.warehouse_size_height,
        warehouse_weight: sku.warehouse_weight,
        unit_price: 0,
        stock: sku.available_qty,
        quantity: 1,
      });
    }
  });
};

// 移除商品
const removeItem = (index) => {
  form.value.items.splice(index, 1);
};

// 在 script setup 中添加 submitting ref
const submitting = ref(false);

// 获取出库单详情
const fetchOutboundDetail = async () => {
  try {
    const response = await api.getOutboundDetail(outboundId.value);
    if (response.success) {
      const detail = response.data;

      // 填充基本信息
      form.value = {
        order_number: detail.order_number,
        platform: detail.platform,
        label_type: detail.label_type,
        label_pdf: detail.label_pdf,
        tracking_number: detail.tracking_number,
        reference_number: detail.reference_number,
        order_amount: detail.order_amount,
        currency: detail.currency,
        remark: detail.remark,
        items:
          detail.packages[0]?.items.map((item) => ({
            sku: item.sku,
            name: item.sku_name,
            product_name: item.product_name,
            spec: item.sku_name,
            image: item.sku_image,
            warehouse_size_length: item.sku_size_length,
            warehouse_size_width: item.sku_size_width,
            warehouse_size_height: item.sku_size_height,
            warehouse_weight: item.sku_weight,
            unit_price: item.unit_price,
            stock: 0,
            quantity: item.quantity,
          })) || [],
        recipient: {
          first_name: detail.recipient.first_name,
          phone: detail.recipient.phone,
          email: detail.recipient.email,
          postcode: detail.recipient.postcode,
          country_code: detail.recipient.country_code,
          province: detail.recipient.province,
          city: detail.recipient.city,
          district: detail.recipient.district,
          address1: detail.recipient.address1,
          address2: detail.recipient.address2,
        },
      };
    }
  } catch (error) {
    console.error('获取出库单详情失败:', error);
    $q.notify({
      type: 'negative',
      message: t('获取出库单详情失败'),
    });
  }
};

// 修改现有的保存方法
const handleSave = async () => {
  try {
    submitting.value = true;
    // 根据面单类型处理请求数据
    const requestData = {
      ...form.value,
    };

    if (form.value.label_type !== 'self_label') {
      requestData.label_pdf = undefined;
    }

    const data = isEdit.value
      ? await api.editOutbound(outboundId.value, requestData)
      : await api.createOutbound(requestData);

    if (data.success) {
      $q.notify({
        type: 'positive',
        message: t(isEdit.value ? '编辑成功' : '创建成功'),
      });
      router.push('/outbound/list');
    }
  } catch (error) {
    console.error(isEdit.value ? '编辑失败:' : '创建失败:', error);
    $q.notify({
      type: 'negative',
      message: t(isEdit.value ? '编辑失败' : '创建失败'),
    });
  } finally {
    submitting.value = false;
  }
};

// 修改表单提交方法(保存并提交)
const submitForm = async () => {
  try {
    submitting.value = true;
    // 根据面单类型处理请求数据
    const requestData = {
      ...form.value,
    };

    if (form.value.label_type !== 'self_label') {
      requestData.label_pdf = undefined;
    }

    // 先创建/编辑订单
    const saveRes = isEdit.value
      ? await api.editOutbound(outboundId.value, requestData)
      : await api.createOutbound(requestData);

    if (saveRes.success) {
      // 创建/编辑成功后提交
      const submitRes = await api.submitOutbound(isEdit.value ? outboundId.value : saveRes.data.id);
      if (submitRes.success) {
        $q.notify({
          type: 'positive',
          message: t('提交成功'),
        });
        router.push('/outbound/list');
      }
    }
  } catch (error) {
    console.error('操作失败:', error);
    $q.notify({
      type: 'negative',
      message: t('操作失败'),
    });
  } finally {
    submitting.value = false;
  }
};

// 取消
const handleCancel = () => {
  router.back();
};

// 处理文件上传
const fileInput = ref(null);

const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // 检查文件类型
  if (file.type !== 'application/pdf') {
    $q.notify({
      type: 'negative',
      message: t('请上传PDF格式文件'),
    });
    return;
  }

  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'pdf');

    const data = await api.uploads(formData);
    if (data.success) {
      form.value.label_pdf = data.data.url;
      $q.notify({
        type: 'positive',
        message: t('上传成功'),
      });
    }
  } catch (error) {
    console.error('上传失败:', error);
    $q.notify({
      type: 'negative',
      message: t('上传失败'),
    });
  }
  // 清空input的value,这样可以重复上传同一个文件
  event.target.value = '';
};

// 删除已上传文件
const handleRemoveFile = () => {
  form.value.label_pdf = '';
};

// 监听面单类型变化
watch(
  () => form.value.label_type,
  (newType) => {
    if (newType === 'warehouse_label') {
      form.value.tracking_number = ''; // 清空运单号
    }
  }
);

// 初始化
onMounted(async () => {
  if (isEdit.value) {
    await fetchOutboundDetail();
  }
  fetchCountryList();
});
</script>

<style lang="scss" scoped>
.outbound-create {
  .outbound-table {
    :deep(.q-table) {
      table {
        table-layout: fixed;
      }

      thead tr th {
        background: #f5f5f5;
        padding: 8px 16px;
      }

      td {
        padding: 8px 16px;
        vertical-align: top;
      }

      tbody tr:first-child td {
        border-top: none;
      }

      .q-table__bottom {
        border-top: none;
      }
    }
  }

  .q-input-sm {
    width: 100px;
  }

  .ellipsis-2-lines {
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    word-break: break-all;
    line-height: 1.4;
    max-height: 2.8em;
  }

  .fixed-bottom-bar {
    margin: 0 !important;
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

  .input-sm {
    width: 100px;

    :deep(.q-field__native) {
      text-align: right;
      padding-right: 4px;
    }
  }

  .ellipsis {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 400px;
  }

  :deep(.q-table) {
    td {
      padding: 8px 16px;
      vertical-align: middle;
    }

    th {
      padding: 8px 16px;
      background: #f5f5f5;
    }

    tbody tr:first-child td {
      border-top: none;
    }

    .q-table__bottom {
      border-top: none;
    }
  }

  .upload-area {
    border: 1px dashed #dcdfe6;
    border-radius: 4px;
    text-align: center;
    background-color: #fafafa;
    cursor: pointer;
    transition: border-color 0.3s;
    min-height: 120px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    &:hover {
      border-color: #409eff;
    }

    &.has-file {
      background-color: #fff;
      cursor: default;
    }

    :deep(.q-uploader) {
      width: 100%;
      background: transparent;
      border: none;
      box-shadow: none;
    }

    :deep(.q-uploader__header) {
      background: transparent;
      padding: 0;
    }

    :deep(.q-uploader__list) {
      display: none;
    }

    .upload-header {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
  }
}
</style>
