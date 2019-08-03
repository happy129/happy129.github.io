<template>
  <div class="version-and">
    <TabIos :appType="1"/>
  </div>
</template>

<script>
import Vue from 'vue'
import { Component, InjectComponents ,Lifecycle, Watch } from "vue-decorators";
import TabIos from "@views/version_management/ios"


@Component
@InjectComponents({TabIos})
export default class TabAndroid extends Vue {
  
}
</script>