<template>
  <q-dialog
    v-model="dialogVisible"
    persistent
    full-width
  >
    <q-card style="max-width: 900px; width: 90vw;">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">{{ $t('选择商品') }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section style="height: calc(90vh - 150px); overflow: auto;">
        <!-- 搜索栏 -->
        <div class="row q-mb-md">
          <q-input
            v-model="searchForm.keyword"
            outlined
            dense
            :placeholder="$t('输入SKU搜索')"
            style="width: 300px"
            class="q-mr-md"
            @keyup.enter="handleSearch"
          >
            <template v-slot:append>
              <q-btn round dense flat icon="search" @click="handleSearch" />
            </template>
          </q-input>
        </div>
        <!-- 表格 -->
        <q-table
          :rows="tableData"
          :columns="columns"
          :loading="loading"
          row-key="id"
          flat
          bordered
          v-model:selected="selected"
          selection="multiple"
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
            <div v-if="!loading && (!tableData || tableData.length === 0)" class="full-width row flex-center q-my-lg">
              <span class="text-grey">{{ $t('暂无数据') }}</span>
            </div>
          </template>

          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td auto-width style="padding: 0 8px">
                <q-checkbox color="primary" v-model="props.selected" />
              </q-td>
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
                    <div class="ellipsis">{{ props.row?.product_name || '-' }}</div>
                    <div>规格: {{ props.row?.name || '-' }}</div>
                  </div>
                </div>
              </q-td>
              <q-td key="spec" class="text-center" style="white-space: pre-line">
                {{ `${props.row?.warehouse_size_length || 0}*${props.row?.warehouse_size_width || 0}*${props.row?.warehouse_size_height || 0} cm\n${props.row?.warehouse_weight || 0} g` }}
              </q-td>
              <q-td key="stock" class="text-right">
                {{ props.row?.available_qty || 0 }}
              </q-td>
            </q-tr>
          </template>

          <!-- 底部选中记录数显示 -->
          <template v-slot:bottom>
            <div class="row items-center justify-between full-width q-px-sm">
              <div class="text-grey-8">
                {{ $t('已选择') }} {{ selected.length }} {{ $t('条记录') }}
              </div>
              <Pagination
                :total-count="pagination.total"
                v-model:page="pagination.page"
                :max-page="Math.ceil(pagination.total / pagination.rowsPerPage)"
                v-model:rows-per-page="pagination.rowsPerPage"
                @page-change="handlePageChange"
              />
            </div>
          </template>
        </q-table>
      </q-card-section>
      
      <q-card-actions align="center" class="q-pa-md">
        <q-btn outline color="grey-7" :label="$t('取消')" v-close-popup @click="handleCancel" />
        <q-btn color="primary" :label="$t('确定')" @click="handleConfirm" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from "vue-i18n";
import api from '@/api/index';
import Pagination from "@/components/Pagination.vue";

const $q = useQuasar();
const { t } = useI18n();

const emit = defineEmits(['selected', 'cancel']);

// 弹窗显示状态
const dialogVisible = ref(false);

// 表格数据
const tableData = ref([]);
const loading = ref(false);
const selected = ref([]);

// 搜索表单
const searchForm = ref({
  keyword: '',
});

// 分页配置
const pagination = reactive({
  page: 1,
  rowsPerPage: 10,
  total: 0
});

// 表格列配置
const columns = [
  {
    name: "skuInfo",
    required: true,
    label: "SKU信息",
    align: "left",
    field: (row) => row?.sku || '',
    style: "width: 40%"
  },
  { 
    name: "spec", 
    label: "实际规格", 
    field: row => `${row.warehouse_size_length || 0}*${row.warehouse_size_width || 0}*${row.warehouse_size_height || 0} cm\n${row.warehouse_weight || 0} g`,
    align: "center",
    style: "width: 30%"
  },
  { 
    name: "stock", 
    label: "可用库存", 
    field: 'available_qty',
    align: "right",
    style: "width: 30%"
  }
];

// 获取库存列表
const fetchStocksList = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.page,
      page_size: pagination.rowsPerPage,
      keyword: searchForm.value.keyword
    };
    
    const response = await api.getStocksList(params);
    if (response.success) {
      // 过滤掉可用库存为0的商品
      tableData.value = (response.data.items || []).filter(item => item.available_qty > 0);
      pagination.total = response.data.meta.total || 0;
    } else {
      console.error('获取库存列表失败:', response.message);
      $q.notify({
        type: 'negative',
        message: `${t('获取库存列表失败')}: ${response.message}`
      });
    }
  } catch (error) {
    console.error('获取库存列表出错:', error);
    $q.notify({
      type: 'negative',
      message: t('网络错误，请稍后重试')
    });
  } finally {
    loading.value = false;
  }
};

// 处理搜索
const handleSearch = () => {
  pagination.page = 1;
  fetchStocksList();
};

// 处理分页变更
const handlePageChange = ({ page, rowsPerPage }) => {
  pagination.page = page;
  pagination.rowsPerPage = rowsPerPage;
  fetchStocksList();
};

// 处理取消
const handleCancel = () => {
  dialogVisible.value = false;
  selected.value = [];
  emit('cancel');
};

// 处理确认
const handleConfirm = () => {
  if (selected.value.length === 0) {
    $q.notify({
      type: 'warning',
      message: t('请至少选择一个商品')
    });
    return;
  }
  
  emit('selected', selected.value);
  dialogVisible.value = false;
  selected.value = [];
};

// 打开弹窗
const open = () => {
  dialogVisible.value = true;
  pagination.page = 1;
  selected.value = [];
  searchForm.value.keyword = '';
  fetchStocksList();
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