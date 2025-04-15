<template>
  <div class="warehouse-detail">
    <!-- 标题 -->
    <div class="text-h5 q-mb-md">入库单详情</div>

    <!-- 主卡片 -->
    <q-card class="warehouse-card">
      <!-- 基本信息区域 -->
      <q-card-section>
        <div class="text-h6 q-mb-lg">基本信息</div>
        <div class="row q-col-gutter-md">
          <!-- 第一行 -->
          <div class="col-12 col-md-3">
            <div class="form-item">
              <div class="form-item-label">入库单号</div>
              <div class="form-item-content">{{ detail.system_order_number }}</div>
            </div>
          </div>

          <div class="col-12 col-md-3">
            <div class="form-item">
              <div class="form-item-label">自定义单号</div>
              <div class="form-item-content">{{ detail.custom_order_number || '--' }}</div>
            </div>
          </div>

          <div class="col-12 col-md-3">
            <div class="form-item">
              <div class="form-item-label">运单号</div>
              <div class="form-item-content">{{ detail.tracking_number || '--' }}</div>
            </div>
          </div>

          <div class="col-12 col-md-3">
            <div class="form-item">
              <div class="form-item-label">到仓方式</div>
              <div class="form-item-content">{{ detail.arrival_method === 'express_parcel' ? '快递包裹' : '按箱' }}</div>
            </div>
          </div>

          <!-- 第二行 -->
          <div class="col-12 col-md-3">
            <div class="form-item">
              <div class="form-item-label">预计到达日期</div>
              <div class="form-item-content">{{ formatDate(detail.estimated_arrival_date) }}</div>
            </div>
          </div>

          <div class="col-12 col-md-3">
            <div class="form-item">
              <div class="form-item-label">创建时间</div>
              <div class="form-item-content">{{ detail.created_at }}</div>
            </div>
          </div>

          <div class="col-12 col-md-3">
            <div class="form-item">
              <div class="form-item-label">状态</div>
              <div class="form-item-content">
                <q-chip
                  :color="getStatusColor(detail.status)"
                  text-color="white"
                  dense
                  class="status-chip"
                >
                  {{ getStatusText(detail.status) }}
                </q-chip>
              </div>
            </div>
          </div>

          <div class="col-12 col-md-3">
            <div class="form-item">
              <div class="form-item-label">到仓时间</div>
              <div class="form-item-content">{{ detail.received_at || '--' }}</div>
            </div>
          </div>
        </div>
      </q-card-section>

      <!-- 分割线 -->
      <q-separator />

      <!-- 商品装箱区域 -->
      <q-card-section>
        <div class="text-h6 q-mb-lg">商品信息</div>

        <!-- 快递包裹模式 -->
        <div v-if="detail.arrival_method === 'express_parcel'" class="express-mode">
          <q-table
            :rows="flattenedItems"
            :columns="expressColumns"
            row-key="id"
            flat
            bordered
            hide-pagination
            :pagination="tablePagination"
          >
            <template v-slot:header="props">
              <q-tr :props="props">
                <q-th v-for="col in props.cols" :key="col.name" :props="props">
                  {{ col.label }}
                </q-th>
              </q-tr>
            </template>

            <template v-slot:body="props">
              <q-tr :props="props">
                <q-td>{{ props.rowIndex + 1 }}</q-td>
                <q-td>{{ props.row.product_spec_sku }}</q-td>
                <q-td>{{ props.row.product_name }}</q-td>
                <q-td>{{ props.row.product_spec_name }}</q-td>
                <q-td class="text-center">{{ props.row.quantity }}</q-td>
                <q-td class="text-center">{{ props.row.received_quantity }}</q-td>
                <q-td class="text-center">{{ props.row.defective_quantity }}</q-td>
                <q-td class="text-center">
                  <q-chip
                    :color="getReceiveStatusColor(props.row.receive_status)"
                    text-color="white"
                    dense
                  >
                    {{ getReceiveStatusText(props.row.receive_status) }}
                  </q-chip>
                </q-td>
              </q-tr>
            </template>
          </q-table>
        </div>

        <!-- 按箱模式 -->
        <div v-else class="box-mode">
          <div v-for="(box) in detail.boxes" :key="box.id" class="box-item q-mb-lg">
            <div class="box-header row items-center q-mb-md">
              <div class="text-subtitle1 text-weight-medium">箱子 {{ box.box_number }}</div>
              <q-space />
              <div class="box-info row items-center q-gutter-x-md">
                <!-- <div>箱数: {{ box.box_quantity }}</div> -->
                <div>尺寸: {{ box.size_length }}×{{ box.size_width }}×{{ box.size_height }}cm</div>
                <div>重量: {{ box.weight }}kg</div>
              </div>
            </div>

            <q-table
              :rows="box.items"
              :columns="boxItemColumns"
              row-key="id"
              flat
              bordered
              hide-pagination
              dense
            >
              <template v-slot:header="props">
                <q-tr :props="props">
                  <q-th v-for="col in props.cols" :key="col.name" :props="props">
                    {{ col.label }}
                  </q-th>
                </q-tr>
              </template>

              <template v-slot:body="props">
                <q-tr :props="props">
                  <q-td>{{ props.rowIndex + 1 }}</q-td>
                  <q-td>{{ props.row.product_spec_sku }}</q-td>
                  <q-td>{{ props.row.product_name }}</q-td>
                  <q-td>{{ props.row.product_spec_name }}</q-td>
                  <q-td class="text-center">{{ props.row.quantity }}</q-td>
                  <q-td class="text-center">{{ props.row.received_quantity }}</q-td>
                  <q-td class="text-center">{{ props.row.defective_quantity }}</q-td>
                  <q-td class="text-center">
                    <q-chip
                      :color="getReceiveStatusColor(props.row.receive_status)"
                      text-color="white"
                      dense
                    >
                      {{ getReceiveStatusText(props.row.receive_status) }}
                    </q-chip>
                  </q-td>
                </q-tr>
              </template>
            </q-table>

            <div v-if="box.box_remark" class="box-remark q-mt-sm">
              备注: {{ box.box_remark }}
            </div>
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- 底部操作按钮 -->
    <div class="row justify-center q-mt-lg q-gutter-sm">
      <q-btn outline label="返回" color="grey-7" @click="goBack" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { date } from 'quasar';
import api from '@/api/index';
import { useI18n } from "vue-i18n";
const { t } = useI18n();

const route = useRoute();
const router = useRouter();

// 详情数据
const detail = ref({
  id: null,
  system_order_number: '',
  custom_order_number: '',
  tracking_number: '',
  estimated_arrival_date: '',
  arrival_method: '',
  total_box_qty: null,
  status: '',
  shelf_status: null,
  receive_status: null,
  details: [],
  created_at: '',
  updated_at: '',
  received_at: null
});

// 快递包裹模式列定义
const expressColumns = [
  { name: 'index', label: '#', field: 'index', align: 'center', style: 'width: 80px' },
  { name: 'sku', label: 'SKU', field: 'product_spec_sku', align: 'left' },
  { name: 'product_name', label: '商品名称', field: 'product_name', align: 'left' },
  { name: 'spec_name', label: '规格', field: 'product_spec_name', align: 'left' },
  { name: 'quantity', label: '数量', field: 'quantity', align: 'center' },
  { name: 'received_quantity', label: '已收货', field: 'received_quantity', align: 'center' },
  { name: 'defective_quantity', label: '不良品', field: 'defective_quantity', align: 'center' },
  { name: 'receive_status', label: '收货状态', field: 'receive_status', align: 'center' }
];

// 按箱模式商品列定义
const boxItemColumns = [
  { name: 'index', label: '#', field: 'index', align: 'center', style: 'width: 80px' },
  { name: 'sku', label: 'SKU', field: 'product_spec_sku', align: 'left' },
  { name: 'product_name', label: '商品名称', field: 'product_name', align: 'left' },
  { name: 'spec_name', label: '规格', field: 'product_spec_name', align: 'left' },
  { name: 'quantity', label: '数量', field: 'quantity', align: 'center' },
  { name: 'received_quantity', label: '已收货', field: 'received_quantity', align: 'center' },
  { name: 'defective_quantity', label: '不良品', field: 'defective_quantity', align: 'center' },
  { name: 'receive_status', label: '收货状态', field: 'receive_status', align: 'center' }
];

// 快递包裹模式下的扁平化商品列表
const flattenedItems = computed(() => {
  if (detail.value.arrival_method !== 'express_parcel') return [];
  return detail.value.boxes.reduce((acc, box) => {
    return acc.concat(box.items);
  }, []);
});

// 获取入库单详情
const fetchDetail = async () => {
  try {
    const response = await api.getInboundDetailByOrder(route.params.id);
    if (response.success) {
      detail.value = response.data;
    }
  } catch (error) {
    console.error('获取入库单详情失败:', error);
  }
};

// 格式化日期
const formatDate = (dateStr) => {
  if (!dateStr) return '--';
  return date.formatDate(dateStr, 'YYYY-MM-DD');
};
// 表格分页配置
const tablePagination = ref({
  sortBy: "",
  descending: false,
  page: 1,
  rowsPerPage: 0, // 设置为0以禁用表格内置分页
});
// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    draft: t('草稿'),
    reported: t('已预报'),
    in_transit: t('运输中'),
    pending_inbound: t('待入库'),
    inbound_processing: t('入库中'),
    shelved: t('已完成')
  };
  return statusMap[status] || status;
};

// 获取状态颜色
const getStatusColor = (status) => {
  const colorMap = {
    draft: 'grey',
    reported: 'blue',
    shipping: 'orange',
    warehousing: 'purple',
    completed: 'positive',
    cancelled: 'negative'
  };
  return colorMap[status] || 'grey';
};

// 获取收货状态文本
const getReceiveStatusText = (status) => {
  const statusMap = {
    pending: '待收货',
    partially_received: '部分收货',
    fully_received: '已收货',
    abnormal: '异常'
  };
  return statusMap[status] || '待收货';
};

// 获取收货状态颜色
const getReceiveStatusColor = (status) => {
  const colorMap = {
    pending: 'grey',
    partial: 'orange',
    completed: 'positive',
    abnormal: 'negative'
  };
  return colorMap[status] || 'grey';
};

// 返回列表页
const goBack = () => {
  router.push('/storage/warehousewarrant');
};

// 初始化
onMounted(() => {
  fetchDetail();
});
</script>

<style lang="scss" scoped>
.warehouse-detail {
  .warehouse-card {
    background-color: white;
    border-radius: 8px;
  }

  .form-item {
    margin-bottom: 1.5rem;

    .form-item-label {
      color: rgba(0, 0, 0, 0.6);
      font-size: 0.875rem;
      margin-bottom: 0.5rem;
    }

    .form-item-content {
      font-size: 1rem;
    }
  }

  .box-mode {
    .box-item {
      border: 1px solid rgba(0, 0, 0, 0.12);
      border-radius: 8px;
      padding: 16px;

      .box-header {
        padding: 0 8px;
      }

      .box-info {
        color: rgba(0, 0, 0, 0.6);
        font-size: 0.875rem;
      }

      .box-remark {
        color: rgba(0, 0, 0, 0.6);
        font-size: 0.875rem;
        padding: 0 8px;
      }
    }
  }

  .status-chip {
    font-size: 0.75rem;
    height: 24px;
  }

  // 表格样式
  .q-table {
    thead tr th {
      font-weight: 500;
      background-color: #f5f5f5;
    }

    td {
      height: 48px;
    }
  }
}
</style> 