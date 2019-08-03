<template>
  <div class="subaccount-box page-container">
    <a-form layout="inline" :form="form">
      <a-form-item label="第三方名称">
        <a-input v-decorator="['paymentChannelName']"/>
      </a-form-item>

      <a-form-item label="状态" style="margin-left:10px;margin-right:10px;">
        <a-select v-decorator="['isEnabledForcedly', {initialValue:''}]" style="width:120px;">
          <a-select-option :value="''">全部</a-select-option>
          <a-select-option :value="1">启用</a-select-option>
          <a-select-option :value="0">禁用</a-select-option>
        </a-select>
      </a-form-item>

      <a-button type="primary" :loading="init.loading" @click="pagination.current = 1;submit(true);" v-permission="10058">查询</a-button>

      <br>
      <a-button type="primary" @click="showAdd=true" v-permission="10056">添加</a-button>
    </a-form>

    <a-table class="mytable mt15" bordered :columns="columns" :dataSource="dataSource" :rowKey="e => e.id" :pagination="false">
      <template slot="operation" slot-scope="r, t">
        <a-button type="primary" size="small" @click="edit(t)" v-permission="10057">修改</a-button>
      </template>

      <template slot="isEnabled" slot-scope="r, t">{{t.isEnabledForcedly===1?'启用':'禁用'}}</template>

      <template slot="encodeType" slot-scope="r, t">{{t.encodeType===1?'MD5':'RSA'}}</template>
    </a-table>

    <a-pagination
      :current="pagination.current"
      class="mt15"
      style="text-align:right;"
      :total="pagination.total"
      @change="changePagination"
      @showSizeChange="showSizeChange"
    />

    <add-third-out v-if="showAdd" @close="showAdd=false" @ok="submit" :details="dataSource"></add-third-out>

    <edit-third-out v-if="showEdit" @close="showEdit=false" :details="details" @ok="submit"></edit-third-out>
  </div>
</template>

<script>
import Vue from "vue";
import { Component, Lifecycle, Watch, InjectComponents } from "vue-decorators";
import addThirdOut from "./AddThirdOut";
import editThirdOut from "./EditThirdOut";
@Component({})
@InjectComponents({ addThirdOut, editThirdOut })
export default class ThirdPartyOut extends Vue {
  pagination = { total: 0, current: 1 };
  pageSize = 10;

  async changePagination(p, s) {
    this.pagination.current = p;
    this.pageSize = s;
    await this.submit();
  }
  async showSizeChange(p, s) {
    this.pagination.current = p;
    this.pageSize = s;
    await this.submit();
  }

  details = {};
  showEdit = false;
  showAdd = false;
  columns = [
    { title: "ID", dataIndex: "id" },
    { title: "第三方名称", dataIndex: "paymentChannelName" },
    { title: "网关地址", dataIndex: "thirdGateway" },
    // { title: "回调地址", dataIndex: "回调地址" },
    { title: "接入方式", scopedSlots: { customRender: "encodeType" } },
    { title: "状态", scopedSlots: { customRender: "isEnabled" } },
    { title: "操作", scopedSlots: { customRender: "operation" } }
  ];

  dataSource = [];

  init = {
    loading: false
  }

  @Lifecycle() async created() {
    this.form = this.$form.createForm(this);
    this.pagination.current = 1;
    await this.submit();
  }

  resetPagination() {
    this.pagination.current = 1;
  }

  async submit(reset) {
    if (reset) this.resetPagination();

    this.form.validateFields(async (e, v) => {
      if (e) return;
      this.init.loading = true;
      let r = await this.$service.fetch( "/config-admin-api/thirdPayment/queryPageThirdPayment", { paymentType: 20, pageNo: this.pagination.current, pageSize: this.pageSize, ...v } );
      this.init.loading = false;
      if (1 !== r.code) return r.message && this.$message.error(r.message);
      this.dataSource = r.data?.records;
      this.pagination.total = r.data?.totalCount;
    });
  }

  async edit(t) {
    let r = await this.$service.fetch('/config-admin-api/thirdPayment/getThirdPaymentById', {id: t.id})
    if (r.code !== 1) return r.message&&this.$message.error(r.message);
    delete r.data.thirdPaymentWay;
    this.details = r.data||{};
    this.showEdit = true;
  }
}
</script>

<style lang="scss" scoped>
@import "@views/admin/Pop.scss";
.subaccount-box /deep/ {
  .ant-btn {
    margin-top: 4px;
  }
}
</style>
