<template>
  <a-form class="bank" :form="formElem" @submit.prevent="submit">
    <a-form-item style="display:none" label="出款类型" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
      <a-select v-decorator="['id',{rules: [{required: true, message: '请选择出款类型'}]}]" :disabled="type=='edit'">
        <a-select-option v-for="(item, index) in dsstore.queryAllMerchant" :value="`${item.id}`" :key="index">{{item.paymentChannelName}}</a-select-option>
      </a-select>
    </a-form-item>
    <a-form-item  label="出款类型" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
      <a-input :value="paymentName" disabled/>
    </a-form-item>
    <a-form-item label="名称" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
      <a-input :value="name" disabled/>
    </a-form-item>
    <a-form-item label="商户ID" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
      <a-input  v-decorator="['merchantCode', {rules: [{required: true, message: '商户ID不能为空'}] }]"/>
    </a-form-item>
    <a-form-item label="密钥" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
      <a-input  v-decorator="['merchantPublicKey', {rules: [{required: true, message: '密钥不能为空'}] }]"/>
    </a-form-item>
    <a-form-item label="时间" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
        <a-row :gutter="8">
          <a-col :span="24">
            <div class="flex-end">
              <a-time-picker :key="timeKey" :defaultValue="moment(init.query.useTimeStart ? init.query.useTimeStart : '00:00', 'HH:mm')" @change="changeStartTime"  format="HH:mm" placeholder="开始时间" />-
              <a-time-picker :key="timeKey1" :defaultValue="moment(init.query.useTimeEnd ? init.query.useTimeEnd : '00:00', 'HH:mm')" @change="changeEndTime"  format="HH:mm" placeholder="结束时间" />  
            </div>
          </a-col>
        </a-row>
    </a-form-item>
    <a-form-item label="出款限额" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
      <a-input v-number="true" v-decorator="['maxAmount', {rules: [{required: true, message: '出款限额不能为空'}] }]" />
    </a-form-item>
    <a-form-item label="状态" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
      <a-radio-group v-decorator="['isEnabled', {rules: [{required: true, message: '请选择状态'}] } ]">
        <a-radio value="1">启用</a-radio>
        <a-radio value="0">停用</a-radio>
      </a-radio-group>
    </a-form-item>
    <div class="text-right">
      <a-button type="primary" html-type="submit" :loading="init.loading">提交</a-button>&nbsp;
    </div>
  </a-form>
</template>


<script>
import Vue from 'vue'
import { Component, Lifecycle, Prop, Watch, InjectComponents } from 'vue-decorators'
import DateRange from "@/components/date-range/DateRange"
import moment  from "moment";

const dsstore = {
  queryAllMerchant: {
    url: '/config-admin-api/thirdWithdrawal/queryAllThirdWithdrawalForMerchant'
  }
}
const formOptions = { formElem: "id" };

@Component({ formOptions, dsstore, methods: { moment } })
@InjectComponents({ DateRange })
export default class PayoutAdd extends Vue {
  //type=add新增 type=edit编辑
  @Prop({type: String, default: 'add' }) type;
  @Prop({type: [Number,String] }) id;
  @Prop({type: [Number,String]}) paymentId;
  @Prop({type: [Number,String]}) paymentName;
  @Prop({type: [Number,String]}) name; 

  timeKey = 1;
  timeKey1 = 2;

  init = {
    query: { useTimeStart: "", useTimeEnd: "" },
    loading: false,
    form: {
      giveType: false
    },
    selectOptions: [],
    configuration: {}
  };

  @Lifecycle mounted() {
    this.getSelectBox();
    // 编辑，先获取出款信息
    if (this.type === "edit") {
      this.getEditInfoById(this.id);
    } else {
      this.formElem.setValue('isEnabled', 1);
    }
  }

  // changeDate(startTime, endTime, datestring, type) {
  //   if (type === 'start') {
  //     this.init.query.useTimeStart = datestring
  //   } else {
  //     this.init.query.useTimeEnd = datestring
  //   }
  // }

  changeStartTime(time, timestring) {
    this.init.query.useTimeStart = timestring;
  }
  
  changeEndTime(time, timestring) {
    this.init.query.useTimeEnd = timestring;
  }

  // disabledDate(current) {
  //   return current && current < moment().endOf('day');
  // }

  async getEditInfoById(id) {
    const res = await this.$service.fetch('/config-admin-api/thirdPayment/getThirdPaymentByIdForMerchant', {id});
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.formElem.setValues(res.data, true);
    if (res.data.useTimeStart && res.data.useTimeEnd) {
      // const start = new Date(res.data.useTimeStart.replace(/-/g, '/'));
      // const end = new Date(res.data.useTimeEnd.replace(/-/g, '/'));
      // this.$refs.rg.setDateRangeValues(start, end);
      // this.init.query.useTimeStart = start;
      // this.init.query.useTimeEnd = end;
      this.init.query.useTimeStart = res.data.useTimeStart || '10:00';
      this.init.query.useTimeEnd = res.data.useTimeEnd || '00:00';  
      this.timeKey = Math.random();
      this.timeKey1 = Math.random();
    }
  }

  async getSelectBox() {
    const res = await this.$service.fetch('/config-admin-api/thirdWithdrawal/queryAllThirdWithdrawalForMerchant');
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    if (res.data && res.data instanceof Array) {
      this.init.selectOptions = res.data;
    }
  }

  // 添加第三方出款或者修改第三方出款
  async submit() {
    const form = await this.formElem.validate();
    if (form.errors) return;
    // if (this.init.query.useTimeStart === "" || this.init.query.useTimeEnd === "") {
    //   return this.$message.error("请先选择日期");
    // };
    const res = await this.$service.fetch('/config-admin-api/thirdWithdrawal/editThirdWithdrawalForMerchant', Object.assign(this.init.query, form.values));
    if (res.code !== 1)  return res.message && this.$message.error(res.message);
    this.$message.success(res.message);
    this.$emit("close");
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
  .range {
    margin-top: 6px;
    .ant-form-item-children {
      display: flex;
      align-items: center;
      .ant-form-item-control {
        line-height: 1;
      }
      .ant-form-item {
        margin-bottom: 0;
      }
    }
  }
}
</style>
