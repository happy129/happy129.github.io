<template>
  <div class="page-container-wrap">
    <a-form :form="vform" layout="inline"  @submit.prevent="getList(true)">
      <a-form-item label="回调时间">
        <a-range-picker @change="onChange" :showTime="true" format="YYYY-MM-DD HH:mm:ss"></a-range-picker>
      </a-form-item>

      <a-form-item label="出款金额" style="margin-left:10px;margin-right: 10px;">
        <a-input-group compact>
          <a-input v-number="true"  v-decorator="['minAmount']"  style="width: 100px; text-align: center" placeholder="最小金额" />
          <a-input style="width: 30px; border-left: 0; pointer-events: none; backgroundColor: #fff" placeholder="~" disabled />
          <a-input v-number="true" v-decorator="['maxAmount']" style="width: 100px; text-align: center; border-left: 0" placeholder="最大金额" />
        </a-input-group>
      </a-form-item>

      <a-form-item label="订单状态">
        <a-select v-decorator="['status']" style="width: 80px" :dropdownMatchSelectWidth="false">
          <a-select-option :value="''">全部</a-select-option>
          <a-select-option v-for="(item, index) in init.orderStatus" :key="index" :value="item.value">{{item.name}}</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="银行" style="margin-left:10px;">
        <a-select v-decorator="['bankId']"  style="width: 120px" :dropdownMatchSelectWidth="false">
          <a-select-option :value="''">全部</a-select-option>
          <a-select-option v-for="(item, index) in init.banks" :key="index" :value="item.bankId">{{item.bankName}}</a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="订单号" style="margin-left:10px;margin-right:10px;">
         <a-input v-decorator="['transactionNo']" />
      </a-form-item>

      <a-form-item label="会员账号" style="margin-right:10px;">
         <a-input v-decorator="['userName']" />
      </a-form-item>

      <a-form-item label="商户名称" style="margin-right:10px;">
        <a-input v-decorator="['merchantCode']" />
      </a-form-item>

      <a-form-item label="商户号" style="margin-right:10px;">
        <a-input v-decorator="['merchantName']" />
      </a-form-item>

      <a-form-item>
         <a-button type="primary" html-type="submit" :loading="init.loading">查询</a-button>
      </a-form-item>
    </a-form>

    <div class="page-under-table">
      <a-button type="primary" size="small" @click="bitch('success')">批量成功</a-button>&nbsp;
      <a-button type="primary" size="small" @click="bitch('fail')">批量失败</a-button>&nbsp;
      <!-- <a-button type="primary" size="small">导出</a-button> -->
    </div>

    <div class="total-count">
      <p class="report-order-text">
        本页财务统计：
        <span class="g-red bold">{{$tools.toFixed(totalData.currentPageTotal)}}</span>&nbsp;
        全部财务统计：
        <span class="g-yellow bold">{{$tools.toFixed(totalData.totalWithdrawAmount)}}</span>
      </p>
      <div class="g-red">*打码核查利用用户名在【打码核查】页面进行查询&nbsp;&nbsp;*财务核查利用用户名在【财务核查】页面进行查询</div>
    </div>

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
      <template slot="first"> <p>会员账号</p> <p>订单号</p> <p>回调时间</p> </template>
      <template slot="second"> <p>商户名称</p> <p>商户号</p> </template>
      <template slot="third"> <p>出款银行</p> <p>出款卡号</p> <p>持卡人</p> </template>
      <template slot="one" slot-scope="text,record">
        <span>{{record.userName}}</span><br/>
        <!-- <a href="javascript:;" class="g-blue bold" @click="showPayoutOrder(record)">{{record.transactionNo}}</a><br/> -->
        <span>{{record.transactionNo}}</span><br/>
        <span>{{record.notifyTime}}</span>
      </template>
      <template slot="two" slot-scope="text,record">
        <span>{{record.merchantName}}</span><br/>
        <span>{{record.merchantCode}}</span>
      </template>
      <template slot="three" slot-scope="text,record">
        <p>银行：{{record.bankName}}</p>
        <p>姓名：{{record.realName}}</p>
        <p>入款卡号：{{record.cardNo}}</p>
      </template>
      <template slot="four" slot-scope="text,record"> 
        <a-button size="small" @click="queryById(record)">查看</a-button> 
      </template>
      <template slot="five" slot-scope="text,record">
        {{ getStatusById(record.status) }}
      </template>
      <template slot="six" slot-scope="text,record"> 
        <a-button type="primary" size="small" @click="doOperationById(record, 'success')">成功</a-button>&nbsp;
        <a-button type="primary" size="small" @click="doOperationById(record, 'fail')">失败</a-button> 
      </template>
    </a-table>

    <a-modal title="出款审核"  v-model="init.modalShow" :footer="null" :destroyOnClose="true" :width="540" :maskClosable="false">
      <CheckPayoutOrder @close="init.modalShow=false" :id="init.orderId"/>
    </a-modal>  

  </div>
</template>

<script>
import Vue from "vue";
import moment from "moment";
import { Component, InjectComponents, Lifecycle, Watch } from "vue-decorators";
import CheckPayoutOrder from "./CheckPayoutOrder"

@Component({ formOptions: "id" })
@InjectComponents({ CheckPayoutOrder })
export default class ThirdPartyPayment extends Vue {
  table = {
    key: 1,
    columns: [
      { scopedSlots: { title: "first", customRender: "one" } },
      { scopedSlots: { title: "second", customRender: "two" }},
      { scopedSlots: { title: "third", customRender: "three" }},
      { title: "出款金额", dataIndex: "amount" },
      { title: "查看财务", scopedSlots: { customRender: "four" } },
      { title: "第三方返回信息", dataIndex: "thirdReturnInfo"},
      { title: "备注", dataIndex: "remark"},
      { title: "订单状态", scopedSlots: { customRender: "five" } },
      { title: "操作", scopedSlots: { customRender: "six" } }
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
    orderId: "",
    loading: false,
    modalShow: false,
    query: { pageNo: 1, pageSize: 10, notifyTimeStart: "", notifyTimeEnd: "", type: 1},
    orderStatus: [{ value: '-2', name: '待处理' }, { value: '-1', name: '处理中' }, { value: '0', name: '失败' }, { value: '1', name: '成功' }],
    banks: []
  };

  @Lifecycle mounted() {
    this.setInitialChecked();
    this.getList();
    this.getAllBanks();
  }

  async getAllBanks() {
    const res = await this.$service.fetch('/config-admin-api/bank/queryAllBank');
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    if (res.data instanceof Array) {
      this.init.banks = res.data;
    }
  }

  queryById(record) {
    this.$router.push(`/finance/finance-check?account=${record.userName}`);
  }

  getStatusById(value) {
    return this.init.orderStatus.find(item => item.value == value)?.name;
  }

  // 展示订单审核
  showPayoutOrder(record) {
    this.init.orderId = record?.id;
    this.init.modalShow = true;
  }

  // 设定表单初始值
  setInitialChecked() {
    this.vform.setValue('bankId', '');
    this.vform.setValue('status', '');
  }

  onChange(date, arr) {
    this.init.query.notifyTimeStart = arr[0];
    this.init.query.notifyTimeEnd = arr[1]; 
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

  async doOperationById(record, type) {
    const result = await this.$confirm({title: "确认要进行该操作吗?"});
    if (!result) return;
    const requestUrl = type === "success" ? '/lottery-admin-api/withdrawRecord/batchPassWithdrawRecord': '/lottery-admin-api/withdrawRecord/batchRejectWithdrawRecord';
    const res = await this.$service.fetch(requestUrl, { list: [record.id] });
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.$message.success(res.message);
    this.table.key = Math.random();
    this.getList(true);
  }

  // 批量成功或者失败
  async bitch(type) {
    if (!this.table.selectedRowKeys.length) {
      return this.$message.warn('请先勾选');
    }
    const result = await this.$confirm({title: "确认要进行该操作吗?"});
    if (!result) return;
    const requestUrl = type === "success" ? '/lottery-admin-api/withdrawRecord/batchPassWithdrawRecord': '/lottery-admin-api/withdrawRecord/batchRejectWithdrawRecord';
    const res = await this.$service.fetch(requestUrl, { list: this.table.selectedRowKeys });
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.$message.success(res.message);
    this.table.key = Math.random();
    this.getList(true);
    this.table.selectedRowKeys = [];
  }

  async getTotal(params) {
    const res = await this.$service.fetch('/lottery-admin-api/withdrawRecord/queryWithdrawRecordSummary', params);
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.totalData = res.data;
    this.totalData.currentPageTotal = this.table.dataSource.reduce((prev, next) => {
      return prev.amount + next.amount
    });
  }

  async getList(refresh) {
    if (refresh) this.resetPagination(); 
    const form = await this.vform.validate();
    const values = this.$trimValues(form.values);
    const params = Object.assign(this.init.query, values);

    this.init.loading = true;
    const res = await this.$service.fetch('/lottery-admin-api/withdrawRecord/queryPageWithdrawRecord', params);
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
@import "@views/admin/Pop.scss";

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
</style>