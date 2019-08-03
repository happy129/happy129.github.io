<template>
  <div class="page-container">
    <a-form :form="vform" layout="inline" @submit.prevent="getList(true)">
      <a-form-item>
        <DateRange :showTime="true" title="修改时间" @change="changeDate"/>
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

    <div class="mt15">
      <a-table 
        class="mytable" bordered :loading="init.loading" :columns="table.columns" 
        :dataSource="table.dataSource" :pagination="table.pagination" :rowKey="(e,i) => i" 
        @change="changePagination">
        <template slot="isBinded" slot-scope="text,record">
          {{record.isBinded == 0 ? '禁用' : '启用'}}
        </template>
      </a-table>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import moment from "moment";
import { Component, InjectComponents, Lifecycle, Watch } from "vue-decorators";
import DateRange from "@/components/date-range/DateRange"

@Component({ formOptions: "id" })
@InjectComponents({ DateRange })
export default class HistoryBank extends Vue {
 
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
    pagination: { total: 0, current: 1 }
  };  

  init = {
    query: { pageNo: 1, pageSize: 10, createTimeStart: "", createTimeEnd: "", isBinded: -1 },
    showAdd: false,
    loading: false
  }
  
  @Lifecycle mounted() {
    this.getList();
  }

  changePagination(pagination) {
    this.table.pagination.current = pagination.current;
    this.init.query.pageNo = pagination.current;
    this.getList();
  }

  resetPagination() {
    this.table.pagination.current = 1;
    this.init.query.pageNo = 1;
  }

  changeDate(startTime, endTime, datestring, type) {
    if (type === "start") {
      this.init.query.createTimeStart = datestring
    } else {
      this.init.query.createTimeEnd = datestring
    }
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
    border-top: solid 1px #E8E8E8;
}
</style>