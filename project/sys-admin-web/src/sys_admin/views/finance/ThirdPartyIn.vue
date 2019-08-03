<template>
  <div class="subaccount-box page-container">
    <a-form layout="inline" :form="form">
      <a-form-item label="第三方支付">
        <a-input v-decorator="['paymentChannelName', { initialValue: ''}]"/>
      </a-form-item>

      <a-form-item label="状态" style="margin-left:10px;margin-right:10px;">
        <a-select v-decorator="['isEnabledForcedly', { initialValue: ''}]" style="width:120px;">
          <a-select-option :value="''">全部</a-select-option>
          <a-select-option :value="1">启用</a-select-option>
          <a-select-option :value="0">禁用</a-select-option>
        </a-select>
      </a-form-item>
      <a-button type="primary" :loading="init.loading" @click="pagination.current = 1;getData(true);" v-permission="10051">查询</a-button>
      <br>
      <a-button type="primary" @click="showAdd=true" v-permission="10052">添加</a-button>
    </a-form>

    <a-table class="mytable mt15" bordered :columns="columns" :dataSource="dataSource" :rowKey="e => e.id" :pagination="false">
      <template slot="operation" slot-scope="r, t">
        <a-button type="primary" size="small" @click="edit(t, 'showEdit');" v-permission="10053">修改</a-button>
        <a-button type="primary" size="small" style="margin-left:10px;" @click="edit(t, 'showAddP');" v-permission="10054">支付方式</a-button>
      </template>
      <template slot="remark" slot-scope="text, record">
        <p class="remark">{{record.remark}}</p>
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

    <add-third-in v-if="showAdd" @close="showAdd=false" @ok="getData" :details="details"></add-third-in>
    <edit-third-in v-if="showEdit" @close="showEdit=false" :details="details" @ok="getData"></edit-third-in>
    <add-payment-way v-if="showAddP" @close="showAddP=false" @ok="getData" :det="detailsforpayment"></add-payment-way>
  </div>
</template>

<script>
import Vue from "vue";
import { Component, Lifecycle, Watch, InjectComponents } from "vue-decorators";
import addThirdIn from "./AddThirdIn";
import editThirdIn from "./EditThirdIn";
import addPaymentWay from "./AddPaymentWay";
@Component({})
@InjectComponents({ addThirdIn, editThirdIn, addPaymentWay })
export default class ThirdPartyIn extends Vue {
  pagination = { total: 0, current: 1 };
  pageSize = 10;

  async changePagination(p, s) {
    this.pagination.current = p;
    this.pageSize = s;
    await this.getData();
  }
  async showSizeChange(p, s) {
    this.pagination.current = p;
    this.pageSize = s;
    await this.getData();
  }

  showAddP = false;
  details = {};
  detailsforpayment = {};
  showEdit = false;
  dataSource = [];
  showAdd = false;
  columns = [
    { title: "ID", dataIndex: "id" },
    { title: "第三方支付", dataIndex: "paymentChannelName" },
    { title: "网关地址", dataIndex: "thirdGateway" },
    { title: "接入方式", scopedSlots: { customRender: "encodeType" } },
    { title: "对接备注", scopedSlots: { customRender: 'remark' } },
    { title: "状态", scopedSlots: { customRender: "isEnabled" } },
    { title: "操作", scopedSlots: { customRender: "operation" } }
  ];

  init = { loading: false };

  resetPagination() {
    this.pagination.current = 1;
  }

  getData(reset) {
    if (reset) this.resetPagination();
    this.form.validateFields(async (e, v) => {
      if (e) return;
      this.init.loading = true;
      const res = await this.$service.fetch(
        "/config-admin-api/thirdPayment/queryPageThirdPayment",
        { paymentType: 4, pageNo: this.pagination.current, pageSize: this.pageSize, ...v }
      );
      this.init.loading = false;
      if (1 !== res.code) return res.message && this.$message.error(res.message);
      this.dataSource = res.data?.records;
      this.pagination.total = res.data?.totalCount;
    });
  }

  @Lifecycle() async created() {
    this.form = this.$form.createForm(this);
    this.pagination.current = 1;

    await this.getData();
  }

  async edit(t, showName) {
    let r = await this.$service.fetch( "/config-admin-api/thirdPayment/getThirdPaymentById", { id: t.id } );
    if (r.code !== 1) return r.message && this.$message.error(r.message);
    if (showName === 'showAddP') {
      this.detailsforpayment = r.data || {};
    } else if (showName === 'showEdit') {
      delete r.data.thirdPaymentWay;
      this.details = r.data || {};
    }
    this[showName] = true;
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
.remark {
  max-width: 200px;
  word-break: break-all;
}
</style>
