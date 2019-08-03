<style lang="scss">
</style>
<template>
  <a-modal class="form" v-model="visible" :maskClosable="false" 
    :title="title" @ok="submit()" @cancel="$emit('close')"
    :confirmLoading="loading">
    <a-form :form="vform">
      <template v-for="(d, i) in vform.hiddens" >
        <a-form-item v-if="typeof vform.data[d] != 'undefined'" v-show="false" :key="i" :label="d">
          <input type="hidden" v-decorator="[d]"/>{{`${vform.data[d]}`.trim().length}}
        </a-form-item>
      </template>
      <a-form-item label="来源名称" :label-col="{ span: 5 }" :wrapper-col="{ span: 12 }" >
        <a-input v-decorator="[ 'sourceName', {  rules: [{ required: true, message: '请输入来源名称' }] }]"/>
      </a-form-item>
    </a-form>
  </a-modal>
</template>
<script>
import Vue from 'vue'
import { Component, InjectComponents, Prop, Watch, Lifecycle, Computed, Filter, State, Action, Getter, Mutation, InjectComponent } from 'vue-decorators';

/** 数据字典 */
const dictionary = ''
/** 表单验证，可以不设置值，如果设置就是初始化要配置隐藏值，默认vform变量 */
const formOptions = 'id'; 
// const formOptions = {
//   vform: '隐藏字段，使用vform.hiddens可以绑定dom值',
//   vform1: '隐藏字段，使用vform.hiddens可以绑定dom值'
// }

@Component({ dictionary, formOptions })
export default class OpennosSourceForm extends Vue {

  visible = true;
  loading = false;

  @Computed() title() {
    return this.params.id ? `修改彩种分类` : `添加彩种分类`;
  }

  /** 提交 */
  async submit() {
    const form = await this.vform.validate();
    if (form.errors) return;
    
    this.loading = true;
    const apiName = this.params.id ? '/config-admin-api/collectingSource/editCollectingSource' : '/config-admin-api/collectingSource/addCollectingSource';
    const res = await this.$service.fetch(apiName, form.values);
    this.loading = false;
    if (1 != res.code) return res.message && this.$message.error(res.message);
    this.$message.success(res.message);
    this.$emit('close', true);
  }

  @Lifecycle created() {
    // 设定初始值
    this.vform.setValues(this.params, true);
  }
}
</script>

