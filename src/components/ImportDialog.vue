<template>
  <q-dialog v-model="dialogVisible" persistent>
    <q-card style="min-width: 500px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">{{ t('导入') }}{{ typeLabel }}</div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section>
        <!-- 上传区域 -->
        <div
          class="upload-area flex flex-center column q-pa-lg"
          @click="triggerFileInput"
          @dragover.prevent
          @drop.prevent="handleDrop"
        >
          <input
            type="file"
            ref="fileInput"
            style="display: none"
            accept=".xlsx,.xls,.csv"
            @change="handleFileChange"
          />
          <q-icon name="cloud_upload" size="48px" color="grey-6" />
          <div class="text-grey-6 q-mt-sm">
            {{ t('点击或拖拽文件到此处上传') }}
          </div>
          <div class="text-grey-6 q-mt-xs text-caption">
            {{ t('支持') }} .xlsx, .xls, .csv {{ t('格式') }}
          </div>
          <div v-if="selectedFile" class="selected-file q-mt-md">
            <q-chip
              removable
              @remove="clearFile"
              color="primary"
              text-color="white"
            >
              {{ selectedFile.name }}
            </q-chip>
          </div>
        </div>

        <!-- 下载模板 -->
        <div class="text-center q-mt-md">
          <q-btn
            flat
            color="primary"
            icon="download"
            :label="t('下载') + typeLabel + t('导入模板')"
            @click="handleDownloadTemplate"
          />
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat :label="t('取消')" color="grey-7" v-close-popup />
        <q-btn
          color="primary"
          :label="t('开始导入')"
          :loading="uploading"
          :disable="!selectedFile"
          @click="handleUpload"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import api from '@/api/index';

const $q = useQuasar();
const { t } = useI18n();

// Props
const props = defineProps({
  type: {
    type: String,
    required: true,
    validator: (value) => ['spu', 'sku', 'orders', 'combo'].includes(value)
  }
});

// Emits
const emit = defineEmits(['success']);

// 计算属性
const typeLabel = computed(() => {
  const labels = {
    spu: '商品SPU',
    sku: 'SKU',
    orders: '出库单',
    combo: '组合商品'
  };
  return labels[props.type] || '';
});

// 响应式变量
const dialogVisible = ref(false);
const fileInput = ref(null);
const selectedFile = ref(null);
const uploading = ref(false);

// 触发文件选择
const triggerFileInput = () => {
  fileInput.value.click();
};

// 处理文件选择
const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    validateAndSetFile(file);
  }
};

// 处理拖拽
const handleDrop = (event) => {
  const file = event.dataTransfer.files[0];
  if (file) {
    validateAndSetFile(file);
  }
};

// 验证并设置文件
const validateAndSetFile = (file) => {
  const validTypes = [
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv'
  ];
  
  if (!validTypes.includes(file.type)) {
    $q.notify({
      type: 'negative',
      message: t('请上传正确的文件格式(.xlsx, .xls, .csv)')
    });
    return;
  }
  
  selectedFile.value = file;
};

// 清除已选文件
const clearFile = () => {
  selectedFile.value = null;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

// 处理下载模板
const handleDownloadTemplate = async () => {
  let type = ''
  if(props.type === 'spu'){
    type = 'import_product'
  } else if(props.type === 'orders'){
    type = 'import_order'
  } else if(props.type === 'combo'){
    type = 'import_combination_product'
  }
  try {
    const params = {
      type
    };
    
    const response = await api.getTemplates(params);
    
    // 获取文件名
    const filename = `${typeLabel.value}导入模板.xlsx`;
    
    // 创建 Blob 对象
    const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // 创建下载链接
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    // 触发下载
    document.body.appendChild(link);
    link.click();
    
    // 清理
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    $q.notify({
      type: 'positive',
      message: t('下载成功')
    });
  } catch (error) {
    console.error('下载模板失败:', error);
    $q.notify({
      type: 'negative',
      message: t('下载失败')
    });
  }
};

// 处理上传
const handleUpload = async () => {
  if (!selectedFile.value) return;
  
  uploading.value = true;
  try {
    const formData = new FormData();
    
    if (props.type === 'spu') {
      formData.append('file', selectedFile.value);
      // formData.append('data', JSON.stringify({
      //   type: 'import_product'
      // }));
      await api.importSpu(formData);
    } else if (props.type === 'orders') {
      formData.append('file', selectedFile.value);
      // formData.append('data', JSON.stringify({
      //   type: 'import_order'
      // }));
      await api.importOutbound(formData);
    } else if (props.type === 'combo') {
      formData.append('file', selectedFile.value);
      formData.append('data', JSON.stringify({
        type: 'import_combination_product'
      }));
      await api.importCombo(formData);
    } else {
      // 其他类型的导入待实现
      console.log(`上传${props.type}文件`, selectedFile.value);
    }
    
    $q.notify({
      type: 'positive',
      message: t('导入成功')
    });
    
    emit('success');
    dialogVisible.value = false;
    clearFile();
  } catch (error) {
    console.error('导入失败:', error);
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || t('导入失败')
    });
  } finally {
    uploading.value = false;
  }
};

// 打开弹窗方法
const open = () => {
  dialogVisible.value = true;
};

// 暴露方法给父组件
defineExpose({
  open
});
</script>

<style lang="scss" scoped>
.upload-area {
  border: 2px dashed #dcdfe6;
  border-radius: 8px;
  cursor: pointer;
  transition: border-color 0.3s;
  min-height: 200px;

  &:hover {
    border-color: var(--q-primary);
  }
}
</style> 