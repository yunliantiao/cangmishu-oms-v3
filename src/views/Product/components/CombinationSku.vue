<template>
  <div class="combo-sku">
    <q-table
      :rows="rows"
      :columns="columns"
      row-key="id"
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
          <q-th v-for="col in props.cols" :key="col.name" :props="props" :style="col.style">
            {{ col.label }}
          </q-th>
        </q-tr>
      </template>

      <!-- 主表格和展开的子表格 -->
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
          <!-- 组合SKU信息 -->
          <q-td key="comboInfo" :style="columns.find(col => col.name === 'comboInfo').style">
            <div class="row no-wrap items-center">
              <div class="q-mr-sm">
                <img 
                  :src="props.row.image" 
                  style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;"
                />
              </div>
              <div class="ellipsis">
                <div>{{ t('SKU') }}: {{ props.row.code }}</div>
                <div>{{ props.row.name }}</div>
                <!-- <div>{{ t('销售价格') }}: ￥{{ props.row.sale_price }}</div> -->
              </div>
            </div>
          </q-td>
          <q-td key="timeInfo" class="text-center" :style="columns.find(col => col.name === 'timeInfo').style">
            <div>{{ t('创建') }}: {{ props.row.created_at }}</div>
            <div>{{ t('更新') }}: {{ props.row.updated_at }}</div>
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
              @click="handleDelete(props.row)"
            />
          </q-td>
        </q-tr>

        <!-- 展开后的关联SKU表格 -->
        <q-tr v-show="props.expand" :props="props">
          <q-td colspan="100%">
            <div class="q-pa-md">
              <q-table
                :rows="props.row.specs || []"
                :columns="specColumns"
                row-key="id"
                flat
                bordered
                hide-pagination
                class="spec-table"
              >
                <template v-slot:body-cell-skuInfo="slotProps">
                  <q-td :props="slotProps">
                    <div class="row no-wrap items-center">
                      <div class="q-mr-sm">
                        <img 
                          :src="slotProps.row.spec?.image" 
                          style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;"
                        />
                      </div>
                      <div class="ellipsis">
                        <div>{{ t('SKU') }}: {{ slotProps.row.spec?.sku }}</div>
                        <div class="ellipsis">{{ t('名称') }}: {{ slotProps.row.spec?.product?.name }}</div>
                        <div>{{ t('规格') }}: {{ slotProps.row.spec?.name }}</div>
                      </div>
                    </div>
                  </q-td>
                </template>

                <template v-slot:body-cell-spec="slotProps">
                  <q-td :props="slotProps" style="white-space: pre-line; text-align: center">
                    {{ `${slotProps.row.spec?.size_length || 0}*${slotProps.row.spec?.size_width || 0}*${slotProps.row.spec?.size_height || 0} cm` }}
                  </q-td>
                </template>

                <template v-slot:body-cell-quantity="slotProps">
                  <q-td :props="slotProps" class="text-center">
                    {{ slotProps.row.quantity }}
                  </q-td>
                </template>
              </q-table>
            </div>
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
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

const emit = defineEmits(['refresh']);

// 主表格列定义
const columns = [
  {
    name: "comboInfo",
    required: true,
    label: t("组合SKU信息"),
    align: "left",
    field: row => row.code,
    style: "width: 60%"
  },
  {
    name: "timeInfo",
    label: t("时间"),
    field: "created_at",
    align: "center",
    style: "width: 25%"
  },
  {
    name: "operations",
    label: t("操作"),
    align: "center",
    style: "width: 15%"
  }
];

// 关联SKU表格列定义
const specColumns = [
  {
    name: "skuInfo",
    required: true,
    label: t("SKU信息"),
    align: "left",
    field: row => row.spec?.sku,
    style: "width: 60%"
  },
  {
    name: "spec",
    label: t("规格"),
    field: row => `${row.spec?.size_length || 0}*${row.spec?.size_width || 0}*${row.spec?.size_height || 0}`,
    align: "center",
    style: "width: 20%"
  },
  {
    name: "quantity",
    label: t("数量"),
    field: "quantity",
    align: "center",
    style: "width: 20%"
  }
];

// 处理编辑
const handleEdit = (row) => {
  router.push(`/product/addcombo?id=${row.id}`);
};

// 处理删除
const handleDelete = (row) => {
  $q.dialog({
    title: t("确认删除"),
    message: t("确定要删除该组合商品吗？"),
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
      const response = await api.delCombo(row.id);
      if (response.success) {
        $q.notify({
          type: 'positive',
          message: t('删除成功')
        });
        emit("refresh"); // 触发刷新事件
      }
    } catch (error) {
      console.error(t('删除失败') + ':', error);
      $q.notify({
        type: 'negative',
        message: t('删除失败')
      });
    }
  });
};
</script>

<style lang="scss" scoped>
.combo-sku {
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

  .spec-table {
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