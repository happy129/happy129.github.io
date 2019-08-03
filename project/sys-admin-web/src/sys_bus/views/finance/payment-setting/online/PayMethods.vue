<template>
    <a-table 
      class="mytable" bordered 
      :loading="init.loading" 
      :columns="table.columns" 
      :dataSource="table.dataSource" 
      :pagination="false" 
      :rowKey="(e, i) => i"
      @change="changePagination">
      <template slot="isEnabled" slot-scope="text, records">
        {{records.isEnabled == 0 ? '停用' : '启用'}}
      </template>
    </a-table>    
</template>
<script>
import Vue from 'vue'
import { Component, Lifecycle, Prop, Watch, InjectComponents } from 'vue-decorators'

@Component
export default class PayMethods extends Vue { 
  @Prop({ type: [String, Number] }) id;
  table = {
    key: 1,
    columns: [
      { title: '支付编号',  dataIndex: 'id'},
      { title: '支付名称', dataIndex: 'paymentName'}, 
      { title: '支付编码', dataIndex: 'paymentCode'}, 
      { title: '状态', dataIndex: 'isEnabled', scopedSlots: { customRender: 'isEnabled' } }, 
      { title: '排序',  dataIndex: 'sortOrder'}
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

  init = {
    query: { pageNo: 1, pageSize: 10, createTimeStart: "", createTimeEnd: ""},
    loading: false,
    modalShow: false,
    editId: "",
    modalType: 'add',
    paymentId: "",
    bankId: "",
    showUserGroup: false,
    showConfiguration: false,
    showPayMethods: false
  };

  @Lifecycle mounted() {
    this.getList();
  }

  changePagination(pagination) {
    this.table.pagination.current = pagination.current;
    this.init.query.pageNo = pagination.current;
    this.getList();
  }

  async getList() {
    this.init.loading = true;
    const res = await this.$service.fetch('/config-admin-api/thirdPayment/getThirdPaymentById', {id: this.id });
    this.init.loading = false;
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    if (res.code === 1 && res.data.thirdPaymentWay) {
      this.table.dataSource = res.data.thirdPaymentWay;
    } else {
      this.table.dataSource = [];
      this.table.pagination.total = 0;
    }
  }
}
</script>
