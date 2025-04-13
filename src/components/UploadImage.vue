<template>
  <div class="product-upload">
    <div class="image-uploader">
      <!-- 已上传图片展示 -->
      <div v-for="(file, index) in modelValue" :key="index" class="image-item">
        <q-img
          class="upload-image"
          :src="file.url || (file.raw && file.raw.url)"
          alt=""
        />
        <div class="image-actions">
          <q-btn flat round dense color="white" icon="zoom_in" @click="handlePictureCardPreview(file.url || (file.raw && file.raw.url))" />
          <q-btn flat round dense color="white" icon="check_circle" @click="handleCover(file)" 
            v-if="(mainImage.url !== file.url) && (mainImage.url !== (file.raw && file.raw.url))" />
          <q-btn flat round dense color="white" icon="delete" @click="handleRemove(file.raw || file, file)" />
        </div>
        <div class="cover-badge" v-if="mainImage.url === file.url || mainImage.url === (file.raw && file.raw.url)">
          封面
        </div>
        <!-- 上传进度条 -->
        <q-circular-progress
          v-if="file.percent && file.percent < 100"
          class="upload-progress"
          :value="file.percent"
          size="90px"
          color="primary"
          show-value
          font-size="12px"
        />
      </div>

      <!-- 上传按钮 -->
      <div class="upload-button" @click="triggerUpload">
        <q-icon name="add" size="24px" />
      </div>
      
      <!-- 隐藏的文件输入 -->
      <q-file
        ref="fileInput"
        v-model="file"
        accept="image/*"
        @update:model-value="uploadMainImg"
        class="hidden-input"
      />
    </div>

    <!-- 图片预览对话框 -->
    <q-dialog v-model="dialogVisible">
      <q-card class="preview-dialog">
        <q-bar class="bg-primary text-white">
          <div>图片预览</div>
          <q-space />
          <q-btn dense flat icon="close" v-close-popup />
        </q-bar>
        <q-card-section style="min-width: 550px;" class="preview-content">
          <q-img
            :src="dialogImageUrl"
            class="preview-image"
            fit="contain"
          />
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { ref } from 'vue';
import { basePcd } from "@/api/baseApi";
import api from "@/api/index";
import { useStore } from 'vuex';

export default {
  name: "upload",
  props: {
    modelValue: {
      type: Array,
      default: () => [],
    },
    mainImage: {
      type: Object,
      default: () => ({ url: "" }),
    },
  },
  setup(props, { emit }) {
    const dialogImageUrl = ref('');
    const dialogVisible = ref(false);
    const file = ref(null);
    const fileInput = ref(null);
    const store = useStore();

    // 触发文件选择
    const triggerUpload = () => {
      fileInput.value.$el.querySelector('input').click();
    };

    // 预览图片
    const handlePictureCardPreview = (url) => {
      dialogImageUrl.value = url;
      dialogVisible.value = true;
    };

    // 设置为封面
    const handleCover = (file) => {
      const mainImageData = {
        url: file.url || (file.raw && file.raw.url),
      };
      updateMainImage(mainImageData);
    };

    // 移除图片
    const handleRemove = (file, files) => {
      props.modelValue.forEach((item, index) => {
        if (item.uid == files.uid) {
          props.modelValue.splice(index, 1);
        } else if (item.url === file.url) {
          props.modelValue.splice(index, 1);
        }
      });
      setMainImage();
    };

    // 上传主图
    const uploadMainImg = async (selectedFile) => {
      if (!selectedFile) return;
      
      // 创建新的文件对象
      const uploadFile = {
        uid: Date.now().toString(),
        status: 'uploading',
        percent: 0,
        name: selectedFile.name,
        size: selectedFile.size,
        type: selectedFile.type,
        raw: selectedFile
      };

      // 添加到图片列表
      const newFiles = [...props.modelValue, uploadFile];
      emit('update:modelValue', newFiles);
      
      try {
        const res = await onUpload(selectedFile, uploadFile.uid);
        if (res.success) {
          // 更新文件状态
          const updatedFiles = props.modelValue.map(item => {
            if (item.uid === uploadFile.uid) {
              return {
                ...item,
                url: res.data.url,
                status: 'success'
              };
            }
            return item;
          });
          emit('update:modelValue', updatedFiles);
          
          // 如果是第一张图片，设置为主图
          if (props.modelValue.length === 1) {
            updateMainImage({ url: res.data.url });
          }
        }
      } catch (error) {
        console.error('Upload failed:', error);
        // 移除上传失败的文件
        const filteredFiles = props.modelValue.filter(item => item.uid !== uploadFile.uid);
        emit('update:modelValue', filteredFiles);
      }
    };

    // 上传文件
    const onUpload = (file, uid) => {
      let params = new FormData();
      params.append('file', file);
      params.append('type', 'image');
      
      return api.uploads(params, (e) => {
        let percent = (e.loaded / e.total) * 100;
        // 更新上传进度
        const updatedFiles = props.modelValue.map(item => {
          if (item.uid === uid) {
            return { ...item, percent: Math.ceil(percent) };
          }
          return item;
        });
        emit('update:modelValue', updatedFiles);
      });
    };

    // 更新主图
    const updateMainImage = (mainImage) => {
      emit("mainImageUpdate", mainImage);
    };

    // 设置主图
    const setMainImage = () => {
      if (props.modelValue.length > 0) {
        if (props.mainImage && props.mainImage.url) {
          let exist = false;
          props.modelValue.forEach((item) => {
            if ((item.url || (item.raw && item.raw.url)) === props.mainImage.url) {
              exist = true;
            }
          });

          if (!exist) {
            const firstImage = props.modelValue[0];
            updateMainImage({
              url: firstImage.url || (firstImage.raw && firstImage.raw.url),
            });
          }
        } else {
          const firstImage = props.modelValue[0];
          updateMainImage({
            url: firstImage.url || (firstImage.raw && firstImage.raw.url),
          });
        }
      } else {
        updateMainImage({});
      }
    };

    return {
      dialogImageUrl,
      dialogVisible,
      file,
      fileInput,
      triggerUpload,
      handlePictureCardPreview,
      handleCover,
      handleRemove,
      uploadMainImg,
      updateMainImage,
      setMainImage
    };
  }
};
</script>

<style lang="scss" scoped>
.product-upload {
  .image-uploader {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  
  .image-item {
    width: 148px;
    height: 148px;
    border-radius: 6px;
    position: relative;
    overflow: hidden;
    border: 1px solid #d9d9d9;
    
    .upload-image {
      width: 100%;
      height: 100%;
    }
    
    .image-actions {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      opacity: 0;
      transition: opacity 0.3s;
      
      &:hover {
        opacity: 1;
      }
    }
    
    .cover-badge {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 28px;
      line-height: 28px;
      text-align: center;
      color: white;
      background-color: #0fa955;
      opacity: 0.86;
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
  
  .upload-button {
    width: 148px;
    height: 148px;
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    color: #8c939d;
    background-color: #fbfdff;
    transition: border-color 0.3s;
    
    &:hover {
      border-color: #409eff;
    }
  }
  
  .hidden-input {
    display: none;
  }
  
  .preview-dialog {
    width: 70vw;
    height: 70vh;
    
    .preview-content {
      width: 500px!important;
      height: 500px!important;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f5f5f5;
      padding: 0;
    }
    
    .preview-image {
      width: 100%!important;
      height: 100%!important;
      
      :deep(.q-img__content) {
        display: flex;
        align-items: center;
        justify-content: center;
        
        img {
          max-width: 100%;
          max-height: calc(70vh - 50px);
          object-fit: contain;
        }
      }
    }
  }
}
</style>