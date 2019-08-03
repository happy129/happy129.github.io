<template>
  <section class="finance-check-container">
    <a-form class="form" layout="inline" :form="vform" @submit.prevent="getList(true)">
      <a-form-item label>
        <a-select v-decorator="['orderType']" @change="changeSelectTime">
          <a-select-option value="1">订单时间</a-select-option>
          <a-select-option value="2">更新时间</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item class="range">
        <DateRange :showTime="true" title="" @change="changeDate"/>
      </a-form-item>
      <a-form-item label="金额">
        <a-input-group compact>
          <a-input v-number="true"  v-decorator="['minAmount']"  style="width: 100px; text-align: center" placeholder="最小金额" />
          <a-input style="width: 30px; border-left: 0; pointer-events: none; backgroundColor: #fff" placeholder="~" disabled />
          <a-input v-number="true" v-decorator="['maxAmount']" style="width: 100px; text-align: center; border-left: 0" placeholder="最大金额" />
        </a-input-group>
      </a-form-item>
      <a-form-item label="订单号">
        <a-input v-number="true" v-decorator="['transactionNo']"/>
      </a-form-item>
      <a-form-item label="订单状态">
        <a-select style="width: 120px;" v-decorator="['status']" :dropdownMatchSelectWidth="false">
          <a-select-option value="">全部</a-select-option>
          <a-select-option v-for="(item, index) in init.status" :key="index" :value="item.value">{{item.name}}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="类型">
        <a-select v-decorator="['rechargeType']" style="width: 120px;"  :dropdownMatchSelectWidth="false">
          <a-select-option value="">全部</a-select-option>
          <a-select-option v-for="(item, index) in init.rechargeType" :key="index" :value="item.value">{{item.name}}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="会员账号">
        <a-input v-decorator="['userName']"/>
      </a-form-item>
      <a-form-item label="会员组">
        <a-select v-decorator="['userGroupName']" style="width: 120px;" :dropdownMatchSelectWidth="false">
          <a-select-option value="">全部</a-select-option>
          <a-select-option v-for="(item, index) in init.allUserGroup" :key="index" :value="item.groupId" >{{item.groupName}}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label>
        <a-button type="primary" html-type="submit" :loading="init.loading">查询</a-button>
      </a-form-item>
    </a-form>
    <div class="page-under-table finance-wrapper">
      <a-table class="mytable" :columns="table.columns" :dataSource="table.dataSource" :loading="init.loading" :pagination="table.pagination" bordered :rowKey="(e,i) => i" @change="changePagination" >
        <template slot="group"> <p>会员账号</p> <p>会员组</p> </template>
        <template slot="time"> <p>订单时间</p> <p>更新时间</p> </template>
        <template slot="userName" slot-scope="text, record">
          <p>{{record.userName}}</p>
          <p>{{record.userGroupName}}</p>
        </template>
        <template slot="orderTime" slot-scope="text, record">
          <p>{{record.createTime}}</p>
          <p>{{record.updateTime}}</p>
        </template>
        <template slot="rechargeType" slot-scope="text, record">
          <span>{{ record.rechargeTypeName }}</span>
        </template>
      </a-table>

      <div class="total mt15">
        <ul>
          <li v-for="(item, i) in totalData" :key="i">
            <p class="head">{{item.title}}</p>
            <p>{{item.value ? item.value : '0.00'}}</p>
          </li>
        </ul>
      </div> 

    </div>
  </section>
</template>
<script>
import Vue from "vue";
import { Component, Lifecycle, InjectComponents } from "vue-decorators";
import DateRange from "@/components/date-range/DateRange"
import moment from "moment";

@Component({ formOptions: "id" })
@InjectComponents({ DateRange })
export default class FinanceCheck extends Vue {
  table = {
    key: 1,
    columns: [
      { dataIndex: "group", scopedSlots: { title: "group", customRender: "userName" } },
      { title: "真实姓名", dataIndex: "realName" },
      { title: "订单号", dataIndex: "transactionNo" },
      { title: "订单类型", dataIndex: "rechargeType", scopedSlots: { customRender: "rechargeType" } },
      { dataIndex: "time", scopedSlots: { title: "time", customRender: "orderTime" } },
      { title: "交易前", dataIndex: "preBalance" },
      { title: "交易金额", dataIndex: "amount" },
      { title: "彩金", dataIndex: "giveAmount" },
      { title: "交易后", dataIndex: "postBalance" },
      { title: "不可提款金额", dataIndex: "preUnwithdrawableAmount" },
      { title: "状态", dataIndex: "statusName"},
      { title: "备注", dataIndex: "remark" }
    ],
    selectedRowKeys: [],
    rowSelection: {
      onChange: (selectedRowKeys, selectedRows) => {
        this.table.selectedRowKeys = selectedRows.map(e => e.id);
      },
    },
    dataSource: [],
    pagination: { total: 0, current: 1 }
  };

  totalData = [
    { title: "本页财务统计：", remark: "totalAmount" },
    { title: "在线充值：", remark: "onlineAmount" },
    { title: "汇款提交：", remark: "offlineAmount" },
    { title: "在线取款：", remark: "totalWithdrawalAmount" },
    { title: "人工汇款：", remark: "artificialAmount" },
    { title: "彩金派送：", remark: "bonusAmount" },
    { title: "返水派送：", remark: "rebateAmount" },
    { title: "其他：", remark: "otherAmount" },
    { title: "入款赠送：", remark: "giveAmount" },
    { title: "全部财务统计：", remark: "totalAmount" },
    { title: "总在线充值：", remark: "onlineAmount" },
    { title: "总汇款提交：", remark: "offlineAmount" },
    { title: "总在线取款：", remark: "totalWithdrawalAmount" },
    { title: "总人工汇款：", remark: "artificialAmount" },
    { title: "总彩金派送：", remark: "bonusAmount" },
    { title: "总返水派送：", remark: "rebateAmount" },
    { title: "总其他：", remark: "otherAmount" },
    { title: "总入款赠送：", remark: "giveAmount" }
  ];

  init = {
    loading: false,
    allUserGroup: [],
    defaultSelect: 1,
    query: { pageNo: 1, pageSize: 10, createTimeStart: "", createTimeEnd: "", updateTimeStart: "", updateTimeEnd: ""},
    time: { startTime: "", endTime: "" },
    status: [{value: -1, name: "等待支付"}, {value: 0, name: "支付失败"}, {value: 1, name: "支付成功"}, {value: 2, name: "增加用户余额失败"}],
    rechargeType: [
      {value: 0, name: "汇款提交"}, 
      {value: 1, name: "在线充值"}, 
      {value: 2, name: "人工汇款"}, 
      {value: 3, name: "彩金派送"}, 
      {value: 4, name: "返水派送"}, 
      {value: 5, name: "其它"}
    ],
    // 汇总
    totalResult: {}
  };

  // 全局做了缓存处理, keep-alive提供了一个激活状态的控制， good good good, go go go
  @Lifecycle activated() {
    if (this.$route.query.account && this.$route.query.account !== "") {
      this.vform.setValue('userName', this.$route.query.account);
      this.getList();
    }
  }

  @Lifecycle mounted() {
    // 从出款管理，出款核查弹窗里面跳转到财务核查，会带上用户名进行查询
    if (this.$route.query.account && this.$route.query.account !== "") {
      this.vform.setValue('userName', this.$route.query.account);
    }

    this.setInitialChecked();
    this.getUserGroup();
    this.getList();
  }

   // 设定表单初始值
  setInitialChecked() {
    this.vform.setValue('orderType', 1);
    this.vform.setValue('status', '');
    this.vform.setValue('rechargeType', '');
    this.vform.setValue('userGroupName', '');
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

  changeDate(startTime, endTime, datestring, type) {
    if (type === "start") {
      this.init.time.startTime = datestring
      if (this.init.defaultSelect == 1) {
        this.init.query.createTimeStart = datestring
      } else {
        this.init.query.updateTimeStart = datestring
      }
    } else {
      this.init.time.endTime = datestring;
      if (this.init.defaultSelect == 1) {
        this.init.query.createTimeEnd = datestring
      } else {
        this.init.query.updateTimeEnd = datestring
      }
    }
  }

  changeSelectTime(value) {
    this.init.defaultSelect = value;
    const { startTime, endTime } = this.init.time;
    // 根据订单时间
    if (value == 1) {
      this.init.query.createTimeStart = startTime;
      this.init.query.createTimeEnd = endTime;
      this.init.query.updateTimeStart = "";
      this.init.query.updateTimeEnd = "";
    } else {
    // 根据更新时间
      this.init.query.updateTimeStart = startTime;
      this.init.query.updateTimeEnd = endTime;
      this.init.query.createTimeStart = "";
      this.init.query.createTimeEnd = "";
    }
  }

  // 根据value获取text
  getTextByItemValue(id, array) {
    return array.find(item => item.value == id)?.name;
  }

  // 获取用户分组
  async getUserGroup() {
    let res = await this.$service.fetch( "/lottery-admin-api/userGroup/queryAllUserGroup", {});
    if (res.code === 1) this.init.allUserGroup = res.data 
  }

  // 获取汇总
  async getTotal(params) {
    const res = await this.$service.fetch('/lottery-admin-api/report/queryFinanceAuditSummary', params);
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.init.totalResult = res.data;
    this.totalData.forEach(item => {
      for (let [key, value] of Object.entries(res.data)) {
        if (key == item.remark) {
          item.value = value
        }
      }
    });
  }

  async getList(refresh) {
    if (refresh) this.resetPagination(); 
    const form = await this.vform.validate();
    const values = this.$trimValues(form.values);
    const params = Object.assign(this.init.query, values);
    // 删除多余字段
    delete params.orderType;

    this.init.loading = true;
    const res = await this.$service.fetch('/lottery-admin-api/report/queryPageFinanceAudit', params);
    this.init.loading = false;

    if (res.code !== 1) return res.message && this.$message.error(res.message);
    if (res.code === 1 &&  res.data?.records instanceof Array) {
      this.table.dataSource = res.data.records;
      this.table.pagination.total = res.data?.totalCount;
    } else {
      this.table.dataSource = [];
      this.table.pagination.total = 0;
    }
    this.getTotal(params);
  }
}
</script>
<style lang="scss" scoped>
.finance-check-container /deep/{
  background-color: #fff;
  min-height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  padding: 10px;
  box-sizing: border-box;
  
  .total {
    border: 1px solid #e0e0e0;
    ul {
      display: flex;
      flex-wrap: wrap;
      li {
        flex: 0 0 11.11%;
        p { line-height: 30px; text-indent: 5px; &.head { background: #f7f7f7; font-weight: bold; } }
      }
    }
  }
  .form {
    .ant-form-item {
      margin-right: 10px;
    }
    .range {
      .ant-form-item {
        margin-right: 0;
      }
    }
  }

  .finance-wrapper {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }
}
</style>
