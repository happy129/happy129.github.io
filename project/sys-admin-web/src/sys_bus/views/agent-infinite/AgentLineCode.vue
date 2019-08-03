<template>
    <div class="agent-container">
        <a-tabs>
            <a-tab-pane tab="排线码管理" key="1">
                <LineCodeManager />
            </a-tab-pane>
            <a-tab-pane tab="排线码用户" key="2">
                <LineCodeUser />
            </a-tab-pane>
            <a-tab-pane tab="排线码设置" key="3">
                <LineCodeSetting />
            </a-tab-pane>
        </a-tabs>
    </div>
</template>

<script>
import Vue from 'vue'
import { Component, InjectComponents } from 'vue-decorators'
import LineCodeManager from "./agent-line-code/LineCodeManager"
import LineCodeUser from "./agent-line-code/LineCodeUser"
import LineCodeSetting from "./agent-line-code/LineCodeSetting"

@Component
@InjectComponents({ LineCodeManager, LineCodeUser, LineCodeSetting })
export default class AgentLineCode extends Vue {}

</script>

<style lang="scss" scoped>
.agent-container {
    height: 100%;
    padding: 5px 10px;
    background-color: #fff;
}
</style>
