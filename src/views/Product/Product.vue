<template>
  <div class="product">
    <!-- 添加导入弹窗组件 -->
    <import-dialog
      ref="importDialogRef"
      :type="importType"
      @success="handleImportSuccess"
    />

    <!-- 搜索过滤区域 -->
    <div class="row product-search items-center">
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
              readonly
              class="date-input start-date"
              style="border: none"
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
              readonly
              class="date-input end-date"
              style="border: none"
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
      </div>

      <div class="q-ml-md">
        <q-btn color="primary" :label="t('搜索')" @click="handleSearch" />
      </div>
    </div>

    <!-- 选项卡 -->
    <div class="product-container">
      <div class="q-mb-md">
        <q-tabs
          v-model="tab"
          dense
          class="text-grey"
          active-color="primary"
          indicator-color="primary"
          narrow-indicator
          align="left"
        >
          <q-tab name="sku" :label="t('SKU')" />
          <q-tab name="spu" :label="t('SPU')" />
          <q-tab name="combo" :label="t('组合SKU')" />
        </q-tabs>
      </div>
      <!-- 操作区域 -->
      <div class="row q-mb-md items-center">
        <!-- <div class="col-auto q-mr-sm">
        选择 <span class="text-primary">{{ selected.length }}</span>
      </div> -->
        <q-btn
          v-if="tab === 'sku'"
          outline
          :label="t('打印标签')"
          color="primary"
          class="q-mr-sm"
          icon="print"
          @click="handlePrint"
        />
        <q-btn
          v-if="tab !== 'combo'"
          outline
          :label="t('批量删除')"
          color="negative"
          class="q-mr-sm"
          icon="delete"
          @click="handleDelete"
        />

        <div class="col"></div>

        <q-btn
          @click="handleAddProduct"
          :label="t('添加')"
          color="primary"
          class="q-mr-sm"
          icon="add"
        />
        <q-btn-dropdown color="primary" :label="t('导入')" icon="file_download">
          <q-list>
            <q-item clickable v-close-popup @click="handleImport('spu')">
              <q-item-section>
                <q-item-label>{{ t('导入SPU') }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="handleImport('combo')">
              <q-item-section>
                <q-item-label>{{ t('导入组合SKU') }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </div>

      <!-- 产品表格sku -->
      <ProductSku
        v-if="tab === 'sku'"
        ref="productSkuRef"
        :rows="productData"
        :total-count="productData.length"
        :loading="loading"
        @add="handleAddProduct"
        @copy="handleCopyProduct"
        @delete="handleDeleteProducts"
        @refresh="fetchData"
      >
      </ProductSku>

      <!-- 产品表格spu -->
      <ProductSpu 
        v-if="tab === 'spu'" 
        ref="productSpuRef"
        :rows="productData"
        :loading="loading"
        @refresh="fetchData"
      />

      <!-- 产品表格组合SKU -->
      <CombinationSku 
        v-if="tab === 'combo'" 
        ref="combinationSkuRef"
        :rows="productData" 
        :loading="loading"
        @refresh="fetchData"
      />

      <!-- 分页 -->
      <div class="q-mt-md">
        <Pagination
          :total-count="pagination.total"
          v-model:page="pagination.page"
          :max-page="pagination.lastPage"
          v-model:rows-per-page="pagination.rowsPerPage"
          @page-change="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import ProductSku from "./components/ProductSku.vue";
import ProductSpu from "./components/ProductSpu.vue";
import CombinationSku from "./components/CombinationSku.vue";
import Pagination from "@/components/Pagination.vue";
import ImportDialog from "@/components/ImportDialog.vue";
import api from "@/api/index";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const $q = useQuasar();
const router = useRouter();

// 加载状态
const loading = ref(false);

// 筛选条件
const filters = ref({
  date_type: 'created_at',
  start_date: '',
  end_date: '',
  search_type: 'name',
  keywords: '',
  search_mode: 'exact'
});

// 日期类型选项
const dateTypeOptions = [
  { label: t('创建时间'), value: 'created_at' },
  { label: t('更新时间'), value: 'updated_at' }
];

// 搜索类型选项
const searchTypeOptions = [
  { label: t('名字搜索'), value: 'name' },
  { label: t('SKU搜索'), value: 'sku' }
];

// 搜索模式选项
const searchModeOptions = [
  { label: t('精确搜索'), value: 'exact' },
  { label: t('模糊搜索'), value: 'like' },
  { label: t('前缀搜索'), value: 'prefix' }
];

// 选项卡
const tab = ref("sku");

// 表格数据
const productData = ref([]);

// 分页
const pagination = ref({
  page: 1,
  rowsPerPage: 50,
  total: 0,
  lastPage: 1,
});



// 根据当前标签获取对应数据
const fetchData = async () => {
  // 防止重复请求
  if (loading.value) return;
  
  // 清空数据
  productData.value = [];
  loading.value = true;
  
  try {
    // 确保页码和每页数量始终是有效的数字
    const page = parseInt(pagination.value.page) || 1;
    const pageSize = parseInt(pagination.value.rowsPerPage) || 50;
    
    const params = {
      page,
      per_page: pageSize,
      date_type: filters.value.date_type,
      start_date: filters.value.start_date,
      end_date: filters.value.end_date,
      search_type: filters.value.search_type,
      keywords: filters.value.keywords,
      search_mode: filters.value.search_mode
    };
    
    console.log('请求参数:', params);
    
    let response;
    
    // 根据当前标签页选择不同的API
    if (tab.value === 'sku') {
      response = await api.getSkuList(params);
    } else if (tab.value === 'spu') {
      response = await api.getProductList(params);
    } else if (tab.value === 'combo') {
      response = await api.getComboList(params);
    }
    console.log('response',response);
    
    if (response && response.success) {
      productData.value = response.data.items || response.data.data || [];
      
      // 处理分页信息
      const meta = response.data.meta || {};
      pagination.value.total = meta.total || 0;
      pagination.value.lastPage = meta.last_page || 1;
      pagination.value.page = meta.current_page || 1;
      pagination.value.rowsPerPage = meta.per_page || 50;
      
      console.log('获取数据成功:', productData.value);
      console.log('分页信息:', pagination.value);
    } else {
      console.error('获取数据失败:', response?.message);
    }
  } catch (error) {
    console.error('请求出错:', error);
  } finally {
    loading.value = false;
  }
};

// 监听标签页变化
watch(tab, () => {
  pagination.value.page = 1; // 切换标签页时重置为第一页
  fetchData();
});

// 组件挂载时执行一次数据获取
onMounted(() => {
  fetchData();
});

// 处理添加产品
const handleAddProduct = () => {
  if (tab.value === 'combo') {
    router.push("/product/addcombo");
  } else {
    router.push("/product/addproduct");
  }
};

// 处理编辑产品
const handleEditProduct = (product) => {
  router.push(`/product/addproduct?id=${product.id}`);
};

// 处理复制产品
const handleCopyProduct = (product) => {
  $q.notify({
    message: t('复制产品') + `: ${product.sku}`,
    color: "info",
  });
};

// 处理删除产品
const handleDeleteProducts = (products) => {
  $q.notify({
    message: t('已删除') + ` ${products.length} ` + t('个产品'),
    color: "positive",
  });
};

// 处理删除
const handleDelete = () => {
  // 根据当前标签页调用对应组件的删除方法
  if (tab.value === 'sku') {
    productSkuRef.value?.handleDelete();
  } else if (tab.value === 'spu') {
    productSpuRef.value?.handleDelete();
  }
};

// 处理打印标签
const handlePrint = () => {
  if (tab.value === 'sku') {
    productSkuRef.value?.handlePrint();
  }
};


// 导入相关
const importDialogRef = ref(null);
const importType = ref('');
// 处理导入
const handleImport = (type) => {
  importType.value = type;
  importDialogRef.value.open();
};

// 处理导入成功
const handleImportSuccess = () => {
  fetchData(); // 刷新列表
};

// 处理分页变更
const handlePageChange = ({ page, rowsPerPage }) => {
  console.log("页码变更:", page, "每页条数:", rowsPerPage);
  pagination.value.page = parseInt(page) || 1;
  pagination.value.rowsPerPage = parseInt(rowsPerPage) || 50;
  fetchData();
};

// 处理搜索按钮点击
const handleSearch = () => {
  pagination.value.page = 1; // 重置为第一页
  fetchData();
};

// 添加 ProductSku 组件的引用
const productSkuRef = ref(null);

// 添加 ProductSpu 组件的引用
const productSpuRef = ref(null);

// 添加 CombinationSku 组件的引用
const combinationSkuRef = ref(null);

</script>

<style lang="scss" scoped>
.product {
  .product-search {
    background-color: white;
    padding:16px;
    border-radius: 8px;

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
          border-radius: 0;
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
  }

  .product-container {
    background-color: white;
    padding: 16px;
    border-radius: 8px;
    margin-top: 16px;
  }
}
</style>
