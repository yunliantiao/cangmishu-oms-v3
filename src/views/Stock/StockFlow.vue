<template>
  <div class="stock-flow">
    <!-- 搜索过滤区域 -->
    <div class="search-bar">
      <div class="row q-col-gutter-sm items-center">
        <!-- 时间筛选+类型 -->
        <DatePickerNew
          v-model:start_date="filters.start_date"
          v-model:end_date="filters.end_date"
          :showSelect="false"
        ></DatePickerNew>

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

    <!-- 表格 -->
    <div class="main-table">
      <!-- 导出按钮 -->
      <div class="q-py-md">
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
        v-model:selected="selectedRows"
      >
        <template v-slot:header="props">
          <q-tr :props="props">
            <q-th auto-width style="padding: 0 8px">
              <q-checkbox color="primary" v-model="props.selected" />
            </q-th>
            <q-th v-for="col in props.cols" :key="col.name" :props="props">
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>

        <template v-slot:no-data="{ icon, filter }">
          <div class="full-width row flex-center text-grey-6 q-gutter-sm">
            <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
            <span>{{ t('暂无数据') }}</span>
          </div>
        </template>

        <!-- 自定义表格内容 -->
        <template v-slot:body="props">
          <q-tr :props="props">
            <!-- 多选框列 -->
            <q-td auto-width style="padding: 0 8px">
              <q-checkbox color="primary" v-model="props.selected" />
            </q-td>

            <!-- 时间列 -->
            <q-td key="time" :props="props">
              {{ props.row.created_at }}
            </q-td>

            <!-- 商品信息列 -->
            <q-td key="product" :props="props">
              <div class="row items-center">
                <q-img
                  v-if="props.row.product_spec_image"
                  :src="props.row.product_spec_image"
                  style="width: 40px; height: 40px; object-fit: cover"
                  class="q-mr-sm"
                />
                <div>
                  <div class="hover-copy" @click="$copy(props.row.sku)">{{ props.row.sku }}</div>
                  <div>{{ props.row.product_name }}</div>
                  <div class="text-grey-7">{{ props.row.name }}</div>
                </div>
              </div>
            </q-td>

            <!-- 变化数量列 -->
            <q-td key="change_qty" :props="props">
              <span :class="props.row.stock > 0 ? 'text-green' : 'text-red'">
                {{ props.row.stock > 0 ? '+' : '' }}{{ props.row.stock }}
              </span>
            </q-td>

            <!-- 变动后库存总量列 -->
            <q-td key="total_qty" :props="props">
              {{ props.row.stock_after }}
            </q-td>

            <!-- 类型列 -->
            <q-td key="type" :props="props">
              {{ typeMap[props.row.type] || t('出库') }}
            </q-td>

            <!-- 关联单据号列 -->
            <q-td key="reference" :props="props">
              <template v-if="props.row.type === '销售出库'">
                <div class="text-grey-7">{{ t('ERP包裹号') }}:</div>
                <div class="hover-copy" @click="$copy(props.row.reference_number)">
                  {{ props.row.reference_number || '--' }}
                </div>
                <div class="text-grey-7">{{ t('订单号') }}: {{ props.row.order_no || '--' }}</div>
                <div class="text-grey-7">{{ t('运单号') }}: {{ props.row.tracking_no || '--' }}</div>
              </template>
              <template v-else>
                <div class="hover-copy" @click="$copy(props.row.reference_number)">
                  {{ t('调整单号') }}:{{ props.row.reference_number || '--' }}
                </div>
                <div>
                  {{ t('入库批次号') }}:
                  {{ props.row.inbound_batch_number || '--' }}
                </div>
                <div>{{ t('库位') }}: {{ props.row.warehouse_location_code || '--' }}</div>
              </template>
            </q-td>
          </q-tr>
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
import api from '@/api/index';
import Pagination from '@/components/Pagination.vue';
import DatePickerNew from '@/components/DatePickerNew/Index.vue';
import KeywordSearch from '@/components/KeywordSearch/Index.vue';
import { useQuasar } from 'quasar';
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const $q = useQuasar();

// 筛选条件
const filters = ref({
  start_date: '',
  end_date: '',
  search_type: 'sku',
  keywords: '',
  search_mode: 'exact',
  log_type: '',
});

// 添加流水类型选项
const logTypeOptions = [
  { label: t('标准入库'), value: 'inbound' },
  { label: t('销售出库'), value: 'outbound' },
  { label: t('退货入库'), value: 'return' },
  { label: t('库存调整'), value: 'adjustment' },
  { label: t('初始化库存'), value: 'initial' },
  { label: t('盘点'), value: 'check' },
];

// 搜索类型选项
const searchTypeOptions = [
  { label: 'SKU', value: 'sku' },
  { label: t('商品名称'), value: 'name' },
];

// 搜索模式选项
const searchModeOptions = [
  { label: t('精确搜索'), value: 'exact' },
  { label: t('前缀搜索'), value: 'prefix' },
  { label: t('模糊搜索'), value: 'fuzzy' },
];

// 类型映射
const typeMap = {
  inbound: t('入库'),
  outbound: t('出库'),
};

// 表格列定义
const columns = [
  {
    name: 'time',
    label: t('时间'),
    field: 'created_at',
    align: 'left',
    style: 'width: 15%',
  },
  {
    name: 'product',
    label: t('商品信息'),
    field: 'product',
    align: 'left',
    style: 'width: 25%',
  },
  {
    name: 'change_qty',
    label: t('变化数量'),
    field: 'stock',
    align: 'center',
    style: 'width: 15%',
  },
  {
    name: 'total_qty',
    label: t('变动后库存总量'),
    field: 'stock_after',
    align: 'center',
    style: 'width: 10%',
  },
  {
    name: 'type',
    label: t('类型'),
    field: 'type',
    align: 'center',
    style: 'width: 15%',
    format: (val) => typeMap[val] || t('出库'),
  },
  {
    name: 'reference',
    label: t('关联单据号'),
    field: 'reference',
    align: 'left',
    style: 'width: 20%',
  },
];

const loading = ref(false);

// 分页配置
const pagination = ref({
  page: 1,
  maxPage: 1,
  rowsPerPage: 50,
  total: 5,
});

// 表格分页配置
const tablePagination = ref({
  sortBy: '',
  descending: false,
  page: 1,
  rowsPerPage: 0,
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
      end_date: filters.value.end_date,
      log_type: filters.value.log_type,
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
        total: meta.total,
      };
    }
  } catch (error) {
    console.error('获取库存流水失败:', error);
    $q.notify({
      message: t('获取库存流水失败'),
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

// 在 script setup 中添加
const selectedRows = ref([]);

// 修改导出处理函数
const handleExport = async (type) => {
  try {
    let params = {
      search_type: filters.value.search_type,
      search_mode: filters.value.search_mode,
      keywords: filters.value.keywords,
      start_date: filters.value.start_date,
      end_date: filters.value.end_date,
      log_type: filters.value.log_type,
    };

    // 如果是按勾选导出，添加 ids 参数
    if (type === 'selected') {
      if (selectedRows.value.length === 0) {
        $q.notify({
          type: 'warning',
          message: t('请先选择要导出的记录'),
        });
        return;
      }
      params.ids = selectedRows.value.map((row) => row.id);
    }

    // 调用导出API
    const response = await api.stocksLogsExport(params);

    // 获取文件名
    const filename = `库存流水_${new Date().toLocaleDateString()}.xlsx`;

    // 创建 Blob 对象
    const blob = new Blob([response], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    // 创建下载链接
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;

    // 触发下载
    document.body.appendChild(link);
    link.click();

    // 清理
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    $q.notify({
      type: 'positive',
      message: t('导出成功'),
    });
  } catch (error) {
    // 只在真正的错误情况下显示错误提示
    if (!error.response || error.response.status !== 200) {
      $q.notify({
        type: 'negative',
        message: t('导出失败'),
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.stock-flow {
}
</style>
