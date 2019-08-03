<template>
  <div class="back-layer">
    <div class="dialog-box" @click.stop>
      <div class="title">
        <span>添加银行信息</span>
        <span class="close-tag" @click="close">X</span>
      </div>

      <div style="text-align:left;padding:20px;">
        <a-form layout="inline" :form="form">
          <a-form-item label="会员账号">
            <a-input></a-input>
          </a-form-item>
          <br>
          <a-form-item label="持卡人">
            <a-input></a-input>
          </a-form-item>
          <br>
          <a-form-item label="银行名称">
            <a-input></a-input>
          </a-form-item>
          <br>
          <a-form-item label="银行卡号">
            <a-input></a-input>
          </a-form-item>
          <br>
          <a-form-item label="开户地址">
            <a-input></a-input>
          </a-form-item>
        </a-form>
      </div>
      <a-button type="primary" @click="submit" style="margin-right:10px;">提交</a-button>
      <a-button type="primary" @click="reset">重置</a-button>
    </div>
  </div>
</template>
<script>
import Vue from "vue";
import { Component, Lifecycle, InjectComponents, Prop } from "vue-decorators";
@Component
export default class AddCurrentBank extends Vue {
  @Lifecycle() created() {
    this.form = this.$form.createForm(this);
  }
  
  close() {
    this.$emit("close");
  }

  reset() {}

  async submit() {
  }
}
</script>
<style lang="scss" scoped>
@import "@views/admin/Pop.scss";
.back-layer /deep/ {
  .title {
    margin-bottom: 20px;
  }
  .ant-form-item-label {width: 90px;}
}
</style>
