<template>
    <a-table 
      class="mytable" bordered 
      :loading="init.loading" 
      :columns="table.columns" 
      :dataSource="table.dataSource" 
      :pagination="false" 
      :rowKey="(e, i) => i"
      @change="changePagination">
      <template slot="isEnabledForcedly" slot-scope="text, records">
        {{ records.isEnabledForcedly == 1  ?  '可用' : '不可用' }}
      </template>
      <template slot="jumpType" slot-scope="text, record">
        <span> {{ $getText(record.jumpType, dictionary.thirdPaymentJumpType) }}  </span>
      </template>
      <template slot="operation" slot-scope="text,records">
        <a-button type="primary" size="small" v-if="records.isEnabled == 0" @click="enableOrDisabled(1, records)">启用</a-button>
        <a-button size="small" v-else  @click="enableOrDisabled(0, records)">禁用</a-button>
      </template>
    </a-table>    
</template>
<script>
import Vue from 'vue'
import { Component, Lifecycle, Prop, Watch, InjectComponents } from 'vue-decorators'

@Component({ dictionary: 'thirdPaymentJumpType' })
export default class PayMethods extends Vue { 
  @Prop({ type: [String, Number] }) id;

  table = {
    key: 1,
    columns: [
      { title: '支付编号',  dataIndex: 'id'},
      { title: '支付名称', dataIndex: 'paymentName'}, 
      { title: '支付编码', dataIndex: 'paymentCode'}, 
      { title: '跳转方式', dataIndex: 'jumpType', scopedSlots: { customRender: 'jumpType' } }, 
      { title: '排序',  dataIndex: 'sortOrder'},
      { title: '操作',  dataIndex: 'operation', scopedSlots: { customRender: "operation" }}
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

  // 启用或者禁用
  async enableOrDisabled(type, record) {
    if (!await this.$confirm({ title: `确认要${type == 1 ? '启用' : '禁用'}吗？`})) return ;

    const res = await this.$service.fetch('/config-admin-api/thirdPaymentWay/editStatusForMerchant', {
      id: record?.id,
      isEnabled: type
    });
    
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.$message.success(res.message);
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
