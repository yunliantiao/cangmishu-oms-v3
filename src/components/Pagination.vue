<template>
  <div class="row items-center justify-end full-width custom-pagination">
    <div class="total-count">Total {{ totalCount }}</div>
    <q-pagination
      v-model="currentPage"
      :max="maxPage"
      :direction-links="true"
      :boundary-links="true"
      :max-pages="5"
      size="sm"
      class="q-mx-md"
      @update:model-value="handlePageChange"
    />
    <q-select
      v-model="rowsPerPage"
      :options="pageSizeOptions"
      label="每页显示"
      dense
      outlined
      options-dense
      style="min-width: 120px"
      @update:model-value="handleRowsPerPageChange"
    />
  </div>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue';

const props = defineProps({
  totalCount: {
    type: Number,
    default: 0
  },
  page: {
    type: Number,
    default: 1
  },
  maxPage: {
    type: Number,
    default: 1
  },
  rowsPerPage: {
    type: Number,
    default: 50
  },
  pageSizeOptions: {
    type: Array,
    default: () => [10, 20, 50, 100]
  }
});

const emit = defineEmits(['update:page', 'update:rowsPerPage', 'pageChange']);

const currentPage = ref(props.page);
const rowsPerPage = ref(props.rowsPerPage);

// 监听props变化，更新内部状态
watch(() => props.page, (newVal) => {
  currentPage.value = newVal;
});

watch(() => props.rowsPerPage, (newVal) => {
  rowsPerPage.value = newVal;
});

const handlePageChange = (page) => {
  emit('update:page', page);
  emit('pageChange', { page, rowsPerPage: rowsPerPage.value });
};

const handleRowsPerPageChange = (size) => {
  emit('update:rowsPerPage', size);
  emit('pageChange', { page: currentPage.value, rowsPerPage: size });
};
</script>

<style lang="scss" scoped>
.custom-pagination {
  padding: 8px 0;
  
  .total-count {
    margin-right: 12px;
  }
}
</style> 