<template>
  <div class="crown-wrapper">
    <a-form layout="inline" class="query-form" :form="vform" @submit.prevent="getList(true)">
      <div class="query-item-1">
        <div class="quick-picker">
          <DateRange title="注册时间" ref="rg" @change="changeDate"/>
        </div>
        <div class="quick-select-area">
          <span>快捷选时：</span><DateSwitch @changeTab="changeQuickTime" className="btn-1"/>
        </div>
      </div>
      <div class="query-item-1">
        <div class="quick-picker">
          <DateRange title="统计时间" ref="rg1" @change="changeDate1"/>
        </div>
        <div class="quick-select-area">
          <span>快捷选时：</span><DateSwitch @changeTab="changeQuickTime1" className="btn-1"/>
        </div>
      </div>

      <div class="mt10">
        <a-form-item class="user-name" label="用户名">
          <a-input v-decorator="['userName']"/>
        </a-form-item>
        <a-form-item>
          <a-button :loading="init.loading" html-type="submit" type="primary">查询</a-button>
        </a-form-item>
      </div>
    </a-form>

    <div class="page-under-table">
      <ul class="summary-data">
        <li>充值人数：{{summary.rechargeUserCount || '0'}} 人</li>
        <li>充值总额：{{summary.rechargeAmount || '0.00'}} 元</li>
        <li>彩票投注：{{summary.lotteryValidBetAmount || '0.00'}} 元</li>
        <li>彩票中奖：{{summary.lotteryWinAmount || '0.00'}} 元</li>
        <li>彩票盈亏：{{summary.lotteryProfitAmount || '0.00'}} 元</li>
        <li>人工加款：{{summary.manualAddAmount || '0.00'}} 元</li>
        <li>投注人数：{{summary.betUserCount || '0'}} 人</li>
        <li>提现总额：{{summary.withdrawAmount || '0.00'}} 元</li>
        <li>第三方投注：{{summary.thirdValidBetAmount || '0.00'}} 元</li>
        <li>第三方中奖：{{summary.thirdWinAmount || '0.00'}} 元</li>
        <li>第三方盈亏：{{summary.thirdProfitAmount || '0.00'}} 元</li>
        <li>人工减款：{{summary.manualSubtractAmount || '0.00'}} 元</li>
        <li>总下级人数：{{summary.directUserCount || '0'}}人</li>
        <li>出入款汇总：{{summary.outInAmount || '0.00'}} 元</li>
        <li>&nbsp;</li>
      </ul>
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
      <template slot="deposit" slot-scope="text, record">
        <p>充值次数：{{ record.rechargeCount }}</p>
        <p>充值金额：{{ record.rechargeAmount }}</p>
      </template>
      <template slot="withdraw" slot-scope="text, record">
        <p>提现次数: {{record.withdrawCount}}</p>
        <p>提现金额: {{record.withdrawAmount}}</p>
      </template>
      <template slot="bet" slot-scope="text, record">
        <p>投注总额: {{record.totalBetAmount}}</p>
        <p>彩票投注：{{record.lotteryValidBetAmount}}</p>
        <p>第三方投注：{{record.thirdValidBetAmount}}</p>
      </template>
      <template slot="win" slot-scope="text, record">
        <p>中奖总额：{{record.totalWinAmount}}</p>
        <p>彩票中奖：{{record.lotteryWinAmount}}</p>
        <p>第三方中奖：{{record.thirdWinAmount}}</p>
      </template>
      <template slot="profit" slot-scope="text, record">
        <p>盈亏总额： {{record.totalProfitAmount}}</p>
        <p>彩票盈亏： {{record.lotteryProfitAmount}}</p>
        <p>第三方盈亏：{{record.thirdProfitAmount}}</p>
      </template>
    </a-table>
  </div>
</template>

<script>
import Vue from "vue";
import { Component, Lifecycle, InjectComponents } from "vue-decorators";
import DateRange from "@/components/date-range/DateRange";
import { DateSwitch } from "@/components/switch";
import moment from 'moment';

@Component({ formOptions: " id" })
@InjectComponents({ DateRange, DateSwitch })
export default class UserDataQuery extends Vue {
  table = {
    key: 1,
    columns: [
      { title: "用户名", dataIndex: "userName" },
      { title: "注册时间", dataIndex: "registerTime", sorter: true},
      { title: "充值", dataIndex: 'rechargeAmount', scopedSlots: { customRender: "deposit" }, sorter: true },
      { title: "提现", dataIndex: 'withdrawAmount', scopedSlots: { customRender: "withdraw" }, sorter: true },
      { title: "投注", dataIndex: 'totalBetAmount', scopedSlots: { customRender: "bet" }, sorter: true},
      { title: "中奖", dataIndex: 'totalWinAmount', scopedSlots: { customRender: "win" }, sorter: true},
      { title: "平台盈亏", dataIndex: 'totalProfitAmount', scopedSlots: { customRender: "profit" }, sorter: true},
      { title: "人工加款", dataIndex: 'manualAddAmount', sorter: true},
      { title: "人工减款", dataIndex: 'manualSubtractAmount', sorter: true}
    ],
    dataSource: [],
    pagination: { total: 0, current: 1}
  };

  init = {
    loading: false,
    // 默认一个排序
    sort: 'totalWinAmount',
    query: { pageNo: 1, pageSize: 10, startTime: "",  endTime: "", statTimeStart: "", statTimeEnd: "", sortList: []}
  };

  summary = {};

  @Lifecycle mounted() {
    this.getList();
    this.inintTime()
  }

  inintTime() {
    const d = new Date();
    // this.$refs.rg.setDateRangeValues(d);
    this.$refs.rg1.setDateRangeValues(d);
    this.init.query.statTimeStart = moment(d).format("YYYY-MM-DD 00:00:00");
    this.init.query.statTimeEnd = moment(d).format("YYYY-MM-DD 23:59:59");
  }
  changeDate(start, end, datestring, type) {
    if (type === "start") {
      this.init.query.startTime = datestring
    } else {
      this.init.query.endTime = datestring
    }
  }

  changeDate1(start, end, datestring, type) {
    if (type === "start") {
      this.init.query.statTimeStart = datestring
    } else {
      this.init.query.statTimeEnd = datestring
    }
  }

  changePagination(pagination, filters, sorter) {
    this.table.pagination.current = pagination.current;
    this.init.query.pageNo = pagination.current;

    const sortParams = {
      sortField: "",
      sortOrder: ""
    };

    // 点击排序
     if (sorter.order) {
      switch(sorter.order) {
        case "ascend":
            sortParams.sortField = sorter.field;
            sortParams.sortOrder = "asc"
          break;
        case "descend":
            sortParams.sortField = sorter.field;
            sortParams.sortOrder = "desc"
          break;
      }
    } else {
      sortParams.sortField = this.init.sort;
      sortParams.sortOrder = "desc"
    }
    // 设定排序
    this.init.query.sortList[0] = sortParams;

    this.getList();
  }

  changeQuickTime(startTime, endTime) {
    this.init.query.startTime = startTime;
    this.init.query.endTime = endTime;
    this.$refs.rg.setDateRangeValues(startTime, endTime);
  }

  changeQuickTime1(startTime, endTime) {
    this.init.query.statTimeStart = startTime;
    this.init.query.statTimeEnd = endTime;
    this.$refs.rg1.setDateRangeValues(startTime, endTime);
  }

  resetPagination() {
    this.table.pagination.current = 1;
    this.init.query.pageNo = 1;
  }

  async getList(refresh) {
    if (refresh) this.resetPagination(); 

    if (this.init.query.sortList.length == 0) {
      this.init.query.sortList.push({
        sortField: this.init.sort,
        sortOrder: 'desc'
      });
    }

    const form = await this.vform.validate();
    if (form.errors) return
    const params = Object.assign(this.init.query, { userName: form.values.userName || '' });

    this.init.loading = true;
    const res = await this.$service.fetch('/lottery-api/shareSummary/queryPageShareAmountInfo', params);
    this.init.loading = false;

    if (res.code !== 1) return res.message && this.$message.error(res.message);
    if (res.code === 1 &&  res.data?.records instanceof Array) {
      this.table.dataSource = res.data.records;
      this.table.pagination.total = res.data?.totalCount;
    } else {
      this.table.dataSource = [];
      this.table.pagination.total = 0;
    }

    this.getSummary(params);
  }


  async getSummary(params) {
    const res = await this.$service.fetch('/lottery-api/shareSummary/queryShareAmountSummary', params);
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.summary = res.data;
  }

}
</script>

<style lang="scss" scoped>
.crown-wrapper {
    background-color: #fff;
    height: 100%;
    padding: 10px;
    overflow-y: auto;
    box-sizing: border-box;
}
.query-item-1 /deep/{
  display: flex;
  align-items: center;
  padding-bottom: 10px;
  border-bottom: 1px solid #dcdcdc;
  padding-top: 10px;

  .quick-select-area {
    display: flex;
    align-items: center;
    margin-left: 10px;
    
    .btn-1 {
      button {
        padding: 6px 12px;
      }
    }
  }
}

/deep/ .quick-picker {
  .ant-form-item {
    margin-right: 0;
  }
}

/deep/ .user-name {
  label {
    width: 68px;
    display: inline-block;
  }
}

.summary-data {
  display: flex;
  flex-wrap: wrap;
  border-top: 1px solid #ccc;
  border-left: 1px solid #ccc;
  background-color: #f1f1f1;
  li {
    flex: 0 0 20%;
    box-sizing: border-box;
    padding: 5px 10px;
    border-right: 1px solid #ccc;
    border-bottom: 1px solid #ccc;
  }
}
</style>