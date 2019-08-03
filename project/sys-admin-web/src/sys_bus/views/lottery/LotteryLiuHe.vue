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
  }
}
</style>
<template>
  <div class="wrapper">
    <div class="panel">
      <a-tabs v-model="tabkey">
        <a-tab-pane tab="当前盘口" :key="0" v-if="premissions.includes('lotteryManager:markSix:currentTape')">
          <LiuheHandicapCurrentForm v-if="0 == tabkey"/>
        </a-tab-pane>
        <a-tab-pane tab="预期盘口" :key="1" v-if="premissions.includes('lotteryManager:markSix:readyOpenTape')">
          <LiuheHandicapAdvanceForm v-if="1 == tabkey"/>
        </a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { Component, InjectComponents, Prop, Watch, Lifecycle, Computed, Filter, State, Action, Getter, Mutation, InjectComponent } from 'vue-decorators';

import LiuheHandicapCurrentForm from './LiuheHandicapCurrentForm';
import LiuheHandicapAdvanceForm from './LiuheHandicapAdvanceForm';

const dictionary = '';
@Component({ dictionary })
@InjectComponents({ LiuheHandicapCurrentForm, LiuheHandicapAdvanceForm })
export default class LiuheHandicap extends Vue {

  tabkey = 0;
  
}
</script>
