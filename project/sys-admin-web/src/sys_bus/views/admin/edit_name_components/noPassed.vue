<template>
  <div class="wait-box">
    <a-form layout="inline" :form="form">
      <a-form-item label="会员账号">
        <a-input v-decorator="[ 'userName' ]" @change="changeUserName"></a-input>
        <a-button type="primary" @click="submit(false)">查询</a-button>
      </a-form-item>
    </a-form>

    <br>
    <a-table :columns="columns" :dataSource="tableData" :rowKey="e=> e.id" :pagination="pagination" @change="changePagination" class="mytable" bordered>
      <template slot="userLevelBox" slot-scope="r, text">
        {{dictionary.userType.get(text.userLevel)}}
      </template>
    </a-table>

    <!-- <a-pagination
        class="mt10"
        :current="pagination.current"
        size="small"
        :total="pagination.total"
        showSizeChanger
        showQuickJumper
        @change="changePagination"
        @showSizeChange="showSizeChange"
    /> -->
  </div>
</template>
<script>
import Vue from "vue";
import { Component, Lifecycle, InjectComponents, Prop } from "vue-decorators";
import * as Api from "@api/admin";
@Component({
  dictionary: "userType"
})
export default class noPassed extends Vue {
  pagination = { total: 0, current: 1 };
  pageSize = 10;
  userName = "";
  columns = [
    { title: "编号", dataIndex: "id" },
    { title: "会员类型", scopedSlots: { customRender: "userLevelBox" } },
    { title: "会员账号", dataIndex: "userName" },
    { title: "修改前姓名", dataIndex: "modifyBeforeRealName" },
    { title: "修改后姓名", dataIndex: "modifyAfterRealName" },
    { title: "申请人", dataIndex: "applyAdminName" },
    { title: "拒绝时间", dataIndex: "auditTime" },
    { title: "备注", dataIndex: "remark" }
  ];
  tableData = [];
  // async changePagination(page, pageSize) {
  //   this.pagination.current = page;
  //   this.pageSize = pageSize;
  //   this.form.validateFieldsAndScroll(async (err, values) => {
  //     if (!err) {
  //       await this.rejectedList({
  //         pageNo: this.pagination.current,
  //         pageSize: this.pageSize,
  //         userName: values.userName
  //       });
  //     }
  //   });
  // }
  async showSizeChange(page, pageSize) {
    this.pagination.current = page;
    this.pageSize = pageSize;
    this.form.validateFieldsAndScroll(async (err, values) => {
      if (!err) {
        await this.rejectedList({
          pageNo: this.pagination.current,
          pageSize: this.pageSize,
          userName: values.userName
        });
      }
    });
  }

  changePagination(pagination) {
    this.pagination.current = pagination.current;
    this.submit(true);
  }

  async submit(reset) {
    if (!reset) this.pagination.current = 1;
    this.form.validateFieldsAndScroll(async (err, values) => {
      if (!err) {
        await this.rejectedList({
          pageNo: this.pagination.current,
          pageSize: this.pageSize,
          userName: values.userName
        });
      }
    });
  }
  changeUserName(e) {
    this.userName = e.target.value;
  }
  async rejectedList(p) {
    let res = await Api.rejectedList(p);
    if (res?.data?.body?.code === 1) {
      this.tableData = res?.data?.body?.data?.records;
      this.pagination.total = res?.data?.body?.data?.totalCount;
      //this.pagination.current = 1;
    }
  }
  @Lifecycle() async created() {
    this.form = this.$form.createForm(this);
    await this.rejectedList({
      pageNo: this.pagination.current,
      pageSize: this.pageSize,
      userName: this.userName
    });
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