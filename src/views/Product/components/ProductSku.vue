<template>
  <div class="product-sku">
    <!-- 编辑弹窗 -->
    <edit-sku-dialog ref="editDialog" @success="$emit('refresh')" />

    <!-- 打印标签弹窗 -->
    <print-label-dialog v-model="printDialogVisible" :sku-list="selected" @success="handlePrintSuccess" />

    <!-- 表格 -->
    <q-table
      :rows="rows"
      :columns="columns"
      row-key="id"
      v-model:selected="selected"
      :pagination="tablePagination"
      selection="multiple"
      hide-pagination
      flat
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
                  :src="
                    props.row?.image || 'https://testoms.cangmishu.com/api/uploads/52331320-d813-40d8-a6db-3cf28f4938b1'
                  "
                  style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px"
                />
              </div>
              <div class="flex-c-start-start gap-6" style="white-space: normal; width: 300px">
                <div class="text-primary hover-copy" @click="$copy(props.row.sku)">
                  SKU: {{ props.row?.sku || '-' }}
                </div>
                <div class="text-overflow-1">
                  {{ props.row?.product?.name || '-' }}
                  <q-tooltip>{{ props.row?.product?.name }}</q-tooltip>
                </div>
                <div>{{ t('规格') }}: {{ props.row?.name || '-' }}</div>
              </div>
            </div>
          </q-td>
          <q-td key="applySpec" class="text-center" style="white-space: pre-line">
            {{
              `${props.row?.size_length || 0}*${props.row?.size_width || 0}*${props.row?.size_height || 0} cm\n${
                props.row?.weight || 0
              } g`
            }}
          </q-td>
          <q-td key="realSpec" class="text-center" style="white-space: pre-line">
            {{
              `${props.row?.warehouse_size_length || 0}*${props.row?.warehouse_size_width || 0}*${
                props.row?.warehouse_size_height || 0
              } cm\n${props.row?.warehouse_weight || 0} g`
            }}
          </q-td>
          <q-td key="timeInfo" class="text-center">
            <div>{{ t('创建') }}: {{ props.row?.created_at || '-' }}</div>
            <div>{{ t('更新') }}: {{ props.row?.updated_at || '-' }}</div>
          </q-td>
          <q-td key="operations" class="text-center">
            <q-btn flat round color="primary" icon="edit" size="sm" @click="handleEdit(props.row)">
              <q-tooltip>{{ t('编辑') }}</q-tooltip>
            </q-btn>
            <q-btn flat round color="negative" icon="delete" size="sm" @click="handleSingleDelete(props.row)">
              <q-tooltip>{{ t('删除') }}</q-tooltip>
            </q-btn>
          </q-td>
        </q-tr>
      </template>

      <!-- 底部选中记录数显示 -->
      <template v-slot:bottom v-if="selected.length">
        <div v-if="selected.length > 0" class="q-pa-sm text-grey-8 text-center">
          {{ t('已选择') }} {{ selected.length }} {{ t('条记录') }}
        </div>
      </template>
    </q-table>
  </div>
</template>

<script setup>
import api from '@/api/index';
import { useQuasar } from 'quasar';
import { defineEmits, defineExpose, defineProps, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import EditSkuDialog from './EditSkuDialog.vue';
import PrintLabelDialog from './PrintLabelDialog.vue';

const { t } = useI18n();
const $q = useQuasar();

const props = defineProps({
  rows: {
    type: Array,
    required: true,
  },
  totalCount: {
    type: Number,
    required: true,
  },
  maxPage: {
    type: Number,
    required: true,
  },
  loading: {
    type: Boolean,
    default: false,
  },
});

// 表格分页配置
const tablePagination = ref({
  sortBy: '',
  descending: false,
  page: 1,
  rowsPerPage: 0, // 设置为0以禁用表格内置分页
});

const emit = defineEmits(['add', 'edit', 'copy', 'delete', 'print', 'import', 'page-change', 'void']);

// 表格数据
const selected = ref([]);
const columns = [
  {
    name: 'skuInfo',
    required: true,
    label: t('SKU信息'),
    align: 'left',
    field: (row) => row?.sku || '',
    style: 'width: 25%',
  },
  {
    name: 'applySpec',
    label: t('申请规格'),
    field: (row) => `${row.size_length || 0}*${row.size_width || 0}*${row.size_height || 0} cm\n${row.weight || 0} g`,
    align: 'center',
    style: 'width: 20%',
  },
  {
    name: 'realSpec',
    label: t('实际规格'),
    field: (row) =>
      `${row.warehouse_size_length || 0}*${row.warehouse_size_width || 0}*${row.warehouse_size_height || 0} cm\n${
        row.warehouse_weight || 0
      } g`,
    align: 'center',
    style: 'width: 20%',
  },
  {
    name: 'timeInfo',
    label: t('时间'),
    align: 'center',
    style: 'width: 25%',
  },
  {
    name: 'operations',
    label: t('操作'),
    align: 'center',
    style: 'width: 10%',
  },
];

// 编辑弹窗引用
const editDialog = ref(null);

// 打印相关
const printDialogVisible = ref(false);

// 处理编辑按钮点击
const handleEdit = (row) => {
  editDialog.value.open(row.id);
};

// 处理删除
const handleDelete = async () => {
  if (selected.value.length === 0) {
    $q.notify({
      message: t('请选择要删除的商品'),
      color: 'warning',
    });
    return;
  }

  $q.dialog({
    title: t('确认删除'),
    message: t('确定要删除选中的') + ` ${selected.value.length} ` + t('个商品吗？'),
    cancel: {
      label: t('取消'),
      flat: true,
    },
    ok: {
      label: t('确认'),
      color: 'negative',
    },
    persistent: true,
  }).onOk(async () => {
    try {
      const response = await api.delSKU({
        ids: selected.value.map((item) => item.id),
      });

      if (response.success) {
        selected.value = []; // 清空选中
        emit('refresh'); // 刷新列表
      }
    } catch (error) {
      console.error(t('删除失败') + ':', error);
    }
  });
};

// 处理单个删除
const handleSingleDelete = (row) => {
  $q.dialog({
    title: t('确认删除'),
    message: t('确定要删除该商品吗？'),
    cancel: {
      label: t('取消'),
      flat: true,
    },
    ok: {
      label: t('确认'),
      color: 'negative',
    },
    persistent: true,
  }).onOk(async () => {
    try {
      const response = await api.delSKU({
        ids: [row.id],
      });

      if (response.success) {
        emit('refresh'); // 刷新列表
      }
    } catch (error) {
      console.error(t('删除失败') + ':', error);
    }
  });
};

// 处理作废
const handleVoid = () => {
  if (selected.value.length === 0) {
    $q.notify({
      message: t('请选择要作废的商品'),
      color: 'warning',
    });
    return;
  }

  console.log(t('选中的商品') + ':', selected.value);

  $q.dialog({
    title: t('确认作废'),
    message: t('确定要作废选中的') + ` ${selected.value.length} ` + t('个商品吗？'),
    cancel: true,
    persistent: true,
  }).onOk(() => {
    emit('void', selected.value);
  });
};

// 处理打印标签
const handlePrint = () => {
  if (selected.value.length === 0) {
    $q.notify({
      message: t('请选择要打印的商品'),
      color: 'warning',
    });
    return;
  }
  console.log(t('选中的商品') + ':', selected.value);
  
  printDialogVisible.value = true;
};

// 处理打印成功
const handlePrintSuccess = () => {
  selected.value = []; // 清空选中
};

// 暴露选中数据和方法给父组件
defineExpose({
  selected,
  handleDelete,
  handleEdit,
  handlePrint,
});
</script>

<style lang="scss" scoped>
.product-sku {
  width: 100%;
}

.preview-box {
  .preview-content {
    border: 1px solid #ddd;
    border-radius: 4px;
    height: 200px;
    background: #f5f5f5;

    &.roll {
      // 卷纸预览样式
    }

    &.flat {
      // 平面纸预览样式
    }
  }
}

.text-red {
  color: #ff0000;
}
</style>
