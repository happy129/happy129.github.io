<template>
  <section class="bussiness-add">
    <a-form layout="inline" :form="vform" @submit.prevent="updateOrAddAction">
      <div class="update-load">
        <a-form-item label="上传头像">
          <a-form-item>
            <a-input v-decorator="['logoUrl', {rules: [{ required: true, message: '请先选择上传头像' }]}]"/>
          </a-form-item>
          <a-form-item>
            <a-upload name="imageFile" :showUploadList="false" :beforeUpload="beforeUpload">
              <a-button type="primary">上传</a-button>
            </a-upload>
          </a-form-item>
        </a-form-item>
      </div>
      <div class="mt5">
        <h4>基本信息</h4>
        <div class="m6">
          <a-form-item label="商户名">
            <a-input v-decorator="['platformName', {rules: [{ required: true, message: '商户名不能为空' }]}]"/>
          </a-form-item>
          <a-form-item label="商户标识">
            <a-input v-decorator="['platformCode', {rules: [{ required: true, message: '商户标识不能为空' }]}]" :disabled="type==='update'"/>
          </a-form-item>
        </div>
        <div class="m6">
          <a-form-item label="推广模式">
            <a-select v-decorator="['promotionType', {rules: [{ required: true, message: '请选择推广模式' }]}]" style="width:206px;" :disabled="type==='update'">
              <a-select-option v-for="(item, index) in dictionary.promotionType" :key="index" :value="item.value" >{{item.name}}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="佣金模式">
            <a-select v-decorator="['commissonModeId', {rules: [{ required: true, message: '请选择佣金模式' }]}]" style="width:206px;">
              <a-select-option v-for="(item, index) in init.commissionModes" :key="index" :value="`${item.id}`" >{{item.commissonModeName}}</a-select-option>
            </a-select>
          </a-form-item>
        </div>
      </div>

      <div class="mt5">
        <h4>地址信息</h4>
        <div class="m6">
          <a-form-item label="商户后台地址">
            <a-input v-decorator="['platformAdminUrl']"/>
          </a-form-item>
          <a-form-item label="代理后台地址">
            <a-input v-decorator="['agentAdminUrl']"/>
          </a-form-item>
        </div>
        <div class="m6">
          <a-form-item label="聊天室后台地址">
            <a-input v-decorator="['chatAdminUrl']"/>
          </a-form-item>
          <a-form-item label="网页客服地址">
            <a-input v-decorator="['customerServiceUrl']"/>
          </a-form-item>
        </div>
        <div class="m6">
          <a-form-item label="分享地址">
            <a-input placeholder="示例：https://www.zhihu.com/" v-decorator="['shareRegisterUrl']"/>
          </a-form-item>
        </div>
      </div>

      <div class="mt5">
        <h4>开放平台信息</h4>
        <div class="m6">
          <a-form-item label="qq开放平台账号">
            <a-input v-decorator="['qqShareAccount']"/>
          </a-form-item>
          <a-form-item label="qq开放平台密码">
            <a-input v-decorator="['qqSharePassword']"/>
          </a-form-item>
        </div>
        <div class="m6">
          <a-form-item label="qqiOSKey">
            <a-input v-decorator="['qqIosKey']"/>
          </a-form-item>
          <a-form-item label="qqAndroidKey">
            <a-input v-decorator="['qqAndroidKey']"/>
          </a-form-item>
        </div>
        <div class="m6">
          <a-form-item label="微信开放平台账号">
            <a-input v-decorator="['wxShareAccount']"/>
          </a-form-item>
          <a-form-item label="微信开放平台密码">
            <a-input v-decorator="['wxSharePassword']"/>
          </a-form-item>
        </div>
        <div class="m6">
          <a-form-item label="微信Key">
            <a-input v-decorator="['wxKey']"/>
          </a-form-item>
        </div>
        <div class="m6">
          <a-form-item label="分享简介">
            <a-textarea v-decorator="['shareRemark']" :rows="2"/>
          </a-form-item>
        </div>
      </div>
      <div class="mt5">
        <h4>友盟接口设置</h4>
        <div class="m6">
          <a-form-item label="AppKey iOS">
            <a-input v-decorator="['umIosKey']"/>
          </a-form-item>
          <a-form-item label="Master Secret iOS">
            <a-input v-decorator="['umIosSecret']"/>
          </a-form-item>
        </div>
        <div class="m6">
          <a-form-item label="AppKey Android">
            <a-input v-decorator="['umAndroidKey']"/>
          </a-form-item>
          <a-form-item label="Master Secret Android">
            <a-input v-decorator="['umAndroidSecret']"/>
          </a-form-item>
        </div>
        <div class="m6">
          <a-form-item label="Alias Type">
            <a-input v-decorator="['umAliasType']"/>
          </a-form-item>
          <a-form-item label="Ticker">
            <a-input v-decorator="['umTicker']"/>
          </a-form-item>
        </div>
        <a-form-item>
          <a-input v-decorator="['configId']" type="hidden"/>
        </a-form-item>
      </div>
      <div class="page-under-table mt5">
        <div class="m6">
          <a-form-item label="Google验证码">
            <a-input v-decorator="['googleCode', { rules: [{ required: true, message: '请输入google验证码'}]}]"/>
          </a-form-item>
        </div>
      </div>
      <div class="mt5 last">
        <a-button type="primary" html-type="submit">确认保存</a-button>&nbsp;
        <a-button @click="$emit('close', false)">取消</a-button>
      </div>
    </a-form>
  </section>
</template>

<script>
import Vue from "vue";
import { Component, Lifecycle, Watch, Prop } from "vue-decorators";
import { Modal, Notification as Notice } from "ant-design-vue";
import * as Api from "@api/bussiness";
import { getToken } from "@/util/auth";

@Component({
  dictionary: "promotionType,maintainStatus",
  formOptions: "id"
})
export default class BussinessAdd extends Vue {
  @Prop({ type: String }) type;
  @Prop({ type: [String, Number] }) userId;

  uploadData = {
    token: getToken()
  };

  init = {
    commissionModes: []
  };

  @Lifecycle created() {
    this.getCommissionMode();
  }

  @Lifecycle mounted() {
    if (this.type === "update") {
      this.getDetail();
    }
  }

  // 获取佣金模式
  async getCommissionMode() {
    const res = await this.$service.fetch("/config-admin-api/platformCommissonMode/queryAllPlatformCommissonMode");
    if (res.code !== 1) res.message && this.$message.error(res.message);
    if (res?.data instanceof Array) {
      this.init.commissionModes = res.data;
    }
  }

  async beforeUpload(file) {
    let fileList = [file];
    await this.$nextTick(() => this.toUpload(fileList));
  }

  async toUpload(fileList) {
    const formdata = new FormData();
    formdata.append("imageFile", fileList[0]);
    formdata.append("token", this.token);
    formdata.append("uploadTypeName", "platformLogo");

    const res = await this.$service.fetch( "/common-api/upload/uploadAdminImage", formdata);
    if (1 != res.code) return res.message && this.$message.error(res.message);
    this.vform.setValue("logoUrl", res.data?.imageUrl);
  }

  async getDetail() {
    const { data: res } = await Api.queryBussinessDetail({
      id: this.userId
    });
    if (res?.body?.code === 1 && typeof res.body.data === "object") {
      this.vform.setValues(res.body.data, true);
    }
  }

  // 修改或者更新, 根据this.type来判断, update 或者 add
  async updateOrAddAction() {
    if (this.type === "update") {
      const form = await this.vform.validate();
      if (form.errors) return;
      const { data: res } = await Api.editBussinessInfo(
        Object.assign(form.values, { id: this.userId })
      );
      if (res?.body?.code === 1) {
        Notice.success({ message: "提示", description: res.body.message });
        this.$emit("close", true);
      }
    } else {
      const form = await this.vform.validate();
      if (form.errors) return;
      const { data: res } = await Api.addBussinessInfo(form.values);
      if (res?.body?.code === 1) {
        Notice.success({ message: "提示", description: res.body.message });
        this.$emit("close", true);
      }
    }
  }
}
</script>

<style lang="scss">
.update-load {
  padding-left: 80px;
  .ant-input {
    width: 480px;
  }
}
.bussiness-add {
  .mt5 {
    h4 {
      font-weight: bold;
      margin: 10px 0 5px 40px;
      width: 100px;
      text-align: right;
    }

    .m6 {
      display: flex;
      justify-content: space-between;
      .ant-form-item-label label {
        width: 150px;
        display: inline-block;
        text-align: right;
      }
      .ant-input {
        width: 206px;
      }
    }
  }
  .last {
    margin-top: 20px;
    padding-left: 150px;
  }
}
</style>
