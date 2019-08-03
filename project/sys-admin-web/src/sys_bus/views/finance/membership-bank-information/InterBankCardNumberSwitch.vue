<template>
  <div class="page-container">
      会员同银行卡号开关（允许会员绑定相同银行卡号）
      <a-switch v-permission="20159" v-model="checked" checkedChildren="ON" unCheckedChildren="OFF" @change="EditStatus"></a-switch>
  </div>
</template>

<script>
import Vue from "vue";
import moment from "moment";
import { Component, InjectComponents, Lifecycle, Watch } from "vue-decorators";
@Component
@InjectComponents({})
export default class InterBankCardNumberSwitch extends Vue {
  checked = false;

  @Lifecycle mounted() {  
    this.queryStatus();
  }

  async queryStatus() {
    const res = await this.$service.fetch('/lottery-admin-api/userBankCard/getSameBankCardBindingSwitch');
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    if (res.data?.isEnabled == 1) {
      this.checked = true;
    } else {
      this.checked = false;
    }
  }

  async EditStatus() {
    const res = await this.$service.fetch('/lottery-admin-api/userBankCard/editSameBankCardBindingSwitch', {isEnabled: this.checked == true ? 1 : 0});
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.$message.success(res.message);
  }

}
</script>
<style lang="scss" scoped>
@import "@views/admin/Pop.scss";
</style>