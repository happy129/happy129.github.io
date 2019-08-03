<template>
  <div class="login-container">
    <div class="login-form-wrapper">
      <div class="login-form-title">
        <img src="@/assets/title.png"/>
      </div>
      <div class="login-form-content">
        <h1 class="login-title">用户登录</h1>
        <a-form id="components-form-demo-normal-login" :form="form" class="login-form" @submit="submit" >
          <a-form-item>
            <a-input class="no-border-bottom" size="large" v-decorator="[ 'userName',  { rules: [{ required: true, message: '请输入用户名' }] }  ]" placeholder="请输入用户名" >
            </a-input>
          </a-form-item>
          <a-form-item>
            <a-input class="no-border-bottom" size="large" v-decorator="[ 'password', { rules: [{ required: true, message: '请输入密码' }] } ]" type="password" placeholder="请输入密码" >
            </a-input>
          </a-form-item>
          <a-form-item>
            <a-input size="large" v-decorator="[ 'googleCode']" placeholder="谷歌验证码" >
            </a-input>
          </a-form-item>
          <a-form-item class="btn-wrap">
            <a-button type="primary" html-type="submit" class="login-form-button" :loading="init.loading">登录</a-button>
            <a href class="register-link" style="display:none">注册</a>
          </a-form-item>
        </a-form>
      </div>
      <div class="login-icp">
        <p>版权所有：AK娱乐（香港）信息科技有限公司</p>
        <p>ICP备案  沪B2-20100138-1</p>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from "vue";
import { Component, Lifecycle, Action, Data,State,Watch } from "vue-decorators";
import { setToken } from '@/util/auth'
import md5 from "md5";

@Component
export default class Login extends Vue {
  init = { loading: false }
  @State(e => e.auth.userInfo) userInfo;
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
    const { data: response } = await this.Login({ ...values, systemType: 1 });
    this.init.loading = false;
    if (response?.body?.code === 1) {
      // 设置token 
      setToken(response.body.data?.token);
      // 设置平台名称
      document.title = response.body?.data.platformName || '商户后台';
      // 进行路由跳转
      this.$router.push('/');
    }
  }
  /** 监听userInfo */
	@Watch("userInfo") _userInfo(value,oldValue) {
    this.$mqtt.$disconnect();
		if(!value.token)return;
		this.$mqtt.$subscribeTopic(value);
		this.$mqtt.$connect();
  }
}
</script>


<style lang="scss" scoped>
.login-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background-image: url("../../../assets/bg2.jpg");

  .login-form-wrapper {
    width: 525px;
  }

  .login-form {
    .ant-form-item {
      margin-bottom: 10px;
    }
    .btn-wrap {
      margin-top: 20px;
    }
  }

  .login-title {
    font-size: 20px;
    margin-bottom: 20px;
  }

  .register-link {
    float: right;
  }

  .login-form-title {
    text-align: center;
  }

  .login-form-content {
    margin-top: 56px;
    background-color: #fff;
    border-radius: 10px;
    padding: 30px 45px 30px 45px;
  }

  .login-form-button {
    width: 100%;
    background-color: #ff2a00;
    border: none;
    height: 42px;
    border-radius: 5px;
  }

  .login-icp {
    margin-top: 40px;
    color: #fff;
    text-align: center;
    p {
      margin-bottom: 5px;
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
    -webkit-text-fill-color: #666;
    transition: background-color 5000s ease-in-out 0s;
  }
}

</style>
