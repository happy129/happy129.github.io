<template>
  <div class="back-layer">
    <div class="dialog-box" @click.stop="">
      <div class="title">
        <span>修改密码</span>
        <span class="close-tag" @click="close">X</span>
      </div>

      <a-form layout="inline" :form="form">
        <a-form-item label="账号">
          <a-input v-model="userName" :disabled="true"></a-input>
        </a-form-item>
        <a-form-item label="昵称">
          <a-input v-model="nickName" :disabled="true"></a-input>
        </a-form-item>
        <a-form-item label="新密码">
          <a-input
            v-decorator="[ 'password', { rules: [{ required: true, message: '6-12码英文数字夹杂并且符合0~9及a~z字元', pattern:/^[a-z0-9]{6,12}$/}] } ]"
            type="password"
          ></a-input>
        </a-form-item>
        <a-form-item label="确认新密码">
          <a-input
            v-decorator="[ 'rePassword', { rules: [{ required: true, message: '6-12码英文数字夹杂并且符合0~9及a~z字元', pattern:/^[a-z0-9]{6,12}$/ }] } ]"
            type="password"
          ></a-input>
        </a-form-item>
        <a-form-item>密码规则：须为6-12码英文数字夹杂并且符合0~9及a~z字元</a-form-item>
        <a-form-item>
          <a-button type="primary" @click="submit">提交</a-button>
          <a-button type="primary" @click="reset">重置</a-button>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>
<script>
import Vue from "vue";
import { Component, Lifecycle, InjectComponents, Prop } from "vue-decorators";
import * as Api from "@api/admin";

@Component
export default class EditPassword extends Vue {
  @Prop() id;
  @Prop() userName;
  @Prop() nickName;

  close() {
    this.$emit("close");
  }

  @Lifecycle created() {
    this.form = this.$form.createForm(this);
  }

  async submit() {
    await this.form.validateFields(async (err, values) => {

      if (values.rePassword !== values.password) {this.$message.error('两次输入的密码不一致');return;}
      if (!err) {
        let p = {
          id: this.id
        };
        p = Object.assign(p, values);
        let res = await Api.editPassword(p);
        let code = res?.data?.body?.code;
        if (1 === code) {
          this.$message.success(res?.data?.body?.message);
          // 添加成功, 刷新页面
          this.$emit("ok");
          this.$emit("close");
        }
      }
    });
  }

  reset() {
    this.form.resetFields();
  }
}
</script>

<style lang="scss" scoped>
@import "./Pop.scss";
.back-layer {
  .dialog-box /deep/ {
    width: 490px;
    .ant-form-item-label {
      width: 90px;
    }
    .ant-row {
      margin-top: 10px;
    }
    .ant-btn {
      margin: auto 7px;
      width: 120px;
    }
    .ant-input {
      width: 330px;
      height: 38px;
    }
  }
}
</style>

