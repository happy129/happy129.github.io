import Service from '@/util/axios';
import api from './index';



export function getBusManageList(params = {}) {
  return Service.post(api.merchants.queryByPage, {
    body: params
  })
}


export function userGetUserInfo(params = {}) {
	return Service.post(api.merchants.userGetUserInfo, {
	  body: params
	})
  }

export function userGroupGetAllUserGroupName(params = {}) {
	return Service.post(api.merchants.userGroupGetAllUserGroupName, {
	  body: params
	})
  }
  