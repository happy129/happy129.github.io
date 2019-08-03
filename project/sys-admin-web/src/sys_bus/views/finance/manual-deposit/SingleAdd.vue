<template>
  <section class="deposit-wrapper">
    <a-form layout="inline">
      <a-form-item label="会员账号：">
        <a-input v-model.trim="userForm.userName" placeholder="请输入会员账号"/>
      </a-form-item>
      <a-form-item label="">
        <a-button type="primary" @click="search(true)">搜索</a-button>
      </a-form-item>
    </a-form>
    <div class="g-gray-border">
      <div class="mt15">
        <a-table
          class="mytable"
          bordered
          :rowKey="(r,i)=>i"
          :columns="columns"
          :dataSource="dataSource"
          :pagination="pagination"
          :loading="loading"
          @change="changePagination"
        >
          <span slot="balance" slot-scope="text, record">{{record.balance ? record.balance : '0.00'}}</span>
          <template slot="operation" slot-scope="text, record">
            <a-button v-permission="20129" type="primary" size="small" @click="clickHandler({title: '加款', data: record, type: 1})">加款</a-button>
            &nbsp;
            <a-button v-permission="20130"  type="primary" size="small" @click="clickHandler({title: '减款', data: record, type: -1})">减款</a-button>
          </template>
        </a-table>
      </div>
    </div>
    <a-modal @cancel="resetFiled" :title="modal.title" v-model="modal.showModal" :centered="true" :maskClosable="false">
      <div class="manual-deposit-modal">
        <a-form layout="inline" :form="vform">
          <div>
            <a-form-item label="会员账号">
              <a-input v-decorator="['userName', {initialValue: form.userName}]" style="width: 320px" disabled/>
            </a-form-item>
          </div>
          <div class="mt15">
            <a-form-item :label="`${form.operateType == 1 ? '加款' : '减款'}类型`">
              <a-select v-decorator="['rechargeType', {initialValue: form.type, rules: [{required: true, message: '请选择类型'}]}]" style="width: 320px">
                <a-select-option value="">请选择</a-select-option>
                <a-select-option :value="2">人工汇款</a-select-option>
                <a-select-option :value="3">彩金派送</a-select-option>
                <a-select-option :value="4">返水派送</a-select-option>
                <a-select-option :value="5">其它</a-select-option>
              </a-select>
            </a-form-item>
          </div>
          <div class="mt15" v-if="form.operateType==1">
            <a-form-item label="升级为充值用户">
               <a-radio-group v-decorator="['isUpgradeRechargeUser', { rules: [{required: true, message: '请先选择是否升级为充值用户' }] }]">
                  <a-radio :value="0">否</a-radio>
                  <a-radio :value="1">是</a-radio>
                </a-radio-group>
            </a-form-item>
          </div>
          <div class="mt15">
            <a-form-item label="金额">
              <a-input v-number="true" v-decorator="['amount', {rules: [{required: true, message: '金额不能为空'}]}]" style="width: 320px"/>
            </a-form-item>
          </div>
          <div class="mt15">
            <a-form-item label="不可提额度倍数">
              <a-input v-number="true" v-decorator="['unwithdrawableAmountTimes', {rules: [{required: true, message: '不可提额度不能为空'}]}]" style="width: 320px"/>
            </a-form-item>
          </div>
          <div class="mt15">
            <a-form-item label="用户备注">
              <a-textarea :rows="3" style="width: 320px;" v-decorator="['remark']" type="text"/>
            </a-form-item>
          </div>
          <div class="mt15">
            <a-form-item label="后台备注">
              <a-textarea :rows="3" style="width: 320px;" v-decorator="['systemRemark']" type="text"/>
            </a-form-item>
          </div>
          <div class="mt15">
            <a-form-item label="谷歌验证码">
              <a-input v-decorator="['googleCode', { rules: [{required: true, message: '谷歌验证码不能为空'}] }]" style="width: 320px"/>
            </a-form-item>
          </div>
        </a-form>
      </div>
      <template slot="footer">
        <a-button type="primary" :loading="loading" @click="confirm">确定</a-button>
      </template>
    </a-modal>
  </section>
</template>
<script>
import Vue from 'vue'
import { Component, Lifecycle} from 'vue-decorators'

@Component({formOptions: "id"})
export default class SingleAdd extends Vue {
  loading = false;
  columns = [
    {title: '会员账号', dataIndex: 'userName', width: 220},
    {title: '余额', dataIndex: 'balance', width: 500, scopedSlots: {customRender: 'balance'}},
    {title: '操作', dataIndex: 'operation', scopedSlots: {customRender: 'operation'}}
  ];
  dataSource = [];
  // 弹窗里数据
  modal = {
    title: "",
    showModal: false,
    confirmLoading: false
  }
  // form数据
  pagination = {current: 1, total: 0};
  // 用户列表请求参数
  userForm = {
    pageNo: 1,
    pageSize: 10,
    userName: ''
  };
  form = {
    userName: '',
    type: '',
    userId: null,
    operateType: null
  }
  amountValidator (rule, value, cb) {
    if (value && value.indexOf('.') > -1 ) {
      let i = value.indexOf('.')
      if (value.substr(i + 1).length > 2) {
        cb('金额只能保留两位小数')
      }
    } else {
      cb()
    }
  }
  
  remarkValidator (rule, value, cb) {
    if (value && value.length > 16) {
      cb('备注长度不能超过16个字符')
    } else {
      cb();
    }
  }

  clickHandler(obj) {
    this.modal.title = obj.title
    this.modal.showModal = true
    this.form.userName = obj.data.userName
    this.form.userId = obj.data.id
    this.form.operateType = obj.type
  }

  resetFiled() {
    this.vform.resetFields()
  }

  async confirm() {
    const form = await this.vform.validate();
    if (form.errors) return
    let params = Object.assign({}, form.values, this.form)
    delete params.type
    delete params.userName
    this.loading = true;
    let res = await this.$service.fetch('/lottery-admin-api/manualChangeWallet/addManualChangeWallet', params);
    this.loading = false;
    this.modal.showModal = false;
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.$message.success(res.message);
    this.getUserInfoList(this.userForm);
  }

  async getUserInfoList (params) {
    this.loading = true
    const res = await this.$service.fetch('/lottery-admin-api/user/queryPageUser', params)
    this.loading = false
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    if (res.data?.records instanceof  Array) {
      this.dataSource = res.data.records;
      this.pagination.total = res.data.totalCount;
    } else {
      this.dataSource = [];
      this.pagination.total = 0;
    }
  }

  async changePagination (pagination, filters, sorter) {
    this.pagination.current = pagination.current;
    this.userForm.pageNo = pagination.current;
    this.getUserInfoList(this.userForm);
  }
  

  // 查询会员 名
  async search (refresh) {
    this.userForm.pageNo = 1;
    this.pagination.current = 1;
    
    this.getUserInfoList(this.userForm)
  }
  // 获取会员列表
  @Lifecycle async created() {
    this.getUserInfoList(this.userForm)
  }
}
</script>
<style lang="scss" scoped>
.ant-modal-footer .customer-footer /deep/{
    text-align: left;
    label {
      width: 90px; text-align: right; display: inline-block;
    }
    .ant-input {
      margin-right: 15px;
    }
  }
.manual-deposit-modal /deep/{
  .ant-form-item > .ant-form-item-label > label {
    width: 120px; text-align: right; display: inline-block;
  }
  .ant-form-item-children .ant-input,  .ant-form-item-children .ant-select {
    width: 280px;
  }
  .ant-modal-footer .customer-footer {
    text-align: left;
    padding-left: 24px;
    label {
      width: 80px; text-align: right; display: inline-block;
    }
  }
}
</style>
