<template>
  <div class="outbound-detail">
    <!-- 标题 -->
    <div class="text-h5 q-mb-md">{{ t('出库单详情') }}</div>

    <!-- 主卡片 -->
    <q-card flat bordered>
      <!-- 基本信息区域 -->
      <q-card-section>
        <div class="text-h6 q-mb-md">{{ t('基本信息') }}</div>

        <div class="row q-col-gutter-md">
          <!-- 第一行 -->
          <div class="col-12 col-md-4">
            <div class="form-item">
              <div class="form-item-label">{{ t('订单号') }}</div>
              <div class="form-item-value">{{ detail.order_number }}</div>
            </div>
          </div>

          <div class="col-12 col-md-4">
            <div class="form-item">
              <div class="form-item-label">{{ t('平台') }}</div>
              <div class="form-item-value">{{ getPlatformText(detail.platform) }}</div>
            </div>
          </div>

          <div class="col-12 col-md-4">
            <div class="form-item">
              <div class="form-item-label">{{ t('面单类型') }}</div>
              <div class="form-item-value">{{ getLabelTypeText(detail.label_type) }}</div>
            </div>
          </div>

          <!-- 第二行 -->
          <div class="col-12 col-md-4">
            <div class="form-item">
              <div class="form-item-label">{{ t('参考号') }}</div>
              <div class="form-item-value">{{ detail.reference_number || '--' }}</div>
            </div>
          </div>

          <!-- 第三行 -->
          <div class="col-12 col-md-4">
            <div class="form-item">
              <div class="form-item-label">{{ t('订单金额') }}</div>
              <div class="form-item-value">
                {{ detail.order_amount ? `${detail.order_amount} ${detail.currency}` : '--' }}
              </div>
            </div>
          </div>

          <!-- 运单号 - 仅在自有面单时显示 -->
          <div v-if="detail.label_type === 'self_label'" class="col-12 col-md-4">
            <div class="form-item">
              <div class="form-item-label">{{ t('运单号') }}</div>
              <div class="form-item-value">{{ detail.tracking_number }}</div>
            </div>
          </div>

          <!-- 备注 -->
          <div class="col-12">
            <div class="form-item">
              <div class="form-item-label">{{ t('备注') }}</div>
              <div class="form-item-value">{{ detail.remark || '--' }}</div>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-separator />
      <!-- 自有面单上传区域 - 在面单类型为自有面单时显示 -->
      <q-card-section v-if="detail.label_type === 'self_label'">
        <div class="text-h6 q-mb-md">{{ t('面单信息') }}</div>
        <div class="row q-col-gutter-md">
          <div class="col-12">
            <div class="form-item">
              <div class="form-item-label">{{ t('面单文件') }}</div>
              <div class="form-item-value">
                <q-btn
                  color="primary"
                  :label="t('下载面单')"
                  icon="download"
                  @click="handleDownloadLabel"
                />
              </div>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-separator />
      <!-- 收件人信息区域 -->
      <q-card-section>
        <div class="text-h6 q-mb-md">{{ t('收件信息') }}</div>
        <div class="row q-col-gutter-md">
          <!-- 第一行 -->
          <div class="col-12 col-md-4">
            <div class="form-item">
              <div class="form-item-label">{{ t('收件人') }}</div>
              <div class="form-item-value">{{ detail.recipient?.first_name }}</div>
            </div>
          </div>

          <div class="col-12 col-md-4">
            <div class="form-item">
              <div class="form-item-label">{{ t('手机号') }}</div>
              <div class="form-item-value">{{ detail.recipient?.phone }}</div>
            </div>
          </div>

          <div class="col-12 col-md-4">
            <div class="form-item">
              <div class="form-item-label">{{ t('邮箱') }}</div>
              <div class="form-item-value">{{ detail.recipient?.email || '--' }}</div>
            </div>
          </div>

          <!-- 第二行 -->
          <div class="col-12 col-md-4">
            <div class="form-item">
              <div class="form-item-label">{{ t('邮政编码') }}</div>
              <div class="form-item-value">{{ detail.recipient?.postcode }}</div>
            </div>
          </div>

          <div class="col-12 col-md-4">
            <div class="form-item">
              <div class="form-item-label">{{ t('国家/地区') }}</div>
              <div class="form-item-value">{{ detail.recipient?.country_code }}</div>
            </div>
          </div>

          <!-- 第三行 -->
          <div class="col-12 col-md-4">
            <div class="form-item">
              <div class="form-item-label">{{ t('省/州') }}</div>
              <div class="form-item-value">{{ detail.recipient?.province }}</div>
            </div>
          </div>

          <div class="col-12 col-md-4">
            <div class="form-item">
              <div class="form-item-label">{{ t('市/府') }}</div>
              <div class="form-item-value">{{ detail.recipient?.city }}</div>
            </div>
          </div>

          <div class="col-12 col-md-4">
            <div class="form-item">
              <div class="form-item-label">{{ t('区/县') }}</div>
              <div class="form-item-value">{{ detail.recipient?.district || '--' }}</div>
            </div>
          </div>

          <!-- 第四行 -->
          <div class="col-12">
            <div class="form-item">
              <div class="form-item-label">{{ t('地址1') }}</div>
              <div class="form-item-value">{{ detail.recipient?.address1 }}</div>
            </div>
          </div>

          <div class="col-12">
            <div class="form-item">
              <div class="form-item-label">{{ t('地址2') }}</div>
              <div class="form-item-value">{{ detail.recipient?.address2 || '--' }}</div>
            </div>
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <!-- 商品信息区域 -->
      <q-card-section>
        <div class="text-h6 q-mb-md">{{ t('商品信息') }}</div>

        <q-table
          flat
          bordered
          :rows="detail.packages?.[0]?.items || []"
          :columns="[
            {
              name: 'skuInfo',
              label: t('商品信息'),
              field: row => row.sku,
              align: 'left',
              style: 'width: 40%'
            },
            {
              name: 'spec',
              label: t('实际规格'),
              field: row => `${row.sku_size_length || 0}*${row.sku_size_width || 0}*${row.sku_size_height || 0} cm\n${row.sku_weight || 0} g`,
              align: 'center',
              style: 'width: 20%'
            },
            {
              name: 'quantity',
              label: t('数量'),
              field: 'quantity',
              align: 'right',
            },
            {
              name: 'unit_price',
              label: t('单价'),
              field: 'unit_price',
              align: 'right',
            }
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
            <div class="full-width row flex-center q-my-lg">
              <span class="text-grey">{{ t('暂无商品') }}</span>
            </div>
          </template>

          <template v-slot:body-cell-skuInfo="props">
            <q-td :props="props">
              <div class="row no-wrap items-center">
                <div class="q-mr-sm">
                  <img 
                    :src="props.row?.sku_image" 
                    style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;"
                  />
                </div>
                <div class="ellipsis">
                  <div>{{ t('SKU编号') }}: {{ props.row?.sku || '-' }}</div>
                  <div class="ellipsis">{{ props.row?.product_name || '-' }}</div>
                  <div>{{ t('规格') }}: {{ props.row?.sku_name || '-' }}</div>
                </div>
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-spec="props">
            <q-td :props="props" class="text-center" style="white-space: pre-line">
              {{ `${props.row?.sku_size_length || 0}*${props.row?.sku_size_width || 0}*${props.row?.sku_size_height || 0} cm\n${props.row?.sku_weight || 0} g` }}
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>

    <!-- 底部操作按钮 -->
    <div class="fixed-bottom-bar">
      <div class="row justify-center q-pa-md">
        <q-btn outline :label="t('返回')" color="grey-7" @click="handleBack" />
      </div>
    </div>

    <!-- 底部占位,防止内容被固定栏遮挡 -->
    <div class="bottom-placeholder" />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { useQuasar } from "quasar";
import api from "@/api/index";

const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const $q = useQuasar();

// 详情数据
const detail = ref({});

// 获取平台文本
const getPlatformText = (platform) => {
  const platformMap = {
    dsfulfill: t('DSFulfill'),
    other: t('其他'),
    customer: t('客户')
  };
  return platformMap[platform] || platform;
};

// 获取面单类型文本
const getLabelTypeText = (type) => {
  const typeMap = {
    warehouse_label: t('发货仓库面单'),
    self_label: t('自有面单')
  };
  return typeMap[type] || type;
};

// 获取详情数据
const fetchDetail = async () => {
  try {
    const id = route.query.id;
    if (!id) {
      $q.notify({
        type: 'negative',
        message: t('参数错误')
      });
      return;
    }

    const response = await api.getOutboundDetail(id);
    if (response.success) {
      detail.value = response.data;
    }
  } catch (error) {
    console.error("获取出库单详情失败:", error);
    $q.notify({
      type: 'negative',
      message: t('获取详情失败')
    });
  }
};

// 处理下载面单
const handleDownloadLabel = () => {
  if (detail.value.label_pdf) {
    window.open(detail.value.label_pdf, '_blank');
  }
};

// 处理返回
const handleBack = () => {
  router.back();
};

// 初始化
onMounted(() => {
  fetchDetail();
});
</script>

<style lang="scss" scoped>
.outbound-detail {
  .form-item {
    margin-bottom: 16px;

    .form-item-label {
      color: rgba(0, 0, 0, 0.6);
      font-size: 14px;
      margin-bottom: 4px;
    }

    .form-item-value {
      font-size: 14px;
      min-height: 24px;
      padding: 4px 0;
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
}
</style> 