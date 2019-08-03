<template>
  <!--分享优惠活动-->
  <div class="page-container">
    <a-tabs>
      <a-tab-pane tab="配置组管理" key="1"  v-if="premissions.includes('configurationManager:configurationManager:queryGroup')">
        <ConfigurationGroup />
      </a-tab-pane>
      <a-tab-pane tab="配置项管理" key="2"  v-if="premissions.includes('configurationManager:configurationManager:queryItem')">
        <ConfigurationItem  />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script>
import Vue from 'vue'
import { Component, InjectComponents } from 'vue-decorators'
import { ConfigurationGroup, ConfigurationItem} from './configs'

@Component
@InjectComponents({
  ConfigurationGroup, ConfigurationItem
})
export default class ConfigManage extends Vue {

	activeKey = "1";

}
</script>