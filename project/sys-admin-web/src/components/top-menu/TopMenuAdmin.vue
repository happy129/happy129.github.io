<template>
  <div class="layout-header">
    <div class="toggle-icon">
      <a-icon :type="icon" @click="toggleSide"/>
    </div>
    <div class="layout-user-wrap">
      <div class="current-member-count" style="display:none;">
        <a-dropdown>
          <a class="ant-dropdown-link" href="javascript:;">
            当前在线人数:
            <span class="g-yellow bold">3500</span>
          </a>
          <a-menu slot="overlay">
            <a-menu-item>
              <a href="javascript:;">PC: 500</a>
            </a-menu-item>
            <a-menu-item>
              <a href="javascript:;">H5: 1000</a>
            </a-menu-item>
            <a-menu-item>
              <a href="javascript:;">Ios: 1000</a>
            </a-menu-item>
            <a-menu-item>
              <a href="javascript:;">Android: 1000</a>
            </a-menu-item>
          </a-menu>
        </a-dropdown>
      </div>
      <div class="layout-hd-ico-right" style="display:none;">
        <a-badge count="2" :numberStyle="{boxShadow: 'none', height: '12px', lineHeight: '12px', fontSize: '10px', padding: '0 4px'}" >充</a-badge>
      </div>
      <div class="layout-hd-ico-right" style="display:none;">
        <a-badge dot>提</a-badge>
      </div>
      <div class="layout-hd-ico-right" style="display:none;">
        <a-badge dot>
          <a-icon type="bell"/>
        </a-badge>
      </div>
      <div class="user-avatar">
        <a-dropdown>
          <a class="ant-dropdown-link" href="javascript:;">
            {{name}}
            <a-icon type="caret-down"/>
          </a>
          <a-menu slot="overlay">
            <a-menu-item>
              <a href="javascript:;" @click="updatePassword">修改密码</a>
            </a-menu-item>
            <a-menu-item>
              <a href="javascript:;" @click="logoutAction">退出</a>
            </a-menu-item>
          </a-menu>
        </a-dropdown>
      </div>
    </div>

    <!-- show modify password dialog-->
    <a-modal title="修改密码" v-model="visible" :confirmLoading="confirmLoading" :destroyOnClose="true" :footer="null" :width="440" >
      <a-form class="modify-password" :form="formModifyPassword" @submit.prevent="modiyPassword">
        <a-form-item label="账号" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
          <a-input v-decorator="['account', { initialValue: form.account }]" :disabled="true"/>
        </a-form-item>
        <a-form-item label="昵称" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
          <a-input v-decorator="['nickname', { initialValue: form.nickname}]" :disabled="true"/>
        </a-form-item>
        <a-form-item label="旧密码" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
          <a-input type="password" v-decorator="['originPassword', {rules: [{ required: true, message: '请输入旧密码' }]}]" />
        </a-form-item>
        <a-form-item label="新密码" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
          <a-input type="password" v-decorator="['password', {rules: [{ required: true, pattern:/^[a-z0-9]{6,12}$/, message: '6-12码英文数字夹杂并且符合0~9及a~z字元'}]}]"/>
        </a-form-item>
        <a-form-item label="确认新密码" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
          <a-input type="password" v-decorator="['rePassword', {rules: [{ required: true, pattern:/^[a-z0-9]{6,12}$/, message: '6-12码英文数字夹杂并且符合0~9及a~z字元'}]}]" />
        </a-form-item>
        <div class="modify-btn">
          <a-button type="primary" html-type="submit" :loading="loading">提交</a-button>
        </div>
      </a-form>
    </a-modal>
  </div>
</template>

<script>
import Vue from "vue";
import Cookie from "js-cookie";
import { Component, Prop, State, Mutation, Lifecycle, Action } from "vue-decorators";
import { removeToken } from "@/util/auth";

@Component
export default class TopMenu extends Vue {
  constructor() {
    super();
    this.icon = "menu-fold";
    this.visible = false;
    this.confirmLoading = false;
    this.init = { id: "" };
    this.loading = false;
    this.form = {
      account: "",
      nickname: ""
    }
  }

  @Prop({ type: String }) name;
  @State(e => e.auth.userInfo) userInfo;
  @Action("auth/Logout") Logout;
  @Mutation('setVisitedNavigator') setVisitedNavigator;
  @Mutation('auth/updateUserInfo') updateUserInfo;

  @Lifecycle created() {
    this.formModifyPassword = this.$form.createForm(this);
  }

  @Lifecycle mounted() {
    this.init.id = this.userInfo?.adminId;

    this.form.account = this.userInfo?.userName;
    this.form.nickname = this.userInfo?.nickName;
  }

  toggleSide() {
    this.icon = this.icon === "menu-fold" ? "menu-unfold" : "menu-fold";
    this.$emit("toggleSide", this.icon);
  }
  // 登出操作
  logoutAction() {
    this.Logout().then(res => {
      if (res?.data?.body?.code === 1) this.$router.push("/login");
    });
  }
  updatePassword() {
    this.visible = true;
  }

  // 确认修改密码
  modiyPassword() {
    this.formModifyPassword.validateFields(async (err, values) => {
      if (!err) {
        this.loading = true;
        const res = await this.$service.fetch(
          "/config-admin-api/admin/editOwnPassword",
          Object.assign(this.init, values)
        );
        this.loading = false;
        if (res.code !== 1) return res.message && this.$message.error(res.message);
        this.visible = false;
        
        this.$modal.confirm({
          title: "提示",
          content: "修改密码成功，请重新登录",
          onOk: () => {
            // 移除token
            removeToken();
            // 清除用户信息
            this.updateUserInfo({});
            // 清除选中的导航
            this.setVisitedNavigator([]);
            this.$router.push("/login");
          }
        });
      }
    });
  }
}
</script>


<style lang="scss" scoped>
.modify-password /deep/ {
  .ant-row {
    margin-bottom: 4px;
  }
  .modify-btn {
    margin-top: 20px;
    text-align: right;
  }
}
</style>