<style lang="scss" scoped>
.cashSettings-box /deep/ {
  background-color: #fff;
  padding: 26px;
  .ant-form-item-label {
    width: 140px;
    margin-right: 10px;
  }
  .ant-switch {
    margin-right: 10px;
  }
  .ant-input-number {
    margin-right: 10px;
  }
}
</style>

<template>
  <div class="cashSettings-box">
    <a-form layout="inline">
      <a-form-item label="提款整数开关">
        <a-switch
          checkedChildren="开"
          unCheckedChildren="关"
          :checked="dataSet.withdrawWholeNumberSwitch===1?true:false"
          @change="c => {dataSet.withdrawWholeNumberSwitch=c?1:0}"
        ></a-switch>
        <span>备注：整数提款开关，开启后会员提款时，只能提交整数。</span>
      </a-form-item>

      <br>
      <a-form-item label="打码倍数">
        <a-input-number v-model="dataSet.betMultiple"></a-input-number>
        <span>倍，0为不需要打码</span>
      </a-form-item>

      <br>
      <a-form-item label="每天最大提现次数">
        <a-input-number v-model="dataSet.maxWithdrawNumber"></a-input-number>
      </a-form-item>

      <br>
      <a-form-item label="每人最多绑卡数量">
        <a-input-number v-model="dataSet.maxBindCardNumber"></a-input-number>
      </a-form-item>

      <br>
      <a-form-item label="不可提现时间" v-if="dataSet!=={}">
        <a-time-picker
          @change="changeCanWithdrawStart"
          format="HH:mm"
          placeholder="开始时间"
          v-model="start"
        />-
        <a-time-picker
          @change="changeCanWithdrawEnd"
          format="HH:mm"
          placeholder="结束时间"
          v-model="end"
        />
      </a-form-item>

      <br>
      <a-form-item label="提现金额范围">
        <a-input-number style="margin-right:4px;" v-model="dataSet.minWithdrawAmount"></a-input-number>-
        <a-input-number v-model="dataSet.maxWithdrawAmount"></a-input-number>
      </a-form-item>

      <br>
      <a-form-item label="提现说明">
        <a-textarea
          placeholder="提现说明"
          :rows="6"
          v-model="dataSet.remark"
          style="width:1200px;margin-top:10px;"
        />
      </a-form-item>
    </a-form>

    <a-button v-permission="20304" type="primary" @click="submit">保存</a-button>
  </div>
</template>
<script>
import moment from "moment";
import Vue from "vue";
import {
  Component,
  Lifecycle,
  InjectComponents,
  Prop,
  State,
  Computed
} from "vue-decorators";
@Component()
export default class CashSettings extends Vue {
  start = moment(new Date(), "HH:mm");
  end = moment(new Date(), "HH:mm");
  dataSet = {};
  moment = moment;
  noCanWithdrawTimeEnd = "00:00";
  noCanWithdrawTimeStart = "00:00";

  changeCanWithdrawStart(m, s) {
    this.noCanWithdrawTimeStart = s;
  }

  changeCanWithdrawEnd(m, s) {
    this.noCanWithdrawTimeEnd = s;
  }

  async submit() {
    let p = {
      betMultiple: this.dataSet?.betMultiple,
      maxBindCardNumber: this.dataSet?.maxBindCardNumber,
      maxWithdrawAmount: this.dataSet?.maxWithdrawAmount,
      maxWithdrawNumber: this.dataSet?.maxWithdrawNumber,
      minWithdrawAmount: this.dataSet?.minWithdrawAmount,
      noCanWithdrawTimeEnd: this.noCanWithdrawTimeEnd,
      noCanWithdrawTimeStart: this.noCanWithdrawTimeStart,
      remark: this.dataSet?.remark,
      withdrawWholeNumberSwitch: this.dataSet?.withdrawWholeNumberSwitch
    };

    let res = await this.$service.fetch( "/config-admin-api/withdrawConfig/saveWithdrawConfig", p );
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.$message.success(res.message);
    this.getDataSet();
    this.$forceUpdate();
  }

  async getDataSet() {
    let res = await this.$service.fetch( "/config-admin-api/withdrawConfig/queryAllWithdrawConfig", {} );
    if (1 != res.code) return res.message && this.$message.error(res.message);
    this.dataSet = res.data;
    this.start = moment( this.dataSet.noCanWithdrawTimeStart === "0" ? "00:00" : this.dataSet.noCanWithdrawTimeStart, "HH:mm" );
    this.end = moment( this.dataSet.noCanWithdrawTimeEnd === "0" ? "00:00" : this.dataSet.noCanWithdrawTimeEnd, "HH:mm" );
    this.noCanWithdrawTimeStart = this.start.format("HH:mm");
    this.noCanWithdrawTimeEnd = this.end.format("HH:mm");
  }

  @Lifecycle() async created() { 
    await this.getDataSet(); 
    this.noCanWithdrawTimeEnd = this.dataSet?.noCanWithdrawTimeEnd;
    this.noCanWithdrawTimeStart = this.dataSet?.noCanWithdrawTimeStart;
  }
}
</script>
