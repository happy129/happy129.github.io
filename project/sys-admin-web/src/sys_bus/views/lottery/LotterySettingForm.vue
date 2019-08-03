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
    > div { width: 49.9%;  display: inline-block; }
    /deep/ .ant-form-item .ant-switch { min-width: 60px; }
  }

  // .myform /deep/ .ant-form-item-label { min-width: 140px; }
}
</style>

<template>
  <a-modal class="mymodal" v-model="visible" :maskClosable="false" 
    :title="title" @ok="submit()" @cancel="$emit('close')"
    :confirmLoading="loading" :width="500">
    <a-form  class="myform" :form="vform" style="margin: 0 20px;">
      <template v-for="(d, i) in vform.hiddens" >
        <a-form-item v-if="typeof vform.data[d] != 'undefined'" v-show="false" :key="i" :label="d">
          <input type="hidden" v-decorator="[d]"/>{{`${vform.data[d]}`.trim().length}}
        </a-form-item>
      </template>
      <a-form-item label="彩种名称" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }" >
        <a-input placeholder="请输入" :value="vform.data.lotteryName" :readonOnly="true"/>
      </a-form-item>
      <a-form-item class="no-valid" label="图标" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }" >
        <a-upload name="avatar" listType="picture-card" class="avatar-uploader" :showUploadList="false" 
          action="#" :beforeUpload="beforeUpload">
          <img :src="vform.data.logoUrl || defaultLogoUrl"/>
        </a-upload>
        <span class="">图标规格为130*130，格式为png</span>
        <a-input-group compact>
          <a-input v-show="!fileList.length" placeholder="请选择" style="width: 69.8%; margin-right: 5px;" readOnly v-decorator="[ 'logoUrl', {  rules: [{ required: true, message: '请选择上传图片' }] }]"/>
          <a-input v-if="fileList.length" :placeholder="fileList[0].name || '已选择'" style="width: 70%; margin-right: 5px;" readOnly/>
          <a-button ref="btnUpload" type="primary" @click="vform.setValue('logoUrl', vform.data.defLogoUrl)">恢复默认</a-button>
        </a-input-group>
      </a-form-item>
      <a-form-item label="默认玩法" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }" >
        <a-select placeholder="请选择" v-decorator="[ 'defaultPlayId', {  rules: [{ required: true, message: '请选择彩种分类' }] }]">
          <a-select-option v-for="(d, i) in dsstore.lotteryCategoryPlays" :value="`${d.id}`" :key="i">{{d.typeName}}/{{d.planName}}/{{d.playName}}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="简短说明" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }" >
        <a-input placeholder="请输入" v-decorator="[ 'remark', {  rules: [{ required: false, message: '请输入简短说明' }] }]"/>
      </a-form-item>
      <a-form-item label="排序" :label-col="{ span: 5 }" :wrapper-col="{ span: 19 }" >
        <a-input-number placeholder="请输入" style="width: 180px;" v-decorator="[ 'sortOrder', {  rules: [{ required: false, message: '请输入排序' }] }]"/>
      </a-form-item>
      <div class="layout1">
        <a-form-item class="no-valid"  label="开盘/封盘" :label-col="{ span: 10 }" :wrapper-col="{ span: 12 }" >
          <a-switch :checkedChildren="dictionary.openingStatus.get(1)" :unCheckedChildren="dictionary.openingStatus.get(0)" v-decorator="['isBetEnabled', { valuePropName: 'checked' }]" />
        </a-form-item>
        <a-form-item class="no-valid"  label="显示/隐藏" :label-col="{ span: 12 }" :wrapper-col="{ span: 12 }" >
          <a-switch :checkedChildren="dictionary.showStatus.get(1)" :unCheckedChildren="dictionary.showStatus.get(0)" v-decorator="['isEnabled', { valuePropName: 'checked' }]" />
        </a-form-item>
        <a-form-item class="no-valid"  label="热门开关" :label-col="{ span: 10 }" :wrapper-col="{ span: 12 }" >
          <a-switch :checkedChildren="dictionary.booleanType.get(1)" :unCheckedChildren="dictionary.booleanType.get(0)" v-decorator="['isHot', { valuePropName: 'checked' }]" />
        </a-form-item>
        <a-form-item class="no-valid"  label="追号" :label-col="{ span: 12 }" :wrapper-col="{ span: 12 }" >
          <a-switch :checkedChildren="dictionary.booleanType.get(1)" :unCheckedChildren="dictionary.booleanType.get(0)" v-decorator="['isChaseEnabled', { valuePropName: 'checked' }]" />
        </a-form-item>
        <!-- <a-form-item class="no-valid"  label="给予返水" :label-col="{ span: 10 }" :wrapper-col="{ span: 12 }" >
          <a-switch :checkedChildren="dictionary.booleanType.get(1)" :unCheckedChildren="dictionary.booleanType.get(0)" v-decorator="['rebateEnabled', { valuePropName: 'checked' }]" />
        </a-form-item>
        <a-form-item class="no-valid"  label="计算有效投注" :label-col="{ span: 12 }" :wrapper-col="{ span: 12 }" >
          <a-switch :checkedChildren="dictionary.booleanType.get(1)" :unCheckedChildren="dictionary.booleanType.get(0)" v-decorator="['validBetEnabled', { valuePropName: 'checked' }]" />
        </a-form-item> -->
      </div>
    </a-form>
  </a-modal>
</template>
<script>
import Vue from 'vue'
import { Component, InjectComponents, Prop, Watch, Lifecycle, Computed, Filter, State, Action, Getter, Mutation, InjectComponent } from 'vue-decorators';

/** 数据字典 */
const dictionary = 'booleanType,showStatus,openingStatus'
/** 表单验证，可以不设置值，如果设置就是初始化要配置隐藏值，默认vform变量 */
const formOptions = 'id,lotteryId'; // const formOptions = {
//   vform: '隐藏字段，使用vform.hiddens可以绑定dom值',
//   vform1: '隐藏字段，使用vform.hiddens可以绑定dom值'
// }

/** 异步请求库字典 */
const dsstore = {
  lotteryCategoryPlays: { url: '/config-admin-api/play/queryAllThirdLevelPlayByCategoryId', params: { id: '' }, autoload: true }
};

@Component({ dictionary, formOptions, dsstore })
export default class LotteryCategoryForm extends Vue {

  visible = true;
  loading = false;

  fileList = [];

  defaultLogoUrl = require('./images/upload.png');

  @Computed() title() {
    return this.vform.data.id ? `修改彩种设置` : `添加彩种设置`;
  }

  beforeUpload(file) {
    this.fileList = [file];
    this.$nextTick(() => this.toUpload());
    return false;
  }

  async toUpload() {
    const formdata = new FormData();
    formdata.append('imageFile', this.fileList[0]);
    formdata.append('uploadTypeName', 'lottery');
    this.loading = this.$refs.btnUpload.sloading = true;
    const res = await this.$service.fetch('/common-api/upload/uploadAdminImage', formdata);
    this.loading = this.$refs.btnUpload.sloading = false;
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
    const apiName = this.vform.data.id ? '/config-admin-api/platformLottery/batchEditLottery' : '/config-admin-api/platformLottery/add';
    const platformLotteryList = [form.vals];

    const res = await this.$service.fetch(apiName, {list: platformLotteryList });
    this.loading = false;
    if (1 != res.code) return res.message && this.$message.error(res.message);
    this.$message.success(res.message);
    this.$emit('close', true);
  }

  @Lifecycle() created() {
    
    //设定初始值
    const data = this.params.data || {};
    // data.collectingSourceIds = (data.collectingSourceIds ? `${data.collectingSourceIds}`.split(',') : []).filter(d => d.trim().length > 0);
    data.isEnabled = typeof data.isEnabled == 'undefined' ? true : Boolean(data.isEnabled);
    data.isBetEnabled = typeof data.isBetEnabled == 'undefined' ? true : Boolean(data.isBetEnabled);
    data.isHot = typeof data.isHot == 'undefined' ? true : Boolean(data.isHot);
    data.isChaseEnabled = typeof data.isChaseEnabled == 'undefined' ? true : Boolean(data.isChaseEnabled);
    this.vform.setValues(data, true);
    // 抓取玩法
    this.dsstore.lotteryCategoryPlays.fetch({ id: data.categoryId });
    
  }
}
</script>

