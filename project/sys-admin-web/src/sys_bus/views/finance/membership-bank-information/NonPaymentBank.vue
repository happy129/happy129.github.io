<template>
  <div class="page-container">
     <a-form :form="vform" layout="inline" @submit.prevent="getList(true)">
      <a-form-item>
        <DateRange :showTime="true" title="创建时间" @change="changeDate"/>
      </a-form-item>

      <a-form-item label="持卡人" style="margin-left:10px;margin-right:10px;">
        <a-input v-decorator="['realName']"/>
      </a-form-item>

      <a-form-item label="银行卡号" style="margin-left:10px;margin-right:10px;">
        <a-input v-decorator="['cardNo']"/>
      </a-form-item>

      <a-form-item>
        <a-button type="primary" html-type="submit" :loading="init.loading">查询</a-button>
      </a-form-item>
    </a-form>

    <div class="page-under-table">
      <a-button v-permission="20155" type="primary" size="small" @click="init.showAdd=true">添加</a-button>&nbsp;
      <a-button v-permission="20156"  type="primary" size="small" @click="deleteByIds">删除</a-button>
    </div>

    <a-table class="mytable mt10" 
      bordered
      :key="table.key"
      :loading="init.loading"
      :columns="table.columns" 
      :dataSource="table.dataSource" 
      :pagination="table.pagination"
      :rowKey="(e,i) => i" 
      :rowSelection="table.rowSelection"
      @change="changePagination"
    >
    </a-table>
  
    <add-non-bank v-if="init.showAdd" @close="init.showAdd=false;getList();"></add-non-bank>
  </div>
</template>

<script>
import Vue from "vue";
import moment from "moment";
import { Component, InjectComponents, Lifecycle, Watch } from "vue-decorators";
import addNonBank from "./AddNonBank"
import DateRange from "@/components/date-range/DateRange"

@Component({ formOptions: "id" })
@InjectComponents({ addNonBank, DateRange })
export default class NonPaymentBank extends Vue {
  table = {
    key: 1,
    columns: [
      { title: 'ID', dataIndex: "id"},
      { title: '持卡人', dataIndex: "realName"},
      { title: '银行卡号', dataIndex: "cardNo"},
      { title: '银行名称', dataIndex: "bankName"},
      { title: '创建时间', dataIndex: "createTime"},
      { title: '操作者', dataIndex: "adminName"}
    ],
    dataSource: [],
    pagination: { total: 0, current: 1 },
    selectedRowKeys: [],
    rowSelection: {
      onChange: (selectedRowKeys, selectedRows) => {
        this.table.selectedRowKeys = selectedRows.map(e => e.id);
      },
    }
  };  

  init = {
    query: { pageNo: 1, pageSize: 10, createTimeStart: "", createTimeEnd: "" },
    showAdd: false,
    loading: false
  }

  @Lifecycle mounted() {
    this.getList();
  }

  changePagination(pagination) {
    this.table.pagination.current = pagination.current;
    this.init.query.pageNo = pagination.current;
    this.table.key =  Math.random();
    this.getList();
  }

  resetPagination() {
    this.table.pagination.current = 1;
    this.init.query.pageNo = 1;
    this.table.key =  Math.random();
  }

  changeDate(startTime, endTime, datestring, type) {
    if (type === "start") {
      this.init.query.createTimeStart = datestring
    } else {
      this.init.query.createTimeEnd = datestring
    }
  }

  async deleteByIds() {
    if (this.table.selectedRowKeys.length === 0) {
      return this.$message.error("请先勾选要删除的内容");
    }
    const ids = this.table.selectedRowKeys.map(v => ({id: v}));
    if (!await this.$confirm({title: "提示", content: "确定要删除已选中的内容？"})) return;
    const res = await this.$service.fetch('/lottery-admin-api/unwithdrawableBankCard/batchDeleteUnwithdrawableBankCard', {list: ids});
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.$message.success(res.message);
    this.getList(true);
  }

  async getList(refresh) {
    if (refresh) this.resetPagination(); 
    const form = await this.vform.validate();
    const values = this.$trimValues(form.values);
    const params = Object.assign(this.init.query, values);

    this.init.loading = true;
    const res = await this.$service.fetch('/lottery-admin-api/unwithdrawableBankCard/queryPageUnwithdrawableBankCard', params);
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
@import "@views/admin/Pop.scss";
hr {
    border: none;
    border-top: solid 1px #E8E8E8;
}
</style>