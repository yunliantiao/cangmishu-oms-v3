<template>
  <div class="panel-page">
    <!-- 统计卡片 -->
    <div class="row q-col-gutter-md q-mb-lg">
      <div class="col-12">
        <q-card class="stats-card bg-primary text-white">
          <q-card-section class="stats-content">
            <div class="row full-width justify-between items-center">
              <!-- 库存统计 -->
              <div class="inventory-stats">
                <div class="stat-label">库存量</div>
                <div class="stat-value">0</div>
              </div>

              <!-- 入库统计 -->
              <div class="card-divider"></div>
              <div class="inbound-stats">
                <div class="stat-label">待入库</div>
                <div class="stat-value">3</div>
                <div class="stat-label">入库中</div>
                <div class="stat-value">5</div>
              </div>
              
              <!-- 标准进退入库 -->
              <div class="card-divider"></div>
              <div class="outbound-stats">
                <div class="stat-label">标准退进入库</div>
                <div class="stat-icon"><q-icon name="chevron_right" /></div>
                <div class="stat-label">待入库</div>
                <div class="stat-value">1</div>
              </div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue';

export default {
  name: 'PanelPage',
  
  setup() {
    const selectedWarehouse = ref('全部仓库');
    const warehouseOptions = [
      '全部仓库',
      'USC'
    ];

    return {
      selectedWarehouse,
      warehouseOptions
    };
  }
};
</script>

<style lang="scss" scoped>
.panel-page {
  position: relative;
  padding-right: 340px;
}

.warehouse-selector {
  .warehouse-select {
    width: 200px;
  }
}

.stats-card {
  .stats-content {
    padding: 16px 24px;
  }
  
  .card-divider {
    width: 1px;
    height: 40px;
    background: rgba(255, 255, 255, 0.3);
    margin: 0 16px;
  }
  
  .stat-label {
    font-size: 14px;
    opacity: 0.9;
    margin-bottom: 4px;
  }
  
  .stat-value {
    font-size: 24px;
    font-weight: 500;
    margin-bottom: 8px;
  }
  
  .stat-icon {
    margin: 0 8px;
  }
}

.module-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  display: flex;
  align-items: center;
}

.module-card {
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
  
  &:hover {
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  .text-h5 {
    font-weight: 600;
  }
}

// 响应式样式
@media (max-width: 1200px) {
  .panel-page {
    padding-right: 0;
  }
}

// 移动端适配
@media (max-width: 767px) {
  .panel-page {
    padding-right: 0;
  }
  
  .q-pa-md {
    padding: 8px !important;
  }
  
  .warehouse-selector {
    .warehouse-select {
      width: 100%;
    }
  }
  
  .stats-card {
    .stats-content {
      padding: 12px;
    }
    
    .row.full-width {
      flex-direction: column;
    }
    
    .card-divider {
      width: 100%;
      height: 1px;
      margin: 12px 0;
    }
    
    .stat-value {
      font-size: 20px;
      margin-bottom: 4px;
    }
    
    .inventory-stats, .inbound-stats, .outbound-stats {
      width: 100%;
      margin-bottom: 12px;
    }
  }
  
  .module-title {
    font-size: 15px;
  }
  
  .module-card {
    margin-bottom: 8px;
    
    .text-h5 {
      font-size: 18px !important;
    }
    
    .text-h6 {
      font-size: 15px !important;
    }
    
    .text-subtitle2 {
      font-size: 12px !important;
    }
    
    .q-card-section {
      padding: 12px !important;
    }
  }
  
  // 隐藏固定的右侧边栏
  .q-px-md.q-py-lg[style*="position: fixed"] {
    position: static !important;
    width: 100% !important;
    height: auto !important;
    margin-top: 20px;
  }
}

// 针对更小的屏幕
@media (max-width: 480px) {
  .q-pa-md {
    padding: 4px !important;
  }
  
  .q-col-gutter-md {
    margin: -4px 0 0 -4px;
    
    > * {
      padding: 4px 0 0 4px;
    }
  }
  
  .module-card {
    .q-card-section {
      padding: 8px !important;
    }
  }
}
</style>