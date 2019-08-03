<template>
  <div class="finance-container">
    <a-tabs @change="callback" :activeKey="activeKey">
      <a-tab-pane tab="汇款银行设置" :key="1" v-if="premissions.includes('accountManager:inAccountSetting:remittingBankSetting')">
        <BankSetting />
      </a-tab-pane>
      <a-tab-pane tab="二维码设置" :key="2" v-if="premissions.includes('accountManager:inAccountSetting:qrCodeSettings')">
        <QrCodeSetting />
      </a-tab-pane>
      <a-tab-pane tab="在线支付设置" :key="3" v-if="premissions.includes('accountManager:inAccountSetting:onlinePaySetting')">
        <OnlinePaymentSetting />
      </a-tab-pane>
      <a-tab-pane tab="在线支付类型管理" :key="4" v-if="premissions.includes('accountManager:inAccountSetting:onlinePayTypeSetting')">
        <OnlinePaymentTypesMange />
      </a-tab-pane>
      <a-tab-pane tab="在线支付网关管理" :key="5" v-if="premissions.includes('accountManager:inAccountSetting:onlinePayNetworkSetting')">
        <OnlinePaymentNetMange />
      </a-tab-pane>
      <a-tab-pane tab="支付分类设置" :key="6" v-if="premissions.includes('accountManager:inAccountSetting:payCategorySetting')">
         <PaymentCategory v-if="activeKey==6"/>
      </a-tab-pane>
      <a-tab-pane tab="充值卡管理" :key="7" v-if="premissions.includes('accountManager:inAccountSetting:loadCardManager')">
        <LoadCardManage />
      </a-tab-pane>
  </a-tabs>
  </div>
</template>

<script>
import Vue from 'vue'
import { Component, InjectComponents } from 'vue-decorators'
import { BankSetting, QrCodeSetting, OnlinePaymentTypesMange, OnlinePaymentSetting, PaymentCategory, LoadCardManage, OnlinePaymentNetMange } from "./payment-setting"

@Component
@InjectComponents({ BankSetting, QrCodeSetting, OnlinePaymentTypesMange, OnlinePaymentSetting, PaymentCategory, LoadCardManage, OnlinePaymentNetMange })
export default class PaymentSetting extends Vue {
  activeKey = 1;
  callback(key) {
    this.activeKey = key;
  }
}

</script>

<style lang="scss" scoped>
.finance-container {
  background-color: #fff;
  height: 100%;
  overflow-y: auto;
  padding: 10px;
  box-sizing: border-box;
}
</style>

