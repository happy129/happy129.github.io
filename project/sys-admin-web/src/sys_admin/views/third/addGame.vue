<template>
  <div class="back-layer">
    <div class="dialog-box" @click.stop>
      <div class="title">
        <span>添加游戏</span>
        <span class="close-tag" @click="close">X</span>
      </div>
      <div style="text-align:left;">
			<a-form layout="inline" :form="form">
        <a-form-item label="选择分类">
          <a-select style="width: 225px" @change="handleChangeThirdType">
            <a-select-option :value="v.id" v-for="(v, i) of thirdGameType" :key="i">{{v.thirdGameTypeName}}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="图标">
          <img :src="thirdGameLogoUrl" alt="..." class="icon-box">
          <span>图标规格为130*130，格式为png</span>
        </a-form-item>
        <br>
        <a-form-item label="游戏名称">
          <a-input v-decorator="['thirdGameName', {rules: [{required:true, message: '请输入游戏名称'}]}]" ></a-input>
        </a-form-item>
        <a-form-item>
          <a-upload :beforeUpload="beforeUpload" :showUploadList="false" style="text-align:center;margin-left:6px;margin-right:6px;" @change="toUpload">重新上传</a-upload>
          <a-input :value="thirdGameLogoUrl"></a-input>
        </a-form-item>
        <br>
        <a-form-item label="游戏标识">
          <a-input v-decorator="['thirdGameCode', {rules: [{required:false}]}]"></a-input>
        </a-form-item>
        <a-form-item label="总额度">
          <a-input-number v-decorator="['totalQuota', {rules: [{validator: (rule, value, callback) => {if (!/^\d+$/g.test(value)) return callback('总额度输入不正确');callback()}}]}]"></a-input-number>
        </a-form-item>
        <br>
        <a-form-item label="状态">
          <a-select style="width: 225px" @change="handleChange">
            <a-select-option value="1">启用</a-select-option>
            <a-select-option value="0">停用</a-select-option>
          </a-select>
        </a-form-item>
        <!-- <a-form-item label="消耗额度">
          <a-input-number v-decorator="['consumedQuota', {rules: [{validator: (rule, value, callback) => {if (!/^\d+$/g.test(value)) return callback('消耗额度输入不正确');callback()}}]}]"></a-input-number>
        </a-form-item> -->
        <br>
        <a-form-item label="备注">
          <a-input v-decorator="['remark', {rules: [{required:false}]}]"></a-input>
        </a-form-item>
      </a-form>
      </div>
          <a-button type="primary" @click="submit">保存</a-button>
    </div>
  </div>
</template>
<script>
import Vue from "vue";
import { Component, Lifecycle, InjectComponents, Prop } from "vue-decorators";
import * as Api from "@api/admin";
@Component
export default class addAdmin extends Vue {
  @Lifecycle() created() {
    this.form = this.$form.createForm(this);
  }

  isEnabled = "";

  thirdGameLogoUrl = "";

  @Prop() thirdGameType;

  close() {
    this.$emit("close");
  }
  onChangeHot() {}
  onChangeCloseOpen() {}
  onChangeShow() {}

  handleChange(v) {
    this.isEnabled = v;
  }

  thirdGameTypeId = "";

  handleChangeThirdType(v) {
    this.thirdGameTypeId = v;
  }

  fileList = [];

  beforeUpload(file) {
    this.fileList = [...this.fileList, file];
    this.getDefaultIcon = false;
    return false;
  }
	
  async toUpload() {
    const formdata = new FormData();
		formdata.append("imageFile", this.fileList[0]);
		formdata.append("uploadTypeName", "shortcutEntry");
    const res = await this.$service.fetch( "/common-api/upload/uploadAdminImage",formdata);
    if (1 != res.code) return res.message && this.$message.error(res.message);
    this.$message.success(res.message);
    this.fileList = [];
    this.thirdGameLogoUrl = res.data?.imageUrl;
  }

  async submit() {
    if (this.thirdGameTypeId === "") {this.$message.error('请选择游戏分类'); return;}
		let p = { 
			thirdGameTypeId: this.thirdGameTypeId, 
			isEnabled: this.isEnabled,
		 thirdGameLogoUrl: this.thirdGameLogoUrl };
    await this.form.validateFields(async (err, values) => {
			if (err) return;
			const res = await this.$service.fetch( "/config-admin-api/thirdGame/addThirdGame", { ...p, ...values} );
			// let res = await Api.addThirdPlatformConfig({ ...p, ...values });
      if (!res.code) return this.$message.error(res.message);
      this.$message.success(res.message);
      this.$emit("close");

      this.$emit("ok");
    });
  }
}
</script>
<style lang="scss" scoped>
@import "@views/admin/Pop.scss";
.back-layer /deep/ {
  .title {
    margin-bottom: 20px;
  }
  .dialog-box {
    width: 800px;
  }
  .ant-input {
    width: 225px;
  }
  .icon-box {
    display: inline-block;
    width: 40px;
    height: 40px;
    border: dashed 1px silver;
  }
  .button-span {
    color: #3399ff;
    display: inline-block;
    margin: auto 16px;
    cursor: pointer;
  }
  .ant-form-item-label {
    width: 100px;
  }
  .left-item {
    margin-right: 302px;
  }
  .left-item-2 {
    margin-left: -25px;
    margin-right: 156px;
  }
  .ant-form-item {
    margin-top: 10px;
  }
  .left-input {
    margin-right: 15px;
    margin-left: -106px;
  }
  .ant-upload {
    background-color: #009688;
    color: white;
    height: 30px;
    width: 88px;
    display: inline-block;
    line-height: 30px;
    cursor: pointer;
    border-radius: 2px;
  }
  .bb {
    .ant-form-item-label {
      margin-left: -8px;
      margin-right: 8px;
      width: 72px;
    }
  }
}
</style>
