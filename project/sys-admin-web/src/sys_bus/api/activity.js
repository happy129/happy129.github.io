import api from './index';
import Service from '@/util/axios';

/* 活动管理 */
export function activityList(params) {
	return Service.post(api.activity.activityList, {
		body: params
	})
}


export function activityAdd(params) {
	return Service.post(api.activity.activityAdd, {
		body: params
	})
}

export function activityEdit(params) {
	return Service.post(api.activity.activityEdit, {
		body: params
	})
}

export function activityRemove(params) {
	return Service.post(api.activity.activityRemove, {
		body: params
	})
}

export function activityDetail(params) {
	return Service.post(api.activity.activityDetail, {
		body: params
	})
}




/* 活动类型管理 */
export function activityTypeList(params) {
	return Service.post(api.activity.activityTypeList, {
		body: params
	})
}


export function activityTypePage(params) {
	return Service.post(api.activity.activityTypePage, {
		body: params
	})
}

export function activityTypeAdd(params) {
	return Service.post(api.activity.activityTypeAdd, {
		body: params
	})
}

export function activityTypeEdit(params) {
	return Service.post(api.activity.activityTypeEdit, {
		body: params
	})
}

export function activityTypeRemove(params) {
	return Service.post(api.activity.activityTyperemove, {
		body: params
	})
}



/* 首充优惠活动 */
export function firstRechargeSettingQuery(params) {
	return Service.post(api.activity.firstRechargeSettingQuery, {
		body: params
	})
}

export function firstRechargeSettingSave(params) {
	return Service.post(api.activity.firstRechargeSettingSave, {
		body: params
	})
}


/* 首充礼金统计 */
export function firstRechargeGivenQueryTotal(params) {
	return Service.post(api.activity.firstRechargeGivenQueryTotal, {
		body: params
	})
}

//首充礼金总计明细  首充礼金赠送  查询条件不一样
export function firstRechargeGivenQueryDetail(params) {
	return Service.post(api.activity.firstRechargeGivenQueryDetail, {
		body: params
	})
}



/* 首充返水统计 */
export function firstRechargeRebateQueryTotal(params) {
	return Service.post(api.activity.firstRechargeRebateQueryTotal, {
		body: params
	})
}

//首充返水统计详细
export function firstRechargeRebateQueryDetail(params) {
	return Service.post(api.activity.firstRechargeRebateQueryDetail, {
		body: params
	})
}



//分享礼金设置
export function shareSettingSave(params) {
	return Service.post(api.activity.shareSettingSave, {
		body: params
	})
}

export function shareSettingQuery(params) {
	return Service.post(api.activity.shareSettingQuery, {
		body: params
	})
}


/* 分享礼金记录 */
export function shareCashgiftRecordQueryByPage(params) {
	return Service.post(api.activity.shareCashgiftRecordQueryByPage, {
		body: params
	})
}

/* 分享返水记录 */
export function shareRebateQueryTotalByPage(params) {
	return Service.post(api.activity.shareRebateQueryTotalByPage, {
		body: params
	})
}
/* 分享返水记录详细 */
export function shareRebateQueryDetailByPage(params) {
	return Service.post(api.activity.shareRebateQueryDetailByPage, {
		body: params
	})
}




/* 签到活动设置 */
export function signRuleSettingSave(params) {
	return Service.post(api.activity.signRuleSettingSave, {
		body: params
	})
}

/* 签到活动设置查询 */
export function signRuleSettingQuery(params) {
	return Service.post(api.activity.signRuleSettingQuery, {
		body: params
	})
}


/* 签到活动设置查询 */
export function signRecordQueryByPage(params) {
	return Service.post(api.activity.signRecordQueryByPage, {
		body: params
	})
}



/* vip */
export function vipLevelConfigAdd(params) {
	return Service.post(api.activity.vipLevelConfigAdd, {
		body: params
	})
}
export function vipLevelConfigEdit(params) {
	return Service.post(api.activity.vipLevelConfigEdit, {
		body: params
	})
}
export function vipLevelConfigDetail(params) {
	return Service.post(api.activity.vipLevelConfigDetail, {
		body: params
	})
}
export function vipLevelConfigQuery(params) {
	return Service.post(api.activity.vipLevelConfigQuery, {
		body: params
	})
}
/* vip升级礼金 */
export function vipUpgradeQueryByPage(params) {
	return Service.post(api.activity.vipUpgradeQueryByPage, {
		body: params
	})
}

/* vip升级礼金 */
export function vipUpgradeQueryCurrentProgress(params) {
	return Service.post(api.activity.vipUpgradeQueryCurrentProgress, {
		body: params
	})
}

/* VIP活动返水 */
export function vipRebateQueryTotalByPage(params) {
	return Service.post(api.activity.vipRebateQueryTotalByPage, {
		body: params
	})
}
/* VIP活动返水详细 */
export function vipRebateQueryDetailByPage(params) {
	return Service.post(api.activity.vipRebateQueryDetailByPage, {
		body: params
	})
}

