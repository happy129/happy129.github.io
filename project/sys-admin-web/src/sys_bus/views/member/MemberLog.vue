<template>
    <div class="log-container">
        <a-tabs>
            <a-tab-pane tab="用户登录日志" key="1" v-if="premissions.includes('userManager:memberLog:userLoginLog')">
                <LogList />
            </a-tab-pane>
            <a-tab-pane tab="意见反馈" key="2" v-if="premissions.includes('userManager:memberLog:opinionFeedback')">
               <LogFeedback />
            </a-tab-pane>
            <a-tab-pane tab="投诉反馈" key="3" v-if="premissions.includes('userManager:memberLog:complaintFeedback')">
               <LogComplain />
            </a-tab-pane>
        </a-tabs>
    </div>
</template>


<script>
import Vue from 'vue'
import { Component, InjectComponents } from 'vue-decorators'
import { LogList, LogFeedback, LogComplain } from './log'

@Component
@InjectComponents({
    LogList, LogFeedback, LogComplain
})
export default class MemberLog extends Vue {}
</script>

<style lang="scss" scoped>
.log-container {
    height: 100%;
    background-color: #fff;
    padding: 10px;
    overflow-y: auto;
}
</style>



