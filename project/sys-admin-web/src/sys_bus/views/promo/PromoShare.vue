<template>
  <!--分享优惠活动-->
  <div class="page-wrapper">
    <a-tabs>
      <a-tab-pane tab="分享活动设置" key="1" v-if="premissions.includes('activityManager:shareAcitivity:shareCashSetting')">
        <share-setting  />
      </a-tab-pane>
      <a-tab-pane tab="分享礼金记录" key="2" v-if="premissions.includes('activityManager:shareAcitivity:shareCashRecord')">
        <share-gift  />
      </a-tab-pane>
      <a-tab-pane tab="分享返水记录" key="3" v-if="premissions.includes('activityManager:shareAcitivity:backWaterRecord')">
        <share-rebate />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script>
import Vue from 'vue'
import { Component, InjectComponents } from 'vue-decorators'
import { ShareSetting, ShareRebate, ShareGift} from './share'

@Component
@InjectComponents({
  ShareSetting, ShareRebate, ShareGift
})
export default class PromoShare extends Vue {

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