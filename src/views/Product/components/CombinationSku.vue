<template>
  <div class="product-sku">
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
    >
      <template v-slot:body-cell-skuInfo="props">
        <q-td :props="props">
          <div class="row items-center">
            <q-avatar size="50px" class="q-mr-sm">
              <img :src="props.row.img" />
            </q-avatar>
            <div>
              <div>组合SKU: {{ props.row.sku }}</div>
              <div>关联SKU: {{ props.row.applySpec }}</div>
            </div>
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-associatingSku="props">
        <q-td :props="props">
          <div class="cursor-pointer sku-info">
            C-001 ×2
            <q-tooltip persistent class="bg-white text-dark" max-width="400px" anchor="bottom middle" self="top middle">
              <q-card flat bordered class="no-shadow">
                <q-card-section class="q-pa-xs">
                  <q-table
                    :rows="getRelatedSkus(props.row)"
                    :columns="relatedSkuColumns"
                    row-key="id"
                    hide-pagination
                    hide-bottom
                    flat
                    bordered
                    dense
                    class="related-sku-table"
                  >
                    <template v-slot:header="props">
                      <q-tr :props="props">
                        <q-th key="img" class="text-center">图片</q-th>
                        <q-th key="skuInfo" class="text-left">商品SKU/名称</q-th>
                        <q-th key="quantity" class="text-center">数量</q-th>
                      </q-tr>
                    </template>
                    <template v-slot:body="props">
                      <q-tr :props="props">
                        <q-td key="img" class="text-center">
                          <q-img
                            :src="props.row.img"
                            spinner-color="primary"
                            style="height: 40px; width: 40px"
                            class="rounded-borders"
                          />
                        </q-td>
                        <q-td key="skuInfo" class="text-left">
                          <div>SKU:{{ props.row.sku }}</div>
                          <div class="text-caption">{{ props.row.name }}</div>
                        </q-td>
                        <q-td key="quantity" class="text-center">
                          <div>×{{ props.row.quantity }}</div>
                        </q-td>
                      </q-tr>
                    </template>
                  </q-table>
                </q-card-section>
              </q-card>
            </q-tooltip>
          </div>
        </q-td>
      </template>

      <template v-slot:body-cell-operations="props">
        <q-td :props="props">
          <q-btn
            flat
            round
            color="primary"
            icon="edit"
            size="sm"
            @click="$emit('edit', props.row)"
          />
          <q-btn
            flat
            round
            color="primary"
            icon="content_copy"
            size="sm"
            @click="$emit('copy', props.row)"
          />
        </q-td>
      </template>

      <!-- 底部选中记录数显示 -->
      <template v-slot:bottom>
        <div v-if="selected.length > 0" class="q-pa-sm text-grey-8">
          已选择 {{ selected.length }} 条记录
        </div>
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from "vue";
import { useQuasar } from "quasar";

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
});

const emit = defineEmits([
  "add",
  "edit",
  "copy",
  "delete",
  "print",
  "import",
  "page-change",
]);

// 表格数据
const selected = ref([]);
const columns = [
  {
    name: "skuInfo",
    required: true,
    label: "组合SKU信息",
    align: "left",
    field: (row) => row.sku,
  },
  { name: "associatingSku", label: "关联SKU信息", field: "associatingSku", align: "center" },
  { name: "timeInfo", label: "时间", field: "createTime", align: "center" },
  { name: "operations", label: "操作", align: "center" },
];

// 关联SKU表格列定义
const relatedSkuColumns = [
  {
    name: "img",
    label: "图片",
    field: "img",
    align: "center",
  },
  {
    name: "skuInfo",
    label: "商品SKU/名称",
    field: "sku",
    align: "left",
  },
  {
    name: "quantity",
    label: "数量",
    field: "quantity", 
    align: "center",
  }
];

// 获取关联SKU数据
const getRelatedSkus = (row) => {
  // 这里应该从props.row中获取关联SKU数据
  // 由于示例数据可能不包含这个信息，这里使用模拟数据
  return [
    {
      id: 1,
      sku: "C-001",
      name: "豹点纹毛衣外套",
      img: "https://cdn.quasar.dev/img/mountains.jpg",
      quantity: 2
    },
    {
      id: 2,
      sku: "C-002",
      name: "蓝色T恤",
      img: "https://cdn.quasar.dev/img/parallax2.jpg",
      quantity: 1
    }
  ];
};

// 处理删除
const handleDelete = () => {
  if (selected.value.length === 0) {
    $q.notify({
      message: "请选择要删除的商品",
      color: "warning",
    });
    return;
  }
  $q.dialog({
    title: "确认删除",
    message: `确定要删除选中的 ${selected.value.length} 个商品吗？`,
    cancel: true,
    persistent: true,
  }).onOk(() => {
    emit("delete", selected.value);
  });
};
</script>

<style lang="scss" scoped>
.product-sku {
  width: 100%;
  
  .sku-info {
    position: relative;
    display: inline-block;
    padding: 4px 8px;
    border-radius: 4px;
    
    &:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }
  }
  
  .related-sku-table {
    min-width: 300px;
    
    :deep(.q-table) {
      th, td {
        padding: 4px 8px;
      }
      
      th {
        font-weight: 500;
        background-color: #f5f5f5;
      }
    }
  }
}
</style>