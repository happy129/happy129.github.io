<template>
  <div class="crown-wrapper">
    <div class="line-code-form">
        <a-form layout="inline" :form="vform" @submit.prevent="getList(true)">
          <a-form-item class="picker-area">
            <DateRange title="起止时间" :defaultDate="true" @current="setCurrent" ref="rg" @change="changeDate"/>
          </a-form-item>
          <a-form-item label="期号">
            <a-input  v-decorator="['issueNo']"/>
          </a-form-item>
          <a-form-item>
            <a-button type="primary"  html-type="submit" :loading="init.loading">查询</a-button>
          </a-form-item>
        </a-form>
    </div>
     <a-table 
      class="mytable mt10" 
      bordered 
      :loading="init.loading"
      :columns="table.columns" 
      :rowKey="(e, i) => i" 
      :dataSource="table.dataSource" 
      :pagination="table.pagination"  
      @change="changePagination"> 
        <template slot="profitTitle"> <p>平台盈亏金额</p> <p>平台盈亏率</p> </template>
        <template slot="betTitle"> <p>当天投注（前）</p> <p>当天投注（后）</p> </template>
        <template slot="currentDataProfitTitle"> <p>当天盈亏（前）</p> <p>当天盈亏（后）</p> </template>
        <template slot="currentDataProfitRateTitle"> <p>当天盈利率（前）</p> <p>当天盈利率（后）</p> </template>
        <template slot="strategyTitle"> <p>杀率策略</p> <p>是否调控</p> </template>
        <template slot="profitData" slot-scope="text, record">
          <p>{{record.profit}}</p>
          <p>{{record.profitRate}}%</p>
        </template>
        <template slot="openNumber" slot-scope="text, record">
          <p class="open-number1">{{record.openNumber}}</p>
        </template>
        <template slot="betData" slot-scope="text, record">
          <p>{{record.preSettlementDayBetAmount}}</p>
          <p>{{record.postSettlementDayBetAmount}}</p>
        </template>
        <template slot="currentDataProfitData" slot-scope="text, record">
          <p>{{record.preSettlementDayProfit}}</p>
          <p>{{record.postSettlementDayProfit}}</p>
        </template>
        <template slot="currentDataProfitRateData" slot-scope="text, record">
          <p>{{record.preSettlementDayProfitRate}}%</p>
          <p>{{record.postSettlementDayProfitRate}}%</p>
        </template>
        <template slot="strategyData" slot-scope="text, record">
          <p>{{ $getText(record.controlStrategy, dictionary.fenFenCaiControlStrategy) }}</p>
          <p :class="[record.isControl ==1 ? 'g-red' : '']">{{ record.isControl == 0 ? '否' : '是' }}</p>
        </template>
        <template slot="operation" slot-scope="text,record">
          <a-button class="common-green-btn" @click="showRecord(record)" size="small">详情</a-button>
        </template>
      </a-table>


      <a-modal title="详情" v-model="init.showModal" :width="1100" :footer="null" :destroyOnClose="true" :maskClosable="false">
        <div class="table-ffc">
          <div class="modal-title">
            {{init.issueNo}}期开奖号码详情
          </div>
          <a-table class="mytable" :rowKey="(e, i) => i" :columns="table.columns1" :dataSource="table.dataSource1" :pagination="false" bordered>
            <template slot="openNumber" slot-scope="text, record">
              <p class="open-number" :class="[record.isSelected == 1 ? 'g-red': '']">{{record.openNumber}}</p>
            </template>
            <p :class="[record.isSelected == 1 ? 'g-red': '']" slot="winAmount" slot-scope="text, record">{{record.winAmount}}</p>
            <p :class="[record.isSelected == 1 ? 'g-red': '']" slot="profit" slot-scope="text, record">{{record.profit}}</p>
            <p :class="[record.isSelected == 1 ? 'g-red': '']" slot="profitRate" slot-scope="text, record">{{record.profitRate}}%</p>
            <p :class="[record.isSelected == 1 ? 'g-red': '']" slot="preSettlementDayProfitRate" slot-scope="text, record">{{record.preSettlementDayProfitRate}}%</p>
            <p :class="[record.isSelected == 1 ? 'g-red': '']" slot="postSettlementDayProfitRate" slot-scope="text, record">{{record.postSettlementDayProfitRate}}%</p>
          </a-table>
        </div>
        <div class="table-lottery mt10">
          <div class="modal-title">
            分分彩系列彩种详情
          </div>
          <a-table class="mytable" :rowKey="(e, i) => i" :columns="table.columns2" :dataSource="table.dataSource2" :pagination="false" bordered>
            <template slot="openNumber" slot-scope="text, record">
              <p class="open-number">{{record.openNumber}}</p>
            </template>
            <template slot="profitRate" slot-scope="text, record">
              <p>{{record.profitRate}}%</p>
            </template>
          </a-table>
        </div>
      </a-modal>

  </div>
</template>

<script>
import Vue from "vue";
import { Component, Lifecycle, InjectComponents } from "vue-decorators";
import DateRange from "@/components/date-range/DateRange";
import { DateSwitch } from "@/components/switch"

const dictionary = "fenFenCaiControlStrategy";

@Component({ formOptions: "id", dictionary })
@InjectComponents({ DateRange, DateSwitch })
export default class Research extends Vue {
  table = {
    key: 1,
    columns: [
      { title: "期号", dataIndex: "issueNo" },
      { title: "投注金额", dataIndex: "betAmount" },
      { title: "中奖金额", dataIndex: "winAmount"},
      { title: "开奖号码", scopedSlots: { customRender: "openNumber"}},
      { scopedSlots: { title: "profitTitle", customRender: "profitData" }},
      { scopedSlots: { title: "betTitle", customRender: "betData" }},
      { scopedSlots: { title: "currentDataProfitTitle", customRender: "currentDataProfitData" }},
      { scopedSlots: { title: "currentDataProfitRateTitle", customRender: "currentDataProfitRateData" }},
      { scopedSlots: { title: "strategyTitle", customRender: "strategyData" }},
      { title: "操作", scopedSlots: { customRender: 'operation' }}
    ],

    columns1: [
      { title: "开奖号码", scopedSlots: { customRender: "openNumber" } },
      { title: "开奖时间", dataIndex: "createTime" },
      { title: "投注金额", dataIndex: "betAmount" },
      { title: "中奖金额", scopedSlots: { customRender: "winAmount" } },
      { title: "平台盈亏金额",scopedSlots: { customRender: "profit" }},
      { title: "平台盈亏率",scopedSlots: { customRender: "profitRate" }},
      { title: "开奖前盈利率",scopedSlots: { customRender: "preSettlementDayProfitRate" } },
      { title: "开奖后盈利率", scopedSlots: { customRender: "postSettlementDayProfitRate" } }
    ],

    columns2: [
      { title: "彩种", dataIndex: "lotteryName" },
      { title: "开奖号码", scopedSlots: { customRender: "openNumber" } },
      { title: "开奖时间", dataIndex: "createTime" },
      { title: "投注金额", dataIndex: "betAmount" },
      { title: "中奖金额", dataIndex: "winAmount" },
      { title: "平台盈亏金额", dataIndex: "profit" }, 
      { title: "平台盈亏率", scopedSlots: { customRender: "profitRate" } }
    ],
    
    dataSource: [],
    dataSource1: [],
    dataSource2: [],

    pagination: { total: 0, current: 1}
  };

  init = {
    loading: false,
    showModal: false,
    issueNo: "",
    query: { pageNo: 1, pageSize: 10, startTime: "",  endTime: ""}
  };

  @Lifecycle mounted() {
    this.getList();
  }

  setCurrent(startTime, endTime) {
    this.init.query.startTime = startTime;
    this.init.query.endTime = endTime;
  }

  // 查看详情
  async showRecord(record) {
    this.init.showModal = true;
    this.init.issueNo = record.issueNo;

    const ffcResponse = await this.$service.fetch("/config-admin-api/ffcSeriesProfitOption/queryAllBySeriesProfitId", { seriesProfitId: record.id });
    if (ffcResponse.code !== 1) return ffcResponse.message && this.$message.error(ffcResponse.message);
    if (ffcResponse.data instanceof Array) {
      this.table.dataSource1 = ffcResponse.data
    } else {
      this.table.dataSource1 = [];
    }

    const lotteryResponse = await this.$service.fetch("/config-admin-api/ffcLotteryProfit/queryAllBySeriesProfitId", { seriesProfitId: record.id });
    if (lotteryResponse.code !== 1) return lotteryResponse.message && this.$message.error(lotteryResponse.message);
    if (lotteryResponse.data instanceof Array) {
      this.table.dataSource2 = lotteryResponse.data
    } else {
      this.table.dataSource2 = [];
    }
  }

  changeDate(start, end, datestring, type) {
    if (type === "start") {
      this.init.query.startTime = datestring
    } else {
      this.init.query.endTime = datestring
    }
  }

  changePagination(pagination) {
    this.table.pagination.current = pagination.current;
    this.init.query.pageNo = pagination.current;
    this.getList();
  }

  resetPagination() {
    this.table.pagination.current = 1;
    this.init.query.pageNo = 1;
  }

  async getList(refresh) {
    if (refresh) this.resetPagination(); 
    const form = await this.vform.validate();
    const values = this.$trimValues(form.values);
    const params = Object.assign(this.init.query, values);

    this.init.loading = true;
    const res = await this.$service.fetch('/config-admin-api/ffcSeriesProfit/queryPageFfcSeriesProfit', params);
    this.init.loading = false;

    if (res.code !== 1) return res.message && this.$message.error(res.message);
    if (res.code === 1 &&  res.data?.records instanceof Array) {
      this.table.dataSource = res.data.records;
      this.table.pagination.total = res.data?.totalCount;
    } else {
      this.table.dataSource = [];
      this.table.pagination.total = 0;
    }
  }
}
</script>

<style lang="scss" scoped>
  .crown-wrapper {
    min-height: 100%;
    background-color: #fff;
    padding: 10px; 
  }
  .picker-area /deep/ {
    .ant-form-item {
      margin-right: 0;
    }
  }
  .open-number {
    max-width: 190px;
  }
  .modal-title {
    background-color: #009688;
    color: #fff;
    text-align: center;
    font-size: 15px;
    padding: 4px 0;
  }
  .open-number1 {
    max-width: 240px;
  }
</style>