<template>
  <div class="finance-container">
    <a-form class="myform" layout="inline" :form="vform" @submit.prevent="getList(true)">
      <a-form-item class="qr-range">
          <DateRange :defaultDate="true" :isToday="true" :showTime="true" @current="setCurrent" title="充值时间" @change="changeDate" ref="rg"/>
      </a-form-item>
      <a-form-item label="充值金额">
          <a-input-group compact>
            <a-input v-number="true"  v-decorator="['minAmount']"  style="width: 100px; text-align: center" placeholder="最小金额" />
            <a-input style="width: 30px; border-left: 0; pointer-events: none; backgroundColor: #fff" placeholder="~" disabled />
            <a-input v-number="true" v-decorator="['maxAmount']" style="width: 100px; text-align: center; border-left: 0" placeholder="最大金额" />
          </a-input-group>
      </a-form-item>
      <a-form-item>  
        <a-select v-decorator="['selected']" @change="changeSelectedType" :dropdownMatchSelectWidth="false">
            <a-select-option value="0">客户端订单号</a-select-option>
            <a-select-option value="1">平台订单号</a-select-option>
            <a-select-option value="2">第三方订单号</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item> 
        <a-input v-decorator="['clientOrderNo']" v-if="init.selected == 0"/> 
        <a-input v-decorator="['transactionNo']" v-if="init.selected == 1"/> 
         <a-input v-decorator="['thirdOrderNo']" v-if="init.selected == 2"/> 
      </a-form-item>
      <a-form-item label="订单状态">  
        <a-select class="sSelect" v-decorator="['status']" :dropdownMatchSelectWidth="false">
          <a-select-option value="">全部</a-select-option>
          <a-select-option value="-1">等待支付</a-select-option>
          <a-select-option value="0">支付失败</a-select-option>
          <a-select-option value="1">支付成功</a-select-option>
          <a-select-option value="2">增加用户余额失败</a-select-option>
        </a-select>
      </a-form-item>
       <a-form-item  class="qr-range">
          <DateRange :showTime="true" title="回调时间" @change="changeFinishTime" ref="rg"/>
      </a-form-item>
       <a-form-item label="会员账号">
          <a-input v-decorator="['userName']"/>
      </a-form-item>
      <a-form-item label="会员组">
          <a-input v-decorator="['userGroupName']"/>
      </a-form-item>
      <a-form-item label="支付名称">
        <a-cascader style="width:240px" :options="thirdPayments" @change="changeData" :loadData="loadData" placeholder="请选择支付名称" changeOnSelect/>
      </a-form-item>
      <a-form-item>
         <a-button type='primary' html-type="submit" :loading="init.loading">查询</a-button>
      </a-form-item>
    </a-form>
    <div class="page-under-table">
      <div class="total-data">
        <ul class="total-data-item">
          <li>合计</li>
          <li class="g-green">订单金额：{{ totalData.totalRechargeAmount || '0.00'}}（{{ totalData.totalRechargeCount || '0'}}笔）</li>
          <li class="g-purple">等待处理：{{ totalData.totalWaitingRechargeAmount || '0.00'}}（{{ totalData.totalWaitingRechargeCount  || '0'}}笔）</li>
          <li class="g-green">充值成功：{{ totalData.totalSuccessRechargeAmount || '0.00'}}（{{ totalData.totalSuccessRechargeCount  || '0'}}笔）</li>
          <li class="g-yellow">充值失败：{{ totalData.totalFailRechargeAmount || '0.00'}}（{{ totalData.totalFailRechargeCount  || '0'}}笔）</li>
          <li class="g-red">帐变异常：{{ totalData.totalWalletChangeErrorAmount || '0.00'}}（{{ totalData.totalWalletChangeErrorCount  || '0'}}笔）</li>
          <li class="g-blue">赠送金额（成功）：{{ totalData.totalGiveAmount || '0.00'}}（{{ totalData.totalGiveCount  || '0'}}笔）</li>
        </ul>
        <a-button type="primary" @click.prevent="exportExcel">导出Excel</a-button>
      </div>
      <a-table class="mytable" bordered :loading="init.loading" :rowKey="(e,i) => i" :columns="table.columns" :dataSource="table.dataSource" :pagination="table.pagination" @change="changePagination">
        <template slot="orderNo"> <p>客户端订单号</p> <p>系统订单号</p> <p>第三方订单号</p> </template>
        <template slot="time"> <p>提交时间</p> <p>回调时间</p> </template>
        <template slot="member"> <p>会员账号</p> <p>会员组</p> </template>
        <template slot="amount"> <p>充值金额</p> <p>赠送金额</p> </template>
        <template slot="no"> <p>方式</p> <p>卡号</p> </template>
        <template slot="remark"> <p>备注</p> </template>
        <template slot="transactionNo" slot-scope="text, records">
          <p>{{records.clientOrderNo ? records.clientOrderNo : '--'}}</p>
          <p>{{records.transactionNo ? records.transactionNo : '--'}}</p>
          <p>{{records.thirdOrderNo ? records.thirdOrderNo : '--'}}</p>
        </template>
        <template slot="timeData" slot-scope="text, records">
          <p>{{records.createTime ? records.createTime : '--'}}</p>
          <p>{{records.finishTime ? records.finishTime : '--'}}</p>
        </template>
        <template slot="memberData" slot-scope="text, records">
          <p>{{records.userName}}</p>
          <p>{{records.userGroupName}}</p>
        </template>
        <template slot="rechargeAmount" slot-scope="text, records">
          <span v-html="getRechargeAmount(records.rechargeAmount)"></span>
        </template>
        <template slot="amountData" slot-scope="text,records">
          <p>{{records.rechargeAmount}}</p>
          <p>{{records.giveAmount}}</p>
        </template>
        <template slot="remarkData" slot-scope="text, records">
          <!-- <p>{{records.adminName}}</p> -->
          <p>{{records.remark}}</p>
        </template>
        <template slot="status" slot-scope="text, records">
          <span>{{getStatusText(records.status)}}</span>
        </template>
        <template slot="operate" v-permission="200882" slot-scope="text, records">
          <a-button :disabled="records.status != -1" class="common-blue-btn" @click="showManualModal(records)">人工入款</a-button>
        </template>
      </a-table>
    </div>

    <a-modal title="人工入款" v-model="init.modalShow" :width="420" @ok="confirmDeposit" :confirmLoading="confirmLoading" :maskClosable="false" :destroyOnClose="true" :bodyStyle="{padding: '10px'}">
      <a-form :form="vform1" class="manual-form">
        <a-form-item label="充值时间" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
          <a-input v-decorator="['createTime']" disabled/>
        </a-form-item>
        <a-form-item label="订单号" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
          <a-input  v-decorator="['clientOrderNo']"  disabled/>
        </a-form-item>
        <a-form-item label="会员账号" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
          <a-input  v-decorator="['userName']"  disabled/>
        </a-form-item>
        <a-form-item label="充值金额" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
          <a-input  v-decorator="['rechargeAmount']"  disabled/>
        </a-form-item>
        <a-form-item label="充值渠道" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
          <a-input  v-decorator="['paymentName']"  disabled/>
        </a-form-item>
        <!-- <a-form-item :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
          <a-row :gutter="8">
            <a-col :span="16" :offset="8">
              <a-checkbox class="checkbox-item" :class="{'locked': init.isLockPayout }" @change="changeCheckbox"> 锁定该订单即可处理出款 </a-checkbox>
            </a-col>
          </a-row>
        </a-form-item> -->
      </a-form>
    </a-modal>

  </div>
</template>

<script>
import Vue from 'vue'
import { Component, InjectComponents, Lifecycle } from 'vue-decorators'
import DateRange from "@/components/date-range/DateRange"
import { getUnit, getColor } from "@/util/helper"

@Component({formOptions: {
  vform: "id",
  vform1: "id"
}})
@InjectComponents({DateRange})
export default class Deposit extends Vue {
  table = {
    key: 1,
    columns: [
      { scopedSlots: { title: "orderNo", customRender: 'transactionNo'} },
      { dataIndex: 'submit', scopedSlots: { title: "time", customRender: "timeData" }}, 
      { dataIndex: 'account', scopedSlots: { title: "member", customRender: "memberData" }}, 
      // { title: '姓名/附言', dataIndex: 'realName'}, 
      // { title: '交易前', dataIndex: 'preBalance'}, 
      // { dataIndex: 'amount', scopedSlots: { title: "amount", customRender: "amountData" }}, 
      { title: '充值金额',  scopedSlots: { customRender: 'rechargeAmount' } },
      { title: '赠送金额', dataIndex: 'giveAmount' },
     // { title: '交易后', dataIndex: 'postBalance'}, 
      { dataIndex: 'clientType', scopedSlots: {  title: "remark", customRender: "remarkData" }}, 
      { title: '第三方支付', dataIndex: 'thirdPaymentName'},
      { title: '支付名称', dataIndex: 'paymentName'},
      { title: '状态', dataIndex: 'status', scopedSlots: { customRender: 'status' }}, 
      { title: '操作',  dataIndex: 'operate', scopedSlots: { customRender: 'operate' } }
    ],
    selectedRowKeys: [],
    rowSelection: {
      onChange: (selectedRowKeys, selectedRows) => {
        this.table.selectedRowKeys = selectedRows.map(e => e.id);
      },
    },
    dataSource: [],
    pagination: { total: 0, current: 1 }
  }

  totalData = {};

  init = {
    query: { 
      pageNo: 1, 
      pageSize: 10, 
      createTimeStart: "", 
      createTimeEnd: "", 
      handleTimeStart: "", 
      handleTimeEnd: "", 
      rechargeType: 1, 
      paymentIdList: [],
      thirdPaymentId: ''
    },
    loading: false,
    modalShow: false,
    editId: "",
    modalType: 'add',
    paymentId: "",
    bankId: "",
    showUserGroup: false,
    // 默认选择客户端订单号
    selected: 0,
    isLockPayout: false
  };

  confirmLoading = false;

  thirdPayments = [];

  @Lifecycle mounted() {
    this.setFormInitialValue();
    this.getPaymentName();
    this.getList();
  }


  /** 第一级数据 */
  async getPaymentName() {
    const res = await this.$service.fetch('/config-admin-api/thirdPayment/getThirdPaymentForMerchant');
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    if (res.code === 1 && res.data instanceof Array) {
      this.thirdPayments = res.data.map(item => {
        return {
          value: item.id,
          label: item.paymentChannelName,
          isLeaf: false
        }
      });
    }
  }

  /** 第二级数据 */
  async loadData(selectedOptions) {
    const targetOption = selectedOptions[selectedOptions.length - 1];

    const res = await this.$service.fetch("/config-admin-api/thirdPayment/getThirdPaymentWayForMerchant", {
      thirdPaymentId: targetOption.value
    });

    if (res.code === 1 && res.data instanceof Array) {
      targetOption.children = res.data.map(item => {
        return {
          value: item.id,
          label: item.paymentName
        }
      });
      targetOption.children.unshift({
        value: "",
        label: "全部"
      });

    }
    this.thirdPayments = [...this.thirdPayments];
  }

  /** 选择了二级 需要传递给后端的数据 */
  changeData(value) {
    if (value && value.length === 2 && value[1] != "") {
      this.init.query.paymentIdList = [value[1]];
    } else {
      this.init.query.paymentIdList = [];
    }
    this.init.query.thirdPaymentId = value[0] ? value[0] : '';
  }


  getRechargeAmount(amount) {
    if (!amount) return amount;
    amount = String(amount);
    const arr = amount.split(/\./);
    let unit = getUnit(arr[0] && arr[0].length);
    let color = getColor(arr[0] && arr[0].length);
    return `<span class="${color} bold">${unit}</span> <span class="${color} bold">${amount}</span>`;
  }

  setCurrent(startTime, endTime) {
    this.init.query.createTimeStart = startTime;
    this.init.query.createTimeEnd = endTime;
  }

  showManualModal(record) {
    this.init.modalShow = true;
    this.vform1.setValues(record, true);
    this.init.editId = record?.id;
  }

  // 确认充值
  async confirmDeposit() {
    this.confirmLoading = true;
    const res = await this.$service.fetch('/lottery-admin-api/rechargeRecord/editRechargeRecordToSuccess', { id: this.init.editId });
    this.confirmLoading= false;

    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.$message.success(res.message);
    this.getList();
    this.init.modalShow = false;
  }

  // 对订单进行锁定
  async changeCheckbox(event) {
    this.init.isLockPayout = event.target.checked;
  }

  changeSelectedType(value) {
    this.init.selected = value
  }

  setFormInitialValue() {
    this.vform.setValue('selected', this.init.selected);
    this.vform.setValue('status', '');
    this.vform.setValue('thirdPaymentId', '');
  }

  getStatusText(id) {
    const status = [{id: "-1", value: "等待支付"}, {id: "0", value: "支付失败"}, {id: "1", value: "支付成功"}, {id: "2", value: "增加用户余额失败"}];
    return status.find(item => item.id == id)?.value;
  }

  changeDate(startTime, endTime, datestring, type) {
    if (type === "start") {
      this.init.query.createTimeStart = datestring
    } else {
      this.init.query.createTimeEnd = datestring
    }
  }

  changeFinishTime(startTime, endTime, datestring, type) {
    if (type === "start") {
      this.init.query.handleTimeStart = datestring
    } else {
      this.init.query.handleTimeEnd = datestring
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

  requestParam = {};

  async getList(refresh) {
    if (refresh) this.resetPagination();
    const form = await this.vform.validate();
    if (form.errors) return;
    if (parseFloat(form.values.maxAmount) < parseFloat(form.values.minAmount)) {
      return this.$message.error("最小金额不能大于最大金额");
    }
    const params = this.$trimValues(form.values);
    if (params.selected) delete params.selected;
    this.init.loading = true;
    const res = await this.$service.fetch('/lottery-admin-api/rechargeRecord/queryPageRechargeRecord', Object.assign(this.init.query, params));
    this.init.loading = false;
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    if (res.data?.records instanceof Array) {
      this.table.dataSource = res.data?.records;
      this.table.pagination.total = res.data.totalCount
    } else {
      this.table.dataSource = [];
      this.table.pagination.total = 0;
    }
    this.requestParam = Object.assign(this.init.query, params);
    this.getTotal(Object.assign(this.init.query, params))
  }

  async getTotal(params) {
    const res = await this.$service.fetch('/lottery-admin-api/rechargeRecord/queryRechargeRecordSummary', params);
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    if (res.data && typeof res.data === "object") {
      this.totalData = res.data;
    }
  }

  async exportExcel() {
    const res =  await this.$service.download('/lottery-admin-api/rechargeRecord/exportRechargeRecord', this.requestParam);
    if (res.code !== 1) return res.message && this.$message.error(res.message);
  }
}
</script>

<style lang="scss" scoped>
  .myform /deep/ {
    .ant-form-item {
      margin-bottom: 2px;
    }
  }
 
 .qr-range /deep/{
    .ant-form-item {
      margin-right: 0;
    }
  }
  .sSelect {
    width: 100px;
  }
  .amount {
    width: 90px;
  }

  .manual-form /deep/{
    .ant-form-item {
      margin-bottom: 10px;
    }
  }

  /deep/ .checkbox-item {
    > span {
      &.ant-checkbox {
        display: none;
      }
      &:nth-child(2) {
        padding: 6px 12px;
        background-color: #f2f2f2;
        color: #999;
        border-radius: 2px;
        margin-left: 14px;

        &::before {
          position: absolute;
          left: -20px;
          top: 4px;
          text-align: center;
          content: "\2713";
          font-size: 20px;
          color: #fff;
          width: 30px;
          line-height: 31px;
          height: 31px;
          display: inline-block;
          background-color: #f2f2f2;
        }
      }
    }

    &.locked {
       > span {
        &:nth-child(2) {
          background-color: rgba(95, 184, 120, 1);
          color: #fff;

          &::before {
            position: absolute;
            left: -20px;
            content: "\2713";
            font-size: 20px;
            color:  rgba(95, 184, 120, 1);
            background-color: #f2f2f2;
          }
        }
      }
    }
  }

  .total-data {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
    align-items: center;
    .total-data-item {
      display: flex;
      border-top: 1px solid #d7d7d7;
      border-left: 1px solid #d7d7d7;
      li {
        padding: 8px 10px;
        border-bottom: 1px solid #d7d7d7;
        border-right: 1px solid #d7d7d7;
        &:nth-child(1) {
          font-weight: bold;
          padding: 8px 40px;
          background-color: #fafafa;
        }
      }
    }
  }
</style>