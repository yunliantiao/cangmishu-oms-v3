<template>
    <div class="http-404">
      <div class="box-404">
        <div class="pic-404">
          <img class="pic-404__parent" src="../assets/404.png" alt="404" />
          <img class="pic-404__child left" src="../assets/404_cloud.png" alt="404" />
          <img class="pic-404__child mid" src="../assets/404_cloud.png" alt="404" />
          <img class="pic-404__child right" src="../assets/404_cloud.png" alt="404" />
        </div>
        <div class="bullshit">
          <div class="bullshit__oops">Not Found 404</div>
        </div>
        <div class="bullshit__headline">神说这个页面不存在......</div>
        <div class="bullshit__info">请检查您输入的网址是否正确</div>
        <router-link to="/" class="bullshit__return-home">Home</router-link>
      </div>
    </div>
  </template>
  <script>
  export default {
    name: 'NotFound',
    methods: {
      back() {
        // 101 为首页跳转页面的权限id
        this.$router.push({ path: '/' })
      },
    },
  }
  </script>
  <style lang="scss" scoped>
  .http-404 {
    position: relative;
    width: 100%;
    background: #f0f2f5;
    min-height: 100vh;
    overflow: hidden;
    .box-404 {
      margin: 0 auto;
      width: 900px;
    }
    .pic-404 {
      position: relative;
      float: left;
      width: 600px;
      padding: 150px 0;
      overflow: hidden;
      &__parent {
        width: 100%;
      }
      &__child {
        position: absolute;
        &.left {
          width: 80px;
          top: 17px;
          left: 220px;
          opacity: 0;
          animation-name: cloudLeft;
          animation-duration: 2s;
          animation-timing-function: linear;
          animation-fill-mode: forwards;
          animation-delay: 1s;
          animation-iteration-count: infinite;
        }
        &.mid {
          width: 46px;
          top: 10px;
          left: 420px;
          opacity: 0;
          animation-name: cloudMid;
          animation-duration: 2s;
          animation-timing-function: linear;
          animation-fill-mode: forwards;
          animation-delay: 1.2s;
          animation-iteration-count: infinite;
        }
        &.right {
          width: 62px;
          top: 100px;
          left: 500px;
          opacity: 0;
          animation-name: cloudRight;
          animation-duration: 2s;
          animation-timing-function: linear;
          animation-fill-mode: forwards;
          animation-delay: 1s;
          animation-iteration-count: infinite;
        }
        @keyframes cloudLeft {
          0% {
            top: 17px;
            left: 220px;
            opacity: 0;
          }
          20% {
            top: 33px;
            left: 188px;
            opacity: 1;
          }
          80% {
            top: 81px;
            left: 92px;
            opacity: 1;
          }
          100% {
            top: 97px;
            left: 60px;
            opacity: 0;
          }
        }
        @keyframes cloudMid {
          0% {
            top: 10px;
            left: 420px;
            opacity: 0;
          }
          20% {
            top: 40px;
            left: 360px;
            opacity: 1;
          }
          70% {
            top: 130px;
            left: 60px;
            opacity: 1;
          }
          100% {
            top: 160px;
            left: 120px;
            opacity: 0;
          }
        }
        @keyframes cloudRight {
          0% {
            top: 100px;
            left: 500px;
            opacity: 0;
          }
          20% {
            top: 120px;
            left: 460px;
            opacity: 1;
          }
          80% {
            top: 60px;
            left: 340px;
            opacity: 1;
          }
          100% {
            top: 200px;
            left: 300px;
            opacity: 0;
          }
        }
      }
    }
    .bullshit {
      position: relative;
      float: left;
      width: 300px;
      padding: 150px 0;
      overflow: hidden;
      &__oops {
        font-size: 32px;
        font-weight: bold;
        line-height: 40px;
        color: #97c1ff;
        opacity: 0;
        margin-bottom: 20px;
        animation-name: slideUp;
        animation-duration: 0.5s;
        animation-fill-mode: forwards;
      }
      &__headline {
        font-size: 20px;
        line-height: 24px;
        color: #97c1ff;
        opacity: 0;
        margin-bottom: 10px;
        animation-name: slideUp;
        animation-duration: 0.5s;
        animation-delay: 0.1s;
        animation-fill-mode: forwards;
      }
      &__info {
        font-size: 13px;
        line-height: 21px;
        color: #636f7a;
        opacity: 0;
        margin-bottom: 30px;
        animation-name: slideUp;
        animation-duration: 0.5s;
        animation-delay: 0.2s;
        animation-fill-mode: forwards;
      }
      &__return-home {
        display: block;
        float: left;
        width: 110px;
        height: 36px;
        background: #97c1ff;
        border-radius: 100px;
        text-align: center;
        color: #ffffff;
        opacity: 0;
        font-size: 14px;
        line-height: 36px;
        cursor: pointer;
        animation-name: slideUp;
        animation-duration: 0.5s;
        animation-delay: 0.3s;
        animation-fill-mode: forwards;
        margin-right: 10px;
        text-decoration: none;
      }
      @keyframes slideUp {
        0% {
          transform: translateY(60px);
          opacity: 0;
        }
        100% {
          transform: translateY(0);
          opacity: 1;
        }
      }
    }
    .link-type {
      color: #97c1ff;
    }
  }
  </style>
  