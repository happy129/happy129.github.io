<template>
  <div class="back-layer">
    <div class="dialog-box" @click.stop>
      <div class="title">
        <span>游戏管理编辑</span>
        <span class="close-tag" @click="close">X</span>
      </div>
		<div style="text-align:left;padding:20px;">
      <a-form layout="inline" :form="form">
        <a-form-item label="选择分类">
					<!--  :defaultValue="detail.thirdGameTypeId" -->
          <a-select disabled v-decorator="['thirdGameTypeId', { initialValue: detail.thirdGameTypeId}]" style="width: 225px" @change="handleChangeThirdType">
            <a-select-option :value="''">全部</a-select-option>
            <a-select-option :value="v.id" v-for="(v, i) of thirdGameType" :key="i">{{v.thirdGameTypeName}}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="图标">
          <img :src="detail.thirdGameLogoUrl" alt="..." class="icon-box" v-if="getDefaultIcon">
          <img :src="thirdGameLogoUrl" alt="..." class="icon-box" v-if="!getDefaultIcon">
          <!-- <span class="button-span" @click="resetDefaultImg">恢复默认</span> -->
          <span>&nbsp;图标规格为130*130，格式为png</span>
        </a-form-item>
        <br>
        <a-form-item label="游戏名称">
          <a-input v-decorator="['thirdGameName', {initialValue:detail.thirdGameName, rules: [{required:false}]}]"></a-input>
        </a-form-item>
        <a-form-item>
          <a-upload :beforeUpload="beforeUpload" :showUploadList="false" style="text-align:center;margin-left:22px;" @change="toUpload">重新上传</a-upload>
          <a-input class="upload-input" :value="thirdGameLogoUrl"></a-input>
        </a-form-item>
        <br>
        <a-form-item label="游戏标识">
          <a-input disabled :value="detail.thirdGameCode"></a-input>
        </a-form-item>
        <a-form-item label="总额度">
          <a-input-number v-decorator="['totalQuota', {initialValue:detail.totalQuota, rules: [{required:true,message:'请输入总额度'}]}]"></a-input-number>
        </a-form-item>
        <br>
        <a-form-item label="状态">
					<!-- :defaultValue="detail.isEnabled" -->
          <a-select style="width: 225px" @change="handleChange" v-decorator="['isEnabled', { initialValue:detail.isEnabled}]" >
            <a-select-option :value="1">启用</a-select-option>
            <a-select-option :value="0">停用</a-select-option>
          </a-select>
        </a-form-item>
        <!-- <a-form-item label="消耗额度">
          <a-input-number v-decorator="['consumedQuota', {initialValue:detail.consumedQuota, rules: [{required:true,message:'请输入消耗额度'}]}]"></a-input-number>
        </a-form-item> -->
        <br>
        <a-form-item label="备注">
					<!-- :defaultValue="detail.remark" -->
          <a-input v-decorator="['remark', {initialValue:detail.remark, rules: [{required:false,message:'请输入备注'}]}]"></a-input>
        </a-form-item>
        <!-- <br>
        <a-form-item label="彩种">
          <a-input disabled :value="detail.thirdGameName"></a-input>
        </a-form-item>
        <br>
        <a-form-item label="排序值">
          <a-input></a-input>
        </a-form-item>
        <br>
        <a-form-item label="热门开关" class="left-item">
          <a-switch @change="onChangeHot"/>
        </a-form-item>
        <br>
        <a-form-item label="关闭/开启" class="left-item-2">
          <a-switch @change="onChangeCloseOpen"/>
        </a-form-item>
        <a-form-item label="隐藏/显示">
          <a-switch @change="onChangeShow"/>
        </a-form-item>-->
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
export default class editAdmin extends Vue {
  isEnabled = "";

  thirdGameTypeId = "";

  handleChange(v) {
    this.isEnabled = v;
  }

  handleChangeThirdType(v) {
    this.thirdGameTypeId = v;
  }

  getDefaultIcon = true;
  thirdGameLogoUrl = "";
  @Prop() detail;
  @Prop() thirdGameType;
  close() {
    this.$emit("close");
  }
  onChangeHot() {}
  onChangeCloseOpen() {}
  onChangeShow() {}

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
    const res = await this.$service.fetch( "/common-api/upload/uploadAdminImage", formdata );
    if (!res.code) return res.message && this.$message.error(res.message);
    this.$message.success(res.message);
    this.fileList = [];
    this.thirdGameLogoUrl = res.data.imageUrl;
  }

  async resetDefaultImg() {
		let p = { thirdGameName: this.detail.thirdGameName };
		let res = await Api.getDefaultIcon(p);
		if (1 !== res.data?.body?.code) return;
    this.thirdGameLogoUrl = res.data?.body?.data?.thirdGameLogoUrl;
    this.getDefaultIcon = true;
  }

  async submit() {
    let p = {
      thirdGameTypeId: this.thirdGameTypeId,
      id: this.detail.id,
      isEnabled: this.isEnabled,
      thirdGameLogoUrl: this.thirdGameLogoUrl,
      thirdGameCode: this.detail.thirdGameCode
    };
    await this.form.validateFields(async (err, values) => {
			if (err) return;
			// let res = await Api.editThirdPlatformConfig({ ...p, ...values });
			const res = await this.$service.fetch( "/config-admin-api/thirdGame/editThirdGame",{ ...p, ...values });
      if (!res.code) return res.message && this.$message.error(res.message);
      this.$message.success(res.message);
      this.$emit("close");
      this.$emit("ok");
    });
  }

  @Lifecycle() created() {
		this.form = this.$form.createForm(this);
    this.thirdGameTypeId = this.detail.thirdGameTypeId;
    this.thirdGameLogoUrl = this.detail.thirdGameLogoUrl;
    this.isEnabled = this.detail.isEnabled;
  }
}
</script>
<style lang="scss" scoped>
@import "@views/admin/Pop.scss";
.back-layer /deep/ {
  .title {
    margin-bottom: 20px;
  }
  .ant-input, .ant-input-number {
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
  .upload-input {
    width: 233px;
    height: 38px;
    margin-left: 10px;
  }
  .ant-form-item-label {
    width: 120px;
  }
  .ant-form-item, .ant-form-item-with-help {
    margin-top: 10px !important;
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
}
</style>
