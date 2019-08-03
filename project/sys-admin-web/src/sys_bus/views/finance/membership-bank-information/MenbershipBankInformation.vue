<template>
  <div class="container">
    <a-tabs  @change="callback">
      <a-tab-pane tab="当前银行" key="当前银行" v-if="premissions.includes('accountManager:userBankInfo:currentBank')">
        <currentBank/>
      </a-tab-pane>

      <a-tab-pane tab="历史银行" key="历史银行" v-if="premissions.includes('accountManager:userBankInfo:historyBank')">
        <history-bank></history-bank>
      </a-tab-pane>

      <a-tab-pane tab="不出款银行" key="不出款银行" v-if="premissions.includes('accountManager:userBankInfo:notOutBank')">
        <non-payment-bank></non-payment-bank>
      </a-tab-pane>

      <a-tab-pane tab="同银行卡号开关" key="同银行卡号开关" v-if="premissions.includes('accountManager:userBankInfo:commonBankSwitch')">
        <inter-bank-card-number-switch></inter-bank-card-number-switch>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script>
import Vue from "vue";
import moment from "moment";
import { Component, InjectComponents, Lifecycle, Watch } from "vue-decorators";
import currentBank from './CurrentBank'
import historyBank from './HistoryBank'
import nonPaymentBank from './NonPaymentBank'
import interBankCardNumberSwitch from './InterBankCardNumberSwitch'

@Component
@InjectComponents({currentBank, historyBank, nonPaymentBank, interBankCardNumberSwitch})
export default class MenbershipBankInformation extends Vue {
  callback() {}
}
</script>
<style lang="scss" scoped>
.container {
  min-height: 100%;
  background-color: #fff;
  padding: 10px;
}
</style>