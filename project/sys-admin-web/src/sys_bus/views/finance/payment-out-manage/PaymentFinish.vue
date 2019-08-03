<template>
  <section class="page-container-wrap">
    <a-form :form="vform" layout="inline" @submit.prevent="getList(true)" class="myform">
      <a-form-item label="提款时间">
        <!-- <a-range-picker @change="onChange" :showTime="{defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')]}" format="YYYY-MM-DD HH:mm:ss"></a-range-picker> -->
        <DateRange class="date-range" :defaultDate="true" :isToday="true" :showTime="true" @current="setCurrent" title="" @change="changeDate" ref="rg"/>
      </a-form-item>

      <a-form-item label="订单状态" style="margin-left:10px;">
        <a-select v-decorator="['status']" style="width: 120px" :dropdownMatchSelectWidth="false">
          <a-select-option value>全部</a-select-option>
          <a-select-option value="1">出款成功</a-select-option>
          <a-select-option value="0">出款失败</a-select-option>
          <a-select-option value="2">帐变异常</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="出款方式" style="margin-left:10px;">
        <a-select v-decorator="['thirdPaymentId']" style="width: 160px" :dropdownMatchSelectWidth="false">
          <a-select-option value="">全部</a-select-option>
          <a-select-option
            v-for="(item, index) in dsstore.thirdPayments"
            :key="index"
            :value="`${item.id}`"
          >{{item.paymentChannelName}}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="订单号" style="margin-left:10px;margin-right:10px;">
        <a-input v-decorator="['transactionNo']"/>
      </a-form-item>
      <a-form-item label="VIP等级">
        <a-dropdown :trigger="['click']">
          <div class="dropdown-link">
            <a-input v-model="init.vipText" class="dropdown-input" placeholder="全部"/>
            <a-button
              size="small"
              class="dropdown-btn"
              @click.stop="cancelSelected"
            >清空</a-button>
          </div>
          <a-menu slot="overlay">
            <a-menu-item class="dropdown-inside">
              <p
                @click.stop
                class="pt5 dropdown-item"
                v-for="(item, index) in init.viplist"
                :key="index"
              >
                <a-checkbox
                  :checked="item.checked"
                  @change.stop="(e) => selectVip(e, item.vipLevel)"
                >{{item.vipLevelName}}</a-checkbox>
              </p>
            </a-menu-item>
            <a-menu-item class="dropdown-btns">
              <a-button size="small" class="select-all" @click.stop="selectAllVip">全部选中</a-button>&nbsp;
              <a-button size="small" class="select-sty1">确认</a-button>&nbsp;
              <a-button size="small" class="select-sty2">取消</a-button>
            </a-menu-item>
          </a-menu>
        </a-dropdown>
      </a-form-item>

      <a-form-item label="处理时间">
        <!-- <a-range-picker @change="onChange1" :showTime="{defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')]}" format="YYYY-MM-DD HH:mm:ss"></a-range-picker> -->
        <DateRange class="date-range" :showTime="true" title="" @change="changeDate1"/>
      </a-form-item>
      <a-form-item label=" 会员组" style="margin-left:10px;">
        <a-select class="sSelect2" v-decorator="['userGroupName']">
          <a-select-option value>全部</a-select-option>
          <a-select-option
            v-for="(item, index) in init.allUserGroup"
            :value="item.groupName"
            :key="index"
          >{{item.groupName}}</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="会员账号" style="margin-left:10px;">
        <a-input class="w160" v-decorator="['userName']"/>
      </a-form-item>

      <a-form-item label="会员姓名" style="margin-left:10px;">
        <a-input v-decorator="['realName']"/>
      </a-form-item>
      <a-form-item label="提款金额" style="margin-left:10px;margin-right:10px;">
        <a-input-group compact>
          <a-input
            v-number="true"
            v-decorator="['minAmount']"
            style="width: 100px; text-align: center"
            placeholder="最小金额"
          />
          <a-input
            style="width: 30px; border-left: 0; pointer-events: none; backgroundColor: #fff"
            placeholder="~"
            disabled
          />
          <a-input
            v-number="true"
            v-decorator="['maxAmount']"
            style="width: 100px; text-align: center; border-left: 0"
            placeholder="最大金额"
          />
        </a-input-group>
      </a-form-item>
      <a-form-item label="每页条数">
        <a-input class="w60" v-decorator="['pageSize']"/>
      </a-form-item>

      <a-form-item style="margin-left:10px;">
        <a-button type="primary" html-type="submit" :loading="init.loading">查询</a-button>
      </a-form-item>
    </a-form>

    <!-- <div class="total-count">
      <p class="report-order-text">
        本页财务统计：
        <span class="g-red bold">{{$tools.toFixed(totalData.currentPageTotal)}}</span>&nbsp;
        全部财务统计：
        <span class="g-yellow bold">{{$tools.toFixed(totalData.totalAmount)}}</span>
      </p>
      <div class="g-red">*打码核查利用用户名在【打码核查】页面进行查询&nbsp;&nbsp;*财务核查利用用户名在【财务核查】页面进行查询</div>
    </div>-->
    <div class="total-data">
      <ul class="total-data-item">
        <li>合计</li>
        <li class="g-green">订单金额：{{totalData.totalWithdrawAmount || '0.00'}}（{{totalData.totalWithdrawCount || '0'}}笔）</li>
        <li class="g-purple">出款成功：{{totalData.totalSuccessWithdrawAmount || '0.00'}}（{{totalData.totalSuccessWithdrawCount || '0'}}笔）</li>
        <li class="g-green">出款失败：{{totalData.totalFailWithdrawAmount || '0.00'}}（{{totalData.totalFailWithdrawCount || '0'}}笔）</li>
        <li class="g-red">帐变异常：{{totalData.totalErrorWalletChangeAmount || '0.00'}}（{{totalData.totalErrorWalletChangeCount || '0'}}笔）</li>
      </ul>
      <a-button type="primary" @click.prevent="exportExcel">导出Excel</a-button>
    </div>

    <div class="page-under-table">
      <a-table
        class="mytable"
        bordered
        :key="table.key"
        :rowKey="(e,i)=>i"
        :loading="init.loading"
        :columns="table.columns"
        :dataSource="table.dataSource"
        :pagination="table.pagination"
        @change="changePagination"
      >
        <!-- 头部 slot -->
        <template slot="group">
          提款时间
          <br>处理时间
        </template>
        <template slot="transitionNoTitle">
          系统订单号<br/>
          第三方订单号
        </template>
        <template slot="user">
          会员账号
          <br>会员组
          <br>VIP等级
        </template>
        <template slot="realName">会员姓名</template>
        <!-- body slot -->
        <template slot="transactionNo" slot-scope="text,record">
          {{record.transactionNo}}
          <br>
          {{record.thirdOrderNo ? record.thirdOrderNo : '--'}}
        </template>
        <template slot="member" slot-scope="text, record">
          <span>{{record.userName}}</span>
          <br>
          <span>{{record.userGroupName}}</span>
          <br>
          <span>VIP{{ (record.userVipLevel || record.userVipLevel == 0) ? record.userVipLevel : '--'}}</span>
        </template>
        <template slot="withdrawAmount" slot-scope="text, record">
          <span v-html="setAmountColor(record.withdrawAmount)"></span>
        </template>
        <template slot="nameAndRemark" slot-scope="text, record">
          <p>{{record.realName ? record.realName : '--'}}</p>
          <p class="remark">
            备注:
            <span class="g-yellow">{{record.userRemark ? record.userRemark : '--'}}</span>
          </p>
        </template>
        <template slot="status" slot-scope="text, record">
          <span :class="`status${record.status}`">{{ getStatusById(record.status) }}</span>
        </template>
        <template slot="reviewRemark" slot-scope="text, record">
          <p class="max150">{{record.remark ? record.remark : record.status == 1 ? '审核通过' : ''}}</p>
        </template>
        <template slot="operationId" slot-scope="text, record">
          <a-button type="primary" size="small" @click="toView(record)">详情</a-button>
        </template>
      </a-table>
    </div>
  </section>
</template>

<script>
import Vue from "vue";
import moment from "moment";
import { Component, InjectComponents, Lifecycle, Watch } from "vue-decorators";
import CheckPayoutOrder from "./CheckPayoutOrder"
import { getUnit, getColor } from "@/util/helper"
import DateRange from "@/components/date-range/DateRange"

/** 配置内置初始化数据源 */
const dsstore = {
  // [key: String]: 'url'
  // [key: String]: { url: String, value: [], params: {} }
  // key 变量名称，使用this.dsstore.变量名称获取值
  // value: 初始化值，默认空数组
  // params: 内置查询条件
  // 用于内置外部接口数据字典
  /** 出款方式 */
  //thirdPayments: { url: '/config-admin-api/thirdPayment/queryPageThirdPayment', params: { pageNo: 1, pageSize: 1000} }
  thirdPayments: { url: 'config-admin-api/thirdPayment/queryThirdPaymentIdAndNameList' }
}


@Component({ formOptions: "id", dsstore, methods: { moment } })
@InjectComponents({ CheckPayoutOrder, DateRange })
export default class OrderForPayment extends Vue {
  timer = null;
  table = {
    key: 1,
    columns: [
      { scopedSlots: { title: "transitionNoTitle", customRender: "transactionNo" } },
      { dataIndex: "userAccount", scopedSlots: { title: "user", customRender: "member" } },
      { dataIndex: "realName", scopedSlots: { title: 'realName', customRender: 'nameAndRemark' } },
      { title: "提款时间", dataIndex: "createTime" },
      { title: "提款金额", scopedSlots: { customRender: 'withdrawAmount' } },
      { title: "提款银行", dataIndex: "bankName" },
      { title: "处理人", dataIndex: "adminName" },
      { title: "处理时间", dataIndex: "handleTime" },
      { title: "出款方式", dataIndex: "thirdPaymentName" },
      { title: "订单状态", dataIndex: "status", scopedSlots: { customRender: "status" } },
      { title: "审核备注", scopedSlots: { customRender: "reviewRemark"} },
      { title: "操作", dataIndex: "operation", scopedSlots: { customRender: "operationId" } },
    ],
    selectedRowKeys: [],
    rowSelection: {
      getCheckboxProps(record) {
        return ({ props: { disabled: record.status == 0 || record.status == 1 } })
      },
      onChange: (selectedRowKeys, selectedRows) => {
        this.table.selectedRowKeys = selectedRows.map(e => e.id);
      },
    },
    dataSource: [],
    pagination: { total: 0, current: 1, pageSize: 10 }
  };

  totalData = {};

  init = {
    loading: false,
    modalShow: false,
    query: { pageNo: 1, pageSize: 10, createTimeStart: "", createTimeEnd: "", handleTimeStart: "", handleTimeEnd: "", operateType: 3 },
    orderStatus: [{ value: '-2', name: '待处理' }, { value: '-1', name: '处理中' }, { value: '0', name: '出款失败' }, { value: '1', name: '出款成功' }, {value: '2', name: '帐变异常'}],
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
    isRefresh: false
  }

  @Lifecycle mounted() {
    this.setInitialChecked();
    this.getList();
    this.getUserGroup();
    this.getAllBanks();
    this.queryAllVipList();
  }

  cancelSelected() {
    this.init.vipText = '';
    this.init.selectedVip = [];
    this.init.viplist.forEach(item => {
      item.checked = false;
    });
  }

  async queryAllVipList() {
    const res = await this.$service.fetch('/config-admin-api/vipLevelConfig/queryAllVipLevelConfig');
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.init.viplist = res.data.map(item => ({ ...item, checked: false }));
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
    selected.forEach(item => {
      txt += ',' + item.bankName
    });
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

  requestParam = {};

  async exportExcel() {
    const res =  await this.$service.download('/lottery-admin-api/withdrawRecord/exportWithdrawRecord', this.requestParam);
    if (res.code !== 1) return res.message && this.$message.error(res.message);
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
    return this.init.orderStatus.find(item => item.value == value) ?.name;
  }

  // 设定表单初始值
  setInitialChecked() {
    this.vform.setValue('bankId', '');
    this.vform.setValue('status', '');
    this.vform.setValue('userGroupName', '');
    this.vform.setValue('pageSize', this.init.query.pageSize);
    this.vform.setValue('thirdPaymentId', '');
  }

  setAmountColor(amount) {
    if (!amount) return amount;
    amount = String(amount);
    const arr = amount.split(/\./);
    //let unit = getUnit(arr[0] && arr[0].length);
    let color = getColor(arr[0] && arr[0].length);
    return `<span class="${color} bold">${amount}</span>`;
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

  changeDate1(start, end, datestring, type) {
    if (type === "start") {
      this.init.query.handleTimeStart = datestring
    } else {
      this.init.query.handleTimeEnd = datestring
    }
  }

  resetPagination() {
    this.table.pagination.current = 1;
    this.init.query.pageNo = 1;
    this.table.key = Math.random();
  }

  changePagination(pagination) {
    this.table.pagination.current = pagination.current;
    this.init.query.pageNo = pagination.current;
    this.table.key = Math.random();
    this.getList();
  }


  async getList(refresh) {
    if (refresh) this.resetPagination();
    const form = await this.vform.validate();
    const values = this.$trimValues(form.values);
    const params = Object.assign(this.init.query, values);
    const requestParams = Object.assign(params, {
      bankIdList: this.init.selectedBanks,
      userVipLevelList: this.init.selectedVip,
      // 出款完成
      isPass: 1
    });
    
    this.requestParam = requestParams;
    this.init.loading = true;
    const res = await this.$service.fetch('/lottery-admin-api/withdrawRecord/queryPageWithdrawRecord', requestParams);
    this.init.loading = false;

    if (res.code !== 1) return res.message && this.$message.error(res.message);
    if (res.code === 1 && res.data ?.records instanceof Array) {
      this.table.dataSource = res.data.records;
      this.table.pagination.total = res.data ?.totalCount;
      this.table.pagination.pageSize = +res.data.pageSize || 10;
    } else {
      this.table.dataSource = [];
      this.table.pagination.total = 0;
    }
    //this.getTotal(params);
    this.getSummary(params);
  }


  async toView(d) {
    d.statusStr = this.getStatusById(d.status);
    const res = await this.$modal2(require("./PaymentFinishForm.vue").default, d);
    if (!res.closed) return;
  }

  async getSummary(params) {
    const res = await this.$service.fetch("/lottery-admin-api/withdrawRecord/queryPageWithdrawRecordSummary", params);
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.totalData = res.data;
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

.dropdown-btns {
  background: #fff!important;
}
.dropdown-link {
  position: relative;
  .dropdown-input {
    width: 260px;
  }
  .dropdown-input1 {
    width: 180px;
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
  background: transparent;
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

.mytable {
  .status0 {
    color: #ff0000;
  }
  .status1 {
    color: #00cc33;
  }
}
.max150 {
  max-width: 150px;
}
.myform {
  /deep/ .ant-form-item-label {
    min-width: 70px;
  }
}

.date-range /deep/ {
  .ant-form-item {
    margin-right: 0;
  }
}

.total-data {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
  align-items: center;
  margin-top: 20px;
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