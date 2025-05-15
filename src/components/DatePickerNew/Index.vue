<template>
  <div class="flex">
    <div class="date-picker-new">
      <q-select
        outlined
        dense
        v-show="showSelect"
        v-model="date_type"
        :options="computedDateList"
        option-value="value"
        option-label="label"
        emit-value
        map-options
        class="filter-select"
      />
      <div class="play-date-picker">
        <img class="date-select-icon" src="@/assets/images/date-select/date.png" alt="" />
        <div class="content-box">
          <span>{{ start_date || t('开始日期') }}</span>
          <span>TO</span>
          <span>{{ end_date || t('结束日期') }}</span>
        </div>
        <q-popup-proxy v-model="componentData.showDate" cover tition-show="scale" tition-hide="scale">
          <q-date v-model="componentData.range" range @update:model-value="changeDate" />
        </q-popup-proxy>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch, computed } from 'vue';

const date_type = defineModel('date_type', {
  type: String,
  default: 'created_at',
});

const start_date = defineModel('start_date', {
  type: String,
  default: '',
});

const end_date = defineModel('end_date', {
  type: String,
  default: '',
});

const props = defineProps({
  showSelect: {
    type: Boolean,
    default: true,
  },
  dateList: {
    type: Array,
    default: () => [],
  },
});

const changeDate = (e) => {
  if (!e) {
    return;
  }
  componentData.showDate = false;
};

const computedDateList = computed(() => {
  return props.dateList.length > 0
    ? props.dateList
    : [
        { label: t('创建时间'), value: 'created_at' },
        { label: t('更新时间'), value: 'updated_at' },
      ];
});

const componentData = reactive({
  showDate: false,
  date_type: 'created_at',
  range: {},
});

watch(
  componentData,
  () => {
    if (componentData.range) {
      let list = Object.values(componentData.range);
      if (list.length) {
        let newList = list.map((item) => {
          return item.replace(/\//g, '-');
        });
        start_date.value = newList[0];
        end_date.value = newList[1];
      } else {
        start_date.value = '';
        end_date.value = '';
      }
    } else {
      start_date.value = '';
      end_date.value = '';
    }
  },
  { deep: true }
);
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
  .play-date-picker {
    width: 254px;
    display: flex;
    align-items: center;
    cursor: pointer;
    gap: 12px;
    padding-left: 14px;
    .date-select-icon {
      width: 16px;
      height: 16px;
    }
    .content-box {
      display: flex;
      justify-content: center;
      gap: 20px;
      align-items: center;
      span {
        &:nth-child(1),
        &:nth-child(3) {
          color: #999999;
        }
      }
    }
  }
}
</style>
