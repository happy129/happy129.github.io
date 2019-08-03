<template>
  <div class="set-wrapper">
    <a-form class="agent-set-form" :form="vform" @submit.prevent="editConfig">
      <a-form-item label="无限代开关" v-bind="label">
        <a-switch :checked="form.isInfiniteAgentEnabled" @change="form.isInfiniteAgentEnabled=!form.isInfiniteAgentEnabled"/>
      </a-form-item>
      <a-form-item label="皇冠功能" v-bind="label">
        <a-switch :checked="form.isCrownEnabled" @change="form.isCrownEnabled=!form.isCrownEnabled"/>
      </a-form-item>
      <a-form-item label="代充功能" v-bind="label">
        <a-switch :checked="form.isAgentRechargeEnabled" @change="form.isAgentRechargeEnabled=!form.isAgentRechargeEnabled"/>
      </a-form-item>
      <a-form-item label="结算模式" v-bind="label" v-show="false">
        <!-- <a-select v-decorator="['settleMentModel']">
          <a-select-option value="">请选择</a-select-option>
        </a-select> -->
        <a-input v-decorator="['settlementMode']"/>
      </a-form-item> 
      <a-form-item label="代充模式" v-bind="label">
        <a-select v-decorator="['agentRechargeMode']">
          <a-select-option :value="`0`">全部</a-select-option>
          <a-select-option v-for="(item, index) in dictionary.agentRechargeMode" :key="index" :value="item.value">{{item.name}}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="领取佣金时间" v-bind="label">
        <a-row :gutter="8">
          <a-col :span="7">
            <a-select v-decorator="['receiveCommisionDay']">
              <a-select-option v-for="(item, index) in dictionary.receiveCommisionDay" :key="index" :value="item.value">{{item.name}}</a-select-option>
            </a-select>
          </a-col>
          <a-col :span="16" :offset="1">
            <div class="flex-end">
              <a-time-picker :key="timeKey"  :defaultValue="moment(form.receiveCommisionStartTime ? form.receiveCommisionStartTime : '00:00', 'HH:mm')" @change="changeStartTime" format="HH:mm" placeholder="开始时间" />-
              <a-time-picker :key="timeKey1" :defaultValue="moment(form.receiveCommisionEndTime ? form.receiveCommisionEndTime : '00:00', 'HH:mm')" @change="changeEndTime"   format="HH:mm" placeholder="结束时间" />  
            </div>
          </a-col>
        </a-row>
      </a-form-item>
      <a-form-item label="代理说明地址" v-bind="label">
        <a-input v-decorator="['agentDescriptionUrl']"/>
      </a-form-item>
      <a-form-item v-permission="20236">
        <a-row :gutter="8">
          <a-col :span="8" :offset="2">
            <a-button :loading="state.loading" html-type="submit" type="primary">保存</a-button>
          </a-col>
        </a-row>
      </a-form-item>
    </a-form>
    <a-row>
     <a-col :offset="2"> <p class="mt15 g-red">备注：无限代如果开启则不能再关闭，请慎重开启；</p></a-col>
    </a-row>
   <!-- <a-row>
      <a-col :offset="2"><p class="mt10 g-red">备注：结算模式设定后则不能再作修改，请慎重选择；</p> </a-col>  
    </a-row> -->
  </div>
</template>
<script>
import Vue from "vue";
import { Component, Lifecycle } from "vue-decorators";
import moment from "moment"

const dictionary = "agentRechargeEnable,receiveCommisionDay,agentRechargeMode";

@Component({ dictionary, formOptions: "id", methods: { moment } })
export default class Setting extends Vue {
  label = { labelCol: { span: 2 }, wrapperCol: { span: 4 } };
  timeKey = 1;
  timeKey1 = 2;
  // 状态
  state = {
    loading: false
  }

  form = {
    isInfiniteAgentEnabled: false,
    isCrownEnabled: false,
    isAgentRechargeEnabled: false,
    receiveCommisionStartTime: "",
    receiveCommisionEndTime: ""
  };

  @Lifecycle mounted() {
    // 表单填充
    this.queryAgentConfig();
  }

  // 把true or false 转化为 1 : 0
  conversionParam(params) {
    if (!params || typeof params !== "object") return;
    const newObject = {};
    for (let [key, value] of Object.entries(params)) {
      if (typeof value === "boolean") {
        newObject[key] = value == true ? 1 : 0;
      } else {
        newObject[key] = value
      }
    }
    return newObject
  }

  async editConfig() {
    const form = await this.vform.validate();
    if (form.errors) return 
    const formData = this.conversionParam(this.form);
    this.state.loading = true;
    const requestParam = Object.assign(form.values, formData);
    console.log(JSON.stringify(requestParam));
    const res = await this.$service.fetch("/config-admin-api/infiniteAgentConfig/editInfiniteAgentConfig", requestParam);
    this.state.loading = false;
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.$message.success(res.message);
  }

  async queryAgentConfig() {
    const res = await this.$service.fetch("/config-admin-api/infiniteAgentConfig/queryInfiniteAgentConfig");
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.vform.setValues(res.data, true);
    // 无线代理开关
    this.form.isInfiniteAgentEnabled = res.data?.isInfiniteAgentEnabled == 1 ? true : false;
    // 皇冠功能开关
    this.form.isCrownEnabled = res.data?.isCrownEnabled == 1 ? true : false;
    // 代充功能开关
    this.form.isAgentRechargeEnabled = res.data?.isAgentRechargeEnabled == 1 ? true : false;
    // 设置时间
    this.form.receiveCommisionStartTime = res.data?.receiveCommisionStartTime || '10:00';
    this.form.receiveCommisionEndTime = res.data?.receiveCommisionEndTime || '00:00';  
    this.timeKey = Math.random();
    this.timeKey1 = Math.random();
  }

  changeStartTime(time, timestring) {
    this.form.receiveCommisionStartTime = timestring;
  }
  
  changeEndTime(time, timestring) {
    this.form.receiveCommisionEndTime = timestring;
  }
}
</script>
<style lang="scss" scoped>
.agent-set-form /deep/{
  .ant-form-item {
    margin-bottom: 10px;
  }
  .ant-time-picker {
    width: 80px;
  }
  .flex-end {
    display: flex;
    align-items: center;
    justify-content: flex-end;
  }
}
</style>
