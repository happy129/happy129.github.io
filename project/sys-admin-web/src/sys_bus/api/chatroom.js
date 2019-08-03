import api from './index';
import Service from '@/util/axios';

let API = api.chatroom
export function chatRedEnvelopePage(params) {
  return Service.post(API.chatRedEnvelopePage, {
    body: params
  })
};

export function chatRedEnvelopePageCount(params) {
  return Service.post(API.chatRedEnvelopePageCount, {
    body: params
  })
};
export function selectByChatRedEvenlopeItemVO(params) {
  return Service.post(API.selectByChatRedEvenlopeItemVO, {
    body: params
  })
};
//更新聊天室公告 
export function chatConfigAddOrUpdate(params) {
  return Service.post(API.chatConfigAddOrUpdate, {
    body: params
  })
};
//屏蔽词列表
export function sensitiveWordPage(params) {
  return Service.post(API.sensitiveWordPage, {
    body: params
  })
};
//新增屏蔽词
export function sensitiveWordAdd(params) {
  return Service.post(API.sensitiveWordAdd, {
    body: params
  })
};
//查询打赏
export function shareGivePage(params) {
  return Service.post(API.shareGivePage, {
    body: params
  })
};
export function shareGivePageCount(params) {
  return Service.post(API.shareGivePageCount, {
    body: params
  })
};
//修改聊天室配置
export function chatConfigEdit(params) {
  return Service.post(API.chatConfigEdit, {
    body: params
  })
};
//查询聊天室配置
export function selectByPlatformId(params) {
  return Service.post(API.selectByPlatformId, {
    body: params
  })
};
//删除屏蔽词
export function sensitiveWordRemove(params) {
  return Service.post(API.sensitiveWordRemove, {
    body: params
  })
};