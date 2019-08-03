<template>
  <div class="crown-wrapper">
    <a-form layout="inline" :form="vform" class="query-form" @submit.prevent="getList(true)">
      <div class="query-item-1">
        <div class="quick-picker">
          <DateRange title="统计时间" ref="rg"  @change="changeDate"/>
        </div>
        <div class="quick-select-area">
          <span>快捷选时：</span><DateSwitch @changeTab="changeQuickTime" className="btn-1"/>
        </div>
      </div>

      <div class="mt10">
        <a-form-item label="用户名">
          <a-input v-decorator="['userName']"/>
        </a-form-item>
        <a-form-item>
          <a-button :loading="init.loading" html-type="submit" type="primary">查询</a-button>
        </a-form-item>
      </div>
    </a-form>

    <div class="page-under-table">
      <!-- <ul class="summary-data">
        <li>合计</li>
        <li>AG视讯</li>
        <li>开元棋牌</li>
        <li>天合棋牌</li>
        <li>有效投注总额：{{ summary.validBetAmount || '0.00' }}</li>
        <li>有效投注：{{ summary.agValidBetAmount  || '0.00'}}</li>
        <li>有效投注：{{ summary.kyValidBetAmount  || '0.00'}}</li>
        <li>有效投注：{{ summary.thValidBetAmount  || '0.00'}}</li>
        <li>中奖金额：{{ summary.winAmount  || '0.00'}}</li>
        <li>中奖金额：{{ summary.agWinAmount  || '0.00'}}</li>
        <li>中奖金额：{{ summary.kyWinAmount  || '0.00'}}</li>
        <li>中奖金额：{{ summary.thWinAmount  || '0.00'}}</li>
        <li>平台盈亏：{{ summary.platformProfit  || '0.00'}}</li>
        <li>平台盈亏：{{ summary.agUserProfit  || '0.00'}}</li>
        <li>平台盈亏：{{ summary.kyUserProfit  || '0.00'}}</li>
        <li>平台盈亏：{{ summary.thUserProfit  || '0.00'}}</li>
      </ul>  -->
      <div class="summary-data">
        <div class="summary-data-item" v-for="(item, index) in summary" :key="index">
          <p>{{item.gameName}}</p>
          <p>有效投注{{ index == 0 ? '总额' : '' }}：{{item.validBetAmount || '0.00'}}</p>
          <p>中奖{{ index == 0 ? '总额' : '金额' }}：{{item.winAmount  || '0.00'}}</p>
          <p>平台盈亏：{{item.platformProfit  || '0.00'}}</p>
        </div>
      </div>

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
      
    </a-table>
  </div>
</template>

<script>
import Vue from "vue";
import { Component, Lifecycle, InjectComponents } from "vue-decorators";
import DateRange from "@/components/date-range/DateRange";
import { DateSwitch } from "@/components/switch"
import moment from 'moment';

@Component({ formOptions: "id" })
@InjectComponents({ DateRange, DateSwitch })
export default class DepositQuery extends Vue {
  table = {
    key: 1,
    columns: [
      { title: "合计",  children: [
        { title: "用户名", dataIndex: "userName" },
        { title: "有效投注总额", dataIndex: "validBetAmount" }
      ]},
      { title: "AG视讯", children: [
        { title: "有效投注", dataIndex: "agValidBetAmount" },
        { title: "中奖金额", dataIndex: "agWinAmount"},
        { title: "用户盈亏", dataIndex: "agUserProfit" }
      ]},
      { title: "开元棋牌",  children: [
        { title: "有效投注", dataIndex: "kyValidBetAmount" },
        { title: "中奖金额", dataIndex: "kyWinAmount"},
        { title: "抽水", dataIndex: "kyRevenue" },
        { title: "用户盈亏", dataIndex: "kyUserProfit" }
      ]},
      { title: "天合棋牌", children: [
        { title: "有效投注" , dataIndex: "thValidBetAmount" },
        { title: "中奖金额" , dataIndex: "thWinAmount"},
        { title: "抽水" , dataIndex: "thRevenue"},
        { title: "用户盈亏" , dataIndex: "thUserProfit"}
      ]}
    ],
    dataSource: [],
    pagination: { total: 0, current: 1}
  };

  init = {
    loading: false,
    query: { pageNo: 1, pageSize: 10, startTime: "",  endTime: "", sortList: []}
  };

  summary = [];

  @Lifecycle mounted() {
    this.getList();
  }

  setCurrent(start, end) {
    this.init.query.startTime = start;
    this.init.query.endTime = end;
  }

  changeDate(start, end, datestring, type) {
    if (type === "start") {
      this.init.query.startTime = datestring
    } else {
      this.init.query.endTime = datestring
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
      sortParams.sortField = "";
      sortParams.sortOrder = ""
    }

    // 设定排序
    this.init.query.sortList[0] = sortParams;

    this.getList(false, false);
  }

  resetPagination() {
    this.table.pagination.current = 1;
    this.init.query.pageNo = 1;
  }

  changeQuickTime(startTime, endTime) {
    this.init.query.startTime = startTime;
    this.init.query.endTime = endTime;
    this.$refs.rg.setDateRangeValues(startTime, endTime);
  }

  async getList(refresh, isGetTotal=true) {
    if (refresh) this.resetPagination(); 

    const form = await this.vform.validate();
    if (form.errors) return 
    const params = this.$trimValues(form.values); 
    const values = Object.assign(this.init.query, params);

    this.init.loading = true;
    const res = await this.$service.fetch('/lottery-api/thirdOrder/queryThirdOrderUserSummary', values);
    this.init.loading = false;

    if (res.code !== 1)  { this.table.dataSource = []; this.summary = []; return res.message && this.$message.error(res.message) };
    if (res.code === 1 &&  res.data?.records instanceof Array) {
      this.table.dataSource = res.data.records;
      this.table.pagination.total = res.data?.totalCount;
    } else {
      this.table.dataSource = [];
      this.table.pagination.total = 0;
    }

    if (isGetTotal) {
      this.getSummary(values);
    }
  }


  async getSummary(params) {
    const res = await this.$service.fetch('/lottery-api/thirdOrder/queryThirdOrderSummary', params);
    if (res.code !== 1) return res.message && this.$message.error(res.message);

    if (res.data instanceof Array) {
      this.summary = res.data;
    }
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

/deep/ .query-form {
  .lottery-category {
    width: 80px;
  }
}


.summary-data {
  display: flex;
  flex-wrap: wrap;
  border-top: 1px solid #ccc;
  border-left: 1px solid #ccc;
  background-color: #f1f1f1;
  
  .summary-data-item {
    flex: 1;
    p {
      padding: 10px;
      border-bottom: 1px solid #ccc;
      border-right: 1px solid #ccc;
    }
  }
}
</style>