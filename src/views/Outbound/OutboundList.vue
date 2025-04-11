<template>
  <div class="outbound-list">
    <!-- 状态选项卡和筛选区域 -->
    <div class="outbound-search">
      <!-- 状态选项卡 -->
      <div class="q-mb-md">
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
      <div class="row items-center">
        <!-- 时间筛选模块 -->
        <div class="row items-center no-wrap time-group">
          <div class="col-3">
            <q-select
              outlined
              dense
              v-model="filters.date_type"
              :options="dateTypeOptions"
              emit-value
              map-options
              option-value="value"
              option-label="label"
              class="date-type-select"
            />
          </div>
          <div class="col date-range">
            <div class="row no-wrap">
              <q-input
                outlined
                dense
                v-model="filters.start_date"
                :label="t('开始时间')"
                clearable
                class="date-input start-date"
                @click="() => {}"
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy
                      cover
                      transition-show="scale"
                      transition-hide="scale"
                    >
                      <q-date v-model="filters.start_date" mask="YYYY-MM-DD" />
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
              <div class="date-separator">To</div>
              <q-input
                outlined
                dense
                v-model="filters.end_date"
                :label="t('结束时间')"
                clearable
                class="date-input end-date"
                @click="() => {}"
              >
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy
                      cover
                      transition-show="scale"
                      transition-hide="scale"
                    >
                      <q-date v-model="filters.end_date" mask="YYYY-MM-DD" />
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
          </div>
        </div>

        <!-- 关键词搜索模块 -->
        <div class="row items-center no-wrap search-group q-ml-md">
          <q-select
            outlined
            dense
            v-model="filters.search_type"
            :options="searchTypeOptions"
            emit-value
            map-options
            option-value="value"
            option-label="label"
            class="search-type-select"
          />
          <q-input
            outlined
            dense
            v-model="filters.keywords"
            :placeholder="t('批量搜索用逗号隔开')"
            class="keywords-input"
          />
          <q-select
            outlined
            dense
            v-model="filters.search_mode"
            :options="searchModeOptions"
            emit-value
            map-options
            option-value="value"
            option-label="label"
            class="search-mode-select"
          />
        </div>

        <div class="q-ml-md">
          <q-btn color="primary" :label="t('搜索')" @click="handleSearch" />
        </div>
      </div>
    </div>

    <!-- 操作按钮和表格容器 -->
    <div class="outbound-container">
      <div class="row justify-end q-mb-md">
        <q-btn
          color="primary"
          :label="t('新建')"
          icon="add"
          @click="handleCreate"
        />
      </div>

      <!-- 数据表格 -->
      <div class="bg-white rounded-borders">
        <q-table
          :rows="tableData"
          :columns="columns"
          row-key="id"
          flat
          bordered
          :rows-per-page-options="[10, 20, 50]"
          v-model:pagination="tablePagination"
          hide-pagination
          :loading="loading"
          selection="multiple"
          v-model:selected="selected"
        >
          <template v-slot:header="props">
            <q-tr :props="props">
              <q-th auto-width class="text-left" style="padding-left: 16px; width: 50px;">
                <q-checkbox v-model="props.selected" />
              </q-th>
              <q-th class="text-left" style="padding-left: 16px;">订单信息</q-th>
              <q-th class="text-left">收件人&地区</q-th>
              <q-th class="text-left">运单号</q-th>
              <q-th class="text-left">平台</q-th>
              <q-th class="text-left">时间</q-th>
              <q-th class="text-center">状态</q-th>
              <q-th class="text-center">操作</q-th>
            </q-tr>
          </template>

          <template v-slot:body="props">
            <!-- 订单头部信息 -->
            <q-tr :props="props" class="order-header">
              <q-td auto-width style="padding-left: 16px; width: 50px;">
                <q-checkbox v-model="props.selected" />
              </q-td>
              <q-td colspan="8" class="order-info q-pa-none">
                <div class="row items-center justify-between" style="padding: 8px">
                  <div class="order-basic-info">
                    <span class="q-mr-md">订单号：{{ props.row.order_number }}</span>
                    <span class="q-mr-md">包裹号：{{ props.row.packages?.[0]?.package_number || '--' }}</span>
                  </div>
                  <div>OMS创建</div>
                </div>
              </q-td>
            </q-tr>

            <!-- 订单详细信息 -->
            <q-tr :props="props" class="order-detail">
              <q-td auto-width style="width: 50px;"></q-td>
              <q-td style="padding-left: 16px;">
                <div v-for="(item, index) in props.row.packages?.[0]?.items || []" :key="index" class="sku-item">
                  {{ item.sku }} <span class="sku-qty">x{{ item.quantity }}</span>
                </div>
              </q-td>
              <q-td>
                <div class="recipient-info">
                  <div class="text-weight-medium">{{ props.row.recipient?.fullname }}</div>
                  <div class="text-grey-7 q-mt-xs">{{ props.row.recipient?.phone }}</div>
                  <div class="text-grey-7 text-caption">
                    {{ [
                      props.row.recipient?.country_code,
                      props.row.recipient?.province,
                      props.row.recipient?.city,
                      props.row.recipient?.district,
                      props.row.recipient?.address1,
                      props.row.recipient?.address2
                    ].filter(Boolean).join(', ') }}
                  </div>
                </div>
              </q-td>
              <q-td>
                <div>{{ props.row.packages?.[0]?.tracking_number || '--' }}</div>
              </q-td>
              <q-td>{{ props.row.platform }}</q-td>
              <q-td>
                <div>创建：{{ props.row.created_at }}</div>
              </q-td>
              <q-td class="text-center">{{ t(statusMap[props.row.status]) }}</q-td>
              <q-td class="text-center">
                <div class="row q-gutter-xs justify-center">
                  <q-btn
                    flat
                    round
                    color="grey-8"
                    icon="visibility"
                    size="sm"
                    @click="handleView(props.row)"
                  >
                    <q-tooltip>{{ t("查看") }}</q-tooltip>
                  </q-btn>
                  <q-btn flat round color="grey-8" icon="more_vert" size="sm">
                    <q-menu>
                      <q-list style="min-width: 100px">
                        <q-item
                          clickable
                          v-close-popup
                          v-if="props.row.status === 'draft'"
                          @click="handleSubmitOutbound(props.row)"
                        >
                          <q-item-section>{{ t("提交订单") }}</q-item-section>
                        </q-item>
                        <q-item
                          clickable
                          v-close-popup
                          v-if="props.row.status === 'draft'"
                          @click="handleDelete(props.row)"
                        >
                          <q-item-section>{{ t("删除订单") }}</q-item-section>
                        </q-item>
                        <q-item
                          clickable
                          v-close-popup
                          v-if="props.row.status === 'pending_shipment'"
                          @click="handleApplyHold(props.row)"
                        >
                          <q-item-section>{{ t("申请截单") }}</q-item-section>
                        </q-item>
                        <q-item
                          clickable
                          v-close-popup
                          v-if="props.row.status === 'exception'"
                          @click="handleCancelHold(props.row)"
                        >
                          <q-item-section>{{ t("取消截单") }}</q-item-section>
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
import { ref, onMounted } from "vue";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import Pagination from "@/components/Pagination.vue";
import api from "@/api/index";

const $q = useQuasar();
const router = useRouter();
const { t } = useI18n();

// 标签页
const tab = ref("all");

// 筛选条件
const filters = ref({
  date_type: "created_at",
  start_date: "",
  end_date: "",
  search_type: "sku",
  keywords: "",
  search_mode: "exact",
});

// 日期类型选项
const dateTypeOptions = [
  { label: t("创建时间"), value: "created_at" },
  { label: t("出库时间"), value: "outbound_at" }
];

// 搜索类型选项
const searchTypeOptions = [
  { label: "SKU", value: "sku" },
  { label: t("商品名称"), value: "product_name" },
  { label: t("订单号"), value: "order_number" },
  { label: t("快递单号"), value: "tracking_number" },
];

// 搜索模式选项
const searchModeOptions = [
  { label: t("精确搜索"), value: "exact" },
  { label: t("前缀搜索"), value: "prefix" },
  { label: t("模糊搜索"), value: "fuzzy" },
];

// 在 script 部分添加状态映射
const statusMap = {
  draft: '草稿',
  pending_shipment: '待出库',
  exception: '异常',
  shipped: '已发货',
  cancelled: '已取消'
};

// 表格数据
const columns = [
  {
    name: "selection",
    label: "",
    field: "selection",
    align: "center",
  },
  {
    name: "orderInfo",
    label: t("订单信息"),
    field: row => row,
    align: "left",
  },
  {
    name: "packageInfo",
    label: t("发货仓库"),
    field: row => row,
    align: "left",
  },
  {
    name: "receiverInfo",
    label: t("收件人&地区"),
    field: row => row,
    align: "left",
  },
  {
    name: "logisticsInfo",
    label: t("运单号"),
    field: row => row,
    align: "left",
  },
  {
    name: "platform",
    label: t("平台"),
    field: "platform",
    align: "left",
  },
  {
    name: "time",
    label: t("时间"),
    field: row => row,
    align: "left",
  },
  {
    name: "status",
    label: t("状态"),
    field: "status",
    align: "center",
  },
  {
    name: "operations",
    label: t("操作"),
    field: "operations",
    align: "center",
  },
];

// 修改模拟数据结构
const mockTableData = [
  {
    id: 1,
    order_number: "1231",
    package_number: "PN3HB00042",
    warehouse: "USC",  // 修改为订单级别的仓库信息
    skus: [
      { sku: "C-001", qty: 1 },
      { sku: "C-002", qty: 1 },
      { sku: "C-003", qty: 1 }
    ],
    logistics_type: "线下物流",
    logistics_line: "美国专线",
    tracking_number: "--",
    platform: "amazon",
    created_at: "2025-04-10 00:34",
    status: "pending_shipment"
  },
  {
    id: 2,
    order_number: "12312",
    package_number: "PN3HB00041",
    warehouse: "USC",
    skus: [
      { sku: "C-001", qty: 2 }
    ],
    logistics_type: "线下物流",
    logistics_line: "美国专线",
    tracking_number: "--",
    platform: "amazon",
    created_at: "2025-04-09 23:30",
    status: "pending_shipment"
  },
  {
    id: 3,
    order_number: "121",
    package_number: "PN3HB00040",
    warehouse: "USC",
    skus: [
      { sku: "A-001", qty: 4 }
    ],
    logistics_type: "线下物流",
    logistics_line: "美国专线",
    tracking_number: "--",
    platform: "amazon",
    created_at: "2025-04-09 23:29",
    status: "pending_shipment"
  }
];

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
  sortBy: "",
  descending: false,
  page: 1,
  rowsPerPage: 0,
});

// 选中的行
const selected = ref([]);

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
      status: tab.value === "all" ? "" : tab.value,
    };

    const response = await api.getOutboundList(params);

    if (response.success) {
      tableData.value = response.data.items;
      pagination.value.total = response.data.meta.total;
      pagination.value.maxPage = response.data.meta.last_page;
    }
  } catch (error) {
    console.error("获取出库单列表失败:", error);
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
        message: t('提交成功')
      });
      fetchOutboundList();
    }
  } catch (error) {
    console.error("提交出库单失败:", error);
    $q.notify({
      type: 'negative',
      message: t('提交失败')
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
    path: "/outbound/create",
    query: { id: row.id },
  });
};

// 处理删除
const handleDelete = (row) => {
  $q.dialog({
    title: t("确认删除"),
    message: t("确定要删除该出库单吗？"),
    cancel: {
      label: t("取消"),
      flat: true,
      color: "grey-7",
    },
    ok: {
      label: t("确定"),
      flat: true,
      color: "primary",
    },
    persistent: true,
  }).onOk(async () => {
    try {
      const response = await api.delOutbound(row.id);
      if (response.success) {
        $q.notify({
          type: 'positive',
          message: t('删除成功')
        });
        fetchOutboundList();
      }
    } catch (error) {
      console.error("删除失败:", error);
      $q.notify({
        type: 'negative',
        message: t('删除失败')
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
        message: t('申请截单成功')
      });
      fetchOutboundList();
    }
  } catch (error) {
    console.error("申请截单失败:", error);
    $q.notify({
      type: 'negative',
      message: t('申请截单失败')
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
        message: t('取消截单成功')
      });
      fetchOutboundList();
    }
  } catch (error) {
    console.error("取消截单失败:", error);
    $q.notify({
      type: 'negative',
      message: t('取消截单失败')
    });
  }
};

// 初始化
onMounted(() => {
  fetchOutboundList();
});
</script>

<style lang="scss" scoped>
.outbound-list {
  .outbound-search {
    background-color: white;
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 16px;

    .q-tabs {
      margin: -16px -16px 16px -16px;
      padding: 0;
    }

    .time-group,
    .search-group {
      :deep(.q-field__control) {
        border: 1px solid rgba(0, 0, 0, 0.12) !important;
        height: 40px;
      }

      :deep(.q-field--outlined .q-field__control:before) {
        border: none;
      }

      :deep(.q-field--outlined .q-field__control:after) {
        border: none;
      }
    }

    // 日期选择器组样式
    .date-type-select {
      :deep(.q-field__control) {
        border-radius: 4px 0 0 4px !important;
        border-right: none !important;
      }
    }

    .date-range {
      .row {
        margin: 0;
      }

      .date-input {
        :deep(.q-field__control) {
          border-radius: 0 !important;
        }
      }

      .start-date {
        :deep(.q-field__control) {
          border-right: none !important;
        }
      }

      .end-date {
        :deep(.q-field__control) {
          border-left: none !important;
          border-radius: 0 4px 4px 0 !important;
        }
      }

      .date-separator {
        padding: 0 4px;
        display: flex;
        align-items: center;
        background: #fff;
        border-top: 1px solid rgba(0, 0, 0, 0.12);
        border-bottom: 1px solid rgba(0, 0, 0, 0.12);
      }
    }

    // 搜索组样式
    .search-group {
      .search-type-select {
        min-width: fit-content;
        :deep(.q-field__control) {
          border-radius: 4px 0 0 4px !important;
          border-right: none !important;
        }
      }

      .keywords-input {
        flex: 1;
        :deep(.q-field__control) {
          border-radius: 0 !important;
          border-right: none !important;
        }
      }

      .search-mode-select {
        min-width: fit-content;
        :deep(.q-field__control) {
          border-radius: 0 4px 4px 0 !important;
        }
      }
    }
  }

  .outbound-container {
    background-color: white;
    padding: 16px;
    border-radius: 8px;
  }

  .q-table th {
    font-weight: 500;
  }

  .q-table tbody td {
    height: 56px;
  }

  .q-table {
    .text-caption {
      font-size: 12px;
      line-height: 1.4;
    }

    .order-header {
      background-color: #f5f7fa;

      td {
        &:not(:first-child) {
          border-right: 1px solid rgba(0, 0, 0, 0.12);
        }

        &:last-child {
          border-right: none;
        }
      }

      .order-info {
        min-height: 40px;
      }

      .order-basic-info {
        font-size: 13px;
      }
    }

    .order-detail {
      td {
        &:not(:first-child) {
          border-right: 1px solid rgba(0, 0, 0, 0.12);
        }

        &:last-child {
          border-right: none;
        }
      }

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

    :deep(.q-table__top),
    :deep(.q-table__bottom) {
      padding: 0 16px;
    }

    thead tr th {
      height: 48px;
      padding: 0 8px;
    }

    tbody td {
      height: auto;
      padding: 8px;
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