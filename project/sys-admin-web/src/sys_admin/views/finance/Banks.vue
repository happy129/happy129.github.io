<template>
  <div class="subaccount-box page-container">
    <a-tabs @change="callback">
      <a-tab-pane tab="支持银行" key="支持银行" v-if="premissions.includes('financeManager:subBankManage')">
        <support-banks></support-banks>
      </a-tab-pane>
      <a-tab-pane tab="银行识别" key="银行识别" v-if="premissions.includes('financeManager:subBankRecognize')">
        <banks-distinguish></banks-distinguish>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>
<script>
import Vue from "vue";
import { Component, Lifecycle, InjectComponents, State } from "vue-decorators";
import supportBanks from "./banks-com/SupportBanks";
import banksDistinguish from "./banks-com/BanksDistinguish";

@Component
@InjectComponents({ supportBanks, banksDistinguish })
export default class Bands extends Vue {
  currentTab = "支持银行"
  callback(v) {this.currentTab = v}
}
</script>

<style lang="scss" scoped>
@import "@views/admin/Pop.scss";
.subaccount-box /deep/ {
  .ant-btn {
    margin: auto 7px;
  }
}
</style>