<template>
  <div class="finance-container">
    <a-tabs @change="change">
      <a-tab-pane tab="单笔加减款" key="1" v-if="premissions.includes('accountManager:handworkAccount:singleAmount')">
        <SingleAdd v-if="activeKey === '1'"/>
      </a-tab-pane>
      <a-tab-pane tab="批量加减款" key="2" v-if="premissions.includes('accountManager:handworkAccount:batchAmount')">
        <BatchAdd @showForm="showFormFunc" v-if="!showForm && activeKey === '2'"/>
        <BatchAddForm  @showForm="showFormFunc" v-if="showForm"/>
      </a-tab-pane>
      <a-tab-pane tab="加减款记录" key="3" v-if="premissions.includes('accountManager:handworkAccount:handworkAmountRecord')">
        <AllRecord v-if="activeKey === '3'"/>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script>
import Vue from 'vue'
import { Component, InjectComponents } from 'vue-decorators'
import {SingleAdd, BatchAdd, AllRecord, BatchAddForm} from './manual-deposit'

@Component
@InjectComponents({
  SingleAdd,
  BatchAdd,
  AllRecord,
  BatchAddForm
})
export default class ManualDeposit extends Vue {
  activeKey = "1"

  showForm = false;

  showFormFunc() {
    this.showForm = !this.showForm;
  }

  change(key) {
    this.activeKey = key
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
