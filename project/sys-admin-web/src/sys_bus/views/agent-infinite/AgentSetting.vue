<template>
  <div class="agent-container">
    <a-tabs>
      <a-tab-pane tab="无限代设置" v-if="premissions.includes('agentCentre:unlimitAgentSetting:setting')" key="1">
        <Setting />
      </a-tab-pane>
      <a-tab-pane tab="等级配置"  v-if="premissions.includes('agentCentre:unlimitAgentSetting:levelSetting')" key="2">
        <Level />
      </a-tab-pane>
      <a-tab-pane tab="第三方等级配置" v-if="premissions.includes('agentCentre:unlimitAgentSetting:thirdSetting')" key="3">
        <ThirdLevel />
      </a-tab-pane>
      <a-tab-pane tab="推广域名配置"  v-if="premissions.includes('agentCentre:unlimitAgentSetting:domainSetting')" key="4">
        <DomainSetting />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script>
import Vue from "vue";
import { Component, InjectComponents } from "vue-decorators";
import Setting from "./agent-setting/Setting";
import Level from "./agent-setting/Level";
import DomainSetting from "./agent-setting/DomainSetting";
import ThirdLevel from "./agent-setting/ThirdLevel";

@Component
@InjectComponents({ Setting, Level, DomainSetting, ThirdLevel })
export default class AgentSetting extends Vue {}
</script>

<style lang="scss" scoped>
.agent-container {
    height: 100%;
    padding: 5px;
    background-color: #fff;
    overflow-y: auto;
}
</style>
