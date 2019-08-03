<template>
  <div class="add-none-bank back-layer">
    <div class="dialog-box" @click.stop>
      <div class="title">
        <span>添加银行信息</span>
        <span class="close-tag" @click="close">&times;</span>
      </div>
      <div class="add-none-inside">
        <a-form layout="inline" :form="vform">
          <a-form-item label="持卡人">
            <a-input v-decorator="['realName', {rules: [{required: true, message: '持卡人不能为空'}] } ]"/>
          </a-form-item>
          <br>
          <a-form-item label="银行名称">
             <a-input v-decorator="['bankName', {rules: [{required: true, message: '银行名称不能为空'}] }]"/>
          </a-form-item>
          <br>
          <a-form-item label="银行卡号">
             <a-input @change="$number" v-decorator="['cardNo', {rules: [{required: true, message: '银行卡号不能为空'}] }]"/>
          </a-form-item>
          <br>
          <a-form-item label="开户地址">
            <a-input  v-decorator="['bankAddress', {rules: [{required: true, message: '开户地址不能为空'}] }]"/>
          </a-form-item>
        </a-form>
      </div>
      <div class="add-none-btn">
         <a-button type="primary" :loading="init.loading" @click="submit">提交</a-button>
      </div>
    </div>
  </div>
</template>
<script>
import Vue from "vue";
import { Component, Lifecycle, InjectComponents, Prop } from "vue-decorators";

@Component({ formOptions: "id" })
export default class AddNonBank extends Vue {
  init = {
    loading: false
  }

  close() {
    this.$emit("close");
  }

  async submit() {
    const form = await this.vform.validate();
    if (form.errors) return;
    this.init.loading = true;
    const res = await this.$service.fetch('/lottery-admin-api/unwithdrawableBankCard/addUnwithdrawableBankCard', form.values);
    this.init.loading = false;
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.$message.success(res.message);
    this.$emit("close");
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
.add-none-bank {
  width: 520px;
  .close-tag {
    font-size: 22px !important;
  }
  .add-none-inside {
    padding: 0 20px 20px 20px;
  }
  .add-none-btn {
    text-align: right;
    padding-right: 20px;
  }
}

</style>
