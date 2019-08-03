import Vue from 'vue'
import Vuex from 'vuex'
import Auth from "./module-auth"
import Common from './module-common'
import createPersistedState from 'vuex-persistedstate'

import * as authUtil from '@/util/auth'

Vue.use(Vuex);

const storeCacheKey = `ak.admin.${Vue.env.VUE_APP_TYPE}.${Vue.env.VUE_APP_PLATFORM_ID}`;



/** 处理缓存数据 */
(() => {
  try {
    const token = authUtil.getToken();
    if (!token) {
      localStorage.removeItem(storeCacheKey);
      return;
    }
    const jsonStr = localStorage.getItem(storeCacheKey);
    if (!jsonStr) {
      authUtil.removeToken();
      return;
    }
    const { auth } = JSON.parse(jsonStr);
    const { userInfo } = auth;
    if (token != userInfo.token) {
      localStorage.removeItem(storeCacheKey);
      authUtil.removeToken();
      return;
    }
  } catch(error) {
    console.error(error);
  }
})();


const store = new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  plugins: [
    // 状态还原
		createPersistedState({
      key: storeCacheKey,
      paths: "auth".split(','),
      // paths:['adminNameTag','auth','common','cryptoConfig','currentPage','isRefresh','payoutstate','questionId','refreshTime','visitedNavigator'],
      storage:window.localStorage /* 暂时存 sessionStorage */
		})
	],
  modules: {
    auth: Auth,
    common: Common
  },
  state: {
    cacheKey: `ak.admin.${Vue.env.VUE_APP_TYPE}.${Vue.env.VUE_APP_PLATFORM_ID}`,
    cryptoConfig: "",
    // 管理员-会员真实姓名修改-tagsName
    adminNameTag: "",
    // 当前所在的页签
    currentPage: '',
    // 访问过的导航文件， 在top-navigator中会用到该数据
    visitedNavigator: [],
    // 修改出款审核的状态
    payoutstate: "",
    // 每间隔10秒刷新一次
    refreshTime: 10,
    // 是否开启自动刷新
    isRefresh: false,
    // 常见问题id
    questionId: "",
    // 设置已屏蔽地区code
    diabledAredCode: "",
    // 设置mqtt
    mqttMessges:{
        withdraw:0,
        offlineRecharge:0,
        systemMessage:""
    }
  },
  getters: {
    getVisitedNavigator: state => state.visitedNavigator
  },
  mutations: {
    replaceAuth(state, payload) {
      state.auth = payload;
    },
    setVisitedNavigator(state, array) {
      state.visitedNavigator = array;
    },
    setCurrentPage(state, page) {
      state.currentPage = page;
    },
    setAdminNameTag(state, v) {
      state.adminNameTag = v;
    },
    setPayoutState(state, payload) {
      state.payoutstate = payload;
    },
    setRefresh(state, payload) {
      state.isRefresh = payload;
    },
    setRefreshTime(state, time) {
      state.refreshTime = time;
    },
    setCryptoConfig(state, payload) {
      state.cryptoConfig = payload;
    },
    setQuestionId(state, payload) {
      state.questionId = payload;
    },
    setDiabledAredCode(state, payload) {
      state.diabledAredCode = payload;
    },
    setWithdraw(state, withdraw) {
      state.mqttMessges.withdraw = withdraw;
    },
    setOfflineRecharge(state, offlineRecharge) {
      state.mqttMessges.offlineRecharge = offlineRecharge;
		},
		setSystemMessage(state, systemMessage) {
      state.mqttMessges.systemMessage = systemMessage;
		},
		// setWithdrawCount(state, withdraw) {
    //   state.mqttMessges.withdraw=Vuex.state.mqttMessges.withdraw++;
    // },
    // setOfflineRechargeCount(state, offlineRecharge) {
    //   state.mqttMessges.offlineRecharge=Vuex.state.mqttMessges.offlineRecharge++;
		// },
  }
});



export default store;
