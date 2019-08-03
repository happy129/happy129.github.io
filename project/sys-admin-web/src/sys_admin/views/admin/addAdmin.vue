<template>
  <div class="back-layer">
    <div class="dialog-box" @click.stop>
      <div class="title">
        <span>添加子账号</span>
        <span class="close-tag" @click="close">X</span>
      </div>

      <a-form layout="inline" :form="form">
        <a-form-item label="账号">
          <a-input
            v-decorator="[ 'userName', { rules: [{ required: true, message: '4-12码英文或数字且符合0~9及a~z字元', pattern:/^[a-z0-9]{4,12}$/ }] } ]"
          ></a-input>
        </a-form-item>
        <a-form-item label="密码">
          <a-input
            v-decorator="[ 'password', { rules: [{ required: true, message: '6-12码英文数字夹杂并且符合0~9及a~z字元', pattern:/^[a-z0-9]{6,12}$/ }] } ]"
            type="password"
          ></a-input>
        </a-form-item>
        <a-form-item label="确认密码">
          <a-input
            v-decorator="[ 'rePassword', { rules: [{ required: true, message: '请再次输入密码', pattern:/^[a-z0-9]{6,12}$/  }] } ]"
            type="password"
          ></a-input>
        </a-form-item>
        <a-form-item label="昵称">
          <a-input
            v-decorator="[ 'nickName', { rules: [{ required: true, message: '4-12码英文或数字且符合0~9及a~z字元', pattern:/^[a-z0-9]{4,12}$/ }] } ]"
          ></a-input>
        </a-form-item>
        <a-form-item label="岗位备注">
          <a-input v-model="remark"></a-input>
        </a-form-item>

        <a-form-item label="单笔人工加减款限额">
          <a-input-number
            v-decorator="[ 'correctAmountUpperLimit', { rules: [{ required: true, message: '请设置限额'}] } ]"
            :min="1"
            :max="999999999"
          />
        </a-form-item>

        <a-form-item label="谷歌验证码开关" class="switch-box">
          <a-switch defaultChecked @change="onChange"/>
        </a-form-item>

        <div>
          <a-form-item label="谷歌密钥描述">
            <a-input
              @change="changeGoogleVerficationName"
              v-decorator="['googleVerficationName', { rules: [{ required: true, message: '请输入谷歌密钥描述'}]}]"
            ></a-input>
          </a-form-item>

          <div class="qr-box">
            <a-button-group>
              <a-button size="small" @click="getGoogleSecretKey">创建新密钥</a-button>
              <a-button size="small" @click="showQrImg=!showQrImg" v-if="!showQrImg">显示QR码</a-button>
              <a-button size="small" @click="showQrImg=!showQrImg" v-if="showQrImg">隐藏QR码</a-button>
            </a-button-group>
            <div class="qr-img" v-if="showQrImg">
              <img :src="googleQrCodeBase64" alt="网络错误...">
            </div>
            <div class="foot">用手机打开Authenticator,扫描二维码</div>
          </div>

          <a-form-item label="验证码">
            <a-input
              v-decorator="[ 'googleCode', { rules: [{ required: userInfo.isGoogleVerficationEnabled===1, message: '请输入验证码' }] } ]"
            ></a-input>
          </a-form-item>
        </div>

        <br>
        <a-form-item>
          <a-button type="primary" @click="add">提交</a-button>
          <a-button type="primary" @click="reset">重置</a-button>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>
<script>
import Vue from "vue";
import { Component, Lifecycle, InjectComponents, State } from "vue-decorators";
import * as Api from "@api/admin";
import { setTimeout } from "timers";

@Component
export default class addAdmin extends Vue {
  @State(s => s.auth.userInfo) userInfo;
  googleQrCode = "";
  showQrImg = true;
  remark = "";
  // 创建管理员新密钥 时返回的数据，作为参数传给新增接口
  googleVerficationSecret = "";
  googleVerficationName = "";
  isGoogleVerficationEnabled = 1;

  googleQrCodeBase64 = "";
  
  changeGoogleVerficationName(e) {
    this.googleVerficationName = e.target.value;
  }
  close() {
    this.$emit("close");
  }
  async add() {
    let p = {
      // 商户是1，总后台是0
      systemType: 0,
      // 表示这个账号是否可用 默认传1
      isEnabled: 1,
      googleVerficationName: this.googleVerficationName,
      googleVerficationSecret: this.googleVerficationSecret,
      // 是否开启谷歌验证|0:不启用|1:启用
      isGoogleVerficationEnabled: this.isGoogleVerficationEnabled,
      remark: this.remark
    };

    await this.form.validateFields(async (err, values) => {
      if (values.rePassword !== values.password) {
        this.$message.error("两次输入的密码不一致");
        return;
      }

      if (!err) {
        p = Object.assign(p, values);

        let res = await Api.addAdminList(p);
        let code = res?.data?.body?.code;
        if (1 === code) {
          this.$message.success(res?.data?.body?.message);
          // 添加成功, 刷新页面
          this.$emit("ok");
          this.$emit("close");
        }
      }
    });
  }
  reset() {
    this.remark = "";
    this.googleVerficationName = "";
    this.form.resetFields();
  }

  @Lifecycle created() {
    this.form = this.$form.createForm(this);
  }

  onChange(v) {
    this.isGoogleVerficationEnabled = v ? 1 : 0;
  }

  async getGoogleSecretKey() {
    let p = {
      adminName: this.googleVerficationName
    };
    let res = await Api.getGoogleSecretKey(p);
    if (res?.data?.body?.code === 1) {
      let data = res?.data?.body?.data;
      this.googleVerficationSecret = data.googleSecret;
      this.googleQrCode = data.googleQrCode;
      this.googleQrCodeBase64 = data.googleQrCodeBase64;
    }
  }
}
</script>

<style lang="scss" scoped>
@import "./Pop.scss";
.back-layer /deep/ {
  .dialog-box {
    width: 620px;
    .ant-form-item-label {
      width: 160px;
    }
    .ant-row {
      margin-top: 10px;
    }
    .ant-btn {
      margin: auto 7px;
      width: 120px;
    }
    .ant-input,
    .ant-input-number {
      width: 330px;
      height: 38px;
    }
  }
  .switch-box {
    .ant-form-item-control-wrapper {
      margin-right: 288px;
    }
  }
  .qr-box {
    position: relative;
    width: 206px;
    height: 260px;
    margin: 10px auto 2px 216px;
    .ant-btn {
      margin: 0px;
      span {
        font-size: 12px;
        display: inline-block;
      }
    }
    button:nth-child(1) {
      width: 82px;
      border-radius: 5px 0px 0px 5px;
    }
    button:nth-child(2) {
      width: 104px;
      border-radius: 0px 5px 5px 0px;
    }
    .qr-img {
      width: 196px;
      height: 198px;
      margin: 10px auto;
      img {
        width: 100%;
        height: 100%;
      }
    }
    .foot {
      font-size: 12px;
      position: absolute;
      bottom: 0px;
      left: 5px;
    }
  }
  .ant-form-item-with-help {
    margin: 0px;
  }
}
</style>

