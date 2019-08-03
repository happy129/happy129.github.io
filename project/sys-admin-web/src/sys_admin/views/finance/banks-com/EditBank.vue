<template>
  <div class="back-layer">
    <div class="dialog-box" @click.stop>
      <div class="title">
        <span>修改银行</span>
        <span class="close-tag" @click="close">X</span>
      </div>
      <div style="text-align:left;padding:20px;">
        <a-form :form="form" layout="inline">
          <a-form-item label="LOGO">
            <a-input v-model="logoUrl"></a-input>
          </a-form-item>
          <a-form-item style="margin-left:10px;cursor:pointer;">
            <a-upload
              :beforeUpload="beforeUpload"
              :showUploadList="false"
              style="border:solid 1px #999999;border-radius:6px;padding:6px 20px;"
              @change="toUpload"
            >上传</a-upload>
          </a-form-item>

          <br>
          <a-form-item label="银行名称">
            <a-input
              v-decorator="['bankName', {initialValue:detail.bankName, rules: [{required: true }]}]"
            ></a-input>
          </a-form-item>

          <br>
          <a-form-item label="总行联号">
            <a-input v-decorator="['bankCode', {initialValue:detail.bankCode,rules: [{required: true, message:'银行总行联行号只能是不超50位的数字', pattern: /^\d{0,50}$/ }]}]"></a-input>
          </a-form-item>
          <br>
          <a-form-item label="状态">
            <a-radio-group
              v-decorator="['isEnabled', {initialValue:detail.isEnabled, rules: [{required: true, message:'请选择状态'}]}]"
            >
              <a-radio :value="1">启用</a-radio>
              <a-radio :value="0">禁用</a-radio>
            </a-radio-group>
          </a-form-item>
        </a-form>
      </div>
      <a-button type="primary" @click="submit">保存</a-button>
    </div>
  </div>
</template>
<script>
import Vue from "vue";
import { Component, Lifecycle, InjectComponents, State, Prop } from "vue-decorators";
import { getToken } from "@/util/auth";

@Component
export default class EditBank extends Vue {
  fileList = [];
  @Prop() detail;
  logoUrl = "";
  close() {
    this.$emit("close");
  }

  @Lifecycle() created() {
    this.form = this.$form.createForm(this);
  }

  @Lifecycle() mounted() {
    this.logoUrl = this.detail.logoUrl;
  }

  beforeUpload(file) {
    this.fileList = [...this.fileList, file];
    return false;
  }

  async toUpload(fileList) {
    const formdata = new FormData();
    formdata.append("imageFile", this.fileList[0]);
    formdata.append("token", getToken());
    formdata.append("uploadTypeName", "bankIcon");

    const res = await this.$service.fetch(
      "/common-api/upload/uploadAdminImage",
      formdata
    );
    if (1 != res.code) return res.message && this.$message.error(res.message);
    this.logoUrl = res.data?.imageUrl;
    this.$message.success(res.message);
  }

  submit() {
    this.form.validateFields(async (e, v) => {
      if (e) return;
      let res = await this.$service.fetch("/config-admin-api/bank/editBank", {
        id: this.detail.id,
        logoUrl: this.logoUrl,
        ...v
      });
      if (1 !== res.code) return res.message && this.$message.error(res.message);
      this.$emit("ok");
      this.$message.success(res.message);
      this.$emit('close');
    });
  }
}
</script>

<style lang="scss" scoped>
@import "@views/admin/Pop.scss";
/deep/ .ant-form-item-label {
  width: 80px;
}
</style>
