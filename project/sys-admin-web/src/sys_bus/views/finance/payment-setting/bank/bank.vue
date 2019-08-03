<template>
  <a-form class="bank" :form="formElem" @submit.prevent="submit">
    <a-form-item label="支付名称" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
      <a-input placeholder="如：支付方式转银行卡名称（微信转交通银行）"  v-decorator="['paymentName', {rules: [{required: true, message: '银行卡名称不能为空'}] }]"/>
    </a-form-item>
    <a-form-item label="银行卡号" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
      <a-input @change="$number" v-decorator="['bankCardNo', {rules: [{required: true, message: '银行卡号不能为空'}] }]" />
    </a-form-item>
    <a-form-item label="持卡人" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
      <a-input  v-decorator="['realName', {rules: [{required: true, message: '持卡人不能为空'}] }]"/>
    </a-form-item>
    <a-form-item label="银行名称" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
      <a-input  v-decorator="['bankName', {rules: [{required: true, message: '开户行不能为空'}] }]"/>
    </a-form-item>
    <a-form-item label="赠送类型" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
      <a-checkbox :checked="init.form.giveType" @change="(e) => init.form.giveType = e.target.checked">汇款提交赠送比例</a-checkbox>
    </a-form-item>
    <a-form-item label="汇款赠送比例" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
      <a-input v-number="true" v-decorator="['giveRate']"  addonAfter="%"/>
    </a-form-item>
    <a-form-item label="状态" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
      <a-radio-group v-decorator="['isEnabled', {rules: [{required: true, message: '请选择状态'}] } ]">
        <a-radio value="1">启用</a-radio>
        <a-radio value="0">停用</a-radio>
      </a-radio-group>
    </a-form-item>
    <a-form-item label="使用端" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
      <a-radio-group v-decorator="['clientType', {rules: [{required: true, message: '请选择使用端'}]}]">
        <a-radio v-for="(item, index) in dictionary.clientType2" :key="index" :value="item.value">{{item.name}}</a-radio>
      </a-radio-group>
    </a-form-item>
    <a-form-item label="充值金额" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
      <a-input-group compact>
        <a-input v-decorator="['minAmount', {rules: [{ message: '最低充值金额不能大于最高金额'}]} ]" type="number" :min="0" class="amount" placeholder="最低充值金额" />
        <a-input class="center" placeholder="~" disabled />
        <a-input v-decorator="['maxAmount']" type="number" :min="0" class="amount" placeholder="最高充值金额" />
      </a-input-group>
    </a-form-item>
    <a-form-item label="排序" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
      <a-input @change="$number" v-decorator="['sortOrder', {rules: [{required: true, message: '请输入排序值'}]}]" placeholder="数字越小排序越靠前"/>
    </a-form-item>
    <a-form-item label="简介" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
      <a-input  v-decorator="['introduction', {rules: [ {max: 16, message: '最长为16个字符'}] }]" placeholder="支付方式简介, 不超过16个中文字符"/>
    </a-form-item>
    <a-form-item label="充值说明" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
      <a-textarea  v-decorator="['description']" placeholder="请输入文本" :rows="3"/>
    </a-form-item>
    <div class="text-right">
      <a-button type="primary" html-type="submit" :loading="init.loading">提交</a-button>
    </div>
  </a-form>
</template>


<script>
import Vue from 'vue'
import { Component, Lifecycle, Prop, Watch, InjectComponents } from 'vue-decorators'

const formOptions = { formElem: "id" };

@Component({ dictionary: 'clientType2', formOptions })
export default class Bank extends Vue {
  //type=add新增 type=edit编辑
  @Prop({type: String, default: 'add' }) type;
  @Prop({type: [Number,String] }) id;
  @Prop({type: [Number,String]}) paymentId;

  init = {
    loading: false,
    form: {
      giveType: true
    }
  };

 @Lifecycle mounted() {
   if (this.type === 'add') {
     this.setInitialValue();
   }
   if (this.type === "edit") this.getBankInfo();
 }

 setInitialValue() {
   this.formElem.setValue('isEnabled', 1);
   this.formElem.setValue('clientType', -1);
 }

 validatorCallBack(rule, value, callback) {
    const max = this.formElem.getValue('maxAmount');
    const min = this.formElem.getValue('minAmount');
    if (parseFloat(min) > parseFloat(max)) {
      callback(true);
    } 
    callback();
  }
  
  // 获取银行卡信息, 对表单进行填充
  async getBankInfo() {
    const res = await this.$service.fetch('/config-admin-api/bankCardPayment/getBankCardPaymentDetail', { id: this.id });
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.init.form.giveType = res.data.giveType == 1 ? true : false;
    this.formElem.setValues(res.data, true, 'giveType');
  }

  async submit() {
    const form = await this.formElem.validate();
    if (form.errors) return;
    const requestParams = form.values;
    if (parseFloat(form.values.minAmount) > parseFloat(form.values.maxAmount)) {
      return this.$message.error("最低充值金额不能高于最高充值金额");
    }
    // true or false 转化成 1, 0
    requestParams.giveType = this.init.form.giveType ? 1 : 0;
    // 修改的时候需要传用户id
    if (this.type === 'edit') Object.assign(requestParams, {id: this.id, paymentId: this.paymentId });
    this.init.loading = true;
    const url =  this.type === 'add' ? '/config-admin-api/bankCardPayment/addBankCardPayment' : '/config-admin-api/bankCardPayment/editBankCardPayment';
    const res = await this.$service.fetch(url, requestParams);
    this.init.loading = false;
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.$message.success(res.message);
    this.$emit('close');
  }

}
</script>

<style lang="scss" scoped>
.bank /deep/ {
  .ant-form-item {
    margin-bottom: 6px;
  }
  .text-right {
    text-align: right;
    margin-top: 20px;
  }
  .amount {
    width: 172px; text-align: center; 
  }
  .center {
    width: 30px; pointer-events: none; background-color: #fff
  }
}
</style>
