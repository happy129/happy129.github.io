<template>
  <section>
    <section class="section-one">
      <a-form class="bank" :form="formElem">
          <a-form-item style="display:none" label="在线支付类型" :label-col="{ span: 7 }" :wrapper-col="{ span: 16 }">
            <a-select v-decorator="['id']" @change="changeSelected" :disabled="this.type=='edit'">
                <a-select-option v-for="(item, index) in init.paymentList" :key="index" :value="`${item.id}`">{{item.paymentChannelName}}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="入款类型" :label-col="{ span: 7 }" :wrapper-col="{ span: 16 }">
              <a-input :value="paymentTypeName" disabled/>
          </a-form-item>
          <a-form-item label="第三方支付" :label-col="{ span: 7 }" :wrapper-col="{ span: 16 }">
              <a-input :value="paymentName" disabled/>
          </a-form-item>
          <a-form-item label="商户ID" :label-col="{ span: 7 }" :wrapper-col="{ span: 16 }">
            <a-input v-decorator="['merchantCode', {rules: [{required: true, message: '商户ID不能为空'}] }]" />
          </a-form-item>
          <a-form-item v-if="encodeType == 1" label="支付秘钥" :label-col="{ span: 7 }" :wrapper-col="{ span: 16 }">
            <a-textarea :rows="4"  v-decorator="['merchantPublicKey', {rules: [{required: true, message: '支付秘钥不能为空'}] }]"/>
          </a-form-item>
          <a-form-item v-if="encodeType == 2" label="商户私钥" :label-col="{ span: 7 }" :wrapper-col="{ span: 16 }">
            <a-textarea  :rows="4"  v-decorator="['merchantPrivateKey', {rules: [{required: true, message: '商户私钥不能为空'}] }]"/>
          </a-form-item>
          <a-form-item v-if="encodeType == 2" label="三方公钥" :label-col="{ span: 7 }" :wrapper-col="{ span: 16 }">
            <a-textarea :rows="4"  v-decorator="['thirdPublicKey', {rules: [{required: true, message: '三方公钥不能为空'}] }]"/>
          </a-form-item>
          <a-form-item label="充值金额" :label-col="{ span: 7 }" :wrapper-col="{ span: 16 }">
            <a-input-group compact>
              <a-input v-decorator="['minAmount', {rules: [{required: true, message: '最低充值金额不能为空,且不能大于最高金额' }] }]" type="number" :min="0" class="amount" placeholder="最低充值金额" />
              <a-input class="center" placeholder="~" disabled />
              <a-input v-decorator="['maxAmount', {rules: [{required: true, message: '最高充值金额不能为空'}] }]" type="number" :min="0" class="amount" placeholder="最高充值金额" />
            </a-input-group>
          </a-form-item>
          <a-form-item label="汇款赠送比例" :label-col="{ span: 7 }" :wrapper-col="{ span: 16 }">
            <a-input v-number="true" v-decorator="['giveRate']"  addonAfter="%"/>
          </a-form-item>
          <a-form-item label="赠送类型" :label-col="{ span: 7 }" :wrapper-col="{ span: 16 }">
            <a-checkbox :checked="init.form.giveType" @change="(e) => init.form.giveType = e.target.checked">汇款提交赠送比例</a-checkbox>
          </a-form-item>
          <a-form-item label="接口查询开关" :label-col="{ span: 7 }" :wrapper-col="{ span: 16 }">
            <a-radio-group v-decorator="['isSearchInterfaceEnabled', {rules: [{required: true, message: '请选择接口查询开关'}] } ]">
              <a-radio value="1">打开</a-radio>
              <a-radio value="0">关闭</a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item label="使用端" :label-col="{ span: 7 }" :wrapper-col="{ span: 16 }">
            <a-radio-group v-decorator="['clientType', {rules: [{required: true, message: '请选择使用端'}]}]">
              <a-radio v-for="(item, index) in dictionary.clientType2" :key="index" :value="item.value">{{item.name}}</a-radio>
            </a-radio-group>
          </a-form-item>
          <a-form-item label="排序" :label-col="{ span: 7 }" :wrapper-col="{ span: 16 }">
            <a-input @change="$number" v-decorator="['sortOrder', {rules: [{required: true, message: '请输入排序值'}]}]" placeholder="数字越小排序越靠前"/>
          </a-form-item>
      </a-form>
      <div class="extra-item"> 
        <a-form-item v-for="(item, index) in init.configuration" :key="index" :label="item.columnName" :label-col="{ span: 7 }" :wrapper-col="{ span: 16 }">
          <a-input v-model="item.columnValue"/>
        </a-form-item>
      </div>
      <div class="text-right">
        <a-button type="primary" @click.prevent="submit" :loading="init.loading">提交</a-button>
      </div>
    </section>
 </section>
</template>


<script>
import Vue from 'vue'
import { Component, Lifecycle, Prop, Watch, InjectComponents } from 'vue-decorators'
import { getToken } from "@/util/auth";

const formOptions = { formElem: "ids" };

@Component({ formOptions, dictionary: 'clientType2' })
export default class Online extends Vue {
  //type=add新增 type=edit编辑
  @Prop({type: String, default: 'add' }) type;
  @Prop({type: [Number,String] }) id;
  @Prop({type: [Number,String]}) paymentId;
  @Prop({type: [Number,String]}) encodeType;
  @Prop({type: [Number,String]}) paymentName;
  @Prop({type: [Number,String]}) paymentTypeName;

  init = {
    // 支付方式id
    paymentId: "",
    loading: false,
    paymentList: [],
    form: {
      giveType: true
    },
    // 初始化配置
    configuration: []
  };

  @Lifecycle mounted() {
    if (this.type === 'add') {
      this.setFormInitialValue();
      //this.getThirdPaymentCheckbox();
    } else {
      this.init.paymentId = this.id;
      this.getThirdPaymentList();
    }
  }


  validatorCallBack(rule, value, callback) {
    const max = this.formElem.getValue('maxAmount');
    const min = this.formElem.getValue('minAmount');
    if (parseFloat(min) > parseFloat(max)) {
      callback(false);
    } 
    callback();
  }


  setFormInitialValue() {
    this.formElem.setValue('isSearchInterfaceEnabled', 1);
    this.formElem.setValue('isEnabled', 1);
    this.formElem.setValue('clientType', -1);
  }
  /**
   *  1. 先获取下拉框列表  /config-admin-api/thirdPayment/getThirdPaymentForMerchant
   *  2. 根据下拉框的id获取对应的充值信息  /config-admin-api/thirdPayment/getThirdPaymentByIdForMerchant
   *  3. 使用编辑接口完成新增操作 config-admin-api/thirdPayment/editThirdPaymentForMerchant
   */
  async getThirdPaymentCheckbox() {
    const res = await this.$service.fetch('/config-admin-api/thirdPayment/getThirdPaymentForMerchant',{});
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    if (res.data instanceof Array && res.data.length) {
      this.init.paymentList = res.data;
      this.init.paymentId = res.data[0]?.id;
      this.formElem.setValue('id', res.data[0]?.id);
      this.getThirdPaymentList();
    }
  }

  async changeSelected(value) {
    this.init.paymentId = value;
    this.getThirdPaymentList();
  }

  async getThirdPaymentList() {
    // 根据支付的id， 获取对应的支付内容
    const res = await this.$service.fetch('/config-admin-api/thirdPayment/getThirdPaymentByIdForMerchant', {id: this.init.paymentId});
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    // 对表单进行填充
    if (this.type === "edit") {
      this.formElem.setValues(res.data, true);
    }
    // 额外的表单值
    if (res.data?.thirdPaymentConfig instanceof Array && res.data?.thirdPaymentConfig.length > 0) {
      this.init.configuration = res.data.thirdPaymentConfig;
    }
  }

  async submit() {
    const form = await this.formElem.validate();
    if (form.errors) return;
    const requestParams = form.values;
    if (parseFloat(form.values.minAmount) > parseFloat(form.values.maxAmount)) {
      return this.$message.error("最低充值金额不能高于最高充值金额");
    }
    // true or false 转化成 1, 0
    requestParams.giveType = requestParams.giveType ? 1 : 0;
    // 修改的时候需要传用户id
    // if (this.type === 'edit') Object.assign(requestParams, {id: this.id, paymentId: this.paymentId });
    // 添加总后台配置
    requestParams.thirdPaymentConfig = this.init.configuration;
    // 发送请求
    this.init.loading = true;
    const url =  this.type === 'add' ? 'config-admin-api/thirdPayment/editThirdPaymentForMerchant' : 'config-admin-api/thirdPayment/editThirdPaymentForMerchant';
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
  .amount {
    width: 168px; text-align: center; 
  }
  .center {
    width: 30px; pointer-events: none; background-color: #fff
  }
}
.text-right {
  text-align: right;
  margin-top: 20px;
}
.extra-item /deep/{
  .ant-form-item {
    margin-bottom: 6px;
  }
}
</style>
