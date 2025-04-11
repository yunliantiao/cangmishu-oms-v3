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
          <q-input
            v-model="skuSearch"
            outlined
            dense
            placeholder="搜索 SKU 或商品名称"
            style="width: 300px"
            class="q-mr-md"
          >
            <template v-slot:append>
              <q-btn round dense flat icon="search" @click="handleSkuSearch" />
            </template>
          </q-input>
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
          :pagination="{
            rowsPerPage: skuPagination.rowsPerPage,
            page: skuPagination.page,
            rowsNumber: skuPagination.total,
            sortBy: 'sku'
          }"
          @request="onSkuTableRequest"
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
                    <div class="ellipsis">{{ props.row?.product?.name || '-' }}</div>
                    <div>规格: {{ props.row?.name || '-' }}</div>
                  </div>
                </div>
              </q-td>
              <q-td key="applySpec" class="text-center" style="white-space: pre-line">
                {{ `${props.row?.size_length || 0}*${props.row?.size_width || 0}*${props.row?.size_height || 0} cm\n${props.row?.weight || 0} g` }}
              </q-td>
              <q-td key="realSpec" class="text-center" style="white-space: pre-line">
                {{ `${props.row?.warehouse_size_length || 0}*${props.row?.warehouse_size_width || 0}*${props.row?.warehouse_size_height || 0} cm\n${props.row?.warehouse_weight || 0} g` }}
              </q-td>
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
              <div class="row items-center">
                <q-pagination
                  v-model="skuPagination.page"
                  :max="skuPagination.total"
                  :max-pages="6"
                  boundary-links
                  direction-links
                  color="primary"
                />
              </div>
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
import { ref, reactive } from 'vue';
import { useQuasar } from 'quasar';
import api from '@/api/index';

const $q = useQuasar();

const emit = defineEmits(['selected', 'cancel']);

// 弹窗显示状态
const dialogVisible = ref(false);

// SKU 列表相关
const skuLoading = ref(false);
const skuSearch = ref('');
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
    name: "applySpec", 
    label: "申报规格", 
    field: row => `${row.size_length || 0}*${row.size_width || 0}*${row.size_height || 0} cm\n${row.weight || 0} g`, 
    align: "center",
    style: "width: 20%"
  },
  { 
    name: "realSpec", 
    label: "实际规格", 
    field: row => `${row.warehouse_size_length || 0}*${row.warehouse_size_width || 0}*${row.warehouse_size_height || 0} cm\n${row.warehouse_weight || 0} g`,
    align: "center",
    style: "width: 20%"
  },
  { 
    name: "timeInfo", 
    label: "时间", 
    align: "center",
    style: "width: 25%"
  }
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

// 获取 SKU 列表
const fetchSkuList = async () => {
  skuLoading.value = true;
  try {
    const params = {
      page: skuPagination.page,
      page_size: skuPagination.rowsPerPage,
      search: skuSearch.value || ''
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

// 处理 SKU 表格请求（分页、排序等）
const onSkuTableRequest = (props) => {
  const { page, rowsPerPage } = props.pagination;
  
  skuPagination.page = page;
  skuPagination.rowsPerPage = rowsPerPage;
  
  fetchSkuList();
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