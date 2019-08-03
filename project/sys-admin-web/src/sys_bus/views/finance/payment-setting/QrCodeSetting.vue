<template>
  <section class="bank-setting">
    <a-form class="qrcode" layout="inline" :form="vform" @submit.prevent="getList(true)">
      <a-form-item class="qr-range">
        <DateRange title="创建时间" @change="changeDate"/>
      </a-form-item>
      <a-form-item label="支付名称">
        <a-input class="qr-input" v-decorator="['qrcodeName']"/>
      </a-form-item>
       <a-form-item label="账号">
        <a-input class="qr-input" v-decorator="['account']"/>
      </a-form-item>
       <a-form-item label="昵称">
        <a-input class="qr-input" v-decorator="['nickName']"/>
      </a-form-item>
       <a-form-item label="创建人">
        <a-input class="qr-input" v-decorator="['createAdminName']"/>
      </a-form-item>
      <a-form-item label="状态">  
        <a-select v-decorator="['isEnabled']"  style="width: 80px;">
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="1">启用</a-select-option>
            <a-select-option value="0">停用</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="使用端">
        <a-select v-decorator="['clientType']"  style="width: 80px;">
            <a-select-option value="">全部</a-select-option>
            <!-- <a-select-option value="3">APP</a-select-option>
            <a-select-option value="4">H5</a-select-option>
            <a-select-option value="8">PC</a-select-option>
            <a-select-option value="15">通用</a-select-option> -->
            <a-select-option v-for="(item, index) in dictionary.clientType2" :key="index" :value="item.value">{{item.name}}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item>
          <a-button type='primary' html-type="submit" :loading="init.loading">查询</a-button>
      </a-form-item>
    </a-form>

    <div class="page-under-table">
      <div>
        <a-button v-permission="20054"  type='primary' size="small" @click="init.modalShow=true;init.modalType='add'">添加</a-button> &nbsp;
        <a-button v-permission="20055" type='primary' size="small" @click="deletBankByIds">删除</a-button> &nbsp;
        <a-button v-permission="20057" type='primary' size="small" @click="enableOrDisableBankCard(1)">启用</a-button> &nbsp;
        <a-button v-permission="20058" type='primary' size="small" @click="enableOrDisableBankCard(0)">停用</a-button> &nbsp;
        <a-button v-permission="20059" type='primary' size="small" @click="init.showConfiguration = true;">分层配置</a-button>
      </div>
    </div>
    <div class="table-wrapper mt10">
      <a-table 
          :key="table.key"
          class="mytable" bordered :loading="init.loading" :columns="table.columns" :dataSource="table.dataSource" 
          :rowSelection="table.rowSelection" :pagination="table.pagination" :rowKey="(e, i) => i"
          @change="changePagination"
      >
        <template slot="qrcodeUrl" slot-scope="text,records">
          <a href="javascript:;" class="g-blue" @click.prevent="previewImage(records.qrcodeUrl)">点击预览</a>
        </template>
        <template slot="clientType" slot-scope="text,records">
          <!-- <span>{{getClientType(records.clientTypeStr)}}</span> -->
          <span> {{ $getText(records.clientType, dictionary.clientType2) }}</span>
        </template>
        <template slot="isEnabled" slot-scope="text,records">
          <span class="g-green bold" v-if="records.isEnabled == 1">启用</span>
          <span class="g-red bold" v-else>停用</span>
        </template>
        <template slot="operate" slot-scope="text,records">
          <a-button  v-permission="20056" type="primary" size="small" @click.prevent="showModal(records)">修改</a-button> &nbsp;
          <a-button  v-permission="20060" type="primary" size="small" @click.prevent="showUserGroupById(records)">分配</a-button>
        </template>
      </a-table>
    </div>

    <a-modal title="添加二维码" v-model="init.modalShow" :footer="null" :destroyOnClose="true" :width="540" :maskClosable="false">
      <QrCode @close="init.modalShow=false;getList(true)" :id="init.editId" :type="init.modalType" :paymentId="init.paymentId"/>
    </a-modal>

    <a-modal title="分层配置" v-model="init.showConfiguration" :footer="null" :destroyOnClose="true" :width="800" :maskClosable="false">
      <Configuration @close="init.showConfiguration=false" configType="qrcode"/>
    </a-modal>

    <a-modal title="分配会员组" v-model="init.showUserGroup" :footer="null" :destroyOnClose="true" :width="460" :maskClosable="false">
      <ConfigUserGroup ref="userGroup" :paymentType="3" :id="init.bankId" @close="init.showUserGroup=false"/>
    </a-modal>

  </section>
</template>

<script>
import Vue from 'vue'
import { Component, Lifecycle, Prop, Watch, InjectComponents } from 'vue-decorators'
import DateRange from "@/components/date-range/DateRange"
import QrCode from "./qrcode/qrcode"
import ConfigUserGroup from "./bank/ConfigUserGroup"
import Configuration from "./bank/configuration"

@Component({ dictionary: 'clientType2', formOptions: "id" })
@InjectComponents({ DateRange, QrCode, ConfigUserGroup, Configuration })
export default class QrCodeSetting extends Vue {
  table = {
    key: 1,
    columns: [
      { title: 'ID',  dataIndex: 'id'},
      { title: '支付名称', dataIndex: 'paymentName'}, 
      { title: '账号', dataIndex: 'account'}, 
      { title: '昵称', dataIndex: 'nickName'}, 
      { title: '图片名称', dataIndex: 'qrcodeUrl', scopedSlots: { customRender: 'qrcodeUrl' }}, 
      { title: '创建人', dataIndex: 'createAdminName'}, 
      { title: '创建时间', dataIndex: 'createTime'}, 
      { title: '排序', dataIndex: 'sortOrder'}, 
      { title: '使用端', dataIndex: 'clientType', scopedSlots: { customRender: 'clientType' }}, 
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
    query: { pageNo: 1, pageSize: 10, createTimeStart: "", createTimeEnd: "" },
    loading: false,
    modalShow: false,
    editId: "",
    modalType: 'add',
    paymentId: "",
    bankId: "",
    showConfiguration: false,
    showUserGroup: false
  }

  @Lifecycle mounted() {
    this.setInitialChecked();
    this.getList();
  }

   // 设定表单初始值
  setInitialChecked() {
    this.vform.setValue('clientType', '');
    this.vform.setValue('isEnabled', '');
  }

  // 点击预览图片
  previewImage(url) {
    const AImagePreview = Vue.component("aImage", {
      template: '<div class="modal-image-wrap"><img :src="src" /></div>',
      props: { src: { type: String } }
    });
    this.$modal.info({
      title: "图片预览",
      content: <AImagePreview src={url}/>
    });
  }

  changeDate(startTime, endTime, datestring, type) {
    if (type === "start") {
      this.init.query.createTimeStart = datestring
    } else {
      this.init.query.createTimeEnd = datestring
    }
  }

  resetPagination() {
    this.table.pagination.current = 1;
    this.init.query.pageNo = 1;
    this.table.key = Math.random();
  }

  // 显示是否分配
  showUserGroupById(item) {
    this.init.bankId = item.id;
    this.init.showUserGroup = true;
  }

  // 删除或启用禁用成功后的回调函数
  successCallBack(res) {
   this.$message.success(res.message);
   this.getList(true);
   this.table.key = Math.random();
  }

  getClientType(str) {
    const arr = str.split(',');
    let total = 0;
    arr.forEach(item => total += parseInt(item, 10));
    switch(total) {
      case 15:
        return "通用";
      case 8: 
        return "PC"
      case 4:
        return "H5"
      case 3:
        return "APP"
      default:
        return "通用";       
    }
  }

  // 启用或者禁用银行卡(type=1开启, type=0关闭)
  async enableOrDisableBankCard(type) {
    const ids = this.table.selectedRowKeys.map(item => {
      return { id: item, isEnabled: type, paymentType: 3 }
    });
    if (!ids.length) {
      this.$message.error("请先选择二维码");
      return;
    }
    if (!await this.$confirm({title: "提示", content: `变更已选中项目状态为${type == 1 ? '启用': '停用'}？`})) return;
    const res = await this.$service.fetch('/config-admin-api/payment/batchEnable', {list: ids});
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.successCallBack(res);
  }

  // 删除银行卡
  async deletBankByIds() {
   const ids =  this.table.selectedRowKeys.map(item => {
     return { id: item}
   });
   if (!ids.length) {
     this.$message.error("请先选择要删除的二维码");
     return;
   }
   if (!await this.$confirm({title: "提示", content: "确定要删除已选中的内容？"})) return;
   const res = await this.$service.fetch('/config-admin-api/qrcodePayment/batchRemoveQrcodePayment', {list: ids} );
   if (res.code !== 1) return res.message && this.$message.error(res.message);
   this.successCallBack(res);
  }

  async getList(refresh) {
    if (refresh) this.resetPagination(); 
    const form = await this.vform.validate();
    const values = this.$trimValues(form.values);
    const params = Object.assign(this.init.query, values);

    this.init.loading = true;
    const res = await this.$service.fetch('/config-admin-api/qrcodePayment/queryPageQrcodePayment', params);
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

  changePagination(pagination) {
    this.table.pagination.current = pagination.current;
    this.init.query.pageNo = pagination.current;
    this.table.key = Math.random();
    this.table.selectedRowKeys = [];
    this.getList();
  }

  showModal(item) {
    this.init.editId = item?.id;
    this.init.paymentId = item?.paymentId;
    this.init.modalType = 'edit';
    this.init.modalShow = true;
  }

}

</script>

<style lang="scss" scoped>
.qrcode /deep/{
  .qr-range {
    .ant-form-item {
      margin-right: 0;
    }
  }
  .ant-input {
    width: 170px;
  }
  .qr-input {
    width: 120px;
  }
}
.modal-image-wrap /deep/{
  text-align: center;

  img {
    max-width: 100%;
  }
}
</style>