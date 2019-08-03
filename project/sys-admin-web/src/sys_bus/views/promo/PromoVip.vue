<template>
  <!--vip 活动-->
  <div class="page-wrapper">
    <a-tabs>
      <a-tab-pane tab="VIP活动设置" key="1" v-if="premissions.includes('activityManager:vipAcitivity:setting')">
        <vip-setting/>
      </a-tab-pane>
      <a-tab-pane tab="VIP升级礼金" key="2" v-if="premissions.includes('activityManager:vipAcitivity:upgradeCash')">
        <vip-gift/>
      </a-tab-pane>
      <a-tab-pane tab="VIP返水记录" key="3" v-if="premissions.includes('activityManager:vipAcitivity:backWaterCash')">
        <vip-rebate />
      </a-tab-pane>
      <a-tab-pane tab="VIP进度查询" key="4" v-if="premissions.includes('activityManager:vipAcitivity:progressQuery')">
        <vip-Progress />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script>
import Vue from 'vue'
import { Component, InjectComponents } from 'vue-decorators'
import { VipSetting, VipProgress, VipRebate, VipGift} from './vip'

@Component
@InjectComponents({
  VipSetting, VipProgress, VipRebate, VipGift
})
export default class PromoVip extends Vue {
	activeKey = "1";
}
</script>

<style lang="scss" scoped>
.page-wrapper {
  min-height: 100%;
  background-color: #fff;
  padding: 10px;
}
</style>
