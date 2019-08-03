<template>
  <div class="subaccount-box page-container">
    <a-form layout="inline">
      <a-form-item label="用户名：">
        <a-input v-model="adminName" style="width:130px;margin:auto 22px;" @pressEnter="searchs"/>
        <a-button type="primary" @click="searchs" ref="btnSave">查询</a-button>
        <a-button type="primary" @click="add" class="newB" v-permission="10106">新增</a-button>
      </a-form-item>
    </a-form>
    <br>
    <a-table class="mytable" bordered :columns="columns" :dataSource="tableData" :rowKey="e=> e.id" :pagination="false" >
      <template slot="enableBox" slot-scope="r, text">
        {{text.isEnabled===1?'启用':'不启用'}}
      </template>
    <!-- isBuiltIn区分admin -->
      <template slot="operate" slot-scope="r, text">
        <a-button type="primary" size="small" @click="getDetail(text.id, text.isBuiltIn)" v-permission="10107">编辑</a-button>
        <a-button type="primary" size="small" @click="ePwd(text)" v-permission="10108">修改密码</a-button>
        <a-popconfirm title="确定删除吗?" @confirm="deleteAdmin(text)" @cancel="void(0)" okText="确定" cancelText="取消" >
          <a-button v-if="text.isBuiltIn===0" type="primary" size="small" v-permission="10109">删除</a-button>
        </a-popconfirm>
        <a-popconfirm title="确定冻结吗?" @confirm="editStatusAdmin(text, 0)" @cancel="void(0)" okText="确定" cancelText="取消" v-if="text.isEnabled===1" >
          <a-button v-if="text.isBuiltIn===0" type="primary" size="small" v-permission="10110">冻结</a-button>
        </a-popconfirm>
        <a-popconfirm title="确定解冻吗?" @confirm="editStatusAdmin(text, 1)" @cancel="void(0)" okText="确定" cancelText="取消" v-else >
          <a-button type="primary" size="small">解冻</a-button>
        </a-popconfirm>
      </template>
    </a-table>
    <div style="margin-top:10px;text-align:right;">
      <a-pagination :current="pagination.current" :total="pagination.total"  @change="changePagination" @showSizeChange="showSizeChange" />
    </div>
    <add-admin v-if="showAddAdmin" @close="showAddAdmin=false" @ok="searchs"></add-admin>
    <EditAdminPanel v-if="showEditAdmin" :admin="isAdmin" @close="showEditAdmin=false" :detail="detail" @ok="searchs" />
    <edit-password v-if="showEditPassword" @close="showEditPassword=false" @ok="searchs" :id="currentid" :userName="currentUserName" :nickName="currentNickName"></edit-password>
  </div>
</template>
<script>
import Vue from "vue";
import { Component, Lifecycle, InjectComponents } from "vue-decorators";
import * as Api from "@api/admin";
import addAdmin from "./addAdmin";
import EditAdminPanel from "./EditAdminPanel";
import editPassword from "./EditPassword";

@Component
@InjectComponents({ addAdmin, editPassword, EditAdminPanel })
export default class Subaccount extends Vue {
  detail = {};
  currentid = 99999;
  currentUserName = "";
  currentNickName = "";
  showEditPassword = false;
  showEditAdmin = false;
  pageSize = 10;
  showAddAdmin = false;
  // 是否是管理员
  isAdmin = false;

  adminName = "";
  pagination = { total: 0, current: 1 };
  columns = [
    { title: "ID", dataIndex: "id" },
    { title: "账号", dataIndex: "userName" },
    { title: "昵称", dataIndex: "nickName" },
    { title: "岗位", dataIndex: "remark" },
    { title: "建立时间", dataIndex: "createTime" },
    { title: "账号状况", scopedSlots: { customRender: "enableBox" }},
    { title: "操作", scopedSlots: { customRender: "operate" } }
  ];
  tableData = [];
  async getData() {
    let p = {
      pageNo: this.pagination.current,
      pageSize: this.pageSize,
      userName: this.adminName
    };

    let res = await Api.adminList(p);
    this.tableData = res?.data?.body?.data?.records;
    this.pagination.total = res?.data?.body?.data?.totalCount;
  }
  async searchs() {
    this.pagination.current = 1;
    await this.getData();
  }
  // 增加
  async add() {
    this.showAddAdmin = true;
  }
  @Lifecycle() async created() {
    await this.getData();
  }
  async showSizeChange(current, size) {
    this.pagination.current = current;
    this.pageSize = size;
    await this.getData();
  }
  async changePagination(page, pageSize) {
    this.pagination.current = page;
    this.pageSize = pageSize;
    await this.getData();
  }
  // 删除
  async deleteAdmin(text) {
    let p = { id: text.id };
    await Api.deleteAdminList(p);
    await this.getData();
  }
  // 冻结
  async editStatusAdmin(text, num) {
    let p = { id: text.id, isEnabled: num };
    await Api.editStatus(p);
    await this.getData();
  }
  ePwd(t) {
    this.currentid = t.id;
    this.currentUserName = t.userName;
    this.currentNickName = t.nickName;
    this.showEditPassword = true;
  }

  async getDetail(id, isAdmin) {
    let p = { id };
    let res = await Api.detail(p);

    if (isAdmin !== undefined) {
      this.isAdmin = isAdmin == 1;
    }

    if (res?.data?.body?.code === 1) {
      this.detail = res?.data?.body?.data;
      this.showEditAdmin = true;
    }
  }
}
</script>
<style lang="scss" scoped>
@import "@views/admin/Pop.scss";
.subaccount-box /deep/ {
  .ant-btn {
    margin: auto 7px;
  }
  .newB {
    background-color: #ff9900;
    border-color: #ff9900;
  }
}
</style>

