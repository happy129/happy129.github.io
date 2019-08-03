<template>
  <div class="back-layer">
    <div class="dialog-box" @click.stop>
      <div class="title">
        <span>添加轮播图</span>
        <span class="close-tag" @click="close">X</span>
      </div>

      <div style="text-align:left;padding:20px;">
        <a-form :form="form" class="modelForm" layout="inline">
          <div class="mt15">
            <a-form-item label="名称">
              <a-input
                placeholder="输入名称"
                v-decorator="[ 'name', {rules: [{ required: true, message: '请输入名称' }]} ]"
              />
            </a-form-item>
          </div>
          <div>
            <a-form-item label="类型:">
              <a-radio-group v-decorator="['type', {initialValue:0}]" @change="changeType">
                <a-radio :value="0">活动</a-radio>
                <a-radio :value="1">公告</a-radio>
              </a-radio-group>
            </a-form-item>
          </div>
          <div>
            <a-form-item label="跳转地址:" class="jump-url-box">
              <!-- 活动 -->
              <a-select v-decorator="['targetId']" v-if="imgUrlType===0">
                <a-select-option :key="i" v-for="(v, i) of acList" :value="v.id">{{v.activityName}}</a-select-option>
              </a-select>

              <!-- 公告 -->
              <a-select v-decorator="['targetId']" v-if="imgUrlType===1">
                <a-select-option :key="i" v-for="(v, i) of anList" :value="v.id">{{v.title}}</a-select-option>
              </a-select>
            </a-form-item>
          </div>
          <div class="mt15">
            <a-form-item label="PC端图">
              <a-input placeholder="输入或者上传图片地址" v-model="pcImageUrl"/>
              <a-upload
                name="imageFile"
                :data="uploadData"
                :multiple="false"
                :showUploadList="false"
                action="/common-api/upload/uploadAdminImage"
                @change="uploadChange"
              >
                <a-button :disabled="loading" :loading="loading">
                  <a-icon type="upload"/>上传
                </a-button>
              </a-upload>
            </a-form-item>
          </div>
          <div class="mt15">
            <a-form-item label="H5端图">
              <a-input placeholder="输入或者上传图片地址" v-model="h5ImageUrl"/>
              <a-upload
                name="imageFile"
                :data="uploadData"
                :multiple="false"
                :showUploadList="false"
                action="/common-api/upload/uploadAdminImage"
                @change="uploadChangeH5"
              >
                <a-button  :disabled="loading1" :loading="loading1">
                  <a-icon type="upload"/>上传
                </a-button>
              </a-upload>
            </a-form-item>
          </div>
          <div class="mt15">
            <a-form-item label="APP端图">
              <a-input placeholder="输入或者上传图片地址" v-model="appImageUrl"/>
              <a-upload
                name="imageFile"
                :data="uploadData"
                :multiple="false"
                :showUploadList="false"
                action="/common-api/upload/uploadAdminImage"
                @change="uploadChangeApp"
              >
                <a-button  :disabled="loading2" :loading="loading2">
                  <a-icon type="upload"/>上传
                </a-button>
              </a-upload>
            </a-form-item>
          </div>
          <div class="mt15">
            <a-form-item label="排序">
              <a-input-number
                placeholder="输入排序值"
                v-decorator="[ 'sortOrder', {rules: [{ required: true }]} ]"
              />
            </a-form-item>
          </div>
          <div class="mt15">
            <a-form-item label="发布时间">
              <a-date-picker format="YYYY-MM-DD HH:mm:ss" @change="timeChange" showTime/>
            </a-form-item>
          </div>
        </a-form>
      </div>
      <a-button type="primary" @click="submit" style="margin-right:10px;">提交</a-button>
      <a-button type="primary" @click="reset">重置</a-button>
    </div>
  </div>
</template>
<script>
import Vue from "vue";
import { Component, Lifecycle, InjectComponents, Prop } from "vue-decorators";
import { getToken } from "@/util/auth";
import { activityList } from "@api/activity";
import * as Api from "@api/notice";
@Component
export default class AddLunB extends Vue {
  acList = [];
  anList = [];
  timeChange(m, s) {
    this.createTime = s;
  }
  createTime = "";
  loading = false;
  loading1 = false;
  loading2 = false;
  pcImageUrl = "";
  h5ImageUrl = "";
  appImageUrl = "";
  uploadData = { token: getToken(), uploadTypeName: "banner" };
  uploadChange(info) {
    this.loading = true;
    if (info.file.status != "done") return;
    this.file = info.file;
    let res = info.file.response;
    this.loading = false;
    if (1 != res.body.code)
      return res.message && this.$message.error(res.message);
    this.pcImageUrl = res.body.data.imageUrl;
  }
  uploadChangeH5(info) {
    this.loading1 = true;
    if (info.file.status != "done") return;
    this.file = info.file;
    let res = info.file.response;
    this.loading1 = false;
    if (1 != res.body.code)
      return res.message && this.$message.error(res.message);
    this.h5ImageUrl = res.body.data.imageUrl;
  }
  uploadChangeApp(info) {
    this.loading2 = true;
    if (info.file.status != "done") return;
    this.file = info.file;
    let res = info.file.response;
     this.loading2 = false;
    if (1 != res.body.code)
      return res.message && this.$message.error(res.message);
    this.appImageUrl = res.body.data.imageUrl;
  }

  imgUrlType = 0;
  changeType(e) {
    this.imgUrlType = e.target.value;
  }
  @Prop() acList;
  @Prop() anList;

  @Lifecycle() async created() {
    this.form = this.$form.createForm(this);
  }

  close() {
    this.$emit("close");
  }

  reset() {
    this.pcImageUrl = "";
    this.h5ImageUrl = "";
    this.appImageUrl = "";
    this.createTime = "";
    this.form.resetFields();
  }

  async submit() {
    this.form.validateFields(async (e, v) => {
      if (e) return;
      let p = {
        pcImageUrl: this.pcImageUrl,
        h5ImageUrl: this.h5ImageUrl,
        appImageUrl: this.appImageUrl,
        createTime: this.createTime
      };
      let r = await this.$service.fetch("/config-admin-api/banner/addBanner", {
        ...p,
        ...v
      });
      if (1 !== r.code) return r.message && this.$message.error(r.message);
      this.$message.success(r.message);
      this.$emit("ok");
      this.$emit("close");
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
  .ant-form-item-label {
    width: 90px;
  }
}
</style>
