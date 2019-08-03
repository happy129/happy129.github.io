<template>
  <div class="crown-wrapper">
    <div class="line-code-form">
        <a-form layout="inline" :form="vform" @submit.prevent="getList(true)">
          <a-form-item class="picker-area">
            <DateRange title="起止时间" :defaultDate="true" ref="rg" @change="changeDate"/>
          </a-form-item>
          <a-form-item label="期号">
            <a-input  v-decorator="['userName']"/>
          </a-form-item>
          <a-form-item>
            <a-button type="primary"  html-type="submit" :loading="init.loading">查询</a-button>
          </a-form-item>
        </a-form>
    </div>
     <a-table 
      class="mytable mt10" 
      bordered 
      :loading="init.loading"
      :columns="table.columns" 
      :rowKey="(e, i) => i" 
      :dataSource="table.dataSource" 
      :pagination="table.pagination"  
      @change="changePagination"> 
        <template slot="operation" slot-scope="text,record">
          <a-button @click="showRecord(record)" size="small">详情</a-button>
        </template>
      </a-table>
  </div>
</template>

<script>
import Vue from "vue";
import { Component, Lifecycle, InjectComponents } from "vue-decorators";
import DateRange from "@/components/date-range/DateRange";
import { DateSwitch } from "@/components/switch"

@Component({ formOptions: "id" })
@InjectComponents({ DateRange, DateSwitch })
export default class TotalData extends Vue {
  table = {
    key: 1,
    columns: [
      { title: "ID", dataIndex: "id" },
      { title: "期号", dataIndex: "userName" },
      { title: "分分彩开奖号码", dataIndex: "crownNum"},
      { title: "开奖号码时间", dataIndex: "isGiven" },
      { title: "利润率", dataIndex: "rate"}
    ],
    selectedRowKeys: [],
    rowSelection: {
      onChange: (selectedRowKeys, selectedRows) => {
        this.table.selectedRowKeys = selectedRows.map(e => e.id);
      }
    },
    dataSource: [],
    pagination: { total: 0, current: 1}
  };

  init = {
    loading: false,
    showModal: false,
    query: { pageNo: 1, pageSize: 10, startTime: "",  endTime: ""}
  };

  @Lifecycle mounted() { }

  // 快捷选时间
  changeQuickTime(startDate, endTime) {
    this.init.query.startTime = startDate;
    this.init.query.endTime = endTime;
    this.$refs.rg.setDateRangeValues(startDate, endTime);
  }

  changeDate(date, datestring, type) {
    if (type === "start") {
      this.init.startTime = datestring
    } else {
      this.init.endTime = datestring
    }
  }

  changePagination(pagination) {
    this.table.pagination.current = pagination.current;
    this.init.query.pageNo = pagination.current;
    this.getList();
  }

   resetPagination() {
    this.table.key = Math.random();
    this.table.pagination.current = 1;
    this.init.query.pageNo = 1;
  }

  showRecord(record) {
    this.init.showModal = true;
  }

  async getList(refresh) {
    if (refresh) this.resetPagination(); 
    const form = await this.vform.validate();
    const values = this.$trimValues(form.values);
    const params = Object.assign(this.init.query, values);

    this.init.loading = true;
    const res = await this.$service.fetch('/lottery-admin-api/crownDaySummary/queryPageCrownDaySummary', params);
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
 .crown-wrapper {
    min-height: 100%;
    background-color: #fff;
    padding: 10px; 
  }
  .picker-area /deep/ {
    .ant-form-item {
      margin-right: 0;
    }
  }
  .open-number {
    max-width: 190px;
  }
  .modal-title {
    background-color: #009688;
    color: #fff;
    text-align: center;
    font-size: 15px;
    padding: 4px 0;
  }
</style>