import Cookie from "js-cookie"

const prefix = process.env.VUE_APP_TYPE;
const globalPlatformId = process.env.VUE_APP_PLATFORM_ID;

// 判断是否有登录
export function getToken() {
    const token = Cookie.get(prefix + 'token')
    if (token) return token
    return false
}

export function setToken(value) {
    Cookie.set(prefix + 'token', value);
}

export function removeToken() {
    Cookie.remove(prefix + 'token')
}

// 获取平台id
export function getPlatformId()
{   
    let platformId = "";
    // 分享代理后台，以及代理后台属于前台登录，需要从配置文件中拿platformId
    if (prefix === "sys_share_agent" || prefix === "sys_agent") {
        platformId = globalPlatformId;
        if (isNaN(+platformId)) {
            return 1;
        }
    } else {
        platformId = Cookie.get(`${prefix}platformId`);
        if (isNaN(+platformId)) { 
            return prefix === "sys_admin" ? 0 : 1;
        }
    }
    
    return platformId;
}

// 设置平台id
export function setPlatformId(value)
{ 
    Cookie.set(`${prefix}platformId`, value);
}

// 移除平台id
export function removePlatformId()
{ 
    Cookie.remove(`${prefix}platformId`);
}

// 导出客户端类型
export function getClientType() {
    // const { VUE_APP_TYPE } = process.env;
    // let clientType = 3;
    // switch(VUE_APP_TYPE) {
    //     // 无线代理
    //     case "sys_agent": 
    //         clientType = 9;
    //         break;
    //     // 分享代理    
    //     case "sys_share_agent":
    //         clientType = 10;
    //         break;
    //     // 分分彩控制    
    //     case "sys_ffc":
    //         clientType = 8;
    //         break;
    //     // 运维系统
    //     case "sys_operation":
    //         clientType = 7;
    //         break;
    //     default:
    //         clientType = 3                
    // }
    return process.env.VUE_APP_CLIENT_TYPE;
}