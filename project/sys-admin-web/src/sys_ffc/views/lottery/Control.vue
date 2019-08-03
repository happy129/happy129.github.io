<template>
  <div class="set-wrapper">
    <a-form class="control-set-form" :form="vform" @submit.prevent="editFFCControl">
      <a-form-item label="杀率策略"  :label-col="{ span: 2 }" :wrapper-col="{ span: 4 }">
        <a-select v-decorator="['controlStrategy', { rules: [{required: true, message: '请选择杀率策略'}] }]" @change="(v) => state.mode = v">
          <a-select-option value>请选择</a-select-option>
          <a-select-option v-for="(item, index) in dictionary.fenFenCaiControlStrategy" :key="index" :value="item.value">{{item.name}}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="盈利率区间" :label-col="{ span: 2 }" :wrapper-col="{ span: 20 }" v-if="state.mode != 2">
          <a-row :gutter="8">
            <a-col :span="24">
              <a-input key="1" class="profit-area" v-decorator="['minProfitRate', { rules: [{required: true, message: '请输入最小盈利率' }] }]" addonAfter="%"/>-
              <a-input key="2" class="profit-area" v-decorator="['maxProfitRate', { rules: [{required: true, message: '请输入最小盈利率'  }] }]" addonAfter="%"/>&nbsp;
              <span class="g-blue">&nbsp;*可输入的区间值只能是0.5% - 5%且区间的差额需大于或等于0.5%</span>
            </a-col>
          </a-row>
      </a-form-item>
      <a-form-item label="负盈利率" :label-col="{ span: 2 }" :wrapper-col="{ span: 20 }">
        <a-row :gutter="8">
          <a-col :span="24">
            <a-input class="profit-area" v-decorator="['negativeProfitRate', { rules: [{required: true, validator: validatorNegativeProfitRate }] }]"  addonAfter="%"/>
            <span class="g-blue">&nbsp;*只能输入负数</span>
          </a-col>
        </a-row>
      </a-form-item>
      <a-form-item label="组数控制" :label-col="{ span: 2 }" :wrapper-col="{ span: 20 }">
        <a-row>
          <a-col :span="24">
            <a-input v-number class="profit-area" v-decorator="['groupCount', { rules: [{ required: true, validator: validatorGroupCount }] }]"/>
            <span class="g-blue">&nbsp;*可输入的数值只能是2-10</span>
          </a-col>
        </a-row>
      </a-form-item>
      <a-form-item>
        <a-row :gutter="8">
          <a-col :span="8" :offset="2">
            <a-button :loading="state.loading" html-type="submit" type="primary">保存</a-button>
          </a-col>
        </a-row>
      </a-form-item>
    </a-form>
    <a-row>
     <a-col :offset="2"> <p class="mt15 g-red">1、盈利模式：达到盈利率或负盈利率的条件则会开启杀率；</p></a-col>
    </a-row>
    <a-row>
      <a-col :offset="2"><p class="mt10 g-red">2、止损模式：达到负盈利率则会开启杀率；</p> </a-col>  
    </a-row>
  </div>
</template>
<script>
import Vue from "vue";
import { Component, Lifecycle } from "vue-decorators";
import moment from "moment"

const dictionary = "fenFenCaiControlStrategy";

@Component({ formOptions: "id", dictionary })
export default class Control extends Vue {
  // 状态
  state = {
    loading: false,
    mode: 1
  }

  @Lifecycle mounted() {
    this.vform.setValue("controlStrategy", "");
    this.getFFCDetail();
  }

  // 验证最小盈利区间
  // validatorMinProfitRate(rule, value, callback) {
  //   const maxValue = this.vform.getValue('maxProfitRate');
  //   if (value && maxValue && +value > parseFloat(maxValue)) {
  //     callback("最小盈利区间不能大于最大盈利区间");
  //   }
  //   if (value && +value < 0.5 || +value > 5) {
  //     callback("最小盈利区间在0.5-5之间");
  //   }
  //   callback();
  // }

  // 验证最大盈利区间
  // validatorMaxProfitRate(rule, value, callback) {
  //   const minValue = this.vform.getValue('minProfitRate');
  //   if (value && minValue && +value < parseFloat(minValue)) {
  //     callback("最大盈利区间不能小于最小盈利区间");
  //   } else if (value && +value < 0.5 || +value > 5) {
  //     callback("最小盈利区间在0.5-5之间");
  //   }
  //   callback();
  // }

  validatorNegativeProfitRate(rule, value, callback) {
    if (!(+value < 0) || isNaN(value)) {
      callback('负盈利率只能为负数');
    }
    callback();
  }

  validatorGroupCount(rule, value, callback) {
    if (isNaN(value) || +value < 2 || +value > 10 || value.indexOf(".") != -1) {
      callback("请输入2-10之间的整数")
    }
    callback();
  }

  // 获取分分彩控制详情
  async getFFCDetail() {
    const res = await this.$service.fetch("/config-admin-api/ffcControl/getOneFfcControl");
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.vform.setValues(res.data, true);
    this.state.mode = res.data?.controlStrategy;
  }

  // 编辑分分彩
  async editFFCControl() {
    const form = await this.vform.validate();
    if (form.errors) return
    const min = parseFloat(form.values.minProfitRate);
    const max = parseFloat(form.values.maxProfitRate);

    if (min < 0.5 || max > 5) {
      return this.$message.error("最小盈利率区间在0.5%-5%之间");
    }
    if (min > max) {
      return this.$message.error("最小盈利率必须小于最大盈利率");
    } else if ( max < min+0.5) {
      return this.$message.error("盈利区间的差额需大于或等于0.5%");
    }

    this.state.loading = true;
    const res = await this.$service.fetch("/config-admin-api/ffcControl/editFfcControl", form.values);
    this.state.loading = false;
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.$message.success(res.message);
  }
}
</script>
<style lang="scss" scoped>
.set-wrapper {
  height: 100%;
  background-color: #fff;
  padding: 10px 5px;
}
.control-set-form /deep/ {
  .ant-form-item {
    margin-bottom: 10px;
  }
  .profit-area {
    width: 132px;
  }
}
</style>
