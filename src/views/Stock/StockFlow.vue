<template>
  <div class="stock-flow">
    <!-- 筛选模块 -->
    <div class="product-search bg-white">
      <!-- 搜索过滤区域 -->
      <div class="row items-center">
        <!-- 时间筛选模块 -->
        <div class="row items-center no-wrap time-group">
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
              <div class="date-separator flex items-center">To</div>
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
    <!-- 表格 -->
    <div class="bg-white rounded-borders q-pa-md">
          <!-- 导出按钮 -->
    <div class="text-right q-mb-md">
      <q-btn color="primary" :label="t('导出')" icon="file_download" @click="handleExport" />
    </div>
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
      >
        <!-- 商品信息列自定义 -->
        <template v-slot:body-cell-product="props">
          <q-td :props="props">
            <div>{{ props.row.sku }}</div>
            <div class="text-grey-7">{{ props.row.product_name }}</div>
          </q-td>
        </template>

        <!-- 变化数量列自定义 -->
        <template v-slot:body-cell-change_qty="props">
          <q-td :props="props">
            <span :class="props.row.stock > 0 ? 'text-green' : 'text-red'">
              {{ props.row.stock > 0 ? '+' : '' }}{{ props.row.stock }}
            </span>
          </q-td>
        </template>

        <!-- 关联单据号列自定义 -->
        <template v-slot:body-cell-reference="props">
          <q-td :props="props">
            <template v-if="props.row.type === '销售出库'">
              <div class="text-grey-7">{{ t('ERP包裹号') }}:</div>
              <div>{{ props.row.reference_number || '--' }}</div>
              <div class="text-grey-7">{{ t('订单号') }}: {{ props.row.order_no || '--' }}</div>
              <div class="text-grey-7">{{ t('运单号') }}: {{ props.row.tracking_no || '--' }}</div>
            </template>
            <template v-else>
              <div class="text-grey-7">{{ t('调整单号') }}:</div>
              <div>{{ props.row.reference_number || '--' }}</div>
              <div class="text-grey-7">{{ t('入库批次号') }}: {{ props.row.inbound_batch_number || '--' }}</div>
              <div class="text-grey-7">{{ t('库位') }}: {{ props.row.warehouse_location_code || '--' }}</div>
            </template>
          </q-td>
        </template>

        <!-- 分页 -->
        <template v-slot:bottom>
          <div class="row items-center justify-end q-pa-sm full-width">
            <Pagination
              :total-count="pagination.total"
              v-model:page="pagination.page"
              :max-page="pagination.maxPage"
              v-model:rows-per-page="pagination.rowsPerPage"
              @page-change="handlePageChange"
            />
          </div>
        </template>
      </q-table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import Pagination from "@/components/Pagination.vue";
import api from "@/api/index";
import { useQuasar } from "quasar";

const { t } = useI18n();
const $q = useQuasar();

// 筛选条件
const filters = ref({
  start_date: '',
  end_date: '',
  search_type: 'sku',
  keywords: '',
  search_mode: 'exact'
});

// 搜索类型选项
const searchTypeOptions = [
  { label: 'SKU', value: 'sku' },
  { label: t('商品名称'), value: 'product_name' }
];

// 搜索模式选项
const searchModeOptions = [
  { label: t('精确搜索'), value: 'exact' },
  { label: t('前缀搜索'), value: 'prefix' },
  { label: t('模糊搜索'), value: 'fuzzy' }
];

// 表格列定义
const columns = [
  {
    name: 'time',
    label: t('时间'),
    field: 'time',
    align: 'left',
  },
  {
    name: 'product',
    label: t('商品信息'),
    field: 'product',
    align: 'left',
    style: 'width: 300px'
  },
  {
    name: 'change_qty',
    label: t('变化数量'),
    field: 'stock',
    align: 'right',
  },
  {
    name: 'total_qty',
    label: t('变动后库存总量'),
    field: 'stock_after',
    align: 'right',
  },
  {
    name: 'type',
    label: t('类型'),
    field: 'type',
    align: 'left',
  },
  {
    name: 'reference',
    label: t('关联单据号'),
    field: 'reference',
    align: 'left',
    style: 'width: 350px'
  }
];

const loading = ref(false);

// 分页配置
const pagination = ref({
  page: 1,
  maxPage: 1,
  rowsPerPage: 50,
  total: 5
});

// 表格分页配置
const tablePagination = ref({
  sortBy: '',
  descending: false,
  page: 1,
  rowsPerPage: 0
});

// 获取数据
const fetchData = async () => {
  try {
    loading.value = true;
    const params = {
      page: pagination.value.page,
      page_size: pagination.value.rowsPerPage,
      search_type: filters.value.search_type,
      keywords: filters.value.keywords,
      search_mode: filters.value.search_mode,
      start_date: filters.value.start_date,
      end_date: filters.value.end_date
    };

    const response = await api.getStocksLogList(params);
    if (response?.success) {
      tableData.value = response.data.items;
      // 更新分页信息
      const meta = response.data.meta;
      pagination.value = {
        page: meta.current_page,
        maxPage: meta.last_page,
        rowsPerPage: meta.per_page,
        total: meta.total
      };
    }
  } catch (error) {
    console.error('获取库存流水失败:', error);
    $q.notify({
      message: t('获取库存流水失败'),
      color: 'negative'
    });
  } finally {
    loading.value = false;
  }
};

// 处理搜索
const handleSearch = () => {
  pagination.value.page = 1;
  fetchData();
};

// 处理分页变更
const handlePageChange = ({ page, rowsPerPage }) => {
  pagination.value.page = page;
  pagination.value.rowsPerPage = rowsPerPage;
  fetchData();
};

// 组件挂载时获取数据
onMounted(() => {
  fetchData();
});

// 模拟数据
const tableData = ref([]);

// 处理导出
const handleExport = () => {
  console.log('导出数据');
  // TODO: 实现导出逻辑
};
</script>

<style lang="scss" scoped>
.stock-flow {
  .product-search {
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 16px;

    .time-group, .search-group {
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
          border-radius: 4px 0 0 4px !important;
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
        background: #fff;
        border-top: 1px solid rgba(0, 0, 0, 0.12);
        border-bottom: 1px solid rgba(0, 0, 0, 0.12);
      }
    }

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

  .q-table {
    border-radius: 8px;
  }
}
</style> 