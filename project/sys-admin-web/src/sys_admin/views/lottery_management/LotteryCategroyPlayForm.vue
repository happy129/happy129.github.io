<style lang="scss">
.layout1 {
  > div { width: 49.5%;  display: inline-block; }
}
</style>
<template>
  <a-modal class="form" v-model="visible" :maskClosable="false" 
    :title="title" @ok="submit()" @cancel="$emit('close')"
    :confirmLoading="loading" :width="width">
    <a-form :form="vform">
      <template v-for="(d, i) in vform.hiddens" >
        <a-form-item v-if="typeof vform.data[d] != 'undefined'" v-show="false" :key="i" :label="d">
          <input type="hidden" v-decorator="[d]"/>{{`${vform.data[d]}`.trim().length}}
        </a-form-item>
      </template>
      
      <!-- 类型 -->
      <template v-if="'type' == params.type">
        <a-form-item label="类型名称" :label-col="{ span: 5 }" :wrapper-col="{ span: 12 }" >
          <a-input placeholder="请输入" v-decorator="[ 'playName', {  rules: [{ required: true, message: '请输入类型名称' }] }]"/>
        </a-form-item>
        <a-form-item label="排序" :label-col="{ span: 5 }" :wrapper-col="{ span: 12 }" >
          <a-input-number placeholder="请输入" style="width: 235px" v-decorator="[ 'sortOrder', {  rules: [{ required: true, message: '请输入排序' }] }]"/>
        </a-form-item>
        <a-form-item label="是否启用" :label-col="{ span: 5 }" :wrapper-col="{ span: 12 }" >
          <a-switch :checkedChildren="dictionary.enabledStatus.get(1)" :unCheckedChildren="dictionary.enabledStatus.get(0)" v-decorator="['isEnabled', { valuePropName: 'checked' }]" />
        </a-form-item>
      </template>
      <!-- 方案 -->
      <template v-else-if="'plan' == params.type">
        <a-form-item label="所属类型" :label-col="{ span: 5 }" :wrapper-col="{ span: 12 }" >
          <a-select :disabled="isEditPanel" placeholder="请选择" v-decorator="[ 'parentId', {  rules: [{ required: true, message: '请选择所属类型' }] }]">
            <a-select-option v-for="(d, i) in params.dataSourceTree" :value="`${d.id}`" :key="i">{{d.name}}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="方案名称" :label-col="{ span: 5 }" :wrapper-col="{ span: 12 }" >
          <a-input placeholder="请输入" v-decorator="[ 'playName', {  rules: [{ required: true, message: '请输入方案名称' }] }]"/>
        </a-form-item>
        <a-form-item label="排序" :label-col="{ span: 5 }" :wrapper-col="{ span: 12 }" >
          <a-input-number placeholder="请输入" style="width: 235px"  v-decorator="[ 'sortOrder', {  rules: [{ required: true, message: '请输入排序' }] }]"/>
        </a-form-item>
        <a-form-item label="是否启用" :label-col="{ span: 5 }" :wrapper-col="{ span: 12 }" >
          <a-switch :checkedChildren="dictionary.enabledStatus.get(1)" :unCheckedChildren="dictionary.enabledStatus.get(0)" v-decorator="['isEnabled', { valuePropName: 'checked' }]" />
        </a-form-item>
      </template>
      <!-- 玩法 -->
      <template v-else-if="'play' == params.type">
        <div class="layout1">
          <a-form-item label="所属类型" :label-col="{ span: 8 }" :wrapper-col="{ span: 14 }" >
            <a-select :disabled="isEditPanel" placeholder="请选择" v-decorator="[ 'typeId', {  rules: [{ required: true, message: '请选择所属类型' }] }]">
              <a-select-option v-for="(d, i) in params.dataSourceTree" :value="`${d.id}`" :key="i">{{d.name}}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="所属方案" :label-col="{ span: 8 }" :wrapper-col="{ span: 14 }" >
            <a-select :disabled="isEditPanel" placeholder="请选择" v-decorator="[ 'parentId', { rules: [{ required: true, message: '请选择所属方案' }] }]">
              <a-select-option v-for="(d, i) in plans" :value="`${d.id}`" :key="i">{{d.name}}</a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="玩法名称" :label-col="{ span: 8 }" :wrapper-col="{ span: 14 }" >
            <a-input placeholder="请输入" v-decorator="[ 'playName', {  rules: [{ required: true, message: '请选择玩法名称' }] }]"/>
          </a-form-item>
          <a-form-item label="玩法缩写" :label-col="{ span: 8 }" :wrapper-col="{ span: 14 }" >
            <a-input placeholder="请输入" v-decorator="[ 'fullName', {  rules: [{ required: true, message: '请选择玩法缩写' }] }]"/>
          </a-form-item>
          <a-form-item label="排序" :label-col="{ span: 8 }" :wrapper-col="{ span: 14 }" >
            <a-input-number placeholder="请输入" style="width: 190px" v-decorator="[ 'sortOrder', {  rules: [{ required: true, message: '请输入排序' }] }]"/>
          </a-form-item>
          <a-form-item label="是否启用" :label-col="{ span: 8 }" :wrapper-col="{ span: 14 }" >
          <a-switch :checkedChildren="dictionary.enabledStatus.get(1)" :unCheckedChildren="dictionary.enabledStatus.get(0)" v-decorator="['isEnabled', { valuePropName: 'checked' }]" />
        </a-form-item>
        </div>
        <div style="margin: 0 34px 0 6px;">
          <a-form-item label="玩法简介" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }" >
            <a-input placeholder="请输入" v-decorator="[ 'summary', {  rules: [{ required: true, message: '请输入玩法简介' }] }]"/>
          </a-form-item>
          <a-form-item label="玩法说明" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }" >
            <a-textarea :rows="4" placeholder="请输入" v-decorator="[ 'description', {  rules: [{ required: true, message: '请输入玩法说明' }] }]"/>
          </a-form-item>
          <a-form-item label="投注示例" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }" >
            <a-textarea :rows="4" placeholder="请输入" v-decorator="[ 'betExample', {  rules: [{ required: true, message: '请输入投注示例' }] }]"/>
          </a-form-item>
          <a-form-item label="示例号码" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }" >
            <a-textarea :rows="4" placeholder="请输入" v-decorator="[ 'exampleDescription', {  rules: [{ required: true, message: '请输入示例号码' }] }]"/>
          </a-form-item>
        </div>
      </template>
    </a-form>
  </a-modal>
</template>
<script>
import Vue from 'vue'
import { Component, InjectComponents, Prop, Watch, Lifecycle, Computed, Filter, State, Action, Getter, Mutation, InjectComponent } from 'vue-decorators';

/** 数据字典 */
const dictionary = 'plateType,enabledStatus';
/** 表单验证，可以不设置值，如果设置就是初始化要配置隐藏值，默认vform变量 */
const formOptions = 'id,categoryId,parentId'; 
// const formOptions = {
//   vform: '隐藏字段，使用vform.hiddens可以绑定dom值',
//   vform1: '隐藏字段，使用vform.hiddens可以绑定dom值'
// }

@Component({ dictionary, formOptions })
export default class LotteryCategroyPlayForm extends Vue {

  visible = true;
  loading = false;
  vformdata = {};

  /** 是否编辑窗口 */
  @Computed() isEditPanel() {
    return Boolean(this.params.data.id);
  }

  @Computed() title() {
    let type = '';
    if ('type' == this.params.type) type = '类型';
    else if ('plan' == this.params.type) type = '方案';
    else if ('play' == this.params.type) type = '玩法';
    return (this.params.data.id ? `修改` : `添加`) + type;
  }

  @Computed() width() {
    if ('play' == this.params.type) return 700;
    return 520;
  }

  @Computed() plans() {
    const type = this.params.dataSourceTree.find(d => d.id == this.vformdata.typeId) || {};
    return type.children || []
  }

  /** 提交 */
  async submit() {
    const form = await this.vform.validate();
    if (form.errors) return;
    
    this.loading = true;
    const apiName = this.params.data.id ? '/config-admin-api/play/editPlay' : '/config-admin-api/play/addPlay';
    const res = await this.$service.fetch(apiName, form.vals);
    this.loading = false;
    if (1 != res.code) return res.message && this.$message.error(res.message);
    this.visible = false;
    this.$message.success(res.message);
    this.$emit('close', true);
  }

  @Lifecycle created() {
    
    if (this.params.data) {
      const data = this.params.data;
      data.isEnabled = typeof data.isEnabled == 'undefined' ? true : Boolean(data.isEnabled);
    }

    // 设定初始值
    this.vform.setValues(this.params.data, true);
    // 数据映射
    this.vform.vbind('vformdata');

    // 修改/添加玩法
    if ('play' == this.params.type && this.params.data.parentId) {
      const planId = this.params.data.parentId;
      const plan = this.params.dataSource[planId];
      const type = this.params.dataSource[plan.parentId];
      this.vform.setValue('typeId', type.id, true);
    }

    this.$watch('vformdata.typeId', (typeId) => {
      this.vform.setValue('parentId', '');
    });
  }
}
</script>

