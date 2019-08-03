import { login, logout } from '@api/login';
import { Action, Module, Mutation, State } from 'vue-decorators';
import { removeToken, setPlatformId, removePlatformId } from '@/util/auth';

@Module({ namespaced: true })
export default class Auth {
  @State userInfo = {};
  @State permission = [];
  @State buttonPermissions = [];
  // 筛选出二级标签，后面mixin进全局变量
  @State tags = [];
  @State isGoogleVerficationEnabled = false;  

  @Mutation updateUserInfo(state, userInfo) {
    state.userInfo = userInfo
  }

  @Mutation updatePermission(state, permission) { 
    state.permission = permission;
  }

  @Mutation updatePermissionTags(state, payload) {
    state.tags = payload;
  }

  @Mutation setGoogleCode(state, payload) {
    let isEnable = false;
    if (payload == 1) isEnable = true;
    state.isGoogleVerficationEnabled = isEnable;
  }

  @Mutation setBtnsPermissions(state, payload) {
    state.buttonPermissions = payload
  }

  @Action Login({ commit }, params) {
    return new Promise((resolve, reject) => {
      login(params).then((res) => {
        if (res ?.data ?.body ?.code === 1) {
          commit('updateUserInfo', res ?.data ?.body ?.data);
          // 设置平台id
          setPlatformId(res.data?.body?.data?.platformId);
          if (res.data?.body?.data?.permissionList instanceof Array) { 
            // 设置权限
            commit('updatePermission', res.data.body.data.permissionList);
            // 设置google验证码
            commit('setGoogleCode', res.data.body.data.isGoogleVerficationEnabled);
            // 筛选出二级菜单, 取得permissionCode, 后面通过判断permissionCode存不存在就可以
            const result = res.data.body.data.permissionList
             .filter(item => item?.permissionType == 1)
             .map(item => item?.permissionCode)
             .filter(item => item);

            // 筛选出按钮权限
            const btnPermissions = res.data.body.data.permissionList.filter(item => item?.permissionType == 2)
                                   .map(item => item.id); 

            commit('updatePermissionTags', result);

            commit("setBtnsPermissions", btnPermissions);
          }
        }
        resolve(res);
      })
      .catch(err => resolve(err));
    })
  }

  @Action Logout({ commit }) {
    return new Promise((resolve, reject) => {
      logout().then(res => {
        //if (res?.data?.body?.code === 1) {
          commit('setCurrentPage', '/', {root: true});
          commit('setVisitedNavigator', [], {root: true});
          removeToken();
          removePlatformId();
        // }
        resolve(res);
      })
      .catch(err => resolve(err));
    });
  }

}