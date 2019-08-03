<template>
  <div class="level-wrapper">
    <div>
      <a-button  v-permission="20244" type="primary" @click="doAdd">添加</a-button>&nbsp;
      <a-button type="primary" @click="getList()">查询</a-button>
    </div>
    <a-table class="mytable mt10" bordered :loading="init.loading" 
        :columns="table.columns" :rowKey="(e, i) => i" :dataSource="table.dataSource" :pagination="table.pagination" @change="changePagination"> 
        <template slot="isEnabled" slot-scope="text, record">
          {{ record.isEnabled == 1 ?  '启用' : '禁用' }}
        </template>
        <template slot="registerNum" slot-scope="text, record">
          <a href="javascript:;" class="g-blue bold" @click="$router.push(`/dashboard/memberManage?userName=${record.userName}`)">{{ record.registerNum }}</a> 
        </template>
        <template slot="operation" slot-scope="text, record">
          <a-button  v-permission="20245" class="common-green-btn" @click="editDomain(record)">编辑</a-button>
        </template>
    </a-table>

    <a-modal :title="`${init.modalType == 'add' ? '添加' : '修改'}域名`" v-model="init.showModal"  :destroyOnClose="true" :maskClosable="false">
      <a-form :form="vform">
          <a-form-item v-show="false">
            <a-input v-decorator="['userId']"/>
          </a-form-item>
          <a-form-item v-if="init.modalType == 'edit'" v-show="false">
            <a-input v-decorator="['id']"/>
          </a-form-item>
          <a-form-item label="会员账号" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
            <a-input v-decorator="['userName', { rules: [{required: true, message: '请输入会员账号'}] } ]"/>
          </a-form-item>
          <a-form-item label="域名" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
            <a-input  v-decorator="['domainNameUrl', { rules: [{required: true, message: '请输入域名'}] }]"/>
          </a-form-item>
          <a-form-item label="状态" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
            <a-select v-decorator="['isEnabled', { rules: [{required: true, message: '请选择是否启用'}] } ]">
              <a-select-option value="">请选择</a-select-option>
              <a-select-option value="1">启用</a-select-option>
              <a-select-option value="0">禁用</a-select-option>
            </a-select>
          </a-form-item>
        </a-form>
        <footer slot="footer">
          <a-button type="primary" :loading="init.loading" @click="addOrEditLevel">确定</a-button>
        </footer>
    </a-modal>

  </div>
</template>

<script>
import Vue from "vue";
import { Component, Lifecycle, InjectComponents } from "vue-decorators";

@Component({ formOptions: "id" })
export default class DomainSetting extends Vue {
  table = {
    key: 1,
    columns: [
      { title: "会员账号", dataIndex: "userName" },
      { title: "域名链接", dataIndex: "domainNameUrl" },
      { title: "添加时间", dataIndex: "createTime"},
      { title: "状态", scopedSlots: { customRender: "isEnabled" }},
      { title: "注册人数", scopedSlots: { customRender: "registerNum" } },
      { title: "操作", scopedSlots: { customRender: "operation" } }
    ],
    dataSource: [],
    pagination: { total: 0, current: 1 }
  };

  init = {
    loading: false,
    showModal: false,
    modalType: 'add',
    query: { pageNo: 1, pageSize: 10}
  };

  @Lifecycle mounted() {
    this.vform.setValue('userId', '0');
    this.vform.setValue('isEnabled', '');
    this.getList();
  }

  // 添加操作
  doAdd() {
    // 后台要求新增id默认传0
    this.vform.setValue('userId', 0);
    this.init.showModal = true;
    this.init.modalType = 'add';
  }

  // 添加或者编辑
  async addOrEditLevel() {
    let requestUrl = "";
    if (this.init.modalType === 'add') {
      requestUrl = "/lottery-admin-api/promotionDomainName/addPromotionDomain";
    } else {
      requestUrl = "/lottery-admin-api/promotionDomainName/editPromotionDomain"
    }
    const form = await this.vform.validate();
    if (form.errors) return;
    const res = await this.$service.fetch(requestUrl, form.values);
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.$message.success(res.message);
    this.getList();
  }

  // 展示编辑域名的弹窗
  editDomain(record) {
    this.vform.setValues(record, true);
    this.init.showModal = true;
    this.init.modalType = 'edit';
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

  async getList(refresh) {
     if (refresh) this.resetPagination(); 

    this.init.loading = true;
    const res = await this.$service.fetch('/lottery-admin-api/promotionDomainName/queryPagePromotionDomain', this.init.query);
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