<template>
  <div class="stock-list">
    <!-- 筛选模块 -->
    <div class="product-search bg-white">
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
          <q-tab name="standard" :label="t('标准库龄')" />
          <q-tab name="segment" :label="t('分段库龄')" />
        </q-tabs>
      </div>

      <!-- 搜索过滤区域 -->
      <div class="row items-center">
        <!-- 关键词搜索模块 -->
        <div class="row items-center no-wrap search-group">
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

    <!-- 表格容器 -->
    <div class="stock-container">
      <div class="row justify-end q-mb-md">
        <q-btn
          v-if="tab === 'segment'"
          color="primary"
          :label="t('库龄区间设置')"
          class="q-mr-sm"
          @click="openAgeSettingDialog"
        />
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
          :loading="loading"
          selection="multiple"
          v-model:selected="selectedRows"
          hide-pagination
          class="full-width"
        >
          <template v-slot:no-data="{ icon, filter }">
            <div class="full-width row flex-center text-grey-6 q-gutter-sm">
              <q-icon size="2em" :name="filter ? 'filter_b_and_w' : icon" />
              <span> {{ t('暂无数据') }} </span>
            </div>
          </template>
          <template v-slot:header-selection="props">
            <div class="text-left">
              <q-checkbox color="primary" v-model="props.selected" />
            </div>
          </template>

          <template v-slot:body-selection="props">
            <div class="text-left">
              <q-checkbox color="primary" v-model="props.selected" />
            </div>
          </template>

          <!-- 商品信息列自定义 -->
          <template v-slot:body-cell-product="props">
            <q-td :props="props">
              <div class="row items-center">
                <q-img
                  v-if="props.row.product_spec_image"
                  :src="props.row.product_spec_image"
                  style="width: 40px; height: 40px; object-fit: cover;"
                  class="q-mr-sm"
                />
                <div>
                  <div>{{ props.row.product_spec_sku }}</div>
                  <div class="text-caption">{{ props.row.product_name }}</div>
                  <div class="text-grey-7">{{ props.row.product_spec_name }}</div>
                </div>
              </div>
            </q-td>
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

    <!-- 添加库龄设置弹窗 -->
    <q-dialog v-model="showAgeSettingDialog">
      <q-card style="width: 600px; max-width: 90vw;">
        <q-card-section class="row items-center">
          <div class="text-h6">{{ t('库龄区间设置') }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <div class="text-orange-8 bg-orange-1 q-pa-sm rounded-borders">
            {{ t('支持自定义库龄区间，设置完成当天24点更新库龄报表数据后生效') }}
          </div>
          <div class="q-mt-md">
            <div v-for="(item, index) in groupConfig" :key="index" class="row items-center q-mb-md">
              <q-input
                outlined
                dense
                v-model="item.min_days"
                class="col-3"
                :disable="true"
                :label="t('天')"
                type="number"
              />
              <div class="col-1 text-center">--</div>
              <q-input
                outlined
                dense
                v-model="item.max_days"
                class="col-3"
                :label="t('天')"
                type="number"
                @update:model-value="handleMaxDaysChange(index, $event)"
                @blur="handleMaxDaysBlur(index)"
              />
              <q-btn
                flat
                round
                dense
                color="negative"
                icon="delete"
                class="q-ml-sm"
                @click="deleteRow(index)"
              />
            </div>
            
            <!-- 添加行按钮 -->
            <div class="q-mt-md">
              <q-btn
                flat
                color="primary"
                :label="t('添加行')"
                icon="add"
                @click="addNewRow"
              />
            </div>
          </div>
        </q-card-section>

        <q-card-section align="right">
          <q-btn flat :label="t('取消')" v-close-popup />
          <q-btn 
            color="primary" 
            :label="t('确认')" 
            class="q-ml-sm" 
            @click="handleSave"
            :loading="loading"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";
import Pagination from "@/components/Pagination.vue";
import api from "@/api/index";

const $q = useQuasar();
const { t } = useI18n();

// 筛选条件
const filters = ref({
  start_date: "",
  end_date: "",
  search_type: "sku",
  keywords: "",
  search_mode: "exact",
});

// 搜索类型选项
const searchTypeOptions = [
  { label: "SKU", value: "sku" },
  { label: t("商品名称"), value: "product_name" },
];

// 搜索模式选项
const searchModeOptions = [
  { label: t("精确搜索"), value: "exact" },
  { label: t("前缀搜索"), value: "prefix" },
  { label: t("模糊搜索"), value: "fuzzy" },
];

// 表格列定义
const standardColumns = [
  {
    name: 'product',
    label: t('商品信息'),
    field: 'product',
    align: 'left',
    style: 'width: 500px'
  },
  {
    name: 'size',
    label: t('商品尺寸'),
    field: row => `${row.product_spec_size_length} x ${row.product_spec_size_width} x ${row.product_spec_size_height}cm`,
    align: 'left',
  },
  {
    name: 'inbound_date',
    label: t('上架日期'),
    field: 'created_at',
    format: val => val.split(' ')[0],
    align: 'left',
  },
  {
    name: 'total_qty',
    label: t('数量'),
    field: 'total_qty',
    align: 'left',
  },
  {
    name: 'age',
    label: t('库龄 (天)'),
    field: 'age',
    align: 'left',
  },
  {
    name: 'updated_at',
    label: t('更新时间'),
    field: 'updated_at',
    align: 'left',
  }
];

// 分段库龄的列定义
const groupColumns = [
  {
    name: 'product',
    label: t('商品信息'),
    field: 'product',
    align: 'left',
    style: 'width: 500px'
  },
  {
    name: 'size',
    label: t('商品尺寸'),
    field: row => `${row.product_spec_size_length} x ${row.product_spec_size_width} x ${row.product_spec_size_height}cm`,
    align: 'left',
  },
  {
    name: 'updated_at',
    label: t('更新时间'),
    field: 'updated_at',
    align: 'left',
  }
  // 这里后续根据接口返回的字段添加其他列
];

// 根据当前标签页计算使用的列
const columns = computed(() => {
  return tab.value === 'standard' ? standardColumns : groupColumns;
});

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
  sortBy: "",
  descending: false,
  page: 1,
  rowsPerPage: 0,
});

// 标签页
const tab = ref("standard");

// 分段库龄配置数据
const groupConfig = ref([]);

// 控制库龄设置弹窗显示
const showAgeSettingDialog = ref(false);

// 修改标签页监听逻辑
watch(tab, async (newTab) => {
  selectedRows.value = []; // 清空选中行
  fetchData(); // 重新获取数据
});

// 打开设置弹窗
const openAgeSettingDialog = async () => {
  try {
    loading.value = true;
    const response = await api.getGroupConfigList();
    if (response?.success) {
      groupConfig.value = response.data || [];
      showAgeSettingDialog.value = true;
    }
  } catch (error) {
    console.error('获取分段库龄配置失败:', error);
    $q.notify({
      message: t('获取分段库龄配置失败'),
      color: 'negative'
    });
  } finally {
    loading.value = false;
  }
};

// 获取数据
const fetchData = async () => {
  try {
    loading.value = true;
    // 重置数据
    tableData.value = [];
    pagination.value.page = 1;
    
    const params = {
      page: pagination.value.page,
      page_size: pagination.value.rowsPerPage,
      search_type: filters.value.search_type,
      keywords: filters.value.keywords,
      search_mode: filters.value.search_mode
    };

    let response;
    if (tab.value === 'standard') {
      response = await api.getStockAgeList(params);
    } else {
      response = await api.getStockAgeGroupList(params);
    }

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
    console.error('获取库龄列表失败:', error);
    $q.notify({
      message: t('获取库龄列表失败'),
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

// 修改导出处理函数
const handleExport = async (type) => {
  try {
    let params = {
      search_type: filters.value.search_type,
      search_mode: filters.value.search_mode,
      keywords: filters.value.keywords,
    };

    // 如果是按勾选导出，添加 ids 参数
    if (type === "selected") {
      params.ids = selectedRows.value.map((row) => row.id);
    }

    // 调用导出API
    const response = await api.stocksExport(params);

    if (response.success) {
      // 如果返回的是文件URL，则创建下载链接
      const link = document.createElement("a");
      link.href = response.data.url;
      link.download = `库存清单_${new Date().toLocaleDateString()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      $q.notify({
        type: "positive",
        message: t("导出成功"),
      });
    }
  } catch (error) {
    console.error("导出失败:", error);
    $q.notify({
      type: "negative",
      message: t("导出失败"),
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
watch(
  [() => tablePagination.value.sortBy, () => tablePagination.value.descending],
  ([newSortBy, newDescending]) => {
    fetchData();
  }
);

// 添加新行
const addNewRow = () => {
  const lastItem = groupConfig.value[groupConfig.value.length - 1];
  const newMinDays = lastItem ? parseInt(lastItem.max_days) + 1 : 0;
  groupConfig.value.push({
    min_days: newMinDays,
    max_days: '',
    total_qty: 0
  });
};

// 删除行
const deleteRow = (index) => {
  groupConfig.value.splice(index, 1);
  // 更新后续行的min_days
  for (let i = index; i < groupConfig.value.length; i++) {
    const prevItem = groupConfig.value[i - 1];
    groupConfig.value[i].min_days = prevItem ? parseInt(prevItem.max_days) + 1 : 0;
  }
};

// 检查是否可以添加新行
const canAddRow = computed(() => {
  const lastItem = groupConfig.value[groupConfig.value.length - 1];
  return lastItem && lastItem.max_days;
});

// 检查是否可以保存
const canSave = computed(() => {
  const lastItem = groupConfig.value[groupConfig.value.length - 1];
  return lastItem && lastItem.max_days;
});

// 处理max_days变化
const handleMaxDaysChange = (index, value) => {
  const currentItem = groupConfig.value[index];
  const nextItem = groupConfig.value[index + 1];
  
  // 更新当前行的max_days
  currentItem.max_days = value;
  
  // 如果存在下一行，更新其min_days
  if (nextItem) {
    nextItem.min_days = value !== '' ? parseInt(value) + 1 : '';
  }
};

// 处理失焦验证
const handleMaxDaysBlur = (index) => {
  const currentItem = groupConfig.value[index];
  const nextItem = groupConfig.value[index + 1];
  let newValue = parseInt(currentItem.max_days) || '';
  
  // 如果小于min_days，设置为min_days并提示
  if (newValue !== '' && newValue < currentItem.min_days) {
    newValue = currentItem.min_days;
    currentItem.max_days = newValue;
    $q.notify({
      type: 'warning',
      message: t('结束天数不能小于开始天数'),
      position: 'top'
    });
  }

  // 如果大于下一行的结束值，设置为下一行结束值减1并提示
  if (nextItem && nextItem.max_days && newValue >= nextItem.max_days) {
    newValue = parseInt(nextItem.max_days) - 1;
    currentItem.max_days = newValue;
    $q.notify({
      type: 'warning',
      message: t('结束天数不能大于或等于下一行的结束天数'),
      position: 'top'
    });
  }

  // 更新下一行的min_days
  if (nextItem) {
    nextItem.min_days = newValue !== '' ? newValue + 1 : '';
  }
};

// 处理保存
const handleSave = async () => {
  const lastItem = groupConfig.value[groupConfig.value.length - 1];
  if (!lastItem?.max_days || parseInt(lastItem.max_days) !== 999) {
    $q.notify({
      type: 'warning',
      message: t('最后一级阶梯应是无穷大，请设置为999'),
      position: 'top'
    });
    return;
  }

  try {
    loading.value = true;
    // 构造请求数据
    const items = groupConfig.value.map(item => ({
      min_days: parseInt(item.min_days),
      max_days: parseInt(item.max_days)
    }));

    const response = await api.editGroupConfig({ items });
    if (response?.success) {
      showAgeSettingDialog.value = false;
      // 刷新列表
      fetchData();
    }
  } catch (error) {
    console.error('保存分段库龄配置失败:', error);
    $q.notify({
      type: 'negative',
      message: t('保存失败'),
      position: 'top'
    });
  } finally {
    loading.value = false;
  }
};

// 组件挂载时获取数据
onMounted(() => {
  fetchData();
});
</script>

<style lang="scss" scoped>
.stock-list {

  :deep(.q-checkbox) {
    .q-checkbox__inner--truthy {
      color: var(--q-primary);
    }
  }

  .product-search {
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 16px;

    .q-tabs {
      margin: -16px -16px 16px -16px;
      padding: 0;
    }

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

  .stock-container {
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
    width: 100%;
    
    :deep(table) {
      width: 100%;
    }

    :deep(th:first-child),
    :deep(td:first-child) {
      width: 40px;
      padding: 4px 4px 4px 8px;
    }

    :deep(th:nth-child(2)),
    :deep(td:nth-child(2)) {
      padding-left: 4px;
    }
  }

  // 添加库龄设置弹窗样式
  :deep(.q-dialog__inner) {
    .q-card {
      border-radius: 8px;
    }
  }
}
</style>
