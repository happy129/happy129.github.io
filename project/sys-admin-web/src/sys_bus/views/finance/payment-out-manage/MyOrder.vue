<template>
  <section class="page-container-wrap">
    <a-form :form="vform0" layout="inline" @submit.prevent="getList(true)">
      <a-form-item label="提款时间">
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

      <a-form-item label="会员组" class="label-member">
        <a-select class="sSelect2" v-decorator="['userGroupName']">
          <a-select-option value="">全部</a-select-option>
          <a-select-option v-for="(item, index) in init.allUserGroup" :value="item.groupName" :key="index">{{item.groupName}}</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="订单状态" style="margin-left:10px;">
        <a-select v-decorator="['status']" style="width: 120px" :dropdownMatchSelectWidth="false">
          <a-select-option value="-1">处理中</a-select-option>
          <a-select-option value="-3">批量处理中</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="订单号" style="margin-left:10px;margin-right:10px;">
        <a-input v-decorator="['transactionNo']" />
      </a-form-item>

      <a-form-item label="已使用">
        <a-select class="w120" v-decorator="['minUseTimes']" :dropdownMatchSelectWidth="false">
          <a-select-option value="">全部</a-select-option>
          <a-select-option value="0">0&lt;已使用</a-select-option>
          <a-select-option value="5">5&lt;已使用</a-select-option>
          <a-select-option value="10">10&lt;已使用</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="每页条数" style="margin-left: 10px;">
        <a-input class="w60" v-decorator="['pageSize']"/>
      </a-form-item>

      <a-form-item style="margin-left:10px;" v-permission="20114">
        <a-button type="primary" html-type="submit" :loading="init.loading">查询</a-button>
      </a-form-item>
    </a-form>
    <!-- <a-button class="btn-1 yellow-btn" v-permission="201182" v-show="false" size="small" @click="bitchSuccessOrFail('fail')">选中出款失败</a-button> -->
    <div class="page-under-table export-wrapper">
      <div class="nav-item">
        <a-button type="primary" v-permission="201181" @click="bitchSuccessOrFail('success')">选中出款成功</a-button> &nbsp;
      </div>
      <div class="nav-item1">
        <ul class="nav-item-total">
          <li>选中数据</li>
          <li>提款金额：<span class="g-green bold">{{ calc.totalWithDrawAmount }}</span>元</li>
          <li>提款人数：<span class="g-yellow bold">{{ calc.totalPersonCount }}</span>人</li>
          <li>提款笔数：<span class="g-blue bold">{{ calc.totalWithDrawCount }}</span>笔</li>
        </ul>
        <div class="nav-item-0">
          <div class="nav-item1-1">
            <a-form layout="inline" :form="vform1">
              <a-form-item label="导出总金额小于">
                <a-input v-decorator="['amount', {rules: [{ required: true, message: '请输入金额限制' }]} ]"/>
              </a-form-item> 
            </a-form>
          </div>  
          <div class="nav-item-2">
            <a-checkbox :checked="isUniqueName" @change="(e) => isUniqueName = e.target.checked">去除重名</a-checkbox>
          </div>
        </div>
      </div>
      <div class="nav-item2">
        <a-button type="primary"  v-permission="20117" @click="exportData('txt')">导出txt</a-button>
        <a-button type="primary"  v-permission="201186" @click="exportData('excel')">导出excel</a-button>
      </div>
    </div>

   <div class="page-under-table">
      <a-table class="mytable" 
        bordered 
        :key="table.key"
        :rowKey="(e,i)=>i" 
        :loading="init.loading" 
        :columns="table.columns" 
        :dataSource="table.dataSource" 
        :pagination="table.pagination" 
        :rowSelection="table.rowSelection"
        @change="changePagination"
      >
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
          <p class="remark">备注:<span class="g-yellow">{{record.userRemark ? record.userRemark : '--'}} </span></p>
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
          {{ record.clickedButton ?  record.clickedText : getStatusById(record.status) }}
        </template>

        <template slot="operationId" slot-scope="text, record">
          <div class="payment-control">
            <div class="payment-control-left">
              <p>
                <a-button :disabled="record.clickedButton" class="green-btn-1" size="small" v-permission="201183" @click="doSuccessOrFail('success', record.id)">成功</a-button>
                <a-button :disabled="record.clickedButton" class="yellow-btn-1" size="small" v-permission="201184"  @click="reviewOrder(record.id, 'fail')">失败</a-button>
              </p>
              <p class="mt10">
                <a-button :disabled="record.clickedButton" class="blue-btn-1" size="small" v-permission="20115" @click="$router.push(`/finance/finance-check?account=${record.userName}`)">财务核查</a-button>
                <a-button :disabled="record.clickedButton" class="blue-btn-1" size="small" v-permission="201185" @click="reviewOrder(record.id, 'review')">提交复审</a-button>
              </p>
            </div>
            <div class="payment-control-right">
              <p v-for="(item, index) in init.thirdPaymentList" :key="index">
                <a-button :disabled="record.clickedButton" class="yellow-btn-2" size="small" @click="noticeThirdPay(item.id, record.id, item.paymentChannelName)">{{item.paymentChannelName}}</a-button>
              </p>
            </div>
          </div>
        </template>
      </a-table>
   </div>

  <a-modal title="出款审核"  v-model="init.modalShow" :footer="null" :destroyOnClose="true" :width="440" :maskClosable="false">
    <ReviewSingleOrder :orderType="init.modalType" :id="init.orderId" @close="(code, id, type) => { this.init.modalShow=false;  this.modifyDataStatus(code, id, type) }" @cancel="init.modalShow=false;"/>
  </a-modal>  

  </section>
</template>

<script>
import Vue from "vue";
import moment from "moment";
import { Component, InjectComponents, Lifecycle, Watch } from "vue-decorators";
import ReviewSingleOrder from "./ReviewSingleOrder"
import { getUnit, getColor } from "@/util/helper"
import VueClipboard from 'vue-clipboard2'
import DateRange from "@/components/date-range/DateRange"

Vue.use(VueClipboard);

@Component({ formOptions: { vform0: 'id', vform1: 'id' }, methods: { moment } })
@InjectComponents({ ReviewSingleOrder, DateRange })
export default class MyOrder extends Vue {
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
      { title: "状态", scopedSlots: { customRender: "status" }},
      { title: "操作", dataIndex: "operation", scopedSlots: { customRender: "operationId" } },
    ],
    selectedRowKeys: [],
    rowSelection: {
      getCheckboxProps(record) {
        return ({ props: { disabled: record.clickedButton != false }})
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
    query: { pageNo: 1, pageSize: 10, createTimeStart: "", createTimeEnd: "", handleTimeStart: "", handleTimeEnd: "", myOrder: 1, minUseTimes: 0, maxUseTimes: "", operateType: 2},
    orderStatus: [{ value: '-3', name: '批量处理中' }, { value: '-2', name: '待处理' }, { value: '-1', name: '处理中' }, { value: '0', name: '失败' }, { value: '1', name: '成功' }],
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
    // 弹窗类型, fail代表失败订单, review 代表复审订单
    modalType: 'review'
  };

  calc = {
    totalWithDrawAmount: "0.00",
    totalPersonCount: 0,
    totalWithDrawCount: 0
  };

  @Lifecycle mounted() {
    this.setInitialChecked();
    this.getList();
    this.getUserGroup();
    this.getAllBanks();
    this.queryAllVipList();
    this.getAllThirdPayment();
  }

  // 选择要导出的数据
  exportSelectedArray = [];
  // 是否去除重名
  isUniqueName = false;

  @Watch('table.selectedRowKeys', { immediate: true }) calcAmount(news) {
    //if (news && news.length === 0) return;
    // 筛选选中的数据
    const selectedArray = [];

    this.table.dataSource.forEach(item => {
      for (let i = 0; i < news.length; i++) {
        if (news[i] === item.id) {
          selectedArray.push(item);
          break;
        }
      }
    });

    //if (selectedArray.length) {
      let amountTotal = 0;
      selectedArray.forEach(({ withdrawAmount }) => {
        const amount = isNaN(withdrawAmount) ? 0 : withdrawAmount * 1;
        amountTotal += amount
      });

      this.calc.totalWithDrawAmount = amountTotal.toFixed(2);
      this.calc.totalPersonCount = selectedArray.length;
      this.calc.totalWithDrawCount = selectedArray.length;
    //}

    this.exportSelectedArray = selectedArray;
  }

  // 导出数据excel或者txt文件
  async exportData(type) {
    if (this.exportSelectedArray.length === 0) return this.$message.warning('请先勾选要导出的数据');

    const form = await this.vform1.validate();
    if (form.errors) return

    const filterAmount = form.values.amount * 1;
    if (isNaN(filterAmount)) return this.$message.error('金额必须为数字');

    const filterArray = this.exportSelectedArray.filter(item => {
      const withdrawAmount = isNaN(item.withdrawAmount) ? 0 : item.withdrawAmount * 1;
      return withdrawAmount < filterAmount;
    });

    if (!filterArray.length) return this.$message.warning('无满足条件的数据！');

    // 对筛选出的数据进行格式处理
    const list = filterArray.map(item => ({ id: item?.id, userId: item?.userId }) );

    const params =  {
      isRemoveDuplicates: this.isUniqueName == true ?  1 : 0,
      list: list
    };

    const res = await this.$service.fetch("/lottery-admin-api/withdrawRecord/queryExportData", params);

    if (res.code !== 1) return  res.message && this.$message.error(res.message);
    // 查询接口无数据返回，提示信息
    if (res.data instanceof Array && res.data.length === 0) return this.$message.warning('无满足条件的数据！');

    if (res.code == 1 && res.data instanceof Array) {
      this.$emit('showExportPage', res.data, type);
    }
  }

  copyText(text) {
    this.$copyText(text).then(() => {
      this.$message.success('复制成功')
    });
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

    this.init.thirdPaymentList = res.data?.records.filter(item => item?.isEnabled == 1 && item?.isEnabledForcedly == 1);
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

  // 复审订单
  reviewOrder(id, type) {
    this.init.modalShow = true;
    this.init.modalType = type;
    this.init.orderId = id;
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

    // this.getList();
    this.table.dataSource.forEach(item => {
      if (item.id === withdrawRecordId) {
        item.clickedButton = true;
        item.clickedText = "出款成功"
      }
    });

  }

  // 设定表单初始值
  setInitialChecked() {
    this.vform0.setValue('bankId', '');
    this.vform0.setValue('status', '-1');
    this.vform0.setValue('userGroupName', '');
    this.vform0.setValue('pageSize', this.init.query.pageSize);
    this.vform0.setValue('minAmount', '');
    this.vform0.setValue('minUseTimes', '');
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

  onChange1(date, arr) {
    this.init.query.handleTimeStart = arr[0];
    this.init.query.handleTimeEnd = arr[1];
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
    // this.getList();

    this.table.dataSource.forEach(item => {
      if (item.id === id) {
        item.clickedButton = true;
        item.clickedText = "出款成功"
      }
    });

  }

  modifyDataStatus(code, id, type) {
    if (code == 1 && id != null) {
      this.table.dataSource.forEach(item => {
        if (item.id == id) {
          if (type == "fail") {
            item.clickedText = "出款失败"
          } else {
            item.clickedText = "已提交复审"
          }
          item.clickedButton = true;
        }
      });
    }
  }

  // 批量设置为成功或者失败
  async bitchSuccessOrFail(type) {
    if (!this.table.selectedRowKeys.length) return this.$message.warning("请先勾选");
    const result = await this.$confirm({title: `确认将所有选中的订单出款${type === 'success' ? '成功' : '失败'}`});
    if (!result) return;
    const requestUrl = type === "success" ? '/lottery-admin-api/withdrawRecord/batchPassWithdrawRecord': '/lottery-admin-api/withdrawRecord/batchRejectWithdrawRecord';
    let res = {}; 
    if (type === "success") {
      res = await this.$service.fetch(requestUrl, { list: this.table.selectedRowKeys });
    } else {
      // 后台修改了数据结构
      const ids = this.table.selectedRowKeys.map(v => ({id: v, remark: '批量出款失败'}));
      res = await this.$service.fetch(requestUrl, { list: ids });
    }
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
    const form = await this.vform0.validate();
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
      this.table.dataSource = res.data.records.map(item => {
        // 产品需求， 点击成功或者失败按钮，页面不刷新，直接改状态
        item.clickedButton = false;
        item.clickedText = "";
        return item;
      });
      this.table.pagination.pageSize = res.data?.pageSize;
      this.table.pagination.total = res.data?.totalCount;
    } else {
      this.table.dataSource = [];
      this.table.pagination.total = 0;
    }
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
  padding: 4px 8px;
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
  width: 80px;
  color: #009688;
  border: 1px solid #009688;
  margin-right: 10px;

  &:hover {
    background-color: #009688;
    color: #fff;
  }

  &[disabled] {
		color: #999 !important;
    border-color: #999 !important;
    
    &:hover {
      background-color: #f5f5f5;
    }
	}
}

.yellow-btn-1 {
  width: 80px;
  color: #ff9900;
  border: 1px solid #ff9900;
  
  &:hover {
    background-color: #ff9900;
    color: #fff;
  }

  &[disabled] {
		color: #999 !important;
    border-color: #999 !important;
    
     &:hover {
      background-color: #f5f5f5;
    }
	}
}

.blue-btn-1 {
  width: 80px;
  color: #478fca;
  border: 1px solid #478fca;
  box-sizing: border-box;
  margin-right: 10px;
  &:hover {
    background-color: #478fca;
    color: #fff;
  }

  &[disabled] {
		color: #999 !important;
    border-color: #999 !important;
    
    &:hover {
      background-color: #f5f5f5;
    }
	}
}

.green-btn {
  color: #009688;
  border: 1px solid #009688;
  &:hover {
    background-color: #009688;
    color: #fff;
  }

  &[disabled] {
		color: #999 !important;
    border-color: #999 !important;
    
     &:hover {
      background-color: #f5f5f5;
    }
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

  &[disabled] {
		color: #999 !important;
    border-color: #999 !important;
    
     &:hover {
      background-color: #f5f5f5;
    }
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

.nav-item2-btn1 {
  background-color: #ffba65;
  border: 1px solid #ffba65;
  color: #fff;
}

.export-wrapper {
  display: flex;
  align-items: center;

  .nav-item1 {
    display: flex;
    align-items: center;

    .nav-item-total {
      display: flex;
      border-top: 1px solid #999;
      border-left: 1px solid #999;
      li {
        border-bottom: 1px solid #999;
        border-right: 1px solid #999;
        padding: 8px 16px;
        line-height: 1;
        span {
          margin-right: 5px;
        }
        &:first-child {
          background-color: #d1d1d1;
        }
      }
    }

    .nav-item-0 {
      display: flex;
      margin-left: 20px;
    }

    .nav-item1-1 /deep/{
      display: flex;
      align-items: center;

      .ant-input {
        width: 100px;
        margin-left: 10px;
      }
    }

    .nav-item-2 {
      display: flex;
      align-items: center;
      margin-left: 10px;
    }
  }

  .nav-item2 {
    button {
      margin-left: 10px;
    }
  }
}

.date-range /deep/ {
  .ant-form-item {
    margin-right: 0;
  }
}
</style>