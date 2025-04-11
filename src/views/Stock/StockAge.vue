<template>
  <div class="stock-age">
    <div class="text-h5 q-mb-md">{{ t('库龄报表') }}</div>
  </div>
</template>

<script setup>
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>

<style lang="scss" scoped>
.stock-age {
  padding: 16px;
}
</style> 