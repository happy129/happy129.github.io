<style lang="scss" scoped>
</style>
<template>
  <a-modal class="lottery_category_form" v-model="visible" :maskClosable="false" 
    :title="title" @ok="submit()" @cancel="$emit('close')"
    :confirmLoading="loading">
    <a-form :form="vform">
      <template v-for="(d, i) in vform.hiddens" >
        <a-form-item v-if="typeof vform.data[d] != 'undefined'" v-show="false" :key="i" :label="d">
          <input type="hidden" v-decorator="[d]"/>{{`${vform.data[d]}`.trim().length}}
        </a-form-item>
      </template>

      <a-form-item label="分类名称" :label-col="{ span: 6 }" :wrapper-col="{ span: 12 }" >
        <a-input v-decorator="[ 'categoryName', {  rules: [{ required: true, message: '请输入分类名称' }] }]"/>
      </a-form-item>
      <a-form-item label="分类名称" :label-col="{ span: 6 }" :wrapper-col="{ span: 12 }" >
        <input type="hidden" v-show="false" v-decorator="[ 'plateType', {  rules: [{ required: true, message: '请选择盘口类型' }] }]"/>
        <a-button-group>
          <a-button v-for="(d, i) in dictionary.plateType" :key="i" 
            :type="d.value == vform.data.plateType ? 'primary' : 'default'"
            @click.native="vform.setValue('plateType', d.value)">{{d.name}}</a-button>
        </a-button-group>
      </a-form-item>
      <a-form-item label="开奖号码长度" :label-col="{ span: 6 }" :wrapper-col="{ span: 12 }" >
        <a-input v-number v-decorator="['openNumberLength', {  rules: [{ required: true, message: '开奖号码长度为必填' }] }]"/>
      </a-form-item>
      <a-form-item label="排序" :label-col="{ span: 6 }" :wrapper-col="{ span: 12 }" >
        <a-input-number style="width: 235px" v-decorator="[ 'sortOrder', {  rules: [{ required: true, message: '请输入排序' }] }]"/>
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
export default class LotteryCategoryForm extends Vue {

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
    const apiName = this.params.id ? '/config-admin-api/category/editCategory' : '/config-admin-api/category/addCategory';
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

