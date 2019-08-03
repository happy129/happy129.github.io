<style lang="scss" scoped>
.conf-box /deep/ {
  background-color: #fff;
  padding: 10px;
  .ant-form-item-label {
    width: 140px;
    margin-right: 10px;
  }
  .ant-switch {
    margin-right: 10px;
  }
  .ant-input-number {
    margin-left: 10px;
    margin-right: 10px;
    width: 60px;
  }
  .submit-button {
    margin-top: 20px;
  }
}
</style>

<template>
  <div class="conf-box">
    <a-form layout="inline">
      <a-form-item label="冻结账号">
        <a-switch :checked="dataSet.freezeSwitch===1" checkedChildren="开" unCheckedChildren="关" @change="(c)=>{this.dataSet.freezeSwitch=c?1:0}"></a-switch>
        <template v-if="dataSet.freezeSwitch===1">
          <span>登录密码输错</span>
          <a-input-number v-model="dataSet.freezingLoginPwdError"></a-input-number>
          <span>次后冻结</span>
          <a-input-number v-model="dataSet.freezingTimeLoginPwdError"></a-input-number>
          <span>小时</span>
          <span>资金密码输错</span>
          <a-input-number v-model="dataSet.freezingFundPwdError"></a-input-number>
          <span>次后冻结</span>
          <a-input-number v-model="dataSet.freezingTimeFundPwdError"></a-input-number>
          <span>小时</span>
        </template>
      </a-form-item>
      <br/>
      <a-form-item label="试玩开启">
        <a-switch :checked="dataSet.tryPlaySwitch===1" checkedChildren="开" unCheckedChildren="关" @change="(c)=>{this.dataSet.tryPlaySwitch=c?1:0}"></a-switch>
        <a-input-number v-model="dataSet.tryPlayLimitRegister" v-if="dataSet.tryPlaySwitch===1"></a-input-number>
      </a-form-item>
      <br/>
      <a-form-item label="注册功能屏蔽">
        <a-switch :checked="dataSet.registerSwitch===1" checkedChildren="开" unCheckedChildren="关" @change="(c)=>{this.dataSet.registerSwitch=c?1:0}"></a-switch>
      </a-form-item>
      <a-form-item label="单个设备注册数量">
        <a-switch :checked="dataSet.deviceRegisterLimitSwitch===1" checkedChildren="开" unCheckedChildren="关" @change="(c)=>{this.dataSet.deviceRegisterLimitSwitch=c?1:0}"></a-switch>
        <a-input-number v-model="dataSet.deviceRegisterLimitQuantity" v-if="dataSet.deviceRegisterLimitSwitch===1"></a-input-number>
      </a-form-item>
      <br/>
      <a-form-item label="注册IP限制">
        <a-switch :checked="dataSet.ipRegisterLimitSwitch===1" checkedChildren="开" unCheckedChildren="关" @change="(c)=>{this.dataSet.ipRegisterLimitSwitch=c?1:0}"></a-switch>
        <template v-if="dataSet.ipRegisterLimitSwitch===1">
          <span>例如同一IP注册超过</span>
          <a-input-number v-model="dataSet.ipRegisterMaxLimitQuantity"></a-input-number>
          <span>次，要</span>
          <a-input-number v-model="dataSet.ipRegisterLimitTime"></a-input-number>
          <span>分钟后此IP才可以再次注册</span>
        </template>
      </a-form-item>
      <br/>
      <a-form-item label="APP下载">
        <a-input placeholder="请输入APP下载链接" :value="dataSet.appDownloadUrl" v-model="dataSet.appDownloadUrl"/>
      </a-form-item>
      <br/>
      <a-form-item label="元角分">
        <a-checkbox :checked="dataSet.yuanSwitch===1" @change="(e)=>{this.dataSet.yuanSwitch=e.target.checked?1:0}">元</a-checkbox>
        <a-checkbox :checked="dataSet.jiaoSwitch===1" @change="(e)=>{this.dataSet.jiaoSwitch=e.target.checked?1:0}">角</a-checkbox>
        <a-checkbox :checked="dataSet.fenSwitch===1" @change="(e)=>{this.dataSet.fenSwitch=e.target.checked?1:0}">分</a-checkbox>
        <span>至少选择1个</span>
      </a-form-item>
      <br/>
      <a-form-item label="快捷入口">
        <a-switch :checked="dataSet.shortcutEntrySwitch===1" checkedChildren="开" unCheckedChildren="关" @change="(c)=>{this.dataSet.shortcutEntrySwitch=c?1:0}"></a-switch>
        <span>首页快捷入口显示和隐藏</span>
      </a-form-item>
      <br>
      <a-form-item label="邀请码开关">
        <a-switch :checked="dataSet.inviteCodeSwitch===1" checkedChildren="开" unCheckedChildren="关" @change="(c)=>{this.dataSet.inviteCodeSwitch=c?1:0}"></a-switch>
      </a-form-item>
      <a-form-item label="邀请码必填" v-if="dataSet.inviteCodeSwitch===1">
        <a-switch :checked="dataSet.inviteCodeRequired===1" checkedChildren="开" unCheckedChildren="关" @change="(c)=>{this.dataSet.inviteCodeRequired=c?1:0}"></a-switch>
      </a-form-item>
      <br/>
      <a-form-item label="手机号码">
        <a-switch :checked="dataSet.mobileSwitch===1" checkedChildren="开" unCheckedChildren="关" @change="(c)=>{this.dataSet.mobileSwitch=c?1:0}"></a-switch>
      </a-form-item>
      <a-form-item label="手机号码必填" v-if="dataSet.mobileSwitch===1">
        <a-switch :checked="dataSet.mobileRequired===1" checkedChildren="开" unCheckedChildren="关" @change="(c)=>{this.dataSet.mobileRequired=c?1:0}"></a-switch>
      </a-form-item>
      <br/>
      <!--start 新加需求-->
      <a-form-item label="微信或QQ">
        <a-switch :checked="dataSet.chatSwitch===1" checkedChildren="开" unCheckedChildren="关" @change="(c)=>{this.dataSet.chatSwitch=c?1:0}"></a-switch>
      </a-form-item>
      <a-form-item label="微信或QQ必填" v-if="dataSet.chatSwitch===1">
        <a-switch :checked="dataSet.chatRequired===1" checkedChildren="开" unCheckedChildren="关" @change="(c)=>{this.dataSet.chatRequired=c?1:0}"></a-switch>
      </a-form-item>
      <br/>
      <a-form-item label="真实姓名">
        <a-switch :checked="dataSet.realNameSwitch===1" checkedChildren="开" unCheckedChildren="关" @change="(c)=>{this.dataSet.realNameSwitch=c?1:0}"></a-switch>
      </a-form-item>
      <a-form-item label="真实姓名必填" v-if="dataSet.realNameSwitch===1">
        <a-switch :checked="dataSet.realNameRequired===1" checkedChildren="开" unCheckedChildren="关" @change="(c)=>{this.dataSet.realNameRequired=c?1:0}"></a-switch>
      </a-form-item>
      <!--end 新加需求-->
    </a-form>

    <a-table class="mytable mt10" bordered :columns="columns" :pagination="false" :dataSource="shortcutEntryList" :rowKey="e => e.id">
      <template slot="logoUrl" slot-scope="t, r">
        <img :src="r.logoUrl" alt=".." style="width:36px;height:36px;">
      </template>
      <template slot="isEnabled" slot-scope="t, r">
        <a-switch :checked="r.isEnabled===1" checkedChildren="开" unCheckedChildren="关" @change="(c)=>{r.isEnabled=c?1:0}"></a-switch>
      </template>
      <template slot="sortOrder" slot-scope="t, r">
        <a-input-number v-model="r.sortOrder" />
      </template>
    </a-table>
    <div class="submit-button">
      <a-button  v-permission="20302"  type="primary" @click="submit">保存</a-button>
    </div>
  </div>
</template>
<script>
import Vue from "vue";
import { Component, Lifecycle, InjectComponents, Prop, State } from "vue-decorators";

@Component()
export default class ProductConf extends Vue {
  shortcutEntryList = [];
  
  dataSet = {};
  
  columns = [
    { title: "图标", dataIndex: "logoUrl", scopedSlots: {customRender: "logoUrl"} },
    { title: "快捷入口名称", dataIndex: "shortcutEntryName" },
    { title: "快捷入口显示", dataIndex: "isEnabled", scopedSlots: {customRender: "isEnabled"}  },
    { title: "快捷入口排序", dataIndex: "sortOrder", scopedSlots: {customRender: "sortOrder"}  }
  ];

 async fetchData() {
    const res = await this.$service.fetch( "/config-admin-api/productConfig/queryAllProductConfig", {} );
    if (1 != res.code) return res.message && this.$message.error(res.message);
   
    if (res.data.shortcutEntryList instanceof Array) {
      this.shortcutEntryList = res.data.shortcutEntryList;
    }

    this.dataSet = res.data;
  }

  @Lifecycle() created() {
    this.fetchData();
  }

  async submit() {
    const res = await this.$service.fetch( "/config-admin-api/productConfig/saveProductConfig", this.dataSet);
    if (1 != res.code) return res.message && this.$message.error(res.message);
    if (1 === res.code) this.$message.success(res.message);
    this.fetchData();
  }
}
</script>
