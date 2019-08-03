<template>
  <a-form class="bank" :form="formElem" @submit.prevent="submit">
    <a-form-item label="支付名称" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
      <a-input placeholder="支付方式收款二维码（微信收款二维码）" v-decorator="['paymentName', {rules: [{required: true, message: '二维码名称不能为空'}] }]"/>
    </a-form-item>
    <a-form-item label="账号" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
      <a-input v-decorator="['account', {rules: [{required: true, message: '账号不能为空'}] }]" />
    </a-form-item>
    <a-form-item label="昵称" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
      <a-input  v-decorator="['nickName', {rules: [{required: true, message: '昵称不能为空'}] }]"/>
    </a-form-item>
    <a-form-item label="图片名称" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
      <a-row :gutter="8">
        <a-col :span="18">
          <a-input  v-decorator="['qrcodeUrl', {rules: [{required: true, message: '请先上传图片'}] }]"/>
        </a-col>
        <a-col :span="4">
          <a-upload name="imageFile" :showUploadList="false" action="#" :beforeUpload="beforeUpload" @change="uploadImage">
            <a-button type="primary"><a-icon type="upload" />上传</a-button>
          </a-upload>
        </a-col>
      </a-row>
    </a-form-item>
    <a-form-item label="赠送类型" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
      <a-checkbox :checked="init.form.giveType" @change="(e) => init.form.giveType = e.target.checked">汇款提交赠送比例</a-checkbox>
    </a-form-item>
    <a-form-item label="汇款赠送比例" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
      <a-input v-number="true" v-decorator="['giveRate']"  addonAfter="%"/>
    </a-form-item>
    <a-form-item label="支付类型" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
      <a-select v-decorator="['qrcodeLinkId', {rules: [{required: true, message: '请选择支付类型'}] } ]" >
        <a-select-option value="">请选择</a-select-option>
        <a-select-option v-for="(item, index) in dsstore.queryAllQrcodeLink" :key="index" :value="`${item.id}`">{{item.linkName}}</a-select-option>
      </a-select>
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
        <a-input v-decorator="['minAmount', {rules: [{ message: '最低充值金额不能大于最高金额', validator: validatorCallBack}]} ]" type="number" :min="0" class="amount" placeholder="最低充值金额" />
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
      <!-- &nbsp;<a-button type="primary">重置</a-button> -->
    </div>
  </a-form>
</template>


<script>
import Vue from 'vue'
import { Component, Lifecycle, Prop, Watch, InjectComponents } from 'vue-decorators'
import { getToken } from "@/util/auth";

const formOptions = { formElem: "id" };

const dsstore = {
  queryAllQrcodeLink: {
    url: 'config-admin-api/qrcodeLink/queryAllQrcodeLink'
  }
}

@Component({ formOptions, dictionary: 'clientType2', dsstore })
export default class QrCode extends Vue {
  //type=add新增 type=edit编辑
  @Prop({type: String, default: 'add' }) type;
  @Prop({type: [Number,String] }) id;
  @Prop({type: [Number,String]}) paymentId;

  file = "";

  init = {
    loading: false,
    form: {
      giveType: true
    }
  };

  @Lifecycle mounted() {
    if (this.type === "add") this.setInitialValue();
    if (this.type === "edit") this.getBankInfo();
  }

  setInitialValue() {
   this.formElem.setValue('isEnabled', 1);
   this.formElem.setValue('clientType', -1);
   this.formElem.setValue('qrcodeLinkId', '');
 }

  validatorCallBack(rule, value, callback) {
    const max = this.formElem.getValue('maxAmount');
    const min = this.formElem.getValue('minAmount');
    if (parseFloat(min) > parseFloat(max)) {
      callback(false);
    } 
    callback();
  }
  
  beforeUpload(file) {
		this.fileList = [file];
		this.$nextTick(() => this.toUpload());
		return false;
	}

  async toUpload() {
    const formdata = new FormData();
    formdata.append('imageFile', this.fileList[0]);
    formdata.append('token', getToken());
    formdata.append('uploadTypeName', 'qrCode');
    const res = await this.$service.fetch('/common-api/upload/uploadAdminImage', formdata);
    if (1 != res.code) return res.message && this.$message.error(res.message);
    this.$message.success(res.message);
  	this.fileList = [];
    this.formElem.setValue("qrcodeUrl", res.data.imageUrl);
  }

  async uploadImage(info) {
    this.file= info;
  }

  // 获取银行卡信息, 对表单进行填充
  async getBankInfo() {
    const res = await this.$service.fetch('/config-admin-api/qrcodePayment/getQrcodePaymentDetail', { id: this.id });
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.init.form.giveType = res.data.giveType == 1 ? true : false;
    this.formElem.setValues(res.data, true, 'giveType');
  }

  async submit() {
    const form = await this.formElem.validate();
    if (form.errors) return;
    if (parseFloat(form.values.minAmount) > parseFloat(form.values.maxAmount)) {
      return this.$message.error("最低充值金额不能高于最高充值金额");
    }
    const requestParams = form.values;
    // true or false 转化成 1, 0
    requestParams.giveType = requestParams.giveType ? 1 : 0;
    // 修改的时候需要传用户id
    // if (this.type === 'edit') Object.assign(requestParams, {id: this.id, paymentId: this.paymentId });
    if (this.type === 'edit') Object.assign(requestParams, {id: this.id });
    this.init.loading = true;
    const url =  this.type === 'add' ? '/config-admin-api/qrcodePayment/addQrcodePayment' : '/config-admin-api/qrcodePayment/editQrcodePayment';
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
