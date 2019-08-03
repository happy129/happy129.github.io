<template>
  <div class="agent-permission">
    <a-form layout="inline">
      <a-form-item label="用户名">
        <a-input v-model="init.query.userName" />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" :loading="init.loading" @click="getList(true)">查询</a-button> &nbsp;
      </a-form-item>
      <a-form-item v-permission="203382">
        <a-button type="primary" @click="init.modalShow=true;init.modalType='add';">添加代理后台管理员</a-button>
      </a-form-item>
      <p class="page-under-table">添加后，即可设置该会员是否有登陆直推后台或者无限代后台的权限</p>
    </a-form>

    <a-table
      bordered 
      class="mytable mt10"
      :key="table.key"
      :rowKey="(e,i)=>i" 
      :loading="init.loading" 
      :columns="table.columns" 
      :dataSource="table.dataSource" 
      :pagination="table.pagination" 
      :rowSelection="table.rowSelection"
      @change="changePagination"
    >
      <template slot="isShareAgentSystemEnabled" slot-scope="text, record">
        {{ record.isShareAgentSystemEnabled == 1 ? "是" : "否" }}
      </template>
      <template slot="isUnlimitedAgentSystemEnabled" slot-scope="text, record">
        {{ record.isUnlimitedAgentSystemEnabled == 1 ? "是" : "否" }}
      </template>
      <template slot="operate" slot-scope="text, record">
        <template v-permission="203383">
          <a-button class="common-green-btn" @click="editById(record)">编辑</a-button>&nbsp;
        </template>
        <template  v-permission="203384">
          <a-button class="common-red-btn"  @click="deleteById(record)">删除</a-button>
        </template>
      </template>
    </a-table>

    <a-modal v-model="init.modalShow" :title="`${init.modalType == 'add' ? '添加' : '修改'}`" @ok="addAdmin"  :confirmLoading="confirmLoading"  :destroyOnClose="true" :width="460" :maskClosable="false">
      <a-form :form="vform" class="permission-form">
        <p class="form-text" v-if="init.modalType == 'add'">输入要添加为直推代理后台管理员的前台用户名</p>
        <a-form-item label="用户名" :label-col="{ span: 7 }" :wrapper-col="{ span: 16 }">
          <a-input :disabled="init.modalType!='add'"  v-decorator="['userName', {rules: [{required: true, message: '请输入用户名，6-18英文或数字组合', pattern: /^[a-z0-9]{6,18}$/ }] }]"/>
        </a-form-item>
        <a-form-item v-if="init.modalType=='edit'" v-show="false">
          <a-input v-decorator="['userId']"/>
        </a-form-item>
        <a-form-item label="直推后台权限" :label-col="{ span: 7 }" :wrapper-col="{ span: 16 }">
          <a-radio-group v-decorator="['isShareAgentSystemEnabled', {rules: [{required: true, message: '请选择状态'}] } ]">
            <a-radio value="1">启用</a-radio>
            <a-radio value="0">停用</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="无限代后台权限" :label-col="{ span: 7 }" :wrapper-col="{ span: 16 }">
          <a-radio-group v-decorator="['isUnlimitedAgentSystemEnabled', {rules: [{required: true, message: '请选择状态'}] } ]">
            <a-radio value="1">启用</a-radio>
            <a-radio value="0">停用</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>

  </div>
</template>

<script>
import Vue from "vue";
import { Component, Lifecycle } from "vue-decorators"

@Component({
  formOptions: "id"
})
export default class AgentPermission extends Vue {
  table = {
    key: 1,
    columns: [
      { title: "用户名", dataIndex: "userName" },
      { title: "用户ID", dataIndex: "userId" },
      { title: "添加时间", dataIndex: "updateTime" },
      { title: "操作人", dataIndex: "adminName" },
      { title: "直推后台权限",  scopedSlots: {customRender: 'isShareAgentSystemEnabled' } },
      { title: "无限代后台权限", scopedSlots: {customRender: 'isUnlimitedAgentSystemEnabled' }  },
      { title: '操作',  dataIndex: 'operate', scopedSlots: { customRender: 'operate' } }
    ],
    dataSource: [],
    pagination: { total: 0, current: 1, pageSize: 10 }
  }
  
  init = {
    loading: false,
    modalShow: false,
    modalType: 'add',
    query: {
      pageNo: 1,
      pageSize: 10,
      userName: ""
    }
  }

  confirmLoading = false;


  @Lifecycle mounted() {
    this.getList();

    if (this.init.modalType == 'add') {
      this.vform.setValue('isShareAgentSystemEnabled', 1);
      this.vform.setValue('isUnlimitedAgentSystemEnabled', 1);
    }
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

  editById(record) {
    this.init.modalShow = true;
    this.init.modalType = 'edit';
    this.vform.setValues(record, true);
  }

  async deleteById(record) {
    if (!await this.$confirm({ title: "删除后，该会员不可登陆直推后台和无限代后台。确定要删除吗？" })) return;
    const res = await this.$service.fetch("/lottery-admin-api/userConfig/removeAgentUser", { userId: record.userId });
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.getList(true);
  }

  // 添加或者修改管理员
  async addAdmin() {
    const form = await this.vform.validate();
    if (form.errors) return 
    const requestUrl = this.init.modalType == 'add' ? '/lottery-admin-api/userConfig/addAgentUser' : '/lottery-admin-api/userConfig/editAgentUser';

    if (this.init.modalType === 'edit') {
      delete form.values.userName
    }

    this.confirmLoading = true;
    const res =  await this.$service.fetch(requestUrl, form.values);
    this.confirmLoading = false;

    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.$message.success(res.message);
    this.init.modalShow = false;
    this.getList();
  }

  async getList(refresh) {
    if (refresh) this.resetPagination();

    this.init.loading = true;
    const res = await this.$service.fetch('/lottery-admin-api/userConfig/queryPageUserAgent', this.init.query);
    this.init.loading = false;

    if (res.code !== 1) return res.message && this.$message.error(res.message);
    if (res.data?.records instanceof Array) {
      this.table.dataSource = res.data?.records;
      this.table.pagination.total = res.data.totalCount;
    } else {
      this.table.dataSource = [];
      this.table.pagination.total = 0;
    }
  }
}
</script>

<style lang="scss" scoped>
.agent-permission {
  min-height: 100%;
  background-color: #fff;
  padding: 10px;
}
.form-text {
  color: #999;
  text-align: center;
  margin-bottom: 20px;
}

.permission-form /deep/ {
  .ant-form-item {
    margin-bottom: 10px;
  }
}
</style>