<template>
    <div class="finance-container">
        <a-tabs @change="callback" :activeKey="activeKey">
            <!--<a-tab-pane tab="财务报表" :key="1">-->
                <!--<FinanceReport />-->
            <!--</a-tab-pane>-->
            <a-tab-pane tab="银行卡充值" :key="1">
                <BankCardRecharge />
            </a-tab-pane>
            <a-tab-pane tab="二维码充值" :key="2">
                <QrCodeRecharge />
            </a-tab-pane>
            <a-tab-pane tab="第三方充值" :key="3">
                <ThirdPartyPayment />
            </a-tab-pane>
            <a-tab-pane tab="提现报表" :key="4">
                <WithdrawalStatements />
            </a-tab-pane>
            <a-tab-pane tab="人工加减款报表" :key="5">
                <ManualAddSubtractStatement />
            </a-tab-pane>
        </a-tabs>
    </div>
</template>

<script>
import Vue from 'vue'
import { Component, InjectComponents } from 'vue-decorators'
import { BankCardRecharge, ManualAddSubtractStatement, QrCodeRecharge, ThirdPartyPayment, WithdrawalStatements } from "./financial-statements"
import FinanceReport from "./FinanceReport"

@Component
@InjectComponents({ BankCardRecharge, ManualAddSubtractStatement, QrCodeRecharge, ThirdPartyPayment, WithdrawalStatements, FinanceReport })
export default class FinancialStatement extends Vue {
    activeKey = 1;
    callback(key) {
        this.activeKey = key;
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

