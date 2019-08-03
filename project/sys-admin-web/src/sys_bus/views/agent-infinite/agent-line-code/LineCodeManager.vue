<template>
  <div class="level-wrapper">
    <div class="line-code-form">
        <a-form layout="inline" :form="vform" @submit.prevent="getList(true)">
          <div class="date-select">
            <div>
              <DateRange ref="rg" @change="changeDate" title="创建时间"/>
            </div>
            <div class="select-timer-area">
              <span>快捷选时：</span><DateSwitch @changeTab="changeQuickTime" className="btn-1"/>
            </div>
          </div>
          <a-form-item label="排线码ID">
            <a-input v-decorator="['id']"/>
          </a-form-item>
          <a-form-item label="排线码名称">
            <a-input v-decorator="['shareLineName']"/>
          </a-form-item>
          <a-form-item label="排线码创建人">
            <a-input v-decorator="['createUserName']"/>
          </a-form-item>
          <a-form-item>
            <a-button html-type="submit" :loading="init.loading" type="primary">查询</a-button>
          </a-form-item>
        </a-form>
    </div>
    <a-table class="mytable mt10" bordered :columns="table.columns" :rowKey="(e, i) => i" :dataSource="table.dataSource" :pagination="table.pagination" :loading="init.loading" @change="changePagination"> 
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
export default class LineCodeManager extends Vue {
  table = {
    key: 1,
    columns: [
      { title: "排线码ID", dataIndex: "id" },
      { title: "排线码名称", dataIndex: "shareLineName" },
      { title: "排线码创建人", dataIndex: "createUserName"},
      { title: "排线码创建时间", dataIndex: "createTime" },
      { title: "排线最大人数", dataIndex: "maxLinePersonNum" },
      { title: "团队人数", dataIndex: "teamNum"},
      { title: "团队业绩", dataIndex: "betAmount"},
      { title: "排线人数", dataIndex: "linePersonNum"},
      { title: "最近加入（ID）", dataIndex: "lastUserId"},
      { title: "最近新增时间", dataIndex: "lastUserCreateTime"}
    ],
    dataSource: [],
    pagination: { total: 0, current: 1 }
  };

  init = {
    loading: false,
    query: { pageNo: 1, pageSize: 10, startTime: "", endTime: ""}
  };

  @Lifecycle mounted() {
    this.getList();
  }

  changePagination(pagination) {
    this.table.pagination.current = pagination.current;
    this.init.query.pageNo = pagination.current;
    this.getList();
  }

  // 快捷选时间
  changeQuickTime(startDate, endTime) {
    this.init.query.startTime = startDate;
    this.init.query.endTime = endTime;
    this.$refs.rg.setDateRangeValues(startDate, endTime);
  }

  changeDate(startTime, endTime, datestring, type) {
    if (type === "start") {
      this.init.query.startTime = datestring
    } else {
      this.init.query.endTime = datestring
    }
  }

  resetPagination() {
    this.table.pagination.current = 1;
    this.init.query.pageNo = 1;
  }

  async getList(refresh) {
    if (refresh) this.resetPagination(); 
    const form = await this.vform.validate();
    const values = this.$trimValues(form.values);
    const params = Object.assign(this.init.query, values);

    this.init.loading = true;
    const res = await this.$service.fetch('/lottery-admin-api/shareLine/queryPagedShareLine', params);
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
.date-select /deep/{
  display: flex;
  align-items: center;
  .ant-form-item {
    margin-right: 0;
  }
  .select-timer-area {
    display: flex;
    margin-left: 20px;
    font-size: 14px;
    align-items: center;
  }
  .btn-1 {
    button {
      padding: 6px 12px;
    }
  }
}
</style>