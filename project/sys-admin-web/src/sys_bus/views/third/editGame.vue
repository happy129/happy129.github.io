<template>
  <div class="back-layer">
    <div class="dialog-box" @click.stop>
      <div class="title">
        <span>游戏管理编辑</span>
        <span class="close-tag" @click="close">X</span>
      </div>

<div style="text-align:left;padding:20px;">
      <a-form layout="inline" :form="form">
        <a-form-item label="游戏名称">
          <a-input disabled :value="detail.thirdGameName"></a-input>
        </a-form-item>
        <br>
        <a-form-item label="图标">
          <img :src="detail.thirdGameLogoUrl" alt="..." class="icon-box" v-if="getDefaultIcon">
          <img :src="thirdGameLogoUrl" alt="..." class="icon-box" v-if="!getDefaultIcon">
          <span class="button-span" @click="resetDefaultImg">恢复默认</span>
          <span>图标规格为130*130，格式为png</span>
        </a-form-item>
        <br>
        <a-form-item>
          <a-upload :beforeUpload="beforeUpload" :showUploadList="false" style="text-align:center;" @change="toUpload">重新上传</a-upload>
          <a-input class="upload-input" :value="thirdGameLogoUrl"></a-input>
        </a-form-item>
        <br>
        <a-form-item label="排序值">
          <a-input v-decorator="['sortOrder', {initialValue:detail.sortOrder, rules: [{required:false}]}]"  :defaultChecked="detail.sortOrder"></a-input>
        </a-form-item>
        <br>
        <a-form-item label="热门开关">
          <a-switch @change="onChangeHot" :defaultChecked="detail.isHot===1"/>
        </a-form-item>
        <br>
        <a-form-item label="关闭/开启" >
          <a-switch @change="onChangeCloseOpen" :defaultChecked="detail.isEnabled===1"/>
        </a-form-item>
        <a-form-item label="隐藏/显示">
          <a-switch @change="onChangeShow" :defaultChecked="detail.isShow===1"/>
        </a-form-item>
      </a-form>
      </div>
          <a-button type="primary" @click="submit">提交</a-button>
    </div>
  </div>
</template>
<script>
import Vue from "vue";
import { Component, Lifecycle, InjectComponents, Prop } from "vue-decorators";
import * as Api from "@api/admin";

@Component
export default class editGame extends Vue {
  getDefaultIcon = true;
  thirdGameLogoUrl = "";
  isHot = 0;
  isEnabled = 0;
	isShow = 0;
	loading=false;
  @Prop() detail;
  close() {
    this.$emit("close");
  }
  onChangeHot(v) {
    this.isHot = v ? 1 : 0;
  }
  onChangeCloseOpen(v) {
    this.isEnabled = v ? 1 : 0;
  }
  onChangeShow(v) {
    this.isShow = v ? 1 : 0;
  }

  async submit() {
    let p = {
      id: this.detail.id,
      isEnabled: this.isEnabled,
      isHot: this.isHot,
      isShow: this.isShow,
      thirdGameLogoUrl: this.thirdGameLogoUrl
    };
    await this.form.validateFields(async (err, values) => {
      if (err) return;
      let res = await Api.editMerchant({ ...p, ...values });
      if (1 !== res.data?.body?.code) return;
      this.$message.success(res?.data?.body?.message);
      this.$emit("close");
      this.$emit('ok')
    });
  }

  @Lifecycle() created() {
    this.form = this.$form.createForm(this);
    this.thirdGameLogoUrl = this.detail.thirdGameLogoUrl;
    this.isHot = this.detail.isHot;
    this.isShow = this.detail.isShow;
    this.isEnabled = this.detail.isEnabled;
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
		const res = await this.$service.fetch( "/common-api/upload/uploadAdminImage", formdata );
    if (!res.code) return res.message && this.$message.error(res.message);
    this.$message.success(res.message);
    this.fileList = [];
    this.thirdGameLogoUrl = res.data.imageUrl;
 }
  async resetDefaultImg() {
 let res = await Api.getDefaultIcon({ id: this.detail.id });
    if (1 !== res.data?.body?.code) return res.data.body.message && this.$message.error(res.data.body.message);
    this.$message.success(res.data.body.message)
    this.thirdGameLogoUrl = res.data?.body?.data?.thirdGameLogoUrl;
    this.getDefaultIcon = true;
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
    margin-left: 12px;
  }
  .ant-form-item-label {
    width: 100px;
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
