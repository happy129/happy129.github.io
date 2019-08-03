let pre = '/config-admin-api'
// let pre = ''
const api = {
	// 管理员
	admin: {
		// 获取所有的管理员账户列表(apiName = ak.admin.list)
		list: pre + '/admin/queryPageAdmin',
		// 添加管理员账号信息(apiName = ak.admin.add)
		add: pre + '/admin/addAdmin',
		// 添加管理员账号信息(apiName = ak.admin.add)
		delete: pre + '/admin/removeAdminById',
		// 冻结管理员账号
		editStatus: pre + '/admin/editStatus',
		// 修改子账户管理员密码(apiName =ak.admin.editPassword)
		editPassword: pre + '/admin/editPassword',
		// 添加修改会员申请信息
		addModifyAdmin: pre + '/adminModifyUserApply/addApply',
		// 检查会员
		checkAdmin: pre + '/adminModifyUserApply/checkUser',
		// 获取审核中的修改会员申请列表(apiName = ak.adminModifyUserApply.modifyingList)
		modifyingList: pre + '/adminModifyUserApply/queryPageAuditedApply',
		// 修改会员申请通过(apiName = ak.adminModifyUserApply.pass)
		pass: pre + '/adminModifyUserApply/passApply',
		// 修改会员申请不通过(apiName = ak.adminModifyUserApply.pass)
		reject: pre + '/adminModifyUserApply/rejectApply',
		// 获取审核通过的修改会员申请列表(apiName = ak.adminModifyUserApply.passList)
		passList: pre + '/adminModifyUserApply/queryPageVerifiedApply',
		// 获取审核不通过的修改会员申请列表(apiName = ak.adminModifyUserApply.passList)
		rejectedList: pre + '/adminModifyUserApply/queryPageRejectedApply',
		// 管理员登录日志
		adminLoginLogList: pre + '/adminLoginLog/queryPageAdminLoginLog',
		// 管理员操作日志
		adminOperateLogList: pre + '/adminOperateLog/queryPageOperateLog',
		// 创建管理员新密钥/google二维码
		getGoogleSecretKey: pre + '/admin/getGoogleSecretKey',
		// 管理员 子账号管理 当前行详情
		detail: pre + '/admin/getAdmin',
		// 获取所有第三方游戏类型
		getAll: pre + '/thirdGameType/queryAllThirdGameType',
		// 分页查询第三方游戏配置(apiName=ak.thirdPlatformConfig.page)
		getThirdGameList: pre + '/thirdPlatformConfig/queryPageThirdPlatformConfig',
		
		// 分页查询第三方转账记录(apiName=ak.thirdTransferRecord.page)
		thirdTransferRecordList: '/lottery-admin-api/thirdTransferRecord/queryPageThirdTransferRecord',
		// 获取第三方游戏默认icon(apiName=ak.thirdPlatformConfig.getDefaultIcon)
		getDefaultIcon: '/config-admin-api/thirdGameQuota/getDefaultIcon',
		// 获取所有商户平台
		queryAllByList: '/config-admin-api/platform/queryAllPlatform',
		// 修改子账户管理员账号(apiName =ak.admin.edit)
		editAdmin: '/config-admin-api/admin/editAdmin',
		// 更新总后台第三方游戏配置(apiName=ak.thirdPlatformConfig.edit)
		editThirdPlatformConfig: '/config-admin-api/thirdGameQuota/editPlatformThirdGameConfig',
		// 添加第三方游戏配置(apiName=ak.thirdPlatformConfig.add)
		addThirdPlatformConfig: '/config-admin-api/thirdGame/addThirdGame',
		// 添加第三方游戏类型(apiName=ak.thirdGameType.add)
		addthirdGameType: '/config-admin-api/thirdGameType/addThirdGameType',
		// 分页查询第三方AG注单(apiName=ak.thirdAgOrder.page)
		thirdAgOrder: '/lottery-admin-api/thirdAgOrder/queryPageThirdAgOrder',
		// 分页查询第三方ky注单(apiName=ak.thirdKyOrder.page)
		thirdKyOrder: '/lottery-admin-api/thirdKyOrder/queryPageThirdKyOrder',
		// 分页查询第三方Th注单(apiName=ak.thirdThOrder.page)
		thirdThOrder: '/lottery-admin-api/thirdThOrder/queryPageThirdThOrder',
		// 修改第三方游戏类型(apiName=ak.thirdGameType.edit)
		editThirdGameType: '/config-admin-api/thirdGameType/editThirdGameType',

		// 获取总控系统/平台商户系统对应的可用权限列表(apiName = ak.permission.getAvailablePermissionList)
		getAvailablePermissionList: '/config-admin-api/config/permission/queryAllAvailablePermission',

		// 修改/保存用户菜单权限(apiName = ak.adminPermission.editMenuAndTagPermission)
		editMenuAndTagPermission: '/config-admin-api/adminPermission/batchEditMenuAndTagPermission',

		// 修改/保存用户按钮权限(apiName = ak.adminPermission.editButtonPermission)
		editButtonPermission: '/config-admin-api/adminPermission/batchEditButtonPermission'
	},
	auth: {
		login: '/config-admin-api/admin/login',
		logout: '/config-admin-api/admin/logout',
		sign: '/config-admin-api/system/getSecret'
	},
	// 平台商户管理
	bus: {
		// 平台列表分页查询
		queryByPage: '/config-admin-api/platform/queryPagePlatform',
		add: '/config-admin-api/platform/addPlatform',
		queryDetail: "/config-admin-api/platform/getPlatformDetail",
		edit: '/config-admin-api/platform/editPlatform',
		// 佣金模式
		commisson: {
			query: '/config-admin-api/platformCommissonMode/queryPagePlatformCommissonMode',
			add: '/config-admin-api/platformCommissonMode/addPlatformCommissonMode',
			edit: '/config-admin-api/platformCommissonMode/editPlatformCommissonMode',
			detail: '/config-admin-api/platformCommissonMode/getPlatformCommissonModeDetail'
		},
		//域名管理
		domain: {
			remove: "/config-admin-api/platformDomain/removePlatformDomainById",
			getById: "/config-admin-api/platformDomain/getPlatformDomainDetail",
			query: '/config-admin-api/platformDomain/queryPagePlatformDomain',
			add: '/config-admin-api/platformDomain/addPlatformDomain',
			edit: '/config-admin-api/platformDomain/editPlatformDomain',
			detail: '/config-admin-api/platformDomain/queryDetail'
		}
	},
	configs:{
		configGroupAdd: "/config-admin-api/configGroup/addConfigGroup",
		configItemEdit: "/config-admin-api/configItem/editConfigItem",
		configItemQueryDetail: "/config-admin-api/configItem/getConfigItemDetail",
		configGroupQueryByPage: "/config-admin-api/configGroup/queryPageConfigGroup",
		configItemRefreshRedisByGroupId: "/config-admin-api/configItem/refreshRedisByGroupId", //配置组刷新缓存接口
		configGroupQueryAllByList:"/config-admin-api/configGroup/queryAllConfigGroup", //不翻页

		/* 配置项 */
		configItemAdd: "/config-admin-api/configItem/addConfigItem",
		configItemQueryByPage:"/config-admin-api/configItem/queryPageConfigItem",
		configItemRemoveById:"/config-admin-api/configItem/removeById",
		/* 商户平台 */
		platformQueryAllByList:"/config-admin-api/platform/queryAllPlatform"
		
	},
	merchants:{
		queryByPage: '/lottery-admin-api/platform/queryByPage',
		userGetUserInfo: '/lottery-admin-api/user/queryPageUser',
		userGroupGetAllUserGroupName: "/lottery-admin-api/userGroup/queryAllUserGroup"
	},
	dictionary:{
		dictionaryGroupAdd: '/config-admin-api/dictionaryGroup/addDictionaryGroup',
		dictionaryGroupQueryAllByList: '/config-admin-api/dictionaryGroup/queryAllDictionaryGroup',
		dictionaryGroupQueryByPage: "/config-admin-api/dictionaryGroup/queryPageDictionaryGroup",
		dictionaryItemRefreshRedisByGroupId: "/config-admin-api/dictionaryItem/refreshRedisDataByGroupId",

		/* 字典项 */
		dictionaryItemAdd: "/config-admin-api/dictionaryItem/addDictionaryItem",
		dictionaryItemEdit: "/config-admin-api/dictionaryItem/editDictionaryItem",
		dictionaryItemRemoveById: "/config-admin-api/dictionaryItem/removeDictionaryItemById",
		dictionaryItemQueryDetail: "/config-admin-api/dictionaryItem/getDictionaryItemDetail",
		dictionaryItemQueryByPage: "/config-admin-api/dictionaryItem/queryPageDictionaryItem",
		
		
	}
}

export default api;