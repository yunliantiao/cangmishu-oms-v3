<template>
  <div class="product-spu">
    <!-- 表格 -->
    <q-table
      :rows="rows"
      :columns="columns"
      row-key="id"
      v-model:selected="selected"
      selection="multiple"
      hide-pagination
      flat
      bordered
      :loading="loading"
    >
      <!-- 加载动画插槽 -->
      <template v-slot:loading>
        <q-inner-loading showing color="primary">
          <q-spinner-dots size="50px" />
        </q-inner-loading>
      </template>

      <!-- 无数据时的显示 -->
      <template v-slot:no-data>
        <div v-if="!loading && (!rows || rows.length === 0)" class="full-width row flex-center q-my-lg">
          <span class="text-grey">{{ t('暂无数据') }}</span>
        </div>
      </template>

      <template v-slot:header="props">
        <q-tr :props="props">
          <q-th style="width: 48px; padding: 0 4px">
            <q-btn
              size="sm"
              color="grey-7"
              flat
              dense
              disable
              icon="keyboard_arrow_right"
            />
          </q-th>
          <q-th auto-width style="padding: 0 8px">
            <q-checkbox color="primary" v-model="props.selected" />
          </q-th>
          <q-th v-for="col in props.cols" :key="col.name" :props="props" :style="col.style">
            {{ col.label }}
          </q-th>
        </q-tr>
      </template>

      <!-- 展开的子表格 -->
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td style="width: 48px; padding: 0 4px">
            <q-btn
              size="sm"
              color="grey-7"
              flat
              dense
              @click="props.expand = !props.expand"
              :icon="props.expand ? 'keyboard_arrow_down' : 'keyboard_arrow_right'"
            />
          </q-td>
          <q-td auto-width style="padding: 0 8px">
            <q-checkbox color="primary" v-model="props.selected" />
          </q-td>
          <!-- SPU信息 -->
          <q-td key="spuInfo" :style="columns.find(col => col.name === 'spuInfo').style">
            <div class="row no-wrap items-center">
              <div class="q-mr-sm">
                <img 
                  :src="props.row?.main_image" 
                  style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;"
                />
              </div>
              <div class="ellipsis">
                <div>{{ props.row?.name || '-' }}</div>
                <div>{{ t('SPU') }}: {{ props.row?.id || '-' }}</div>
              </div>
            </div>
          </q-td>
          <q-td key="category" class="text-center" :style="columns.find(col => col.name === 'category').style">
            {{ props.row?.category || '-' }}
          </q-td>
          <q-td key="creator" class="text-center" :style="columns.find(col => col.name === 'creator').style">
            {{ props.row?.creator || '-' }}
          </q-td>
          <q-td key="createTime" class="text-center" :style="columns.find(col => col.name === 'createTime').style">
            {{ props.row?.updated_at || '-' }}
          </q-td>
          <q-td key="operations" class="text-center" :style="columns.find(col => col.name === 'operations').style">
            <q-btn
              flat
              round
              color="primary"
              icon="edit"
              size="sm"
              @click="handleEdit(props.row)"
            />
            <q-btn
              flat
              round
              color="negative"
              icon="delete"
              size="sm"
              @click="handleSingleDelete(props.row)"
            />
          </q-td>
        </q-tr>

        <!-- 展开后的SKU表格 -->
        <q-tr v-show="props.expand" :props="props">
          <q-td colspan="100%">
            <div class="q-pa-md">
              <q-table
                :rows="props.row.specs || []"
                :columns="skuColumns"
                row-key="id"
                flat
                bordered
                hide-pagination
                class="sku-table"
              >
                <template v-slot:body-cell-skuInfo="slotProps">
                  <q-td :props="slotProps">
                    <div class="row no-wrap items-center">
                      <div class="q-mr-sm">
                        <img 
                          :src="slotProps.row?.image" 
                          style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;"
                        />
                      </div>
                      <div class="ellipsis">
                        <div>{{ t('SKU') }}: {{ slotProps.row?.sku || '-' }}</div>
                        <div class="ellipsis">{{ t('名称') }}: {{ slotProps.row?.product?.name || '-' }}</div>
                        <div>{{ t('规格') }}: {{ slotProps.row?.name || '-' }}</div>
                      </div>
                    </div>
                  </q-td>
                </template>

                <template v-slot:body-cell-applySpec="slotProps">
                  <q-td :props="slotProps" style="white-space: pre-line; text-align: center">
                    {{ `${slotProps.row.size_length || 0}*${slotProps.row.size_width || 0}*${slotProps.row.size_height || 0} cm\n${slotProps.row.weight || 0} g` }}
                  </q-td>
                </template>

                <template v-slot:body-cell-realSpec="slotProps">
                  <q-td :props="slotProps" style="white-space: pre-line; text-align: center">
                    {{ `${slotProps.row.warehouse_size_length || 0}*${slotProps.row.warehouse_size_width || 0}*${slotProps.row.warehouse_size_height || 0} cm\n${slotProps.row.warehouse_weight || 0} g` }}
                  </q-td>
                </template>

                <template v-slot:body-cell-timeInfo="slotProps">
                  <q-td :props="slotProps" style="text-align: center">
                    <div>{{ t('创建') }}: 2025-03-31 02:42</div>
                    <div>{{ t('更新') }}: 2025-03-31 18:27</div>
                  </q-td>
                </template>

                <template v-slot:body-cell-operations="slotProps">
                  <q-td :props="slotProps" style="text-align: center">
                    <q-btn
                      flat
                      round
                      color="primary"
                      icon="edit"
                      size="sm"
                      @click="$emit('edit', slotProps.row)"
                    />
                    <q-btn
                      flat
                      round
                      color="primary"
                      icon="content_copy"
                      size="sm"
                      @click="$emit('copy', slotProps.row)"
                    />
                  </q-td>
                </template>
              </q-table>
            </div>
          </q-td>
        </q-tr>
      </template>

      <!-- 底部选中记录数显示 -->
      <template v-slot:bottom v-if="selected.length > 0">
        <div class="q-pa-sm text-grey-8 text-center">
          {{ t('已选择') }} {{ selected.length }} {{ t('条记录') }}
        </div>
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits, defineExpose } from "vue";
import { useQuasar } from "quasar";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import api from '@/api/index';

const router = useRouter();
const $q = useQuasar();
const { t } = useI18n();

const props = defineProps({
  rows: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits([
  "add",
  "edit",
  "copy",
  "delete",
  "print",
  "import",
  "page-change",
  "void"
]);

// 表格数据
const selected = ref([]);

// SPU表格列定义
const columns = [
  {
    name: "spuInfo",
    required: true,
    label: t("SPU信息"),
    align: "left",
    field: (row) => row.name,
    style: "width: 25%"
  },
  {
    name: "category",
    label: t("分类"),
    field: "category",
    align: "center",
    style: "width: 20%"
  },
  {
    name: "creator",
    label: t("创建人员"),
    field: "creator",
    align: "center",
    style: "width: 20%"
  },
  {
    name: "createTime",
    label: t("创建时间"),
    field: "updated_at",
    align: "center",
    style: "width: 20%"
  },
  {
    name: "operations",
    label: t("操作"),
    align: "center",
    style: "width: 15%"
  }
];

// SKU表格列定义
const skuColumns = [
  {
    name: "skuInfo",
    required: true,
    label: t("SKU信息"),
    align: "left",
    field: (row) => row?.sku || '',
    style: "width: 35%"
  },
  { 
    name: "applySpec", 
    label: t("申报规格"), 
    field: row => `${row.size_length || 0}*${row.size_width || 0}*${row.size_height || 0} cm\n${row.weight || 0} g`, 
    align: "center",
    style: "width: 20%"
  },
  { 
    name: "realSpec", 
    label: t("实际规格"), 
    field: row => `${row.warehouse_size_length || 0}*${row.warehouse_size_width || 0}*${row.warehouse_size_height || 0} cm\n${row.warehouse_weight || 0} g`,
    align: "center",
    style: "width: 20%"
  },
  { 
    name: "timeInfo", 
    label: t("时间"), 
    align: "center",
    format: () => ({
      created: "2025-03-31 02:42",
      updated: "2025-03-31 18:27"
    }),
    style: "width: 15%"
  },
  { 
    name: "operations", 
    label: t("操作"), 
    align: "center",
    style: "width: 10%"
  }
];

// 处理编辑按钮点击
const handleEdit = (row) => {
  router.push(`/product/addproduct?id=${row.id}`);
};

// 处理删除
const handleDelete = async () => {
  if (selected.value.length === 0) {
    $q.notify({
      message: t("请选择要删除的商品"),
      color: "warning",
    });
    return;
  }
  
  $q.dialog({
    title: t("确认删除"),
    message: t("确定要删除选中的") + ` ${selected.value.length} ` + t("个商品吗？"),
    cancel: {
      label: t('取消'),
      flat: true
    },
    ok: {
      label: t('确认'),
      color: 'negative'
    },
    persistent: true,
  }).onOk(async () => {
    try {
      const response = await api.delProduct({
        ids: selected.value.map(item => item.id)
      });
      
      if (response.success) {
        selected.value = []; // 清空选中
        emit("refresh"); // 刷新列表
      }
    } catch (error) {
      console.error(t('删除失败') + ':', error);
    }
  });
};

// 处理单个删除
const handleSingleDelete = (row) => {
  $q.dialog({
    title: t("确认删除"),
    message: t("确定要删除该商品吗？"),
    cancel: {
      label: t('取消'),
      flat: true
    },
    ok: {
      label: t('确认'),
      color: 'negative'
    },
    persistent: true,
  }).onOk(async () => {
    try {
      const response = await api.delProduct({
        ids: [row.id]
      });
      
      if (response.success) {
        emit("refresh"); // 刷新列表
      }
    } catch (error) {
      console.error(t('删除失败') + ':', error);
    }
  });
};

// 暴露选中数据和方法给父组件
defineExpose({
  selected,
  handleDelete,
  handleEdit
});
</script>

<style lang="scss" scoped>
.product-spu {
  width: 100%;

  :deep(.q-table) {
    table {
      table-layout: fixed;
    }
    
    .q-td, .q-th {
      padding: 8px;
      overflow: hidden;
    }

    .q-table__top {
      padding: 0;
    }

    thead tr th {
      position: relative;
      background: #f5f5f5;
    }
  }

  .sku-table {
    width: 100%;
    margin: 0;
  }

  .ellipsis {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 400px;
  }
}
</style> 