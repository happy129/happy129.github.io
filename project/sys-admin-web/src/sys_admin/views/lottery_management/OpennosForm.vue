<style lang="scss" scoped>
.no-valid /deep/ {
  .ant-form-item-label { font-weight: 400; font-size: 13px; color: #777; }
  .ant-form-item-label, .ant-form-item-control { line-height: 21px; }
}
</style>
<template>
  <a-modal class="mymodal" v-model="visible" :maskClosable="false" 
    :title="title" @ok="submit()" @cancel="$emit('close')"
    :confirmLoading="loading">
    <a-form :form="vform">
      <template v-for="(d, i) in vform.hiddens" >
        <a-form-item v-if="typeof vform.data[d] != 'undefined'" v-show="false" :key="i" :label="d">
          <input type="hidden" v-decorator="[d]"/>{{`${vform.data[d]}`.trim().length}}
        </a-form-item>
      </template>
      <a-form-item class="no-valid" label="平台名称" :label-col="{ span: 6 }" :wrapper-col="{ span: 15 }" >
        <a-input disabled placeholder="系统录入" :value="vform.data.platformName"/>
      </a-form-item>
      <a-form-item class="no-valid" label="彩种名称" :label-col="{ span: 6 }" :wrapper-col="{ span: 15 }" >
        <a-input disabled placeholder="系统录入" :value="vform.data.lotteryName"/>
      </a-form-item>
      <a-form-item label="本期截止时间" :label-col="{ span: 6 }" :wrapper-col="{ span: 15 }">
        <a-date-picker style="width: 295px;" showTime format="YYYY-MM-DD HH:mm:ss" placeholder="请选择" v-decorator="['currentIssueEndTime', $rules.requiredSelect()]"/>
      </a-form-item>
      <a-form-item class="no-valid" label="开奖期号" :label-col="{ span: 6 }" :wrapper-col="{ span: 15 }" >
        <a-input disabled placeholder="系统录入" :value="vform.data.issueNo"/>
      </a-form-item>
      <a-form-item class="no-valid" label="开奖号码" :label-col="{ span: 6 }" :wrapper-col="{ span: 15 }" >
        <a-input disabled placeholder="系统录入" :value="vform.data.openNumber"/>
      </a-form-item>
    </a-form>
  </a-modal>
</template>
<script>
import Vue from 'vue'
import { Component, InjectComponents, Prop, Watch, Lifecycle, Computed, Filter, State, Action, Getter, Mutation, InjectComponent } from 'vue-decorators';

/** 数据字典 */
const dictionary = 'plateType'
/** 表单验证，可以不设置值，如果设置就是初始化要配置隐藏值，默认vform变量 */
const formOptions = 'id'; 
// const formOptions = {
//   vform: '隐藏字段，使用vform.hiddens可以绑定dom值',
//   vform1: '隐藏字段，使用vform.hiddens可以绑定dom值'
// }

@Component({ dictionary, formOptions })
export default class OpennosForm extends Vue {

  visible = true;
  loading = false;

  @Computed() title() {
    return this.params.id ? `修改开奖号码` : `添加开奖号码`;
  }

  /** 提交 */
  async submit() {
    const form = await this.vform.validate();
    if (form.errors) return;
    
    this.loading = true;
    // const apiName = this.params.id ? '/config-admin-api/openNumber/edit' : '/config-admin-api/openNumber/add';
    const apiName = '/config-admin-api/openNumber/editDeadlineTime';
    const res = await this.$service.fetch(apiName, form.vals);
    this.loading = false;
    if (1 != res.code) return res.message && this.$message.error(res.message);
    this.$message.success(res.message);
    this.$emit('close', true);
  }

  @Lifecycle created() {
    // 设定初始值
    this.$tools.parseMomentObj(this.params, 'settleTime');
		this.vform.setValues(this.params, true);
		console.log(this.params,'params');
  }
}
</script>

