<template>
  <div class="crown-wrapper">

    <a-form layout="inline" :form="vform" class="query-form" @submit.prevent="getList(true)">
      <div class="query-item-1">
        <div class="quick-picker">
          <DateRange :defaultDate="true" title="充值时间" ref="rg" @current="setCurrent" @change="changeDate"/>
        </div>
        <div class="quick-select-area">
          <span>快捷选时：</span><DateSwitch @changeTab="changeQuickTime" className="btn-1"/>
        </div>
      </div>

      <div class="mt10">
        <a-form-item label="用户名">
          <a-input v-decorator="['userName']"/>
        </a-form-item>
        <a-form-item label="用户ID">
          <a-input v-decorator="['userId', { rules: [{ required: false, message:'用户ID应为数字', pattern: /^\+?[0-9]*$/ }]}]"/>
        </a-form-item>
        <a-form-item>
          <a-button :loading="init.loading" html-type="submit" type="primary">查询</a-button>
        </a-form-item>
      </div>
    </a-form>

    <div class="page-under-table">
       <ul class="summary-data">
        <li>充值总额：{{summary.totalRechargeAmount || '0.00'}} 元</li>
        <li>充值人数：{{summary.rechargeUserCount || '0'}} 人</li>
        <li>充值次数：{{summary.rechargeCount || '0'}} 次</li>
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
      { title: "用户名",  dataIndex: 'userName'},
      { title: "用户ID",  dataIndex: 'userId'},
      { title: "充值金额",  dataIndex: 'rechargeAmount', sorter: true},
      { title: "充值时间", dataIndex: 'rechargeTime', sorter: true}
    ],
    dataSource: [],
    pagination: { total: 0, current: 1}
  };

  init = {
    loading: false,
    query: { pageNo: 1, pageSize: 10, startTime: "",  endTime: "", sortList: [{ sortField: "rechargeAmount", sortOrder: "desc" }]}
  };

  summary = {};

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

  // 表格排序
  changePagination(pagination, filters, sorter) {
    this.table.pagination.current = pagination.current;
    this.init.query.pageNo = pagination.current;

    // 点击排序
    if (sorter.order) {
      switch(sorter.order) {
        case "ascend":
          if (sorter?.field === "rechargeTime") {
            this.init.query.sortList[0].sortField = "handleTime";
          } else {
            this.init.query.sortList[0].sortField = sorter?.field;
          }
          this.init.query.sortList[0].sortOrder = 'asc';
          break;
        case "descend":
          if (sorter?.field === "rechargeTime") {
            this.init.query.sortList[0].sortField = "handleTime";
          } else {
            this.init.query.sortList[0].sortField = sorter?.field;
          }
          this.init.query.sortList[0].sortOrder = 'desc';
          break;
      }
    } else {
      this.init.query.sortList = null;
    }

    this.getList();
    // 设定排序
    this.init.query.sortList = [
      {
        sortField:  Object.keys(sorter).length === 0 ?  'rechargeAmount' : sorter?.field === "rechargeTime" ? "handleTime" : sorter?.field,
        sortOrder:  Object.keys(sorter).length === 0 ?  'desc' : this.init.query.sortList[0].sortOrder
      }
    ]
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

  async getList(refresh) {
    if (refresh) this.resetPagination(); 

    const form = await this.vform.validate();
    if (form.errors) return 

    const  params = this.$trimValues(form.values); 
    const  values = Object.assign(this.init.query, params);
    

    this.init.loading = true;
    const res = await this.$service.fetch('/lottery-api/rechargeRecord/queryPageRechargeRecordByDirect', values);
    this.init.loading = false;

    if (res.code !== 1) return res.message && this.$message.error(res.message);
    if (res.code === 1 &&  res.data?.records instanceof Array) {
      this.table.dataSource = res.data.records;
      this.table.pagination.total = res.data?.totalCount;
    } else {
      this.table.dataSource = [];
      this.table.pagination.total = 0;
    }

    this.getSummary(values);
  }


  async getSummary(params) {
    const res = await this.$service.fetch('/lottery-api/rechargeRecord/queryRechargeRecordSummaryByDirect', params);
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
  li {
    flex: 0 0 25%;
    box-sizing: border-box;
    padding: 5px 10px;
    border-right: 1px solid #ccc;
    border-bottom: 1px solid #ccc;
  }
}
</style>