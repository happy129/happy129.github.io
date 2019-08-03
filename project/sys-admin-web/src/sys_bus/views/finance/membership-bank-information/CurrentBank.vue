<template>
  <div class="page-container">
    <a-form :form="vform" layout="inline" @submit.prevent="getList(true)">
      <a-form-item>
        <DateRange :showTime="true" title="创建时间" @change="changeDate"/>
      </a-form-item>

      <a-form-item label="持卡人" style="margin-left:10px;margin-right:10px;">
        <a-input v-decorator="['realName']"/>
      </a-form-item>

      <a-form-item label="银行卡号">
        <a-input v-decorator="['cardNo']"/>
      </a-form-item>

      <a-form-item label="会员账号" style="margin-left:10px;margin-right:10px;">
        <a-input v-decorator="['userName']"/>
      </a-form-item>

      <a-form-item>
        <a-button type="primary" html-type="submit" :loading="init.loading">查询</a-button>
      </a-form-item>
    </a-form>

    <div class="page-under-table">
      <!-- <a-button type="primary" @click="showAdd=true">添加</a-button> -->
      <a-button v-permission="20150" type="primary" size="small" @click="deleteByIds">删除</a-button>&nbsp;
      <a-button v-permission="20149" type="primary" size="small" @click="addBankToUnWithdraw">添加到不出款银行</a-button>
    </div>
    <div class="mt10">
      <a-table 
        :key="table.key"
        class="mytable" bordered :loading="init.loading" :columns="table.columns" 
        :dataSource="table.dataSource" :pagination="table.pagination" :rowKey="(e,i) => i" 
        :rowSelection="table.rowSelection"
        @change="changePagination">
        <template slot="isBinded" slot-scope="text,record">
          {{record.isBinded == 0 ? '禁用' : '启用'}}
        </template>
      </a-table>
    </div>

    <add-current-bank v-if="init.showAdd" @close="init.showAdd=false"></add-current-bank>
  </div>
</template>

<script>
import Vue from "vue";
import moment from "moment";
import { Component, InjectComponents, Lifecycle, Watch } from "vue-decorators";
import addCurrentBank from "./AddCurrentBank";
import DateRange from "@/components/date-range/DateRange"

@Component({ formOptions: "id" })
@InjectComponents({ addCurrentBank, DateRange })
export default class CurrentBank extends Vue {
  table = {
    key: 1,
    columns: [
      { title: "ID", dataIndex: "id" },
      { title: "会员账号", dataIndex: "userName" },
      { title: "持卡人", dataIndex: "realName" },
      { title: "银行卡号", dataIndex: "cardNo" },
      { title: "银行名称", dataIndex: "bankName" },
      { title: "创建时间", dataIndex: "createTime" },
      { title: "状态", dataIndex: "isBinded", scopedSlots: { customRender: 'isBinded' }  }
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
    query: { pageNo: 1, pageSize: 10, createTimeStart: "", createTimeEnd: "", isBinded: 1 },
    showAdd: false,
    loading: false
  }
  
  @Lifecycle activated() {
    if (this.$route.query.account && this.$route.query.account !== "") {
      this.vform.setValue('userName', this.$route.query.account);
      this.getList();
    }
  }

  @Lifecycle mounted() {
    if (this.$route.query.account && this.$route.query.account !== "") {
      this.vform.setValue('userName', this.$route.query.account);
    }
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

  // 添加到不出款银行
  async addBankToUnWithdraw() {
    if (this.table.selectedRowKeys.length === 0) {
      return this.$message.error("请先勾选要删除的内容");
    }
    const result = await this.$confirm({title: "确认操作", content: "确认要添加到不出款银行吗？"})
    if (!result) return;
    const ids = this.table.selectedRowKeys.map(v => ({id: v}));
    const res = await this.$service.fetch('/lottery-admin-api/unwithdrawableBankCard/addUnwithdrawableBankCardFromUserCard', {
      list: ids
    });
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.$message.success(res.message);
    this.getList(true);
  }

  // 根据id进行删除
  async deleteByIds() {
    if (this.table.selectedRowKeys.length === 0) {
      return this.$message.error("请先勾选要删除的内容");
    }
    const ids = this.table.selectedRowKeys.map(v => ({id: v}));
    if (!await this.$confirm({title: "提示", content: "确定要删除已选中的内容？"})) return;
    const res = await this.$service.fetch('/lottery-admin-api/userBankCard/batchRemoveUserBankCard', {list: ids});
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.$message.success(res.message);
    this.getList(true);
    this.table.key = Date.now();
  }

  async getList(refresh) {
    if (refresh) this.resetPagination(); 
    const form = await this.vform.validate();
    const values = this.$trimValues(form.values);
    const params = Object.assign(this.init.query, values);

    this.init.loading = true;
    const res = await this.$service.fetch('/lottery-admin-api/userBankCard/queryPageUserBankCard', params);
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
  border-top: solid 1px #e8e8e8;
}
</style>