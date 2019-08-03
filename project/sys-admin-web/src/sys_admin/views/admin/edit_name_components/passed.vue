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
      :rowKey="e=> e.id"
      :pagination="pagination"
      :loading="loading"
      @change="changePagination"
      class="mytable"
      bordered
    >
      <template slot="userLevelBox" slot-scope="r, text">
        {{(text.userLevel!==undefined||text.userLevel!==null)? '会员' : ''}}
      </template>
    </a-table>
  </div>
</template>
<script>
import Vue from "vue";
import { Component, Lifecycle, InjectComponents, Prop } from "vue-decorators";
import * as Api from "@api/admin";
@Component
export default class passed extends Vue {
  pagination = { total: 0, current: 1 };
  loading = false;

  columns = [
    { title: "编号", dataIndex: "id" },
    { title: "会员类型", scopedSlots: { customRender: "userLevelBox" } },
    { title: "会员账号", dataIndex: "userName" },
    { title: "修改前姓名", dataIndex: "modifyBeforeRealName" },
    { title: "修改后姓名", dataIndex: "modifyAfterRealName" },
    { title: "申请人", dataIndex: "applyAdminName" },
    { title: "申请时间", dataIndex: "createTime" },
    { title: "备注", dataIndex: "remark" }
  ];
  tableData = [];

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
      this.pagination.current = 1;
    }
  }


  // async changePagination(page, pageSize) {
  //   this.pagination.current = page;
  //   this.pageSize = pageSize;
  //   this.form.validateFieldsAndScroll(async (err, values) => {
  //     if (!err) {
  //       await this.passList({
  //         pageNo: this.pagination.current,
  //         pageSize: this.pageSize,
  //         userName: values.userName
  //       });
  //     }
  //   });
  // }
  // async showSizeChange(page, pageSize) {
  //   this.pagination.current = page;
  //   this.pageSize = pageSize;
  //   this.form.validateFieldsAndScroll(async (err, values) => {
  //     if (!err) {
  //       await this.passList({
  //         pageNo: this.pagination.current,
  //         pageSize: this.pageSize,
  //         userName: values.userName
  //       });
  //     }
  //   });
  // }
  // async submit() {
  //   this.pagination.current = 1;
  //   this.form.validateFieldsAndScroll(async (err, values) => {
  //     if (!err) {
  //       await this.passList({
  //         pageNo: this.pagination.current,
  //         pageSize: this.pageSize,
  //         userName: values.userName
  //       });
  //     }
  //   });
  // }
  // changeUserName(e) {
  //   this.userName = e.target.value;
  // }
  // async passList(p) {
  //   let res = await Api.passList(p);
  //   if (res?.data?.body?.code === 1) {
  //     this.tableData = res?.data?.body?.data?.records;
  //     this.pagination.total = res?.data?.body?.data?.totalCount;
  //   }
  // }
  // @Lifecycle() async created() {
  //   this.form = this.$form.createForm(this);
  //   await this.passList({
  //     pageNo: this.pagination.current,
  //     pageSize: this.pageSize,
  //     userName: this.userName
  //   });
  // }
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