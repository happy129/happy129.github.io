import Service from '@/util/axios';
import api from './index';


// 获取会员组列表
export function getAllUserGroup(params = {}) {
  return Service.post(api.member.getAllUserGroup, {
    body: params
  })
}

// 添加会员组
export function addUserGroup(params) {
  return Service.post(api.member.addUserGroup, {
    body: params
  })
}

// 删除会员组
export function removeUserGroupByIds(params) {
  return Service.post(api.member.removeUserGroupByIds, {
    body: params
  })
}

// 修改会员组
export function editUserGroup(params) {
  return Service.post(api.member.editUserGroup, {
    body: params
  })
}


const memberManage = api.member.memberManage;
// 会员列表
export function getUserInfo(params) {
  return Service.post(memberManage.getUserInfo, {
    body: params
  })
}

// 获取会员组列表
export function getAllUserGroupName(params = {}) {
  return Service.post(memberManage.getAllUserGroupName, {
    body: params
  })
}

// 修改会员组状态或者移动会员组
export function batchEditUserStatusOrGroup(params = {}) {
  return Service.post(memberManage.batchEditUserStatusOrGroup, {
    body: params
  })
}

// 踢线操作
export function batchOfflineByIds (params = {}) {
  return Service.post(memberManage.batchOfflineByIds, {
    body: params
  })
}

// 根据用户id, 获取用户信息
export function getUserInfoById(params = {}) {
  return Service.post(memberManage.getUserInfoById, {
    body: params
  })
}

// 获取设备锁列表
export function getUserDeviceLockInfo(params = {}) {
  return Service.post(memberManage.getUserDeviceLockInfo, {
    body: params
  })
}

// 根据用户id, 更新用户信息
export function editUserInfoById(params = {}) {
  return Service.post(memberManage.editUserInfoById, {
    body: params
  })
}

// 获取手机设备限制列表
export function getUserDeviceRestrictionInfo(params = {}) {
  return Service.post(memberManage.getUserDeviceRestrictionInfo, {
    body: params
  })
}

// 手机设备限制， 开启或者关闭登陆， 投注， 聊天等功能
export function editUserDeviceRestrictionById(params = {}) {
  return Service.post(memberManage.editUserDeviceRestrictionById, {
    body: params
  })
}

// 密码冻结管理列表
export function getUserPasswordLockInfo(params) {
  return Service.post(memberManage.getUserPasswordLockInfo, {
    body: params
  })
}

const memberLog = api.member.memberLog;
// 获取日志列表
export function getMemberLogList(params) {
  return Service.post(memberLog.list, {
    body: params
  })
}

const reportIgnore = api.member.reportIgnore;
// 报表忽略列表
export function getUserReportIgnoreInfo(params = {}) {
  return Service.post(reportIgnore.getUserReportIgnoreInfo, {
    body: params
  })
}
// 报表忽略 添加会员到报表忽略
export function addUserToIgnore(params = {}) {
  return Service.post(reportIgnore.addUserToIgnore, {
    body: params
  })
}
// 报表忽略， 批量免费
export function batchEditUserFree(params = {}) {
  return Service.post(reportIgnore.batchEditUserFree, {
    body: params
  })
}
// 报表忽略 移除报表忽略
export function batchRemoveCollectFeeUser(params = {}) {
  return Service.post(reportIgnore.batchRemoveCollectFeeUser, {
    body: params
  })
}

// 报表忽略
export function queryByGroupCode(params = {}) {
  return Service.post(reportIgnore.queryByGroupCode, {
    body: params
  })
}

export function editByRedisKey(params = {}) {
  return Service.post(reportIgnore.editByRedisKey, {
    body: params
  })
}

export function changeToQuotaByUserId(params = {}) {
  return Service.post(reportIgnore.changeToQuotaByUserId, {
    body: params
  })
}