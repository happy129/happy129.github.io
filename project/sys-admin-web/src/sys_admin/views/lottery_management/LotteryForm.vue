	<style lang="scss" scoped>
.mymodal {
  .avatar-uploader {
    display: inline-block;
    &+span { position: relative; top: -24px; }
  }
  .avatar-uploader img {
    width: 20px!important; height: 20px!important;
  }
  .avatar-uploader /deep/ .ant-upload-select-picture-card{
    width: 40px!important; height: 40px!important;
  }
  .no-valid /deep/ {
    .ant-form-item-label, .ant-form-item-control { line-height: 21px!important; }
  }
  .layout1 {
    > div { width: 49.5%;  display: inline-block; }
  }

  // .myform /deep/ .ant-form-item-label { min-width: 140px; }
}
</style>

<template>
  <a-modal class="mymodal" v-model="visible" :maskClosable="false" 
    :title="title" @ok="submit()" @cancel="$emit('close')"
    :confirmLoading="loading" :width="700">
    <a-form  class="myform" :form="vform" style="margin: 0 20px;">
      <template v-for="(d, i) in vform.hiddens" >
        <a-form-item v-if="typeof vform.data[d] != 'undefined'" v-show="false" :key="i" :label="d">
          <input type="hidden" v-decorator="[d]"/>{{`${vform.data[d]}`.trim().length}}
        </a-form-item>
      </template>
      <a-form-item class="no-valid" label="图标" :label-col="{ span: 4 }" :wrapper-col="{ span: 19 }" >
        <a-upload name="avatar" listType="picture-card" class="avatar-uploader" :showUploadList="false" @change="toUpload"
          action="#" :beforeUpload="beforeUpload">
          <img :src="vform.data.logoUrl || defaultLogoUrl"/>
        </a-upload>
        <span class="">图标规格为130*130，格式为png</span>
        <a-input-group compact>
          <a-input v-show="!fileList.length" placeholder="请选择" readOnly v-decorator="[ 'logoUrl', {  rules: [{ required: false, message: '请选择上传图片' }] }]"/>
          <a-input v-if="fileList.length" :placeholder="fileList[0].name || '已选择'"  readOnly/>
          <!-- <a-input v-show="!fileList.length" placeholder="请选择" style="width: 85%; margin-right: 5px;" readOnly v-decorator="[ 'logoUrl', {  rules: [{ required: false, message: '请选择上传图片' }] }]"/> -->
          <!-- <a-input v-if="fileList.length" :placeholder="fileList[0].name || '已选择'" style="width: 85%; margin-right: 5px;" readOnly/> -->
          <!-- <a-button ref="btnUpload" type="primary" :disabled="fileList.length == 0" @click="toUpload()">上传</a-button> -->
        </a-input-group>
      </a-form-item>
      <!-- <a-form-item label="彩种名称" :label-col="{ span: 4 }" :wrapper-col="{ span: 19 }" >
        <a-input placeholder="请输入" v-decorator="[ 'lotteryName', {  rules: [{ required: true, message: '请选择彩种名称' }] }]"/>
      </a-form-item> -->
      <div class="layout1">
        <a-form-item label="彩种名称" :label-col="{ span: 8 }" :wrapper-col="{ span: 14 }">
          <a-input placeholder="请输入" v-decorator="[ 'lotteryName', {  rules: [{ required: true, message: '请输入彩种名称' }] }]"/>
        </a-form-item>

        <a-form-item label="排序" :label-col="{ span: 8 }" :wrapper-col="{ span: 14 }" >
          <a-input-number placeholder="请输入" style="width: 180px;" v-decorator="[ 'sortOrder', {  rules: [{ required: false, message: '请输入排序' }] }]"/>
        </a-form-item>

        <a-form-item label="彩种分类" :label-col="{ span: 8 }" :wrapper-col="{ span: 14 }" >
          <a-select :disabled="isEditPanel" placeholder="请选择" v-decorator="[ 'categoryId', {  rules: [{ required: true, message: '请选择彩种分类' }] }]">
            <a-select-option v-for="(d, i) in params.categorys" :value="`${d.id}`" :key="i">{{d.name}}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="衍生彩种" :label-col="{ span: 8 }" :wrapper-col="{ span: 14 }" >
          <a-select placeholder="请选择" v-decorator="[ 'parentId', {  rules: [{ required: true, message: '请选择衍生彩种' }] }]">
            <a-select-option :value="`0`">无</a-select-option>
            <template v-for="(d, i) in params.lotterys">
              <a-select-option v-if="d.id != vform.data.id" :value="`${d.id}`" :key="i">{{d.name}}</a-select-option>
            </template>
          </a-select>
        </a-form-item>
        <a-form-item label="时间盘口类型" :label-col="{ span: 8 }" :wrapper-col="{ span: 14 }" >
          <a-select placeholder="请选择" v-decorator="[ 'lotteryCycleId', {  rules: [{ required: true, message: '请选择时间盘口类型' }] }]">
            <a-select-option v-for="(d, i) in params.cycles" :value="`${d.id}`" :key="i">{{d.name}}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="彩种类型" :label-col="{ span: 8 }" :wrapper-col="{ span: 14 }" >
          <a-select placeholder="请选择" v-decorator="[ 'lotteryType', {  rules: [{ required: true, message: '请选择彩种类型' }] }]">
            <a-select-option v-for="(d, i) in dictionary.lotteryType" :value="`${d.value}`" :key="i">{{d.name}}</a-select-option>
          </a-select>
        </a-form-item>
      </div>
      <a-form-item label="号码详情地址" :label-col="{ span: 4 }" :wrapper-col="{ span: 19 }" >
        <a-input placeholder="请输入" v-decorator="[ 'numberDetailUrl', {  rules: [{ message: '请输入号码详情地址' }] }]"/>
      </a-form-item>
      <a-form-item label="开奖来源" :label-col="{ span: 4 }" :wrapper-col="{ span: 19 }" >
        <a-select mode="multiple" placeholder="请选择" v-decorator="[ 'collectingSourceIds', {  rules: [{ required: true, message: '请选择开奖来源' }] }]">
          <a-select-option v-for="(d, i) in params.collectingSources" :value="`${d.id}`" :key="i">{{d.name}}</a-select-option>
        </a-select>
      </a-form-item>
      <div class="layout1">

        <a-form-item label="封盘/开盘" :label-col="{ span: 8 }" :wrapper-col="{ span: 14 }" >
          <a-switch :checkedChildren="dictionary.openingStatus.get(1)" :unCheckedChildren="dictionary.openingStatus.get(0)" v-decorator="['isBetEnabled', { valuePropName: 'checked' }]" />
        </a-form-item>

        <a-form-item label="显示/隐藏" :label-col="{ span: 8 }" :wrapper-col="{ span: 14 }" >
          <a-switch :checkedChildren="dictionary.showStatus.get(1)" :unCheckedChildren="dictionary.showStatus.get(0)" v-decorator="['isEnabled', { valuePropName: 'checked' }]" />
        </a-form-item>

      </div>
    </a-form>
  </a-modal>
</template>
<script>
import Vue from 'vue'
import { Component, InjectComponents, Prop, Watch, Lifecycle, Computed, Filter, State, Action, Getter, Mutation, InjectComponent } from 'vue-decorators';

/** 数据字典 */
const dictionary = 'lotteryType,showStatus,openingStatus'
/** 表单验证，可以不设置值，如果设置就是初始化要配置隐藏值，默认vform变量 */
const formOptions = 'id'; // const formOptions = {
//   vform: '隐藏字段，使用vform.hiddens可以绑定dom值',
//   vform1: '隐藏字段，使用vform.hiddens可以绑定dom值'
// }

@Component({ dictionary, formOptions })
export default class LotteryCategoryForm extends Vue {

  visible = true;
  loading = false;

  fileList = [];

  defaultLogoUrl = require('./images/upload.png');

  /** 是否编辑窗口 */
  @Computed() isEditPanel() {
    return Boolean(this.params.data.id);
  }

  @Computed() title() {
    return this.vform.data.id ? `修改彩种` : `添加彩种`;
  }

  beforeUpload(file) {
    this.fileList = [...this.fileList, file];
    // this.$nextTick(() => this.toUpload());
    return false;
  }

  async toUpload() {
    const formdata = new FormData();
    formdata.append('imageFile', this.fileList[0]);
    formdata.append("token", this.token);
    formdata.append('uploadTypeName', 'lottery');
    // this.loading = this.$refs.btnUpload.sloading = true;
    const res = await this.$service.fetch('/common-api/upload/uploadAdminImage', formdata);
    // this.loading = this.$refs.btnUpload.sloading = false;
    if (1 != res.code) return res.message && this.$message.error(res.message);
    this.$message.success(res.message);
    this.fileList = [];
    this.vform.setValue('logoUrl', res.data.imageUrl);
  }

  /** 提交 */
  async submit() {
    const form = await this.vform.validate();
    
    if (form.errors) return;
    this.loading = true;
    const apiName = this.vform.data.id ? '/config-admin-api/lottery/editLottery' : '/config-admin-api/lottery/addLottery';
    const res = await this.$service.fetch(apiName, form.vals);

    this.loading = false;
    if (1 != res.code) return res.message && this.$message.error(res.message);
    this.$message.success(res.message);
    this.$emit('close', true);
  }

  @Lifecycle() created() {
    
    //设定初始值
    const data = this.params.data || {};
    data.collectingSourceIds = (data.collectingSourceIds ? `${data.collectingSourceIds}`.split(',') : []).filter(d => d.trim().length > 0);
    data.isEnabled = typeof data.isEnabled == 'undefined' ? true : Boolean(data.isEnabled);
    data.isBetEnabled = typeof data.isBetEnabled == 'undefined' ? true : Boolean(data.isBetEnabled);
    this.vform.setValues(data, true);
    
  }
}
</script>

