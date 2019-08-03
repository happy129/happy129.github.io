<template>
  <!--报表 注单管理 -->
  <div class="page-container-report">
    <section class="report-order">
      <div class="mt15">
        <date-switch @changeTab="changeTab" ref="ds"></date-switch>
      </div>
      <div class="mt15">
        <a-form layout="inline">
          <date-range @change="changeDate" ref="rg" />
          <a-form-item>
            <a-button type="primary" :loading="init.loading" @click="updateChild(true)">查询</a-button>
          </a-form-item>
        </a-form>
      </div>
      <a-tabs @change="changeTableCallback">
        <a-tab-pane tab="彩票游戏" key="1">
          <a-table class="mytable" bordered :columns="lotteryColumns" :rowKey='(e, i) => i' :dataSource="lotteryData" :pagination="false">
            <span slot="profitRate" class="g-green" slot-scope="text, record">{{record.profitRate ? record.profitRate : '0.00'}}%</span>
          </a-table>
          <lottery-game class="mt10" @updatePageNo="updatePageNo" :options="form" ref="tab1"/>
        </a-tab-pane>
        <a-tab-pane tab="真人游戏" key="2">
          <real-game  @updatePageNo="updatePageNo" :options="form" ref="tab2"/>
        </a-tab-pane>
        <a-tab-pane tab="棋牌游戏" key="3">
          <chess-card-game  @updatePageNo="updatePageNo" :options="form" ref="tab3"/>
        </a-tab-pane>
      </a-tabs>
    </section>
  </div>
</template>

<script>
import Vue from "vue";
import { Component, InjectComponents, Lifecycle } from "vue-decorators";
import { TabSwitch, DateSwitch } from "@/components/switch";
import { chessCardGame, lotteryGame, realGame } from "./games";
import DateRange from '@/components/date-range/DateRange';
import { formatDate } from "@/util/date";

@Component
@InjectComponents({ TabSwitch, DateSwitch, DateRange, chessCardGame, lotteryGame, realGame })
export default class ReportTotalGame extends Vue {
	form = {
		createTimeEnd: '',
		createTimeStart: '',
		lotteryId: '',
		pageNo: 1,
		pageSize: 10,
    platformId: "",
    thirdGameCode: ''
  };	

   lotteryColumns = [
    { title: "数量", dataIndex: 'totalOrderCount' },
    { title: "总人数", dataIndex: 'userCount'},
    { title: '投注总额', dataIndex: 'totalOrderAmount'},
    { title: '有效投注注单数', dataIndex: 'validOrderCount'},
    { title: '有效投注总额', dataIndex: 'validOrderAmount'},
    { title: '中奖总额', dataIndex: 'totalWinAmount' },
    { title: '返点总额', dataIndex: 'rebateRate' },
    { title: '未开奖总注数', dataIndex: 'unopenedOrderCount' },
    { title: '未开奖总额', dataIndex: 'unopenedOrderAmount' },
    { title: '撤单总额', dataIndex: 'cancelledOrderAmount' },
    { title: '总盈亏', dataIndex: 'totalProfit' },
    { title: '平均盈利率', scopedSlots: { customRender: "profitRate" } }
  ];

  lotteryData = [];
  
  init = {
    key: 1,
    loading: false
  };
  // 初始化时间
  queryTimeEnd="";

  @Lifecycle mounted() {
    this.form.platformId = this.platformId;
    this.setInitialDate();
    this.getList();
  }

  updatePageNo(pageNo) {
    this.form.pageNo = pageNo
  }

  setInitialDate() {
    const {startDate, endDate} = this.$refs.ds.getTime();
    this.$refs.rg.setDateRangeValues(startDate, endDate);
    this.form.createTimeStart = startDate;
    this.form.createTimeEnd = endDate;
  }

	changeDate(startTime, endTime, datestring, type) {
    if (type === 'start') {
      this.form.createTimeStart = datestring;
    } else {  
      this.form.createTimeEnd = datestring;
    }
	}

  changeTab(startTime, endTime) {
    this.form.createTimeStart = startTime;
    this.form.createTimeEnd = endTime;
    this.$refs.rg.setDateRangeValues(startTime, endTime);
  }

  async getSummary(params, page=true) {
    // 判断结束时间是否大于当前时间
    if (page) {
      // 如果结束时间大于当前时间，设置为当前时间
      if (params.queryTimeEnd) {
        const d = new Date(params.queryTimeEnd.replace(/\-/g, '/')).getTime();
        const now = Date.now();
        if (d > now) {
          params.queryTimeEnd = formatDate(new Date());
          // 缓存数据
          this.queryTimeEnd = params.queryTimeEnd;
        }
      }
    } else {
      const d1 = new Date(this.form.queryTimeEnd.replace(/\-/g, '/')).getTime();
      const d2 = new Date(this.queryTimeEnd.replace(/\-/g, '/')).getTime();
      if (d1 < d2) {
        params.queryTimeEnd = this.form.queryTimeEnd
      } else {
        params.queryTimeEnd = this.queryTimeEnd;
      }
    }
    const res = await this.$service.fetch('/lottery-admin-api/orderReport/queryBetOrderReportSummary', params);
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    if (res.data) {
      this.lotteryData = [];
      this.lotteryData.push(res.data);
    }
  }

  async updateChild(reset) {
    if (reset) this.form.pageNo = 1;

    this.init.loading = true;
    this.form.platformId = this.platformId;

    if (this.init.key == 2) {
			this.form.thirdGameCode = 'AG'
		} else if(this.init.key == 3) {
			this.form.thirdGameCode = 'TH'
		} else {
			delete this.form.thirdGameCode
    }
    
    await this.$refs[`tab${this.init.key}`].getList();
    this.init.loading = false;

    this.getList();
  }

  async getList() {
    const { createTimeEnd, createTimeStart, pageNo } = this.form;
    const params = { pageNo, platformId: this.platformId, queryTimeStart: createTimeStart,  queryTimeEnd: createTimeEnd, pageSize: 10, queryTimeType: 'createTime' };
    this.getSummary(params);
  }

  changeTableCallback(key) {
    this.init.key = key;
    this.form.pageNo = 1;
    if (this.init.key == 2) {
			this.form.thirdGameCode = 'AG'
		} else if(this.init.key == 3) {
			this.form.thirdGameCode = 'TH'
		} else {
			delete this.form.thirdGameCode
    }
  }
}
</script>

<style lang="scss">
.report-order-text {
  margin: 15px 0;

  span {
    margin-right: 10px;
  }
}
.page-container-report {
  padding: 15px;
  background-color: #fff;
  box-sizing: border-box;
  height: 100%;
  overflow-y: auto;
}
</style>