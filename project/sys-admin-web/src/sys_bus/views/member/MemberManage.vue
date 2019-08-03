<template>
  <div class="page-container memberManage">
    <a-tabs>
      <a-tab-pane tab="会员列表" key="1" v-if="premissions.includes('userManager:userManager:userList')">
        <MemberList />
      </a-tab-pane>
      <a-tab-pane tab="设备锁管理" key="2" v-if="premissions.includes('userManager:userManager:deviceLock')">
        <MemberDeviceLock />
      </a-tab-pane>
      <a-tab-pane tab="手机设备限制" key="3" v-if="premissions.includes('userManager:userManager:mobileDeviceRestrictions')">
        <MemberMobileLimit />
      </a-tab-pane>
      <a-tab-pane tab="密码冻结管理" key="4" v-if="premissions.includes('userManager:userManager:passwordFreeze')">
        <MemberPasswordLock />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>


<script>
import Vue from 'vue'
import { Component, InjectComponents } from 'vue-decorators'
import { MemberList, MemberDeviceLock,  MemberMobileLimit, MemberPasswordLock} from './member'

@Component
@InjectComponents({
    MemberList, MemberDeviceLock, MemberMobileLimit, MemberPasswordLock
})
export default class MemberManage extends Vue {

}
</script>
<style lang="scss" scoped>
.memberManage {
  height: 100%;
  overflow-y: auto;
}
</style>