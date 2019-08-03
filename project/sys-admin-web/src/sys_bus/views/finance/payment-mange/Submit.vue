<template>
  <div class="finance-container">
    <a-form class="myform" layout="inline" :form="vform" @submit.prevent="getList(true)">
      <a-form-item class="qr-range">
          <DateRange :defaultDate="true" :isToday="true" :showTime="true" @current="setCurrent" title="提交时间" @change="changeDate" ref="rg"/>
      </a-form-item>
      <a-form-item label="订单状态">  
        <a-select class="sSelect" v-decorator="['status']" :dropdownMatchSelectWidth="false">
          <a-select-option value="">全部</a-select-option>
          <a-select-option value="-2">等待处理</a-select-option>
          <a-select-option value="1">充值成功</a-select-option>
          <a-select-option value="0">充值失败</a-select-option>
          <a-select-option value="2">帐变异常</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="会员组">
        <!-- <a-input v-decorator="['userGroupName']"/> -->
        <a-select class="sSelect1" v-decorator="['userGroupName']">
          <a-select-option value="">全部</a-select-option>
          <a-select-option v-for="(item, index) in init.allUserGroup" :value="item.groupName" :key="index">{{item.groupName}}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="会员账号">
          <a-input class="w120"  v-decorator="['userName']"/>
      </a-form-item>
      <a-form-item label="转账姓名">
         <a-row>
           <a-col :span="10">
             <a-input v-decorator="['cardRealName']"/>
           </a-col>
           <a-col :span="4" :offset="1">
             <a-button  class="btn-blue" @click="(e) => pasteText(e, 'cardRealName')">清空</a-button>
           </a-col>
         </a-row>
      </a-form-item>
      <a-form-item  class="qr-range">
        <DateRange :showTime="true" title="处理时间" @change="changeFinishTime"/>
      </a-form-item>
      <a-form-item label="支付方式">
         <a-dropdown class="drop-down-list" :trigger="['click']">
           <div class="dropdown-link">
            <a-input v-model="init.paymentTxt" class="dropdown-input" placeholder="全部" />
            <a-button size="small" class="dropdown-btn" @click.stop="clearSelectedBanks">清空</a-button>
           </div>
           <a-menu slot="overlay">
            <a-menu-item class="dropdown-inner">
              <div class="drop-down-inside" @click.stop style="width:220px; padding-top: 10px;">
                <div class="caster">
                  <a-radio-group class="paymentType" @change="getPaymentTypeList" v-decorator="['paymentType']">
                    <a-radio value="1">银行卡</a-radio>
                    <a-radio value="3">二维码</a-radio>
                  </a-radio-group>
                </div>
                <div class="caster-second mt10" style="border-top:1px solid #e9e9e9;">
                  <p @click.stop class="pt5" v-for="(item, index) in init.allPaymentMethods" :key="index">
                    <a-checkbox :checked="item.checked" @change.stop="(e) => selectPayments(e, item.paymentId)">{{item.paymentName}}</a-checkbox>
                  </p>
                </div>
              </div>
            </a-menu-item>
            <a-menu-item class="dropdown-btns">
              <a-button size="small" class="select-all" @click.stop="selectAllMethods">全部选中</a-button>&nbsp;
              <a-button size="small"  class="select-sty1">确认</a-button>&nbsp;
              <a-button size="small"  class="select-sty2">取消</a-button>
            </a-menu-item>
           </a-menu>
         </a-dropdown>
      </a-form-item>
      <a-form-item label="客户端订单号">
        <a-input class="sSelect1" v-decorator="['clientOrderNo']"/>
      </a-form-item>
      <a-form-item label="会员姓名">
        <a-input  class="w120" v-decorator="['realName']"/>
      </a-form-item>
      <a-form-item class="label-1" label="附言">
        <a-row>
           <a-col :span="10">
             <a-input v-decorator="['postscript']"/>
           </a-col>
           <a-col :span="4" :offset="1">
             <a-button class="btn-blue" @click="(e) => pasteText(e, 'postscript')">清空</a-button>
           </a-col>
         </a-row>
      </a-form-item>
       <a-form-item label="充值金额">
          <a-input-group compact>
            <a-input v-number="true"  v-decorator="['minAmount']"  style="width: 100px; text-align: center" placeholder="最小金额" />
            <a-input style="width: 30px; border-left: 0; pointer-events: none; backgroundColor: #fff" placeholder="~" disabled />
            <a-input v-number="true" v-decorator="['maxAmount']" style="width: 100px; text-align: center; border-left: 0" placeholder="最大金额" />
          </a-input-group>
      </a-form-item>
      <a-form-item label="每页条数">
        <a-input class="w40" v-decorator="['pageSize']"/>
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
        <template slot="transitionNoTitle">
          <p>客户端订单号</p> <p>系统订单号</p> 
        </template>
        <template slot="time"> <p>提交时间</p></template>
        <template slot="member"> <p>会员账号</p> <p>会员组</p> </template>
        <template slot="amount"> <p>充值金额</p> <p>赠送金额</p> </template>
        <template slot="no"> <p>支付方式</p> <p>卡号/账号</p> </template>
        <template slot="remark"> <p>审核人</p> <p>处理时间</p> </template>
        <template slot="cardRealNameTitle">
          <p>转账姓名</p>
          <p>附言</p>
        </template>
        <template slot="transactionNo"  slot-scope="text, records">
          <p>{{records.clientOrderNo}}</p>
          <p>{{records.transactionNo}}</p>
        </template>
        <template slot="timeData" slot-scope="text, records">
          <p v-html="getHtml(records.createTime)"></p>
        </template>
        <template slot="memberData" slot-scope="text, records">
          <div class="member-data">
            <p class="member-data-text">{{records.userName ? records.userName : '--'}} <a-button size="small" @click="() => copyText(records.userName)">复制</a-button></p>
            <p>{{records.userGroupName ? records.userGroupName : '--'}}</p>
          </div>
        </template>
        <template slot="cardRealName" slot-scope="text,records">
          <p>{{records.cardRealName ? records.cardRealName : '--'}}</p>
          <p>{{records.postscript ? records.postscript : '--'}}</p>
        </template>
        <template slot="rechargeAmount" slot-scope="text, records">
          <div class="member-data">
            <p class="member-data-text">
              <span v-html="getRechargeAmount(records.rechargeAmount)"></span>
              <a-button size="small" @click="() => copyText(records.rechargeAmount)">复制</a-button>
            </p>
          </div>
        </template>
        <template slot="realName" slot-scope="text, records">
          {{records.realName ? records.realName : '--'}}
        </template>
        <template slot="amountData" slot-scope="text,records">
          <p>{{records.rechargeAmount}}</p>
          <p>{{records.giveAmount}}</p>
        </template>
        <template slot="postBalance" slot-scope="text,records">
          <p> {{ getTextByStatus(records.postBalance, records.status) }} </p>
        </template>
        <template slot="remarkData" slot-scope="text, records">
          <p>{{records.adminName ? records.adminName : '--'}}</p>
          <p>{{records.finishTime ? records.finishTime : '--'}}</p>
        </template>
        <template slot="cardData" slot-scope="text, records">
          <p>{{records.paymentType == 1 ? '银行卡' : '二维码'}}/{{records.paymentName ? records.paymentName : '--'}} </p>
          <p>{{records.account}}</p>
        </template>
        <template slot="status" slot-scope="text, records">
          <span v-if="records.status<0" class="g-purple">{{getStatusText(records.status)}}</span>
          <span v-else-if="records.status==2" class="g-red">{{getStatusText(records.status)}}</span>
          <span v-else>{{getStatusText(records.status)}}</span>
        </template>
        <template slot="operate" slot-scope="text, records">
          <template v-if="records.status<0">
            <p><a-button class="common-green-btn" v-permission="20369" size="small" :disabled="arrivedLoading" @click="changeOrderStatus('success', records.id)">已到账</a-button></p>
            <p class="mt5"><a-button  v-permission="20370" class="common-red-btn" :loading="unArrivedLoading" @click="changeOrderStatus('fail', records.id)" size="small">未到账</a-button></p>
          </template>
          <template v-else>
            <a-button size="small" v-permission="20371" class="common-yellow-btn" @click="init.transacationId=records.id;init.showTransaction=true;">详情</a-button>
          </template>
        </template>
      </a-table>
    </div>

     <a-modal title="审核详情" v-model="init.showTransaction" :footer="null" :destroyOnClose="true" :maskClosable="false">
       <PaymentInfo @close="init.showTransaction=false;getList();" :id="init.transacationId"/>
    </a-modal>

  </div>
</template>

<script>
import Vue from 'vue'
import { Component, InjectComponents, Lifecycle } from 'vue-decorators'
import DateRange from "@/components/date-range/DateRange"
import PaymentInfo from "./PaymentInfo"
import { getUnit, getColor } from "@/util/helper"
import VueClipboard from 'vue-clipboard2'
import moment from 'moment'
import { formatDate } from "@/util/date"

Vue.use(VueClipboard);

@Component({formOptions: "id"})
@InjectComponents({ DateRange, PaymentInfo})
export default class Submit extends Vue {
  table = {
    key: 1,
    columns: [
      { dataIndex: 'transactionNo' , scopedSlots: { title:"transitionNoTitle", customRender: 'transactionNo' } },
      { dataIndex: 'account', scopedSlots: { title: "member", customRender: "memberData" }}, 
      { title: "会员姓名" , scopedSlots: {customRender: 'realName'} },
      { dataIndex: 'submit', scopedSlots: { title: "time", customRender: "timeData" }}, 
      { dataIndex: 'cardRealName', scopedSlots: { title: 'cardRealNameTitle', customRender: 'cardRealName' }}, 
      { title: '充值金额', dataIndex: 'rechargeAmount',scopedSlots: {customRender: 'rechargeAmount'} },
      { title: '赠送金额', dataIndex: 'giveAmount'},
      { dataIndex: 'no', scopedSlots: {  title: "no", customRender: "cardData" }}, 
      { dataIndex: 'clientType', scopedSlots: {  title: "remark", customRender: "remarkData" }}, 
      { title: '状态', dataIndex: 'status', scopedSlots: { customRender: 'status' }}, 
      { title: '操作',  dataIndex: 'operate', scopedSlots: { customRender: 'operate' } }
    ],
    selectedRowKeys: [],
    rowSelection: {
      onChange: (selectedRowKeys, selectedRows) => {
        this.table.selectedRowKeys = selectedRows.map(e => e.id);
      }
    },
    dataSource: [],
    pagination: { total: 0, current: 1, pageSize: 10 }
  }

  payments = [
    { value: 1, name: "银行卡"},
    { value: 2, name: "充值卡"},
    { value: 3, name: "二维码"},
    { value: 4, name: "第三方支付"}
  ];

  arrivedLoading = false;
  unArrivedLoading = false;

  init = {
    query: { pageNo: 1, pageSize: 10, createTimeStart: "", createTimeEnd: "", handleTimeStart: "", handleTimeEnd: "", rechargeType: 0 },
    loading: false,
    modalShow: false,
    editId: "",
    modalType: 'add',
    paymentId: "",
    bankId: "",
    showTransaction: false,
    transacationId: "",
    // 所有支付方式
    allPaymentMethods: [],
    // userGroup
    allUserGroup: [],
    // 选中的支付方式
    selectedPaymentMethods: [],
    // 标记是否选中
    isChecked: false,
    paymentTxt: ''
  };

  totalData = {
    currentPageTotal: 0,
    currentPageDepositTotal: 0,
    currentPageGiveTotal: 0
  };
  createTimeEnd="";

  @Lifecycle mounted() {
    this.setInitialSelected();
    // this.getPayments();
    this.getUserGroup();
    this.getList();
  }

  setCurrent(startTime, endTime) {
    this.init.query.createTimeStart = startTime;
    this.init.query.createTimeEnd = endTime;
  }

  async getPaymentTypeList(event) {
    this.init.paymentTxt = '';

    const value = event.target.value;
    const res = await this.$service.fetch('/config-admin-api/payment/queryPaymentIdAndNameList', {
      paymentType: value
    });
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    if (res.data instanceof Array) {
      this.init.allPaymentMethods = res.data.map(item => {
        return { ...item, checked: false }
      })
    }
  }

  getTextByStatus(blance, status) {
    if (status !== 0 || status !== 1) {
      if (parseInt(blance) === 0) {
        return ""
      } else {
        return blance
      }
    } else {
      return blance
    }
  }

  // 清空选中的银行
  clearSelectedBanks() {
    this.init.selectedPaymentMethods=[];
    this.init.paymentTxt='';
    this.init.allPaymentMethods = this.init.allPaymentMethods.map(v => ({...v, checked: false}));
  }

  getStatusText(id) {
    const status = [{id: "-3", value: "等待处理"}, {id: "-2", value: "等待处理"}, {id: "-1", value: "等待处理"}, {id: "0", value: "充值失败"}, {id: "1", value: "充值成功"}, {id: "2", value: "账变异常"}];
    return status.find(item => item.id == id)?.value;
  }

  // 复制用户名
  copyText(text) {
    this.$copyText(text).then(() => {
      this.clipboardData = text;
      this.$message.success('复制成功')
    });
  }

  // 粘贴
  pasteText(e, type) {
    this.vform.setValue(type, '');
    // window.navigator?.clipboard?.readText().then(text => {
    //   this.vform.setValue(type, text);
    // }).catch(err => {
    //   console.log('Failed to read clipboard content:' + err);
    // });
  }

  // 设置选中
  selectPayments(event, id) {
    if (this.init.selectedPaymentMethods.includes(id)) {
      const index = this.init.selectedPaymentMethods.indexOf(id);
      this.init.selectedPaymentMethods.splice(index, 1);
    } else {
      this.init.selectedPaymentMethods.push(id);
    }
    this.init.allPaymentMethods.forEach(item => {
      if (item.paymentId == id) {
        item.checked = !item.checked;
      }
    });
    let txt = '';
    const selected = this.init.allPaymentMethods.filter(item => item.checked);
    selected.forEach(item => {
      txt += item.paymentName
    });
    this.init.paymentTxt = txt;
  }

  // 选中所有的支付方式
  selectAllMethods() {
    this.init.isChecked = !this.init.isChecked;
    this.init.allPaymentMethods.forEach(item => {
      item.checked = this.init.isChecked
    });
    
    const selected = this.init.allPaymentMethods.filter(item => item.checked);
    this.init.selectedPaymentMethods = selected.map(v => v.paymentId);
    let txt = '';
    selected.forEach(item => {
      txt += item.paymentName
    });
    this.init.paymentTxt = txt;
  }

  // 已到账，未到账处理
  async changeOrderStatus(type, id) {
    const isSuccess = type == 'success';
    if (!await this.$confirm({title: "提示", content: `确认${ isSuccess ? '已到账' : '未到账'}`})) return;
    const url  = isSuccess ? '/lottery-admin-api/rechargeRecord/editRechargeRecordToSuccess' : '/lottery-admin-api/rechargeRecord/batchSetRechargeRecordToFailure';
    const params = { id: id };
    const params2 = { list: [{ id: id, remark: '' }]};
    isSuccess ? this.arrivedLoading = true : this.unArrivedLoading = true;
    const res = await this.$service.fetch(url, isSuccess ? params : params2);
     isSuccess ? this.arrivedLoading = false : this.unArrivedLoading = false;
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.getList();
  }

  async getUserGroup() {
    const res = await this.$service.fetch('/lottery-admin-api/userGroup/queryAllUserGroup', {});
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    if (res.data && res.data instanceof Array) {
      this.init.allUserGroup = res.data;
    }
  }

  cancelSelected() {
    this.init.paymentTxt = '';
    this.init.selectedPaymentMethods = [];
    this.init.allPaymentMethods.forEach(item => {
      item.checked = false;
    });
  }

  getHtml(time) {
    const arr = time.split(/\s/);
    const date = arr[0] ? arr[0] : '';
    const tim2 = arr[1] ? `<span class="g-blue"> ${arr[1]}</span>`: '';
    return date + tim2;
  }

  getRechargeAmount(amount) {
    if (!amount) return amount;
    amount = String(amount);
    const arr = amount.split(/\./);
    let unit = getUnit(arr[0] && arr[0].length);
    let color = getColor(arr[0] && arr[0].length);
    return `<span class="${color} bold">${unit}</span> <span class="${color} bold">${amount}</span>`;
  }

  setInitialSelected() {
    this.vform.setValue('status', this.$route.query.status||'');
    this.vform.setValue('userGroupName', '');
    this.vform.setValue('pageSize', this.init.query.pageSize);
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

  // 根据订单号获取订单详情
  async showModalByTransactionNo(record) {
    this.init.transacationId = record.id;
    this.init.showTransaction = true;
    
  }

  // 重新结算
  async resetRecord(record) {
    const res = await this.$service.fetch('/lottery-admin-api/rechargeRecord/resetRechargeRecordStatus', {id: record.id});
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.$message.success(res.message);
    this.getList();
  }

  async getPayments() {
    const res = await this.$service.fetch('/config-admin-api/payment/queryAllPayment');
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    if (res.data instanceof Array) {
      this.init.allPaymentMethods = res.data.map(item => {
        return {
          ...item,
          checked: false
        }
      })
    }
  }

  // 保存查询的数据，导出接口要用到
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
    const res = await this.$service.fetch('/lottery-admin-api/rechargeRecord/queryPageRechargeRecord', Object.assign(this.init.query, params, { paymentIdList: this.init.selectedPaymentMethods }));
    this.init.loading = false;
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    if (res.data?.records instanceof Array) {
      this.table.dataSource = res.data?.records;
      this.table.pagination.total = res.data.totalCount;
      this.table.pagination.pageSize = res.data.pageSize;
    }
    this.requestParam = Object.assign(this.init.query, params);
    // 获取财务统计
    await this.getTotal(Object.assign(this.init.query, params));
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
    width: 160px;
  }
  .amount {
    width: 90px;
  }
  .report-order-text {
    border-bottom: 1px solid #f2f2f2;
    margin-bottom: 15px;
    padding-bottom: 15px;
    font-weight: bold;
  }
  .cursor-pointer {
    cursor: pointer;
  }

.w120 {
  width: 120px;
}
.w40 {
  width: 60px;
}

.label-1 /deep/{
  .ant-form-item-label {
    width: 69px;
  }
}

.dropdown-link {
  position: relative;
  .dropdown-input {
    width: 160px;
  }
  .dropdown-btn {
    position: absolute;
    right: 4px;
    top: 8px;
    color: #009688;
    border: 1px solid #009688;
  }
}

.sSelect1 {
  width: 170px;
}

.select-all {
  color: #ff9900;
  border: 1px solid #ff9900;
}
.select-sty1 {
  color: #009688;
  border: 1px solid #009688;
}

.btn-blue {
  color: #478fca;
  border: 1px solid #478fca;
}

.dropdown-inner {
  height: 200px;
  overflow-y: auto;
}

.member-data-text {
  display: flex;
  justify-content: space-between;
  button {
    color: #009688;
    border: 1px solid #009688;
  }
}

.btn-middle0 {
  padding: 4px 10px;
  height: auto;
}

/deep/ .drop-down-list {
  .ant-dropdown-menu-item {
    padding: 0;
    &:hover {
      background-color: transparent;
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