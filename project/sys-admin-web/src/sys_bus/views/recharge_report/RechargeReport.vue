<template>
  <!--vip 活动-->
  <div class="page-wrapper">
    <a-tabs>
      <a-tab-pane tab="充值用户查询" key="2" v-if="premissions.includes('activityManager:vipAcitivity:upgradeCash')">
        <RechargeUserQuery/>
      </a-tab-pane>
      <a-tab-pane tab="充值订单统计" key="1" v-if="premissions.includes('activityManager:vipAcitivity:setting')">
        <RechargeOrderStatistics/>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script>
import Vue from 'vue'
import { Component, InjectComponents } from 'vue-decorators'
/* 充值订单统计 */
import RechargeOrderStatistics from './components/RechargeOrderStatistics'
/* 充值用户查询 */
import RechargeUserQuery from './components/RechargeUserQuery'

@Component
@InjectComponents({
	RechargeOrderStatistics,
	RechargeUserQuery
})
export default class PromoVip extends Vue {
	activeKey = "2";
}
</script>

<style lang="scss" scoped>
.page-wrapper {
  min-height: 100%;
  background-color: #fff;
  padding: 10px;
}
</style>
