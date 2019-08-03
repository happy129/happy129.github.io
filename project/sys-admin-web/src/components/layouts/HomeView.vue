<script>
import Vue from 'vue'
import { Component, Lifecycle, Prop, State } from 'vue-decorators'
import { formatDate } from "@/util/date"

@Component
export default class HomeView extends Vue {
  @State(e => e.auth.userInfo) userInfo;

  timer = null;
  currentTime = "";

  @Lifecycle created() {
    this.currentTime = formatDate(new Date());
    this.timer = setInterval(() => {
      this.currentTime = formatDate(new Date());
    }, 1000);
  }

  @Lifecycle render() {
      return (
        <div class="home-page">
          <div class="home-page-info">
            <div class="home-page-inside">
              <span class="icon-home"></span>
              <h2>欢迎使用后台管理系统</h2>
              <ul class="login-item">
                <li>
                  <p class="label">账号名</p>
                  <p class="info">{this.userInfo && this.userInfo.userName}</p>
                </li>
                <li>
                  <p class="label">当前时间</p>
                  <p class="info">{this.currentTime}</p>
                </li>
                <li>
                  <p class="label">登录IP</p>
                  <p class="info">{this.userInfo && this.userInfo.ip}</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )
  }

  @Lifecycle beforeDestroy() {
    clearInterval(this.timer)
  }
}
</script>

<style lang="scss" scoped>
.home-page {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  width: 100%;
  height: 100%;
  background-image: url(../../assets/bg3.jpg);
  background-position: 0 0;
  background-size: 100% 100%;

  .home-page-info {
    width: 548px;
    height: 396px;
    background-image: url(../../assets/fk.png);

    .home-page-inside {
      padding-top: 45px;
      padding-left: 88px;
      width: 460px;
      position: relative;
    }

    .icon-home {
      display: inline-block;
      position: absolute;
      width: 61px;
      height: 53px;
      top: 33px;
      background-image: url(../../assets/home-icon.png);
    }

    h2 {
      font-size: 22px;
      line-height: 1;
      color: #333;
      padding-left: 80px;
      height: 40px;
      line-height: 40px;
    }

    .login-item {
      margin-top: 35px;
      display: flex;
      flex-wrap: wrap;

      li {
        margin-bottom: 35px;
        color: #333;
        width: 50%;
        font-size: 0;

        .label {
          font-size: 16px;
          color: #666;
          line-height: 1;
          &::after {
            content: ':'
          }
        }

        .info {
          margin-top: 16px;
          font-size: 20px;
          line-height: 1;
          color: #333;
          font-family: Arial, Helvetica, sans-serif;
          letter-spacing: 0
        }
      }
    }
  }
}
</style>