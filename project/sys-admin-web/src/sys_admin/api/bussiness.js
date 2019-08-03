import Service from '@/util/axios';
import api from './index';



export function getBusManageList(params = {}) {
  return Service.post(api.bus.queryByPage, {
    body: params
  })
}

export function queryBussinessDetail(params = {}) {
  return Service.post(api.bus.queryDetail, {
    body: params
  })
}

export function editBussinessInfo(params = {}) {
  return Service.post(api.bus.edit, {
    body: params
  })
}

export function addBussinessInfo(params = {}) {
  return Service.post(api.bus.add, {
    body: params
  })
}

const commission = api.bus.commisson;

export function getCommissionList(params = {}) {
  return Service.post(commission.query, {
    body: params
  })
}

export function addCommission(params = {}) {
  return Service.post(commission.add, {
    body: params
  })
}

export function editCommission(params = {}) {
  return Service.post(commission.edit, {
    body: params
  })
}

export function queryDetail(params = {}) {
  return  Service.post(commission.detail, {
    body: params
  })
}

const domains = api.bus.domain;

export function domainQuery(params = {}) {
  return  Service.post(domains.query, {
    body: params
  })
}

export function domainAdd(params = {}) {
  return  Service.post(domains.add, {
    body: params
  })
}

export function domainEdit(params = {}) {
  return  Service.post(domains.edit, {
    body: params
  })
}

export function domainRemove(params = {}) {
  return  Service.post(domains.remove, {
    body: params
  })
}

export function domainGetById(params = {}) {
  return  Service.post(domains.getById, {
    body: params
  })
}