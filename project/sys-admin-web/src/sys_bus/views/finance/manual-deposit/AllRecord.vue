<template>
  <section class="manual-deposit">
    <a-form layout="inline">
      <div class="manual-date-picker">
        <date-switch @changeTab="changeTabTime" ref="ds"/>
        <a-form-item label="操作时间">
          <date-range class="myform-item" :defaultDate="true" :isToday="true" :showTime="true" @current="showCurrent" title="" ref="rg" @change="changeDate" />
        </a-form-item>
      </div>
      <a-form-item label="用户名">
        <a-input style="width:140px" v-model="form.userName" placeholder="请输入用户名"/>
      </a-form-item>
      <a-form-item label="操作人">
        <a-input style="width:160px" v-model="form.adminName"/>
      </a-form-item>
      <a-form-item label="操作类型">
        <a-select style="width:120px" v-model="form.isBatchOperate">
          <a-select-option value="">全部</a-select-option>
          <a-select-option value="0">单笔加减款</a-select-option>
          <a-select-option value="1">批量加减款</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="任务名称">
        <a-input  style="width:160px" v-model="form.taskName" />
      </a-form-item>
      <a-form-item label="加减款类型">
        <a-select v-model="form.operateType" style="width: 80px;">
          <a-select-option value="">全部</a-select-option>
          <a-select-option value="-1">扣款</a-select-option>
          <a-select-option value="1">加款</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="加减款方式">
        <a-select v-model="form.rechargeType" style="width: 100px;">
          <a-select-option value="">全部</a-select-option>
          <a-select-option value="2">人工汇款</a-select-option>
          <a-select-option value="3">彩金派送</a-select-option>
          <a-select-option value="4">返水派送</a-select-option>
          <a-select-option value="5">其它</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="每页条数">
        <a-input style="width:50px;" v-model="form.pageSize"/>
      </a-form-item>
      <a-form-item label="">
        <a-button type="primary" @click="search(true)">查询</a-button>
      </a-form-item>
    </a-form>
    <div class="mt15">
      <div class="total-data">
        <ul>
          <li>合计</li>
          <li>
            <p>加款总额：{{totalData.totalAddAmount || '0.00'}}</p>
            <p>减款总额：{{totalData.totalSubtractAmount || '0.00'}}</p>
          </li>
          <li>
            <p>加款_人工汇款：{{totalData.addManualAmount || '0.00'}}</p>
            <p>减款_人工汇款：{{totalData.subtractManualAmount || '0.00'}}</p>
          </li>
          <li>
            <p>加款_彩金派送：{{totalData.addBonusAmount || '0.00'}}</p>
            <p>减款_彩金派送：{{totalData.subtractBonusAmount || '0.00'}}</p>
          </li>
          <li>
            <p>加款_返水派送：{{totalData.addRebateAmount || '0.00'}}</p>
            <p>减款_返水派送：{{totalData.subtractRebateAmount || '0.00'}}</p>
          </li>
          <li>
            <p>加款_其他：{{totalData.addOtherAmount || '0.00'}}</p>
            <p>减款_其他：{{totalData.subtractOtherAmount || '0.00'}}</p>
          </li>
        </ul>
      </div>
      <a-table
          :rowKey="(r,i)=>i"
          :columns="columns"
          :dataSource="dataSource"
          :pagination="pagination"
          :loading="loading"
          @change="changePagination"
          class="mytable"
          bordered
        >
          <span slot="taskId" slot-scope="text, record"> {{ record.taskId == 0 ? '单笔加减款' : '批量加减款' }} </span>
          <span slot="operateType" slot-scope="text, record">{{operateTypes[record.operateType]}}</span>
          <span slot="rechargeType" slot-scope="text, record">{{rechargeTypes[record.rechargeType]}}</span>
          <span slot="amount" slot-scope="text, record">{{record.amount ? record.amount : '0.00'}}</span>
          <span slot="isUpgradeRechargeUser" slot-scope="text, record"> {{record.isUpgradeRechargeUser == 1 ? '是' : record.isUpgradeRechargeUser == 0 ? '否' : '--'}} </span>
        </a-table>
    </div>
  </section>
</template>
<script>
import Vue from 'vue'
import { Component,Computed, InjectComponents, Lifecycle } from 'vue-decorators'
import { DateSwitch } from '@/components/switch'
import DateRange from "@/components/date-range/DateRange";
import moment from "moment";

@Component({methods: {moment}, formOptions: "id"})
@InjectComponents({ DateSwitch, DateRange })
export default class Com3 extends Vue {
  loading = false;
  pagination = {current: 1, total: 0, pageSize: 10};
  operateTypes = {
    "1": "加款",
    "-1": "扣款"
  };
  rechargeTypes = {
    2: "人工汇款",
    3: "彩金派送",
    4: "返水派送",
    5: "其它"
  }
  columns = [
    {title: '订单号', dataIndex: 'transactionNo'},
    {title: '会员账号', dataIndex: 'userName'},
    {title: '操作类型', dataIndex: 'taskId', scopedSlots: {customRender: 'taskId'}},
    {title: '任务名称', dataIndex: 'taskName'},
    {title: '加减款类型', dataIndex: 'operateType', scopedSlots: {customRender: 'operateType'}},
    {title: '加减款方式', dataIndex: ' rechargeType', scopedSlots: {customRender: 'rechargeType'}},
    {title: '升级为充值用户', dataIndex: 'isUpgradeRechargeUser', scopedSlots: {customRender: 'isUpgradeRechargeUser'}},
    {title: '金额', dataIndex: 'amount', scopedSlots: {customRender: 'amount'}},
    {title: '用户备注', dataIndex: 'remark'},
    {title: '后台备注', dataIndex: 'systemRemark'},
    {title: '操作时间', dataIndex: 'createTime'},
    {title: '操作人', dataIndex: 'adminName'}
  ];
  dataSource = [];
  form = {
    createTimeStart: moment(new Date()).format('YYYY-MM-DD 00:00:00'),
    createTimeEnd: moment(new Date()).format('YYYY-MM-DD 23:59:59'),
    pageNo: 1,
    pageSize: 10,
    userName: "",
    operateType: "",
    rechargeType: "",
    taskName: "",
    userName: "",
    adminName: "",
    isBatchOperate: ""
  }

  totalData = {};

  showCurrent(startTime, endTime) {
    this.form.createTimeStart = startTime;
    this.form.createTimeEnd = endTime;
  }

  changeTabTime(startTime, endTime) {
    this.form.createTimeStart = startTime;
    this.form.createTimeEnd = endTime;
    this.$refs.rg.setDateRangeValues(startTime, endTime);
  }

  changeDate(startDate, endDate, datestring, type){
		if (type === 'start') {
      this.form.createTimeStart = datestring
    } else {
      this.form.createTimeEnd = datestring
    }
  }
  
  async search(reset) {
    this.getData(this.form, reset)
  }

  async getData(params, reset) {
    if (reset) {
      this.form.pageNo = 1;
      this.pagination.pageNo = 1;
    }
    this.loading = true
    let res = await this.$service.fetch('/lottery-admin-api/manualChangeWallet/queryPageManualChangeWallet', params)
    this.loading = false
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    if (res.data.records instanceof Array) {
      this.dataSource = res.data.records;
      this.pagination.pageSize = res.data.pageSize;
      this.pagination.total = res.data.totalCount;
    } else {
      this.dataSource = [];
      this.pagination.total = 0;
    }

    this.getSummary(params);
  }

  async changePagination (page) {
    this.pagination.current = page.current;
    this.form.pageNo = page.current;
    this.getData(this.form);
  };

  async getSummary(params) {
    const res = await this.$service.fetch('/lottery-admin-api/manualChangeWallet/queryManualChangeWalletSummary', params);
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    if (typeof res.data === "object" && res.data.constructor === Object) {
      this.totalData = res.data;
    }
  }

  @Lifecycle async created() {
    this.getData(this.form);
  }
}
</script>

<style lang="scss" scoped>
/deep/ .myform-item{
    .ant-form-item {
      margin-right: 0 !important;
    }
}
.manual-date-picker /deep/{
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  .c-date-switch {
    align-items: center;
  }
}
.total-data {
  margin-bottom: 20px;
  ul {
    display: flex;
    border-left: 1px solid #d4d4d4;
    li {
      border-top: 1px solid #d4d4d4;
      p {
        padding: 10px 30px;
        border-bottom: 1px solid #d4d4d4;
        border-right: 1px solid #d4d4d4;
      }
      &:nth-child(1) {
        background-color: #d4d4d4;
        font-weight: bold;
        padding: 30px;
      }
    }
  }
}
</style>