<template>
  <div class="page-container">
    <a-tabs>
      <a-tab-pane tab="会员盈亏排行" v-if="premissions.includes('userManager:memberRreport:memberProfitRank')" key="1">
        <MemberProfit/>
      </a-tab-pane>
      <a-tab-pane tab="会员出入账目" v-if="premissions.includes('userManager:memberRreport:memberAccessAccount')"  key="2">
        <MemberAccountChange/>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>


<script>
import Vue from "vue";
import { Component, InjectComponents } from "vue-decorators";
import MemberProfit from "./report/MemberProfit";
import MemberAccountChange from "./report/MemberAccountChange"

@Component
@InjectComponents({
  MemberProfit,
  MemberAccountChange
})
export default class MemberReport extends Vue {}
</script>
