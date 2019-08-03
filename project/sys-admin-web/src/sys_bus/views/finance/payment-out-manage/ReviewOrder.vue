<template>
  <section class="page-container-wrap">
    <a-form :form="vform" layout="inline" @submit.prevent="getList(true)">
      <a-form-item label="提款时间">
        <!-- <a-range-picker @change="onChange" :showTime="{defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')]}" format="YYYY-MM-DD HH:mm:ss"></a-range-picker> -->
        <DateRange class="date-range" :defaultDate="true" :isToday="true" :showTime="true" @current="setCurrent" title="" @change="changeDate" ref="rg"/>
      </a-form-item>
      
      <a-form-item label="提款银行" style="margin-left:10px;">
        <a-dropdown :trigger="['click']">
          <div class="dropdown-link">
            <a-input v-model="init.bankText" class="dropdown-input" placeholder="全部" />
            <a-button size="small" class="dropdown-btn" @click.stop="cancelSelected('bank')">清空</a-button>
           </div>
          <a-menu slot="overlay">
            <a-menu-item class="dropdown-inner">
              <p @click.stop class="pt5" v-for="(item, index) in init.banks" :key="index"><a-checkbox :checked="item.checked" @change.stop="(e) => selectPayments(e, item.bankId)">{{item.bankName}}</a-checkbox></p>
            </a-menu-item>
            <a-menu-item class="dropdown-btns">
              <a-button size="small" class="select-all" @click.stop="selectAllMethods">全部选中</a-button>&nbsp;
              <a-button size="small"  class="select-sty1">确认</a-button>&nbsp;
              <a-button size="small"  class="select-sty2">取消</a-button>
            </a-menu-item>
           </a-menu>
        </a-dropdown>
      </a-form-item>
      <a-form-item label="VIP等级"  style="margin-left:10px;">
        <a-dropdown :trigger="['click']">
          <div class="dropdown-link">
            <a-input v-model="init.vipText" class="dropdown-input" placeholder="全部" />
            <a-button size="small" class="dropdown-btn" @click.stop="cancelSelected('vip')">清空</a-button>
          </div>
          <a-menu slot="overlay">
            <a-menu-item class="dropdown-inside">
              <p @click.stop class="pt5 dropdown-item" v-for="(item, index) in init.viplist" :key="index"><a-checkbox :checked="item.checked" @change.stop="(e) => selectVip(e, item.vipLevel)">{{item.vipLevelName}}</a-checkbox></p>
            </a-menu-item>
            <a-menu-item class="dropdown-btns">
              <a-button size="small" class="select-all" @click.stop="selectAllVip">全部选中</a-button>&nbsp;
              <a-button size="small"  class="select-sty1">确认</a-button>&nbsp;
              <a-button size="small"  class="select-sty2">取消</a-button>
            </a-menu-item>
          </a-menu>
        </a-dropdown>
      </a-form-item>

      <a-form-item label="提款金额" style="margin-left:10px;margin-right:10px;">
        <a-input-group compact>
          <a-input v-number="true"  v-decorator="['minAmount']"  style="width: 100px; text-align: center" placeholder="最小金额" />
          <a-input style="width: 30px; border-left: 0; pointer-events: none; backgroundColor: #fff" placeholder="~" disabled />
          <a-input v-number="true" v-decorator="['maxAmount']" style="width: 100px; text-align: center; border-left: 0" placeholder="最大金额" />
        </a-input-group>
      </a-form-item>

      <a-form-item label="会员账号">
        <a-input class="member-account" v-decorator="['userName']" />
      </a-form-item>

      <a-form-item label="会员姓名" style="margin-left:10px;">
        <a-input class="member-account"  v-decorator="['realName']" />
      </a-form-item>

      <a-form-item label="会员组"  class="label-member">
        <a-select class="sSelect2" v-decorator="['userGroupName']">
          <a-select-option value="">全部</a-select-option>
          <a-select-option v-for="(item, index) in init.allUserGroup" :value="item.groupName" :key="index">{{item.groupName}}</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="订单号" style="margin-left:10px;margin-right:10px;">
        <a-input v-decorator="['transactionNo']" />
      </a-form-item>

      <a-form-item label="已使用">
        <a-select v-decorator="['minUseTimes']" style="width: 140px" :dropdownMatchSelectWidth="false">
          <a-select-option value="">全部</a-select-option>
          <a-select-option value="1">0&lt;已使用</a-select-option>
          <a-select-option value="5">5&lt;已使用</a-select-option>
          <a-select-option value="10">10&lt;已使用</a-select-option>
        </a-select>
      </a-form-item>
     

      <a-form-item label="每页条数" style="margin-left:10px;">
        <a-input class="w60" v-decorator="['pageSize']"/>
      </a-form-item>

      <a-form-item style="margin-left:10px;" v-permission="20120">
        <a-button type="primary"  html-type="submit" :loading="init.loading">查询</a-button>
      </a-form-item>
    </a-form>

   <div class="page-under-table">
      <a-table class="mytable" bordered :key="table.key" :rowKey="(e,i)=>i" :loading="init.loading" :columns="table.columns" :dataSource="table.dataSource" :pagination="table.pagination" @change="changePagination" >
        <template slot="group">提款时间<br/>处理时间</template>
        <template slot="user">会员账号<br/>会员组<br/>VIP等级</template>
        <template slot="realName">会员姓名<br/>备注</template>
        <template slot="withDrawBanks">提款银行<br/>卡号</template>
        <template slot="deposit">充值<br/>提现</template>
        <template slot="member" slot-scope="text, record">
          <span>{{record.userName}}</span><br/>
          <span>{{record.userGroupName}}</span><br/>
          <span>VIP{{ (record.userVipLevel || record.userVipLevel == 0) ? record.userVipLevel : '--'}}</span>
        </template>
        <template slot="withdrawAmount" slot-scope="text, record">
          <p class="space-btween">
            <span v-html="setAmountColor(record.withdrawAmount)"></span>
            <a-button class="green-btn" size="small" @click="copyText(record.withdrawAmount)">复制</a-button>
          </p>
        </template>
       
        <template slot="nameAndRemark" slot-scope="text, record">
          <p class="space-btween"><span>{{record.realName ? record.realName : '--'}}</span> <a-button class="green-btn" size="small" @click="copyText(record.realName || '--')">复制</a-button></p>
          <p class="remark">备注:<span class="g-yellow"> {{record.userRemark ? record.userRemark : '--'}} </span></p>
        </template>

        <template slot="withDrawBankData" slot-scope="text, record">
          <p>{{record.bankName}}</p>
          <p class="space-btween"><span>{{record.cardNo}}</span> <a-button class="green-btn" size="small" @click="copyText(record.cardNo || '--')">复制</a-button></p>
          <p>已使用: {{record.totalBankUseTimes ? record.totalBankUseTimes : 0}}次</p>
        </template>

        <template slot="depositData" slot-scope="text, record">
          <p>累计充值: {{record.totalRechargeAmount ? record.totalRechargeAmount: '0.00'}}</p>
          <p>充值次数: {{record.totalRechargeTimes ? record.totalRechargeTimes : '0'}}次</p>
          <p>累计提现: {{record.totalWithdrawAmount ? record.totalWithdrawAmount : '0.00'}}</p>
          <p>提现次数: {{record.totalWithdrawTimes ? record.totalWithdrawTimes : '0'}}次</p>
        </template>

        <template slot="amountData" slot-scope="text, record">
          <p>账户余额: {{record.balance}}</p>
          <p>提存比例: {{record.withdrawDivideRechargeRate ? record.withdrawDivideRechargeRate * 100 : '0.00'}}%</p>
        </template>

        <template slot="status" slot-scope="text, record">
          {{ getStatusById(record.status) }}
        </template>

        <template slot="reviewRemark" slot-scope="text, record">
          {{record.reviewRemark ? record.reviewRemark : '--'}}
        </template>

        <template slot="operationId" slot-scope="text, record">
          <div class="payment-control">
            <div class="payment-control-left">
              <p>
                <a-button v-permission="201261" class="green-btn-1" size="small" @click="doSuccessOrFail('success', record.id)">成功</a-button>
                <a-button v-permission="201262" class="yellow-btn-1" size="small"  @click="reviewOrder(record.id, 'fail')">失败</a-button>
              </p>
              <p class="mt10">
                <a-button v-permission="20121" class="blue-btn-1" size="small" @click="$router.push(`/finance/finance-check?account=${record.userName}`)">财务核查</a-button>
              </p>
            </div>
            <div class="payment-control-right">
              <p v-for="(item, index) in init.thirdPaymentList" :key="index">
                <a-button class="yellow-btn-2" size="small" @click="noticeThirdPay(item.id, record.id, item.paymentChannelName)">{{item.paymentChannelName}}</a-button>
              </p>
            </div>
          </div>
        </template>
      </a-table>
   </div>

  <a-modal title="出款审核"  v-model="init.modalShow" :footer="null" :destroyOnClose="true" :width="440" :maskClosable="false">
     <ReviewSingleOrder :orderType="init.modalType" :id="init.orderId" @close="init.modalShow=false;getList()" @cancel="init.modalShow=false;"/>
  </a-modal>  

  </section>
</template>

<script>
import Vue from "vue";
import moment from "moment";
import { Component, InjectComponents, Lifecycle, Watch } from "vue-decorators";
import CheckPayoutOrder from "./CheckPayoutOrder"
import { getUnit, getColor } from "@/util/helper"
import { setInterval, clearInterval } from "timers";
import VueClipboard from 'vue-clipboard2'
import ReviewSingleOrder from "./ReviewSingleOrder"
import DateRange from "@/components/date-range/DateRange"

Vue.use(VueClipboard);

@Component({ formOptions: "id", methods: { moment } })
@InjectComponents({ ReviewSingleOrder, DateRange })
export default class OrderForPayment extends Vue {
  timer = null;
  table = {
    key: 1,
    columns: [
      { dataIndex: "userAccount", scopedSlots: { title: "user", customRender: "member" } },
      { title: "提款时间", dataIndex: "createTime" },
      { dataIndex: "realName", scopedSlots: { title: 'realName', customRender: 'nameAndRemark' } },
      { scopedSlots: { title: "withDrawBanks", customRender: "withDrawBankData" } },
      { title: "提款金额", scopedSlots: { customRender: 'withdrawAmount'} },
      { scopedSlots: { title: "deposit", customRender: "depositData" }},
      { title: "参考指标", scopedSlots: { customRender: "amountData" }},
      { title: "复审备注", scopedSlots: { customRender: 'reviewRemark'}},
      { title: "操作", dataIndex: "operation", scopedSlots: { customRender: "operationId" } },
    ],
    selectedRowKeys: [],
    rowSelection: {
      getCheckboxProps(record) {
        return ({ props: { disabled: record.status == 0  ||  record.status == 1 }})
      },
      onChange: (selectedRowKeys, selectedRows) => {
        this.table.selectedRowKeys = selectedRows.map(e => e.id);
      },
    },
    dataSource: [],
    pagination:  { total: 0, current: 1, pageSize: 10 }
  };

  totalData = {};

  init = {
    loading: false,
    modalShow: false,
    query: { pageNo: 1, pageSize: 10, createTimeStart: "", createTimeEnd: "", handleTimeStart: "", handleTimeEnd: "", isReview: 1, operateType: 4},
    orderStatus: [{ value: '-2', name: '待处理' }, { value: '-1', name: '处理中' }, { value: '0', name: '失败' }, { value: '1', name: '成功' }],
    orderId: "",
    banks: [],
    allUserGroup: [],
    selectedBanks: [],
    bankText: "",
    viplist: [],
    selectedVip: [],
    vipText: "",
    // 是否选中默认的提款银行
    isChecked: false,
    // 是否默认选择选中所有的vip
    isCheckedVip: false,
    // 间隔多少秒进行自动刷新
    refreshTime: 10,
    // 是否开启自动刷新
    isRefresh: false,
    // 显示第三方列表
    thirdPaymentList: [],
    modalType: 'fail'
  }

  @Lifecycle mounted() {
    this.setInitialChecked();
    this.getList();
    this.getUserGroup();
    this.getAllBanks();
    this.queryAllVipList();
    this.getAllThirdPayment();
  }

  copyText(text) {
    this.$copyText(text).then(() => {
      this.$message.success('复制成功')
    });
  }

  // 复审订单
  reviewOrder(id, type) {
    this.init.modalShow = true;
    this.init.modalType = type;
    this.init.orderId = id;
  }

  cancelSelected(type) {
    if (type === 'bank') {
      this.init.bankText = '';
      this.init.selectedBanks = [];
      this.init.banks.forEach(item => {
        item.checked = false;
      });
    } else {
      this.init.vipText = '';
      this.init.selectedVip = [];
      this.init.viplist.forEach(item => {
        item.checked = false;
      })
    }
  }

  // 获取所有第三方渠道
  async getAllThirdPayment() {
    // paymentType=20代表第三方渠道
    const res = await this.$service.fetch('/config-admin-api/thirdPayment/queryPageThirdPayment', { pageNo: 1, pageSize: 10, paymentType: 20});
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.init.thirdPaymentList =  res.data?.records.filter(item => item?.isEnabled == 1 && item?.isEnabledForcedly == 1);
  }

  async queryAllVipList() {
    const res = await this.$service.fetch('/config-admin-api/vipLevelConfig/queryAllVipLevelConfig');
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.init.viplist = res.data.map(item => ({...item, checked: false}));
  }
  
  selectVip(event, id) {
    if (this.init.selectedVip.includes(id)) {
      const index = this.init.selectedVip.indexOf(id);
      this.init.selectedVip.splice(index, 1);
    } else {
      this.init.selectedVip.push(id);
    }
    this.init.viplist.forEach(item => {
      if (item.vipLevel == id) {
        item.checked = !item.checked;
      }
    });
    let txt = '';
    const selected = this.init.viplist.filter(item => item.checked);
    selected.forEach(item => {
      txt += ',' + item.vipLevelName;
    });
    this.init.vipText = txt.substring(1);
  }
  // 选择所有的vip
  selectAllVip() {
    this.init.isCheckedVip = !this.init.isCheckedVip;
    this.init.viplist.forEach(item => {
      item.checked = this.init.isCheckedVip
    });
    
    const selected = this.init.viplist.filter(item => item.isCheckedVip);
    this.init.selectedVip = selected.map(v => v.vipLevel);
    let txt = '';
    selected.forEach(item => {
      txt += ',' + item.bankName
    });
    this.init.vipText = txt.substring(1);
  }

  // 设置选中
  selectPayments(event, id) {
    if (this.init.selectedBanks.includes(id)) {
      const index = this.init.selectedBanks.indexOf(id);
      this.init.selectedBanks.splice(index, 1);
    } else {
      this.init.selectedBanks.push(id);
    }
    this.init.banks.forEach(item => {
      if (item.bankId == id) {
        item.checked = !item.checked;
      }
    });
    let txt = '';
    const selected = this.init.banks.filter(item => item.checked);
    selected.forEach(item => { txt += ',' + item.bankName });
    this.init.bankText = txt.substring(1);
  }

  // 选中所有的支付方式
  selectAllMethods() {
    this.init.isChecked = !this.init.isChecked;
    this.init.banks.forEach(item => {
      item.checked = this.init.isChecked
    });
    
    const selected = this.init.banks.filter(item => item.checked);
    this.init.selectedBanks = selected.map(v => v.paymentId);
    let txt = '';
    selected.forEach(item => {
      txt += ',' + item.bankName
    });
    this.init.bankText = txt.substring(1);
  }

  // 点击自动刷新， 或者停止
  doRefresh() {
    if (this.init.isRefresh) {
      if (this.init.refreshTime < 5) this.init.refreshTime = 5;
      this.timer = setInterval(() => {
        this.getList();
      }, this.init.refreshTime * 1000);
    } else {
      clearInterval(this.timer);
    }
  }

  async getUserGroup() {
    const res = await this.$service.fetch('/lottery-admin-api/userGroup/queryAllUserGroup', {});
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    if (res.data && res.data instanceof Array) {
      this.init.allUserGroup = res.data;
    }
  }

  async getAllBanks() {
    const res = await this.$service.fetch('/config-admin-api/bank/queryAllBank');
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    if (res.data instanceof Array) {
      this.init.banks = res.data.map(item => {
        return { ...item, checked: false }
      });
    }
  }

  getStatusById(value) {
    return this.init.orderStatus.find(item => item.value == value)?.name;
  }

  async noticeThirdPay(thirdPaymentId, withdrawRecordId, paymentName) {
    if (!await this.$confirm({title: "确认操作", content: `确认要使用${paymentName}出款?`})) return;

    const res = await this.$service.fetch("/lottery-admin-api/withdrawRecord/noticeThirdPartyToPay", {
      thirdPaymentId,
      withdrawRecordId
    });

    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.$message.success(res.message);

    this.getList();
  }

  // 设定表单初始值
  setInitialChecked() {
    this.vform.setValue('bankId', '');
    this.vform.setValue('status', '');
    this.vform.setValue('userGroupName', '');
    this.vform.setValue('pageSize', this.init.query.pageSize);
    this.vform.setValue('minAmount', '');
    this.vform.setValue('minUseTimes', '');
  }

  setAmountColor(amount) {
    if (!amount) return amount;
    amount = String(amount);
    const arr = amount.split(/\./);
    let color = getColor(arr[0] && arr[0].length);
    return `<span class="${color} bold">${amount}</span>`;
  }
  
  onChange(date, arr) {
   this.init.query.createTimeStart = arr[0];
   this.init.query.createTimeEnd = arr[1]; 
  }

  setCurrent(startTime, endTime) {
    this.init.query.createTimeStart = startTime;
    this.init.query.createTimeEnd = endTime;
  }

  changeDate(start, end, datestring, type) {
    if (type === "start") {
      this.init.query.createTimeStart = datestring
    } else {
      this.init.query.createTimeEnd = datestring
    }
  }

  resetPagination() {
    this.table.pagination.current = 1;
    this.init.query.pageNo = 1;
    this.table.key =  Math.random();
  }

  changePagination(pagination) {
    this.table.pagination.current = pagination.current;
    this.init.query.pageNo = pagination.current;
    this.table.key =  Math.random();
    this.getList();
  }

  // 展示订单审核
  showPayoutOrder(record) {
    this.init.orderId = record?.id;
    this.init.modalShow = true;
  }

  // 处理订单为成功或者失败
  async doSuccessOrFail(type, id) {
    const result = await this.$confirm({title: `确认出款${type === 'success' ? '成功' : '失败'}`});
    if (!result) return;
    const requestUrl = type === "success" ? '/lottery-admin-api/withdrawRecord/batchPassWithdrawRecord': '/lottery-admin-api/withdrawRecord/batchRejectWithdrawRecord';
    const res = await this.$service.fetch(requestUrl, { list: [id] });
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.$message.success(res.message);
    this.table.key = Math.random();
    this.getList(true);
  }

  async batchPickUp() {
    if (!this.table.selectedRowKeys.length) {
      return this.$message.warn('请先勾选');
    }
    const result = await this.$confirm({title: "确认要进行该操作吗?"});
    if (!result) return;
    const res = await this.$service.fetch('/lottery-admin-api/withdrawRecord/batchPickupWithdrawRecord', {
      list: this.table.selectedRowKeys.map(v => ({id: v}))
    });
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.$message.success(res.message);
    this.getList(true);
    this.table.key = Math.random();
    this.table.selectedRowKeys = [];
  }

  // 单个捡取
  async pickupSingle(record) {
    const res = await this.$service.fetch('/lottery-admin-api/withdrawRecord/batchPickupWithdrawRecord', {
      list: [{id: record.id}]
    });
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.$message.success(res.message);
    this.getList();
  }

  async getTotal(params) {
    const res = await this.$service.fetch('/lottery-admin-api/withdrawRecord/queryWithdrawRecordSummary', params);
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.totalData = res.data;
    let total = 0;
    this.table.dataSource.forEach((item) => {
      total += item.amount 
    });
    this.totalData.currentPageTotal = total;
  }

  async getList(refresh) {
    if (refresh) this.resetPagination(); 
    const form = await this.vform.validate();
    const values = this.$trimValues(form.values);
    const params = Object.assign(this.init.query, values);

    if (parseFloat(form.values.maxAmount) < parseFloat(form.values.minAmount)) {
      return this.$message.error("最小金额不能大于最大金额");
    }
    
    this.init.loading = true;
    const res = await this.$service.fetch('/lottery-admin-api/withdrawRecord/queryPageWithdrawRecord', Object.assign(params, {
      bankIdList: this.init.selectedBanks,
      userVipLevelList: this.init.selectedVip
    }));
    this.init.loading = false;

    if (res.code !== 1) return res.message && this.$message.error(res.message);
    if (res.code === 1 &&  res.data?.records instanceof Array) {
      this.table.dataSource = res.data.records;
      this.table.pagination.pageSize = res.data?.pageSize;
      this.table.pagination.total = res.data?.totalCount;
    } else {
      this.table.dataSource = [];
      this.table.pagination.total = 0;
    }
    //this.getTotal(params);
  }

}
</script>
<style lang="scss" scoped>

.total-count {
  display: flex;
  justify-content: space-between;
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #f2f2f2;
  border-bottom: 1px solid #f2f2f2;
  margin-bottom: 15px;
  padding-bottom: 15px;
  align-items: center;
  .report-order-text {
    flex: 1;
    font-weight: bold;
  }
}

.ellipse {
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-link {
  position: relative;
  .dropdown-input {
    width: 280px;
  }
  .dropdown-input1 {
    width: 200px;
  }
  .dropdown-btn {
    position: absolute;
    right: 4px;
    top: 8px;
    color: #009688;
    border: 1px solid #009688;
  }
}
.dropdown-inner {
  height: 200px;
  overflow-y: auto;
}
.select-all {
  color: #ff9900;
  border: 1px solid #ff9900;
}

.yellow-btn {
  background-color: #ff9900;
  border: 1px solid #ff9900;
  color: #fff;
}

.select-sty1 {
  color: #009688;
  border: 1px solid #009688;
}
.sSelect1 {
  width: 170px;
}
.sSelect2 {
  width: 120px;
}
.dropdown-item {
  width: 50%;
  float: left;
}
.dropdown-inside {
  width: 260px;
  height: 160px;
  overflow-y: auto;
}
.btn-1 {
  padding: 3px 8px;
  height: auto;
}
.remark {
  max-width: 140px;
}
.control-refresh {
  padding: 15px 20px;
  background-color: #f2f2f2;
}
.refresh-input {
  margin: 0 5px;
}
.space-btween {
  display: flex;
  justify-content: space-between;
}
.payment-control {
  width: 260px;
  display: flex;
  justify-content: space-between;

  .payment-control-left {
    width: 200px;
  }
  .payment-control-right {
    width: 80px;
  }
}
.green-btn-1 {
  width: 65px;
  color: #009688;
  border: 1px solid #009688;
  margin-right: 10px;

  &:hover {
    background-color: #009688;
    color: #fff;
  }
}

.yellow-btn-1 {
  width: 65px;
  color: #ff9900;
  border: 1px solid #ff9900;
  
  &:hover {
    background-color: #ff9900;
    color: #fff;
  }
}

.blue-btn-1 {
  width: 140px;
  color: #478fca;
  border: 1px solid #478fca;
  box-sizing: border-box;
  margin-right: 10px;
  &:hover {
    background-color: #478fca;
    color: #fff;
  }
}

.green-btn {
  color: #009688;
  border: 1px solid #009688;
  &:hover {
    background-color: #009688;
    color: #fff;
  }
}

.yellow-btn-2 {
  color: #dd5a43;
  border: 1px solid #dd5a43;
  margin-bottom: 10px;
  &:hover {
    background-color: #dd5a43;
    color: #fff;
  }
}

.member-account {
  width: 135px;
}

.label-member /deep/{
  .ant-form-item-label {
    width: 80px;
  }  
}

.date-range /deep/ {
  .ant-form-item {
    margin-right: 0;
  }
}
</style>