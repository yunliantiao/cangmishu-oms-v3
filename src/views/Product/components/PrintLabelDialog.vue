<template>
  <q-dialog v-model="dialogVisible" persistent>
    <q-card class="print-dialog-card">
      <div class="row items-center dialog-header">
        <div class="text-h6">{{ t('打印标签') }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </div>

      <q-card-section class="q-pt-none">
        <q-form @submit="handleSubmit" class="q-gutter-md">
          <div class="row q-col-gutter-x-md">
            <!-- 左侧参数设置 -->
            <div class="col-4">
              <div class="q-mb-md">
                <div class="q-mb-sm">{{ t('模板名称') }} <span class="text-red">*</span></div>
                <q-select
                  v-model="form.template_id"
                  :options="[{label: 'Standard Template(40mm × 30mm)', value: 1}]"
                  outlined
                  dense
                  emit-value
                  map-options
                />
              </div>

              <div class="q-mb-md">
                <div class="q-mb-sm">{{ t('纸张类型') }} <span class="text-red">*</span></div>
                <div class="row">
                  <q-radio v-model="form.paper_type" val="roll" :label="t('卷纸')" class="col-6" />
                  <q-radio v-model="form.paper_type" val="flat" :label="t('平面纸')" class="col-6" />
                </div>
              </div>

              <template v-if="form.paper_type === 'roll'">
                <div class="q-mb-md">
                  <div class="q-mb-sm">{{ t('排') }} <span class="text-red">*</span></div>
                  <q-input
                    v-model.number="form.columns"
                    type="number"
                    outlined
                    dense
                    min="1"
                  />
                </div>

                <div class="q-mb-md">
                  <div class="q-mb-sm">{{ t('边距') }}</div>
                  <q-input
                    v-model.number="form.margin"
                    type="number"
                    outlined
                    dense
                    min="0"
                  >
                    <template v-slot:append>mm</template>
                  </q-input>
                </div>

                <div class="q-mb-md">
                  <div class="q-mb-sm">{{ t('水平间距') }}</div>
                  <q-input
                    v-model.number="form.horizontal_spacing"
                    type="number"
                    outlined
                    dense
                    min="0"
                  >
                    <template v-slot:append>mm</template>
                  </q-input>
                </div>
              </template>

              <template v-else>
                <div class="q-mb-md">
                  <div class="q-mb-sm">{{ t('纸张宽度') }} <span class="text-red">*</span></div>
                  <q-input
                    v-model.number="form.paper_width"
                    type="number"
                    outlined
                    dense
                    min="1"
                  >
                    <template v-slot:append>mm</template>
                  </q-input>
                </div>

                <div class="q-mb-md">
                  <div class="q-mb-sm">{{ t('纸张高度') }} <span class="text-red">*</span></div>
                  <q-input
                    v-model.number="form.paper_height"
                    type="number"
                    outlined
                    dense
                    min="1"
                  >
                    <template v-slot:append>mm</template>
                  </q-input>
                </div>

                <div class="q-mb-md">
                  <div class="q-mb-sm">{{ t('边距') }}</div>
                  <q-input
                    v-model.number="form.margin"
                    type="number"
                    outlined
                    dense
                    min="0"
                  >
                    <template v-slot:append>mm</template>
                  </q-input>
                </div>
              </template>

              <div class="preview-box q-mt-lg">
                <div class="text-subtitle2 q-mb-sm">{{ t('预览') }}</div>
                <div class="preview-content" :class="form.paper_type">
                  <template v-if="form.paper_type === 'roll'">
                    <div class="roll-preview">
                      <div 
                        class="margin-container"
                        :style="{
                          padding: `${form.margin * 0.3}px`,
                          backgroundColor: form.margin > 0 ? '#e6f0fc' : 'transparent'
                        }"
                      >
                        <div class="labels-container">
                          <template v-for="row in Math.ceil(form.columns / 2)" :key="row">
                            <div class="label-row">
                              <div class="label-box" />
                              <div 
                                v-if="(row - 1) * 2 + 2 <= form.columns"
                                class="horizontal-spacing"
                                :style="{
                                  width: `${form.horizontal_spacing * 0.3}px`,
                                  backgroundColor: form.horizontal_spacing > 0 ? '#e6f0fc' : 'transparent'
                                }"
                              />
                              <div 
                                v-if="(row - 1) * 2 + 2 <= form.columns"
                                class="label-box" 
                              />
                            </div>
                          </template>
                        </div>
                      </div>
                    </div>
                  </template>
                  <template v-else>
                    <div 
                      class="flat-preview"
                      :style="{
                        backgroundColor: '#e6f0fc',
                        padding: `${form.margin * 0.3}px`
                      }"
                    >
                      <div 
                        class="preview-content"
                        :style="{
                          width: '100%',
                          height: '100%',
                          backgroundColor: '#fff',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'flex-start'
                        }"
                      >
                        <div class="label-row">
                          <template v-for="col in getPreviewColumns" :key="col">
                            <div 
                              class="label-box"
                              :style="{
                                width: '40px',
                                minWidth: '40px'
                              }"  
                            />
                            <div 
                              v-if="col < getPreviewColumns"
                              class="label-spacing"
                              :style="{
                                width: `${getLabelSpacing * 0.3}px`,
                                backgroundColor: '#e6f0fc'
                              }"
                            />
                          </template>
                        </div>
                        
                        <div 
                          class="row-spacing"
                          :style="{
                            width: '100%',
                            height: '3px',
                            backgroundColor: '#e6f0fc',
                          }"
                        />
                        
                        <div class="label-row">
                          <template v-for="col in getPreviewColumns" :key="col">
                            <div 
                              class="label-box"
                              :style="{
                                width: '40px',
                                minWidth: '40px'
                              }"  
                            />
                            
                            <div 
                              v-if="col < getPreviewColumns"
                              class="label-spacing"
                              :style="{
                                width: `${getLabelSpacing * 0.3}px`,
                                backgroundColor: '#e6f0fc'
                              }"
                            />
                          </template>
                        </div>
                      </div>
                    </div>
                  </template>
                </div>
              </div>
            </div>

            <!-- 右侧商品列表 -->
            <div class="col-8">
              <div class="row items-center bg-grey-2 q-pa-sm">
                <div class="col">{{ t('商品信息') }}</div>
                <div v-if="isInbound" class="col-2 text-center q-mr-md">{{ t('申报数量') }} <span class="text-red">*</span></div>
                <div class="col-2 text-right">{{ t('打印数量') }} <span class="text-red">*</span></div>
                <div class="col-2 text-center">{{ t('操作') }}</div>
              </div>

              <div v-for="(item, index) in skuList" :key="item.id" class="row items-center q-py-md q-px-sm">
                <div class="col">
                  <div class="row items-center">
                    <q-img
                      v-if="!isInbound"
                      :src="item.image"
                      style="width: 40px; height: 40px; object-fit: cover"
                      class="rounded-borders q-mr-sm"
                    />
                    <div>
                      <div>{{ isInbound ? item.product_spec_sku : item.sku }}</div>
                      <div class="text-grey-7">{{ isInbound ? item.product_spec_name : item.name }}</div>
                    </div>
                  </div>
                </div>
                <div class="col-2 text-center q-mr-md" v-if="isInbound">
                  {{ item.quantity }}
                </div>
                <div class="col-2">
                  <q-input
                    v-model.number="form.specs[index].qty"
                    type="number"
                    outlined
                    dense
                    min="1"
                  />
                </div>
                <div class="col-2 text-center">
                  <q-btn
                    flat
                    round
                    color="grey"
                    icon="delete"
                    size="sm"
                    @click="removePrintItem(index)"
                  />
                </div>
              </div>
            </div>
          </div>
        </q-form>
      </q-card-section>

      <q-card-actions align="right" class="bg-white text-primary q-pa-md">
        <q-btn 
          outline 
          color="primary" 
          :label="t('取消')" 
          v-close-popup 
          class="q-px-md"
        />
        <q-btn 
          unelevated 
          color="primary" 
          :label="t('打印')" 
          @click="handleSubmit" 
          :loading="loading"
          class="q-ml-sm q-px-md"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, defineProps, defineEmits, watch, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import api from '@/api/index';

const { t } = useI18n();
const $q = useQuasar();

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  skuList: {
    type: Array,
    default: () => []
  },
  isInbound: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'success']);

const dialogVisible = ref(false);
const loading = ref(false);

const form = ref({
  template_id: 1,
  template_type: 'sku',
  paper_type: 'roll',
  margin: 1,
  columns: 1,
  horizontal_spacing: 2,
  paper_width: 42,
  paper_height: 32,
  specs: []
});

watch(() => props.modelValue, (val) => {
  dialogVisible.value = val;
});

watch(() => dialogVisible.value, (val) => {
  emit('update:modelValue', val);
  if (val) {
    // 初始化打印规格
    form.value.specs = props.skuList.map(item => {
      if (props.isInbound) {
        return {
          sku: item.product_spec_sku,
          name: item.product_spec_name,
          product_name: item.product_name || '',
          qty: item.quantity || 1 // 使用入库单中的数量
        };
      } else {
        return {
          sku: item.sku,
          name: item.name,
          product_name: item.product?.name || '',
          qty: 1
        };
      }
    });
  }
});

// 移除打印项
const removePrintItem = (index) => {
  form.value.specs.splice(index, 1);
  if (form.value.specs.length === 0) {
    dialogVisible.value = false;
  }
};

// 处理打印提交
const handleSubmit = async () => {
  try {
    loading.value = true;
    
    // 构建提交数据
    const submitData = {
      template_id: form.value.template_id,
      template_type: form.value.template_type,
      paper_type: form.value.paper_type,
      margin: form.value.margin,
      specs: form.value.specs
    };

    // 根据纸张类型添加不同的参数
    if (form.value.paper_type === 'roll') {
      submitData.columns = form.value.columns;
      submitData.horizontal_spacing = form.value.horizontal_spacing;
    } else {
      submitData.paper_width = form.value.paper_width;
      submitData.paper_height = form.value.paper_height;
    }
    
    const response = await api.productsLabels(submitData);
    console.log(response);
    if (response.success && response.data) {
      // 直接使用返回的URL
      window.open(response.data.data);
    } else {
      $q.notify({
        type: 'negative',
        message: t('打印标签失败')
      });
    }
    emit('success');
  } catch (error) {
    console.error('打印标签失败:', error);
  } finally {
    loading.value = false;
  }
};

// 计算每页能显示多少个标签
const getPreviewLabelCount = computed(() => {
  if (form.value.paper_type === 'flat') {
    const labelWidth = 40; // 标签宽度(mm)
    const labelHeight = 30; // 标签高度(mm)
    const margin = form.value.margin || 0;
    
    // 计算可用区域
    const availableWidth = form.value.paper_width - (margin * 2);
    const availableHeight = form.value.paper_height - (margin * 2);
    
    // 计算每行/列可以放置的标签数
    const cols = Math.floor(availableWidth / labelWidth);
    const rows = Math.floor(availableHeight / labelHeight);
    
    return cols * rows;
  }
  return 6; // 默认显示6个
});

// 计算平面纸每行能显示多少个标签
const getPreviewColumns = computed(() => {
  if (form.value.paper_type === 'flat') {
    const labelWidth = 40; // 标签宽度(mm)
    const margin = form.value.margin || 0;
    
    // 计算可用宽度
    const availableWidth = form.value.paper_width - (margin * 2);
    
    // 计算可以放置的标签数
    const count = Math.floor(availableWidth / labelWidth);
    console.log('每行标签数：', count); // 添加日志
    return count;
  }
  return 3;
});

// 计算标签之间的间距(mm)
const getLabelSpacing = computed(() => {
  if (form.value.paper_type === 'flat') {
    const labelWidth = 40; // 标签宽度(mm)
    const margin = form.value.margin || 0;
    const availableWidth = form.value.paper_width - (margin * 2);
    const labelCount = getPreviewColumns.value;
    
    if (labelCount <= 1) return 0;
    
    // 计算剩余空间平均分配给间距
    const totalWidth = labelWidth * labelCount;
    const remainingSpace = availableWidth - totalWidth;
    
    // 平均分配间距
    const spacing = remainingSpace / (labelCount - 1);
    console.log('标签间距：', spacing); // 添加日志
    return spacing;
  }
  return 0;
});
</script>

<style lang="scss" scoped>
.print-dialog-card {
  width: 90vw;
  max-width: 1000px;
  min-width: 800px;
  padding: 20px;

  .dialog-header {
    padding-bottom: 20px;
  }
}

.preview-content {
  border: 1px solid #ddd;
  border-radius: 4px;
  height: 160px;
  background: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  
  .roll-preview {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #fff;
    
    .margin-container {
      border-radius: 4px;
      transition: all 0.3s ease;
    }

    .labels-container {
      background: transparent;
    }

    .label-row {
      display: flex;
      align-items: center;
      
      &:not(:last-child) {
        margin-bottom: 5px;
      }
    }
    
    .horizontal-spacing {
      height: 30px;
      min-width: 4px;
      transition: all 0.3s ease;
    }
    
    .label-box {
      width: 40px;
      height: 30px;
      border: 1px solid #a8d5ff;
      background: #fff;
      flex-shrink: 0;
    }
  }
  
  .flat-preview {
    border: 1px solid #ddd;
    border-radius: 4px;
    overflow: hidden;
    
    .preview-content {
      overflow: hidden;
    }

    .label-row {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      flex-wrap: nowrap;
      min-width: fit-content;
    }
    
    .label-box {
      height: 30px;
      border: 1px solid #a8d5ff;
      background: #fff;
      flex-shrink: 0;
    }

    .label-spacing {
      height: 30px;
      flex-shrink: 0;
    }
  }
}

.text-red {
  color: #ff0000;
}
</style> 