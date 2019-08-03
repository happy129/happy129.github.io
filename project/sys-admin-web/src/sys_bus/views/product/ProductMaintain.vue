<template>
  <div class="product-main-tain">
    <a-form :form="vform" @submit.prevent="submit">
      <a-form-item label="维护状态" :label-col="{ span: 2 }" :wrapper-col="{ span: 10 }">
        <a-switch  :checked="isMaintain==-1" checkedChildren="开" unCheckedChildren="关" @change="(e) => { this.isMaintain = e ? -1 : 1 }" defaultChecked/>
      </a-form-item>
      <a-form-item label="维护提示" :label-col="{ span: 2 }" :wrapper-col="{ span: 10 }">
        <a-textarea v-decorator="['noticeContent']" :rows="4"></a-textarea>
      </a-form-item>
      <a-form-item label="IOS维护页" :label-col="{ span: 2 }" :wrapper-col="{ span: 10 }">
        <a-input v-decorator="['iosMaintenancePageUrl']"/>
      </a-form-item>
      <a-form-item label="Android维护页" :label-col="{ span: 2 }" :wrapper-col="{ span: 10 }">
        <a-input v-decorator="['androidMaintenancePageUrl']"/>
      </a-form-item>
      <a-form-item label="H5维护页" :label-col="{ span: 2 }" :wrapper-col="{ span: 10 }">
        <a-input v-decorator="['h5MaintenancePageUrl']"/>
      </a-form-item>
      <a-form-item label="PC维护页" :label-col="{ span: 2 }" :wrapper-col="{ span: 10 }">
        <a-input v-decorator="['pcMaintenancePageUrl']"/>
      </a-form-item>
      <a-form-item label="维护平台" :label-col="{ span: 2 }" :wrapper-col="{ span: 10 }">
        <a-checkbox-group v-decorator="['clientTypes']">
          <a-checkbox :value="2">IOS平台</a-checkbox>
          <a-checkbox :value="1">Android平台</a-checkbox>
          <a-checkbox :value="4">PC平台</a-checkbox>
          <a-checkbox :value="3">H5平台</a-checkbox>
        </a-checkbox-group>
      </a-form-item>
      <a-form-item label="谷歌验证码" :label-col="{ span: 2 }" :wrapper-col="{ span: 2 }">
        <a-input v-decorator="['googleCode', { rules: [{required: true, message: '请输入google验证码'}] }]"/>
      </a-form-item>
      <a-form-item>
        <a-row>
          <a-col :offset="2">
            <a-button html-type="submit" :loading="loading" type="primary">提交</a-button>
          </a-col>
        </a-row>
      </a-form-item>
    </a-form>
  </div>
</template>

<script>
import Vue from "vue";
import { Component, Lifecycle, InjectComponents, Prop, State } from "vue-decorators";

@Component({ formOptions: 'id' })
export default class ProductMaintain extends Vue {
  loading = false;
  isMaintain = 1;
  id = "";

  @Lifecycle mounted() {
    this.getInfo();
  }

  async getInfo() {
    const res = await this.$service.fetch('/config-admin-api/platformMaintenance/getPlatformMaintenance');
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.vform.setValues(res.data, true);
    const clientTypeArray = res.data?.clientTypes?.split(',')?.map(v => +v) || [];
    this.vform.setValue('clientTypes', clientTypeArray);
    this.isMaintain = res.data?.status;
    this.id = res.data?.id;
  }

  async submit() {
    const form = await this.vform.validate();
    if (form.errors) return 

    this.loading = true;
    if (form.values.clientTypes)  {
      form.values.clientTypes =  form.values.clientTypes.join(',');
    }
    const res = await this.$service.fetch('/config-admin-api/platformMaintenance/savePlatformMaintenance', {
      ...form.values,
      status: this.isMaintain,
      isKickLogin: 1,
      id: this.id
    });
    this.loading = false;
    if (res.code !== 1) return res.message && this.$message.error(res.message);
    this.$message.success(res.message);
  }


}
</script>

<style lang="scss">
.product-main-tain /deep/ {
  .ant-form-item {
    margin-bottom: 10px;
  }
}
</style>