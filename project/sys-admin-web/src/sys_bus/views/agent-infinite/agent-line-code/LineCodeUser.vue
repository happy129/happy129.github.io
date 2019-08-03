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
          <a-form-item label="所属排线码ID">
            <a-input v-decorator="['shareLineId']"/>
          </a-form-item>
          <a-form-item label="所属排线码名称">
            <a-input v-decorator="['shareLineName']"/>
          </a-form-item>
          <a-form-item label="用户ID">
            <a-input v-decorator="['shareUserId']"/>
          </a-form-item>
          <a-form-item label="用户名">
            <a-input v-decorator="['shareUserName']"/>
          </a-form-item>
          <a-form-item>
            <a-button html-type="submit" :loading="init.loading" type="primary">查询</a-button>
          </a-form-item>
        </a-form>
    </div>
     <a-table 
      class="mytable mt10" 
      bordered 
      :columns="table.columns" 
      :rowKey="(e, i) => i" 
      :loading="init.loading"
      :dataSource="table.dataSource" 
      :pagination="table.pagination"  
      @change="changePagination"> 
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
export default class LineCodeUser extends Vue {
  table = {
    key: 1,
    columns: [
      { title: "用户ID", dataIndex: "userId" },
      { title: "用户名", dataIndex: "userName" },
      { title: "注册时间", dataIndex: "createTime"},
      { title: "所属排线码ID", dataIndex: "shareLineId" },
      { title: "所属排线码名称", dataIndex: "shareLineName" },
      { title: "排线码创建人（用户名）", dataIndex: "shareLineCreateUserName"},
      { title: "排线位置", dataIndex: "userPosition"},
      { title: "个人业绩", dataIndex: "betAmount"},
      { title: "上级用户ID", dataIndex: "parentId"},
      { title: "团队人数", dataIndex: "teamNum"}
    ],
    dataSource: [],
    pagination: { total: 0, current: 1 }
  };

  init = {
    loading: false,
    query: { pageNo: 1, pageSize: 10, startTime: "", endTime: ""}
  };

  @Lifecycle mounted() {
    //this.getList();
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
    const res = await this.$service.fetch('/lottery-admin-api/shareLineUser/queryPageShareLineUser', params);
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