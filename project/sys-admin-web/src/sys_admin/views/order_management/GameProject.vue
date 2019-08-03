<template>
  <!--报表 注单管理 -->
  <div class="page-container-report">
    <section class="report-order">
      <div class="mt15">
        <date-switch ref="ds" @changeTab="changeTab"></date-switch>
      </div>
      <div class="mt15">
        <a-form layout="inline">
          <date-range ref="rg" @change="changeDate"/>
          <a-form-item label="平台名称">
            <a-select :dropdownMatchSelectWidth="false" v-model="form.platformId">
              <a-select-option
                v-for="(item, k) in init.platformList"
                :value="item.id"
                :key="k"
              >{{item.platformName}}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" @click="updateChild">查询</a-button>
          </a-form-item>
        </a-form>
      </div>
      <a-tabs @change="changeTableCallback">
        <a-tab-pane
          tab="彩票游戏"
          key="1"
          v-if="premissions.includes('reportManager:totalGameReport:queryLottery')"
        >
          <!-- v-permission="10079" -->
          <a-table  class="mytable" bordered :rowKey='(e, i) => i' :columns="lotteryColumns" :pagination="false" :dataSource="lotteryData">
            <span slot="profitRate" class="g-green" slot-scope="text, record">{{record.profitRate ? record.profitRate : '0.00'}}%</span>
          </a-table>

          <lottery-game class="mt10"  @updatePageNo="updatePageNo" :options="form" ref="tab1"/>
        </a-tab-pane>
        <a-tab-pane
          tab="真人游戏"
          key="2"
          v-if="premissions.includes('reportManager:totalGameReport:queryCasino')"
        >
          <!-- v-permission="10080" -->
          <real-game @updatePageNo="updatePageNo" :options="form" ref="tab2"/>
        </a-tab-pane>
        <a-tab-pane
          tab="棋牌游戏"
          key="3"
          v-if="premissions.includes('reportManager:totalGameReport:queryChess')"
        >
          <!-- v-permission="10081" -->
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
import DateRange from "@/components/date-range/DateRange";
import { formatDate } from "@/util/date";

@Component
@InjectComponents({
  TabSwitch,
  DateSwitch,
  DateRange,
  chessCardGame,
  lotteryGame,
  realGame
})
export default class ReportTotalGame extends Vue {
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

  form = {
    createTimeEnd: "",
    createTimeStart: "",
    lotteryId: "",
    pageNo: 1,
    pageSize: 10,
		platformId: '',
		thirdGameCode: ''
  };
  init = {
    key: 1,
    platformList: []
  };
  queryTimeEnd="";
  @Lifecycle created() {
    this.queryAllPlatform();
  }
  @Lifecycle mounted() {
    this.setInitialDate();
  }

  updatePageNo(pageNo) {
    this.form.pageNo = pageNo
  }

  async queryAllPlatform() {
    const res = await this.$service.fetch(
      "/config-admin-api/platform/queryAllPlatform",
      {}
    );
    if (1 != res.code) return this.$message.error(res.message);
    this.init.platformList = res.data || [];
    this.form.platformId = res.data[0].id || 1;

    this.getList();
  }

  changeDate(startTime, endTime, datestring, type) {
    if (type === "start") {
      this.form.createTimeStart = datestring;
    } else {
      this.form.createTimeEnd = datestring;
    }
  }

  setInitialDate() {
    const { startDate, endDate } = this.$refs.ds.getTime();
    this.$refs.rg.setDateRangeValues(startDate, endDate);
    this.form.createTimeStart = startDate;
    this.form.createTimeEnd = endDate;
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

  async getList() {
    const { createTimeEnd, createTimeStart, pageNo, platformId } = this.form;

    const params = { pageNo, platformId, queryTimeStart: createTimeStart,  queryTimeEnd: createTimeEnd, pageSize: 10, queryTimeType: 'createTime' };
    this.getSummary(params);
  }

  changeTab(startTime, endTime) {
    //this.changeDate(startTime, endTime)
    this.form.createTimeStart = startTime;
    this.form.createTimeEnd = endTime;
    this.$refs.rg.setDateRangeValues(startTime, endTime);
  }

  async updateChild() {
    if (this.init.key == 2) {
        this.form.thirdGameCode = 'AG'
    } else if(this.init.key == 3) {
        this.form.thirdGameCode = 'TH'
    } else {
        delete this.form.thirdGameCode
    }
    
    await this.$nextTick();
    this.$refs[`tab${this.init.key}`].getList();
    this.$refs[`tab${this.init.key}`].changeSelection();
    this.$refs[`tab${this.init.key}`].changePagination(1);
    this.getList(); 
  }

  changeTableCallback(key) {
    this.init.key = key;
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