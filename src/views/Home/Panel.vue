<template>
  <div class="panel-page">
    <div class="total-list row q-col-gutter-lg q-mb-md">
      <div class="col-12 col-sm-4 col-md-2-4" v-for="item in totalList" :key="item.label">
        <q-card class="common-card b-rd-16">
          <q-card-section class="p-20">
            <div class="text-grey-8 text-subtitle2 q-mb-md">
              {{ item.label }}
            </div>
            <div class="text-primary text-h5">{{ item.value }}</div>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <div class="row q-col-gutter-x-md">
      <!-- 左侧主要内容区域 -->
      <div class="col-xs-12 col-sm-8 col-md-8 col-lg-8">
        <!-- 单量统计 -->
        <q-card>
          <q-card-section>
            <div class="row q-mb-md items-center justify-between">
              <div>
                <span class="text-h6 font-bold">{{ t('单量统计') }}</span>
                <span class="text-grey-7">({{ t('单') }})</span>
              </div>
              <div class="time-range-group">
                <div class="time-range-list">
                  <div
                    v-for="(item, index) in timeOptions"
                    :key="index"
                    :class="['time-range-item', { active: timeRange === item.value }]"
                    @click="onChangeTimeRange(item)"
                  >
                    {{ item.label }}
                  </div>
                </div>
              </div>
            </div>

            <q-card-section class="p-0 m-b-20">
              <div class="row type-btn q-col-gutter-sm">
                <div>
                  <div class="item item-1 col-12 col-sm-4 col-md-3">
                    <div class="label">{{ t('一件代发') }}</div>
                    <div class="value">
                      {{ chartDataObj.seriesData1.reduce((a, b) => a + b, 0) }}
                    </div>
                  </div>
                </div>
                <div>
                  <div class="item item-2 col-12 col-sm-4 col-md-3">
                    <div class="label">{{ t('标准入库') }}</div>
                    <div class="value">
                      {{ chartDataObj.seriesData2.reduce((a, b) => a + b, 0) }}
                    </div>
                  </div>
                </div>
              </div>
            </q-card-section>
            <!-- 图表 -->
            <div ref="chartRef" style="height: 400px"></div>
          </q-card-section>
        </q-card>
      </div>

      <!-- 联系我们+公告 -->
      <div class="col-12 col-xs-12 col-sm-4 col-md-4">
        <q-card class="q-mb-md">
          <div class="contact-box bg-white">
            <div class="text-subtitle1 q-mb-md">{{ t('联系我们') }}</div>
            <div class="line q-mb-md"></div>
            <div class="q-mb-md row items-center" @click="onClickPhone('15576601706')">
              <q-icon name="phone" size="xs" class="q-mr-sm" />
              <span class="hover-copy">+86 15576601706</span>
            </div>
            <div class="row items-center" @click="onClickEmail('Hubinjie@Tongxiao.Tech')">
              <q-icon name="email" size="xs" class="q-mr-sm" />
              <span class="hover-copy">Hubinjie@Tongxiao.Tech</span>
            </div>
          </div>
        </q-card>

        <q-card class="common-card b-rd-16 notice-box">
          <q-card-section class="p-20">
            <div class="flex-between-center">
              <div class="text-subtitle1 font-bold">
                {{ t('系统公告') }}
              </div>
              <q-btn flat color="primary" size="sm" icon="chevron_right" dense />
            </div>
            <q-scroll-area class="notice-list">
              <div v-for="item in noticeList" :key="item.label" class="notice-item">
                <div class="title text-overflow-1">{{ item.label }}</div>
                <div class="time">{{ item.time }}</div>
              </div>
            </q-scroll-area>
          </q-card-section>
        </q-card>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, nextTick, reactive } from 'vue';
import * as echarts from 'echarts';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import api from '@/api/index';
import { Notify } from 'quasar';

export default {
  name: 'PanelPage',

  setup() {
    const selectedWarehouse = ref('USC');
    const warehouseOptions = ['USC'];
    const dateRange = ref('');
    const router = useRouter();
    const { t } = useI18n();

    // 时间范围
    const timeRange = ref('week');
    // 时间选项
    const timeOptions = [
      // {
      //   label: t('昨天'),
      //   value: 'yesterday',
      //   getDateRange: () => {
      //     const yesterday = new Date();
      //     yesterday.setDate(yesterday.getDate() - 1);
      //     const dateStr = formatDate(yesterday);
      //     return { start_date: dateStr, end_date: dateStr };
      //   },
      // },
      // {
      //   label: t('今天'),
      //   value: 'today',
      //   getDateRange: () => {
      //     const today = formatDate(new Date());
      //     return { start_date: today, end_date: today };
      //   },
      // },
      {
        label: t('星期'),
        value: 'week',
        getDateRange: () => {
          const now = new Date();
          const weekStart = new Date(now);
          // 获取当前是周几（0-6，0代表周日）
          const currentDay = now.getDay();
          // 往前推到本周一
          weekStart.setDate(weekStart.getDate() - (currentDay === 0 ? 6 : currentDay - 1));
          weekStart.setHours(0, 0, 0, 0);
          return {
            start_date: formatDate(weekStart),
            end_date: formatDate(now),
          };
        },
      },
      {
        label: t('月'),
        value: 'month',
        getDateRange: () => {
          const now = new Date();
          const monthStart = new Date(now);
          // 获取当前日期
          const currentDate = now.getDate();
          // 往前推到本月1号
          monthStart.setDate(1);
          monthStart.setHours(0, 0, 0, 0);
          return {
            start_date: formatDate(monthStart),
            end_date: formatDate(now),
          };
        },
      },
      {
        label: t('年'),
        value: 'year',
        getDateRange: () => {
          const now = new Date();
          const yearStart = new Date(now);
          // 往前推到本年1月1号
          yearStart.setMonth(0, 1);
          yearStart.setHours(0, 0, 0, 0);
          return {
            start_date: formatDate(yearStart),
            end_date: formatDate(now),
          };
        },
      },
    ];
    // 日期格式化函数
    const formatDate = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    // 修改图标的日期范围
    const onChangeTimeRange = (item) => {
      timeRange.value = item.value;
      // const dateRange = item.getDateRange();
      // getHomeChart(dateRange);
    };

    const totalList = computed(() => {
      return [
        {
          label: t('处理中'),
          value: reportObj.inbound_orders_count.inbound_processing_count,
        },
        {
          label: t('运输中'),
          value: reportObj.inbound_orders_count.in_transit_count,
        },
        {
          label: t('待发货'),
          value: reportObj.outbound_orders_count.pending_shipment_count,
        },
        {
          label: t('待包装'),
          value: reportObj.outbound_orders_count.pending_pack_count,
        },
        {
          label: t('异常订单'),
          value: reportObj.outbound_orders_count.exception_count,
        },
      ];
    });

    // 图表数据-订单量
    const chartDataObj = ref({
      xAxisData: [],
      seriesData1: [],
      seriesData2: [],
    });
    // echarts渲染用
    const chartData = computed(() => ({
      grid: {
        left: 10,
        right: 10,
        bottom: 10,
        top: 10,
        containLabel: true,
      },
      tooltip: {
        trigger: 'axis',
        formatter: function (params) {
          let result = params[0].axisValue + '<br/>';
          params.forEach((item) => {
            result += `${item.marker} ${item.seriesName}: ${item.value}<br/>`;
          });
          return result;
        },
      },
      xAxis: {
        type: 'category',
        data: chartDataObj.value.xAxisData,
        axisTick: {
          alignWithLabel: true,
          inside: true,
        },
        axisLabel: {
          margin: 8,
        },
      },
      yAxis: {
        type: 'value',
        axisTick: {
          inside: true,
        },
        axisLabel: {
          margin: 8,
        },
      },
      series: [
        {
          name: t('一件代发'),
          type: 'line',
          smooth: true,
          data: chartDataObj.value.seriesData1,
          areaStyle: {
            opacity: 0.7, // 增加不透明度以更好显示渐变
            color: {
              // 线性渐变配置
              type: 'linear',
              x: 0,
              y: 0, // 起点
              x2: 0,
              y2: 1, // 终点 (垂直向下)
              colorStops: [
                { offset: 0, color: '#0E6CFA' }, // 曲线颜色
                { offset: 1, color: 'rgba(255,255,255,0)' }, // 完全透明
              ],
              global: false, // 不全局渐变
            },
          },
          lineStyle: {
            width: 2,
            color: '#0E6CFA',
          },
        },
        {
          name: t('标准入库'),
          type: 'line',
          smooth: true,
          data: chartDataObj.value.seriesData2,
          areaStyle: {
            opacity: 0.7,
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: '#5745C5' },
                { offset: 1, color: 'rgba(255,255,255,0)' },
              ],
              global: false,
            },
          },
          lineStyle: {
            width: 2,
            color: '#5745C5',
          },
        },
      ],
    }));
    const chartRef = ref(null); // 标签用ref,就无需document获取
    let chartInstance = null;
    const initChart = () => {
      // chartRef.value = document.getElementById('order-chart');
      if (!chartRef.value) return;
      chartInstance = echarts.init(chartRef.value);
      chartInstance.setOption(chartData.value);
    };

    const handleResize = () => {
      if (chartInstance) {
        chartInstance.resize();
      }
    };

    const getHomeChart = () => {
      api.homeChart().then((res) => {
        console.log(res);
        setChartData(res.data);
      });
      // const data = {
      //   inbound_orders: [
      //     {
      //       date: '2025-04-24',
      //       count: 2,
      //     },
      //     {
      //       date: '2025-04-27',
      //       count: 2,
      //     },
      //     {
      //       date: '2025-04-29',
      //       count: 1,
      //     },
      //     {
      //       date: '2025-04-30',
      //       count: 1,
      //     },
      //     {
      //       date: '2025-05-02',
      //       count: 1,
      //     },
      //     {
      //       date: '2025-05-09',
      //       count: 1,
      //     },
      //     {
      //       date: '2025-05-13',
      //       count: 1,
      //     },
      //     {
      //       date: '2025-05-14',
      //       count: 8,
      //     },
      //     {
      //       date: '2025-05-15',
      //       count: 2,
      //     },
      //   ],
      //   outbound_orders: [
      //     {
      //       date: '2025-04-27',
      //       count: 2,
      //     },
      //     {
      //       date: '2025-04-29',
      //       count: 4,
      //     },
      //     {
      //       date: '2025-04-30',
      //       count: 9,
      //     },
      //     {
      //       date: '2025-05-01',
      //       count: 3,
      //     },
      //     {
      //       date: '2025-05-06',
      //       count: 1,
      //     },
      //     {
      //       date: '2025-05-07',
      //       count: 2,
      //     },
      //     {
      //       date: '2025-05-08',
      //       count: 3,
      //     },
      //     {
      //       date: '2025-05-09',
      //       count: 6,
      //     },
      //     {
      //       date: '2025-05-12',
      //       count: 1,
      //     },
      //     {
      //       date: '2025-05-13',
      //       count: 5,
      //     },
      //     {
      //       date: '2025-05-14',
      //       count: 2,
      //     },
      //   ],
      // };
      // setChartData(data);
    };
    // 设置图表数据
    const setChartData = (chartObj) => {
      const inbound = chartObj.inbound_orders || [];
      const outbound = chartObj.outbound_orders || [];

      // 获取所有不重复的日期，并按时间升序排列
      const allDates = Array.from(new Set([...inbound.map((i) => i.date), ...outbound.map((i) => i.date)])).sort();

      // 将日期转为一个 Map 方便查找
      const inboundMap = new Map(inbound.map((item) => [item.date, item.count]));
      const outboundMap = new Map(outbound.map((item) => [item.date, item.count]));

      // 填充缺失值为 0
      chartDataObj.value.xAxisData = allDates;
      chartDataObj.value.seriesData1 = allDates.map((date) => inboundMap.get(date) || 0);
      chartDataObj.value.seriesData2 = allDates.map((date) => outboundMap.get(date) || 0);
      initChart();
    };

    // 所有数据
    const reportObj = reactive({
      // 入库订单统计
      inbound_orders_count: {
        in_transit_count: 0, // 运输中入库单数量
        inbound_processing_count: 0, // 入库处理中数量
      },
      // 出库订单统计
      outbound_orders_count: {
        pending_shipment_count: 0, // 待发货数量
        pending_pack_count: 0, // 待包装数量
        exception_count: 0, // 异常订单数量
      },
    });
    const getReport = () => {
      api.homeReport().then((res) => {
        Object.assign(reportObj, res.data);
      });
    };

    // 公告列表
    const noticeList = ref([
      {
        label: '如何设置仓库/货区/货位',
        desc: '如何设置仓库/货区/货位',
        time: '2022-07-01 12:00:00',
      },
      {
        label: '如何设置仓租策略',
        desc: '如何设置仓租策略',
        time: '2022-07-01 12:00:00',
      },
      {
        label: '如何在操作中再及操作库策略',
        desc: '如何在操作中再及操作库策略',
        time: '2022-07-01 12:00:00',
      },
      {
        label: '如何设置计费模板',
        desc: '如何设置计费模板',
        time: '2022-07-01 12:00:00',
      },
      {
        label: '如何创建客户',
        desc: '如何创建客户',
        time: '2022-07-01 12:00:00',
      },
      {
        label: '其他问题',
        desc: '其他问题',
        time: '2022-07-01 12:00:00',
      },
    ]);

    const onClickEmail = (email) => {
      window.location.href = `mailto:${email}`;
    };
    const onClickPhone = (phone) => {
      // 检查是否是移动设备
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

      if (isMobile) {
        // 移动设备使用 tel: 协议
        window.location.href = `tel:+86${phone}`;
      } else {
        // PC端复制到剪贴板
        navigator.clipboard.writeText(phone).then(() => {
          Notify.create({
            message: trans('电话号码已复制到剪贴板'),
            color: 'positive',
          });
        });
      }
    };

    onMounted(() => {
      // 初始化图表
      getHomeChart();
      getReport();
      nextTick(() => {
        window.addEventListener('resize', handleResize);
      });
    });

    return {
      selectedWarehouse,
      warehouseOptions,
      dateRange,
      chartRef,
      router,
      timeOptions,
      timeRange,
      chartDataObj,
      totalList,
      noticeList,
      onClickEmail,
      onClickPhone,
      onChangeTimeRange,
    };
  },
};
</script>

<style lang="scss" scoped>
.panel-page {
  // 统一所有卡片的圆角样式
  :deep(.q-card) {
    border-radius: 8px;
  }

  // 自定义列宽
  :deep(.col-md-2-4) {
    @media (min-width: 1024px) {
      width: 20%;
      flex: 0 0 20%;
    }
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

  // 时间范围选择
  .time-range-group {
    .time-range-list {
      display: flex;
      border-radius: 4px;
      overflow: hidden;

      .time-range-item {
        padding: 6px 16px;
        font-size: 14px;
        color: #606266;
        cursor: pointer;
        background: #fff;
        border: 1px solid #dcdfe6;
        margin-left: -1px; // 边框重叠效果
        position: relative; // 用于选中时边框层级

        &:first-child {
          margin-left: 0;
          border-radius: 4px 0 0 4px;
        }
        &:last-child {
          border-radius: 0 4px 4px 0;
        }

        &:hover {
          color: var(--q-primary);
          z-index: 1;
        }

        &.active {
          color: var(--q-primary);
          border-color: var(--q-primary);
          z-index: 2; // 确保选中项的边框在最上层
        }
      }
    }
  }
  // 图表类型
  .type-btn {
    .item {
      padding: 15px 20px;
      border: 1px solid #e6e6e6;
      border-radius: 9px;
      position: relative;
      min-width: 150px;
      height: 80px;
      box-sizing: border-box;
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 10px;
        height: 100%;
        border-radius: 9px 0 0 9px;
      }
      .label {
        font-size: 14px;
        line-height: 18px;
        color: #666;
        margin-bottom: 10px;
      }
      .value {
        font-size: 20px;
        line-height: 24px;
        color: #333;
        font-weight: bold;
      }
    }
    .item-1 {
      &::before {
        background: #0e6cfa;
      }
    }
    .item-2 {
      &::before {
        background: #5745c5;
      }
    }
  }
  // 2 联系我们
  .contact-box {
    padding: 20px;
    border-radius: 16px;
    .line {
      height: 1px;
      width: 100%;
      background-color: #e6e6e6;
    }
  }
  // 5 公告
  .notice-box {
    height: 310px;
    box-sizing: border-box;
    .notice-list {
      overflow-y: auto;
      height: 240px;
      .notice-item {
        padding: 10px 0;
        border-bottom: 1px solid #e6e6e6;
        .title {
          cursor: pointer;
          font-size: 14px;
          color: #1f1f1f;
          line-height: 18px;
          margin-bottom: 6px;
          &:hover {
            color: $primary;
          }
        }
        .time {
          color: #666666;
          font-size: 12px;
        }
      }
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
