<template>
  <div class="account-summary">
    <a-form layout="inline" class="form">
      <a-form-item label="统计时间：">
        <a-date-picker :allowClear="false" v-model="params.summaryTime" :defaultValue="$moment()" format="YYYY-MM-DD" type="date" placeholder="请选择日期" style="width: 200px"/>
      </a-form-item>
      <a-form-item label="">
        <a-button type="primary" @click="toFetchRecord()" style="margin-left:20px;" ref="btnSearch">查询</a-button>
      </a-form-item>
      <span class="summary-text">统计数据每30分钟更新（当天的统计数据并非实时数据，如果非当天数据，则是每天23:59:59快照的数据）</span>
    </a-form>
    <div class="lv1">
      <table>
        <colgroup> <col width="40%"/> <col width="60%"/> </colgroup>
        <tr><th>用户余额增加类目</th><th>金额</th></tr>
        <tr><td>银行卡入款</td><td>{{$tools.thoundSep(totalinfo.bankCardInAmount)}}</td></tr>
        <tr><td>二维码入款</td><td>{{$tools.thoundSep(totalinfo.qrcodeInAmount)}}</td></tr>
        <tr><td>第三方入款</td><td>{{$tools.thoundSep(totalinfo.thirdPaymentInAmount)}}</td></tr>
        <tr><td>人工加款_汇款提交</td><td>{{$tools.thoundSep(totalinfo.manualRemittanceInAmount)}}</td></tr>
        <tr><td>人工加款_彩金派送</td><td>{{$tools.thoundSep(totalinfo.manualCashgiftInAmount)}}</td></tr>
        <tr><td>人工加款_返水派送</td><td>{{$tools.thoundSep(totalinfo.manualRebateInAmount)}}</td></tr>
        <tr><td>人工加款_其他</td><td>{{$tools.thoundSep(totalinfo.manualOtherInAmount)}}</td></tr>
        <tr><td>签到领取</td><td>{{$tools.thoundSep(totalinfo.signInAmount)}}</td></tr>
        <tr><td>领取佣金</td><td>{{$tools.thoundSep(totalinfo.commissionInAmount)}}</td></tr>
        <tr><td>VIP礼金</td><td>{{$tools.thoundSep(totalinfo.vipCashgiftInAmount)}}</td></tr>
        <tr><td>VIP返水</td><td>{{$tools.thoundSep(totalinfo.vipRebateInAmount)}}</td></tr>
        <tr><td>分享礼金</td><td>{{$tools.thoundSep(totalinfo.shareCashgiftInAmount)}}</td></tr>
        <tr><td>分享返水</td><td>{{$tools.thoundSep(totalinfo.shareRebateInAmount)}}</td></tr>
        <tr><td>首充礼金</td><td>{{$tools.thoundSep(totalinfo.firstRechargeCashgiftInAmount)}}</td></tr>
        <tr><td>充值赠送</td><td>{{$tools.thoundSep(totalinfo.rechargeGivingInAmount)}}</td></tr>
        <tr><td>用户余额增加类目_合计</td><td :class="getColor(totalinfo.totalInAmount)">{{$tools.thoundSep(totalinfo.totalInAmount)}}</td></tr>
      </table>
      <div class="space">&nbsp;</div>
      <table>
        <colgroup> <col width="40%"/> <col width="60%"/> </colgroup>
        <tr><th>用户余额减少类目</th><th>金额</th></tr>
        <tr><td>会员提现_线下出款</td><td>{{$tools.thoundSep(totalinfo.withdrawOfflineOutAmount)}}</td></tr>
        <tr><td>会员提现_线上出款</td><td>{{$tools.thoundSep(totalinfo.withdrawOnlineOutAmount)}}</td></tr>
        <tr><td>人工减款_汇款提交</td><td>{{$tools.thoundSep(totalinfo.manualRemittanceOutAmount)}}</td></tr>
        <tr><td>人工减款_彩金派送</td><td>{{$tools.thoundSep(totalinfo.manualCashgiftOutAmount)}}</td></tr>
        <tr><td>人工减款_返水派送</td><td>{{$tools.thoundSep(totalinfo.manualRebateOutAmount)}}</td></tr>
        <tr><td>人工减款_其他</td><td>{{$tools.thoundSep(totalinfo.manualOtherOutAmount)}}</td></tr>
        <tr><td>用户余额减少类目_合计</td><td :class="getColor(totalinfo.totalOutAmount)">{{$tools.thoundSep(totalinfo.totalOutAmount)}}</td></tr>
      </table>
    </div>
    <div class="lv2">
      <table>
        <colgroup> <col width="40%"/> <col width="60%"/></colgroup>
        <tr><th>当天用户余额结余</th><td :class="getColor(totalinfo.currentDayUserBalance)">{{$tools.thoundSep(totalinfo.currentDayUserBalance)}}</td></tr>
        <tr><th>当天用户余额盈亏</th><td :class="getColor(totalinfo.currentDayUserBalanceProfit)">{{$tools.thoundSep(totalinfo.currentDayUserBalanceProfit)}}</td></tr>
      </table>
      <div class="space">&nbsp;</div>
      <table>
        <colgroup><col width="40%"/> <col width="60%"/> </colgroup>
        <tr><th>上一日用户余额结余</th><td :class="getColor(totalinfo.previousDayUserBalance)">{{$tools.thoundSep(totalinfo.previousDayUserBalance)}}</td></tr>
        <tr><th>上一日用户余额盈亏</th><td :class="getColor(totalinfo.previousDayUserBalanceProfit)">{{$tools.thoundSep(totalinfo.previousDayUserBalanceProfit)}}</td></tr>
      </table>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { Component, InjectComponents, Prop, Watch, Lifecycle, Computed, Filter, State, Action, Getter, Mutation, InjectComponent } from 'vue-decorators';

/** 数据字典 */
const dictionary = '';

@Component({})
export default class AccountSummary extends Vue {

  params = { summaryTime: this.$moment(new Date()) };
  totalinfo = {};

  getColor(number) {
    if (+number > 0) return 'red';
    if (+number < 0) return 'green';
    return "";
  }

  async toFetchRecord() {
    const {summaryTime} = this.params;
    this.$refs.btnSearch.sLoading = true;
    const res = await this.$service.fetch('/lottery-admin-api/financeDaySummary/getPlatformPaperSummary', { summaryTime: this.$moment(summaryTime).format('YYYY-MM-DD HH:mm:ss') });
    this.$refs.btnSearch.sLoading = false;
    if (1 != res.code) return res.message && this.$message.error(res.message);
    this.totalinfo = res.data;
  }

  @Lifecycle() mounted() {
    this.toFetchRecord(); 
  }

}
  
</script>

<style lang="scss" scoped>
.account-summary {
  background-color: #fff;
  padding: 20px;
}
.lv1, .lv2 {
  margin: 10px 0;
  display: flex;
  flex-wrap: nowrap;

  .space {
    width: 20px;
    flex: 0 0 auto;
  }

  table {
  flex: 1 1 auto;
   width: 40%;
   th {
     background-color: #dfdfdf;
   }
    th, td {
      border: 1px solid #ccc;
      border-collapse: collapse;
      padding: 10px 10px;
      line-height: 20px;

      &.red {
        color: red;
      }
      &.green {
        color: green;
      }
    }
  }
}
.summary-text {
  line-height: 40px;
}
</style>


