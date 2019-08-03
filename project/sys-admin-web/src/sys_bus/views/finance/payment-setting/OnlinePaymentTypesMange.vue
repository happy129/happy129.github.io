<template>
  <div class="bank-setting">
    <a-form layout="inline" :form="form1" @submit.prevent="getList(true)">
      <a-form-item label="第三方支付">
        <a-input class="qr-input" v-decorator="['paymentChannelName']"/>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit" :loading="init.loading">查询</a-button>
      </a-form-item>
    </a-form>
    <div class="page-under-table">
       <a-table 
            :key="table.key"
            class="mytable" bordered :loading="init.loading" :columns="table.columns" :dataSource="table.dataSource" 
            :pagination="false" :rowKey="(e, i) => i"
            @change="changePagination"
        >
          <template slot="connectionType" slot-scope="text, records">
            <span>{{records.connectionType == 0 ? "直连" : "非直连"}}</span>
          </template>
          <template slot="operate" slot-scope="text, records">
            <a-button v-permission="20070" type="primary" size="small" @click="editPaymentById(records)">修改</a-button>&nbsp;
            <a-button v-permission="20071" type="primary" size="small" @click="editPaymentMethods(records)">支付方式管理</a-button>
          </template>
       </a-table> 
    </div>

    <a-modal title="修改在线支付类型" v-model="init.modalShow" :footer="null" :maskClosable="false"  :destroyOnClose="true" :width="420">
        <a-form class="form-elem" :form="form2" @submit.prevent="editForm">
          <a-form-item v-show="false" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
            <a-input v-decorator="['id']"/>
          </a-form-item>
          <a-form-item label="第三方支付" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
            <a-input disabled v-decorator="['paymentChannelName']"/>
          </a-form-item>
          <a-form-item label="编码" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
            <a-input v-decorator="['thirdPaymentCode']" :disabled="true"/>
          </a-form-item>
          <a-form-item label="链接方式" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
            <a-radio-group v-decorator="['connectionType', {rules: [{required: true, message: '请选择链接方式'}] } ]" :label-col="{ span: 4 }" :wrapper-col="{ span: 18 }">
              <a-radio value="0">直连</a-radio>
              <a-radio value="1">非直连</a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item label="备注" :label-col="{ span: 5 }" :wrapper-col="{ span: 18 }">
            <a-textarea v-decorator="['remark']" :rows="3"/>
          </a-form-item>
          <div class="con-text-right">
            <a-button type="primary" html-type="submit">提交</a-button>
          </div>
        </a-form>
    </a-modal>

    <a-modal title="支付方式管理" v-model="init.payMethodShow" :footer="null" :destroyOnClose="true" :width="720" :maskClosable="false">
      <PayMethodsEdit :id="init.editId"/>
    </a-modal>

  </div>
</template>

<script>
import Vue from 'vue'
import { Component, Lifecycle, Prop, Watch, InjectComponents } from 'vue-decorators'
import PayMethodsEdit from "./online/PayMethodsEdit";

const formOptions = {
  form1: "id",
  form2: "name"
};

@Component({ dictionary: 'clientType', formOptions })
@InjectComponents({ PayMethodsEdit })
export default class OnlinePaymentTypesManage extends Vue {
  table = {
    key: 1,
    columns: [
      { title: 'ID',  dataIndex: 'id'},
      { title: '第三方支付', dataIndex: 'paymentChannelName'}, 
      { title: '编码', dataIndex: 'thirdPaymentCode'}, 
      { title: '链接类型', dataIndex: 'connectionType',  scopedSlots: { customRender: 'connectionType' } }, 
      { title: '备注', dataIndex: 'remark'}, 
      { title: '操作',  dataIndex: 'operate', scopedSlots: { customRender: 'operate' } }
    ],
    selectedRowKeys: [],
    rowSelection: {
      onChange: (selectedRowKeys, selectedRows) => {
        this.table.selectedRowKeys = selectedRows.map(e => e.id);
      },
    },
    dataSource: [],
    pagination: { total: 0, current: 1 }
  }

  init = {
    query: { pageNo: 1, pageSize: 10, updateTimeStart: "", updateTimeEnd: "", paymentType: 4 },
    loading: false,
    modalShow: false,
    editId: "",
    paymentId: "",
    showUserGroup: false,
    payMethodShow: false
  };

  @Lifecycle mounted() {
    this.getList();
  }

  resetPagination() {
    this.table.pagination.current = 1;
    this.init.query.pageNo = 1;
    this.table.key =  Math.random();
  }

  changePagination(pagination) {
    this.table.pagination.current = pagination.current;
    this.init.query.pageNo = pagination.current;
    this.table.key =  Math.random();
    this.getList();
  }

  /* 修改 */
  editPaymentById(item) {
    this.init.modalShow = true;
    const requestParams = this.table.dataSource.find(elem => elem.id === item.id);
    if (Object.keys(requestParams)?.length) {
      // 填充表单的值
      this.form2.setValues(requestParams, true);
    }
  }

  editPaymentMethods(item) {
    this.init.editId = item.id;
    this.init.payMethodShow = true;
  }

  /* 编辑表单 */
  async editForm () {
    const form = await this.form2.validate();
    if (form.errors) return
    // 删除disabled的字段
    if (form.values.thirdPaymentCode) {
      delete form.values.thirdPaymentCode
    }
    const res = await this.$service.fetch('config-admin-api/thirdPayment/editThirdPaymentForMerchant', form.values);
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.$message.success(res.message);
    this.init.modalShow = false;
  }

  async getList(refresh) {
    if (refresh) this.resetPagination(); 
    const form = await this.form1.validate();
    const values = this.$trimValues(form.values);
    const params = Object.assign(this.init.query, values);

    this.init.loading = true;
    const res = await this.$service.fetch('/config-admin-api/thirdPayment/queryPageThirdPayment', params);
    this.init.loading = false;

    if (res.code !== 1) return res.message && this.$message.error(res.message);
    if (res.code === 1 &&  res.data.records instanceof Array) {
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
.form-elem /deep/ {
  .ant-form-item {
    margin-bottom: 10px;
  }
}

.con-text-right {
  text-align: right;
  margin-right: 20px;
}
</style>
