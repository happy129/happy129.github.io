<template>
  <div class="back-layer">
    <div class="dialog-box" @click.stop>
      <div class="title">
        <span>添加银行卡前缀</span>
        <span class="close-tag" @click="close">X</span>
      </div>
      <div style="text-align:left;padding:20px;">
        <a-form :form="form" layout="inline">
          <a-form-item label="银行名称">
            <a-select
              v-decorator="['bankId', {rules: [{required: true, message: '请选择银行名称'}]}]"
              placeholder="请选择"
              style="width:174px;"
            >
                <a-select-option v-for="(v, i) of allBs" :value="v.bankId" :key="i">{{v.bankName}}</a-select-option>
            </a-select>
          </a-form-item>

          <br>
          <a-form-item label="银行卡类型">
            <a-select
              v-decorator="['cardType', {rules: [{required: true, message: '请选择银行卡类型'}]}]"
              placeholder="请选择"
              style="width:174px;"
            >
            <a-select-option v-for="(v, i) of dictionary.bankType" :key="i" :value="v.value">{{v.name}}</a-select-option>
            </a-select>
          </a-form-item>

          <br>
          <a-form-item label="银行卡前缀">
            <a-input
              v-decorator="['cardNoPrefix', {rules: [{required: true, message:'银行卡前缀是1-20位数字', pattern:/^[0-9]{1,20}$/}]}]"
              placeholder="请选择"
            ></a-input>
          </a-form-item>

          <br>
          <a-form-item label="银行卡名称">
            <a-input
              v-decorator="['cardName', {rules: [{required: true, message: '银行卡名称只能是1-20个中文字符', pattern:/^[\u4e00-\u9fa5]{1,20}$/}]}]"
              placeholder="请选择"
            ></a-input>
          </a-form-item>
        </a-form>
      </div>
      <a-button type="primary" @click="submit">保存</a-button>
    </div>
  </div>
</template>
<script>
import Vue from "vue";
import { Component, Lifecycle, InjectComponents, State, Prop } from "vue-decorators";

@Component({dictionary:"bankType"})
export default class AddPrefix extends Vue {
    @Prop() allBs;

  close() {
    this.$emit("close");
  }

  @Lifecycle() created() {
    this.form = this.$form.createForm(this);
  }

  submit() {
    this.form.validateFields(async (e, v) => {
      if (e) return;
      let res = await this.$service.fetch(
        "/config-admin-api/bankCardType/addBankCardType",
        {
          ...v
        }
      );
      if (1 !== res.code) return res.message&&this.$message.error(res.message);
      this.$emit("ok");
      this.$message.success(res.message);
      this.$emit('close');
    });
  }
}
</script>

<style lang="scss" scoped>
@import "@views/admin/Pop.scss";
/deep/ .ant-form-item-label {
  width: 120px;
}
</style>
