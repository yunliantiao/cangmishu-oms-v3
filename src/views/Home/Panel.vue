<template>
  <div class="panel-page">
    <div class="row q-gutter-x-md">
      <!-- 左侧主要内容区域 -->
      <div class="col">
        <!-- 顶部选择器 -->
        <div class="row items-center q-mb-md">
          <q-card class="warehouse-select-card full-width">
            <q-card-section class="q-pa-sm">
              <q-select
                v-model="selectedWarehouse"
                :options="warehouseOptions"
                outlined
                dense
                class="warehouse-select"
                style="width: 200px"
                bg-color="white"
              />
            </q-card-section>
          </q-card>
        </div>

        <!-- 统计卡片 -->
        <div class="row q-col-gutter-md q-mb-lg">
          <div class="col-12">
            <q-card class="stats-card" style="background: #001529; color: white;">
              <q-card-section>
                <div class="row no-wrap">
                  <!-- 标准入库 -->
                  <div class="stats-group">
                    <div class="stats-title">{{ $t('标准入库') }}</div>
                    <div class="row q-gutter-x-lg">
                      <div class="stats-item">
                        <div class="label">{{ $t('运输中') }}</div>
                        <div class="value">1</div>
                      </div>
                      <div class="stats-item">
                        <div class="label">{{ $t('待入库') }}</div>
                        <div class="value">1</div>
                      </div>
                    </div>
                  </div>

                  <!-- 一件代发入库 -->
                  <div class="stats-group">
                    <div class="stats-title">{{ $t('一件代发入库') }}</div>
                    <div class="row">
                      <div class="stats-item">
                        <div class="label">{{ $t('待发货') }}</div>
                        <div class="value">43</div>
                      </div>
                    </div>
                  </div>

                  <!-- B2B入库 -->
                  <div class="stats-group">
                    <div class="stats-title">{{ $t('B2B入库') }}</div>
                    <div class="row q-gutter-x-lg">
                      <div class="stats-item">
                        <div class="label">{{ $t('运输中') }}</div>
                        <div class="value">0</div>
                      </div>
                      <div class="stats-item">
                        <div class="label">{{ $t('待入库') }}</div>
                        <div class="value">2</div>
                      </div>
                    </div>
                  </div>

                  <!-- B2B出库 -->
                  <div class="stats-group">
                    <div class="stats-title">{{ $t('B2B出库') }}</div>
                    <div class="row q-gutter-x-lg">
                      <div class="stats-item">
                        <div class="label">{{ $t('待出库') }}</div>
                        <div class="value">0</div>
                      </div>
                      <div class="stats-item">
                        <div class="label">{{ $t('待发货') }}</div>
                        <div class="value">0</div>
                      </div>
                    </div>
                  </div>

                  <!-- FBA退货 -->
                  <div class="stats-group">
                    <div class="stats-title">{{ $t('FBA退货') }}</div>
                    <div class="row q-gutter-x-lg">
                      <div class="stats-item">
                        <div class="label">{{ $t('入库中') }}</div>
                        <div class="value">0</div>
                      </div>
                      <div class="stats-item">
                        <div class="label">{{ $t('待出库') }}</div>
                        <div class="value">0</div>
                      </div>
                    </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- 单量统计 -->
        <q-card class="q-mb-md">
          <q-card-section>
            <div class="row q-mb-md items-center justify-between">
              <div class="text-h6">{{ $t('单量统计') }}</div>
              <div class="row items-center q-gutter-sm">
                <q-btn-group flat>
                  <q-btn :label="$t('本周')" color="primary" flat />
                  <q-btn :label="$t('本月')" color="primary" flat />
                  <q-btn :label="$t('本年')" color="primary" flat />
                </q-btn-group>
                <q-input
                  v-model="dateRange"
                  filled
                  dense
                  type="date"
                  style="width: 200px"
                />
                <q-btn :label="$t('导出')" color="primary" flat />
              </div>
            </div>

            <!-- 统计数据卡片 -->
            <div class="row q-col-gutter-md q-mb-lg">
              <div class="col-2">
                <q-card class="text-center">
                  <q-card-section>
                    <div class="text-subtitle2">{{ $t('一件代发') }}</div>
                    <div class="text-h5 text-primary">48</div>
                  </q-card-section>
                </q-card>
              </div>
              <div class="col-2">
                <q-card class="text-center">
                  <q-card-section>
                    <div class="text-subtitle2">{{ $t('标准入库') }}</div>
                    <div class="text-h5 text-primary">13</div>
                  </q-card-section>
                </q-card>
              </div>
            </div>

            <!-- 图表 -->
            <div ref="chartRef" style="height: 300px"></div>
          </q-card-section>
        </q-card>
      </div>

      <!-- 右侧账户信息区域 -->
      <div class="col-auto" style="width: 400px;">
        <q-card class="account-info-card">
          <q-card-section>
            <!-- 总可用金额 -->
            <div class="account-section">
              <div class="row items-center justify-between q-mb-sm">
                <div class="text-subtitle1">{{ $t('总可用金额') }} (USD)</div>
                <q-icon name="help_outline" size="xs" class="cursor-pointer" color="grey" />
              </div>
              <div class="text-h4 text-primary">999,871.44</div>
            </div>

            <!-- 可用余额 -->
            <div class="account-section">
              <div class="row items-center justify-between q-mb-sm">
                <div class="text-subtitle1">{{ $t('可用余额') }} (USD)</div>
                <q-btn :label="$t('立即充值')" color="primary" flat dense />
              </div>
              <div class="text-h6 q-mb-xs">0</div>
              <div class="text-caption text-grey">
                <span class="q-mr-md">{{ $t('代金券') }}: 0</span>
                <span>{{ $t('充值金额') }}: 0</span>
              </div>
            </div>

            <!-- 可用信用额度 -->
            <div class="account-section">
              <div class="text-subtitle1 q-mb-sm">{{ $t('可用信用额度') }} (USD)</div>
              <div class="text-h6 q-mb-xs">999,871.44</div>
              <div class="text-caption text-grey">{{ $t('总额度') }}: 1,000,000</div>
            </div>

            <!-- 流植费用 -->
            <div class="account-section">
              <div class="text-subtitle1 q-mb-sm">{{ $t('流植费用') }} (USD)</div>
              <div class="text-h6 text-negative">0</div>
            </div>
          </q-card-section>
        </q-card>

        <!-- 系统公告 -->
        <q-card class="q-mt-md">
          <q-card-section>
            <div class="row items-center justify-between q-mb-md">
              <div class="text-subtitle1">{{ $t('系统公告') }}</div>
              <q-btn flat dense :label="$t('更多') + ' >'" color="primary" />
            </div>
            <div class="notice-item q-mb-sm">
              <div class="text-body2">Temu 平台 美国站点 店铺里面的订单 仅可通过平台面单方式...</div>
              <div class="text-caption text-grey">2025-03-30 18:57</div>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import * as echarts from 'echarts';

export default {
  name: 'PanelPage',
  
  setup() {
    const selectedWarehouse = ref('USC');
    const warehouseOptions = ['USC'];
    const dateRange = ref('');
    const chartRef = ref(null);

    // 初始化图表
    onMounted(() => {
      const chart = echarts.init(chartRef.value);
      const option = {
        tooltip: {
          trigger: 'axis'
        },
        xAxis: {
          type: 'category',
          data: ['04-07', '04-08', '04-09', '04-10', '04-11']
        },
        yAxis: {
          type: 'value'
        },
        series: [{
          data: [10, 5, 25, 15, 12],
          type: 'line',
          smooth: true,
          areaStyle: {
            opacity: 0.3
          }
        }]
      };
      chart.setOption(option);

      // 响应式调整
      window.addEventListener('resize', () => {
        chart.resize();
      });
    });

    return {
      selectedWarehouse,
      warehouseOptions,
      dateRange,
      chartRef
    };
  }
};
</script>

<style lang="scss" scoped>
.panel-page {
  // 统一所有卡片的圆角样式
  :deep(.q-card) {
    border-radius: 8px;
  }

  .warehouse-select-card {
    background: white;
    
    :deep(.q-field) {
      .q-field__control {
        border-radius: 4px;
      }
    }
  }

  .stats-card {
    background: #001529;
    
    .stats-group {
      flex: 1;
      padding: 0 24px;
      border-right: 1px solid rgba(255, 255, 255, 0.3);
      
      &:last-child {
        border-right: none;
      }
      
      .stats-title {
        font-size: 14px;
        margin-bottom: 16px;
        opacity: 0.9;
      }
      
      .stats-item {
        text-align: center;
        min-width: 80px;
        
        .label {
          font-size: 14px;
          opacity: 0.9;
          margin-bottom: 8px;
        }
        
        .value {
          font-size: 24px;
          font-weight: 500;
        }
      }
    }
  }

  .account-info-card {
    .account-section {
      padding: 16px 0;
      border-bottom: 1px solid rgba(0, 0, 0, 0.08);

      &:first-child {
        padding-top: 0;
      }

      &:last-child {
        padding-bottom: 0;
        border-bottom: none;
      }

      .text-h4 {
        color: #1976d2;
        font-weight: 500;
        margin: 0;
      }
      
      .text-h6 {
        font-weight: 500;
        margin: 0;
      }

      .text-subtitle1 {
        color: rgba(0, 0, 0, 0.7);
      }
    }
  }

  .notice-item {
    .text-body2 {
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  }

  // 移动端适配
  @media (max-width: 1024px) {
    .panel-page {
      .stats-card {
        .stats-group {
          padding: 10px;
          
          .stats-item {
            .value {
              font-size: 20px;
            }
          }
        }
      }
    }
  }
}
</style>