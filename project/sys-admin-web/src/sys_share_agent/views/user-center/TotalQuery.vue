<template>
  <section class="total-query">
    <div>
      <div class="ml30">
        <a-button :type="`${state.selected == 0 ? 'primary': 'default'}`" @click="state.selected=0;getList()">今天&昨天</a-button>
        <a-button :type="`${state.selected == 1 ? 'primary': 'default'}`" @click="state.selected=1;getList()">本周&上周</a-button>
        <a-button :type="`${state.selected == 2 ? 'primary': 'default'}`" @click="state.selected=2;getList()">本月&上月</a-button>
      </div>

      <div class="table-container">
        <div class="table-item">
          <table class="table-1">
            <thead>
              <tr>
                <th>类目</th>
                <th>{{ state.selected == 0 ? '今天' : state.selected == 1 ? '本周' : '本月' }}</th>
                <th> {{ state.selected == 0 ? '昨天' : state.selected == 1 ? '上周' : '上月' }}</th>
              </tr>
            </thead>
            <tbody>
              <tr> <td>注册人数</td>  <td>{{ data.currentRegisterUserCount }}人( <span v-html="increment(data.registerUserCountIncrement, false)"></span> )</td>  <td> {{ data.previousRegisterUserCount}}  </td> </tr>
              <tr> <td>登录人数</td> <td>{{ data.currentLoginUserCount }}人 ( <span v-html="increment(data.loginUserCountIncrement, false)"></span> )</td>  <td>{{ data.previousLoginUserCount }}</td> </tr>
              <tr> <td>充值人数</td> <td>{{ data.currentRechargeUserCount }} 人( <span v-html="increment(data.rechargeUserCountIncrement, false)"></span> )</td>  <td>{{ data.previousRechargeUserCount }}</td> </tr>
              <tr> <td>彩票投注人数</td> <td>{{ data.currentLotteryBetUserCount }}人 ( <span v-html="increment(data.lotteryBetUserCountIncrement, false)"></span> )</td>  <td>{{ data.previousLotteryBetUserCount }}</td> </tr>
              <tr> <td>第三方投注人数</td> <td>{{ data.currentThirdBetUserCount }}人 ( <span v-html="increment(data.thirdBetUserCountIncrement, false)"></span> )</td>  <td>{{ data.previousThirdBetUserCount }}</td> </tr>
            </tbody>
          </table>
        </div>
        <div class="table-item">
          <table class="table-1">
            <thead>
              <tr>
                <th>类目</th>
                <th>{{ state.selected == 0 ? '今天' : state.selected == 1 ? '本周' : '本月' }}</th>
                <th> {{ state.selected == 0 ? '昨天' : state.selected == 1 ? '上周' : '上月' }}</th>
              </tr>
            </thead>
            <tbody>
              <tr> <td>充值金额</td>    <td>{{ data.currentRechargeAmount }} 元( <span v-html="increment(data.rechargeAmountIncrement)"></span> )</td>  <td>{{ data.previousRechargeAmount }}</td> </tr>
              <tr> <td>提现金额</td>    <td>{{ data.currentWithdrawAmount }}元 ( <span v-html="increment(data.withdrawAmountIncrement)"></span> )</td>  <td>{{ data.previousWithdrawAmount }}</td> </tr>
              <tr> <td>出入款汇总</td>  <td>{{ data.currentBalanceAmount }}元( <span v-html="increment(data.balanceAmountIncrement)"></span> )</td>  <td>{{ data.previousBalanceAmount }}</td> </tr>
            </tbody>
          </table>
        </div>
        <div class="table-item">
          <table class="table-1">
            <thead>
              <tr>
                <th>类目</th>
                <th>{{ state.selected == 0 ? '今天' : state.selected == 1 ? '本周' : '本月' }}</th>
                <th> {{ state.selected == 0 ? '昨天' : state.selected == 1 ? '上周' : '上月' }}</th>
              </tr>
            </thead>
            <tbody>
              <tr> <td>投注总额</td>   <td>{{ data.currentTotalBetAmount }}元           ( <span v-html="increment(data.totalBetAmountIncrement)"></span> )</td>  <td>{{ data.previousTotalBetAmount }}</td> </tr>
              <tr> <td>彩票投注</td>   <td>{{ data.currentLotteryTotalBetAmount }}元    ( <span v-html="increment(data.lotteryTotalBetAmountIncrement)"></span> )</td>  <td>{{ data.previousLotteryTotalBetAmount }}</td> </tr>
              <tr> <td>第三方投注</td> <td>{{ data.currentThirdTotalBetAmount }}元      ( <span v-html="increment(data.thirdTotalBetAmountIncrement)"></span> ) </td>  <td>{{ data.previousThirdTotalBetAmount }}</td> </tr>
              <tr> <td>中奖总额</td>   <td>{{ data.currentTotalWinAmount }}元           ( <span v-html="increment(data.totalWinAmountIncrement)"></span> )</td>  <td>{{ data.previousTotalWinAmount }}</td> </tr>
              <tr> <td>彩票中奖</td>   <td>{{ data.currentLotteryWinAmount }}元         ( <span v-html="increment(data.lotteryWinAmountIncrement)"></span> )</td>  <td>{{ data.previousLotteryWinAmount }}</td> </tr>
              <tr> <td>第三方中奖</td> <td>{{ data.currentThirdWinAmount }}元           ( <span v-html="increment(data.thirdWinAmountIncrement)"></span> )</td>  <td>{{ data.previousThirdWinAmount }}</td> </tr>
              <tr> <td>平台盈亏</td>   <td>{{ data.currentTotalProfitAmount }}元        ( <span v-html="increment(data.totalProfitAmountIncrement)"></span> )</td>  <td>{{ data.previousTotalProfitAmount }}</td> </tr>
              <tr> <td>彩票盈亏</td>   <td>{{ data.currentLotteryProfitAmount }}元      ( <span v-html="increment(data.lotteryProfitAmountIncrement)"></span> )</td>  <td>{{ data.previousLotteryProfitAmount }}</td> </tr>
              <tr> <td>第三方盈亏</td> <td>{{ data.currentThirdProfitAmount }}元        ( <span v-html="increment(data.thirdProfitAmountIncrement)"></span> )</td>  <td>{{ data.previousThirdProfitAmount }}</td> </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import Vue from "vue";
import { Component, Lifecycle, InjectComponents } from "vue-decorators";

@Component
export default class TotalQuery extends Vue { 
 
  state = {
    selected: 0
  }

  data = {};

  @Lifecycle created() {
    this.getList();
  }

  increment(text, present = true) {
    if (!text) return '0';
    if (text && +text >= 0) {
      return `<span class="g-green">+${text}${ present ? '%' : ''}</span>`
    } else {
      return `<span class="g-red">${text}${ present ? '%' : ''}</span>`
    }
  }

  async getList() {
    const res = await this.$service.fetch("/lottery-api/userDataSummary/queryUserDataSummary", {
      summaryTimeType: this.state.selected
    });
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.data = res.data || {};
  }

}
</script>


<style lang="scss" scoped>
.total-query {
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background-color: #fff;
}
.ml30 /deep/{
  margin-top: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e7e7e7;
  button {
    margin-left: 10px;
  }
}
.table-container /deep/{
  display: flex;
  .table-item {
    flex: 1;
    margin: 10px;
    .table-1 {
      width: 100%;
      border: 1px solid #e7e7e7;
      td, th {
        border: 1px solid #e7e7e7;
        padding: 10px;
      }
    }
  }
}
</style>


