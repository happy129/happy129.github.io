<style lang="scss" scoped>
.input-2 {
    background: inherit;
    background-color: rgba(228, 228, 228, 1);
    box-sizing: border-box;
    border-width: 1px;
    border-style: solid;
    border-color: rgba(204, 204, 204, 1);
    border-radius: 2px;
    -moz-box-shadow: none;
    -webkit-box-shadow: none;
    box-shadow: none;
    font-family: 'Helvetica';
    font-weight: 400;
    font-style: normal;
    font-size: 14px;
    text-align: left;
    height: 40px;
    padding: 0 6px;
    word-wrap: break-word;
    word-break: break-all;

    &.status0 {
      color: #FF0000;
    }
    &.status1 {
      color: #00CC33;
    }
}
</style>
<template>
  <a-modal class="form20190002" v-model="visible" :maskClosable="false" 
    :title="title" @ok="submit()" @cancel="$emit('close')"
    :confirmLoading="loading">
    <a-form :form="vform">
      
      <a-form-item label="提款时间" :label-col="{ span: 6 }" :wrapper-col="{ span: 14 }" >
        <div class="input-2">{{params.createTime}}</div>
      </a-form-item>
      <a-form-item label="订单号" :label-col="{ span: 6 }" :wrapper-col="{ span: 14 }" >
        <div class="input-2">{{params.transactionNo}}</div>
      </a-form-item>
      <a-form-item label="会员账号" :label-col="{ span: 6 }" :wrapper-col="{ span: 14 }" >
        <div class="input-2">{{params.userName}}</div>
      </a-form-item>
      <a-form-item label="提款金额" :label-col="{ span: 6 }" :wrapper-col="{ span: 14 }" >
        <!-- john 更改字段 amount -->
        <div class="input-2">{{params.withdrawAmount}}</div>
      </a-form-item>
      <a-form-item label="金额大写" :label-col="{ span: 6 }" :wrapper-col="{ span: 14 }" >
        <div class="input-2">{{formatChineseNumeral(+params.withdrawAmount || 0)}}</div>
      </a-form-item>
      <a-form-item label="提款银行" :label-col="{ span: 6 }" :wrapper-col="{ span: 14 }" >
        <div class="input-2">{{params.bankName}}</div>
      </a-form-item>
      <a-form-item label="卡号" :label-col="{ span: 6 }" :wrapper-col="{ span: 14 }" >
        <div class="input-2">{{params.cardNo}}</div>
      </a-form-item>
      <a-form-item label="订单状态" :label-col="{ span: 6 }" :wrapper-col="{ span: 14 }" >
        <div class="input-2" :class="`status${params.status}`">{{params.statusStr}}</div>
      </a-form-item>
      <a-form-item label="处理时间" :label-col="{ span: 6 }" :wrapper-col="{ span: 14 }" >
        <div class="input-2">{{params.handleTime}}</div>
      </a-form-item>
      <a-form-item label="处理人" :label-col="{ span: 6 }" :wrapper-col="{ span: 14 }" >
        <div class="input-2">{{params.adminName}}</div>
      </a-form-item>
      <a-form-item label="出款方式" :label-col="{ span: 6 }" :wrapper-col="{ span: 14 }" >
        <div class="input-2">{{params.withdrawType ? "线下转账": params.thirdPaymentName}}</div>
      </a-form-item>

    </a-form>
  </a-modal>
</template>
<script>
import Vue from 'vue'
import { Component, InjectComponents, Prop, Watch, Lifecycle, Computed, Filter, State, Action, Getter, Mutation, InjectComponent } from 'vue-decorators';
import { formatChineseNumeral, getColor } from "@/util/helper";
/** 数据字典 */
const dictionary = ''
/** 表单验证，可以不设置值，如果设置就是初始化要配置隐藏值，默认vform变量 */
const formOptions = 'id'; 
// const formOptions = {
//   vform: '隐藏字段，使用vform.hiddens可以绑定dom值',
//   vform1: '隐藏字段，使用vform.hiddens可以绑定dom值'
// }

@Component({ dictionary, formOptions })
export default class PaymentFinishForm extends Vue {

  visible = true;
  loading = false;

  formatChineseNumeral = formatChineseNumeral
  getColor = getColor 

  @Computed() title() {
    return "提现详情"
  }

  /** 提交 */
  async submit() {
    this.$emit('close', true);
  }

  @Lifecycle created() {
    // 设定初始值
    this.vform.setValues(this.params, true);
  }
}
</script>
<style lang="scss">
.form20190002  {
  font-weight: normal;
  .ant-btn-default { display: none!important; }
}
</style>


