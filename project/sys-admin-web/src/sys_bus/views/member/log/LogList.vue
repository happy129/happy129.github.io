<template>
  <div class="member-log">
     <date-switch title="登录时间" @changeTab="searchByDate" ref="ds"/>
      <div class="mem-log-form">
          <a-form layout="inline">
              <date-range @change="changeDate" ref="rg"/>
              <a-form-item label="会员账号">
                  <a-input v-model="form.userName"/>
              </a-form-item>
              <a-form-item label="用户ID">
                  <a-input v-number v-model="form.userId"/>
              </a-form-item>
              <a-form-item label="登录来源">
                  <a-select v-model="form.clientType" style="width: 80px;" @change="changeSelection">
                      <a-select-option value="">全部</a-select-option>
                      <a-select-option v-for="(item, index) in dictionary.clientType"  :key="index" :value="item.value">{{item.name}}</a-select-option>
                  </a-select>
              </a-form-item>
              <a-form-item label="登录版本" v-if="false"> <!--需求确认，先干掉，后期再加-->
                  <a-select v-model="form.appVersion">
                      <a-select-option value="">全部</a-select-option>
                      <a-select-option value="2">v1.2</a-select-option>
                      <a-select-option value="3">v1.3</a-select-option>
                  </a-select>
              </a-form-item>
              <a-form-item label="登录IP">
                  <a-input v-model="form.ip"/>
              </a-form-item>
             <a-form-item label="设备号"> 
                  <a-input v-model="form.deviceCode"/>
              </a-form-item>
              <a-form-item>
                  <a-button type='primary' @click="getMemberLogList(true)" :loading="init.loading">查询</a-button>
              </a-form-item>
          </a-form>
      </div>
      <div class="g-gray-border mt15">
          <div class="mt10">
              <a-table class="mytable" bordered :loading="init.loading" :columns="table.columns" :dataSource="table.tableData"  :pagination="table.pagination" :rowKey="e => e.id" @change="changePagination">
                  <span slot="id" :class="[record.status == 0 ? 'g-red' : '']" slot-scope="text, record">{{record.id}}</span>
                  <span slot="userName" :class="[record.status == 0 ? 'g-red' : '']" slot-scope="text, record">{{record.userName}}</span>
                  <span slot="ip" :class="[record.status == 0 ? 'g-red' : '']" slot-scope="text, record">{{record.ip}}</span>
                  <span slot="province" :class="[record.status == 0 ? 'g-red' : '']" slot-scope="text, record">{{record.province}}-{{record.city}}</span>
                  <span slot="osVersion" :class="[record.status == 0 ? 'g-red' : '']" slot-scope="text, record">{{record.osVersion}}</span>
                  <span slot="appVersion" :class="[record.status == 0 ? 'g-red' : '']" slot-scope="text, record">{{record.appVersion}}</span>
                  <span slot="deviceCode" :class="[record.status == 0 ? 'g-red' : '']" slot-scope="text, record">{{record.deviceCode}}</span>
                  <span slot="createTime" :class="[record.status == 0 ? 'g-red' : '']" slot-scope="text, record">{{record.createTime}}</span>
                  <span slot="status" :class="[record.status == 0 ? 'g-red' : '']" slot-scope="text, record">{{record.status == 0 ? '登录失败' : '登录成功'}}</span>
              </a-table>
          </div>
      </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { Component, InjectComponents, Lifecycle } from 'vue-decorators'
import { DateSwitch } from "@/components/switch"
import * as Api from '@api/member'
import { getDateString } from "@/util/helper";
import DateRange from '@/components/date-range/DateRange'

@Component({ dictionary: "clientType" })
@InjectComponents({ DateSwitch, DateRange })
export default class LogList extends Vue {
   table = {
      columns:[
          { title: 'ID', dataIndex: 'id', scopedSlots: {customRender: 'id'} },
          { title: '会员账号', dataIndex: 'userName', scopedSlots: {customRender: 'userName'} }, 
          { title: '登录IP', dataIndex: 'ip', scopedSlots: {customRender: 'ip'} },
          { title: '地址', dataIndex: 'province', scopedSlots: {customRender: 'province'} },
          { title: '登录来源', dataIndex: 'osVersion', scopedSlots: {customRender: 'osVersion'} },
          { title: '登录版本', dataIndex: 'appVersion', scopedSlots: {customRender: 'appVersion'}},
          { title: '浏览器/设备码', dataIndex: 'deviceCode', scopedSlots: {customRender: 'deviceCode'} },
          { title: '登录时间', dataIndex: 'createTime', scopedSlots: {customRender: 'createTime'} }, 
          { title: '说明', dataIndex: 'status', scopedSlots: {customRender: 'status'} }    
      ],
      tableData: [],
      pagination: {total: 0, current: 1}
  };

  form = {
      ip: '', 
      userId: '', 
      pageNo: 1, 
      pageSize: 10,
      userName: '', 
      deviceCode: '', 
      appVersion: '', 
      clientType: '', 
      appVersion: '',
      loginEndTime: '', 
      loginStartTime: '',
      // keep 
      platformId: 1
  };

  init = {
    loading: false
  }

  @Lifecycle mounted() {
      // keep
      this.form.platformId = this.userInfo?.platformId;

      this.setInititalDate();
      this.getMemberLogList();
  }

  setInititalDate() {
    const {startDate, endDate} = this.$refs.ds.getTime();
    this.$refs.rg.setDateRangeValues(startDate, endDate);
    this.form.loginStartTime = startDate;
    this.form.loginEndTime = endDate;
  }
  
  changePagination(pagination) {
      this.table.pagination.current = pagination.current;
      this.form.pageNo = pagination.current;
      this.getMemberLogList();
  }

  changeSelection() {
      this.form.pageNo = 1;
      this.table.pagination.current = 1;
  }

  searchByDate(startDate, endDate) {
    this.form.loginStartTime = startDate;
    this.form.loginEndTime = endDate;
    //this.getMemberLogList();
    this.$refs.rg.setDateRangeValues(startDate, endDate);
  }
  
  changeDate(startTime, endTime, datestring, type) {
    //this.form.loginStartTime = startTime ? startTime : this.form.loginStartTime;
    //this.form.loginEndTime = endTime ? endTime : this.form.loginEndTime;
    //console.log( datestring, type);
    if (type === "start") {
        this.form.loginStartTime = datestring 
    } else {
        this.form.loginEndTime = datestring
    }
  }

  async getMemberLogList(type) {
    if (type) {
        this.changeSelection();
    }
    this.init.loading = true;
    const { data: response } = await Api.getMemberLogList(this.form);
    this.init.loading = false;
    if (response?.body?.code === 1) {
        this.table.tableData = response?.body?.data?.records;
        this.table.pagination.total = response?.body?.data?.totalCount;
    } else {
        this.table.tableData = [];
        this.table.pagination.total = 0;
    }
  }
} 
</script>

<style lang='scss'>
.mem-log-form {
    margin-top: 15px;
    .ant-form {
        .ant-form-item { margin-right: 6px; }
        .ant-input { 
            width: 120px; 
            &.ant-calendar-picker-input {
                width: 170px;
            }
        }
    }
}
</style>