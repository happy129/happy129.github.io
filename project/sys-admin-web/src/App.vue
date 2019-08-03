<template>
  <a-locale-provider :locale="locale">
    <div id="app" class="app" v-if="!loading">
      <router-view/>
    </div>
		<div v-else>服务连接中....</div>
  </a-locale-provider>
</template>

<script>
import Vue from 'vue'
import { Component, Lifecycle, Mutation } from 'vue-decorators'
import axios from "axios";
import zhCN from 'ant-design-vue/lib/locale-provider/zh_CN'
import './style/common.scss'
import * as authUtil from "@/util/auth";

@Component({})
export default class App extends Vue {
  locale = zhCN;
  /** 是否加载 */
  loading = true;

  @Mutation('setCryptoConfig') setCryptoConfig;

  /** 获取加密 */
  async getSecret() {
    const rsaPublicKey = Vue.env.VUE_APP_CONFIG_RSA_PAIR2_PUBLIC_KEY;
    const rsaPrivateKey = Vue.env.VUE_APP_CONFIG_RSA_PAIR1_PRIVATE_KEY;
    const clientType = Vue.env.VUE_APP_CLIENT_TYPE;
    // Vue.env.VUE_APP_TYPE === 1 代表商户后台， 否则就代表总后台
    const platformId = Vue.env.VUE_APP_TYPE == '1' ? -1 : 0;
    const apiName = "/common-api/system/getSecret";
    const token = "";
    const callTime = Date.now();
    const str = clientType + platformId + apiName + token + callTime;
    const rsa = new JSEncrypt({ default_key_size: 2048, default_public_exponent: "10001" });
    rsa.setPublicKey(rsaPublicKey);
    const rsaStr = rsa.encrypt(str);
    const config = { headers: {} };
    config.url = "/common-api/system/getSecret";
    config.headers["content-type"] = "application/json;charset=UTF-8";
    config.method = "post";
    const params = { header: { apiName, platformId, token, clientType, callTime, sign: "nosign" }, body: { conventionValue: rsaStr } };
    config.data = JSON.stringify(params);
    const res = await axios.create({})(config);
    if (1 === res ?.data ?.body ?.code) {
      const rsa = new JSEncrypt({ default_key_size: 2048, default_public_exponent: "10001" });
      rsa.setPrivateKey(rsaPrivateKey);
      let { aesSecret, signSecret, enableEncrypt = false } = res ?.data ?.body ?.data;
      try {
        const cryptoConfig = {};
        cryptoConfig.aesSecret = rsa.decrypt(aesSecret);
				cryptoConfig.signSecret = rsa.decrypt(signSecret);
				if (!enableEncrypt && (Vue.env.IS_DEVELOPMENT || window.location.href.indexOf("//192.168") > 0)) {
          enableEncrypt =
            window.location.href
              .split("#")[0]
              .split("?")[0]
              .indexOf("crypt") >= 0;
        };
        // 是否开启加密
        cryptoConfig.enableEncrypt = enableEncrypt;
       // this.$store.state.cryptoConfig = cryptoConfig;
        this.setCryptoConfig(cryptoConfig);
        // console.log(this.$store.state.cryptoConfig)
        this.testCrypto();
      } catch (error) {
        // this.$toast("解析服务配置失败!");
      }
    }
    return res;
  }

  async testCrypto() {
    // const res = await this.$service.fetch("/common-api/demo/encryptDemo", { remark: "222" });
  }

  async reTry() {
    this.loading = true;
    await this.getSecret();
    this.loading = false;
  }

  /** 商务管理系统逻辑 */
  async toDoSysBus() {
    if ('sys_bus' != Vue.env.VUE_APP_TYPE) return;
    const state = this.$store.state;
    let sys_bus_token = authUtil.getToken();

    setInterval(() => {
      const token = authUtil.getToken() || "";
      if (token == sys_bus_token) return;
      sys_bus_token = token || "";
      const tokenState = (state.auth?.userInfo?.token) || "";
      if (sys_bus_token == tokenState) return;
      const { cacheKey } = this.$store.state;
      try {
        const {auth} = JSON.parse(localStorage.getItem(cacheKey));
        this.$store.commit("replaceAuth", auth);
      } catch (error) {
        console.error(error);
        return;
      }
      if (sys_bus_token) return this.$router.replace("/")
      return this.$router.replace("/login");
    }, 1000);
  }

  @Lifecycle()
  async created() {
		//this.loading = false;
    this.reTry();

    this.toDoSysBus();
  }
}
</script>

<style lang="scss" scoped>
.app /deep/ {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  .ant-spin-container {
    height: 100%;
  }
  .ant-table-placeholder {
    z-index: 0;
  }
  .mytable {
    .ant-table-thead > tr > th {
      padding: 10px 10px !important;
      font-size: 13px;
      min-width: 80px;
    }
    .ant-table-tbody > tr > td {
      padding: 10px 10px !important;
      font-size: 13px;
      min-width: 80px;
      word-break: break-all;
    }
    .ant-checkbox-wrapper {
      padding: 5px 15px;
    }
  }
}
</style>

<style lang="scss">
.ant-form-item-with-help {
  margin: 0 !important;
}
.ant-modal- {
  &close-x {
    width: 40px;
    height: 40px;
    line-height: 40px;
    color: #fff;
  }
  &header {
    background-color: #009688;
    color: #fff;
    padding: 10px 24px;
  }
  &title {
    color: #fff;
  }
}
</style>
