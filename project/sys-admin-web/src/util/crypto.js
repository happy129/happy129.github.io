import Vue from "vue";
import CryptoJS from "crypto-js";

/** 环境变量 */
const env = Vue.env = { ...process.env };
env.IS_DEVELOPMENT = env.NODE_ENV === "development";
env.IS_PRODUCTION = env.NODE_ENV === "production";
env.IS_PRODUCTION_INNER = location.href.indexOf("http://192.168") === 0;

/** 是否测试环境 */
if (env.IS_PRODUCTION_INNER) {
  try {
    const platformId = +window.location.href
      .split("//")[1]
      .split("#")[0]
      .split("?")[0]
      .split("/")[1];
    if (!isNaN(platformId)) env.VUE_APP_PLATFORM_ID = `${platformId || 1}`;
  } catch (e) {}
}

/** 开发环境调试 */
if (env.IS_DEVELOPMENT && (window).g) {
  Object.assign(env, (window).g);
}

(() => {
  try {
    let ciphertext = CryptoJS.enc.Base64.parse(env.VUE_APP_CONFIG_PEM_STR);
    let key = CryptoJS.enc.Utf8.parse(env.VUE_APP_CONFIG_PEM_KEY);
    let iv = CryptoJS.enc.Utf8.parse("1234567890123456");
    // tslint:disable no-object-literal-type-assertion
    const encryptedMessage = { ciphertext };
    // 配置字符串
    const configStr = CryptoJS.AES.decrypt(encryptedMessage, key, {
      iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    }).toString(CryptoJS.enc.Utf8);
    // 配置
    const config = JSON.parse(configStr);
    // 合并配置
    Object.assign(env, config);
  } catch (error) {
    console.error("(AES)解析加密失败", error);
    setTimeout(() => {
      throw new Error("(AES)解析加密失败");
    }, 0);
  }
})();

(() => {
  try {
    // 加密配置KEY
    const decryptKey = env.VUE_APP_CONFIG_ENCRYPTED_KEY;
    // 加密配置字符串
    const ciphertext = CryptoJS.enc.Base64.parse(env.VUE_APP_CONFIG_ENCRYPTED_STR);
    const encryptedMessage = { ciphertext };
    const secretPassphrase = CryptoJS.enc.Utf8.parse(decryptKey);
    const option = { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 };
    let decrypted = CryptoJS.DES.decrypt(encryptedMessage, secretPassphrase, option);
    // 配置字符串
    const configStr = decrypted.toString(CryptoJS.enc.Utf8);
    // 配置
    const config = JSON.parse(configStr);
    // 合并配置
    Object.assign(env, config);
  } catch (error) {
    console.error("(AES)解析加密失败", error);
    setTimeout(() => {
      throw new Error("(DES)解析加密失败");
    }, 0);
  }
})();

/** 定义缓存键值 */
Object.defineProperty(env, "cacheKeyPrefix", {
  /** 只读 */
  get() {
    return `${env.VUE_APP_CACHE_KEY_PREFIX}.${env.VUE_APP_PLATFORM_ID}`;
  }
});

/**
 * 获取指定商户缓存建
 * @param cacheKey 缓存建
 * @return 缓存键
 */
env.getPlatformCacheKey = (cacheKey) => {
  return `${env.VUE_APP_CACHE_KEY_PREFIX}.${env.VUE_APP_PLATFORM_ID}.${cacheKey}`.toLocaleLowerCase();
};


export default env;