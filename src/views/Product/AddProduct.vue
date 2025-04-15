<template>
  <div>
    <q-form @submit="saveProductInfo">
      <div class="text-h5 q-mb-md">
        {{ route.query.id ? t("编辑产品") : t("添加产品") }}
      </div>

      <div class="compile-product">
        <div ref="containerRef" class="product-content">
          <!-- 基础信息卡片 -->
          <q-card class="box-card q-mb-lg" flat id="base-content">
            <q-card-section class="q-pb-none">
              <div class="text-h6 bg-white q-pa-sm">{{ t('基础信息') }}</div>
            </q-card-section>

            <q-card-section>
              <div class="row q-col-gutter-lg">
                <!-- 产品图片 -->
                <div class="col-12">
                  <div class="q-mb-md">{{ t('产品图片') }}</div>

                  <div class="full-width">
                    <upload-image
                      v-model="images"
                      :main-image="main_image"
                      @mainImageUpdate="mainImageUpdate"
                    />
                    <div class="text-negative" v-if="images.length == 0">
                      {{ t('请上传产品图片') }}
                    </div>
                  </div>
                </div>

                <!-- 产品名称 -->
                <div class="col-12">
                  <q-input
                    v-model="product.name"
                    :label="t('产品名称')"
                    outlined
                    lazy-rules
                    dense
                    :placeholder="t('请输入产品名称')"
                    :rules="[(val) => !!val || t('请输入产品名称')]"
                    class="product-name"
                    :hint="t('请输入规范的产品名称，便于识别和管理')"
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- 规格信息卡片 -->
          <q-card class="box-card q-mb-lg" flat id="spec-content">
            <q-card-section class="q-pb-none">
              <div class="text-h6 bg-white q-pa-sm">{{ t('商品规格') }}</div>
            </q-card-section>

            <q-card-section class="q-pa-md">
              <div class="sku-list">
                <div class="row justify-end items-center q-mb-md">
                  <q-btn
                    color="primary"
                    outline
                    icon="add"
                    :label="t('添加规格')"
                    @click="addSkuRow"
                  />
                </div>
                <q-form>
                  <q-table
                    :rows="product.sku_list"
                    :columns="skuColumns"
                    row-key="sku"
                    :pagination="{ rowsPerPage: 0 }"
                    flat
                    bordered
                    hide-pagination
                  >
                    <template v-slot:body="props">
                      <q-tr :props="props">
                        <q-td key="image" :props="props">
                          <div class="flex justify-center">
                            <q-file
                              v-model="fileModels[props.rowIndex]"
                              accept="image/*"
                              @update:model-value="(file) => uploadSkuImage(file, props.rowIndex)"
                              class="hidden"
                            >
                              <template v-slot:prepend>
                                <q-icon name="attach_file" />
                              </template>
                            </q-file>
                            <div
                              class="image-uploader"
                              @click="triggerFileInput(props.rowIndex)"
                            >
                              <q-img
                                v-if="props.row.image"
                                :src="props.row.image"
                                class="sku-image"
                              />
                              <div v-else class="upload-placeholder">
                                <q-icon name="image" size="20px" />
                                <div class="text-caption">{{ t('上传图片') }}</div>
                              </div>
                              <q-circular-progress
                                v-if="props.row.percent && props.row.percent < 100"
                                class="upload-progress"
                                :value="props.row.percent"
                                size="40px"
                                color="primary"
                                show-value
                                font-size="8px"
                              />
                            </div>
                          </div>
                        </q-td>

                        <q-td key="sku" :props="props">
                          <div class="flex justify-center">
                            <q-input
                              v-model="props.row.sku"
                              dense
                              outlined
                              :placeholder="t('请输入SKU ID')"
                              class="sku-input"
                            />
                          </div>
                        </q-td>

                        <q-td key="name" :props="props">
                          <div class="flex justify-center">
                            <q-input
                              v-model="props.row.name"
                              dense
                              outlined
                              :placeholder="t('请输入规格名称')"
                              class="sku-input"
                            />
                          </div>
                        </q-td>

                        <q-td key="dimensions" :props="props">
                          <div class="flex justify-center q-gutter-x-xs">
                            <q-input
                              v-model="props.row.size_length"
                              dense
                              outlined
                              type="number"
                              min="0"
                              class="dimension-input"
                            />
                            <q-input
                              v-model="props.row.size_width"
                              dense
                              outlined
                              type="number"
                              min="0"
                              class="dimension-input"
                            />
                            <q-input
                              v-model="props.row.size_height"
                              dense
                              outlined
                              type="number"
                              min="0"
                              class="dimension-input"
                            />
                          </div>
                        </q-td>

                        <q-td key="weight" :props="props">
                          <div class="flex justify-center">
                            <q-input
                              v-model="props.row.weight"
                              dense
                              outlined
                              type="number"
                              min="0"
                              class="sku-input"
                            />
                          </div>
                        </q-td>

                        <q-td key="operations" :props="props">
                          <div class="flex justify-center">
                            <q-btn
                              flat
                              dense
                              color="negative"
                              icon="delete"
                              @click="deleteSkuRow(props.rowIndex)"
                              :disable="product.sku_list.length <= 1"
                            />
                          </div>
                        </q-td>
                      </q-tr>
                    </template>
                  </q-table>
                </q-form>
              </div>
            </q-card-section>
          </q-card>

          <!-- 申报信息卡片 -->
          <q-card class="box-card q-mb-lg" flat id="declare-content">
            <q-card-section class="q-pb-none">
              <div class="text-h6 bg-white q-pa-sm">{{ t('商品价格') }}</div>
            </q-card-section>

            <q-card-section>
              <div class="row q-col-gutter-lg">
                <!-- 申报中文名 -->
                <div class="col-12 col-md-4">
                  <q-input
                    v-model="product.customs_name_cn"
                    :label="t('申报中文名')"
                    outlined
                    dense
                    maxlength="100"
                    counter
                    :rules="[(val) => !!val || t('请输入申报中文名')]"
                  >
                    <template v-slot:append>
                      {{
                        product.customs_name_cn
                          ? product.customs_name_cn.length
                          : 0
                      }}
                      / 100
                    </template>
                  </q-input>
                </div>

                <!-- 申报英文名 -->
                <div class="col-12 col-md-4">
                  <q-input
                    v-model="product.customs_name_en"
                    :label="t('申报英文名')"
                    outlined
                    dense
                    maxlength="100"
                    counter
                    :rules="[(val) => !!val || t('请输入申报英文名')]"
                  >
                    <template v-slot:append>
                      {{
                        product.customs_name_en
                          ? product.customs_name_en.length
                          : 0
                      }}
                      / 100
                    </template>
                  </q-input>
                </div>

                <!-- 申报价格 -->
                <div class="col-12 col-md-4">
                  <div class="row">
                    <div class="col">
                      <q-input
                        v-model="product.customs_price"
                        :label="t('申报价格')"
                        outlined
                        dense
                        type="text"
                        :rules="[
                          (val) => !!val || t('请输入申报价格'),
                          (val) => /^\d*\.?\d*$/.test(val) || t('请输入有效的数字')
                        ]"
                      />
                    </div>
                    <div class="col-auto q-ml-md">
                      <q-select
                        v-model="product.customs_currency"
                        :options="currenciesList.map(item => ({
                          label: item.name,
                          value: item.code
                        }))"
                        outlined
                        dense
                        options-dense
                        emit-value
                        map-options
                        style="width: 100px"
                      />
                    </div>
                  </div>
                </div>

                <!-- 报关属性 -->
                <div class="col-12 col-md-4">
                  <q-select
                    v-model="product.customs_type"
                    :label="t('报关属性')"
                    outlined
                    dense
                    :options="customsTypesList.map(item => ({
                      label: item.name,
                      value: item.code
                    }))"
                    emit-value
                    map-options
                    :rules="[(val) => !!val || t('请选择报关属性')]"
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- 产品详情卡片 -->
          <q-card class="box-card q-mb-lg" flat id="detail-content">
            <q-card-section class="q-pb-none">
              <div class="text-h6 bg-white q-pa-sm">{{ t('商品描述') }}</div>
            </q-card-section>

            <q-card-section class="q-pa-md">
              <div class="content">
                <editor-model 
                  :content="product.description" 
                  @change="changeDesc"
                  editor-id="product-description-editor"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>

        <!-- 底部固定操作栏 -->
        <div class="fixed-bottom-bar">
          <div class="row justify-center q-pa-md">
            <q-btn outline :label="t('取消')" color="grey-7" @click="$router.back()" />
            <q-btn
              color="primary"
              :label="t('保存')"
              type="submit"
              :loading="$store.state.btnLoading"
              class="q-mx-sm"
            />
          </div>
        </div>

        <!-- 底部占位,防止内容被固定栏遮挡 -->
        <div class="bottom-placeholder" />

        <!-- 右侧导航锚点 -->
        <!-- <div class="right-nav">
          <q-list bordered class="rounded-borders bg-white">
            <q-item
              v-for="item in [
                { href: '#base-content', title: '基础信息', icon: 'info' },
                {
                  href: '#declare-content',
                  title: '申报信息',
                  icon: 'assignment',
                },
                { href: '#spec-content', title: '规格信息', icon: 'tune' },
                {
                  href: '#detail-content',
                  title: '产品详情',
                  icon: 'description',
                },
              ]"
              :key="item.href"
              clickable
              v-ripple
              :active="currentAnchor === item.href"
              @click="scrollToAnchor(item.href)"
            >
              <q-item-section avatar>
                <q-icon :name="item.icon" size="sm" />
              </q-item-section>
              <q-item-section>{{ item.title }}</q-item-section>
            </q-item>
          </q-list>
        </div> -->
      </div>
    </q-form>
  </div>
</template>

<script>
import {
  reactive,
  ref,
  watch,
  onMounted,
  computed,
  onUnmounted,
  nextTick,
} from "vue";
import { VueDraggableNext } from "vue-draggable-next";
import { useRouter, useRoute } from "vue-router";
import { getCurrentInstance } from "vue";
import UploadImage from "@/components/UploadImage.vue";
import { useStore } from "vuex";
import EditorModel from "@/components/EditorModel.vue";
import api from "@/api/index";
import { useI18n } from "vue-i18n";

export default {
  components: {
    UploadImage,
    draggable: VueDraggableNext,
    EditorModel,
  },

  setup() {
    const store = useStore();
    const router = useRouter();
    const route = useRoute();
    const { t } = useI18n();

    // 定义一个数组，包含所有锚点的ID
    const anchorIds = [
      "base-content",
      "declare-content",
      "spec-content",
      "detail-content",
    ];
    const anchorRefs = ref([]);

    // 产品数据模型
    const product = reactive({
      name: "", // 产品名称
      category_id: 0, //分类id
      main_image: "", //封面图片
      purchase_url: "", //采购链接
      developer_id: "",
      unit: "", //单位
      alias: "", //别名
      addr: "", //发货地
      customs_name_cn: "", // 中文报关名
      customs_name_en: "", // 英文报关名
      customs_price: "", // 报关单价
      customs_currency: "", // 货币单位
      customs_type: "", // 报关属性（保存code值）
      description: "",
      sku_list: [
        {
          image: "",
          sku: "",
          name: "",
          size_length: 0,
          size_width: 0,
          size_height: 0,
          weight: 0,
          percent: 0
        }
      ]
    });

    // 包装材料类型选项
    const packingMaterialsOptions = [
      { label: "包装袋", value: 1 },
      { label: "纸箱", value: 2 },
      { label: "定制盒子", value: 3 },
      { label: "贴纸", value: 4 },
      { label: "卡片", value: 5 },
      { label: "其他", value: 99 },
    ];

    // 页面初始化
    onMounted(async () => {
      if (route.query.id) {
        await getGoodsDetail();
      }
      goodsTreeList();
      getProps();
      staffList();
      getCustomsTypesList();
      getCurrenciesList();

      // 等待DOM完全渲染后添加滚动监听器
      nextTick(() => {
        setTimeout(initScrollListener, 500);
      });
    });

    // 初始化滚动监听
    const initScrollListener = () => {
      // 获取所有锚点元素
      anchorRefs.value = anchorIds.map((id) => document.getElementById(id));

      // 处理无法找到元素的情况
      if (anchorRefs.value.some((ref) => !ref)) {
        // 如果有元素未找到，则延迟再次尝试
        setTimeout(initScrollListener, 300);
        return;
      }

      if (containerRef.value) {
        // 先移除之前可能存在的监听器
        containerRef.value.removeEventListener("scroll", handleScroll);

        // 添加节流后的滚动事件处理
        containerRef.value.addEventListener("scroll", handleScroll);

        // 立即执行一次更新
        updateActiveAnchor();
      }
    };

    // 使用节流优化滚动事件处理
    let scrollTimer = null;
    const handleScroll = () => {
      if (scrollTimer) return;

      scrollTimer = setTimeout(() => {
        updateActiveAnchor();
        scrollTimer = null;
      }, 100); // 100ms 节流
    };

    // 更新当前活动锚点
    const updateActiveAnchor = () => {
      if (!containerRef.value || !anchorRefs.value.length) return;

      const scrollPosition = containerRef.value.scrollTop;
      const containerHeight = containerRef.value.clientHeight;
      const scrollHeight = containerRef.value.scrollHeight;
      const bottomOffset = 100; // 底部偏移量

      // 如果滚动到底部，选择最后一个锚点
      if (scrollPosition + containerHeight >= scrollHeight - bottomOffset) {
        currentAnchor.value = `#${anchorIds[anchorIds.length - 1]}`;
        return;
      }

      // 计算每个锚点元素的位置，找到当前应该激活的锚点
      let activeIndex = 0;
      for (let i = 0; i < anchorRefs.value.length; i++) {
        const element = anchorRefs.value[i];
        if (!element) continue;

        // 获取元素距离容器顶部的偏移
        const rect = element.getBoundingClientRect();
        const topOffset =
          rect.top +
          scrollPosition -
          containerRef.value.getBoundingClientRect().top;

        // 如果锚点在视口顶部上方一定距离内，则认为是当前锚点
        // 添加一个小偏移量确保更好的用户体验
        if (topOffset <= scrollPosition + 100) {
          activeIndex = i;
        } else {
          break; // 找到第一个在视口下方的锚点后终止循环
        }
      }

      currentAnchor.value = `#${anchorIds[activeIndex]}`;
    };
    const watchSwitch = ref(true);
    // 其他变量和引用
    const productId = ref("");
    const categoryList = ref([]);
    const options = ref([]);
    const countryList = ref([]);
    const goodsId = ref("");
    const images = ref([]);
    const main_image = ref({ url: "" });
    const showCategory = ref(true);
    const creatorList = ref([]);
    const containerRef = ref(null);
    const currentAnchor = ref("#base-content");

    // 计算属性：分类选项
    const categoryOptions = computed(() => {
      return flattenCategoryOptions(categoryList.value);
    });

    // 计算属性：开发人员选项
    const creatorOptions = computed(() => {
      return creatorList.value.map((item) => ({
        label: item.name,
        value: item.id,
      }));
    });
    const getArrayMultiplyData = (lengthArr) => {
      let newArr = lengthArr;
      lengthArr.forEach((item, index) => {
        lengthArr.forEach((i, k) => {
          if (k < index) {
            newArr[k] *= lengthArr[index];
          }
        });
      });
      return newArr;
    };
    const tableSpanArr = ref([]);
    const arraySpanMethod = ({ rowIndex, columnIndex }) => {
      // 实现第一列（颜色列）的单元格合并
      if (columnIndex === 0) {
        // 获取当前行的规格值
        const currentValue = product.sku_list[rowIndex].spec_arr[columnIndex];
        
        // 如果是第一次出现这个值，或者上一行的值与当前不同
        if (rowIndex === 0 || product.sku_list[rowIndex - 1].spec_arr[columnIndex] !== currentValue) {
          // 计算连续的相同值数量
          let count = 1;
          while (
            rowIndex + count < product.sku_list.length && 
            product.sku_list[rowIndex + count].spec_arr[columnIndex] === currentValue
          ) {
            count++;
          }
          return { rowspan: count, colspan: 1 };
        } else {
          // 如果不是第一次出现，该单元格被合并
          return { rowspan: 0, colspan: 0 };
        }
      } 
      // 其他列（尺寸等）不合并
      else {
        return { rowspan: 1, colspan: 1 };
      }
    };


    // 函数：拍平分类选项
    const flattenCategoryOptions = (categories, prefix = "") => {
      let result = [];
      categories.forEach((cat) => {
        const label = prefix ? `${prefix} / ${cat.label}` : cat.label;
        result.push({
          label,
          value: cat.value,
        });
        if (cat.children && cat.children.length > 0) {
          result = result.concat(flattenCategoryOptions(cat.children, label));
        }
      });
      return result;
    };

    // 滚动到锚点
    const scrollToAnchor = (id) => {
      currentAnchor.value = id;
      const el = document.querySelector(id);
      if (el && containerRef.value) {
        // 计算元素相对于滚动容器的位置
        const containerTop = containerRef.value.getBoundingClientRect().top;
        const elementTop = el.getBoundingClientRect().top;
        const offsetPosition =
          elementTop - containerTop + containerRef.value.scrollTop - 80; // 添加一个偏移量

        // 平滑滚动到该位置
        containerRef.value.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
    };

    // 主图更新
    const mainImageUpdate = (mainImage) => {
      console.log('789789');
      
      main_image.value = mainImage;
      product.main_image = mainImage.url || '';
    };

    // 描述内容改变
    const changeDesc = (editorHtml) => {
      product.description = editorHtml;
    };

    // 保存产品信息
    const saveProductInfo = async () => {
      let params = {
        name: product.name,
        category_id: product.category_id,
        description: product.description,
        main_image: product.main_image,
        customs_type: product.customs_type,
        customs_name_cn: product.customs_name_cn,
        customs_name_en: product.customs_name_en,
        customs_price: product.customs_price,
        customs_currency: product.customs_currency,
        specs: product.sku_list.map(sku => ({
          sku: sku.sku,
          name: sku.name,
          image: sku.image,
          size_length: sku.size_length,
          size_width: sku.size_width,
          size_height: sku.size_height,
          weight: sku.weight,
          purchase_price:0,
          sale_price:0,
        }))
      }

      try {
        let response;
        if (route.query.id) {
          // 编辑模式
          response = await api.editProduct(route.query.id,params);
        } else {
          // 新增模式
          response = await api.addProduct(params);
        }

        if (response.success) {
          router.push('/product');
        }
      } catch (error) {
        console.error("保存失败:", error);
        $q.notify({
          type: 'negative',
          message: `${route.query.id ? '编辑' : '新增'}产品失败`
        });
      }
    };

    // 获取商品详情
    const getGoodsDetail = async () => {
      if (!route.query.id) return;

      try {
        const response = await api.getProductDetail(route.query.id);
        if (response.success) {
          const data = response.data;
          
          // 更新产品基本信息
          product.name = data.name;
          product.description = data.description;
          product.main_image = data.main_image;
          product.customs_type = data.customs_type;
          product.customs_name_cn = data.customs_name_cn;
          product.customs_name_en = data.customs_name_en;
          product.customs_price = data.customs_price;
          product.customs_currency = data.customs_currency;

          // 更新主图显示
          main_image.value = { url: data.main_image };
          images.value = [{ url: data.main_image }];

          // 更新SKU列表
          if (data.specs && data.specs.length > 0) {
            product.sku_list = data.specs.map(spec => ({
              image: spec.image,
              sku: spec.sku,
              name: spec.name,
              size_length: spec.size_length,
              size_width: spec.size_width,
              size_height: spec.size_height,
              weight: spec.weight,
              percent: 100 // 因为是已有图片，所以进度为100%
            }));
          }
        }
      } catch (error) {
        console.error("获取商品详情失败:", error);
        $q.notify({
          type: 'negative',
          message: '获取商品详情失败'
        });
      }
    };

    // 获取属性
    const getProps = () => {
      // 实现获取属性的方法
    };

    // 获取分类树
    const goodsTreeList = () => {
      // 实现获取分类树的方法
    };

    // 获取员工列表
    const staffList = () => {
      // 实现获取员工列表的方法
    };

    // 获取报关类型和货币列表
    const customsTypesList = ref([]);
    const currenciesList = ref([]);

    // 获取海关类型列表
    const getCustomsTypesList = async () => {
      try {
        const response = await api.customsTypesList();
        if (response.success) {
          customsTypesList.value = response.data;
        }
      } catch (error) {
        console.error("获取海关类型列表失败:", error);
      }
    };

    // 获取货币列表
    const getCurrenciesList = async () => {
      try {
        const response = await api.currenciesList();
        if (response.success) {
          currenciesList.value = response.data;
        }
      } catch (error) {
        console.error("获取货币列表失败:", error);
      }
    };

    // 文件上传相关函数
    const fileModels = ref([]);

    // SKU表格列定义
    const skuColumns = [
      { name: 'image', label: t('图片'), field: 'image', align: 'center' },
      { name: 'sku', label: t('SKU ID'), field: 'sku', align: 'center' },
      { name: 'name', label: t('规格名称'), field: 'name', align: 'center' },
      { name: 'dimensions', label: t('尺寸(cm)'), align: 'center' },
      { name: 'weight', label: t('重量(g)'), field: 'weight', align: 'center' },
      { name: 'operations', label: t('操作'), field: 'operations', align: 'center' }
    ];

    // 添加SKU行
    const addSkuRow = () => {
      product.sku_list.push({
        image: "",
        sku: "",
        name: "",
        size_length: 0,
        size_width: 0,
        size_height: 0,
        weight: 0,
        percent: 0
      });
    };

    // 删除SKU行
    const deleteSkuRow = (index) => {
      if (product.sku_list.length > 1) {
        product.sku_list.splice(index, 1);
      }
    };

    // 触发文件输入
    const triggerFileInput = (index) => {
      const fileInput = document.querySelectorAll(".hidden")[index];
      if (fileInput) fileInput.click();
    };

    const uploadSkuImage = async (file, rowIndex) => {
      if (!file) return;

      // 创建一个临时URL用于预览
      const tempUrl = URL.createObjectURL(file);

      // 更新SKU的图片为临时预览
      if (product.sku_list[rowIndex]) {
        product.sku_list[rowIndex].image = tempUrl;
        product.sku_list[rowIndex].percent = 0;
      }

      // 上传图片到服务器
      let params = new FormData();
      params.append('file', file);
      params.append('type', 'image');
      
      try {
        const response = await api.uploads(params, (e) => {
          // 更新上传进度
          if (product.sku_list[rowIndex]) {
            let percent = (e.loaded / e.total) * 100;
            product.sku_list[rowIndex].percent = Math.ceil(percent);
          }
        });
        
        if (response.success) {
          // 更新SKU的图片为服务器返回的URL
          if (product.sku_list[rowIndex]) {
            product.sku_list[rowIndex].image = response.data.url;
            product.sku_list[rowIndex].percent = 100;
          }
        } else {
          console.error("上传失败:", response);
          // 移除临时预览
          if (product.sku_list[rowIndex]) {
            product.sku_list[rowIndex].image = "";
            product.sku_list[rowIndex].percent = 0;
          }
        }
      } catch (error) {
        console.error("上传错误:", error);
        // 移除临时预览
        if (product.sku_list[rowIndex]) {
          product.sku_list[rowIndex].image = "";
          product.sku_list[rowIndex].percent = 0;
        }
      }
    };

    // 返回需要在模板中使用的数据和方法
    return {
      route,
      router,
      product,
      changeDesc,
      saveProductInfo,
      mainImageUpdate,
      images,
      main_image,
      showCategory,
      packingMaterialsOptions,
      categoryOptions,
      creatorOptions,
      containerRef,
      goodsId,
      currentAnchor,
      scrollToAnchor,
      updateActiveAnchor,
      fileModels,
      triggerFileInput,
      uploadSkuImage,
      customsTypesList,
      currenciesList,
      skuColumns,
      addSkuRow,
      deleteSkuRow,
      t,
    };
  },
};
</script>

<style lang="scss" scoped>
.compile-product {
  margin: 0 auto;
  position: relative;

  .product-content {
    height: calc(100vh - 205px);
    overflow-y: auto;
    padding-bottom: 70px;

    /* 美化滚动条 */
    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, 0.03);
      border-radius: 3px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.12);
      border-radius: 3px;

      &:hover {
        background: rgba(0, 0, 0, 0.2);
      }
    }
  }

  .fixed-bottom-bar {
    margin: 0!important;
    position: fixed;
    bottom: 0;
    left: 240px;
    right: 0;
    background: white;
    box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
    z-index: 1000;
  }

  .bottom-placeholder {
    height: 72px;
  }

  /* 右侧导航锚点 */
  .right-nav {
    position: fixed;
    top: 35%;
    right: 20px !important;
    z-index: 900;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    }

    .q-item {
      padding: 10px 16px;
      min-height: 42px;
      transition: all 0.2s ease;

      &--active {
        background: rgba(0, 0, 0, 0.05);
        color: var(--q-primary);
        font-weight: 500;

        &::before {
          content: "";
          position: absolute;
          left: 0;
          top: 8px;
          height: calc(100% - 16px);
          width: 3px;
          background: var(--q-primary);
          border-radius: 0 3px 3px 0;
        }

        .q-icon {
          color: var(--q-primary);
        }
      }

      .q-icon {
        transition: color 0.3s ease;
      }

      &:hover {
        background: rgba(0, 0, 0, 0.03);

        .q-icon {
          color: var(--q-primary);
        }
      }
    }
  }

  /* 卡片样式优化 */
  .box-card {
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05) !important;
    transition: all 0.3s ease;
    overflow: hidden;
    margin-bottom: 24px;

    &:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08) !important;
    }

    .q-card__section:first-child {
      padding: 20px 24px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      background-color: #ffffff;
    }

    .q-card__section:not(:first-child) {
      padding: 24px;
      background-color: #ffffff;
    }

    .text-h6 {
      font-size: 18px;
      font-weight: 500;
      color: #333;
    }
  }

  /* 表单控件样式优化 */
  :deep(.q-field) {
    margin-bottom: 8px;
  }

  :deep(.q-field--outlined .q-field__control) {
    border-radius: 6px;
    transition: all 0.2s ease;
  }

  :deep(.q-field--focused .q-field__control) {
    box-shadow: 0 0 0 1px var(--q-primary),
      0 0 0 4px rgba(var(--q-primary-rgb), 0.1);
  }

  :deep(.q-field__label) {
    font-weight: 500;
    color: #555;
  }

  /* 按钮样式优化 */
  :deep(.q-btn) {
    border-radius: 6px;
  }

  :deep(.q-btn--outline) {
    border-width: 1px;
  }

  .sku-list {
    // margin-top: 20px;
    .sku-input {
      width: 200px;
    }

    .dimension-input {
      width: 70px;
    }

    .image-uploader {
      width: 60px;
      height: 60px;
      border: 1px dashed #d9d9d9;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;

      &:hover {
        border-color: var(--q-primary);
      }

      .sku-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .upload-placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: #8c8c8c;
      }
      
      .upload-progress {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(255, 255, 255, 0.8);
        border-radius: 50%;
      }
    }

    .generate-sku {
      margin-top: 4px;
    }

    :deep(.q-table) {
      thead tr th {
        background-color: #f8f8f8;
        font-weight: 500;
        font-size: 12px;
        color: #8c8c8c;
      }

      tbody td {
        padding: 8px 4px;
      }
      
      /* 颜色单元格合并后的样式 */
      tbody td:first-child {
        &[rowspan] {
          background-color: rgba(0, 0, 0, 0.02);
          border-right: 1px solid rgba(0, 0, 0, 0.07);
          font-weight: 500;
          vertical-align: middle;
        }
      }
    }

    .hidden {
      display: none;
    }
  }
}
</style> 