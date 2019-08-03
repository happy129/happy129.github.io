<template>
  <div class="product-config">
    <a-tabs :activeKey="activeKey" @change="changeTab">
      <a-tab-pane tab="常规配置" :key="1">
        <ProductConfig />
      </a-tab-pane>
      <a-tab-pane tab="维护配置"  :key="2">
        <ProductMaintain />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script>
import Vue from "vue"
import { Component, Lifecycle, InjectComponents, Prop, State } from "vue-decorators";
import ProductConfig from "./ProductConf";
import ProductMaintain from "./ProductMaintain"

@Component
@InjectComponents({ ProductConfig, ProductMaintain })
export default class ProductSetting extends Vue {
  activeKey = 1;

  changeTab(key) {
    this.activeKey = key
  }
}

</script>

<style lang="scss" scoped>
.product-config {
  background-color: #fff;
  min-height: 100%;
}
</style>