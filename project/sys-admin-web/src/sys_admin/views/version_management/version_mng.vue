<template>
  <section class="version_mng">
    <a-tabs>
      <a-tab-pane tab="Ios" key="1" v-if="premissions.includes('versionManager:businessManager:queryIos')">
        <TabIos :appType="2"/>
      </a-tab-pane>
      <a-tab-pane tab="Android" key="2" v-if="premissions.includes('versionManager:businessManager:queryAndroid')">
        <TabAndroid  :appType="1"/>
      </a-tab-pane>
    </a-tabs>
  </section>
</template>

<script>
import Vue from "vue";
import { Component, InjectComponents ,Lifecycle, Watch } from "vue-decorators";
import { Modal, Notification as Notice } from "ant-design-vue";
import TabAndroid from './android'
import TabIos from './ios'

@Component
@InjectComponents({
  TabAndroid, TabIos
})
export default class VersionManage extends Vue {
}
</script>

<style lang="scss">
.version_mng {
  background-color: #fff;
  padding: 15px; 
  min-height: 100%;
}
</style>


