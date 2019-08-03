import api from './index';
import Service from '@/util/axios';

let API = api.notice
// 分页查询公告
export function announcementPage(params) {
  return Service.post(API.announcementPage, {
    body: params
  })
};
//添加公告 
export function announcementAdd(params) {
  return Service.post(API.announcementAdd, {
    body: params
  })
};
//删除公告
export function announcementRemove(params) {
  return Service.post(API.announcementRemove, {
    body: params
  })
}; 
//修改公告
export function announcementEdit(params) {
  return Service.post(API.announcementEdit, {
    body: params
  })
};
//新增通知
export function pushNoticeAdd(params) {
  return Service.post(API.pushNoticeAdd, {
    body: params
  })
};
//查询通知
export function pushNoticePage(params) {
  return Service.post(API.pushNoticePage, {
    body: params
  })
};
//查询站内信
export function letterPage(params) {
  return Service.post(API.letterPage, {
    body: params
  })
};
//删除站内信
export function letterRemove(params) {
  return Service.post(API.letterRemove, {
    body: params
  })
};
//新增站内信
export function letterAdd(params) {
  return Service.post(API.letterAdd, {
    body: params
  })
};
//修改站内信
export function letterEdit(params) {
  return Service.post(API.letterEdit, {
    body: params
  })
};
//增加轮播图
export function bannerAdd(params) {
  return Service.post(API.bannerAdd, {
    body: params
  })
};
//修改轮播图
export function bannerEdit(params) {
  return Service.post(API.bannerEdit, {
    body: params
  })
};
//查询轮播图
export function bannerPage(params) {
  return Service.post(API.bannerPage, {
    body: params
  })
};
//移除轮播图
export function bannerRemove(params) {
  return Service.post(API.bannerRemove, {
    body: params
  })
};
//ID查找轮播图
export function bannerSelectById(params) {
  return Service.post(API.bannerSelectById, {
    body: params
  })
};

