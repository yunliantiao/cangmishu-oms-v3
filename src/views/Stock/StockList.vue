<template>
  <div class="stock-list">
    <!-- 筛选模块 -->
    <div class="search-bar">
      <div class="row q-col-gutter-sm">
        <!-- 关键词搜索模块 -->
        <KeywordSearch
          v-model:search_mode="filters.search_mode"
          v-model:search_type="filters.search_type"
          v-model:search_value="filters.keywords"
          :searchTypeList="searchTypeOptions"
        ></KeywordSearch>
        <div>
          <q-btn color="primary" class="filter-btn" :label="t('搜索')" @click="handleSearch" />
        </div>
      </div>
    </div>

    <!-- 表格容器 -->
    <div class="main-table">
      <div class="row q-py-md">
        <q-btn-dropdown color="primary" flat :label="t('导出')" icon="file_download">
          <q-list>
            <q-item clickable v-close-popup @click="handleExport('selected')">
              <q-item-section>
                <q-item-label>{{ t('按勾选导出') }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="handleExport('all')">
              <q-item-section>
                <q-item-label>{{ t('按筛选导出') }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
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
          v-model:selected="selectedRows"
        >
          <template v-slot:no-data="{ icon, filter }">
            <div class="full-width row flex-center text-grey-6 q-gutter-sm">
              <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
              <span>{{ t('暂无数据') }}</span>
            </div>
          </template>
          <template v-slot:header-selection="props">
            <q-checkbox color="primary" v-model="props.selected" />
          </template>

          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td auto-width>
                <q-checkbox color="primary" v-model="props.selected" />
              </q-td>
              <q-td key="sku" :props="props">
                <div class="row items-start">
                  <img
                    :src="
                      props.row.image ||
                      'https://testoms.cangmishu.com/api/uploads/52331320-d813-40d8-a6db-3cf28f4938b1'
                    "
                    class="q-mr-md"
                    style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px"
                  />
                  <div class="flex-c-start-start gap-6" style="white-space: normal">
                    <div class="text-primary hover-copy" @click="$copy(props.row.sku)">
                      SKU: {{ props.row?.sku || '-' }}
                    </div>
                    <div class="text-overflow-1 text-grey-7">
                      {{ t('名称') }}：{{ props.row?.product?.name || '-' }}
                      <q-tooltip>{{ props.row?.product?.name }}</q-tooltip>
                    </div>
                    <div class="text-grey-7">{{ t('规格') }}: {{ props.row?.name || '-' }}</div>
                  </div>
                </div>
              </q-td>
              <q-td align="right">{{ props.row.in_transit_qty }}</q-td>
              <q-td align="right">{{ props.row.pending_receipt_qty }}</q-td>
              <q-td align="right">{{ props.row.pending_shelf_qty }}</q-td>
              <q-td align="right">{{ props.row.locked_qty }}</q-td>
              <q-td align="right">{{ props.row.available_qty }}</q-td>
              <q-td align="right">{{ props.row.defective_qty }}</q-td>
              <q-td align="right">{{ props.row.total_qty }}</q-td>
            </q-tr>
          </template>

          <!-- 表格底部合计行 -->
          <template v-slot:bottom-row>
            <q-tr>
              <q-td colspan="2">{{ t('合计') }}</q-td>
              <q-td align="right">{{ totalInTransit }}</q-td>
              <q-td align="right">{{ totalPendingReceipt }}</q-td>
              <q-td align="right">{{ totalPendingShelf }}</q-td>
              <q-td align="right">{{ totalLocked }}</q-td>
              <q-td align="right">{{ totalAvailable }}</q-td>
              <q-td align="right">{{ totalDefective }}</q-td>
              <q-td align="right">{{ totalQuantity }}</q-td>
            </q-tr>
          </template>
        </q-table>

        <!-- 分页 -->
        <div class="q-pa-md">
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
import KeywordSearch from '@/components/KeywordSearch/Index.vue';
import Pagination from '@/components/Pagination.vue';
import { useQuasar } from 'quasar';
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const $q = useQuasar();
const { t } = useI18n();

// 筛选条件
const filters = ref({
  start_date: '',
  end_date: '',
  search_type: 'sku',
  keywords: '',
  search_mode: 'exact',
});

// 搜索类型选项
const searchTypeOptions = [
  { label: 'SKU', value: 'sku' },
  { label: t('商品名称'), value: 'product_name' },
];

// 搜索模式选项
const searchModeOptions = [
  { label: t('精确搜索'), value: 'exact' },
  { label: t('前缀搜索'), value: 'prefix' },
  { label: t('模糊搜索'), value: 'fuzzy' },
];

// 表格数据
const columns = [
  {
    name: 'sku',
    label: 'SKU信息',
    field: 'sku',
    align: 'left',
    style: 'width: 300px',
  },
  {
    name: 'in_transit_qty',
    label: t('在途'),
    field: 'in_transit_qty',
    align: 'right',
    sortable: true,
  },
  {
    name: 'pending_receipt_qty',
    label: t('待收货'),
    field: 'pending_receipt_qty',
    align: 'right',
    sortable: true,
  },
  {
    name: 'pending_shelf_qty',
    label: t('待上架'),
    field: 'pending_shelf_qty',
    align: 'right',
    sortable: true,
  },
  {
    name: 'locked_qty',
    label: t('已锁定'),
    field: 'locked_qty',
    align: 'right',
    sortable: true,
  },
  {
    name: 'available_qty',
    label: t('可用库存'),
    field: 'available_qty',
    align: 'right',
    sortable: true,
  },
  {
    name: 'defective_qty',
    label: t('不良品'),
    field: 'defective_qty',
    align: 'right',
    sortable: true,
  },
  {
    name: 'total_qty',
    label: t('库存总量'),
    field: 'total_qty',
    align: 'right',
    sortable: true,
  },
];

// 表格数据
const tableData = ref([]);

const loading = ref(false);
const selectedRows = ref([]);

// 分页
const pagination = ref({
  page: 1,
  maxPage: 1,
  rowsPerPage: 50,
  total: 3,
});

// 表格分页配置
const tablePagination = ref({
  sortBy: '',
  descending: false,
  page: 1,
  rowsPerPage: 0,
});

// 计算合计数据
const totalInTransit = computed(() => tableData.value.reduce((sum, row) => sum + (row.in_transit_qty || 0), 0));
const totalPendingReceipt = computed(() =>
  tableData.value.reduce((sum, row) => sum + (row.pending_receipt_qty || 0), 0)
);
const totalPendingShelf = computed(() => tableData.value.reduce((sum, row) => sum + (row.pending_shelf_qty || 0), 0));
const totalLocked = computed(() => tableData.value.reduce((sum, row) => sum + (row.locked_qty || 0), 0));
const totalAvailable = computed(() => tableData.value.reduce((sum, row) => sum + (row.available_qty || 0), 0));
const totalDefective = computed(() => tableData.value.reduce((sum, row) => sum + (row.defective_qty || 0), 0));
const totalQuantity = computed(() => tableData.value.reduce((sum, row) => sum + (row.total_qty || 0), 0));

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
    };

    const response = await api.getStocksList(params);
    if (response?.success) {
      tableData.value = response.data.items;
      // 更新分页信息
      const meta = response.data.meta;
      pagination.value = {
        page: meta.current_page,
        maxPage: meta.last_page,
        rowsPerPage: meta.per_page,
        total: meta.total,
      };
    }
  } catch (error) {
    console.error('获取库存列表失败:', error);
    $q.notify({
      message: t('获取库存列表失败'),
      color: 'negative',
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

// 修改导出处理函数
const handleExport = async (type) => {
  try {
    let params = {
      search_type: filters.value.search_type,
      search_mode: filters.value.search_mode,
      keywords: filters.value.keywords,
    };

    // 如果是按勾选导出，添加 ids 参数
    if (type === 'selected') {
      params.ids = selectedRows.value.map((row) => row.id);
    }

    // 调用导出API
    const response = await api.stocksExport(params);

    if (response.success) {
      // 如果返回的是文件URL，则创建下载链接
      const link = document.createElement('a');
      link.href = response.data.url;
      link.download = `库存清单_${new Date().toLocaleDateString()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      $q.notify({
        type: 'positive',
        message: t('导出成功'),
      });
    }
  } catch (error) {
    console.error('导出失败:', error);
    $q.notify({
      type: 'negative',
      message: t('导出失败'),
    });
  }
};

// 处理分页变更
const handlePageChange = ({ page, rowsPerPage }) => {
  pagination.value.page = page;
  pagination.value.rowsPerPage = rowsPerPage;
  fetchData();
};

// 监听排序变化
watch([() => tablePagination.value.sortBy, () => tablePagination.value.descending], ([newSortBy, newDescending]) => {
  fetchData();
});

// 组件挂载时获取数据
onMounted(() => {
  fetchData();
});
</script>

<style lang="scss" scoped>
.stock-list {
  padding: 16px;

  :deep(.q-checkbox) {
    .q-checkbox__inner--truthy {
      color: var(--q-primary);
    }
  }
}
</style>
