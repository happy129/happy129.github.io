<template>
  <div class="back-layer">
    <div class="dialog-box" @click.stop>
      <div class="title">
        <span>编辑快捷入口</span>
        <span class="close-tag" @click="close">X</span>
      </div>

      <div style="padding:20px;">
        <a-form layout="inline" :form="form">
          <a-form-item label="图标">
            <img :src="logoUrl" alt="..." class="icon-box">
            <span>图标规格为130*130，格式为png</span>
          </a-form-item>
          <br>
          <a-form-item style="margin-left:106px;">
            <a-input v-model="logoUrl" style="width:264px;"></a-input>
          </a-form-item>
          <a-form-item>
            <a-upload
              :beforeUpload="beforeUpload"
              :showUploadList="false"
              style="text-align:center;margin-left:6px;margin-right:6px;background-color:#009688;line-height:30px;height:30px;width:60px;display:inline-block;border-radius:2px;cursor:pointer;"
              @change="toUpload"
            >上传</a-upload>
          </a-form-item>

          <br>
          <a-form-item label="快捷入口名称">
            <a-input v-decorator="['shortcutEntryName', {initialValue:det.shortcutEntryName}]"></a-input>
          </a-form-item>

          <br>
          <a-form-item label="快捷入口编码">
            <a-input disabled v-decorator="['shortcutEntryCode', {initialValue:det.shortcutEntryCode}]"></a-input>
          </a-form-item>

          <br>
          <a-form-item label="排序">
            <a-input-number
              v-decorator="['sortOrder', {initialValue:det.sortOrder}]"
              style="width:330px;"
            ></a-input-number>
          </a-form-item>

          <br>
          <a-form-item label="状态" style="margin-left:-192px;">
            <a-radio-group
              name="状态"
              v-decorator="['isEnabledForcedly', {initialValue:det.isEnabledForcedly}]"
            >
              <a-radio :value="1">启用</a-radio>
              <a-radio :value="0">禁用</a-radio>
            </a-radio-group>
          </a-form-item>

          <br>
          <a-form-item>
            <a-button type="primary" @click.prevent="submit">确定</a-button>
          </a-form-item>
        </a-form>
      </div>
    </div>
  </div>
</template>
<script>
import Vue from "vue";
import {
  Component,
  Lifecycle,
  InjectComponents,
  State,
  Prop
} from "vue-decorators";

@Component
export default class EditQuickEntry extends Vue {
  fileList = [];
  @Prop() det;

  isEnabledForcedly = 1;

  @Lifecycle() async created() {
    this.form = this.$form.createForm(this);
  }

  @Lifecycle() async mounted() {
    await this.$nextTick();
    this.logoUrl = this.det.logoUrl;
  }

  submit() {
    this.form.validateFields(async (e, v) => {
      if (e) return;
      let r = await this.$service.fetch(
        "/config-admin-api/shortcutEntry/editShortcutEntry",
        {
          id: this.det.id,
          logoUrl: this.logoUrl,
          ...v
        }
      );
      if (1 !== r.code) return r.message && this.$message.error(r.message);
      this.$message.success(r.message);
      this.$emit("ok");
    });
  }

  close() {
    this.$emit("close");
  }

  logoUrl = "";

  beforeUpload(file) {
    this.fileList = [...this.fileList, file];
    return false;
  }

  async toUpload(fileList) {
    const formdata = new FormData();
    formdata.append("imageFile", this.fileList[0]);
    formdata.append("uploadTypeName", "shortcutEntry");
    const res = await this.$service.fetch(
      "/common-api/upload/uploadAdminImage",
      formdata
    );
    if (1 != res.code) return res.message && this.$message.error(res.message);
    this.$message.success(res.message);
    this.logoUrl = res.data?.imageUrl;
  }
}
</script>

<style lang="scss" scoped>
@import "@views/admin/Pop.scss";
.back-layer /deep/ {
  .icon-box {
    display: inline-block;
    width: 40px;
    height: 40px;
    border: dashed 1px silver;
    margin-right: 10px;
  }
  .ant-upload {
    color: white;
  }
  .ant-form-item-label {
    width: 100px;
  }
  .ant-input {
    width: 330px;
  }
}
</style>

