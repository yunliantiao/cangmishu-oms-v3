<template>
  <div class="outbound-list">
    <!-- 添加隐藏的文件输入框 -->
    <input type="file" ref="fileInput" accept=".pdf" style="display: none" @change="onFileSelected" />

    <!-- 状态选项卡和筛选区域 -->
    <div class="search-bar">
      <!-- 状态选项卡 -->
      <div class="tabs-section q-mb-md">
        <q-tabs
          v-model="tab"
          dense
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          align="left"
          narrow-indicator
        >
          <q-tab name="all" :label="t('全部')" />
          <q-tab name="draft" :label="t('草稿')" />
          <q-tab name="pending_shipment" :label="t('待出库')" />
          <q-tab name="exception" :label="t('异常')" />
          <q-tab name="shipped" :label="t('已发货')" />
          <q-tab name="cancelled" :label="t('已取消')" />
        </q-tabs>
      </div>

      <!-- 搜索过滤区域 -->
      <div class="row items-center q-col-gutter-sm">
        <!-- 来源和平台筛选 -->
        <div class="row items-center no-wrap filter-group">
          <q-select
            outlined
            dense
            v-model="filters.source"
            :options="sourceOptions"
            emit-value
            map-options
            :label="t('来源')"
            class="q-mr-sm"
            style="min-width: 150px"
          />
          <q-select
            outlined
            dense
            v-model="filters.platform"
            :options="platformOptions"
            emit-value
            map-options
            :label="t('平台')"
            style="min-width: 150px"
          />
        </div>
        <!-- 时间筛选模块 -->
        <DatePickerNew
          v-model:date_type="filters.date_type"
          v-model:start_date="filters.start_date"
          v-model:end_date="filters.end_date"
          :dateList="dateTypeOptions"
        />
        <!-- 关键词搜索模块 -->
        <KeywordSearch
          v-model:search_mode="filters.search_mode"
          v-model:search_type="filters.search_type"
          v-model:search_value="filters.keywords"
          :searchTypeList="searchTypeOptions"
        />
        <div>
          <q-btn color="primary" class="filter-btn" :label="t('搜索')" @click="handleSearch" />
        </div>
      </div>
    </div>

    <!-- 操作按钮和表格容器 -->
    <div class="main-table">
      <div class="row q-py-md">
        <q-btn color="primary" :label="t('新建')" icon="add" flat class="q-mr-sm" @click="handleCreate" />
        <q-btn color="primary" class="q-mr-sm" :label="t('导入')" flat icon="file_upload" @click="handleImport" />
        <!-- <q-btn-dropdown color="primary" :label="t('导出')" icon="file_download">
          <q-list>
            <q-item clickable v-close-popup @click="handleExport('selected')">
              <q-item-section>
                <q-item-label>{{ t("按勾选导出") }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="handleExport('all')">
              <q-item-section>
                <q-item-label>{{ t("按筛选导出") }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown> -->
      </div>

      <!-- 导入弹窗 -->
      <import-dialog ref="importDialogRef" type="orders" @success="handleImportSuccess" />

      <!-- 数据表格 -->
      <div class="bg-white rounded-borders">
        <q-table
          :rows="tableData"
          :columns="columns"
          row-key="id"
          flat
          :rows-per-page-options="[10, 20, 50]"
          v-model:pagination="tablePagination"
          hide-pagination
          :loading="loading"
          selection="multiple"
          v-model:selected="selected"
        >
          <template v-slot:no-data="{ icon, filter }">
            <div class="full-width row flex-center text-grey-6 q-gutter-sm">
              <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
              <span>{{ t('暂无数据') }}</span>
            </div>
          </template>
          <template v-slot:header="props">
            <q-tr :props="props">
              <q-th auto-width class="text-left" style="padding-left: 16px; width: 50px">
                <q-checkbox v-model="props.selected" />
              </q-th>
              <q-th class="text-left" style="padding-left: 16px">{{ t('订单信息') }}</q-th>
              <q-th class="text-left">{{ t('收件人&地区') }}</q-th>
              <q-th class="text-left">{{ t('运单号') }}</q-th>
              <q-th class="text-left">{{ t('平台') }}</q-th>
              <q-th class="text-left">{{ t('时间') }}</q-th>
              <q-th class="text-center">{{ t('状态') }}</q-th>
              <q-th class="text-center">{{ t('操作') }}</q-th>
            </q-tr>
          </template>

          <template v-slot:body="props">
            <!-- 订单头部信息 -->
            <q-tr :props="props" class="order-header">
              <q-td auto-width style="padding-left: 16px; width: 50px">
                <q-checkbox v-model="props.selected" />
              </q-td>
              <q-td colspan="8" class="order-info q-pa-none">
                <div class="row items-center justify-between" style="padding: 8px">
                  <div class="order-basic-info">
                    <span class="q-mr-md hover-copy" @click="$copy(props.row.order_number)">
                      {{ t('订单号') }}：{{ props.row.order_number }}
                    </span>
                    <span class="q-mr-md hover-copy" @click="$copy(props.row.system_order_number)">
                      {{ t('包裹号') }}：{{ props.row.system_order_number || '--' }}
                    </span>
                  </div>
                  <div>{{ sourceMap[props.row.source] || props.row.source }}</div>
                </div>
              </q-td>
            </q-tr>

            <!-- 订单详细信息 -->
            <q-tr :props="props" class="order-detail">
              <q-td auto-width style="width: 50px"></q-td>
              <q-td style="padding-left: 16px">
                <div v-for="(item, index) in props.row.packages?.[0]?.items || []" :key="index" class="sku-item">
                  {{ item.sku }}
                  <span class="sku-qty">x{{ item.quantity }}</span>
                </div>
              </q-td>
              <q-td>
                <div class="recipient-info">
                  <div class="text-weight-medium">{{ props.row.recipient?.fullname }}</div>
                  <div class="text-grey-7 q-mt-xs">{{ props.row.recipient?.phone }}</div>
                  <div class="text-grey-7 text-caption">
                    {{
                      [
                        props.row.recipient?.country_code,
                        props.row.recipient?.province,
                        props.row.recipient?.city,
                        props.row.recipient?.district,
                        props.row.recipient?.address1,
                        props.row.recipient?.address2,
                      ]
                        .filter(Boolean)
                        .join(', ')
                    }}
                  </div>
                </div>
              </q-td>
              <q-td>
                <div>{{ props.row.packages?.[0]?.tracking_number || '--' }}</div>
              </q-td>
              <q-td>{{ props.row.platform }}</q-td>
              <q-td>
                <div>{{ t('创建') }}：{{ props.row.created_at }}</div>
              </q-td>
              <q-td class="text-center">
                {{ statusMap[props.row.status] ? t(statusMap[props.row.status]) : props.row.status }}
              </q-td>
              <q-td class="text-center">
                <div class="row q-gutter-xs justify-center">
                  <q-btn flat round color="grey-8" icon="visibility" size="sm" @click="handleView(props.row)">
                    <q-tooltip>{{ t('查看') }}</q-tooltip>
                  </q-btn>
                  <q-btn flat round color="grey-8" icon="more_vert" size="sm">
                    <q-menu>
                      <q-list style="min-width: 100px">
                        <q-item
                          clickable
                          v-close-popup
                          v-if="props.row.status === 'draft'"
                          @click="handleEdit(props.row)"
                        >
                          <q-item-section>{{ t('编辑') }}</q-item-section>
                        </q-item>
                        <q-item
                          clickable
                          v-close-popup
                          v-if="props.row.label_type === 'self_label' && !props.row.label_pdf"
                          @click="handleUploadPdf(props.row)"
                        >
                          <q-item-section>{{ t('上传面单') }}</q-item-section>
                        </q-item>
                        <q-item
                          clickable
                          v-close-popup
                          v-if="props.row.status === 'draft'"
                          @click="handleSubmitOutbound(props.row)"
                        >
                          <q-item-section>{{ t('提交订单') }}</q-item-section>
                        </q-item>
                        <q-item
                          clickable
                          v-close-popup
                          v-if="props.row.status === 'draft'"
                          @click="handleDelete(props.row)"
                        >
                          <q-item-section>{{ t('删除订单') }}</q-item-section>
                        </q-item>
                        <q-item
                          clickable
                          v-close-popup
                          v-if="props.row.status === 'pending_shipment'"
                          @click="handleRevert(props.row)"
                        >
                          <q-item-section>{{ t('撤回订单') }}</q-item-section>
                        </q-item>
                        <q-item
                          clickable
                          v-close-popup
                          v-if="props.row.is_allow_intercept && props.row.intercept_status === 'no_intercept'"
                          @click="handleApplyHold(props.row)"
                        >
                          <q-item-section>{{ t('申请截单') }}</q-item-section>
                        </q-item>
                        <q-item
                          clickable
                          v-close-popup
                          v-if="props.row.intercept_status === 'intercept_requested'"
                          @click="handleCancelHold(props.row)"
                        >
                          <q-item-section>{{ t('取消截单') }}</q-item-section>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-btn>
                </div>
              </q-td>
            </q-tr>
          </template>
        </q-table>

        <!-- 分页 -->
        <div class="row justify-end q-pa-md">
          <Pagination
            :total-count="pagination.total"
            v-model:page="pagination.page"
            :max-page="pagination.maxPage"
            v-model:rows-per-page="pagination.rowsPerPage"
            @page-change="handlePageChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import api from '@/api/index';
import DatePickerNew from '@/components/DatePickerNew/Index.vue';
import ImportDialog from '@/components/ImportDialog.vue';
import KeywordSearch from '@/components/KeywordSearch/Index.vue';
import Pagination from '@/components/Pagination.vue';
import { Loading, useQuasar } from 'quasar';
import { onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const $q = useQuasar();
const router = useRouter();
const { t } = useI18n();

// 标签页
const tab = ref('all');

// 筛选条件
const filters = ref({
  date_type: 'created_at',
  start_date: '',
  end_date: '',
  search_type: 'sku',
  keywords: '',
  search_mode: 'exact',
  source: '',
  platform: '',
});

// 日期类型选项
const dateTypeOptions = [
  { label: t('创建时间'), value: 'created_at' },
  { label: t('出库时间'), value: 'outbound_at' },
];

// 搜索类型选项
const searchTypeOptions = [
  { label: 'SKU', value: 'sku' },
  { label: t('商品名称'), value: 'product_name' },
  { label: t('订单号'), value: 'order_number' },
  { label: t('快递单号'), value: 'tracking_number' },
];

// 搜索模式选项
const searchModeOptions = [
  { label: t('精确搜索'), value: 'exact' },
  { label: t('前缀搜索'), value: 'prefix' },
  { label: t('模糊搜索'), value: 'fuzzy' },
];

// 来源选项
const sourceOptions = [
  { label: t('全部'), value: '' },
  { label: t('ERP推送'), value: 'erp_push' },
  { label: t('OMS创建'), value: 'oms_create' },
  { label: t('平台推送'), value: 'platform_push' },
];

// 平台选项
const platformOptions = [
  { label: t('全部'), value: '' },
  { label: t('客户平台'), value: 'customer' },
  { label: t('代发平台'), value: 'dsfulfill' },
  { label: t('其他平台'), value: 'other' },
];

// 在 script 部分添加状态映射
const statusMap = {
  draft: '草稿',
  pending_shipment: '待发货',
  shipped: '已发货',
  exception: '异常',
  cancelled: '已取消',
};

// 在 script setup 中添加 source 映射
const sourceMap = {
  erp_push: t('ERP推送'),
  oms_create: t('OMS创建'),
  platform_push: t('平台推送'),
};

// 表格数据
const columns = [
  {
    name: 'selection',
    label: '',
    field: 'selection',
    align: 'center',
  },
  {
    name: 'orderInfo',
    label: t('订单信息'),
    field: (row) => row,
    align: 'left',
  },
  {
    name: 'packageInfo',
    label: t('发货仓库'),
    field: (row) => row,
    align: 'left',
  },
  {
    name: 'receiverInfo',
    label: t('收件人&地区'),
    field: (row) => row,
    align: 'left',
  },
  {
    name: 'logisticsInfo',
    label: t('运单号'),
    field: (row) => row,
    align: 'left',
  },
  {
    name: 'platform',
    label: t('平台'),
    field: 'platform',
    align: 'left',
  },
  {
    name: 'time',
    label: t('时间'),
    field: (row) => row,
    align: 'left',
  },
  {
    name: 'status',
    label: t('状态'),
    field: 'status',
    align: 'center',
  },
  {
    name: 'operations',
    label: t('操作'),
    field: 'operations',
    align: 'center',
  },
];

// 修改模拟数据结构
const mockTableData = [];

// 使用模拟数据
const tableData = ref(mockTableData);

const loading = ref(false);

// 分页
const pagination = ref({
  page: 1,
  maxPage: 1,
  rowsPerPage: 10,
  total: 0,
});

// 表格分页配置
const tablePagination = ref({
  sortBy: '',
  descending: false,
  page: 1,
  rowsPerPage: 0,
});

// 选中的行
const selected = ref([]);

// 导入相关
const importDialogRef = ref(null);

// 在 script setup 部分添加:
const fileInput = ref(null);
const currentOrderId = ref(null);

// 获取出库单列表
const fetchOutboundList = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.value.page,
      per_page: pagination.value.rowsPerPage,
      date_type: filters.value.date_type,
      start_date: filters.value.start_date,
      end_date: filters.value.end_date,
      search_type: filters.value.search_type,
      keywords: filters.value.keywords,
      search_mode: filters.value.search_mode,
      // status: tab.value === "all" ? "" : [tab.value],
      order_status: tab.value === 'all' ? '' : tab.value,
      source: filters.value.source ? [filters.value.source] : undefined,
      platform: filters.value.platform ? [filters.value.platform] : undefined,
    };

    const response = await api.getOutboundList(params);

    if (response.success) {
      tableData.value = response.data.items;
      pagination.value.total = response.data.meta.total;
      pagination.value.maxPage = response.data.meta.last_page;
    }
  } catch (error) {
    console.error('获取出库单列表失败:', error);
  } finally {
    loading.value = false;
  }
};

// 处理搜索
const handleSearch = () => {
  pagination.value.page = 1;
  fetchOutboundList();
};

// 处理新建
const handleCreate = () => {
  router.push('/outbound/create');
};

// 处理分页变更
const handlePageChange = ({ page, rowsPerPage }) => {
  pagination.value.page = page;
  pagination.value.rowsPerPage = rowsPerPage;
  fetchOutboundList();
};

// 处理提交出库单
const handleSubmitOutbound = async (row) => {
  try {
    const response = await api.submitOutbound(row.id);
    if (response.success) {
      $q.notify({
        type: 'positive',
        message: t('提交成功'),
      });
      fetchOutboundList();
    }
  } catch (error) {
    console.error('提交出库单失败:', error);
    $q.notify({
      type: 'negative',
      message: t('提交失败'),
    });
  }
};

// 处理查看详情
const handleView = (row) => {
  router.push(`/outbound/detail?id=${row.id}`);
};

// 处理编辑
const handleEdit = (row) => {
  router.push({
    path: '/outbound/create',
    query: { id: row.id },
  });
};

// 处理删除
const handleDelete = (row) => {
  $q.dialog({
    title: t('确认删除'),
    message: t('确定要删除该出库单吗？'),
    cancel: {
      label: t('取消'),
      flat: true,
      color: 'grey-7',
    },
    ok: {
      label: t('确定'),
      flat: true,
      color: 'primary',
    },
    persistent: true,
  }).onOk(async () => {
    try {
      const response = await api.delOutbound(row.id);
      if (response.success) {
        $q.notify({
          type: 'positive',
          message: t('删除成功'),
        });
        fetchOutboundList();
      }
    } catch (error) {
      console.error('删除失败:', error);
      $q.notify({
        type: 'negative',
        message: t('删除失败'),
      });
    }
  });
};

// 处理申请截单
const handleApplyHold = async (row) => {
  try {
    const response = await api.orderIntercept(row.id);
    if (response.success) {
      $q.notify({
        type: 'positive',
        message: t('申请截单成功'),
      });
      fetchOutboundList();
    }
  } catch (error) {
    console.error('申请截单失败:', error);
    $q.notify({
      type: 'negative',
      message: t('申请截单失败'),
    });
  }
};

// 处理取消截单
const handleCancelHold = async (row) => {
  try {
    const response = await api.orderCancelIntercept(row.id);
    if (response.success) {
      $q.notify({
        type: 'positive',
        message: t('取消截单成功'),
      });
      fetchOutboundList();
    }
  } catch (error) {
    console.error('取消截单失败:', error);
    $q.notify({
      type: 'negative',
      message: t('取消截单失败'),
    });
  }
};

// 处理撤回订单
const handleRevert = async (row) => {
  try {
    const response = await api.orderRevert(row.id);
    if (response.success) {
      $q.notify({
        type: 'positive',
        message: t('撤回成功'),
      });
      fetchOutboundList();
    }
  } catch (error) {
    console.error('撤回订单失败:', error);
    $q.notify({
      type: 'negative',
      message: t('撤回失败'),
    });
  }
};

// 处理导入按钮点击
const handleImport = () => {
  importDialogRef.value.open();
};

// 处理导入成功
const handleImportSuccess = () => {
  fetchOutboundList(); // 刷新列表
};

// 监听标签页变化
watch(tab, () => {
  pagination.value.page = 1; // 切换标签页时重置为第一页
  fetchOutboundList();
});

// 处理点击上传按钮
const handleUploadPdf = (row) => {
  currentOrderId.value = row.id;
  // 触发文件选择
  fileInput.value.click();
};

// 处理文件选择
const onFileSelected = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // 检查文件类型
  if (file.type !== 'application/pdf') {
    $q.notify({
      type: 'negative',
      message: t('请选择PDF文件'),
    });
    return;
  }

  try {
    // 显示上传中的loading
    Loading.show({
      message: t('正在上传...'),
    });

    // 创建 FormData 对象
    const formData = new FormData();
    formData.append('label', file);

    try {
      const response = await api.orderPdf(currentOrderId.value, formData);

      if (response.success) {
        $q.notify({
          type: 'positive',
          message: t('上传成功'),
        });
        // 刷新列表
        fetchOutboundList();
      }
    } catch (error) {
      console.error('上传失败:', error);
      $q.notify({
        type: 'negative',
        message: t('上传失败'),
      });
    } finally {
      Loading.hide();
    }
  } catch (error) {
    console.error('文件处理失败:', error);
    $q.notify({
      type: 'negative',
      message: t('文件处理失败，请重试'),
    });
    Loading.hide();
  }

  // 清空文件输入框，以便可以重复选择同一个文件
  event.target.value = '';
};

// 初始化
onMounted(() => {
  fetchOutboundList();
});
</script>

<style lang="scss" scoped>
.outbound-list {
  .tabs-section {
    display: flex;
    justify-content: flex-start;
    border-bottom: 1px solid #e6e6e6;
    .q-tabs {
      &__content {
        height: 40px;
      }
      &__tab {
        font-weight: 500;
        letter-spacing: 0.5px;
      }
      .q-tab {
        padding: 0;
        &:not(:last-child) {
          margin-right: 50px;
        }
      }
    }
  }

  .order-detail {
    .sku-item {
      margin-bottom: 4px;
      font-size: 13px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      &:last-child {
        margin-bottom: 0;
      }

      .sku-qty {
        color: #1976d2;
        font-weight: bold;
      }
    }
  }

  .recipient-info {
    max-width: 300px;

    .text-caption {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1.4;
    }
  }
}
</style>
