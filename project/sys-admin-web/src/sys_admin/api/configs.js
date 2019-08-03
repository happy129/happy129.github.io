import api from './index';
import Service from '@/util/axios';

/* 活动管理 */
export function configGroupAdd(params) {
	return Service.post(api.configs.configGroupAdd, {
		body: params
	  })
}

export function configItemEdit(params) {
	return Service.post(api.configs.configItemEdit, {
		body: params
	  })
}


export function configItemQueryDetail(params) {
	return Service.post(api.configs.configItemQueryDetail, {
		body: params
	  })
}

export function configGroupQueryByPage(params) {
	return Service.post(api.configs.configGroupQueryByPage, {
		body: params
	  })
}

export function configGroupQueryAllByList(params) {
	return Service.post(api.configs.configGroupQueryAllByList, {
		body: params
	  })
}


export function configItemRefreshRedisByGroupId(params) {
	return Service.post(api.configs.configItemRefreshRedisByGroupId, {
		body: params
	  })
}

export function configItemAdd(params) {
	return Service.post(api.configs.configItemAdd, {
		body: params
	  })
}

export function configItemRemoveById(params) {
	return Service.post(api.configs.configItemRemoveById, {
		body: params
	  })
}


/* 商户平台 */
export function platformQueryAllByList(params) {
	return Service.post(api.configs.platformQueryAllByList, {
		body: params
	  })
}

/* 获取配置项分页查询 */
export function configItemQueryByPage(params) {
	return Service.post(api.configs.configItemQueryByPage, {
		body: params
	  })
}