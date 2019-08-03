<template>
    <div class="finance-container">
        <a-tabs @change="callback" :activeKey="activeKey">
            <a-tab-pane tab="不可提管理额度" :key="1">
                <NoQuatoManagement />
            </a-tab-pane>
            <a-tab-pane tab="增减记录" :key="2">
                <RecordTheIncreaseOrDecrease />
            </a-tab-pane>
        </a-tabs>
    </div>
</template>

<script>
    import Vue from 'vue'
    import { Component, InjectComponents } from 'vue-decorators'
    import { NoQuatoManagement, RecordTheIncreaseOrDecrease } from "./notquotamanagement"

    @Component
    @InjectComponents({ NoQuatoManagement, RecordTheIncreaseOrDecrease })
    export default class NotQuotaManagements extends Vue {
        activeKey = 1;
        callback(key) {
            this.activeKey = key;
        }
    }

</script>

<style lang="scss" scoped>
    .finance-container {
        background-color: #fff;
        height: 100%;
        overflow-y: auto;
        padding: 10px;
        box-sizing: border-box;
    }
</style>

