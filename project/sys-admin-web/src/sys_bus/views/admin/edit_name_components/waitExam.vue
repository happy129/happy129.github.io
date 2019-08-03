<template>
  <div class="wait-box">
    <a-form layout="inline" :form="form">
      <a-form-item label="会员账号">
        <a-input v-decorator="[ 'userName' ]" @change="changeUserName"></a-input>
        <a-button type="primary" @click="submit">查询</a-button>
      </a-form-item>
    </a-form>

    <br>
    <a-table :columns="columns" :dataSource="tableData" :rowKey="e=> e.id" :pagination="false" class="mytable" bordered>
      <template slot="operate" slot-scope="r, text">
        <a-button type="primary" @click="pass(text.id)" size="small">通过</a-button>
        <a-button type="primary" @click="reject(text.id)" size="small">拒绝</a-button>
      </template>
      <template slot="userLevelBox" slot-scope="r, text">
        {{dictionary.userType.get(text.userLevel)}}
      </template>
    </a-table>

    <a-pagination
      :current="pagination.current"
      class="mt10"
      style="text-align:right;"
      :total="pagination.total"
      @change="changePagination"
      @showSizeChange="showSizeChange"
    />
  </div>
</template>
<script>
import Vue from "vue";
import {
  Component,
  Lifecycle,
  InjectComponents,
  Prop,
  State,
  Watch
} from "vue-decorators";
import * as Api from "@api/admin";
@Component({
  dictionary: "userType"
})
export default class waitExam extends Vue {
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
    { title: "申请时间", dataIndex: "createTime" },
    { title: "备注", dataIndex: "remark" },
    { title: "操作", scopedSlots: { customRender: "operate" } }
  ];
  tableData = [];

  async modifyingList(p) {
    let res = await Api.modifyingList(p);
    if (res?.data?.body?.code === 1) {
      this.tableData = res?.data?.body?.data?.records;
      this.pagination.total = res?.data?.body?.data?.totalCount;
      this.pagination.current = 1;
    }
  }

  async submit() {
    this.pagination.current = 1
    this.form.validateFieldsAndScroll(async (err, values) => {
      if (!err) {
        await this.modifyingList({
          pageNo: this.pagination.current,
          pageSize: this.pageSize,
          userName: values.userName
        });
      }
    });
  }

  @Lifecycle() async created() {
    this.form = this.$form.createForm(this);
    await this.modifyingList({
      pageNo: this.pagination.current,
      pageSize: this.pageSize,
      userName: ""
    });
  }

  async changePagination(page, pageSize) {
    this.pagination.current = page;
    this.pageSize = pageSize;
    this.form.validateFieldsAndScroll(async (err, values) => {
      if (!err) {
        await this.modifyingList({
          pageNo: this.pagination.current,
          pageSize: this.pageSize,
          userName: values.userName
        });
      }
    });
  }
  
  async showSizeChange(page, pageSize) {
    this.pagination.current = page;
    this.pageSize = pageSize;
    this.form.validateFieldsAndScroll(async (err, values) => {
      if (!err) {
        await this.modifyingList({
          pageNo: this.pagination.current,
          pageSize: this.pageSize,
          userName: values.userName
        });
      }
    });
  }
  async pass(id) {
    let res = await Api.pass({ id });
    let code = res?.data?.body?.code;
    if (code === 1) {
      // 通过成功并刷新页面
      this.$message.success(res?.data?.body?.message);
      this.modifyingList({
        pageNo: this.pagination.current,
        pageSize: this.pageSize,
        userName: this.userName
      });
    }
  }
  async reject(id) {
    let res = await Api.reject({ id });
    let code = res?.data?.body?.code;
    if (code === 1) {
      // 通过成功并刷新页面
      this.$message.success(res?.data?.body?.message);
      this.modifyingList({
        pageNo: this.pagination.current,
        pageSize: this.pageSize,
        userName: this.userName
      });
    }
  }
  changeUserName(e) {
    this.userName = e.target.value;
  }
}
</script>
<style lang="scss" scoped>
@import "@views/admin/Pop.scss";
.wait-box /deep/{
  .ant-input {
    width: 132px;
  }
  .ant-btn {
    margin: auto 10px;
    width: 86px;
  }
  td {
    button:nth-child(2) {
      background-color: #cc3300;
      border-color: #cc3300;
    }
  }
}
</style>