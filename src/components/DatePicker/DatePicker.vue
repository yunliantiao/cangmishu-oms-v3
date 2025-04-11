<template>
  <q-input
    v-model="inputValue"
    outlined
    dense
    readonly
    :label="label"
    :placeholder="placeholder"
    :rules="rules"
    class="date-picker"
    :disable="disable"
  >
    <template v-slot:append>
      <q-icon name="event" class="cursor-pointer">
        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
          <q-date
            v-model="inputValue"
            :mask="mask"
            :locale="locale"
            :options="options ? options : undefined"
            :color="color"
            :first-day-of-week="firstDayOfWeek"
          />
        </q-popup-proxy>
      </q-icon>
    </template>
  </q-input>
</template>

<script setup>
import { defineProps, defineEmits, computed, ref, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: [String, Date, null],
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: '请选择日期'
  },
  mask: {
    type: String,
    default: 'YYYY-MM-DD'
  },
  rules: {
    type: Array,
    default: () => []
  },
  disable: {
    type: Boolean,
    default: false
  },
  options: {
    type: Function,
    default: null
  },
  color: {
    type: String,
    default: 'primary'
  },
  firstDayOfWeek: {
    type: Number,
    default: 1 // 1 代表周一开始
  },
  // 使用中文语言配置
  useChineseLocale: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['update:modelValue']);

// 内部值，用于双向绑定
const inputValue = ref(props.modelValue || '');

// 监听外部值变化
watch(() => props.modelValue, (newVal) => {
  inputValue.value = newVal || '';
});

// 监听内部值变化，向外发送更新
watch(inputValue, (newVal) => {
  emit('update:modelValue', newVal);
});

// 语言包配置
const locale = computed(() => {
  if (!props.useChineseLocale) {
    return undefined; // 使用默认语言配置
  }
  
  try {
    return {
      days: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
      daysShort: ['日', '一', '二', '三', '四', '五', '六'],
      months: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
      monthsShort: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
    };
  } catch (error) {
    console.error('Error in DatePicker locale', error);
    return undefined;
  }
});
</script>

<style lang="scss" scoped>
.date-picker {
  width: 100%;
}
</style>
