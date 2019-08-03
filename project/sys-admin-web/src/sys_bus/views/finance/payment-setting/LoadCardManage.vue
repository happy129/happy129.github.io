<template>
  <section class="bank-setting">
      <a-form layout="inline" :form="form1" @submit.prevent="getList(true)">
        <a-form-item label="使用用户">
            <a-input class="input-item" v-decorator="['userName']"/>
        </a-form-item>
        <a-form-item label="金额">
            <a-input class="input-item" v-number="true" v-decorator="['amount']"/>
        </a-form-item>
        <a-form-item label="卡号">
            <a-input class="input-item" v-decorator="['cardNo']"/>
        </a-form-item>
        <a-form-item class="qr-range">
           <DateRange title="生成时间" @change="changeDate"/>
        </a-form-item>
        <a-form-item label="状态">
          <a-select v-decorator="['status']" :dropdownMatchSelectWidth="false">
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="0">未领取</a-select-option>
            <a-select-option value="1">等待使用</a-select-option>
            <a-select-option value="2">已使用</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
           <a-button type="primary" html-type="submit" :loading="init.loading">搜索</a-button>
        </a-form-item>
        <a-form-item v-permission="20043">
           <a-button type="primary" @click="init.modalShow=true">添加充值卡</a-button>
        </a-form-item>
        <a-form-item v-if="false">
           <a-button type="primary">导出充值卡</a-button>
        </a-form-item>
      </a-form>

      <div class="page-under-table">
        <div>
          <a-button  v-permission="20044" type="primary" size="small"  @click.prevent="selectDropMenu(1)">捡取选中</a-button>
          <!-- &nbsp;<a-button type="primary" size="small">捡取全部</a-button> -->
        </div>
        <a-table  
            :key="table.key"
            class="mytable mt10" bordered :loading="init.loading" :columns="table.columns" :dataSource="table.dataSource" 
            :rowSelection="table.rowSelection" :pagination="table.pagination" :rowKey="(e, i) => i"
            @change="changePagination"
          >
          <template slot="userId" slot-scope="text,records">
              {{  records.userId == 0 ? '--' :  records.userId }}
          </template>
          <template slot="status" slot-scope="text,records">
            <span>{{records.status == 0 ? "未领取" : records.status == 1 ? "等待使用" : "已使用"}}</span>
          </template>
        </a-table>
      </div>

      <a-modal title="添加充值卡" v-model="init.modalShow" :footer="null" :destroyOnClose="true" :width="350" :maskClosable="false">
        <a-form :form="form2" @submit.prevent="addLoadCard">
          <a-form-item label="充值金额"  :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
            <a-input v-number="true" v-decorator="['amount', {rules: [{required: true, message: '充值金额不能为空'}] }]"/>
          </a-form-item>
          <a-form-item label="数量" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
            <a-input v-number  v-decorator="['num', {rules: [{required: true, message: '数量不能为空'}] }]"/>
          </a-form-item>
          <a-form-item>
            <a-button type="primary" html-type="submit">生成卡号</a-button>
          </a-form-item>
        </a-form>
      </a-modal>

  </section>
</template>

<script>
import Vue from 'vue'
import { Component, Lifecycle, Prop, Watch, InjectComponents } from 'vue-decorators'
import DateRange from "@/components/date-range/DateRange"
const formOptions = {
  form1: "id",
  form2: "id"
};
@Component({ formOptions })
@InjectComponents({ DateRange })
export default class LoadCardManage extends Vue {
  table = {
    key: 1,
    columns: [
      { title: '卡号',  dataIndex: 'cardNo'},
      { title: '金额', dataIndex: 'amount'}, 
      { title: '生成时间', dataIndex: 'createTime'}, 
      { title: '使用用户', scopedSlots: { customRender: 'userId'}}, 
      { title: '使用时间', dataIndex: 'useTime'}, 
      { title: '操作员', dataIndex: 'adminName'}, 
      { title: '状态', dataIndex: 'status', scopedSlots: { customRender: 'status' }}
    ],
    selectedRowKeys: [],
    rowSelection: {
      onChange: (selectedRowKeys, selectedRows) => {
        this.table.selectedRowKeys = selectedRows.map(e => e.id);
      },
    },
    dataSource: [],
    pagination: { total: 0, current: 1 }
  };


  init = {
    query: { pageNo: 1, pageSize: 10, useTimeStart: "", useTimeEnd: "" },
    loading: false,
    modalShow: false,
    editId: "",
    modalType: 'add',
    paymentId: "",
    bankId: "",
    showUserGroup: false
  };


  @Lifecycle mounted() {
    this.setInitialChecked();
    this.getList();
  }

  changePagination(pagination) {
    this.table.pagination.current = pagination.current;
    this.init.query.pageNo = pagination.current;
    this.table.key =  Math.random();
    this.table.selectedRowKeys = [];
    this.getList();
  }

  // 设定表单初始值
  setInitialChecked() {
    this.form1.setValue('status', '');
  }

  resetPagination() {
    this.table.key = Math.random();
    this.table.pagination.current = 1;
    this.init.query.pageNo = 1;
  }

  changeDate(startTime, endTime, datestring, type) {
    if (type === "start") {
      this.init.query.useTimeStart = datestring
    } else {
      this.init.query.useTimeEnd = datestring
    }
  }

  // value = 1已选中, value = 2未选中
  async selectDropMenu(value) {
    let ids = [];
    if (value === 1) {
      ids = this.table.selectedRowKeys;
      if (!ids.length) return this.$message.error('请先勾选');
    } else {
      const data = this.table.dataSource.map(item => item.id);
      const selected =  new Set([...this.table.selectedRowKeys.slice()]);
      // 取两个数组的差集
      ids = data.filter(item => !selected.has(item));
    }
    const result = await this.$confirm({
      title: "确认",
      content: "确认操作"
    });
    if (!result) return;

    const res = await this.$service.fetch('/config-admin-api/rechargeCard/batchPickupRechargeCard', { list: ids.map(v => ({id: v})) });
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.$message.success(res.message);
    this.getList();
    this.table.key = Date.now();
  }


   // 添加充值卡
  async addLoadCard() {
    const form = await this.form2.validate();
    if (form.errors) return;
    const res = await this.$service.fetch('/config-admin-api/rechargeCard/addRechargeCard', form.values);
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.$message.success(res.message);
    this.init.modalShow = false;
    this.getList();
  }

  // 获取列表
  async getList(refresh) {
    if (refresh) this.resetPagination(); 
    const form = await this.form1.validate();
    const values = this.$trimValues(form.values);
    const params = Object.assign(this.init.query, values);

    this.init.loading = true;
    const res = await this.$service.fetch('/config-admin-api/rechargeCard/queryPageRechargeCard', params);
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

<style lang="scss" scoped>
.input-item {
  width: 140px;
}
.qr-range /deep/{
  .ant-form-item {
    margin-right: 0;
  }
}
</style>