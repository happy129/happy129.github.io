<template>
  <!--签到活动-->
  <div class="page-wrapper">
    <a-tabs>
      <a-tab-pane tab="签到活动设置" key="1" v-if="premissions.includes('activityManager:signAcitivity:signAcitivitySetting')">
        <sign-setting  />
      </a-tab-pane>
      <a-tab-pane tab="签到礼金记录" key="2" v-if="premissions.includes('activityManager:signAcitivity:signCashRecord')">
        <sign-record />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script>
import Vue from 'vue'
import { Component, InjectComponents } from 'vue-decorators'
import { SignSetting, SignRecord } from './sign'

@Component
@InjectComponents({
  SignSetting, SignRecord 
})
export default class PromoSign extends Vue {


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