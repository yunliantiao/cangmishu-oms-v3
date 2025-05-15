<template>
  <q-dialog
    v-model="dialogVisible"
    persistent
    full-width
  >
    <q-card style="max-width: 900px; width: 90vw;">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">选择商品</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section style="height: calc(90vh - 150px); overflow: auto;">
        <!-- 搜索区域 -->
        <div class="row q-mb-md">
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
              style="min-width: 200px"
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
            <q-btn
              color="primary"
              :label="t('搜索')"
              class="q-ml-sm"
              @click="handleSkuSearch"
            />
          </div>
        </div>

        <!-- SKU 列表 -->
        <q-table
          :rows="skuList"
          :columns="skuDialogColumns"
          row-key="id"
          v-model:selected="selectedSkus"
          selection="multiple"
          :loading="skuLoading"
          flat
          bordered
          hide-pagination
          :pagination="{
            rowsPerPage: 0
          }"
          class="sku-table"
        >
          <!-- 加载动画插槽 -->
          <template v-slot:loading>
            <q-inner-loading showing color="primary">
              <q-spinner-dots size="50px" />
            </q-inner-loading>
          </template>

          <!-- 无数据时的显示 -->
          <template v-slot:no-data>
            <div v-if="!loading && (!skuList || skuList.length === 0)" class="full-width row flex-center q-my-lg">
              <span class="text-grey">暂无数据</span>
            </div>
          </template>

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

          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td auto-width style="padding: 0 8px">
                <q-checkbox color="primary" v-model="props.selected" />
              </q-td>
              <!-- SKU信息 -->
              <q-td key="skuInfo">
                <div class="row no-wrap items-center">
                  <div class="q-mr-sm">
                    <img 
                      :src="props.row?.image" 
                      style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;"
                    />
                  </div>
                  <div class="ellipsis">
                    <div>SKU: {{ props.row?.sku || '-' }}</div>
                  </div>
                </div>
              </q-td>
               <!-- SKU信息 -->
               <q-td key="info">
                <div class="row no-wrap items-center">
                  <div class="ellipsis">
                    <div class="ellipsis">{{ props.row?.product?.name || '-' }}</div>
                    <div>规格: {{ props.row?.name || '-' }}</div>
                  </div>
                </div>
              </q-td>
              <!-- <q-td key="applySpec" class="text-center" style="white-space: pre-line">
                {{ `${props.row?.size_length || 0}*${props.row?.size_width || 0}*${props.row?.size_height || 0} cm\n${props.row?.weight || 0} g` }}
              </q-td>
              <q-td key="realSpec" class="text-center" style="white-space: pre-line">
                {{ `${props.row?.warehouse_size_length || 0}*${props.row?.warehouse_size_width || 0}*${props.row?.warehouse_size_height || 0} cm\n${props.row?.warehouse_weight || 0} g` }}
              </q-td> -->
              <q-td key="timeInfo" class="text-center">
                <div>创建: {{ props.row?.created_at || '-' }}</div>
                <div>更新: {{ props.row?.updated_at || '-' }}</div>
              </q-td>
            </q-tr>
          </template>

          <!-- 底部选中记录数显示 -->
          <template v-slot:bottom>
            <div class="row items-center justify-between full-width q-px-sm">
              <div class="text-grey-8">
                已选择 {{ selectedSkus.length }} 条记录
              </div>
              <Pagination
                :total-count="skuPagination.total"
                v-model:page="skuPagination.page"
                :max-page="Math.ceil(skuPagination.total / skuPagination.rowsPerPage)"
                v-model:rows-per-page="skuPagination.rowsPerPage"
                @page-change="handlePageChange"
              />
            </div>
          </template>
        </q-table>
      </q-card-section>
      
      <q-card-actions align="center" class="q-pa-md">
        <q-btn outline color="grey-7"  label="取消" v-close-popup @click="handleCancel" />
        <q-btn color="primary" label="确定" @click="handleConfirm" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from "vue-i18n";
import api from '@/api/index';
import Pagination from "@/components/Pagination.vue";


const { t } = useI18n();

const $q = useQuasar();

const emit = defineEmits(['selected', 'cancel']);

// 弹窗显示状态
const dialogVisible = ref(false);

// SKU 列表相关
const skuLoading = ref(false);
const filters = reactive({
  search_type: 'sku',
  keywords: '',
  search_mode: 'exact'
});
const selectAll = ref(false);
const skuPagination = reactive({
  page: 1,
  rowsPerPage: 10,
  total: 0,
  totalPages: 1
});
const skuList = ref([]);
const selectedSkus = ref([]);

// SKU 列表弹窗列定义
const skuDialogColumns = [
  {
    name: "skuInfo",
    required: true,
    label: "SKU信息",
    align: "left",
    field: (row) => row?.sku || '',
    style: "width: 25%"
  },
  {
    name: "info",
    required: true,
    label: "产品名称",
    align: "left",
    style: "width: 25%"
  },
  // { 
  //   name: "applySpec", 
  //   label: "申报规格", 
  //   field: row => `${row.size_length || 0}*${row.size_width || 0}*${row.size_height || 0} cm\n${row.weight || 0} g`, 
  //   align: "center",
  //   style: "width: 20%"
  // },
  // { 
  //   name: "realSpec", 
  //   label: "实际规格", 
  //   field: row => `${row.warehouse_size_length || 0}*${row.warehouse_size_width || 0}*${row.warehouse_size_height || 0} cm\n${row.warehouse_weight || 0} g`,
  //   align: "center",
  //   style: "width: 20%"
  // },
  { 
    name: "timeInfo", 
    label: "时间", 
    align: "center",
    style: "width: 25%"
  }
];

const searchTypeOptions = [
  { label: t('SKU'), value: 'sku' },
  { label: t('商品名称'), value: 'name' }
];

const searchModeOptions = [
  { label: t('精确搜索'), value: 'exact' },
  { label: t('模糊搜索'), value: 'fuzzy' },
  { label: t('前缀搜索'), value: 'prefix' }
];

// 全选/取消全选
const selectAllItems = (val) => {
  if (val) {
    // 全选当前页所有项
    skuList.value.forEach(sku => {
      if (!selectedSkus.value.some(s => s.id === sku.id)) {
        selectedSkus.value.push(sku);
      }
    });
  } else {
    // 从选中列表中移除当前页所有项
    skuList.value.forEach(sku => {
      const index = selectedSkus.value.findIndex(s => s.id === sku.id);
      if (index !== -1) {
        selectedSkus.value.splice(index, 1);
      }
    });
  }
};

// 监听当前页选择状态以更新全选按钮
const updateSelectAllState = () => {
  if (skuList.value.length === 0) {
    selectAll.value = false;
    return;
  }
  
  // 检查当前页中的所有项是否都被选中
  const allSelected = skuList.value.every(sku => 
    selectedSkus.value.some(s => s.id === sku.id)
  );
  
  selectAll.value = allSelected;
};

// 处理分页变更
const handlePageChange = ({ page, rowsPerPage }) => {
  skuPagination.page = page;
  skuPagination.rowsPerPage = rowsPerPage;
  fetchSkuList();
};

// 获取 SKU 列表
const fetchSkuList = async () => {
  skuLoading.value = true;
  try {
    const params = {
      page: skuPagination.page,
      per_page: skuPagination.rowsPerPage,
      search_type: filters.search_type,
      keywords: filters.keywords,
      search_mode: filters.search_mode
    };
    
    const response = await api.getSkuList(params);
    
    if (response.success) {
      skuList.value = response.data.items || [];
      
      // 设置分页信息
      if (response.data.meta) {
        skuPagination.total = response.data.meta.total || 0;
      }
      
      // 更新全选状态
      updateSelectAllState();
    } else {
      console.error('获取 SKU 列表失败:', response.message);
      $q.notify({
        type: 'negative',
        message: `获取 SKU 列表失败: ${response.message}`
      });
    }
  } catch (error) {
    console.error('获取 SKU 列表出错:', error);
    $q.notify({
      type: 'negative',
      message: '网络错误，请稍后重试'
    });
  } finally {
    skuLoading.value = false;
  }
};

// 处理 SKU 搜索
const handleSkuSearch = () => {
  skuPagination.page = 1; // 重置到第一页
  fetchSkuList();
};

// 打开弹窗
const open = () => {
  dialogVisible.value = true;
  skuPagination.page = 1;
  selectedSkus.value = [];
  fetchSkuList();
};

// 处理取消
const handleCancel = () => {
  dialogVisible.value = false;
  selectedSkus.value = [];
  emit('cancel');
};

// 处理确认
const handleConfirm = () => {
  if (selectedSkus.value.length === 0) {
    $q.notify({
      type: 'warning',
      message: '请至少选择一个 SKU'
    });
    return;
  }
  
  emit('selected', selectedSkus.value);
  dialogVisible.value = false;
  selectedSkus.value = [];
};

// 暴露方法给父组件
defineExpose({
  open
});
</script>

<style lang="scss" scoped>
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
    :deep(.q-field__control) {
      border-radius: 4px 0 0 4px !important;
      border-right: none !important;
    }
  }

  .keywords-input {
    flex: 1;
    :deep(.q-field__control) {
      border-radius: 0;
      border-right: none !important;
    }
  }

  .search-mode-select {
    :deep(.q-field__control) {
      border-radius: 0 4px 4px 0 !important;
    }
  }
}

.sku-table {
  width: 100%;

  :deep(.q-table) {
    table {
      table-layout: fixed;
    }
    
    .q-td, .q-th {
      padding: 8px;
      overflow: hidden;
    }

    thead tr th {
      position: relative;
      background: #f5f5f5;
    }
  }

  .ellipsis {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 400px;
  }
}
</style> 