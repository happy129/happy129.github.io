<template>
  <div class="page-container-wrap">
    <a-form :form="vform" layout="inline" @submit.prevent="getList(true)">

      <a-form-item label="会员账号" style="margin-right:10px;">
        <a-input v-decorator="['userName']" />
      </a-form-item>

      <a-form-item label="出款订单号" style="margin-right:10px;">
        <a-input v-decorator="['transactionNo']"/>
      </a-form-item>

      <a-form-item label="加款时间">
        <a-range-picker @change="onChange" :showTime="true" format="YYYY-MM-DD HH:mm:ss"></a-range-picker>
      </a-form-item>

      <a-form-item style="margin-left:10px;">
        <a-button type="primary" html-type="submit" :loading="init.loading">查询</a-button>
      </a-form-item>
    </a-form>

     <div class="total-count">
       <p class="report-order-text">
        本页财务统计：
        <span class="g-red bold">{{$tools.toFixed(totalData.currentPageTotal)}}</span>&nbsp;
        全部财务统计：
        <span class="g-yellow bold">{{$tools.toFixed(totalData.totalAmount)}}</span>
      </p>
    </div>

    <a-table class="mytable" 
      bordered 
      :rowKey="(e,i)=>i" 
      :loading="init.loading" 
      :columns="table.columns" 
      :dataSource="table.dataSource" 
      :pagination="table.pagination" 
      :rowSelection="table.rowSelection"
      @change="changePagination"
    >
        <template slot="one">
          <span>订单类型</span><br/>
          <span>加减款订单号</span>
        </template>
        <template slot="two">
          <span>金额</span><br/>
          <span>打码倍数</span>
        </template>
        <template slot="three">
          <span>帐变前</span><br/>
          <span>不可提款金额</span>
        </template>
        <template slot="four">
          <span>帐变后</span><br/>
          <span>不可提款金额</span>
        </template>
        
        <template slot="first" slot-scope="text, record">
          <p>{{ getOrderType(record.rechargeType) }}</p>
          <p>{{ record.transactionNo }}</p>
        </template>
        <template slot="second" slot-scope="text, record">
          <p>{{record.amount}}</p>
          <p>{{record.neededBetTimes}}</p>
        </template>
        <template slot="third"  slot-scope="text, record">
          <p>{{record.beforeTransactionBlockAmount}}</p>
        </template>
        <template slot="fourth"  slot-scope="text, record">
          <p>{{record.preUnwithdrawableAmount}}</p>
        </template>
     </a-table>

  </div>
</template>

<script>
import Vue from "vue";
import moment from "moment";
import { Component, InjectComponents, Lifecycle, Watch, Prop, Mutation, State, Computed  } from "vue-decorators";

@Component({ formOptions: "id" })
export default class CodeVerification extends Vue {
  @Prop({ type: String }) account;
  @Mutation('setPayoutState') setPayoutState;

  table = {
    key: 1,
    columns: [
      { title: "会员账号", dataIndex: "userName" },
      { scopedSlots: { title: "one", customRender: "first" }  },
      { scopedSlots: { title: "two", customRender: "second" }  },
      { scopedSlots: { title: "three", customRender: "third" }  },
      { scopedSlots: { title: "four", customRender: "fourth" }  },
      { title: "加款时间", dataIndex: "createTime" }
    ],
    dataSource: [],
    pagination: { total: 0, current: 1 }
  }
  totalData = {};

  init = {
    loading: false,
    modalShow: false,
    query: { pageNo: 1, pageSize: 10, createTimeStart: "", createTimeEnd: ""},
    orderStatus: [{ value: '-2', name: '待处理' }, { value: '-1', name: '处理中' }, { value: '0', name: '失败' }, { value: '1', name: '成功' }],
    orderType: [
      {value: 0, name: "汇款提交"}, {value: 1, name: "在线充值"}, {value: 2, name: "人工汇款"},
      {value: 3, name: "彩金派送"}, {value: 4, name: "返水派送"}, {value: 5, name: "其它"},
    ]
  };

  @Computed getAccount() {
    return this.$store.state.payoutstate;
  }

  @Lifecycle mounted() {
    if (this.account!=="") {
      this.vform.setValue('userName', this.getAccount?.split('_')[0]);
    }
    this.getList();
  }

  onChange(date, arr) {
   this.init.query.createTimeStart = arr[0];
   this.init.query.createTimeEnd = arr[1]; 
  }

  resetPagination() {
    this.table.pagination.current = 1;
    this.init.query.totalData = 1;
  }

  changePagination(pagination) {
    this.table.pagination.current = pagination.current;
    this.init.query.pageNo = pagination.current;
    this.getList();
  }

  getOrderType(id) {
    return this.init.orderType.find(item => item.value == id)?.name;
  }

  async getTotal(params) {
    const res = await this.$service.fetch('/lottery-admin-api/report/queryFinanceAuditSummary', params);
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.init.totalResult = res.data;
  }

  async getList(refresh) {
    if (refresh) this.resetPagination(); 
    const form = await this.vform.validate();
    const values = this.$trimValues(form.values);
    const params = Object.assign(this.init.query, values);

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