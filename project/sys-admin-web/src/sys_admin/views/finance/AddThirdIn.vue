<template>
  <div class="back-layer">
    <div class="dialog-box" @click.stop>
      <div class="title">
        <span>添加第三方充值渠道</span>
        <span class="close-tag" @click="close">&times;</span>
      </div>
      <div style="padding:20px;text-align:left;">
        <a-form layout="inline" :form="form">
          <a-form-item label="第三方支付">
            <a-input v-decorator="['paymentChannelName', {rules: [{ required: true, message: '请输入第三方名称' }]} ]" ></a-input>
          </a-form-item>
          <a-form-item label="总控开关">
            <a-select
              style="width:120px;"
              v-decorator="[ 'isEnabledForcedly', { initialValue: 1,  rules: [{ required: true, message: '请选择状态' }]} ]"
            >
              <a-select-option :value="1">启用</a-select-option>
              <a-select-option :value="0">禁用</a-select-option>
            </a-select>
          </a-form-item>

          <br>
          <a-form-item label="网关地址">
            <a-input style="width:400px;" v-decorator="[ 'thirdGateway', {rules: [{required: true, pattern: /^[^\u4e00-\u9fa5]+$/g, message: '网关地址不能有中文'}]}]"></a-input>
          </a-form-item>
          <br>
          <a-form-item label="第三方编码">
            <a-input style="width:400px;" v-decorator="[ 'module', {rules: [{required: true, pattern: /^[.\r\n\s\S\w\W\D\d]{0,10}$/i, message: '第三方编码长度不能超过10'}]}]"></a-input>
          </a-form-item>

          <!-- <br>
          <a-form-item label="回调地址">
            <a-input style="width:400px;"></a-input>
          </a-form-item> -->

          <br>
          <a-form-item label="接入方式">
            <a-select style="width:120px;" v-decorator="[ 'encodeType', {  initialValue: 1, rules: [{required: true, message: '请选择接入方式'}]}]">
              <a-select-option :value="1">MD5</a-select-option>
              <a-select-option :value="2">RSA</a-select-option>
            </a-select>
          </a-form-item>

          <!-- <a-form-item label="跳转方式">
            <a-select style="width:120px;">
              <a-select-option :value="1">浏览器内</a-select-option>
              <a-select-option :value="2">应用内</a-select-option>
            </a-select>
          </a-form-item> -->

          <br>
          <a-form-item label="对接备注">
            <a-input style="width:400px;" v-decorator="['remark', {rules: [{required: true, pattern: /^[.\r\n\s\S\w\W\D\d]{0,200}$/i, message: '长度不能超过200'}]}]"></a-input>
          </a-form-item>

          <br>
          
          <a-form-item label="添加字段" >
            <a-icon
              type="plus-square"
              style="font-size:28px;vertical-align:middle;"
              @click="addRow"
            />
          </a-form-item>

          <div v-for="(v, i) of lists" :key="i">
            <a-form-item class="mt5">
              <a-icon
                type="minus-square"
                style="font-size:28px;vertical-align:middle;margin-left:107px;margin-right:10px;"
                @click="removeRow(v)"
              />
              <a-input style="width:171px;margin-right:20px;" v-model="v.columnDesc" placeholder="字段名称" @blur="testcolumnDesc" ></a-input>
              <a-input style="width:171px;" v-model="v.columnName" placeholder="字段标识" @blur="testcolumnName" ></a-input>
            </a-form-item>
          </div>
        </a-form>
      </div>
      <a-button type="primary" @click="submit" :loading="loading">保存</a-button>
    </div>
  </div>
</template>
<script>
import Vue from "vue";
import { Component, Lifecycle, InjectComponents, State, Computed, Prop } from "vue-decorators";
import * as Api from "@api/admin";

@Component
export default class AddThirdIn extends Vue {
  lists = [];
  loading = false;
  iserror = false;

  @Prop() details;
  addRow() {
    this.lists.push({
      columnName: '',
      columnDesc: ''
    });
    this.$forceUpdate();
  }
  removeRow(v) {
    this.lists = _.pull(this.lists, v);
    this.$forceUpdate();
  }
  close() {
    this.$emit("close");
  }

  testcolumnName(e) {
    let value = e.target.value;
    let pattern = /^[.\r\n\s\S\w\W\D\d]{0,10}$/i;
    if (!pattern.test(value)) {
      this.$message.error("添加字段名称长度不能超过10");
      this.iserror = true;
      return false;
    } else {
      this.iserror = false;
    }
  }

  testcolumnDesc(e) {
    let value = e.target.value;
    let pattern = /[\u4e00-\u9fa5\d]/g;
    if (pattern.test(value) || value.length > 20) {
      this.$message.error("添加字段标识长度不能超过20且不能包含中文");
      this.iserror = true;
      return false;
    } else {
      this.iserror = false;
    }
  }

  @Lifecycle() created() {
    this.form = this.$form.createForm(this);
  }

  submit() {
    //if (this.lists.length === 0) {this.$message.error("请输入添加字段"); return;};
    this.loading = true;
    if (this.iserror) {
      this.$message.error("请确认正确填写添加字段");
      this.loading = false;
    } else {
      this.form.validateFields(async (e, v) => {
        if (e) return;
        let r = await this.$service.fetch(
                "/config-admin-api/thirdPayment/addThirdPayment",
                {thirdPaymentConfig: this.lists, ...v}
        );
        this.loading = false;
        if (1 !== r.code) return r.message && this.$message.error(r.message);
        this.$emit('ok')
        this.$message.success(r.message);
        this.$emit('close');
      });
    }
  }
}
</script>

<style lang="scss" scoped>
@import "@views/admin/Pop.scss";
/deep/ .ant-form-item-label {
  width: 107px;
}
/deep/ .required-icon label::before {
    display: inline-block;
    margin-right: 4px;
    content: '*';
    font-family: SimSun;
    line-height: 1;
    font-size: 14px;
    color: #f5222d;
}
.close-tag {
  font-size: 28px !important;
}
</style>

