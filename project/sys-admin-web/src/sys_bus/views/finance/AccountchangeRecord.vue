<template>
  <div class="finance-container">
    <a-tabs> 
      <!-- <a-tab-pane tab="游戏账变" key="1"  v-if="premissions.includes('accountManager:accountChange:gameAccountChange')">
        <Game/>
      </a-tab-pane>
      <a-tab-pane tab="资金账变" key="2"  v-if="premissions.includes('accountManager:accountChange:moneyAccountChange')">
        <Fund/>
      </a-tab-pane> -->
      <a-tab-pane tab="全部账变" key="3"  v-if="premissions.includes('accountManager:accountChange:allAccountChange')">
        <All/>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script>
import Vue from 'vue'
import { Component, InjectComponents } from 'vue-decorators'
import {Game, Fund, All} from './accountchange-record'
@Component
@InjectComponents({
  Game,
  Fund,
  All
})
export default class ManualDeposit extends Vue {
  activeKey = "3"
}
</script>
<style lang="scss" scoped>
.finance-container {
  background-color: #fff;
  min-height: 100%;
  overflow-y: auto;
  padding: 10px;
  box-sizing: border-box;
}
</style>
