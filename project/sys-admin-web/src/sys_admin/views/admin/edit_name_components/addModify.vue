<template>
  <div>
    <a-form class="add-modify-box" layout="inline" :form="form">
      <a-form-item label="账号">
        <a-input
          v-decorator="[ 'userName',  { rules: [{ required: true, message: '4-12码英文或数字且符合0~9及a~z字元', pattern:/^[a-z0-9]{4,12}$/ }] }  ]"
          @change="userNameChange"
        ></a-input>
        <a-icon type="check-circle" v-if="showRight" class="right-icon"/>
        <a-button type="primary" @click="checkAdmin">检查账号</a-button>
      </a-form-item>
      <br>
      <a-form-item label="修改前姓名">
        <a-input
          v-decorator="[ 'modifyBeforeRealName',  { rules: [{ required: true, message: '请输入修改前姓名' }] }  ]"
        ></a-input>
      </a-form-item>
      <br>
      <a-form-item label="修改后姓名">
        <a-input
          v-decorator="[ 'modifyAfterRealName',  { rules: [{ required: true, message: '请输入修改后姓名' }] }  ]"
        ></a-input>
      </a-form-item>
      <br>
      <a-form-item label="备注">
        <a-textarea v-decorator="[ 'remark' ]"></a-textarea>
      </a-form-item>
      <br>
      <a-form-item label="谷歌验证码">
        <a-input v-decorator="[ 'googleCode' ]"></a-input>
      </a-form-item>
      <br>
      <a-form-item class="bottom-sub">
        <a-button type="primary" @click="submit">提交</a-button>
        <a-button type="primary" @click="reset">重置</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>
<script>
import Vue from "vue";
import { Component, Lifecycle, InjectComponents, Prop } from "vue-decorators";
import * as Api from "@api/admin";
@Component
export default class addModify extends Vue {
  userName = "";
  showRight = false;
  @Lifecycle created() {
    this.form = this.$form.createForm(this);
  }
  async submit() {
    await this.form.validateFields(async (err, values) => {
      if (!err) {
        let res = await Api.addModifyAdmin(values);
        let code = res?.data?.body?.code;
        if (code === 1) {
          this.showRight = false;
          // 通过成功并刷新页面
          this.$message.success(res?.data?.body?.message);
        }
      }
    });
  }
  async checkAdmin() {
    let res = await Api.checkAdmin({ userName: this.userName });
    if (res?.data?.body?.code === 1) {
      this.showRight = true;
      return;
    }
    this.showRight = false;
  }
  userNameChange(e) {
    this.userName = e.target.value;
  }
  reset() {
    this.showRight = false;
    this.userName = "";
    this.form.resetFields();
  }
}
</script>
<style lang="scss" scoped>
.add-modify-box /deep/ {
  .ant-input {
    width: 330px;
    margin-right: 5px;
    height: 38px;
    margin-bottom: 10px;
  }
  .ant-form-item-label {
    width: 100px;
  }
  textarea.ant-input {
    height: 86px;
  }
  .bottom-sub {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 456px;
    .ant-btn {
      width: 120px;
      margin: auto 7px;
    }
  }
  .right-icon {
    color: green;
    font-size: 20px;
    margin-right: 6px;
  }
}
</style>
