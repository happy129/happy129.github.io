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
		// 编辑子账户管理员账号(apiName =ak.admin.edit)
		editAdmin: '/config-admin-api/admin/editAdmin',
		// 获取所有商户平台
		queryAllByList: '/config-admin-api/platform/queryAllPlatform',
		// 分页查询第三方AG注单(apiName=ak.thirdAgOrder.page)
		thirdAgOrder: '/lottery-admin-api/thirdAgOrder/queryPageThirdAgOrder',
		// 分页查询第三方ky注单(apiName=ak.thirdKyOrder.page)
		thirdKyOrder: '/lottery-admin-api/thirdKyOrder/queryPageThirdKyOrder',
		// 分页查询第三方Th注单(apiName=ak.thirdThOrder.page)
		thirdThOrder: '/lottery-admin-api/thirdThOrder/queryPageThirdThOrder',

		// 分页查询第三方转账记录(apiName=ak.thirdTransferRecord.page)
		thirdTransferRecord: '/lottery-admin-api/thirdTransferRecord/queryPageThirdTransferRecord',

		// 更新商户后台第三方游戏配置(apiName=ak.thirdPlatformConfig.editMerchant)
		editMerchant: '/config-admin-api/thirdGameQuota/editPlatformThirdGameConfigEach',

		// 上传icon(apiName=ak.thirdPlatformConfig.uploadImage)，如果返回的header为空，则说明响应内容无需签名
		uploadImage: '/common-api/upload/uploadAdminImage',

		// 上传icon(apiName=ak.thirdPlatformConfig.uploadImage)，如果返回的header为空，则说明响应内容无需签名
		getDefaultIcon: '/config-admin-api/thirdGameQuota/getDefaultIcon',

		// 获取总控系统/平台商户系统对应的可用权限列表(apiName = ak.permission.getAvailablePermissionList)
		getAvailablePermissionList: '/config-admin-api/config/permission/queryAllAvailablePermission',

		// 修改/保存用户菜单权限(apiName = ak.adminPermission.editMenuAndTagPermission)
		editMenuAndTagPermission: '/config-admin-api/adminPermission/batchEditMenuAndTagPermission',

		// 修改/保存用户按钮权限(apiName = ak.adminPermission.editButtonPermission)
		editButtonPermission: '/config-admin-api/adminPermission/batchEditButtonPermission',
	},
	// 验证
	auth: {
		login: pre + '/admin/login',
		logout: pre + '/admin/logout',
		sign: pre + '/system/getSecret'
	},
	// 会员管理Api--
	member: {
		// 获取会员组列表
		getAllUserGroup: '/lottery-admin-api/userGroup/queryAllUserGroup',
		addUserGroup: '/lottery-admin-api/userGroup/addUserGroup',
		editUserGroup: '/lottery-admin-api/userGroup/editUserGroup',
		getUserGroupById: '/lottery-admin-api/userGroup/getUserGroupById',
		removeUserGroupByIds: '/lottery-admin-api/userGroup/batchRemoveUserGroup',
		// 会员管理
		memberManage: {
			getUserInfo: '/lottery-admin-api/user/queryPageUser',
			getAllUserGroupName: '/lottery-admin-api/userGroup/queryAllUserGroup',
			batchEditUserStatusOrGroup: '/lottery-admin-api/user/batchEditUserStatusOrGroup',
			batchOfflineByIds: '/lottery-admin-api/user/batchEditUserToOffline',
			getUserInfoById: '/lottery-admin-api/user/getUserDetail',
			editUserInfoById: '/lottery-admin-api/user/editUser',
			getUserDeviceLockInfo: '/lottery-admin-api/userDeviceLock/queryPageUserDeviceLock',
			getUserDeviceRestrictionInfo: '/lottery-admin-api/userDeviceRestriction/queryPageUserDeviceRestrictionInfo',
			getUserPasswordLockInfo: '/lottery-admin-api/userPasswordLock/queryPageUserPasswordLock',
			editUserDeviceRestrictionById: '/lottery-admin-api/userDeviceRestriction/editUserDeviceRestriction'
		},
		// 会员日志
		memberLog: {
			list: '/lottery-admin-api/userLoginLog/list'
		},
		// 报表忽略
		reportIgnore: {
			getUserReportIgnoreInfo: '/lottery-admin-api/userReportIgnore/queryPageUserReportIgnore',
			addUserToIgnore: '/lottery-admin-api/userReportIgnore/batchAddUserReportIgnore',
			batchEditUserFree: '/lottery-admin-api/userReportIgnore/batchEditUserType',
			batchRemoveCollectFeeUser: '/lottery-admin-api/userReportIgnore/batchRemoveUserReportIgnore',
			changeToQuotaByUserId: '/lottery-admin-api/userReportIgnore/recoverWalletBalance',
			queryByGroupCode: '/config-admin-api/configItem/queryByGroupCode',
			editByRedisKey: '/config-admin-api/configItem/editConfigItemByItemKey'
		}
	},
	notice: {
		//公告管理
		announcementAdd: '/config-admin-api/announcement/addAnnouncement',
		announcementEdit: '/config-admin-api/announcement/editAnnouncement',
		announcementPage: '/config-admin-api/announcement/queryPageAnnouncement',
		announcementRemove: '/config-admin-api/announcement/removeAnnouncementById',
		pushNoticeAdd: '/config-admin-api/pushNotice/addPushNotice',
		pushNoticePage: '/config-admin-api/pushNotice/queryPagePushNotice',
		letterPage: '/lottery-admin-api/letter/queryPageLetter',
		letterRemove: '/lottery-admin-api/letter/removeLetterById',
		letterEdit: '/lottery-admin-api/letter/editLetter',
		letterAdd: '/lottery-admin-api/letter/addLetter',
		bannerAdd: '/config-admin-api/banner/addBanner',
		bannerEdit: '/config-admin-api/banner/editBanner',
		bannerPage: '/config-admin-api/banner/queryPageBanner',
		bannerRemove: '/config-admin-api/banner/removeBannerById',
		bannerSelectById: '/config-admin-api/banner/getBannerDetail'
	},
	activity: {
		/* 活动管理 增删改查 */
		activityList: '/config-admin-api/activity/queryPageActivity',
		activityRemove: '/config-admin-api/activity/removeActivityById',
		activityAdd: '/config-admin-api/activity/addActivity',
		activityEdit: '/config-admin-api/activity/editActivity',
		activityDetail: '/config-admin-api/activity/getActivityDetail',
		/* 活动类型 */
		activityTypeAdd: '/config-admin-api/activityType/addActivityType',
		activityTypeEdit: '/config-admin-api/activityType/editActivityType',
		activityTypePage: '/config-admin-api/activityType/queryPageActivityType',
		activityTyperemove: '/config-admin-api/activityType/removeActivityTypeById',
		/* 获取活动类型基础数据 不分页 select使用 */
		activityTypeList: '/config-admin-api/activityType/queryAllActivityType',
		/* 首充优惠活动 */
		firstRechargeSettingQuery: '/config-admin-api/firstRechargeSetting/getFirstRechargeSetting',
		firstRechargeSettingSave: '/config-admin-api/firstRechargeSetting/saveFirstRechargeSetting',

		/* 首充礼金统计 */
		firstRechargeGivenQueryTotal: '/lottery-admin-api/firstRechargeGiving/queryPageFirstRechargeGivingSummary',
		firstRechargeGivenQueryDetail: '/lottery-admin-api/firstRechargeGiving/queryPageFirstRechargeGivingItem',
		/* 首充返水 */
		firstRechargeRebateQueryTotal: '/lottery-admin-api/firstRechargeRebate/queryPageFirstRechargeRebateSummary',
		firstRechargeRebateQueryDetail: '/lottery-admin-api/firstRechargeRebate/getPagefirstRechargeRebateDetail',

		/* 分享优惠活动 分享活动设置*/
		shareSettingSave:'/config-admin-api/shareSetting/saveShareSetting',
		shareSettingQuery:'/config-admin-api/shareSetting/getShareSetting',
		
		/* 分享礼金记录 */
		shareCashgiftRecordQueryByPage:'/lottery-admin-api/shareCashgiftRecord/queryPageShareCashgiftRecord',

		/* 分享返水记录 */
		shareRebateQueryTotalByPage:'/lottery-admin-api/shareRebate/queryPageShareRebateSummary',
		/* 分享返水记录详细 */
		shareRebateQueryDetailByPage:'/lottery-admin-api/shareRebate/queryPageShareRebateItem',

		/* 签到活动设置 */
		signRuleSettingSave:'/config-admin-api/signRuleSetting/saveSignRuleSetting',
		signRuleSettingQuery:'/config-admin-api/signRuleSetting/getSignRuleSetting',
		/* 签到记录 */
		signRecordQueryByPage:'/lottery-admin-api/signRecord/queryPageSignRecord',
		/* vip */
		vipLevelConfigAdd:'/config-admin-api/vipLevelConfig/addVipLevelConfig',
		vipLevelConfigEdit:'/config-admin-api/vipLevelConfig/editVipLevelConfig',
		vipLevelConfigQuery:'/config-admin-api/vipLevelConfig/queryAllVipLevelConfig',
		vipLevelConfigDetail:'/config-admin-api/vipLevelConfig/getVipLevelConfigDetail',
		/* vip升级礼金 */
		vipUpgradeQueryByPage:'/lottery-admin-api/vipUpgrade/queryPageVipUpgrade',
		/* vip进度 */
		vipUpgradeQueryCurrentProgress:'/lottery-admin-api/vipUpgrade/queryPageCurrentProgress',
		
		/* VIP活动返水 */
		vipRebateQueryTotalByPage:'/lottery-admin-api/vipRebate/queryPageVipRebateSummary',
		vipRebateQueryDetailByPage:'/lottery-admin-api/vipRebate/queryPageVipRebateItem',
		
	},
	chatroom: {
		// 聊天室
		chatConfigAddOrUpdate:'/config-admin-api/chatConfig/addOrEditChatNotice',
		chatConfigEdit:'/config-admin-api/chatConfig/editChatConfig',
		chatConfigSelectByPlatformId:'/config-admin-api/chatConfig/getChatConfigByPlatformId',
		chatRedEvenlopeItemAdd:'/lottery-admin-api/chatRedEvenlopeItem/snatchChatRedEvenlope',
		chatRedEvenlopeItem:'/lottery-admin-api/chatRedEvenlopeItem/updateChatRedEvenlopeItemToLuck',
		selectByChatRedEvenlopeItemVO:'/lottery-admin-api/chatRedEvenlopeItem/getChatRedEvenlopeItemDetail',
		chatRedEnvelopeAdd:'/lottery-admin-api/chatRedEnvelope/sendChatRedEnvelope',
		chatRedEnvelopePage:'/lottery-admin-api/chatRedEnvelope/queryPageChatRedEnvelope',
		chatRedEnvelopePageCount:'/lottery-admin-api/chatRedEnvelope/queryPageChatRedEnvelopeSummary',
		chatRedEnvelopeUpdate:'/lottery-admin-api/chatRedEnvelope/updateSnatchedAmountAndCount',
		sensitiveWordPage:'/config-admin-api/sensitiveWord/queryPageSensitiveWord',
		sensitiveWordAdd:'/config-admin-api/sensitiveWord/addSensitiveWord',
		sensitiveWordRemove:'/config-admin-api/sensitiveWord/removeSensitiveWordById',
		shareGiveAdd:'/lottery-admin-api/shareGiveRecord/addShareGiveRecord',
		shareGivePageCount:'/lottery-admin-api/shareGiveRecord/queryPageShareGiveRecordSummary',
		shareGivePage:'/lottery-admin-api/shareGiveRecord/queryPageShareGiveRecord',
		selectByPlatformId:'/config-admin-api/chatConfig/getChatConfigByPlatformId'
	}
}

export default api;