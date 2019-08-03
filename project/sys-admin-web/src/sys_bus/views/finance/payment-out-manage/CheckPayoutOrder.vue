<template>
  <section>
    <a-form class="myform">
      <a-form-item label="出款方式" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
        <a-radio-group v-model="init.submitData.withdrawType" @change="changeRadio" :disabled="!init.isLockPayout">
          <a-radio value="1">人工出款</a-radio>
          <a-radio value="0">第三方出款</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="出款第三方" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }" v-if="init.payoutType==0">
        <a-select v-model="init.submitData.paymentId">
          <a-select-option value="">请选择</a-select-option>
          <a-select-option v-for="(item, index) in selectOptions" :key="index" :value="item.id">{{item.paymentChannelName}}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="会员账号" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
        <a-input v-model="form.userName" disabled/>
      </a-form-item>
       <a-form-item label="订单号" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
        <a-row :gutter="8" v-if="form.firstWithdrawal">
          <a-col :span="19">
            <a-input v-model="form.transactionNo" disabled/>
          </a-col>
          <a-col :span="5">
            <span class="bold g-red">首次提款</span>
          </a-col>
         </a-row>
         <a-input v-else v-model="form.transactionNo" disabled/>
      </a-form-item>
       <a-form-item label="提现银行" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
        <a-input v-model="form.bankName" disabled/>
      </a-form-item>
      <a-form-item label="银行卡号" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
        <a-input v-model="form.cardNo" v-if="init.isLockPayout" disabled/>
        <a-input value="未出款订单，锁定后可见" disabled v-else/>
      </a-form-item>
      <a-form-item label="姓名" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
        <a-input v-model="form.realName" disabled/>
      </a-form-item>
      <a-form-item label="提款金额" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
        <a-row :gutter="8">
          <a-col :span="7">
            <a-input v-model="form.amount" disabled/>
          </a-col>
          <a-col :span="17">
            <a-input :value="amountChineseName" disabled/>
          </a-col>
        </a-row>
      </a-form-item>
      <a-form-item label="提款时间" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
        <a-input v-model="form.createTime" disabled/>
      </a-form-item>
      <a-form-item label="提款手续费" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
        <a-input v-model="form.serviceFee" disabled/>
      </a-form-item>
      <a-form-item label="可提现金额" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
        <a-input v-model="form.withdrawableAmount" disabled/>
      </a-form-item>
      <a-form-item label="状态" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }" v-if="init.submitData.withdrawType!=0">
        <a-radio-group v-model="init.submitData.status" :disabled="!init.isLockPayout">
          <a-radio value="1">成功</a-radio>
          <a-radio value="0">失败</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item v-if="init.submitData.status == 0 && init.submitData.withdrawType!=0">
        <a-row :gutter="8">
          <a-col :span="19" :offset="5">
            <a-textarea v-model="init.submitData.remark" :rows="4"></a-textarea>
          </a-col>
        </a-row>
      </a-form-item>
      <a-form-item :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }">
        <a-row :gutter="8">
          <a-col :span="18" :offset="6">
            <a-checkbox class="checkbox-item" :class="{'locked': init.isLockPayout }" @change="changeCheckbox"> 锁定该订单即可处理出款 </a-checkbox>
          </a-col>
        </a-row>
      </a-form-item>
      <div class="submit-btns">
        <a-row :gutter="12">
          <a-col :span="22" :offset="2">
            <a-button type="primary" @click="submit" :disabled="!init.isLockPayout">提交</a-button>
            <a-button type="primary" @click="reCheckOrder" :disabled="!init.isLockPayout">复审</a-button>
            <a-button type="primary" @click="gotoCode">打码核查</a-button>
            <a-button type="primary" @click="goto">财务核查</a-button>
            <a-button type="primary" @click="$emit('close')">关闭</a-button>
          </a-col>
        </a-row>
      </div>
    </a-form>

    <a-modal title="请输入复审备注" @ok="reCheckOrderSubmit" v-model="init.modalShow" :destroyOnClose="true" :width="400" :maskClosable="false">
      <a-textarea v-model="init.remarkOrder" :rows="4"></a-textarea>
    </a-modal>

  </section>
</template>

<script>
import Vue from 'vue';
import { Component, Lifecycle, Prop, Watch, InjectComponents, Mutation } from 'vue-decorators';
import { formatChineseNumeral } from "@/util/helper";

const formOptions = { formElem: "id" };

@Component({ formOptions })
export default class CheckPayoutOrder extends Vue {
  @Prop({ type: [String,Number]}) id;
  @Mutation('setPayoutState') setPayoutState;

  init = {
    modalShow: false,
    // 默认出款方式
    payoutType: '1',
    // 是否锁定该订单的处理方式
    isLockPayout: false,
    // 提交的数据
    submitData: {
      withdrawType: "1",
      status: "1",
      paymentId: "",
      id: "",
      remark: ""
    },
    // 提交复审时的备注
    remarkOrder: ""
  };
  // 回填数据
  form = {};
  // 把数字转化为中文名
  amountChineseName = "";
  // 下拉选择框
  selectOptions = [];


  @Lifecycle mounted() {
   this.getAllPaymentMethods();
   if (this.id) this.getInfoById();
  }

  // 跳转到打码核查
  gotoCode() {
    // 父组件监听状态的改变，然后出发change方法
    this.setPayoutState(this.form.userName + "_" + Date.now());
    this.$emit('close');
  }

  // 跳转到财务核查， 把用户名带过去
  goto() {
    this.$router.push(`/finance/finance-check?account=${this.form.userName}`);
  }

  changeRadio(event) {
    this.init.payoutType = event.target.value;
  }

  // 对订单进行锁定
  async changeCheckbox(event) {
    const res = await this.$service.fetch('/lottery-admin-api/withdrawRecord/getWithdrawalLock', {id: this.id});
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.init.isLockPayout = event.target.checked;
  }

  // 获取所有第三方充值方式
  async getAllPaymentMethods() {
    const res = await this.$service.fetch('/config-admin-api/thirdWithdrawal/queryAllThirdWithdrawalForMerchant', {});
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    if (res.data instanceof Array) {
      this.selectOptions = res.data;
    }
  }

  // 根据id获取详情
  async getInfoById() {
    const res = await this.$service.fetch('/lottery-admin-api/withdrawRecord/getWithdrawRecordDetail', {id: this.id});
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    if (typeof res.data === "object") {
      this.form = res.data;
      if (typeof this.form.amount === "number") {
        this.amountChineseName = formatChineseNumeral(this.form.amount);
      }
    }
  }

  // 提交订单
  async submit() {
    const res = await this.$service.fetch('/lottery-admin-api/withdrawRecord/finishWithdrawRecord', Object.assign(this.init.submitData, {id: this.id}));
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.$message.success(res.message);
    this.$emit("close");
  }

  // 复审
  reCheckOrder() {
    this.init.modalShow = true;
  }

  // 复审提交
  async reCheckOrderSubmit() {
    const res = await this.$service.fetch('/lottery-admin-api/withdrawRecord/reviewWithdrawRecord', {
      id: this.id,
      remark: this.init.remarkOrder
    });  
    this.init.modalShow = false;
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.$message.success(res.message);
    this.$emit("close");
  }

}
</script>

<style lang="scss" scoped>
.myform /deep/{
  .ant-form-item {
    margin-bottom: 5px;
  }
  .submit-btns {
    margin-top: 20px;
    button {
      margin-right: 4px;
    }
  }
  .checkbox-item {
    > span {
      &.ant-checkbox {
        display: none;
      }
      &:nth-child(2) {
        padding: 6px 12px;
        background-color: #f2f2f2;
        color: #999;
        border-radius: 2px;
        margin-left: 10px;
      }
    }

    &.locked {
       > span {
        &:nth-child(2) {
          background-color: rgba(95, 184, 120, 1);
          color: #fff;

          &::before {
            position: absolute;
            left: -20px;
            content: "\2713";
            font-size: 20px;
            color:  rgba(95, 184, 120, 1);
          }
        }
      }
    }
  }
}
</style>