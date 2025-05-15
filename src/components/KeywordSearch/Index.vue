<template>
  <div class="flex">
    <div class="date-picker-new">
      <q-select
        outlined
        dense
        v-show="showSearchType"
        v-model="search_type"
        :options="computedTypeList"
        option-value="value"
        option-label="label"
        emit-value
        map-options
        class="filter-select"
      />
      <div class="play-date-picker">
        <q-input outlined dense class="input-box" v-model="search_value" :placeholder="t('请输入')" />
      </div>
      <q-select
        outlined
        dense
        v-show="showSearchMode"
        v-model="search_mode"
        :options="computedModeList"
        option-value="value"
        option-label="label"
        emit-value
        map-options
        class="filter-select br-none"
      />
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n({ useScope: 'global' });

const search_type = defineModel('search_type', {
  type: String,
  default: '',
});

const search_value = defineModel('search_value', {
  type: String,
  default: '',
});

const search_mode = defineModel('search_mode', {
  type: String,
  default: '',
});

const props = defineProps({
  showSearchType: {
    type: Boolean,
    default: true,
  },
  showSearchMode: {
    type: Boolean,
    default: true,
  },
  searchTypeList: {
    type: Array,
    default: () => [],
  },
  searchModeList: {
    type: Array,
    default: () => [],
  },
});

// 使用计算属性生成Type列表
const computedTypeList = computed(() => {
  // 如果父组件传递了 searchTypeList，则使用它
  if (props.searchTypeList && props.searchTypeList.length > 0) {
    return props.searchTypeList;
  }
  return [
    { label: t('运单号'), value: 'tracking_number' },
    { label: t('包裹号'), value: 'package_number' },
    { label: t('订单号'), value: 'order_number' },
  ];
});
// 使用计算属性生成Mode列表
const computedModeList = computed(() => {
  // 如果父组件传递了 searchModeList，则使用它
  if (props.searchModeList && props.searchModeList.length > 0) {
    return props.searchModeList;
  }
  return [
    { label: t('精确搜索'), value: 'exact' },
    { label: t('模糊搜索'), value: 'fuzzy' },
    { label: t('前缀搜索'), value: 'prefix' },
  ];
});
</script>

<style scoped lang="scss">
.date-picker-new {
  border-radius: 4px;
  height: 40px;
  display: flex;
  border: 1px solid rgba(0, 0, 0, 0.24);
  background: #ffffff;
  .filter-select {
    border-right: 1px solid rgba(0, 0, 0, 0.24);
    width: 132px;
    :deep(.q-field__control:before) {
      border: none;
    }
  }
  .br-none {
    border-right: none;
    border-left: 1px solid rgba(0, 0, 0, 0.24);
  }
  .play-date-picker {
    .input-box {
      :deep(.q-field__control:before) {
        border: none;
      }
    }
  }
}
</style>
