<template>
  <div class="create-warehouse">
    <q-form @submit="submitForm" class="q-gutter-md">
      <!-- 标题 -->
      <div class="text-h5 q-mb-md">
        {{ isEdit ? t('编辑入库单') : t('创建入库单') }}
      </div>

      <!-- 主卡片 -->
      <q-card class="warehouse-card">
        <!-- 基本信息区域 -->
        <q-card-section>
          <div class="text-h6 q-mb-lg">{{ t('基本信息') }}</div>

          <div class="row q-col-gutter-md">
            <!-- 第一行 -->
            <div class="col-12 col-md-4">
              <!-- 到仓方式 -->
              <div class="form-item">
                <div class="form-item-label">
                  {{ t('到仓方式') }} <span class="text-negative">*</span>
                </div>
                <q-select
                  v-model="form.arrival_method"
                  :options="shippingMethodOptions"
                  outlined
                  dense
                  emit-value
                  map-options
                  option-value="value"
                  option-label="label"
                  :rules="[(val) => !!val || t('请选择到仓方式')]"
                  class="full-width"
                />
              </div>
            </div>

            <div class="col-12 col-md-4">
              <!-- 自定义单号 -->
              <div class="form-item">
                <div class="form-item-label">{{ t('自定义单号') }}</div>
                <q-input
                  v-model="form.custom_order_number"
                  outlined
                  dense
                  :placeholder="t('请输入')"
                  class="full-width"
                  maxlength="30"
                />
              </div>
            </div>

            <!-- 第二行 -->
            <div class="col-12 col-md-4">
              <!-- 运单号 -->
              <div class="form-item">
                <div class="form-item-label">{{ t('运单号') }}</div>
                <q-input
                  v-model="form.tracking_number"
                  outlined
                  dense
                  :placeholder="t('请输入')"
                  class="full-width"
                />
              </div>
            </div>

            <div class="col-12 col-md-4">
              <!-- 预计到达日期 -->
              <div class="form-item">
                <div class="form-item-label">{{ t('预计到达日期') }}</div>
                <date-picker
                  v-model="form.estimated_arrival_date"
                  :label="t('预计到达日期')"
                />
              </div>
            </div>

            <!-- 备注（跨越整行） -->
            <div class="col-12">
              <!-- 备注 -->
              <div class="form-item">
                <div class="form-item-label">{{ t('备注') }}</div>
                <q-input
                  v-model="form.remark"
                  outlined
                  dense
                  type="textarea"
                  :placeholder="t('请输入备注信息')"
                  class="full-width"
                  rows="4"
                  maxlength="200"
                />
              </div>
            </div>
          </div>
        </q-card-section>

        <!-- 分割线 -->
        <q-separator />

        <!-- 商品装箱区域 -->
        <q-card-section>
          <!-- 快递包裹模式 -->
          <div
            v-if="form.arrival_method === 'express_parcel'"
            class="express-mode"
          >
            <div class="row items-center q-mb-md">
              <!-- <q-input
                v-model="searchSkuText"
                outlined
                dense
                :placeholder="t('输入商品SKU或条形码')"
                style="width: 250px"
                class="q-mr-md"
              >
                <template v-slot:append>
                  <q-btn round dense flat icon="search" @click="searchSku" />
                </template>
              </q-input> -->
              <q-btn
                color="primary"
                :label="t('添加商品')"
                @click="openSkuDialog"
              />
            </div>

            <q-table
              :rows="expressSkuItems"
              :columns="expressSkuColumns"
              row-key="id"
              flat
              bordered
              dense
              hide-pagination
              class="express-table"
            >
              <!-- 加载动画插槽 -->
              <template v-slot:loading>
                <q-inner-loading showing color="primary">
                  <q-spinner-dots size="50px" />
                </q-inner-loading>
              </template>

              <!-- 无数据时的显示 -->
              <template v-slot:no-data>
                <div
                  v-if="
                    !loading &&
                    (!expressSkuItems || expressSkuItems.length === 0)
                  "
                  class="full-width row flex-center q-my-lg"
                >
                  <span class="text-grey">{{ t('暂无数据') }}</span>
                </div>
              </template>

              <template v-slot:header="props">
                <q-tr :props="props">
                  <q-th class="text-center">#</q-th>
                  <q-th class="text-left">{{ t('商品SKU') }}</q-th>
                  <q-th class="text-left">{{ t('商品名称') }}</q-th>
                  <q-th class="text-center">{{ t('数量') }}</q-th>
                  <q-th class="text-center">{{ t('操作') }}</q-th>
                </q-tr>
              </template>

              <template v-slot:body="props">
                <q-tr :props="props">
                  <q-td class="text-center">{{ props.rowIndex + 1 }}</q-td>
                  <q-td class="text-left">{{ props.row.sku }}</q-td>
                  <q-td class="text-left">{{ props.row.name }}</q-td>
                  <q-td class="text-center">
                    <q-input
                      v-model.number="props.row.quantity"
                      type="number"
                      outlined
                      dense
                      min="1"
                      style="width: 80px"
                    />
                  </q-td>
                  <q-td class="text-center">
                    <q-btn
                      flat
                      round
                      dense
                      color="negative"
                      icon="delete"
                      @click="removeExpressSku(props.rowIndex)"
                    />
                  </q-td>
                </q-tr>
              </template>
            </q-table>
          </div>

          <!-- 按箱模式（原有的装箱界面） -->
          <div v-else>
            <div class="text-h6 q-mb-md">
              {{ t('商品装箱') }}
              <span class="text-caption">{{ t('箱子总数') }}: {{ boxTotal }}</span>
            </div>
            <!-- 装箱模式选择 -->
            <!-- <div class="q-mb-md">
              <div class="form-item-label">装箱模式:</div>
              <div class="row q-gutter-x-md">
                <q-radio
                  v-model="packingMode"
                  val="box"
                  label="箱维度"
                  @update:model-value="handleModeChange"
                />
                <q-radio
                  v-model="packingMode"
                  val="sku"
                  label="SKU维度"
                  @update:model-value="handleModeChange"
                />
              </div>
            </div> -->
            <!-- 箱维度模式 -->
            <div v-if="packingMode === 'box'" class="box-mode">
              <q-table
                :rows="boxItems"
                :columns="boxModeColumns"
                row-key="id"
                flat
                bordered
                dense
                hide-pagination
                class="box-table"
              >
                <template v-slot:header="props">
                  <q-tr :props="props">
                    <q-th
                      v-for="col in props.cols"
                      :key="col.name"
                      :props="props"
                      :class="{ 'required-field': col.required }"
                    >
                      {{ t(col.label) }}
                      <span v-if="col.required" class="text-negative">*</span>
                    </q-th>
                  </q-tr>
                </template>

                <template v-slot:body-cell-boxNumber="props">
                  <q-td :props="props" class="text-center" style="height: 40px; line-height:40px;">
                    {{ getBoxNumberRange(props.rowIndex) }}
                  </q-td>
                </template>

                <template v-slot:body-cell-boxQuantity="props">
                  <q-td :props="props" style="height: 40px;">
                    <q-input
                      v-model.number="props.row.boxQuantity"
                      type="number"
                      dense
                      outlined
                      style="width: 100px;"
                    />
                  </q-td>
                </template>

                <template v-slot:body-cell-sku="props">
                  <q-td :props="props">
                    <div v-for="(item, index) in props.row.items" :key="index" class="sku-item">
                      <div class="row items-center q-gutter-sm">
                        <q-btn
                          flat
                          round
                          dense
                          color="negative"
                          icon="delete"
                          @click="removeSkuItem(props.rowIndex, index)"
                        />
                        <div class="sku-info">
                          <div class="text-weight-medium">{{ item.sku }}</div>
                          <div class="text-caption text-grey">{{ item.name }}</div>
                        </div>
                      </div>
                    </div>
                    <q-btn
                      flat
                      dense
                      color="primary"
                      icon="add"
                      :label="t('添加SKU')"
                      @click="openSkuDialog(props.rowIndex)"
                    />
                  </q-td>
                </template>

                <template v-slot:body-cell-quantity="props">
                  <q-td :props="props">
                    <div v-for="(item, index) in props.row.items" :key="index" class="q-mb-sm">
                      <q-input
                        v-model="item.quantity"
                        type="number"
                        dense
                        outlined
                        style="width: 100px"
                      />
                    </div>
                    <div v-if="props.row.items.length === 0" class="q-mb-sm">
                      <q-input
                        disabled
                        dense
                        outlined
                        style="width: 100px"
                      />
                    </div>
                  </q-td>
                </template>

                <template v-slot:body-cell-dimensions="props">
                  <q-td :props="props">
                    <div class="row q-gutter-x-xs items-center">
                      <q-input
                        v-model.number="props.row.size_length"
                        type="number"
                        outlined
                        dense
                        style="width: 70px"
                        :placeholder="t('长')"
                      />
                      <q-input
                        v-model.number="props.row.size_width"
                        type="number"
                        outlined
                        dense
                        style="width: 70px"
                        :placeholder="t('宽')"
                      />
                      <q-input
                        v-model.number="props.row.size_height"
                        type="number"
                        outlined
                        dense
                        style="width: 70px"
                        :placeholder="t('高')"
                      />
                      <div class="self-center">cm</div>
                    </div>
                  </q-td>
                </template>

                <template v-slot:body-cell-weight="props">
                  <q-td :props="props">
                    <div class="row q-gutter-x-xs items-center">
                      <q-input
                        v-model.number="props.row.weight"
                        type="number"
                        outlined
                        dense
                        style="width: 80px"
                        :placeholder="t('重量')"
                      />
                      <div class="self-center">kg</div>
                    </div>
                  </q-td>
                </template>

                <template v-slot:body-cell-operations="props">
                  <q-td :props="props">
                    <q-btn
                      flat
                      round
                      dense
                      color="negative"
                      icon="delete"
                      @click="removeBox(props.rowIndex)"
                    />
                  </q-td>
                </template>
              </q-table>

              <div class="q-mt-md">
                <q-btn
                  color="primary"
                  outline
                  :label="t('添加箱子')"
                  icon="add"
                  @click="addBox"
                />
              </div>
            </div>

            <!-- SKU维度模式 -->
            <div v-else class="sku-mode">
              <div class="row justify-between items-center q-mb-sm">
                <div></div>
                <div>
                  <q-btn
                    color="primary"
                    flat
                    :label="t('选择商品')"
                    @click="selectProducts"
                  />
                  <q-btn
                    class="q-ml-sm"
                    color="primary"
                    outline
                    :label="t('Excel快速编辑')"
                    icon-right="arrow_drop_down"
                  >
                    <q-menu>
                      <q-list style="min-width: 100px">
                        <q-item
                          clickable
                          v-close-popup
                          @click="downloadTemplate"
                        >
                          <q-item-section>{{ t('下载模板') }}</q-item-section>
                        </q-item>
                        <q-item
                          clickable
                          v-close-popup
                          @click="importFromExcel"
                        >
                          <q-item-section>{{ t('导入Excel') }}</q-item-section>
                        </q-item>
                      </q-list>
                    </q-menu>
                  </q-btn>
                </div>
              </div>

              <q-table
                :rows="skuItems"
                :columns="skuModeColumns"
                row-key="id"
                flat
                bordered
                dense
                hide-pagination
                class="sku-table"
              >
                <template v-slot:header="props">
                  <q-tr :props="props">
                    <q-th class="text-left">{{ t('商品信息') }}</q-th>
                    <q-th class="text-center">{{ t('总数量') }}</q-th>
                    <q-th
                      v-for="i in boxCountArray"
                      :key="i"
                      class="text-center"
                      >{{ i }}</q-th
                    >
                    <q-th class="text-center">
                      <q-btn
                        flat
                        round
                        dense
                        color="primary"
                        icon="add"
                        @click="addBoxColumn"
                      />
                    </q-th>
                  </q-tr>
                </template>

                <template v-slot:body="props">
                  <q-tr :props="props">
                    <q-td class="text-left">
                      <div class="row items-center">
                        <q-img
                          :src="
                            props.row.img ||
                            'https://cdn.quasar.dev/img/avatar2.jpg'
                          "
                          style="width: 50px; height: 50px"
                          class="rounded-borders q-mr-md"
                        />
                        <div>
                          <div>{{ props.row.sku }}</div>
                          <div class="text-caption">
                            {{ props.row.barcode }}
                          </div>
                        </div>
                      </div>
                    </q-td>
                    <q-td class="text-center">
                      {{ calculateSkuTotalQuantity(props.row) }}
                    </q-td>
                    <q-td
                      v-for="i in boxCountArray"
                      :key="i"
                      class="text-center"
                    >
                      <q-input
                        v-model.number="props.row.quantities[i - 1]"
                        type="number"
                        outlined
                        dense
                        min="0"
                        style="width: 80px"
                      />
                    </q-td>
                    <q-td class="text-center">
                      <q-btn
                        flat
                        round
                        color="negative"
                        icon="delete"
                        size="sm"
                        @click="removeSku(props.rowIndex)"
                      />
                    </q-td>
                  </q-tr>
                </template>

                <template v-slot:bottom>
                  <div class="row full-width">
                    <div class="col-3 text-left">{{ t('合计') }}</div>
                    <div class="col-1 text-center">
                      {{ calculateAllSkuTotalQuantity() }}
                    </div>
                    <div
                      v-for="i in boxCountArray"
                      :key="i"
                      class="col-1 text-center"
                    >
                      {{ calculateBoxTotalQuantity(i - 1) }}
                    </div>
                  </div>
                  <div class="row full-width q-mt-md">
                    <div class="col-3 text-left">{{ t('箱子重量 kg 批量') }}</div>
                    <div
                      v-for="i in boxCountArray"
                      :key="i"
                      class="col-1 text-center"
                    >
                      <q-input
                        v-model.number="boxWeights[i - 1]"
                        type="number"
                        outlined
                        dense
                        min="0"
                        style="width: 80px"
                      />
                    </div>
                  </div>
                  <div class="row full-width q-mt-md">
                    <div class="col-3 text-left">{{ t('箱子尺寸 cm') }}</div>
                    <div
                      v-for="i in boxCountArray"
                      :key="i"
                      class="col-1 text-center"
                    >
                      <q-btn
                        color="primary"
                        flat
                        dense
                        :label="t('添加')"
                        @click="addBoxDimension(i - 1)"
                      />
                    </div>
                  </div>
                </template>
              </q-table>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- 底部操作按钮 -->
      <div class="fixed-bottom-bar">
        <div class="row justify-center q-pa-md">
          <q-btn outline :label="t('取消')" color="grey-7" @click="cancel" />
          <q-btn color="primary" outline :label="t('保存')" @click="handleSave" :loading="submitting" class="q-mx-sm" />
          <q-btn
            type="submit"
            :label="t('保存并提交')"
            color="primary"
            :loading="submitting"
          />
        </div>
      </div>

      <!-- 底部占位,防止内容被固定栏遮挡 -->
      <div class="bottom-placeholder" />
    </q-form>
  </div>

  <!-- SKU 选择弹窗 -->
  <sku-select-dialog ref="skuSelectDialog" @selected="handleSkusSelected" />
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";
import DatePicker from "@/components/DatePicker/DatePicker.vue";
import api from "@/api/index";
import SkuSelectDialog from "@/components/SkuSelectDialog/SkuSelectDialog.vue";

const $q = useQuasar();
const router = useRouter();
const route = useRoute();
const { t } = useI18n();
const isEdit = computed(() => !!route.query.id);
const inboundId = computed(() => route.query.id);
const submitting = ref(false);

// 表单数据
const form = ref({
  arrival_method: "express_parcel", // 默认选择快递包裹
  tracking_number: "",
  custom_order_number: "",
  remark: "",
  boxCount: 1,
  estimated_arrival_date: "",
  type: "standard_inbound"
});

// 监听到仓方式变化
watch(() => form.value.arrival_method, (newMethod) => {
  // 如果是编辑模式，不清空数据
  if (isEdit.value) return;
  
  // 清空相关数据
  if (newMethod === 'express_parcel') {
    // 切换到快递包裹模式
    expressSkuItems.value = [];
    boxItems.value = [];
  } else {
    // 切换到按箱模式
    expressSkuItems.value = [];
    boxItems.value = [];
    // 添加一个默认的空箱子
    addBox();
  }
});

// 装箱模式相关
const packingMode = ref("box"); // 默认箱维度
const boxTotal = computed(() => {
  if (form.value.arrival_method === "express_parcel") {
    // 快递包裹模式下，每个SKU当作一个包裹
    return expressSkuItems.value.length;
  } else if (packingMode.value === "box") {
    return boxItems.value.reduce(
      (total, item) => total + (item.boxQuantity || 0),
      0
    );
  } else {
    return boxCountArray.value.length;
  }
});

// 箱维度模式数据
const boxItems = ref([]);
const boxModeColumns = [
  {
    name: "boxNumber",
    required: false,
    label: "#",
    field: "boxNumber",
    align: "left",
    style: "width: 80px",
  },
  {
    name: "boxQuantity",
    required: true,
    label: t('箱子数量'),
    field: "boxQuantity",
    align: "left",
    style: "width: 120px",
  },
  { 
    name: "sku", 
    required: true, 
    label: t('SKU'), 
    field: "sku",
    align: "left",
    style: "min-width: 200px",
  },
  {
    name: "quantity",
    required: true,
    label: t('单箱数量'),
    field: "quantity",
    align: "left",
    style: "min-width: 200px",
  },
  {
    name: "dimensions",
    required: false,
    label: t('单箱尺寸'),
    field: "dimensions",
    align: "left",
    style: "min-width: 250px",
  },
  {
    name: "weight",
    required: false,
    label: t('单箱重量'),
    field: "weight",
    align: "left",
    style: "min-width: 150px",
  },
  {
    name: "operations",
    required: false,
    label: t('操作'),
    field: "operations",
    align: "center",
    style: "width: 80px",
  },
];

// SKU维度模式数据
const skuItems = ref([]);
const boxCountArray = ref([1, 2, 3, 4]); // 默认4个箱子
const boxWeights = ref(Array(4).fill(null));
const boxDimensions = ref(
  Array(4)
    .fill(null)
    .map(() => ({ length: null, width: null, height: null }))
);

// 动态SKU模式列定义
const skuModeColumns = computed(() => {
  const columns = [
    { name: "info", align: "left", label: t('商品信息'), field: "info" },
    { name: "totalQty", align: "center", label: t('总数量'), field: "totalQty" },
  ];

  boxCountArray.value.forEach((boxNum, index) => {
    columns.push({
      name: `box-${boxNum}`,
      align: "center",
      label: `${boxNum}`,
      field: (row) => row.quantities[index],
    });
  });

  columns.push({
    name: "operations",
    align: "center",
    label: "",
    field: "operations",
  });

  return columns;
});

// 选项数据
const shippingMethodOptions = [
  { label: t('快递包裹'), value: "express_parcel" },
  { label: t('按箱'), value: "box" },
];

// 快递包裹模式数据
const searchSkuText = ref("");
const expressSkuItems = ref([]);
const expressSkuColumns = [
  { 
    name: "index", 
    label: "#", 
    field: "index", 
    align: "center",
    style: "width: 50px"
  },
  { 
    name: "sku", 
    label: t('商品SKU'), 
    field: "sku", 
    align: "left",
    style: "min-width: 120px"
  },
  { 
    name: "name", 
    label: t('商品名称'), 
    field: "name", 
    align: "left",
    style: "min-width: 200px"
  },
  { 
    name: "quantity", 
    label: t('数量'), 
    field: "quantity", 
    align: "center",
    style: "width: 100px"
  },
  { 
    name: "operations", 
    label: t('操作'), 
    field: "operations", 
    align: "center",
    style: "width: 80px"
  }
];

// 搜索SKU
const searchSku = () => {
  if (!searchSkuText.value) {
    $q.notify({
      type: "warning",
      message: t('请输入SKU或条形码'),
    });
    return;
  }

  // TODO: 调用实际的搜索API
  $q.notify({
    type: "negative",
    message: t('未找到匹配的SKU'),
  });
};

// 移除快递SKU
const removeExpressSku = (index) => {
  expressSkuItems.value.splice(index, 1);
};

// 箱维度模式方法
const addBox = () => {
  const newBoxNumber = boxItems.value.length + 1;
  boxItems.value.push({
    id: Date.now(),
    boxNumber: newBoxNumber,
    boxQuantity: 1,
    items: [],
    size_length: null,
    size_width: null,
    size_height: null,
    weight: null,
  });
};

const removeBox = (index) => {
  boxItems.value.splice(index, 1);
  // 重新编号
  boxItems.value.forEach((item, idx) => {
    item.boxNumber = idx + 1;
  });
};

const calculateTotalQuantity = (row) => {
  row.totalQuantity = (row.boxQuantity || 0) * (row.unitQuantity || 0);
};

const showSkuSelection = (row) => {
  currentEditingBox.value = row;
  skuSelectDialog.value.open();
};

// SKU维度模式方法
const removeSku = (index) => {
  skuItems.value.splice(index, 1);
};

const calculateSkuTotalQuantity = (row) => {
  return row.quantities.reduce((sum, qty) => sum + (qty || 0), 0);
};

const calculateAllSkuTotalQuantity = () => {
  return skuItems.value.reduce(
    (sum, row) => sum + calculateSkuTotalQuantity(row),
    0
  );
};

const calculateBoxTotalQuantity = (boxIndex) => {
  return skuItems.value.reduce(
    (sum, row) => sum + (row.quantities[boxIndex] || 0),
    0
  );
};

const addBoxColumn = () => {
  boxCountArray.value.push(boxCountArray.value.length + 1);
  boxWeights.value.push(null);
  boxDimensions.value.push({ length: null, width: null, height: null });

  // 为每个SKU项目添加新箱子的数量字段
  skuItems.value.forEach((item) => {
    item.quantities.push(0);
  });
};

// 当前正在编辑的箱子
const currentEditingBox = ref(null);

// 打开 SKU 选择弹窗
const openSkuDialog = (boxIndex) => {
  currentEditingBox.value = boxItems.value[boxIndex];
  skuSelectDialog.value.open();
};

// 处理选中的SKUs
const handleSkusSelected = (selectedSkus) => {
  if (form.value.arrival_method === 'express_parcel') {
    // 快递包裹模式处理逻辑
    selectedSkus.forEach((sku) => {
      const existing = expressSkuItems.value.find((item) => item.sku === sku.sku);
      if (existing) {
        existing.quantity += 1;
      } else {
        expressSkuItems.value.push({
          id: sku.id,
          sku: sku.sku,
          name: sku.name,
          image: sku.image,
          quantity: 1,
        });
      }
    });

    $q.notify({
      type: "positive",
      message: t('已成功添加 {count} 个商品', { count: selectedSkus.length }),
    });
  } else {
    // 箱模式处理逻辑
    if (currentEditingBox.value) {
      selectedSkus.forEach((sku) => {
        const existing = currentEditingBox.value.items.find(
          (item) => item.sku === sku.sku
        );
        if (!existing) {
          currentEditingBox.value.items.push({
            id: sku.id,
            sku: sku.sku,
            name: sku.name,
            quantity: 1,
          });
        }
      });

      $q.notify({
        type: "positive",
        message: t('已成功添加 {count} 个商品', { count: selectedSkus.length }),
      });
    }
  }
};

// 移除SKU
const removeBoxSku = (boxIndex, skuIndex) => {
  boxItems.value[boxIndex].items.splice(skuIndex, 1);
};

// 获取入库单详情
const fetchInboundDetail = async () => {
  try {
    const response = await api.getInboundDetail(inboundId.value);
    if (response.success) {
      const detail = response.data;
      
      // 填充基本信息
      form.value = {
        arrival_method: detail.arrival_method,
        tracking_number: detail.tracking_number,
        custom_order_number: detail.custom_order_number,
        remark: detail.remark,
        estimated_arrival_date: detail.estimated_arrival_date?.split(' ')[0],
        type: "standard_inbound"
      };

      // 根据到仓方式填充商品数据
      if (detail.arrival_method === 'express_parcel') {
        // 快递包裹模式
        expressSkuItems.value = detail.details[0]?.items.map(item => ({
          id: item.id,
          sku: item.product_spec_sku,
          name: item.product_name,
          quantity: item.quantity
        })) || [];
      } else {
        // 按箱模式
        boxItems.value = detail.details.map(box => ({
          id: box.id,
          boxNumber: parseInt(box.box_number),
          boxQuantity: box.box_quantity,
          size_length: box.size_length,
          size_width: box.size_width,
          size_height: box.size_height,
          weight: box.weight,
          items: box.items.map(item => ({
            id: item.id,
            sku: item.product_spec_sku,
            name: item.product_name,
            quantity: item.quantity,
            image: item.product_spec_image
          }))
        }));
        console.log('----7789');
        
        console.log(boxItems.value);
        
      }
    }
  } catch (error) {
    console.error(t('获取入库单详情失败'), error);
  }
};

// 保存入库单
const handleSave = async () => {
  try {
    submitting.value = true;
    const params = await buildSubmitParams();
    if (!params) return;

    const response = isEdit.value 
      ? await api.editInbound(inboundId.value, params)
      : await api.createInbound(params);
      
    if (response.success) {
      $q.notify({
        type: 'positive',
        message: t(isEdit.value ? '编辑成功' : '创建成功')
      });
      router.push("/storage/warehousewarrant");
    }
  } catch (error) {
    console.error(t(isEdit.value ? '编辑失败' : '保存失败'), error);
    $q.notify({
      type: 'negative',
      message: t(isEdit.value ? '编辑失败' : '保存失败')
    });
  } finally {
    submitting.value = false;
  }
};

// 构建提交参数
const buildSubmitParams = async () => {
  if (form.value.arrival_method === "express_parcel") {
    // 快递包裹模式验证和参数构建
    if (expressSkuItems.value.length === 0) {
      $q.notify({
        type: "negative",
        message: t('请至少添加一个商品'),
      });
      return null;
    }

    // 验证每个SKU的数量
    for (const item of expressSkuItems.value) {
      if (!item.quantity || item.quantity <= 0) {
        $q.notify({
          type: "negative",
          message: t('SKU {sku} 的数量必须大于0', { sku: item.sku }),
        });
        return null;
      }
    }

    // 构造提交数据
    const details = [{
      mode: 'sku',
      items: expressSkuItems.value.map(item => ({
        sku: item.sku,
        quantity: item.quantity
      }))
    }];

    return {...form.value, details};
  } else {
    // 箱模式验证和参数构建
    if (boxItems.value.length === 0) {
      $q.notify({
        type: "negative",
        message: t('请至少添加一个箱子'),
      });
      return null;
    }

    // 验证每个箱子
    for (const box of boxItems.value) {
      if (!box.boxQuantity || box.boxQuantity <= 0) {
        $q.notify({
          type: "negative",
          message: t('箱子数量必须大于0'),
        });
        return null;
      }
      if (!box.items || box.items.length === 0) {
        $q.notify({
          type: "negative",
          message: t('请为所有箱子选择SKU'),
        });
        return null;
      }
      // 验证每个SKU的数量
      for (const item of box.items) {
        if (!item.quantity || item.quantity <= 0) {
          $q.notify({
            type: "negative",
            message: t('SKU {sku} 的数量必须大于0', { sku: item.sku }),
          });
          return null;
        }
      }
    }

    // 构造提交数据
    const details = boxItems.value.map(box => ({
      mode: 'box',
      box_quantity: box.boxQuantity,
      size_length: box.size_length || 0,
      size_width: box.size_width || 0,
      size_height: box.size_height || 0,
      weight: box.weight || 0,
      items: box.items.map(item => ({
        sku: item.sku,
        quantity: item.quantity
      }))
    }));

    return {...form.value, details};
  }
};

// 提交表单(保存并提交)
const submitForm = async () => {
  try {
    submitting.value = true;
    const params = await buildSubmitParams();
    if (!params) return;

    // 先创建/编辑入库单
    const saveResponse = isEdit.value 
      ? await api.editInbound(inboundId.value, params)
      : await api.createInbound(params);
      
    if (saveResponse.success) {
      // 创建/编辑成功后提交入库单
      const submitResponse = await api.submitInbound(isEdit.value ? inboundId.value : saveResponse.data.id);
      if (submitResponse.success) {
 
        router.push("/storage/warehousewarrant");
      }
    }
  } catch (error) {
    console.error(t('提交失败'), error);
  } finally {
    submitting.value = false;
  }
};

// 取消
const cancel = () => {
  router.push("/storage/warehousewarrant");
};

// 初始化
onMounted(async () => {
  if (isEdit.value) {
    await fetchInboundDetail();
  } else if (boxItems.value.length === 0) {
    addBox();
  }
});

// SKU 选择弹窗引用
const skuSelectDialog = ref(null);

// 处理模式切换
const handleModeChange = (mode) => {
  // 可以根据需要在模式切换时进行数据转换
  console.log("Mode changed to:", mode);
};

const importBoxes = () => {
  // 批量导入箱子的逻辑
  console.log("批量导入箱子");
};

const downloadTemplate = () => {
  console.log("下载Excel模板");
};

const importFromExcel = () => {
  console.log("从Excel导入数据");
};

const addBoxDimension = (boxIndex) => {
  // 显示一个添加箱子尺寸的对话框
  console.log("为箱子", boxIndex + 1, "添加尺寸");
};

const selectProducts = () => {
  // 这里应该显示一个商品选择弹窗
  // 为了演示，我们添加一些模拟数据
  if (skuItems.value.length === 0) {
    skuItems.value.push({
      id: Date.now(),
      sku: "C-001",
      barcode: "123456789",
      img: "https://cdn.quasar.dev/img/mountains.jpg",
      name: "豹点纹毛衣外套",
      quantities: Array(boxCountArray.value.length).fill(0),
    });

    skuItems.value.push({
      id: Date.now() + 1,
      sku: "C-002",
      barcode: "987654321",
      img: "https://cdn.quasar.dev/img/parallax2.jpg",
      name: "蓝色T恤",
      quantities: Array(boxCountArray.value.length).fill(0),
    });
  }
};

const removeSkuItem = (boxIndex, skuIndex) => {
  boxItems.value[boxIndex].items.splice(skuIndex, 1);
};

// 计算箱号范围
const getBoxNumberRange = (rowIndex) => {
  // 计算当前行之前的所有箱子数量之和
  let startNumber = 1;
  for (let i = 0; i < rowIndex; i++) {
    startNumber += boxItems.value[i].boxQuantity || 0;
  }
  
  // 当前行的箱子数量
  const currentBoxCount = boxItems.value[rowIndex].boxQuantity || 0;
  
  // 如果当前行箱子数量为1,只显示一个数字
  if (currentBoxCount === 1) {
    return `#${startNumber}`;
  }
  
  // 否则显示范围
  const endNumber = startNumber + currentBoxCount - 1;
  return `#${startNumber}~${endNumber}`;
};
</script>

<style lang="scss" scoped>
.create-warehouse {
  .warehouse-card {
    background-color: white;
    border-radius: 8px;
  }

  .form-item {
    margin-bottom: 1.5rem;

    .form-item-label {
      font-weight: 500;
      margin-bottom: 0.5rem;
    }
  }

  // 通用表格样式
  .q-table {
    .q-table__top,
    .q-table__bottom,
    thead tr:first-child th {
      background-color: #f5f5f5;
    }
  }

  // 箱维度模式
  .box-mode {
    .box-table {
      margin-bottom: 1rem;

      .required-field {
        font-weight: 500;
      }

      td {
        padding: 12px 16px;
      }

      .q-btn {
        min-height: 32px;
      }

      .row.items-center {
        min-height: 32px;
      }
    }
  }

  // SKU维度模式
  .sku-mode {
    .sku-table {
      margin-bottom: 1rem;
    }
  }

  // 快递包裹模式
  .express-mode {
    .express-table {
      margin-bottom: 1rem;

      :deep(.q-table) {
        td {
          vertical-align: middle !important;
        }

        .q-field {
          width: 80px;
          margin: 0 auto;
        }
      }
    }
  }

  // SKU 选择弹窗
  .sku-dialog {
    width: 100%;
    max-width: 900px;

    .sku-dialog-content {
      height: 70vh;
      overflow: auto;
      padding-bottom: 16px;
    }

    .sku-table {
      height: auto;
    }
  }

  .fixed-bottom-bar {
    margin: 0!important;
    position: fixed;
    bottom: 0;
    left: 240px;
    right: 0;
    background: white;
    box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
    z-index: 1000;
  }

  .bottom-placeholder {
    height: 72px;
  }
}

.warehouse-card {
  .q-table {
    td {
      padding: 8px 16px;
      vertical-align: top;
    }
    th {
      padding: 8px 16px;
    }
    .q-btn {
      min-height: 24px;
      padding: 0 8px;
    }
  }
}

.sku-item {
  margin-bottom: 8px;
  
  &:last-child {
    margin-bottom: 12px;
  }
}

.sku-info {
  flex: 1;
}
</style>
