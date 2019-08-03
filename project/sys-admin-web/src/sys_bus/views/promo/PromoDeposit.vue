<template>
  <!--首充优惠活动-->
  <div class="promo-container">
    <a-tabs>
      <a-tab-pane tab="首充活动设置" key="1" v-if="premissions.includes('activityManager:onSaleAcitivity:firstRechageSetting')">
        <depositSetting />
      </a-tab-pane>
      <a-tab-pane tab="首充礼金统计" key="2" v-if="premissions.includes('activityManager:onSaleAcitivity:firstCashgiftSetting')">
        <depositTotal />
      </a-tab-pane>
      <a-tab-pane tab="首充礼金赠送" key="3" v-if="premissions.includes('activityManager:onSaleAcitivity:firstCashGiveSetting')">
        <depositGift />
      </a-tab-pane>
      <a-tab-pane tab="首充礼金返水" key="4" v-if="premissions.includes('activityManager:onSaleAcitivity:firstCashBackWaterSetting')">
        <depositRebate />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script>
import Vue from 'vue'
import { Component, InjectComponents, Watch } from 'vue-decorators'
import { DepositSetting, DepositTotal, DepositRebate, DepositGift} from './deposit'

@Component()
@InjectComponents({
  DepositSetting, DepositTotal, DepositRebate, DepositGift
})
export default class PromoDeposit extends Vue {

	activeKey = "1";

}
</script>

<style lang="scss" scoped>
.promo-container {
  background-color: #fff;
  min-height: 100%;
  padding: 10px;
  box-sizing: border-box;
}
</style>