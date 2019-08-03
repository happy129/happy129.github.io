<template>
  <div class="bank-setting">
    <a-form class="qrcode" layout="inline" :form="vform" @submit.prevent="getList(true)">
      <a-form-item class="qr-range">
        <DateRange title="创建时间" @change="changeDate"/>
      </a-form-item>
      <a-form-item label="第三方支付">
        <a-input class="qr-input" v-decorator="['paymentChannelName']"/>
      </a-form-item>
      <a-form-item label="使用端">
        <a-select v-decorator="['clientType']"  style="width: 80px;">
            <a-select-option value="">全部</a-select-option>
            <a-select-option v-for="(item, index) in dictionary.clientType2"  :key="index" :value="item.value">{{item.name}}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="状态">  
        <a-select v-decorator="['isEnabled']"  style="width: 80px;">
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="1">启用</a-select-option>
            <a-select-option value="0">停用</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item style="display:none">
        <a-input v-decorator="['paymentType']"/>
      </a-form-item>
      <a-form-item>
          <a-button type='primary' html-type="submit" :loading="init.loading">查询</a-button>
      </a-form-item>
    </a-form>

    <div class="page-under-table">
      <div>
        <!-- <a-button type='primary' size="small" @click="init.modalShow=true;init.modalType='add'">添加</a-button> &nbsp;
        <a-button type='primary' size="small" @click="deletBankByIds">删除</a-button> &nbsp; -->
        <a-button v-permission="20065"  type='primary' size="small" @click="enableOrDisableBankCard(1)">启用</a-button> &nbsp;
        <a-button v-permission="20066"  type='primary' size="small" @click="enableOrDisableBankCard(0)">停用</a-button> &nbsp;
        <a-button v-permission="20067"  type='primary' size="small" @click="init.showConfiguration=true">分层配置</a-button>
      </div>

      <div class="table-wrapper mt10">
        <a-table 
            :key="table.key"
            class="mytable" bordered :loading="init.loading" :columns="table.columns" :dataSource="table.dataSource" 
            :rowSelection="table.rowSelection" :pagination="table.pagination" :rowKey="(e, i) => i"
            @change="changePagination"
        >
          <template slot="encodeType" slot-scope="text, record">
            <span> {{ record.encodeType == 1 ? 'MD5' : 'RSA'}} </span>
          </template>
          <template slot="isSearchInterfaceEnabled" slot-scope="text,records">
            <span>{{records.isSearchInterfaceEnabled == 0 ? "关闭" : "开启"}}</span>
          </template>
          <template slot="clientType" slot-scope="text,records">
            <span>{{$getText(records.clientType, dictionary.clientType2)}}</span>
          </template>
          <template slot="isEnabled" slot-scope="text,records">
            <span class="g-green bold" v-if="records.isEnabled == 1">启用</span>
            <span class="g-red bold" v-else>停用</span>
          </template>
          <template slot="operate" slot-scope="text,records">
            <div class="operation-container">
              <a-button v-permission="20064"  class="common-green-btn"  @click.prevent="showModal(records)">修改</a-button>
              <a-button v-permission="20065"  class="common-green-btn" @click="enableOrDisableBankCard(1, records.id)" v-if="records.isEnabled==0">启用</a-button>
              <a-button v-permission="20066"  class="common-red-btn" @click="enableOrDisableBankCard(0, records.id)" size="small" v-if="records.isEnabled==1">停用</a-button>
              <a-button v-permission="200681"  class="common-blue-btn" @click.prevent="showPayMethods(records)">查看支付方式</a-button>
            </div>
          </template>
        </a-table>
      </div>
    </div>
    
    <a-modal title="修改在线支付" v-model="init.modalShow" :footer="null" :destroyOnClose="true" :width="620" :maskClosable="false">
      <Online @close="init.modalShow=false;getList(true)" :paymentTypeName="paymentTypeName" :id="init.editId" :type="init.modalType" :encodeType="init.cryptoType" :paymentName="paymentName" :paymentId="init.paymentId"/>
    </a-modal>

    <a-modal title="分层配置" v-model="init.showConfiguration" :footer="null" :destroyOnClose="true" :width="800" :maskClosable="false">
      <Configuration @close="init.showConfiguration=false" configType="third"/>
    </a-modal>

    <a-modal title="分配支付方式" v-model="init.showPayMethods" :footer="null" :destroyOnClose="true" :width="800" :maskClosable="false">
      <PayMethods :id="init.showPayMethodsId"/>
    </a-modal>  

  </div>
</template>

<script>
import Vue from 'vue'
import { Component, Lifecycle, Prop, Watch, InjectComponents } from 'vue-decorators'
import DateRange from "@/components/date-range/DateRange"
import Online from "./online/Online"
import Configuration from "./bank/configuration"
import PayMethods from "./online/PayMethods"

@Component({ dictionary: 'clientType2', formOptions: "id" })
@InjectComponents({ DateRange, Online, Configuration, PayMethods })
export default class OnlinePaymentSetting extends Vue {

  //clientTypes = [{ value: 15, name: "通用" }, { value: 8, name: "PC"}, { value: 4, name: "H5"}, { value: 3, name: "APP"}];
  
  table = {
    key: 1,
    columns: [
      { title: 'ID',  dataIndex: 'id'},
      //{ title: '入款类型', dataIndex: 'paymentTypeName'}, 
      { title: '第三方支付', dataIndex: 'paymentName'}, 
      { title: '接入方式', scopedSlots: { customRender: "encodeType"}}, 
      { title: '商户ID', dataIndex: 'merchantCode'}, 
      { title: '使用端', dataIndex: 'clientType', scopedSlots: { customRender: 'clientType' }}, 
      { title: '直接查询接口', dataIndex: 'isSearchInterfaceEnabled', scopedSlots: { customRender: 'isSearchInterfaceEnabled'}}, 
      { title: '创建时间', dataIndex: 'createTime'}, 
      { title: '排序', dataIndex: 'sortOrder'}, 
      { title: '状态', dataIndex: 'isEnabled', scopedSlots: { customRender: 'isEnabled' }}, 
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
    query: { pageNo: 1, pageSize: 10, createTimeStart: "", createTimeEnd: ""},
    loading: false,
    modalShow: false,
    editId: "",
    modalType: 'add',
    paymentId: "",
    bankId: "",
    showUserGroup: false,
    showConfiguration: false,
    showPayMethods: false,
    showPayMethodsId: "",
    cryptoType: 1
  };

  paymentName = "";
  paymentTypeName = "";

  @Lifecycle mounted() {
    this.setInitialChecked();
    this.getList();
  }

   // 设定表单初始值
  setInitialChecked() {
    this.vform.setValue('clientType', '');
    this.vform.setValue('isEnabled', '');
    this.vform.setValue('paymentChannelName', '');
    this.vform.setValue('paymentType', 4);
  }

  showModal(records) {
   this.init.editId = records.id;
   this.paymentName = records.paymentChannelName;
   this.paymentTypeName = records.paymentTypeName;
   this.init.modalShow = true;
   this.init.modalType = 'edit';
   this.init.paymentId = records.paymentId;
   this.init.cryptoType = records.encodeType
  }

  changeDate(startTime, endTime, datestring, type) {
    if (type === "start") {
      this.init.query.createTimeStart = datestring
    } else {
      this.init.query.createTimeEnd = datestring
    }
  }

  changePagination(pagination) {
    this.table.pagination.current = pagination.current;
    this.init.query.pageNo = pagination.current;
    this.table.key = Math.random();
    this.table.selectedRowKeys = [];
    this.getList();
  }

  resetPagination() {
    this.table.pagination.current = 1;
    this.init.query.pageNo = 1;
    this.table.key = Math.random();
  }

  // 删除或启用禁用成功后的回调函数
  successCallBack(res) {
   this.$message.success(res.message);
   this.getList(true);
   this.table.key = Math.random();
  }

  // 查看支付方式
  showPayMethods(item) {
    this.init.showPayMethodsId = item.id;
    this.init.showPayMethods = true;
  } 

  // 删除银行卡
  async deletBankByIds() {
   const ids =  this.table.selectedRowKeys.map(item => {
     return { id: item}
   });
   if (!ids.length) {
     this.$message.error("无选中内容");
     return;
   }
   if (!await this.$confirm({title: "提示", content: "确定要删除已选中的内容？"})) return;
   const res = await this.$service.fetch('/config-admin-api/thirdPayment/batchRemoveThirdPayment', {list: ids} );
   if (res.code !== 1) return res.message && this.$message.error(res.message);
   this.successCallBack(res);
  }

  // 启用或者禁用银行卡(type=1开启, type=0关闭)
  async enableOrDisableBankCard(type, recordsId) {
    let ids = [];
    if (!recordsId) {
      ids = this.table.selectedRowKeys.map(item => {
        return { id: item, isEnabled: type, paymentType: 4 }
      });
    } else {
      // 列表内启用禁用
      ids = [{
        id: recordsId,
        isEnabled: type,
        paymentType: 4
      }];
    }
    if (!ids.length) {
      this.$message.error("无选中内容");
      return;
    }
    if (!await this.$confirm({title: "提示", content: `变更已选中项目状态为${type == 1 ? '启用': '停用'}？`})) return;
    const res = await this.$service.fetch('/config-admin-api/payment/batchEnable', {list: ids});
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.successCallBack(res);
  }

  async getList(refresh) {
    if (refresh) this.resetPagination(); 
    const form = await this.vform.validate();
    const values = this.$trimValues(form.values);
    const params = Object.assign(this.init.query, values);

    this.init.loading = true;
    const res = await this.$service.fetch('/config-admin-api/thirdPayment/queryPageThirdPayment', params);
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
<style lang="scss" scoped>
/deep/  .operation-container {
  button {
    margin-right: 5px;
  }
}
</style>
