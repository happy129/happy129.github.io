<template>
    <div class="line-code-setting">
      <div>
        排线码前台入口开关: 
        <a-switch 
          checkedChildren="开" 
          unCheckedChildren="关" 
          :checked="init.isShareLineEnabled" 
          @change="init.isShareLineEnabled=!init.isShareLineEnabled"
        />
      </div>
      <div class="page-under-table">
        <a-form layout="inline" :form="vform" @submit.prevent="submit">
          <a-form-item label="谷歌验证码">
            <a-input v-decorator="['googleCode', {rules: [{ required: true, message: '请输入google验证码' }] } ]"/>
          </a-form-item>
          <a-form-item v-permission="20366" style="margin-left: 10px;">
            <a-button :loading="init.loading" html-type="submit" type="primary">保存</a-button>
          </a-form-item>
        </a-form>
      </div>
    </div>
</template>

<script>
import Vue from 'vue'
import { Component, Lifecycle } from 'vue-decorators'

@Component({ formOptions: 'id' })
export default class LineCodeSetting extends Vue {
  init = {
    isShareLineEnabled: false
  };

  @Lifecycle mounted() {
    this.getDetail();
  }

  async getDetail() {
    const res = await this.$service.fetch("/config-admin-api/shareLine/queryShareLineSwitch");
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    if (res.data?.isShareLineEnabled) {
      this.init.isShareLineEnabled = res.data.isShareLineEnabled == 0 ? false : true
    }
  }

  async submit() {
    const form = await this.vform.validate();
    if (form.errors) return
    const res = await this.$service.fetch("/config-admin-api/shareLine/editShareLineSwitch", {
      isShareLineEnabled: this.init.isShareLineEnabled == false ? 0 : 1,
     // platformId: this.platformId,
      ...form.values
    });
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.$message.success(res.message);
  }
}

</script>
