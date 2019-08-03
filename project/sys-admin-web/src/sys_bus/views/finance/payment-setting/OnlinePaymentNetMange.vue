<template>
  <div class="bank-setting">
      <a-table 
            class="mytable" bordered 
            :loading="init.loading" 
            :columns="table.columns" 
            :dataSource="table.dataSource" 
            :pagination="table.pagination" 
            :rowKey="(e, i) => i"
            @change="changePagination"
        >
          <template slot="thirdGateway" slot-scope="text,records">
            <a-input v-model="records.thirdGateway"/>
          </template>
          <template slot="operate" slot-scope="text,records">
            <a-button v-permission="20073"  type="primary" size="small" @click="onSave(records)">保存</a-button>
          </template>
      </a-table>  
  </div>
</template>

<script>
import Vue from 'vue'
import { Component, Lifecycle, Prop, Watch, InjectComponents } from 'vue-decorators'

@Component
export default class OnlinePaymentNetMange extends Vue {
  table = {
    key: 1,
    columns: [
      { title: '第三方支付',  dataIndex: 'paymentChannelName'},
     // { title: '网关名称', dataIndex: 'gatewayName'}, 
      { title: '网关地址', dataIndex: 'thirdGateway', scopedSlots: { customRender: 'thirdGateway' }}, 
      { title: '操作',  dataIndex: 'operate', scopedSlots: { customRender: 'operate' } }
    ],
    dataSource: [
      {
        gatewayName: "华势",
        name: "余额查询网关",
        thirdGateway: "https://client.payworth.net/search/queryBalance",
      }
    ],
    pagination: { total: 0, current: 1 }
  };

  init = {
    query: { pageNo: 1, pageSize: 10 },
    loading: false
  };

  @Lifecycle mounted() {
    this.getList();
  }

  changePagination(pagination) {
    this.table.pagination.current = pagination.current;
    this.init.query.pageNo = pagination.current;
    this.getList();
  }

  // 保存
  async onSave(record) {
    if (!record.thirdGateway) {
      return this.$message.error("网关地址不能为空")
    }
    const res = await this.$service.fetch("/config-admin-api/thirdPayment/editThirdGatewayForMerchant", {
      id: record.id,
      thirdGateway: record.thirdGateway
    });
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.$message.success(res.message);
  }

  async getList() {
    this.init.loading = true;
    // paymentType=4
    const res = await this.$service.fetch('/config-admin-api/thirdPayment/queryPageThirdGateway', Object.assign({ paymentType: 4 }, this.init.query));
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
