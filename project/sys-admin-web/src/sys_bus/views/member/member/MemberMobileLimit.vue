<template>
    <!--手机设备限制-->
    <div class="member-mobile">
         <div class="member-mobile-hd">
            <a-form layout="inline" @submit.prevent="getDeviceLockList(true)">
                <a-form-item label="序列号">
                    <a-input v-model.trim="form.deviceCode"/>
                </a-form-item>
                <a-form-item label="广告ID"> <a-input v-model.trim="form.auxiliaryCode"/> </a-form-item>
                <a-form-item label="设备"> <a-input v-model.trim="form.osVersion"/> </a-form-item>
                 <a-form-item>
                    <a-select defaultValue="" @change="changeSelect">
                        <a-select-option value="">请选择</a-select-option>
                        <a-select-option value="isLoginEnabled">禁止登陆</a-select-option>
                        <a-select-option value="isBetEnabled">禁止投注</a-select-option>
                        <a-select-option value="isChatEnabled">禁止聊天</a-select-option>
                    </a-select>
                </a-form-item>
                <a-form-item>
                    <a-button type="primary" html-type="submit">查询</a-button>
                </a-form-item>
            </a-form>
        </div>
        <div class="page-under-table">
            <a-table  class="mytable" bordered :columns="table.columns" :dataSource="table.dataSource" :rowKey="e => e.id" :pagination="table.pagination" @change="changePagination">
              <template slot="isLoginEnabled" slot-scope="text, records">
                <a-switch v-permission="20017" checkedChildren="允许" unCheckedChildren="禁止" :checked="records.isLoginEnabled === 1"  @change="(checked) => changeEnableById(checked, records.id, 'isLoginEnabled')"/>
              </template>
              <template slot="isBetEnabled" slot-scope="text, records">
                <a-switch v-permission="20018" checkedChildren="允许" unCheckedChildren="禁止" :checked="records.isBetEnabled === 1"  @change="(checked) => changeEnableById(checked, records.id, 'isBetEnabled')"/>
              </template>
              <template slot="isChatEnabled" slot-scope="text, records">
                <a-switch v-permission="20019" checkedChildren="允许" unCheckedChildren="禁止" :checked="records.isChatEnabled === 1"   @change="(checked) => changeEnableById(checked, records.id, 'isChatEnabled')"/>
              </template>
            </a-table>
        </div>
    </div>
</template>

<script>
import Vue from "vue"
import { Component, Lifecycle } from 'vue-decorators'
import { getUserDeviceRestrictionInfo, editUserDeviceRestrictionById } from '@api/member'

@Component
export default class MemberMobileLimit extends Vue {
  table = {
    columns: [
      { title: "ID", dataIndex: "id" },
      { title: "序列号", dataIndex: "deviceCode" },
      { title: "广告ID", dataIndex: "auxiliaryCode" },
      { title: "设备", dataIndex: "osVersion" },
      { title: "登录", dataIndex: "isLoginEnabled", scopedSlots: {customRender: 'isLoginEnabled'} },
      { title: "投注", dataIndex: "isBetEnabled", scopedSlots: {customRender: 'isBetEnabled'} },
      { title: "聊天", dataIndex: "isChatEnabled", scopedSlots: {customRender: 'isChatEnabled'} }
    ],
    dataSource: [],
    pagination: { total: 1, current: 1}    
  }

  form = {
    deviceCode: '',
    auxiliaryCode: '',
    osVersion: '',
    isBetEnabled: '',
    isChatEnabled: '',
    isLoginEnabled: '',
    pageNo: 1,
    pageSize: 10
  };

  @Lifecycle mounted() {
    this.getDeviceLockList();
  }

  changePagination(pagination) {
    this.table.pagination.current = pagination.current;
    this.form.pageNo = pagination.current;
    this.getDeviceLockList();
  }

  changeSelect(value) {
    const arr = ['isBetEnabled', 'isChatEnabled', 'isLoginEnabled'];
    
    arr.forEach(item => {
      if (item === value) {
        this.form[value] = 0
      } else {
        this.form[item] = ''
      }
    });
  }

  /**
   * @param {checked} 是否是启用状态
   * @param {id}      当前点击的id
   * @param {type}    要更改的类型，如： 启用聊天， 启用登陆等
   */
  async changeEnableById(checked, id, type) {
    this.table.dataSource.forEach(item => {
      if (item.id === id) {
         item[type] = checked ? 1 : 0;
      }
    });
    const { data: res } = await editUserDeviceRestrictionById({
      id, 
      [type]: checked ? 1 : 0 
    });
    if (res?.body?.code === 1) {
      this.getDeviceLockList();
    }
  }

  resetPagination() {
    this.table.pagination.current = 1
    this.form.pageNo = 1
  }

  async getDeviceLockList(refresh) {
    if (refresh) this.resetPagination();
    
    const { data: res } = await getUserDeviceRestrictionInfo(this.form);
    
    if (res?.body?.code === 1 && res?.body?.data?.records) {
      this.table.dataSource = res.body.data.records;
      this.table.pagination.total = res?.body?.data?.totalCount;
    }
  }
}

</script>
