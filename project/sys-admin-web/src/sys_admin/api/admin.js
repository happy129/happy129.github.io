import api from './index';
import Service from '@/util/axios';

// 获取所有的管理员账户列表
export function adminList(params) {
    return Service.post(api.admin.list, {
        body: params
    })
}

// 添加管理员账户
export function addAdminList(params) {
    return Service.post(api.admin.add, {
        body: params
    })
}

// 删除管理员账户
export function deleteAdminList(params) {
    return Service.post(api.admin.delete, {
        body: params
    })
}

// 冻结管理员账户
export function editStatus(params) {
    return Service.post(api.admin.editStatus, {
        body: params
    })
}

// 修改子账户管理员密码(apiName =ak.admin.editPassword)
export function editPassword(params) {
    return Service.post(api.admin.editPassword, {
        body: params
    })
}

// 添加修改会员申请信息
export function addModifyAdmin(params) {
    return Service.post(api.admin.addModifyAdmin, {
        body: params
    })
}

// 检查会员
export function checkAdmin(params) {
    return Service.post(api.admin.checkAdmin, {
        body: params
    })
}

// 获取审核中的修改会员申请列表
export function modifyingList(params) {
    return Service.post(api.admin.modifyingList, {
        body: params
    })
}

// 修改会员申请通过
export function pass(params) {
    return Service.post(api.admin.pass, {
        body: params
    })
}

// 修改会员申请不通过
export function reject(params) {
    return Service.post(api.admin.reject, {
        body: params
    })
}

// 获取审核通过的修改会员申请列表
export function passList(params) {
    return Service.post(api.admin.passList, {
        body: params
    })
}

// 获取审核不通过的修改会员申请列表
export function rejectedList(params) {
    return Service.post(api.admin.rejectedList, {
        body: params
    })
}

// 管理员登录日志
export function adminLoginLogList(params) {
    return Service.post(api.admin.adminLoginLogList, {
        body: params
    })
}

// 管理员登录日志
export function adminOperateLogList(params) {
    return Service.post(api.admin.adminOperateLogList, {
        body: params
    })
}

// 创建管理员新密钥/google二维码
export function getGoogleSecretKey(params) {
    return Service.post(api.admin.getGoogleSecretKey, {
        body: params
    })
}

// 管理员 子账号管理 当前行详情
export function detail(params) {
    return Service.post(api.admin.detail, {
        body: params
    })
}

// 获取所有第三方游戏类型
export function getAll(params) {
    return Service.post(api.admin.getAll, {
        body: params
    })
}

// 分页查询第三方游戏配置(apiName=ak.thirdPlatformConfig.page)
export function getThirdGameList(params) {
    return Service.post(api.admin.getThirdGameList, {
        body: params
    })
}

// 分页查询第三方转账记录(apiName=ak.thirdTransferRecord.page)
export function thirdTransferRecordList(params) {
    return Service.post(api.admin.thirdTransferRecordList, {
        body: params
    })
}

// 获取第三方游戏默认icon(apiName=ak.thirdPlatformConfig.getDefaultIcon)
export function getDefaultIcon(params) {
    return Service.post(api.admin.getDefaultIcon, {
        body: params
    })
}

// 获取所有商户平台
export function queryAllByList(params) {
    return Service.post(api.admin.queryAllByList, {
        body: params
    })
}

// 修改子账户管理员账号
export function editAdmin(params) {
    return Service.post(api.admin.editAdmin, {
        body: params
    })
}

// 更新总后台第三方游戏配置
export function editThirdPlatformConfig(params) {
    return Service.post(api.admin.editThirdPlatformConfig, {
        body: params
    })
}

// 更新总后台第三方游戏配置
export function addThirdPlatformConfig(params) {
    return Service.post(api.admin.addThirdPlatformConfig, {
        body: params
    })
}

// 更新总后台第三方游戏配置
export function addthirdGameType(params) {
    return Service.post(api.admin.addthirdGameType, {
        body: params
    })
}

// 分页查询第三方AG注单
export function thirdAgOrder(params) {
    return Service.post(api.admin.thirdAgOrder, {
        body: params
    })
}

// 分页查询第三方ky注单
export function thirdKyOrder(params) {
    return Service.post(api.admin.thirdKyOrder, {
        body: params
    })
}

// 分页查询第三方Th注单
export function thirdThOrder(params) {
    return Service.post(api.admin.thirdThOrder, {
        body: params
    })
}

// 修改第三方游戏类型
export function editThirdGameType(params) {
    return Service.post(api.admin.editThirdGameType, {
        body: params
    })
}

// 获取总控系统/平台商户系统对应的可用权限列表
export function getAvailablePermissionList(params) {
    return Service.post(api.admin.getAvailablePermissionList, {
        body: params
    })
}

// 修改/保存用户菜单权限
export function editMenuAndTagPermission(params) {
    return Service.post(api.admin.editMenuAndTagPermission, {
        body: params
    })
}

// 修改/保存用户按钮权限
export function editButtonPermission(params) {
    return Service.post(api.admin.editButtonPermission, {
        body: params
    })
}