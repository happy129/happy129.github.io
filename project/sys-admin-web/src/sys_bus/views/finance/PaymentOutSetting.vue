<template>
  <div class="finance-container">
    <a-tabs>
      <a-tab-pane tab="第三方出款设置" key="1" v-if="premissions.includes('accountManager:outAccountSetting:thirdPaySetting')">
        <PayoutSetting />
      </a-tab-pane>
      <a-tab-pane tab="第三方出款网关管理" key="2" v-if="premissions.includes('accountManager:outAccountSetting:thirdPayNetworkSetting')">
        <PayoutMange />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script>
import Vue from 'vue'
import { Component, InjectComponents } from 'vue-decorators'
import PayoutSetting from "./payment-out-setting/PayoutSetting"
import PayoutMange from "./payment-out-setting/PayoutMange"

@Component
@InjectComponents({ PayoutSetting, PayoutMange })
export default class PaymentOutSetting extends Vue {}
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