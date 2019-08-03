<template>
  <div class="bank-setting">
    <a-form layout="inline" :form="vform" @submit.prevent="getBankCardList(true)">
      <a-form-item label="支付名称">
          <a-input v-decorator="['paymentName']"/>
      </a-form-item>
      <a-form-item label="银行卡号">
          <a-input v-decorator="['bankCardNo']" type="number" @change="$number"/>
      </a-form-item>
      <a-form-item label="持卡人">
          <a-input v-decorator="['realName']"/>
      </a-form-item>
      <a-form-item label="银行名称">
          <a-input v-decorator="['bankName']"/>
      </a-form-item>
      <a-form-item label="使用端">
        <a-select v-decorator="['clientType']"  style="width: 80px;">
          <a-select-option value="">全部</a-select-option>
          <a-select-option v-for="(item, index) in dictionary.clientType2" :key="index" :value="item.value">{{item.name}}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="状态">  
        <a-select v-decorator="['isEnabled']"  style="width: 80px;">
            <a-select-option value="">全部</a-select-option>
            <a-select-option value="1">启用</a-select-option>
            <a-select-option value="0">停用</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item>
          <a-button type='primary' html-type="submit" :loading="init.loading">查询</a-button>
      </a-form-item>
    </a-form>
    <div class="page-under-table">
      <div>
        <a-button v-permission="20046" type='primary' size="small" @click="init.modalShow=true;init.modalType='add'">添加</a-button> &nbsp;
        <a-button v-permission="20047" type='primary' size="small" @click="deletBankByIds">删除</a-button> &nbsp;
        <a-button v-permission="20049" type='primary' size="small" @click="enableOrDisableBankCard(1)">启用</a-button> &nbsp;
        <a-button v-permission="20050" type='primary' size="small" @click="enableOrDisableBankCard(0)">停用</a-button> &nbsp;
        <a-button v-permission="20051" type='primary' size="small" @click="showConfiguration">分层配置</a-button>
      </div>
    </div>
    <div class="table-wrapper mt10">
      <a-table 
          :key="table.key"
          class="mytable" bordered :loading="init.loading" :columns="table.columns" :dataSource="table.dataSource" 
          :rowSelection="table.rowSelection" :pagination="table.pagination" :rowKey="(e, i) => i"
          @change="changePagination"
      >
        <template slot="bankName" slot-scope="text,records">
          <p class="bank-address">{{records.bankName}}</p>
        </template>
        <template slot="clientType" slot-scope="text,records">
          <span>{{ $getText(records.clientType, dictionary.clientType2) }}</span>
        </template>
        <template slot="isEnabled" slot-scope="text,records">
          <span class="g-green bold" v-if="records.isEnabled == 1">启用</span>
          <span class="g-red bold" v-else>停用</span>
        </template>
        <template slot="operate" slot-scope="text,records">
          <a-button type="primary" size="small" v-permission="20048"  @click.prevent="showModal(records)">修改</a-button> &nbsp;
          <a-button type="primary" size="small" v-permission="20052"  @click="showUserGroupById(records)">分配</a-button>
        </template>
      </a-table>
    </div>

    <a-modal title="添加汇款银行" v-model="init.modalShow" :footer="null" :destroyOnClose="true" :width="540" :maskClosable="false">
      <Bank @close="init.modalShow=false;getBankCardList(true)" :id="init.editId" :type="init.modalType" :paymentId="init.paymentId"/>
    </a-modal>

    <a-modal title="分层配置" v-model="init.showConfiguration" :footer="null" :destroyOnClose="true" :width="800" :maskClosable="false">
      <Configuration @close="init.showConfiguration=false" configType="bank"/>
    </a-modal>
    
    <a-modal title="分配会员组" v-model="init.showUserGroup" :footer="null" :destroyOnClose="true" :width="460" :maskClosable="false">
      <!-- // 支付分类1:银行卡|2:充值卡|3:二维码|4:第三方支付|20:第三方出款  -->
      <ConfigUserGroup ref="userGroup" :paymentType="1" :id="init.bankId" @close="init.showUserGroup=false"/>
    </a-modal>

  </div>
</template>

<script>
import Vue from 'vue'
import { Component, Lifecycle, Prop, Watch, InjectComponents } from 'vue-decorators'
import Bank from "./bank/bank"
import Configuration from "./bank/configuration"
import ConfigUserGroup from "./bank/ConfigUserGroup"
import { parse } from 'path';

@Component({ dictionary: 'clientType2', formOptions: "id" })
@InjectComponents({ Bank, Configuration, ConfigUserGroup })
export default class BankSetting extends Vue {
  table = {
    key: 1,
    columns: [
      { title: 'ID',  dataIndex: 'id'},
      { title: '支付名称', dataIndex: 'paymentName'}, 
      { title: '银行卡号', dataIndex: 'bankCardNo'}, 
      { title: '持卡人', dataIndex: 'realName'}, 
      { title: '银行名称', dataIndex: 'bankName', scopedSlots: { customRender: 'bankName' }}, 
      { title: '使用端', dataIndex: 'clientType', scopedSlots: { customRender: 'clientType' }}, 
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
    query: { pageNo: 1, pageSize: 10 },
    loading: false,
    modalShow: false,
    editId: "",
    modalType: 'add',
    paymentId: "",
    showConfiguration: false,
    // 获取所有会员组的数据
    userGroupData: [],
    // 点击分配按钮，进行分配
    showUserGroup: false,
    // 为银行卡分配id
    bankId: ""
  }

  @Lifecycle mounted() {
    this.setInitialChecked();
    this.getBankCardList();
  }

  changePagination(pagination) {
    this.table.pagination.current = pagination.current;
    this.init.query.pageNo = pagination.current;
    this.table.key = Math.random();
    this.table.selectedRowKeys = [];
    this.getBankCardList();
  }

  // 重置分页
  resetPagination() {
    this.table.pagination.current = 1;
    this.init.query.pageNo = 1;
    this.table.key = Math.random();
  }

  // 设定表单初始值
  setInitialChecked() {
    this.vform.setValue('clientType', '');
    this.vform.setValue('isEnabled', '');
  }

  // 点击修改
  showModal(item) {
    this.init.editId = item?.id;
    this.init.paymentId = item?.paymentId;
    this.init.modalType = 'edit';
    this.init.modalShow = true;
  }

  // 分层配置
  async showConfiguration() {
    // 显示配置
    this.init.showConfiguration = true;
  }

  // 显示是否分配
  async showUserGroupById(item) {
    this.init.bankId = item.id;
    this.init.showUserGroup = true;
  }
  
  // 删除或启用禁用成功后的回调函数
  successCallBack(res) {
   this.$message.success(res.message);
   this.getBankCardList(true);
   this.table.key = Math.random();
  }

  // 删除银行卡
  async deletBankByIds() {
   const ids =  this.table.selectedRowKeys.map(item => {
     return { id: item}
   });
   if (!ids.length) {
     this.$message.error("请先选择要删除的银行卡");
     return;
   }
   if (!await this.$confirm({title: "提示", content: "确定要删除已选中的内容？"})) return;
   const res = await this.$service.fetch('/config-admin-api/bankCardPayment/batchRemoveBankCardPayment', {list: ids} );
   if (res.code !== 1) return res.message && this.$message.error(res.message);
   this.successCallBack(res);
  }

  // 启用或者禁用银行卡(type=1开启, type=0关闭)
  async enableOrDisableBankCard(type) {
    const ids = this.table.selectedRowKeys.map(item => {
      return { id: item, isEnabled: type, paymentType: 1 }
    });
    if (!ids.length) {
      this.$message.error("请先选择银行卡");
      return;
    }
    if (!await this.$confirm({title: "提示", content: `变更已选中项目状态为${type == 1 ? '启用': '停用'}？`})) return;
    const res = await this.$service.fetch('/config-admin-api/payment/batchEnable', {list: ids});
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.successCallBack(res);
  }

  async getBankCardList(refresh) {
    if (refresh) this.resetPagination(); 

    const form = await this.vform.validate();
    const values = this.$trimValues(form.values);
    const params = Object.assign(this.init.query, values);

    this.init.loading = true;
    const res = await this.$service.fetch('/config-admin-api/bankCardPayment/queryPageBankCardPayment', params);
    this.init.loading = false;

    if (res.code !== 1) return res.message && this.$message.error(res.message);
    if (res.code === 1 &&  res.data?.records instanceof Array) {
      res.data.records = res.data.records.sort((a,b) => {
        return parseInt(a.id) - parseInt(b.id)
      });
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
.bank-address {
  max-width: 180px;
  text-overflow: ellipsis;
  word-break: break-all;
}
</style>

