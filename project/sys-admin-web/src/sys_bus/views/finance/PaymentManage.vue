<template>
  <div class="finance-container">
    <a-tabs>
      <a-tab-pane tab="汇款提交" key="1" v-if="premissions.includes('accountManager:inAccountManager:inAccountSubmit')">
        <Submit />
      </a-tab-pane>
      <a-tab-pane tab="在线充值" key="2" v-if="premissions.includes('accountManager:inAccountManager:onlinePay')">
        <Deposit />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script>
import Vue from 'vue'
import { Component, InjectComponents } from 'vue-decorators'
import { Deposit, Submit } from "./payment-mange"

@Component
@InjectComponents({Submit, Deposit})
export default class PaymentManage extends Vue {}
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