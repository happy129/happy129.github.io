<template>
  <div class="back-layer">
    <div class="dialog-box" @click.stop>
      <div class="title">
        <span>支付方式</span>
        <span class="close-tag" @click="close">&times;</span>
      </div>
      <div style="padding:20px;text-align:left;">
        <a-form layout="inline" :form="form">
          <a-form-item label="支付方式">
            <a-icon type="plus-square" style="font-size:28px;vertical-align:middle;" @click="addRow" />
          </a-form-item>

          <div style="display:flex;justify-content:space-around;background-color:#F2F2F2;width:742px;padding:4px 0;margin-top:10px;">
            <div style="width:100px;text-align:right;">支付方式名称</div>
            <div style="width:200px;text-align:center;">简介</div>
            <div style="text-align:left;width:78px;">编码</div>
            <div style="text-align:left;width:78px;">跳转方式</div>
            <div style="width:50px;">状态</div>
            <div>排序</div>
          </div>

          <div v-for="(v, i) of lists" :key="i">
            <a-form-item class="mt5">
              <a-icon type="minus-square" style="font-size:28px;vertical-align:middle;margin-left:0px;margin-right:10px;" @click="removeRow(v)" />
              <a-input style="width:113px;margin-right:5px;" v-model="v.paymentName"></a-input>
              <a-input style="width:205px;margin-right:5px;" v-model="v.paymentDescription"></a-input>
              <a-input style="width:113px;margin-right:5px;" v-model="v.paymentCode"></a-input>
              <a-select v-model="v.jumpType" style="width:100px;margin-right:5px;">
                <a-select-option :value="+(k.value)" v-for="(k, i) in dictionary.thirdPaymentJumpType" :key="i">
                  {{k.name}}
                </a-select-option>
              </a-select>
              <a-select v-model="v.isEnabledForcedly" style="width:80px;margin-right:5px;">
                <a-select-option :value="1">启用</a-select-option>
                <a-select-option :value="0">停用</a-select-option>
              </a-select>
              <a-input-number style="width:69px;" v-model="v.sortOrder"></a-input-number>
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
  Computed,
  Watch
} from "vue-decorators";
import * as Api from "@api/admin";

@Component({ dictionary: 'thirdPaymentJumpType' })
export default class AddPaymentWay extends Vue {
  @Prop() det;
  lists = [
    {
      支付方式名称: "",
      简介: "",
      编码: "",
      状态: "",
      排序: ""
    }
	];
	loading=false;
  addRow() {
    this.lists.push({});
    this.$forceUpdate();
  }
  removeRow(v) {
    this.lists = _.pull(this.lists, v);
    this.$forceUpdate();
  }
  close() {
    this.$emit("close");
  }

  @Lifecycle() created() {
    this.form = this.$form.createForm(this);
    this.lists = this.det?.thirdPaymentWay || [];
  }

  submit() {
      this.loading=true;
      this.form.validateFields(async (e, v) => {
      let r = await this.$service.fetch( "/config-admin-api/thirdPayment/editThirdPayment", { ...this.det, thirdPaymentWay: this.lists, ...v } );
      this.loading=false;
      if (1 !== r.code) return r.message && this.$message.error(r.message);
      this.$emit("ok");
      this.$message.success(r.message);
      this.$emit('close');
    });
  }
}
</script>

<style lang="scss" scoped>
@import "@views/admin/Pop.scss";
.close-tag {
  font-size: 28px !important;
}
</style>

