<template>
  <div class="warehouse-warrant">
    <!-- 状态选项卡和筛选区域 -->
    <div class="product-search">
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
          <q-tab name="reported" :label="t('已预报')" />
          <q-tab name="in_transit" :label="t('运输中')" />
          <q-tab name="pending_inbound" :label="t('待入库')" />
          <q-tab name="inbound_processing" :label="t('入库中')" />
          <q-tab name="shelved" :label="t('已完成')" />
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
    <div class="warehouse-container">
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
          :pagination="tablePagination"
          hide-pagination
          :loading="loading"
        >
          <template v-slot:no-data="{ icon, filter }">
            <div class="full-width row flex-center text-grey-6 q-gutter-sm">
              <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
              <span> {{ t('暂无数据') }} </span>
            </div>
          </template>
          <!-- 自定义SKU单元格 -->
          <template v-slot:body-cell-sku="props">
            <q-td :props="props">
              <div>
                {{ props.row.sku }}
              </div>
            </q-td>
          </template>

          <!-- 自定义到仓方式 -->
          <template v-slot:body-cell-shippingMethod="props">
            <q-td
              :props="props"
              :class="
                props.row.arrival_method === 'express_parcel'
                  ? 'text-primary'
                  : ''
              "
            >
              {{
                props.row.arrival_method === "express_parcel"
                  ? t("快递包裹")
                  : t("按箱")
              }}
            </q-td>
          </template>

          <!-- 自定义箱数 -->
          <template v-slot:body-cell-boxCount="props">
            <q-td :props="props">
              {{ props.row.total_box_qty || "--" }}
            </q-td>
          </template>

          <!-- 操作列 -->
          <template v-slot:body-cell-operations="props">
            <q-td :props="props">
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
                <q-btn flat round color="grey-8" icon="more_horiz" size="sm">
                  <q-menu>
                    <q-list style="min-width: 100px">
                      <q-item
                        v-if="props.row.arrival_method == 'box'"
                        clickable
                        v-close-popup
                        @click="handlePrintBoxLabel(props.row)"
                      >
                        <q-item-section>{{ t("打印箱唛") }}</q-item-section>
                      </q-item>
                      <q-item
                        clickable
                        v-close-popup
                        v-if="props.row.status === 'draft'"
                        @click="handleEdit(props.row)"
                      >
                        <q-item-section>{{ t("编辑") }}</q-item-section>
                      </q-item>
                      <q-item
                        clickable
                        v-close-popup
                        @click="handleEditTracking(props.row)"
                      >
                        <q-item-section>{{ t("编辑运单号") }}</q-item-section>
                      </q-item>
                      <q-item
                        clickable
                        v-close-popup
                        v-if="props.row.status === 'draft'"
                        @click="handleSubmitInbound(props.row)"
                      >
                        <q-item-section>{{ t("提交入库单") }}</q-item-section>
                      </q-item>
                      <q-item
                        clickable
                        v-close-popup
                        v-if="props.row.status === 'reported'"
                        @click="handleShipInbound(props.row)"
                      >
                        <q-item-section>{{ t("发货") }}</q-item-section>
                      </q-item>
                      <q-item
                        clickable
                        v-close-popup
                        v-if="props.row.status === 'draft'"
                        @click="handleDelete(props.row)"
                      >
                        <q-item-section>{{ t("删除") }}</q-item-section>
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-btn>
              </div>
            </q-td>
          </template>
        </q-table>

        <!-- 分页 -->
        <div class="row justify-end q-pa-md">
          <Pagination
            :total-count="pagination.total"
            v-model:page="pagination.page"
            v-model:rows-per-page="pagination.rowsPerPage"
            @page-change="handlePageChange"
          />
        </div>
      </div>
    </div>

    <!-- 打印箱唛弹窗 -->
    <q-dialog v-model="printDialogVisible" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center">
          <div class="text-h6">打印箱唛</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div class="q-gutter-y-md">
            <div class="row items-center">
              <span class="required col-3">打印范围</span>
              <div class="col row items-center no-wrap">
                <span>第</span>
                <q-input
                  v-model="printForm.start_box"
                  type="number"
                  class="q-mx-sm"
                  style="width: 60px"
                  dense
                  outlined
                />
                <span>~</span>
                <q-input
                  v-model="printForm.end_box"
                  type="number"
                  class="q-mx-sm"
                  style="width: 60px"
                  dense
                  outlined
                />
                <span>箱</span>
              </div>
            </div>

            <div class="row">
              <span class="required col-3">纸张大小</span>
              <div class="col">
                <div class="row items-center q-mb-sm">
                  <q-radio v-model="printForm.box_size" val="small" label="100*60" />
                </div>
                <div class="row items-center q-mb-sm">
                  <q-radio v-model="printForm.box_size" val="medium">
                    <template v-slot:default>
                      100*100 <span class="text-grey-6">(显示SKU信息)</span>
                    </template>
                  </q-radio>
                </div>
                <div class="row items-center">
                  <q-radio v-model="printForm.box_size" val="large">
                    <template v-slot:default>
                      100*150 <span class="text-grey-6">(显示SKU信息)</span>
                    </template>
                  </q-radio>
                </div>
              </div>
            </div>

            <div class="row">
              <span class="col-3">附加信息</span>
              <div class="col q-gutter-x-md">
                <q-checkbox v-model="printForm.additional_info" val="customer_fullname" label="客户姓名" />
                <q-checkbox v-model="printForm.additional_info" val="made_in_china" label="Made in China" />
                <q-checkbox v-model="printForm.additional_info" val="product_name" label="产品名称" />
                <q-checkbox v-model="printForm.additional_info" val="other" label="其他" />
              </div>
            </div>
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn :label="t('取消')" color="grey-7" flat v-close-popup />
          <q-btn
            :label="t('确定')"
            color="primary"
            flat
            @click="handlePrintConfirm"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- 编辑运单号弹窗 -->
    <q-dialog v-model="trackingDialogVisible">
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center">
          <div class="text-h6">{{ t('输入运单号') }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-input
            v-model="trackingNumber"
            outlined
            :label="t('运单号')"
            :rules="[val => !!val || t('运单号不能为空')]"
            class="q-mb-md"
          >
            <template v-slot:append>
              <span class="text-red">*</span>
            </template>
          </q-input>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn :label="t('取消')" color="grey-7" v-close-popup flat />
          <q-btn :label="t('确定')" color="primary" @click="handleTrackingConfirm" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
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
const dateTypeOptions = [{ label: t("创建时间"), value: "created_at" }];

// 搜索类型选项
const searchTypeOptions = [
  { label: "SKU", value: "sku" },
  { label: t("商品名称"), value: "product_name" },
  { label: t("自定义单号"), value: "custom_order_number" },
];

// 搜索模式选项
const searchModeOptions = [
  { label: t("精确搜索"), value: "exact" },
  { label: t("前缀搜索"), value: "prefix" },
  { label: t("模糊搜索"), value: "fuzzy" },
];
const statusMap = {
  draft: t('草稿'),
  reported: t('已预报'),
  in_transit: t('运输中'),
  pending_inbound: t('待入库'),
  inbound_processing: t('入库中'),
  shelved: t('已完成')
};

// 表格数据
const columns = [
  {
    name: "warehouseId",
    label: t("入库单号"),
    field: "system_order_number",
    align: "left",
  },
  {
    name: "customId",
    label: t("自定义单号"),
    field: "custom_order_number",
    align: "left",
  },
  {
    name: "trackingId",
    label: t("运单号"),
    field: "tracking_number",
    align: "left",
  },
  {
    name: "shippingMethod",
    label: t("到仓方式"),
    field: (row) =>
      row.arrival_method === "express_parcel" ? t("快递包裹") : t("按箱"),
    align: "center",
  },
  {
    name: "boxCount",
    label: t("箱数"),
    field: "total_box_qty",
    format: (val) => val || "--",
    align: "center",
  },
  {
    name: "status",
    label: t("状态"),
    field: "status",
    format: (val) => statusMap[val] || val,
    align: "center",
  },
  {
    name: "createTime",
    label: t("创建时间"),
    field: "created_at",
    align: "center",
  },
  {
    name: "arrivalTime",
    label: t("到仓时间"),
    field: "received_at",
    format: (val) => val || "--",
    align: "center",
  },
  {
    name: "operations",
    label: t("操作"),
    field: "operations",
    align: "center",
  },
];

const tableData = ref([]);
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
  rowsPerPage: 0, // 设置为0以禁用表格内置分页
});

// 打印相关的状态
const printDialogVisible = ref(false);
const currentInboundId = ref(null);
const printForm = ref({
  start_box: null,
  end_box: null,
  box_size: "small",
  additional_info: [],
});



// 监听弹窗关闭
watch(printDialogVisible, (newVal) => {
  if (!newVal) {
    // 重置表单数据
    printForm.value = {
      start_box: null,
      end_box: null,
      box_size: "small",
      additional_info: []
    };
    // 重置当前选中的入库单ID
    currentInboundId.value = null;
  }
});

// 监听标签页变化
watch(tab, () => {
  pagination.value.page = 1; // 重置页码到第一页
  fetchInboundList();
});

// 箱子大小选项
const boxSizeOptions = [
  { label: t("小"), value: "small" },
  { label: t("中"), value: "medium" },
  { label: t("大"), value: "large" },
];

// 附加信息选项
const additionalInfoOptions = [
  { label: t("客户全名"), value: "customer_fullname" },
  { label: t("中国制造"), value: "made_in_china" },
  { label: t("产品名称"), value: "product_name" },
  { label: t("其他"), value: "other" },
];

// 获取入库单列表
const fetchInboundList = async () => {
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
      inbound_status: tab.value === "all" ? "" : tab.value,
    };

    const response = await api.getInboundList(params);

    if (response.success) {
      tableData.value = response.data.items;
      pagination.value.total = response.data.meta.total;
      pagination.value.maxPage = response.data.meta.last_page;
    }
  } catch (error) {
    console.error("获取入库单列表失败:", error);
  } finally {
    loading.value = false;
  }
};

// 处理搜索
const handleSearch = () => {
  pagination.value.page = 1;
  fetchInboundList();
};

// 处理新建
const handleCreate = () => {
  router.push("/storage/createwarehouse");
};

// 处理分页变更
const handlePageChange = ({ page, rowsPerPage }) => {
  pagination.value.page = page;
  pagination.value.rowsPerPage = rowsPerPage;
  fetchInboundList();
};

// 处理提交入库单
const handleSubmitInbound = async (row) => {
  try {
    const response = await api.submitInbound(row.id);

    if (response.success) {
      // 刷新列表
      fetchInboundList();
    }
  } catch (error) {
    console.error("提交入库单失败:", error);
  }
};

// 处理发货
const handleShipInbound = async (row) => {
  // 检查运单号是否为空
  if (!row.tracking_number && row.arrival_method == 'express_parcel') {
    $q.notify({
      type: 'warning',
      message: t('当前到仓方式必须填写运单号')
    });
    return;
  }

  try {
    const response = await api.shipInbound(row.id);

    if (response.success) {
      // 刷新列表
      fetchInboundList();
    }
  } catch (error) {
    console.error("发货失败:", error);
  }
};

// 处理查看详情
const handleView = (row) => {
  router.push(`/storage/warehousewarrant/${row.id}`);
};

// 处理编辑
const handleEdit = (row) => {
  router.push({
    path: "/storage/createwarehouse",
    query: { id: row.id },
  });
};

// 处理删除
const handleDelete = (row) => {
  $q.dialog({
    title: t("确认删除"),
    message: t("确定要删除该入库单吗？"),
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
      const response = await api.delInbound(row.id);
      if (response.success) {
        fetchInboundList();
      }
    } catch (error) {
      console.error("删除失败:", error);
    }
  });
};

// 处理打印箱唛
const handlePrintBoxLabel = (row) => {
  currentInboundId.value = row.id;
  printDialogVisible.value = true;
};

// 处理打印确认
const handlePrintConfirm = async () => {
  try {
    const params = {
      start_box: parseInt(printForm.value.start_box),
      end_box: parseInt(printForm.value.end_box),
      box_size: printForm.value.box_size,
      additional_info: printForm.value.additional_info
    };

    // 设置responseType为blob
    const response = await api.inboundBoxLabel(currentInboundId.value, params, { responseType: 'blob' });
    
    // 检查响应类型
    if (response instanceof Blob) {
      const url = window.URL.createObjectURL(response);
      window.open(url, '_blank');
      window.URL.revokeObjectURL(url);
      printDialogVisible.value = false;
      $q.notify({
        message: t('打印箱唛生成成功'),
        color: 'positive'
      });
    } else {
      throw new Error('Invalid response type');
    }
  } catch (error) {
    console.error('打印箱唛失败:', error);
    $q.notify({
      message: t('打印箱唛生成失败'),
      color: 'negative'
    });
  }
};

// 运单号编辑相关
const trackingDialogVisible = ref(false);
const trackingNumber = ref('');
const currentRow = ref(null);
// 处理编辑运单号
const handleEditTracking = (row) => {
  currentRow.value = row;
  trackingNumber.value = row.tracking_number || '';
  trackingDialogVisible.value = true;
};

// 处理运单号确认
const handleTrackingConfirm = async () => {
  if (!trackingNumber.value) {
    $q.notify({
      type: 'warning',
      message: t('请输入运单号')
    });
    return;
  }

  try {
    const response = await api.updateInboundTracking(currentRow.value.id, {
      tracking_number: trackingNumber.value
    });

    if (response.success) {
      trackingDialogVisible.value = false;
      $q.notify({
        type: 'positive',
        message: t('运单号更新成功')
      });
      fetchInboundList(); // 刷新列表
    }
  } catch (error) {
    console.error('更新运单号失败:', error);
    $q.notify({
      type: 'negative',
      message: t('运单号更新失败')
    });
  }
};

// 监听弹窗关闭
watch(trackingDialogVisible, (newVal) => {
  if (!newVal) {
    // 重置数据
    trackingNumber.value = '';
    currentRow.value = null;
  }
});

// 初始化
onMounted(() => {
  fetchInboundList();
});
</script>

<style lang="scss" scoped>
.warehouse-warrant {
  .product-search {
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

  .warehouse-container {
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
}

.required::after {
  content: '*';
  color: red;
  margin-left: 4px;
}
</style>
