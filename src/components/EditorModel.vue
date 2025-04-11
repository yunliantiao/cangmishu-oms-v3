<template>
  <div>
    <div :class="['message', { 'on-progress': onProgress }]">
      <q-linear-progress
        :text-inside="true"
        :stroke-width="26"
        :percentage="progress"
        color="primary"
      ></q-linear-progress>
    </div>
    <div :id="editorId" :value="textContent"></div>
  </div>
</template>

<script>
import E from "wangeditor";
import COS from "cos-js-sdk-v5";
import baseApi from "@/api/baseApi";
import { basePcd } from "@/api/baseApi";
import { useQuasar } from "quasar";

export default {
  data() {
    return {
      editor: "",
      textContent: "",
      progress: 0,
      params: {},
      onProgress: false,
      isMounted: false,
    };
  },
  props: {
    content: {
      type: String,
    },
    type: {
      type: String,
    },
    editorId: {
      type: String,
      default: "editor",
    },
  },
  watch: {
    content: {
      handler(next) {
        if (next != this.editor.txt.html()) {
          this.editor.txt.html(next);
        }
      },
    },
  },
  created() {
    if (localStorage.getItem("secret")) {
      const params = JSON.parse(localStorage.getItem("secret"));
      const time = new Date(params.configs.expiration);
      const currentTime = new Date();
      if (currentTime > time) {
        this.getTempKeys();
      } else {
        this.params = params;
      }
    } else {
      this.getTempKeys();
    }
  },
  mounted() {
    this.isMounted = true;
    this.editor = new E(`#${this.editorId}`);
    this.editor.config.onchange = this.putContent;
    this.editor.config.customUploadVideo = (resultFiles, insertVideoFn) => {
      this.uploadFile(resultFiles)
        .then((res) => {
          insertVideoFn(res);
        })
        .catch((err) => {
          this.$message.error(err);
        });
    };

    this.editor.config.uploadImgServer = `${baseApi}upload/images`;
    this.editor.config.uploadImgParams = {};
    this.editor.config.uploadImgHeaders = {
      Authorization: localStorage.getItem("accessToken"),
    };
    this.editor.config.uploadFileName = `images[${0}][file]`;
    this.editor.config.uploadImgHooks = {
      customInsert: (insertImg, result) => {
        if (result.status) {
          const $q = useQuasar();
          $q.dialog({
            title: '提示',
            message: '上传成功',
            cancel: true,
            persistent: true
          })
          let url = `${basePcd}${result.data[0].path}`;
          insertImg(url);
        }
      },
    };
    this.editor.config.height = 300;
    this.editor.config.zIndex = 500;
    this.editor.config.showLinkImg = true;
    this.editor.config.placeholder ='请输入';
    this.editor.create();
    this.editor.txt.html(this.content);
  },
  methods: {
    putContent(newHtml) {
      this.$emit("change", newHtml);
    },
    getInput() {
      return this.editor.txt.html();
    },
    getTempKeys() {
    //   getTempKeys().then(res => {
    //     if (res.ret) {
    //       this.params = res.data
    //       localStorage.setItem('secret', JSON.stringify(res.data))
    //     }
    //   })
    },
    uploadFile(data) {
      return new Promise((resolve, reject) => {
        const cos = new COS({
          SecretId: this.params.configs.credentials.tmpSecretId,
          SecretKey: this.params.configs.credentials.tmpSecretKey,
          SecurityToken: this.params.configs.credentials.sessionToken,
          StartTime: this.params.configs.startTime,
          ExpiredTime: this.params.configs.expiredTime,
        });
        const that = this;
        cos.uploadFile(
          {
            Bucket: this.params.bucket,
            Region: this.params.region /* 存储桶所在地域，必须字段 */,
            Key: `${this.params.base_path}/${data[0].name}${Math.random()}`,
            Body: data[0],
            onProgress: function (progressData) {
              that.onProgress = true;
              that.progress = +Number(
                (progressData.loaded / 1024 / (progressData.total / 1024)) * 100
              ).toFixed(2);
              if (that.progress === 100) {
                that.onProgress = false;
              }
            },
            onFileFinish: function () {
              const timer = setTimeout(() => {
                that.progress = 0;
                clearTimeout(timer);
              }, 2000);
            },
          },
          function (err, data) {
            if (err) {
              reject(err);
            } else {
              let reg = /\S+\.com/;
              resolve(
                `${baseApi.IMAGE_URL}/storage${data.Location.replace(reg, "")}`
              );
            }
          }
        );
      });
    },
  },
};
</script>
<style lang="scss" scoped>
.message {
  position: fixed;
  top: -10px;
  left: 0;
  right: 0;
  width: 35%;
  margin: 0 auto;
  z-index: 99;
  opacity: 0;
  transition: all 2s;
}

.on-progress {
  opacity: 1;
  transform: translateY(125px);
}

.save {
  margin-top: 20px;
}
</style>
