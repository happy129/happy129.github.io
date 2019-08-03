<template>
  <div class="wait-box">
    <a-form layout="inline">
      <a-form-item label="会员账号">
        <a-input v-model="param.userName"></a-input>
        <a-button type="primary" :loading="loading" @click="getList(true)">查询</a-button>
      </a-form-item>
    </a-form>

    <br>
    <a-table
      :columns="columns"
      :dataSource="tableData"
      :rowKey="(e, i)=> i"
      :loading="loading"
      :pagination="pagination"
      @change="changePagination"
      class="mytable"
      bordered
    >
      <template slot="userLevelBox" slot-scope="r, text">
        {{dictionary.userType.get(text.userLevel)}}
      </template>
      <template slot="remark" slot-scope="text, record">
        <p style="max-width: 400px">{{record.remark}}</p>
      </template>
    </a-table>

  </div>
</template>
<script>
import Vue from "vue";
import { Component, Lifecycle, InjectComponents, Prop } from "vue-decorators";
import * as Api from "@api/admin";
@Component({
  dictionary: "userType"
})
export default class passed extends Vue {
  
  loading = false;

  columns = [
    { title: "编号", dataIndex: "id" },
    { title: "会员类型", scopedSlots: { customRender: "userLevelBox" } },
    { title: "会员账号", dataIndex: "userName" },
    { title: "修改前姓名", dataIndex: "modifyBeforeRealName" },
    { title: "修改后姓名", dataIndex: "modifyAfterRealName" },
    { title: "申请人", dataIndex: "applyAdminName" },
    { title: "通过时间", dataIndex: "auditTime" },
    { title: "备注", scopedSlots: { customRender: "remark" } }
  ];
  tableData = [];
  pagination = { total: 0, current: 1 };

  param = {
    pageNo: 1,
    pageSize: 10,
    userName: ''
  }

  async changePagination(pagination) {
    this.pagination.current = pagination.current;
    this.param.pageNo = pagination.current;
    this.getList()
  }

  resetPagination() {
    this.pagination.current = 1;
    this.param.pageNo = 1;
  }

  async getList(refresh) {
    if (refresh) this.resetPagination();
    this.loading = true;
    const res = await Api.passList(this.param);
    this.loading = false;
    if (res?.data?.body?.code === 1) {
      this.tableData = res?.data?.body?.data?.records;
      this.pagination.total = res?.data?.body?.data?.totalCount;
    }
  }

  @Lifecycle() async created() {
    this.getList();
  }
}
</script>
<style lang="scss" scoped>
.wait-box /deep/ {
  .ant-input {
    width: 132px;
  }
  .ant-btn {
    margin: auto 10px;
    width: 86px;
  }
}
</style>