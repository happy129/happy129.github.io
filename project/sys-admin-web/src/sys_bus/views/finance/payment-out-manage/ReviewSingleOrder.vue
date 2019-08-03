<template>
  <a-form :form="vform" layout="inline">
    <a-form-item label="审核备注" v-if="orderType==='fail'">
      <a-input class="form-item" placeholder="输入审核备注" v-decorator="['remark', {rules: [{ required: true, message: '请输入审核备注' }]}]"/>
    </a-form-item>
    <a-form-item label="复审备注" v-else>
      <a-input class="form-item" placeholder="输入复审备注" v-decorator="['remark', {rules: [{ required: true, message: '请输入复审备注' }]}]"/>
    </a-form-item>
    <div class="mt15 text-center">
      <a-button type="primary" @click="submit">确认</a-button>&nbsp;&nbsp;
      <a-button @click="$emit('cancel')">取消</a-button>
    </div>
  </a-form>
</template>

<script>
import Vue from "vue";
import moment from "moment";
import { Component, InjectComponents, Lifecycle, Watch, Prop } from "vue-decorators";

@Component({
  formOptions: "id"
})
export default class ReviewSingleOrder extends Vue {
  @Prop({ type: [String, Number], default: 'review' }) orderType;
  @Prop({ type: [String, Number] }) id;

  // 提交复审或者审核失败
  async submit() {
    const form = await this.vform.validate();
    if (form.errors) return;
    let res = "";
    if (this.orderType === 'review') {
      res = await this.$service.fetch('/lottery-admin-api/withdrawRecord/reviewWithdrawRecord', {
        id: this.id,
        remark: form.values.remark
      });
    } else {
      res = await this.$service.fetch('/lottery-admin-api/withdrawRecord/batchRejectWithdrawRecord', {
        list: [{id: this.id, remark: form.values.remark}]
      });
    }
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.$message.success(res.message);
    this.$emit("close", res.code, this.id, this.orderType);
  }
}

</script>

<style lang="scss">
.form-item {
  width: 290px;
}
.text-center {
  text-align: center;
}
</style>
