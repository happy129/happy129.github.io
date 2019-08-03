import Vue from 'vue'
import Vuex from 'vuex'
import Auth from "./module-auth"
import Common from './module-common'
import createPersistedState from 'vuex-persistedstate'

Vue.use(Vuex)


export default new Vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  plugins: [
    // 状态还原
    createPersistedState({key: 'admin'})
  ],
  modules: {
    auth: Auth,
    common: Common
  },
  state: {
    cryptoConfig: "",
    // 管理员-会员真实姓名修改-tagsName
    adminNameTag: "",
    // 当前所在的页签
    currentPage: '',
    // 访问过的导航文件， 在top-navigator中会用到该数据
    visitedNavigator: []
  },
  
  getters: {
    getVisitedNavigator: state => state.visitedNavigator
  },
 
  mutations: {
    setVisitedNavigator(state, array) {
      state.visitedNavigator = array;
    },
    setCurrentPage(state, page) {
      state.currentPage = page;
    },
    setAdminNameTag(state, v) {
      state.adminNameTag = v;
    },
    setCryptoConfig(state, payload) {
      state.cryptoConfig = payload;
    }
  }
})