<style lang="scss" scoped>
.wrapper {
  height: 100%; box-sizing: border-box;
  overflow-y: auto; border-radius: 4px; 
  .panel {
    padding: 0 15px 15px; background: #ffffff; margin-bottom: 20px;
    h1 { font-size: 16px; font-weight: bold; }
    .input { width: 200px; }
    .span1 { display: inline-block; min-width: 80px; margin-right: 20px }
    .panel2 {
      margin: 10px -15px 0;  width: 100%; border-top: 1px solid #ddd;
      padding: 15px 15px 0; 
      > button { margin-right: 15px; }
    }

    .tabs {
      margin: 20px 0;
      > button { margin-right: 15px; }
    }

    /deep/ {
      .ant-tabs-content {
        min-height: calc(100vh - 190px);
      }
    }
  }
}
</style>
<template>
  <div class="wrapper">
    <div class="panel">
      <a-tabs>
        <a-tab-pane tab="开奖号码" :key="0"  v-if="premissions.includes('lotteryManager:openNumber:query')"><OpennosList /></a-tab-pane>
        <a-tab-pane tab="新增开奖记录" :key="1"  v-if="premissions.includes('lotteryManager:openNumber:add')"><OpennosNew /></a-tab-pane>
        <a-tab-pane tab="手动补开记录" :key="2"  v-if="premissions.includes('lotteryManager:openNumber:manualOpen')"><OpennosManual /></a-tab-pane>
        <a-tab-pane tab="撤销开奖记录" :key="3"  v-if="premissions.includes('lotteryManager:openNumber:cancel')"><OpennosRevoke /></a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { Component, InjectComponents, Prop, Watch, Lifecycle, Computed, Filter, State, Action, Getter, Mutation } from 'vue-decorators';

import OpennosList from './OpennosList';
import OpennosNew from './OpennosNew';
import OpennosManual from './OpennosManual';
import OpennosRevoke from './OpennosRevoke';

const dictionary = '';

@Component({ dictionary })
@InjectComponents({ OpennosList, OpennosNew, OpennosManual, OpennosRevoke })
export default class Opennos extends Vue {
  tabkey = 0;
}
</script>