<template>
    <div class="page-container">
        <a-tabs>
            <a-tab-pane tab="CDN配置" key="1">
                <CdnConfiguration />
            </a-tab-pane>
            <a-tab-pane tab="CDN管理" key="2">
                <CdnManagement />
            </a-tab-pane>
        </a-tabs>
    </div>
</template>

<script>
    import Vue from 'vue'
    import { Component, InjectComponents } from 'vue-decorators'
    import { CdnConfiguration, CdnManagement } from './cdnconfigs'

    @Component({})
    @InjectComponents({
        CdnConfiguration, CdnManagement
    })
    export default class cdnManagement extends Vue {
        activeKey = "1";
    }
</script>