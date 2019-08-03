<template>
  <div class="login-container">
    <div class="login-form-wrapper">
      <h1 class="login-title">
        <img src="@/assets/logo.png"/>
      </h1>
      <a-form id="components-form-demo-normal-login" :form="form" class="login-form" @submit="submit" >
        <a-form-item class="form-username">
          <a-input size="large" v-decorator="[ 'userName',  { rules: [{ required: true, message: '请输入用户名' }] }  ]" placeholder="请输入用户名" >
            <!-- <a-icon slot="addonBefore" type="user" style="color: rgba(0,0,0,.25)"/> -->
            <img src="@/assets/user.png" slot="addonBefore"/>
          </a-input>
        </a-form-item>
        <a-form-item class="form-username">
          <a-input size="large" v-decorator="[ 'password', { rules: [{ required: true, message: '请输入密码' }] } ]"  type="password" placeholder="请输入密码" >
            <!-- <a-icon slot="addonBefore" type="lock" style="color: rgba(0,0,0,.25)"/> -->
            <img src="@/assets/password.png" slot="addonBefore"/>
          </a-input>
        </a-form-item>
        <a-form-item  class="form-username">
          <a-input size="large" v-decorator="[ 'googleCode']" placeholder="谷歌验证码" >
            <!-- <a-icon slot="addonBefore" type="lock" style="color: rgba(0,0,0,.25)"/> -->
            <img src="@/assets/yzm.png" slot="addonBefore"/>
          </a-input>
        </a-form-item>
        <a-form-item class="login-form-btns">
          <a-button html-type="submit" class="login-form-button" :loading="init.loading">登录</a-button>
          <a href class="register-link" style="display:none">注册</a>
        </a-form-item>
      </a-form>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import { Component, Lifecycle, Action, Data } from "vue-decorators";
import { setToken } from '@/util/auth'
import md5 from "md5";

@Component
export default class Login extends Vue {
  init = {
    loading: false
  }

  @Action('auth/Login') Login;
  @Lifecycle created() {
    this.form = this.$form.createForm(this);
  } 

  submit(e) {
    e.preventDefault();
    this.form.validateFields((err, values) => {
      if (!err) {
        this.loginAction(values);
      }
    });
  }

  async loginAction(values) {
    this.init.loading = true;
    values.password = md5(`${values.userName}${values.password}`);
    const { data: response } = await this.Login({ ...values,  systemType: 2 });
    this.init.loading = false;
    if (response?.body?.code === 1) {
      // 设置token 
      setToken(response.body.data?.token);
      // 进行路由跳转
      this.$router.push('/');
    }
  }
}
</script>


<style lang="scss" scoped>
.login-container{
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-image: url("../../../assets/bg1.jpg");

  .login-form-wrapper {
    width: 360px;
    padding: 20px 20px 0 20px;
    border-radius: 4px;
  }

  .login-title {
    font-size: 20px;
    text-align: center;
    margin-bottom: 20px;
  }

  .register-link {
    float: right;
  }

  .form-username /deep/{
    .ant-input-group {
      background-color: rgba(255,255,255,0.2);
      border-radius: 20px;
    }
    .ant-input-group-addon {
      background-color: transparent;
      border: none;
    }
    .ant-input {
      background-color: transparent;
      border: none;
      outline: none !important;
      color: #fff !important;
      &::-webkit-input-placeholder {
        color: #fff;
      }
      &::-moz-input-placeholder {
        color: #fff;
      }
      &::-ms-input-placeholder {
        color: #fff;
      }
      &::internal-autofill-selected {
        background-color: transparent;
      }
    }
    .ant-form-explain {
      padding-left: 50px;
    }
  }

  .login-form-btns /deep/{
    .ant-form-item-control {
      text-align: center;
      line-height: 1;
    }
  }

  .login-form-button {
    background-color: #66d354;
    color: #fff;
    border: none;
    padding: 8px 0;
    width: 220px;
    border-radius: 30px;
    font-size: 18px;
    height: auto;
  }
}

input:-webkit-autofill,
input:-webkit-autofill:hover, 
input:-webkit-autofill:focus,
textarea:-webkit-autofill,
textarea:-webkit-autofill:hover,
textarea:-webkit-autofill:focus,
select:-webkit-autofill,
select:-webkit-autofill:hover,
select:-webkit-autofill:focus {
	background-color: transparent;
	-webkit-text-fill-color: #fff;
  transition: background-color 5000s ease-in-out 0s;
}
</style>
