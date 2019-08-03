<template>
  <section class="finance-report-container">
    <a-form layout="inline">
      <a-form-item label="时间">
        <DateRange title="" @change="changeDate" ref="rg"/>
      </a-form-item>
      <a-form-item label="会员账号">
        <a-input v-model="init.query.userName"></a-input>
      </a-form-item>
      <a-form-item label="会员组">
        <a-input v-model="init.query.userGroupName"></a-input>
      </a-form-item>
      <a-form-item label="">
        <a-button type="primary" :loading="init.loading" @click="search">搜索</a-button>
      </a-form-item>
    </a-form>
    <div class="page-under-table">
      <a-table class="mytable" bordered :columns="table.columns" :rowKey="(e, i) => i" :dataSource="table.dataSource" :pagination="false" :loading="init.loading" @change="changePagination">
        <span slot="rechargeType" slot-scope="text, record">
          {{getText(record.rechargeType)}}
        </span>
      </a-table>
    </div>
  </section>
</template>
<script>
import Vue from 'vue'
import { Component, Lifecycle, InjectComponents} from 'vue-decorators'
import DateRange from "@/components/date-range/DateRange"
import moment from "moment";

@Component({methods: {moment}})
@InjectComponents({ DateRange })
export default class FinanceCheck extends Vue {
  table = {
    columns: [
      {title: "类型", dataIndex: "rechargeType", scopedSlots: {customRender: "rechargeType"}},
      {title: "用户数", dataIndex: "users"},
      {title: "总订单数", dataIndex: "totalOrders"},
      {title: "未处理笔数", dataIndex: "waitOrders"},
      {title: "成功笔数", dataIndex: "successOrders"},
      {title: "失败笔数", dataIndex: "failOrders"},
      {title: "加款总金额", dataIndex: "totalAddAmount"},
      {title: "扣款总金额", dataIndex: "totalDeductAmount"},
      {title: "未处总金额", dataIndex: "totalWaitAmount"},
      {title: "成功金额", dataIndex: "totalSuccessAmount"},
      {title: "失败金额", dataIndex: "totalFailAmount"}
    ],
    dataSource: [],
    pagination: { total: 0, current: 1 }
  };
 
  init = {
    query: { 
      userName: "", 
      userGroupName: "", 
      startTime: "", 
      endTime: ""
    },
    loading: false,
    rechargeTypes:  [
      {name: "汇款提交", value: 0}, 
      {name: "在线充值", value: 1}, 
      {name: "人工加减款_人工汇款", value: 2}, 
      {name: "人工加减款_彩金派送", value: 3}, 
      {name: "人工加减款_返水派送", value: 4}, 
      {name: "人工加减款_其它", value: 5}, 
      {name:"线下出款", value: 6}
    ]
  };

  @Lifecycle mounted() {
    this.setInititalDate();
    this.getData(this.init.query)
  }

  getText(id) {
    return this.init.rechargeTypes.find(item => item.value == id)?.name;
  }

  // 设置初始化时间
  setInititalDate() {
    const d = new Date();
    this.$refs.rg.setDateRangeValues(d);
    this.init.query.startTime = moment(d).format("YYYY-MM-DD 00:00:00");  
    this.init.query.endTime = moment(d).format("YYYY-MM-DD 23:59:59");
  }

  changeDate(start, end, datestring, type) {
    if (type === "start") {
      this.init.query.startTime = datestring
    } else {
      this.init.query.endTime = datestring
    }
  }

  async search() {
    this.getData(this.init.query);
  }

  async getData() {
    this.init.loading = true;
    const res = await this.$service.fetch("/lottery-admin-api/report/queryFinanceReportSummary", this.init.query);
    this.init.loading = false;
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.table.dataSource = res.data;
  }

  changePagination(pagination) {
    this.table.pagination.current = pagination.current;
    this.init.query.pageNo = pagination.current;
    this.getData();
  }

  changeTime(moment, arr){
		this.init.query.startTime = arr[0];
		this.init.query.endTime = arr[1];
  }
 
}
</script>


<style lang="scss" scoped>
.finance-report-container {
  background-color: #fff;
  min-height: 100%;
  overflow-y: auto;
  padding: 10px;
  box-sizing: border-box;
}
</style>
