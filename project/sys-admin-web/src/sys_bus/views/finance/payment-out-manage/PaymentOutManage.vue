<template>
  <div class="container">
    <a-tabs @change="callback" :activeKey="activeKey">
      <a-tab-pane tab="出款订单" :key="1" v-if="premissions.includes('accountManager:outAccountManager:bankOutAccount')">
        <orderForPayment ref="orders" v-if="activeKey===1"/>
      </a-tab-pane>

      <!-- <a-tab-pane tab="第三方出款" :key="2" v-if="premissions.includes('accountManager:outAccountManager:thirdOutAccount')">
        <third-party-payment  v-if="activeKey===2"></third-party-payment>
      </a-tab-pane> -->

      <a-tab-pane tab="我的订单" :key="3" v-if="premissions.includes('accountManager:outAccountManager:selfOrder')">
        <myOrder @showExportPage="showExportPage" v-show="activeKey===3 && !isShowExcelPage"></myOrder>
        <ExportOrder @closeExportPage="closeExportPage" :exportType="exportType" :filterData="filterData" v-if="activeKey===3 && isShowExcelPage"/>
      </a-tab-pane>
      <!-- 
        <a-tab-pane tab="打码核查" :key="4" v-if="premissions.includes('accountManager:outAccountManager:codeVerification')">
          <code-verification :account="account"  v-if="activeKey===4"></code-verification>
        </a-tab-pane>
      -->
      
      <a-tab-pane tab="出款完成" :key="4" v-if="premissions.includes('accountManager:outAccountManager:cashFinish')">
        <PaymentFinish :account="account"  v-if="activeKey===4"/>
      </a-tab-pane>

      <a-tab-pane tab="复审订单" :key="5" v-if="premissions.includes('accountManager:outAccountManager:reviewOrder')">
          <reviewOrder  v-if="activeKey===5"></reviewOrder>
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script>
import Vue from "vue";
import moment from "moment";
import { Component, InjectComponents, Lifecycle, Watch, State, Computed, Mutation } from "vue-decorators";
import orderForPayment from "./OrderForPayment";
import thirdPartyPayment from "./ThirdPartyPayment";
import myOrder from "./MyOrder";
import codeVerification from "./CodeVerification";
import reviewOrder from "./ReviewOrder";
import PaymentFinish from "./PaymentFinish";
import ExportOrder from "./ExportOrder"

@Component
@InjectComponents({ orderForPayment, thirdPartyPayment, myOrder, codeVerification, reviewOrder, PaymentFinish, ExportOrder })
export default class PaymentOutManage extends Vue {
  activeKey = 1;
  account = "";
  // 是否显示导出excel功能
  isShowExcelPage = false;
  // 要导出的数据
  filterData = [];
  // 导出的数据类型 excel, txt
  exportType = 'excel';

  @Mutation('setPayoutState') setPayoutState;
  @State(state => state.payoutstate) payoutstate;

  @Watch('payoutstate') async change(a, b) {
    // 不能直接切换，直接切换导致组件没渲染完
    await this.delay(300);
    this.account = b.split("_")[0]; 
    this.activeKey = 4;
  }

  // 展示导出数据
  showExportPage(data, type) {
    this.isShowExcelPage = true;
    this.filterData = data;
    this.exportType = type;
  }

  // 关闭导出页面
  closeExportPage() {
    this.isShowExcelPage = false;
    this.filterData = [];
  }

  delay(time) {
    return new Promise(resolve => setTimeout(resolve, time));
  }

  callback(key) {
    this.activeKey = key;
    this.account = "";
  }
}
</script>
<style lang="scss" scoped>
.container {
  background-color: #fff;
  padding: 10px;
  min-height: 100%;
}
</style>