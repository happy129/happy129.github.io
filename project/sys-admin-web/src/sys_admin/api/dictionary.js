import api from './index';
import Service from '@/util/axios';

/* 新增字典组 */
export function dictionaryGroupAdd(params) {
	return Service.post(api.dictionary.dictionaryGroupAdd, {
		body: params
	  })
}

/* 字典组列表分页查询 */
export function dictionaryGroupQueryByPage(params) {
	return Service.post(api.dictionary.dictionaryGroupQueryByPage, {
		body: params
	  })
}
/* 获取所有的字典组信息列表 */
export function dictionaryGroupQueryAllByList(params) {
	return Service.post(api.dictionary.dictionaryGroupQueryAllByList, {
		body: params
	  })
}
/* 更新缓存 */
export function dictionaryItemRefreshRedisByGroupId(params) {
	return Service.post(api.dictionary.dictionaryItemRefreshRedisByGroupId, {
		body: params
	  })
}


/* 字典项相关 */
export function dictionaryItemAdd(params) {
	return Service.post(api.dictionary.dictionaryItemAdd, {
		body: params
	  })
}

export function dictionaryItemQueryByPage(params) {
	return Service.post(api.dictionary.dictionaryItemQueryByPage, {
		body: params
	  })
}



export function dictionaryItemEdit(params) {
	return Service.post(api.dictionary.dictionaryItemEdit, {
		body: params
	  })
}

export function dictionaryItemQueryDetail(params) {
	return Service.post(api.dictionary.dictionaryItemQueryDetail, {
		body: params
	  })
}
export function dictionaryItemRemoveById(params) {
	return Service.post(api.dictionary.dictionaryItemRemoveById, {
		body: params
	  })
}
