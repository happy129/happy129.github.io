<template>
  <section class="page-container-wrap">
    <a-form :form="vform" layout="inline" @submit.prevent="getList(true)">
      <a-form-item label="提款时间">
        <!-- <a-range-picker @change="onChange" :showTime="{defaultValue: [moment('00:00:00', 'HH:mm:ss'), moment('23:59:59', 'HH:mm:ss')]}"  format="YYYY-MM-DD HH:mm:ss"></a-range-picker> -->
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

      <a-form-item label="订单状态" >
        <a-select v-decorator="['status']" style="width: 120px" :dropdownMatchSelectWidth="false">
          <a-select-option value="">全部</a-select-option>
          <a-select-option value="-2">待处理</a-select-option>
          <a-select-option value="-1">处理中</a-select-option>
          <a-select-option value="3">复审中</a-select-option>
          <a-select-option value="-3">批量处理中</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="订单号" class="order-no">
        <a-input v-decorator="['transactionNo']" />
      </a-form-item>

      <a-form-item label="会员组" style="margin-left:10px;">
        <a-select class="sSelect2" v-decorator="['userGroupName']">
          <a-select-option value="">全部</a-select-option>
          <a-select-option v-for="(item, index) in init.allUserGroup" :value="item.groupName" :key="index">{{item.groupName}}</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="会员账号" style="margin-left:10px;">
        <a-input class="w120" v-decorator="['userName']" />
      </a-form-item>

      <a-form-item label="会员姓名" style="margin-left:10px;">
        <a-input class="w120"  v-decorator="['realName']" />
      </a-form-item>

      <a-form-item label="每页条数"  style="margin-left:10px;">
        <a-input class="w60" v-decorator="['pageSize']"/>
      </a-form-item>

      <a-form-item style="margin-left:10px;">
        <!-- 20099 -->
        <a-button type="primary" html-type="submit" :loading="init.loading">查询</a-button>
      </a-form-item>
    </a-form>

    <div class="page-under-table summary-data">
      <div>
        <a-button v-permission="201031" class="btn-1" type="primary" size="small" @click="batchPickUp">捡取选中</a-button>&nbsp;
        <!-- <a-button v-permission="20103"  class="btn-1 yellow-btn" size="small" @click="pickAll">捡取全部</a-button> -->
      </div>
      <div class="total-data">
        <ul class="total-data-item">
          <li>合计</li>
          <li class="g-green">订单金额：{{totalData.totalWithdrawAmount || '0.00'}}（{{totalData.totalWithdrawCount || '0'}}笔）</li>
          <li class="g-purple">待处理：{{totalData.totalWaitingWithdrawAmount || '0.00'}}（{{totalData.totalWaitingWithdrawCount || '0'}}笔）</li>
          <li class="g-green">处理中：{{totalData.totalHandlingWithdrawAmount || '0.00'}}（{{totalData.totalHandlingWithdrawCount || '0'}}笔）</li>
          <li class="g-yellow">复审中：{{totalData.totalReviewingWithdrawAmount || '0.00'}}（{{totalData.totalReviewingWithdrawCount || '0'}}笔）</li>
          <li class="g-red">批量处理中：{{totalData.totalBatchHandlingWithdrawAmount || '0.00'}}（{{totalData.totalBatchHandlingWithdrawCount || '0'}}笔）</li>
        </ul>
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
        <template slot="transactionNo" slot-scope="text,record">
          {{record.transactionNo}}
        </template>
        <template slot="time" slot-scope="text, record">
          <span>{{record.createTime}}</span><br/>
          <span>{{record.handleTime}}</span>
        </template>
        <template slot="member" slot-scope="text, record">
          <span>{{record.userName ? record.userName : '--'}}</span><br/>
          <span>{{record.userGroupName ? record.userGroupName : '--'}}</span><br/>
          <span>VIP{{ (record.userVipLevel || record.userVipLevel == 0) ? record.userVipLevel : '--'}}</span>
        </template>
        <template slot="withdrawAmount" slot-scope="text, record">
          <span v-html="setAmountColor(record.withdrawAmount)"></span>
        </template>
        <template slot="nameAndRemark" slot-scope="text, record">
          <p>{{record.realName ? record.realName : '--'}}</p>
          <p class="remark">备注:<span class="g-yellow"> {{record.userRemark ? record.userRemark : '--'}} </span></p>
        </template>
        <template slot="status" slot-scope="text, record">
          {{ getStatusById(record.status) }}
        </template>
        <template slot="cardNo" slot-scope="text, record">
          <p>{{record.bankName ? record.bankName : '--'}}</p>
          <p>{{record.cardNo}}</p>
        </template>
        <template slot="clientType" slot-scope="text, record">
          {{ $getText(record.clientType, dictionary.clientType) }}
        </template>
        <template slot="operationId" slot-scope="text, record">
          <a-button type="primary" size="small" @click="pickupSingle(record)" v-if="record.status!=-1 && record.status!=-3">捡取</a-button>
          <span v-else>{{record.adminName}}</span>
        </template>
      </a-table>

      <div class="control-refresh">
          <a-checkbox :checked="!isRefresh" @change="changeRefreshStatu">关闭自动刷新</a-checkbox>
          <a-checkbox :checked="isRefresh" @change="changeRefreshStatu">开启自动刷新</a-checkbox>
          <span>
            刷新频率<a-input class="w40 refresh-input" v-number v-model="init.refreshTime"/>秒
          </span>
          <span>
            <a-button type="primary" @click="doRefresh">确认</a-button>
          </span>
      </div>
   </div>

  <a-modal title="出款审核"  v-model="init.modalShow" :footer="null" :destroyOnClose="true" :width="540" :maskClosable="false">
    <CheckPayoutOrder @close="init.modalShow=false; getList()" :id="init.orderId"/>
  </a-modal>  

  </section>
</template>

<script>
import Vue from "vue";
import moment from "moment";
import { Component, InjectComponents, Lifecycle, Watch, State, Mutation } from "vue-decorators";
import CheckPayoutOrder from "./CheckPayoutOrder"
import { getUnit, getColor } from "@/util/helper"
import DateRange from "@/components/date-range/DateRange"

@Component({ formOptions: "id", methods: { moment }, dictionary: 'clientType,clientType2' })
@InjectComponents({ CheckPayoutOrder, DateRange })
export default class OrderForPayment extends Vue {
  timer = null;
  table = {
    key: 1,
    columns: [
      { title: "订单号",  scopedSlots: { customRender: "transactionNo" }},
      { dataIndex: "userAccount", scopedSlots: { title: "user", customRender: "member" } },
      { dataIndex: "realName", scopedSlots: { title: 'realName', customRender: 'nameAndRemark' } },
      { title: "提款时间", dataIndex: "createTime" },
      { title: "提款金额", scopedSlots: { customRender: 'withdrawAmount'} },
      { title: "提款银行", dataIndex: "bankName" },
      { title: "来源",  scopedSlots: { customRender: 'clientType' } },
      { title: "订单状态", scopedSlots: { customRender: "status" }},
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
    query: { pageNo: 1, pageSize: 10, createTimeStart: "", createTimeEnd: "", handleTimeStart: "", handleTimeEnd: "", isReview: "", operateType: 1},
    orderStatus: [
      { value: '-3', name: '批量待处理'}, 
      { value: '-2', name: '待处理' }, 
      { value: '-1', name: '处理中' }, 
      { value: '0', name: '失败' }, 
      { value: '3', name: '复审中'},
      { value: '1', name: '成功' }
    ],
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

  @State(state => state.refreshTime) refreshTime;
  @State(state => state.isRefresh) isRefresh;
  @Mutation('setRefreshTime') setRefreshTime;
  @Mutation('setRefresh') setRefresh;

  @Watch('init.refreshTime', {immediate: true}) changeRefreshTime(news) {
    if (news != "") {
      this.setRefreshTime(news);
    }
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

  @Lifecycle mounted() {
    this.setInitialChecked();
    this.getList();
    this.getUserGroup();
    this.getAllBanks();
    this.queryAllVipList();
    if (this.isRefresh) {
      this.init.refreshTime = this.refreshTime;
      this.doRefresh();
    }
  }

  @Lifecycle beforeDestroy() {
    clearInterval(this.timer);
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

  changeRefreshStatu() {
    this.setRefresh(!this.isRefresh);
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

  // 点击自动刷新， 或者停止
  doRefresh() {
    if (this.isRefresh) {
      if (this.refreshTime < 5) this.refreshTime = 5;
      this.$message.success(`已开启自动刷新，每间隔${this.init.refreshTime}秒会自动刷新!`);
      clearInterval(this.timer);
      this.timer = setInterval(() => {
        this.getList(false, true);
      }, parseInt(this.init.refreshTime, 10) * 1000);
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

  // 设定表单初始值
  setInitialChecked() {
    this.vform.setValue('bankId', '');
    this.vform.setValue('status', this.$route.query.status||'');
    this.vform.setValue('userGroupName', '');
    this.vform.setValue('pageSize', this.init.query.pageSize);
  }

  setAmountColor(amount) {
    if (!amount) return amount;
    amount = String(amount);
    const arr = amount.split(/\./);
    //let unit = getUnit(arr[0] && arr[0].length);
    let color = getColor(arr[0] && arr[0].length);
    return `<span class="${color} bold">${amount}</span>`;
  }
  
  onChange(date, arr) {
   this.init.query.createTimeStart = arr[0];
   this.init.query.createTimeEnd = arr[1]; 
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

  async pickAll() {
    const form = await this.vform.validate();
    const values = this.$trimValues(form.values);
    const params = Object.assign(this.init.query, values);
    if (!await this.$confirm({title: '确认要捡取全部订单？'})) return;
    const res = await this.$service.fetch('/lottery-admin-api/withdrawRecord/pickupAllWithdrawRecord', params);
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.$message.success(`操作成功,共捡取了${res.data?.pickedUpNum}个订单`);
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
     // 捡取数量为0，说明捡取失败了，需要刷新页面
    if (res.data?.pickedUpNum === 0) {
      this.$message.warning("该订单已被捡取");
    } else {
      this.$message.success(`操作成功,共捡取了${res.data.pickedUpNum}个订单`);
    }
    
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
    if (res.data?.pickedUpNum === 0) {
      this.$message.error("该订单已被捡取");
    } else {
      this.$message.success(res.message);
    }
    this.getList();
  }

  async getTotal(params) {
    const res = await this.$service.fetch('/lottery-admin-api/withdrawRecord/queryPageWithdrawRecordSummary', params);
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.totalData = res.data;
  }

  async getList(refresh, isLoading) {
    if (refresh) this.resetPagination(); 
    const form = await this.vform.validate();
    const values = this.$trimValues(form.values);
    const params = Object.assign(this.init.query, values);

    if (parseFloat(form.values.maxAmount) < parseFloat(form.values.minAmount)) {
      return this.$message.error("最小金额不能大于最大金额");
    }

    if (!isLoading) this.init.loading = true;
    const res = await this.$service.fetch('/lottery-admin-api/withdrawRecord/queryPageWithdrawRecord', Object.assign(params, {
      bankIdList: this.init.selectedBanks,
      userVipLevelList: this.init.selectedVip
    }));
    if (!isLoading) this.init.loading = false;

    if (res.code !== 1) return res.message && this.$message.error(res.message);
    if (res.code === 1 &&  res.data?.records instanceof Array) {
      this.table.dataSource = res.data.records;
      this.table.pagination.total = res.data?.totalCount;
      this.table.pagination.pageSize = res.data.pageSize;
    } else {
      this.table.dataSource = [];
      this.table.pagination.total = 0;
    }
    
    this.getTotal(params);
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
  width: 260px;
  height: 160px;
  overflow-y: auto;
}
.btn-1 {
  padding: 5px 8px;
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
.order-no /deep/{
  .ant-form-item-label {
    width: 68px;
  }
}
.date-range /deep/ {
  .ant-form-item {
    margin-right: 0;
  }
}
.summary-data {
  display: flex;
  align-items:  center;
  .total-data {
    display: flex;
    justify-content: space-between;
    margin-left: 10px;
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
}
</style>