<template>
  <a-form class="paymentinfo">
    <a-form-item label="提交时间" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
      <a-input v-model="form.createTime" disabled/>
    </a-form-item>
    <a-form-item label="处理时间" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
      <a-input v-model="form.handleTime" disabled/>
    </a-form-item>
    <a-form-item label="订单号" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
      <a-input v-model="form.transactionNo"  disabled/>
    </a-form-item>
    <a-form-item label="会员账号" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
      <a-input v-model="form.userName"  disabled/>
    </a-form-item>
    <a-form-item label="充值金额"  :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
      <a-input v-model="form.rechargeAmount" disabled/>
    </a-form-item>
    <a-form-item label="金额大写"  :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
      <a-input v-model="form.amountChineseName" disabled/>
    </a-form-item>
    <a-form-item label="支付方式"  :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
      <a-input v-model="form.paymentType" disabled/>
    </a-form-item>
    <a-form-item label="转账姓名/附言" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
      <a-input :value="form.cardRealName || form.postscript || '-'" disabled/>
    </a-form-item>
    <a-form-item label="充值赠送比例" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
      <a-input v-model="form.giveRate" disabled addonAfter="%"/>
    </a-form-item>
    <a-form-item label="审核"  :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
      <a-radio-group v-model="form.status" disabled>
        <a-radio :value="1">成功</a-radio>
        <a-radio :value="0">失败</a-radio>
      </a-radio-group>
    </a-form-item>
    <a-form-item class="submit-btn">
      <!-- <a-button v-permission="20082" class="submit-btn1" type="primary" :loading="loading" @click="resetRecord">重新结算</a-button>&nbsp; -->
      <a-button class="submit-btn2" @click="$emit('close')">取消</a-button>
    </a-form-item>
    <!-- <a-form-item label="提交时间" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
      <a-input v-model="form.createTime" disabled/>
    </a-form-item>
    <a-form-item label="订单号" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
      <a-input v-model="form.transactionNo"  disabled/>
    </a-form-item>
    <a-form-item label="会员账号" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
      <a-input v-model="form.userName"  disabled/>
    </a-form-item>
    <a-form-item label="金额"  :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
      <a-input v-model="form.rechargeAmount" disabled/>
    </a-form-item>
    <a-form-item label="金额繁体"  :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
      <a-input v-model="form.amountChineseName" disabled/>
    </a-form-item>
    <a-form-item label="汇款方式"  :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
      <a-input v-model="form.paymentType" disabled/>
    </a-form-item>
    <a-form-item label="汇款人"  :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
      <a-input v-model="form.realName" disabled/>
    </a-form-item>
    <a-form-item label="转账姓名/附言" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
      <a-input :value="cardRealName || postscript || '-'" disabled/>
    </a-form-item>
    <a-form-item label="汇款赠送比例" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
      <a-input v-model="form.giveRate" disabled addonAfter="%"/>
    </a-form-item>
    <a-form-item label="状态"  :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
      <a-radio-group v-model="form.status" disabled>
        <a-radio :value="1">成功</a-radio>
        <a-radio :value="0">失败</a-radio>
      </a-radio-group>
    </a-form-item>
    <a-form-item class="submit-btn">
      <a-button class="submit-btn1" type="primary" @click="resetRecord">重新结算</a-button>&nbsp;
      <a-button class="submit-btn2" @click="$emit('close')">取消</a-button>
    </a-form-item> -->
  </a-form>
</template>

<script>
import Vue from 'vue'
import { Component, InjectComponents, Lifecycle, Prop } from 'vue-decorators'
import { formatChineseNumeral } from "@/util/helper";

@Component
export default class PaymentInfo extends Vue {
  @Prop({ type: [String, Number], default: "" }) id;

  paymentType = {
    1: "银行卡",
    2: "充值卡",
    3: "二维码",
    4: "第三方支付"
  };

  form = {
    createTime: "",
    amountChineseName: ""
  };

  loading = false;

  init = {
    status: true,
    remark: ""
  };

  @Lifecycle mounted() {
    this.getTransactionInfo();
  }

  async getTransactionInfo() {
    const res = await this.$service.fetch('/lottery-admin-api/rechargeRecord/getRechargeRecordDetail', {id: this.id});
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.form =  Object.assign(this.form, res.data);
    
    this.form.amountChineseName = formatChineseNumeral(this.form.rechargeAmount);
    // 设定支付方式中文名
    this.form.paymentType = this.paymentType[this.form.paymentType];
  }

  // 重新结算
  async resetRecord() {
    this.loading = true;
    const res = await this.$service.fetch('/lottery-admin-api/rechargeRecord/resetRechargeRecordStatus', {id: this.id});
    this.loading = false;
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.$message.success(res.message);
    this.$emit('close');
  }
}
</script>

<style lang="scss" scoped>
.paymentinfo /deep/{
  .ant-form-item {
    margin-bottom: 6px;
  }
  .submit-btn {
    .ant-form-item-control {
      text-align: center;
    }
    .submit-btn1 {
      background-color: #dd5a43;
      color: #fff;
      border: 1px solid #dd5a43;
      margin-right: 10px;
    }
  }
}
</style>

