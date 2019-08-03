/**
 *  封装axios，请求拦截， 响应拦截， 错误提示, 全局请求超时设置， 以及状态验证
 *  import Service from './axios'
 *  Service.get(url, get请求的参数, 设置消息头参数)
 *  Service.post(url, post请求的参数)
 * 
 */
import Vue from 'vue';
import { Modal, Message } from 'ant-design-vue';
import axios from 'axios';
import Cookie from 'js-cookie';
import { removeToken, getToken, getPlatformId, getClientType } from "@/util/auth";
import router from "@router/index"
import store from "@store/store"
//import md5 from 'md5'

const service = axios.create({
    //  baseURL: '/lottery-admin-api', 
    // baseURL,
    timeout: 20000,   // 请求超时时间
    validateStatus: function (status) {
        return status >= 200 && status < 300
    }
});

export const errorMessage = {
    forBiddenError: "禁止访问",
    serverError: "服务器出错",
    commonError: '请求接口出错',
    commonErrorTitle: '友情提示'
}


const err = (error) => {
    console.log(error);
    if (error.response) {
        if (error.response.status === 403) {
            Message.error(errorMessage.forBiddenError)
        } else if (error.response.status === 500 || error.response.status === 502) {
            Message.error(errorMessage.serverError)
        }
    }
    return Promise.reject(error);
}

service.interceptors.request.use(
    config => {
        if (config.method === "post") {
            if (config.data && config.data instanceof FormData) return config;
            config.data = JSON.stringify(config.data)
        }
        return config
    },
    error => {
        return Promise.reject(error)
    }
);


service.interceptors.response.use(
    async response => {
        // 是否是附件
        if ((response.headers['content-disposition'] || '').includes('attachment')) {
            return response;
        }
        
        // 下载导出
        if (response.data?.type == "application/json") {
            try {
                response.headers['content-disposition'] = undefined;
                await new Promise((resolve, reject) => {
                    const fr = new FileReader();
                    fr.onload = (event) => {
                        response.data = JSON.parse(event.target.result);
                        resolve();
                    }
                    fr.onerror = reject;
                    fr.readAsText(response.data);
                });
            } catch (error) {
                return err(error);
            }
        }

        if (typeof response === "string") {
            response = JSON.parse(response)
        }
        // 登录过期
        if (response ?.data ?.body ?.code === 1003) {
            Message.error(response ?.data ?.body ?.message || errorMessage.commonError);
            removeToken();
            localStorage.clear();
            store.commit("setVisitedNavigator", []);
            store.commit("setCurrentPage", '/');
            router.push("/login");
        }
        // r该语法可能在编辑器内报错， 需要设置 "javascript.validate.enable": false 这个选项
        if (response ?.data ?.body ?.code !== 1 && response.config.headers.ShowGlobal) {
            Message.error(response ?.data ?.body ?.message || errorMessage.commonError);
        }
        
        return response
    },

    error => err(error)
);


export default class Service {

    static get(url, params = {}, options = {}) {
        params = this.setCommonParams(url, params, options);
        return service({
            method: "get",
            url: url,
            params: params,
            headers: {
                'content-type': 'application/json;charset=UTF-8'
            }
        })
    }

    static async post(url, params = {}, options = {}) {
        if (!params.header) {
            params = this.setCommonParams(url, params, options);
        }
        if (typeof options.ShowGlobal != 'boolean') options.ShowGlobal = true;
        
        const xhr = await service({
            method: "post",
            url: url,
            data: params,
            baseURL: typeof options.baseURL != 'undefined' ? options.baseURL : service.defaults.baseURL,
            responseType: options.responseType || service.defaults.responseType || 'json',
            headers: {
                'content-type': 'application/json;charset=UTF-8',
                // 如果需要关闭全局捕获错误， 设置 options.ShowGlobal = false 就可以
                'ShowGlobal': options.ShowGlobal,
                // 'isEncryptEnabled' : store.state.cryptoConfig.enableEncrypt || false
            }
        });

        if ((xhr.headers['content-disposition'] || '').includes('attachment')) {
            // 调试加密
            if ((Vue.env.IS_PRODUCTION_INNER || Vue.env.IS_DEVELOPMENT) && store.state.cryptoConfig.enableEncrypt) {
                const key = "console";
                const log = window[key];
                log.group(url);
                const request = params;
                request.body = JSON.parse(toDecrypt(request.body));
                log.log("request", request);
                log.log("response", xhr);
                log.groupEnd();
            }
            return xhr;
        }

        // 1006: 签名非法
        // 如果在加载页面之前，后台没有开启加密，后期开加密，自动切换加密
        // 如果已开加密还是报错，就不再处理
        if (1006 == xhr ?.data ?.body ?.code && !store.state.cryptoConfig.enableEncrypt) {
            store.commit('setCryptoConfig', {...store.state.cryptoConfig, enableEncrypt: true});
            return Service.post(url, params, options);
        }

        // 解密
        if (1 == xhr ?.data ?.body ?.code && typeof xhr.data.body.data === "string" && xhr.data.body.data) {
            const datastr = toDecrypt(xhr.data.body.data) || "{}" ;
            xhr.data.body.data = JSON.parse(datastr);
        }
        // 调试加密
        if ((Vue.env.IS_PRODUCTION_INNER || Vue.env.IS_DEVELOPMENT) && store.state.cryptoConfig.enableEncrypt) {
            try {
                const key = "console";
                const log = window[key];
                log.group(url);
                const request = params;
                request.body = JSON.parse(toDecrypt(request.body) || "{}");
                log.log("request", request);
                log.log("response",JSON.parse(JSON.stringify(xhr.data.body)));
                log.groupEnd();
            } catch (err) {
                console.log('解析JSON失败...')
            }
        }
        return xhr;
    }
    // 处理请求头参数全局参数
    static setCommonParams(url, requestJson, options) {
        let token = getToken() || '';
        let platformId = `${getPlatformId()}`;
        let clientType = getClientType();
        
        requestJson.header = {
            //默认先写死一个
            sign: '7421DB2A16BA05EBAAA6C7C51483AF49',
            apiName: url,
            //从cookie中获取
            token: token, 
            callTime: Date.now(),
            // 客户端类型
            clientType: clientType,
            // 设定platformId
            platformId: platformId
        };
        if (requestJson.body && typeof requestJson.body != "object") {
            requestJson.body = {};
        }
        requestJson.header.sign = toGenerateSign(requestJson);

        return requestJson;
    }


    static fetch(apiName, body = {}) {
        let res;
        if (body && body instanceof FormData) {
            const token = getToken() || '';
            body.set('token', token);
            const config = { baseURL: '', headers: { ShowGlobal: false } };
            res = service.post(apiName, body, config);
        } else {
            res = Service.post(apiName, { body }, { ShowGlobal: false, baseURL: '' });
        }
        return res.then(res => res.data ?.body || { body:  res.data ?.body}, error => ({ code: 0, message: error.message || '服务异常' }));
    }

    /** 下载 */
    static download(apiName, body = {}) {
        let xhr = Service.post( apiName, { body }, { ShowGlobal: false, baseURL: "", responseType: "blob" } );
        return xhr.then(
          xhr => {
            if (!(xhr.data instanceof Blob)) return xhr.data ?.body || { body:  xhr.data ?.body};
            try {
              return new Promise(resolve => {
                const blob = xhr.data;
                const filename = decodeURI( (xhr.headers["content-disposition"] || "").split( "filename=" )[1] );
                const a = document.createElement("a");
                a.download = filename;
                a.href = URL.createObjectURL(blob);
                a.click();
                resolve({ code: 1, message: "下载成功" });

                // resolve({ code: 1, message: "下载成功" });
                // var reader = new FileReader();
                // reader.readAsDataURL(blob);
                // reader.onload = event => {
                //   const a = document.createElement("a");
                //   a.download = filename;
                //   a.href = event.target.result;
                //   a.click();
                //   resolve({ code: 1, message: "下载成功" });
                // };
                // reader.onerror = error => {
                //   resolve({ code: 0, message: error.message || "下载失败" });
                // };
              });
            } catch (error) {
              return { code: 0, message: error.message || "下载失败" };
            }
          },
          error => ({ code: 0, message: error.message || "服务异常" })
        );
    }
}


/**
 * 加密
 * @param entryStr 待加密正文
 * @return 加密正文
 */
function toEncrpt(entryStr) {
    const { aesSecret = "" } = store.state.cryptoConfig || {};
    let key = CryptoJS.enc.Utf8.parse(aesSecret || `AK1234567890OK03`);
    let iv = CryptoJS.enc.Utf8.parse("1234567890123456");
    const encrypt = CryptoJS.AES.encrypt(entryStr, key, {
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    return encrypt.toString();
}

/**
 * 解密
 * @param decryptStr 待解密正文
 * @return 解密正文
 */
function toDecrypt(decryptStr) {
    const { aesSecret = "" } = store.state.cryptoConfig || {};
    let ciphertext = CryptoJS.enc.Base64.parse(decryptStr);
    let key = CryptoJS.enc.Utf8.parse(aesSecret || `AK1234567890OK03`);
    let iv = CryptoJS.enc.Utf8.parse("1234567890123456");
    // tslint:disable no-object-literal-type-assertion
    const encryptedMessage = { ciphertext };
    const result = CryptoJS.AES.decrypt(encryptedMessage, key, {
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    }).toString(CryptoJS.enc.Utf8);
    return result;
}

/**
 * 生成请求参数签名
 * 签名生成规则 "apiName + bodyParamsStr + callTime + secretForSign + token + clientType"
 * @param requestJSON 请求对象
 * @return 签名字符串
 */
function toGenerateSign(requestJSON) {
    const { signSecret = "", enableEncrypt = false } = store.state.cryptoConfig || {};
    const { platformId, apiName, callTime, token, clientType } = requestJSON.header;
    if (typeof requestJSON.body !== "string" && enableEncrypt) {
        requestJSON.body = JSON.stringify(requestJSON.body);
        requestJSON.body = toEncrpt(requestJSON.body);
    }
    // console.warn(`signSecret:${signSecret}`);
    const bodyJson = requestJSON.body;
    const str = clientType + platformId + apiName + token + callTime + bodyJson + signSecret;
    return CryptoJS.MD5(str).toString();
}

/**
 * 验证响应结果签名是否正确
 * @param response 响应体
 * @return 是否签名正确
 */
function toVerifySign(response) {
    const { header, body } = response;
    if (!header.apiName || !header.callTime || !header.token) {
        console.warn("验证签名失败", { header, body });
        return false;
    }
    // 生成md5参数签名，验证包装响应体是否篡改
    const sign = toGenerateSign({ header, body });
    if (sign === header.sign) return true;
    console.warn("验证签名失败", { header, body });
    return false;
}


if (process.env.NODE_ENV === 'development') window.Api = Service;