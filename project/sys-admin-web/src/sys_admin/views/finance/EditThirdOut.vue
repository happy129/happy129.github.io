<template>
  <div class="back-layer">
    <div class="dialog-box" @click.stop>
      <div class="title">
        <span>修改第三方渠道</span>
        <span class="close-tag" @click="close">&times;</span>
      </div>
      <div style="padding:20px;text-align:left;">
        <a-form layout="inline" :form="form">
          <a-form-item label="第三方名称">
            <a-input v-decorator="['paymentChannelName', {initialValue: details.paymentChannelName, rules: [{ required: true, message: '请输入第三方名称'  }]} ]"></a-input>
          </a-form-item>
          <a-form-item label="总控开关">
            <a-select
              style="width:120px;"
              v-decorator="[ 'isEnabledForcedly', {initialValue: details.isEnabledForcedly, rules: [{ required: true, message: '请选择状态' }]} ]"
            >
              <a-select-option :value="1">启用</a-select-option>
              <a-select-option :value="0">禁用</a-select-option>
            </a-select>
          </a-form-item>

          <br>
          <a-form-item label="网关地址">
            <a-input
              style="width:400px;"
              v-decorator="[ 'thirdGateway', {initialValue: details.thirdGateway, rules: [{ required: true, pattern: /^[^\u4e00-\u9fa5]+$/g, message: '网关地址不能有中文'}]}]"
            ></a-input>
          </a-form-item>

          <!-- <br>
          <a-form-item label="回调地址">
            <a-input style="width:400px;" v-decorator="[ '回调地址', {initialValue: details.回调地址}]"></a-input>
          </a-form-item> -->

          <br>
          <a-form-item label="接入方式">
            <a-select
              style="width:120px;"
              v-decorator="[ 'encodeType', {initialValue: details.encodeType, rules: [{required: true, message: '请选择接入方式'}]}]"
            >
              <a-select-option :value="1">MD5</a-select-option>
              <a-select-option :value="2">RSA</a-select-option>
            </a-select>
          </a-form-item>

          <br>
          <a-form-item label="添加字段">
            <a-icon
              type="plus-square"
              style="font-size:28px;vertical-align:middle;"
              @click="addRow"
            />
          </a-form-item>

          <div class="edit-item" v-for="(v, i) of lists" :key="i">
            <a-form-item class="mt5">
              <a-icon
                type="minus-square"
                style="font-size:28px;vertical-align:middle;margin-left:107px;margin-right:10px;"
                @click="removeRow(v)"
              />
              <a-input style="width:171px;margin-right:20px;" v-model="v.columnName" placeholder="字段名称" @blur="testcolumnName"/>

              <a-input style="width:171px;" v-model="v.columnDesc" placeholder="字段标识" @blur="testcolumnDesc"/>
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
import {
  Component,
  Lifecycle,
  InjectComponents,
  State,
  Prop,
  Computed
} from "vue-decorators";
import * as Api from "@api/admin";

@Component
export default class EditThirdOut extends Vue {
  @Prop() details;
  lists = [];
  loading = false;
  iserror = false;
  addRow() {
    this.lists.push({
      columnName: "",
      columnDesc: ""
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
    this.lists = this.details?.thirdPaymentConfig||[];
    this.$forceUpdate();
  }

  submit() {
    this.loading = true;
    if (this.iserror) {
      this.$message.error("请确认正确填写添加字段");
    } else {
      this.form.validateFields(async (e, v) => {
        if (e) return;
        let r = await this.$service.fetch(
                "/config-admin-api/thirdPayment/editThirdPayment",
                {...this.details, thirdPaymentConfig: this.lists, ...v}
        );
        if (1 !== r.code) return r.message && this.$message.error(r.message);
        this.loading = false;
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
.close-tag {
  font-size: 30px !important;
}
</style>

