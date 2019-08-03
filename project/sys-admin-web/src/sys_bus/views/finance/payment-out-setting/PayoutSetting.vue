<template>
  <section class="payout-setting">
      <!-- <div>
        <a-button type="primary" size="small" @click="init.modalShow=true;init.modalType='add'">添加</a-button>&nbsp;
        <a-button type="primary" size="small" @click="deleteByPaymentIds">删除</a-button>
      </div> -->
      
      <a-table 
          :key="table.key"
          class="mytable" bordered :loading="init.loading" :columns="table.columns" :dataSource="table.dataSource" 
          :rowSelection="table.rowSelection" :pagination="table.pagination" :rowKey="(e, i) => i"
          @change="changePagination"
      >
        <template slot="clientType" slot-scope="text,records">
          <span>{{$getText(records.clientType, dictionary.clientType)}}</span>
        </template>
        <template slot="isEnabled" slot-scope="text,records">
          <span>{{records.isEnabled == 1 ? "启用" : "停用"}}</span>
        </template>
        <template slot="operate" slot-scope="text,records">
          <a-button v-permission="20094" type="primary" size="small" @click.prevent="showModal(records)">查询余额</a-button>&nbsp;
          <a-button v-permission="20092" type="primary" size="small" @click.prevent="showModifyModal(records)">修改</a-button>
        </template>
      </a-table>
    
      <a-modal title="修改第三方出款" v-model="init.modalShow" :footer="null" :destroyOnClose="true" :width="480" :maskClosable="false">
        <PayoutAdd @close="init.modalShow=false;getList(true)" :id="init.editId" :type="init.modalType" :paymentName="paymentName" :name="name" :paymentId="init.paymentId"/>
      </a-modal>
  </section>
</template>

<script>
import Vue from 'vue'
import { Component, Lifecycle, Prop, Watch, InjectComponents } from 'vue-decorators'
import PayoutAdd from "./PayoutAdd"

@Component({ formOptions: "id" })
@InjectComponents({ PayoutAdd })
export default class PayoutSetting extends Vue {
  table = {
    key: 1,
    columns: [
      { title: 'ID',  dataIndex: 'id'},
      { title: '出款类型', dataIndex: 'paymentTypeName'}, 
      { title: '名称', dataIndex: 'paymentName'}, 
      { title: '商户ID', dataIndex: 'merchantCode'}, 
      { title: '开始时间', dataIndex: 'useTimeStart'}, 
      { title: '结束时间', dataIndex: 'useTimeEnd'}, 
      { title: '出款限额', dataIndex: 'maxAmount'}, 
      { title: '状态', dataIndex: 'isEnabled', scopedSlots: { customRender: 'isEnabled' }}, 
      { title: '操作',  dataIndex: 'operate', scopedSlots: { customRender: 'operate' } }
    ],
    selectedRowKeys: [],
    rowSelection: {
      onChange: (selectedRowKeys, selectedRows) => {
        this.table.selectedRowKeys = selectedRows.map(e => e.paymentId);
      },
    },
    dataSource: [],
    pagination: { total: 0, current: 1 }
  };

  init = {
    query: { pageNo: 1, pageSize: 10, createTimeStart: "", createTimeEnd: "", paymentType: 20},
    loading: false,
    modalShow: false,
    editId: "",
    modalType: 'add',
    paymentId: "",
    bankId: "",
    showUserGroup: false
  }

  paymentName = "";
  name = "";

  @Lifecycle mounted() {
    this.getList();
  }

  // 查询余额
  async showModal(item) {
    const res = await this.$service.fetch('/config-admin-api/thirdWithdrawal/getThirdWithdrawalBalance', {id: item.id});
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.$modal.info({
      title: "查询余额",
      content: `当前余额：${res.data.balance ? res.data.balance : '0.00'}`
    });
  }

  // 修改第三方  
  showModifyModal(item) {
    this.init.editId = item.id;
    this.paymentName = item.paymentTypeName;
    this.name = item.paymentChannelName;
    this.init.modalShow = true;
    this.init.modalType = "edit";
  }

  async deleteByPaymentIds() {
    const paymentIds =  this.table.selectedRowKeys.map(v => ({id: v}));
    if (!paymentIds.length) return this.$message.warning("请先勾选");
    const result = await this.$confirm({title: "确认操作", content: "确定要删除选中的条目吗?"});
    if (!result) return;
    const res = await this.$service.fetch('/config-admin-api/payment/batchLogicDelete', {
      list: paymentIds
    });
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.$message.success(res.message);
    this.table.key = Date.now();
    this.getList(true); 
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

  async getList(refresh) {
    if (refresh) this.resetPagination(); 
    const form = await this.vform.validate();
    const values = this.$trimValues(form.values);
    const params = Object.assign(this.init.query, values);

    this.init.loading = true;
    const res = await this.$service.fetch('/config-admin-api/thirdPayment/queryPageThirdPayment', params);
    this.init.loading = false;

    if (res.code !== 1) return res.message && this.$message.error(res.message);
    if (res.code === 1 &&  res.data?.records instanceof Array) {
      this.table.dataSource = res.data.records;
      this.table.pagination.total = res.data?.totalCount;
    } else {
      this.table.dataSource = [];
      this.table.pagination.total = 0;
    }
  }
}
</script>
